#!/usr/bin/env node

/**
 * Backup Service for Piper Newsletter System
 * Comprehensive backup and disaster recovery service
 */

const fs = require('fs').promises;
const path = require('path');
const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const crypto = require('crypto');
const AWS = require('aws-sdk');
const yaml = require('js-yaml');
const winston = require('winston');
const nodemailer = require('nodemailer');
const axios = require('axios');

const execAsync = promisify(exec);

class BackupService {
    constructor(configPath = '/app/config/backup-config.yml') {
        this.config = null;
        this.configPath = configPath;
        this.logger = this.setupLogger();
        this.s3Client = null;
        this.emailTransporter = null;
        this.isRunning = false;
    }

    setupLogger() {
        return winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            defaultMeta: { service: 'backup-service' },
            transports: [
                new winston.transports.File({ filename: '/app/logs/backup-error.log', level: 'error' }),
                new winston.transports.File({ filename: '/app/logs/backup-combined.log' }),
                new winston.transports.Console({
                    format: winston.format.simple()
                })
            ]
        });
    }

    async initialize() {
        try {
            this.logger.info('Initializing backup service...');
            
            // Load configuration
            await this.loadConfiguration();
            
            // Initialize cloud storage clients
            await this.initializeCloudStorage();
            
            // Initialize email transporter
            await this.initializeEmailTransporter();
            
            // Create backup directories
            await this.createBackupDirectories();
            
            this.logger.info('Backup service initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize backup service:', error);
            throw error;
        }
    }

    async loadConfiguration() {
        try {
            const configContent = await fs.readFile(this.configPath, 'utf8');
            this.config = yaml.load(configContent);
            this.logger.info('Configuration loaded successfully');
        } catch (error) {
            this.logger.error('Failed to load configuration:', error);
            throw error;
        }
    }

    async initializeCloudStorage() {
        if (this.config.cloud_storage?.aws_s3?.enabled) {
            this.s3Client = new AWS.S3({
                region: this.config.cloud_storage.aws_s3.region,
                accessKeyId: this.config.cloud_storage.aws_s3.access_key_id,
                secretAccessKey: this.config.cloud_storage.aws_s3.secret_access_key
            });
            this.logger.info('AWS S3 client initialized');
        }
    }

    async initializeEmailTransporter() {
        if (this.config.monitoring?.alerting?.email?.enabled) {
            const emailConfig = this.config.monitoring.alerting.email;
            this.emailTransporter = nodemailer.createTransporter({
                host: emailConfig.smtp_server,
                port: emailConfig.smtp_port,
                secure: emailConfig.smtp_port === 465,
                auth: {
                    user: emailConfig.username,
                    pass: emailConfig.password
                }
            });
            this.logger.info('Email transporter initialized');
        }
    }

    async createBackupDirectories() {
        const directories = [
            '/backups/database',
            '/backups/application',
            '/backups/system',
            '/backups/temp'
        ];

        for (const dir of directories) {
            try {
                await fs.mkdir(dir, { recursive: true });
                this.logger.info(`Created backup directory: ${dir}`);
            } catch (error) {
                if (error.code !== 'EEXIST') {
                    this.logger.error(`Failed to create directory ${dir}:`, error);
                    throw error;
                }
            }
        }
    }

    async performBackup(backupType, backupConfig) {
        this.logger.info(`Starting ${backupType} backup...`);
        
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFileName = `${backupType}-${timestamp}.tar.gz`;
            const backupPath = path.join('/backups/temp', backupFileName);
            
            let backupResult;
            
            switch (backupType) {
                case 'mongodb':
                    backupResult = await this.backupMongoDB(backupConfig, backupPath);
                    break;
                case 'redis':
                    backupResult = await this.backupRedis(backupConfig, backupPath);
                    break;
                case 'postgres':
                    backupResult = await this.backupPostgres(backupConfig, backupPath);
                    break;
                case 'uploads':
                case 'logs':
                case 'configuration':
                    backupResult = await this.backupApplicationData(backupConfig, backupPath);
                    break;
                case 'nginx_config':
                case 'ssl_certificates':
                    backupResult = await this.backupSystemData(backupConfig, backupPath);
                    break;
                default:
                    throw new Error(`Unknown backup type: ${backupType}`);
            }
            
            if (backupResult.success) {
                // Encrypt backup if enabled
                if (this.config.backup.encryption_enabled) {
                    await this.encryptBackup(backupPath);
                }
                
                // Upload to cloud storage
                await this.uploadToCloudStorage(backupPath, backupFileName);
                
                // Clean up local backup file
                await fs.unlink(backupPath);
                
                this.logger.info(`${backupType} backup completed successfully`);
                
                // Send success notification
                await this.sendNotification('backup_success', {
                    backupType,
                    fileName: backupFileName,
                    timestamp: new Date().toISOString()
                });
            } else {
                throw new Error(backupResult.error);
            }
            
        } catch (error) {
            this.logger.error(`${backupType} backup failed:`, error);
            
            // Send failure notification
            await this.sendNotification('backup_failure', {
                backupType,
                error: error.message,
                timestamp: new Date().toISOString()
            });
            
            throw error;
        }
    }

    async backupMongoDB(config, backupPath) {
        try {
            const backupDir = path.dirname(backupPath);
            const tempBackupDir = path.join(backupDir, 'mongodb-temp');
            
            await fs.mkdir(tempBackupDir, { recursive: true });
            
            const command = `mongodump --host ${config.host} --port ${config.port} --db ${config.database} --username ${config.username} --password ${config.password} --out ${tempBackupDir}`;
            
            await execAsync(command);
            
            // Compress the backup
            await execAsync(`tar -czf ${backupPath} -C ${tempBackupDir} .`);
            
            // Clean up temp directory
            await fs.rmdir(tempBackupDir, { recursive: true });
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async backupRedis(config, backupPath) {
        try {
            const command = `redis-cli -h ${config.host} -p ${config.port} --rdb ${backupPath}`;
            await execAsync(command);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async backupPostgres(config, backupPath) {
        try {
            const command = `pg_dump -h ${config.host} -p ${config.port} -U ${config.username} -d ${config.database} -f ${backupPath}`;
            
            const env = { ...process.env, PGPASSWORD: config.password };
            await execAsync(command, { env });
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async backupApplicationData(config, backupPath) {
        try {
            const command = `tar -czf ${backupPath} -C ${config.source_path} .`;
            await execAsync(command);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async backupSystemData(config, backupPath) {
        try {
            const command = `tar -czf ${backupPath} -C ${config.source_path} .`;
            await execAsync(command);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async encryptBackup(backupPath) {
        try {
            const key = await fs.readFile(this.config.backup.encryption_key_path);
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipher('aes-256-gcm', key);
            
            const backupData = await fs.readFile(backupPath);
            const encrypted = Buffer.concat([cipher.update(backupData), cipher.final()]);
            const authTag = cipher.getAuthTag();
            
            const encryptedPath = `${backupPath}.encrypted`;
            await fs.writeFile(encryptedPath, Buffer.concat([iv, authTag, encrypted]));
            
            // Replace original with encrypted version
            await fs.unlink(backupPath);
            await fs.rename(encryptedPath, backupPath);
            
            this.logger.info('Backup encrypted successfully');
        } catch (error) {
            this.logger.error('Failed to encrypt backup:', error);
            throw error;
        }
    }

    async uploadToCloudStorage(backupPath, fileName) {
        if (!this.s3Client) return;
        
        try {
            const fileContent = await fs.readFile(backupPath);
            
            const params = {
                Bucket: this.config.cloud_storage.aws_s3.bucket,
                Key: `backups/${fileName}`,
                Body: fileContent,
                ServerSideEncryption: 'AES256',
                StorageClass: this.config.cloud_storage.aws_s3.storage_class
            };
            
            await this.s3Client.upload(params).promise();
            this.logger.info(`Backup uploaded to S3: ${fileName}`);
        } catch (error) {
            this.logger.error('Failed to upload to S3:', error);
            throw error;
        }
    }

    async cleanupOldBackups() {
        try {
            this.logger.info('Starting cleanup of old backups...');
            
            const retentionDays = this.config.backup.retention_days;
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
            
            // Clean up local backups
            await this.cleanupLocalBackups(cutoffDate);
            
            // Clean up S3 backups
            if (this.s3Client) {
                await this.cleanupS3Backups(cutoffDate);
            }
            
            this.logger.info('Cleanup completed successfully');
        } catch (error) {
            this.logger.error('Cleanup failed:', error);
            throw error;
        }
    }

    async cleanupLocalBackups(cutoffDate) {
        const backupDirs = ['/backups/database', '/backups/application', '/backups/system'];
        
        for (const dir of backupDirs) {
            try {
                const files = await fs.readdir(dir);
                
                for (const file of files) {
                    const filePath = path.join(dir, file);
                    const stats = await fs.stat(filePath);
                    
                    if (stats.mtime < cutoffDate) {
                        await fs.unlink(filePath);
                        this.logger.info(`Deleted old backup: ${file}`);
                    }
                }
            } catch (error) {
                this.logger.error(`Failed to cleanup ${dir}:`, error);
            }
        }
    }

    async cleanupS3Backups(cutoffDate) {
        try {
            const params = {
                Bucket: this.config.cloud_storage.aws_s3.bucket,
                Prefix: 'backups/'
            };
            
            const data = await this.s3Client.listObjectsV2(params).promise();
            
            const objectsToDelete = data.Contents.filter(obj => 
                obj.LastModified < cutoffDate
            ).map(obj => ({ Key: obj.Key }));
            
            if (objectsToDelete.length > 0) {
                await this.s3Client.deleteObjects({
                    Bucket: this.config.cloud_storage.aws_s3.bucket,
                    Delete: { Objects: objectsToDelete }
                }).promise();
                
                this.logger.info(`Deleted ${objectsToDelete.length} old backups from S3`);
            }
        } catch (error) {
            this.logger.error('Failed to cleanup S3 backups:', error);
        }
    }

    async sendNotification(type, data) {
        try {
            if (this.config.monitoring?.alerting?.email?.enabled) {
                await this.sendEmailNotification(type, data);
            }
            
            if (this.config.monitoring?.alerting?.slack?.enabled) {
                await this.sendSlackNotification(type, data);
            }
            
            if (this.config.monitoring?.alerting?.webhook?.enabled) {
                await this.sendWebhookNotification(type, data);
            }
        } catch (error) {
            this.logger.error('Failed to send notification:', error);
        }
    }

    async sendEmailNotification(type, data) {
        try {
            const subject = type === 'backup_success' 
                ? `Backup Success: ${data.backupType}` 
                : `Backup Failure: ${data.backupType}`;
            
            const html = `
                <h2>Backup ${type === 'backup_success' ? 'Success' : 'Failure'}</h2>
                <p><strong>Backup Type:</strong> ${data.backupType}</p>
                <p><strong>Timestamp:</strong> ${data.timestamp}</p>
                ${data.error ? `<p><strong>Error:</strong> ${data.error}</p>` : ''}
            `;
            
            await this.emailTransporter.sendMail({
                from: this.config.monitoring.alerting.email.from,
                to: this.config.monitoring.alerting.email.to,
                subject,
                html
            });
            
            this.logger.info('Email notification sent successfully');
        } catch (error) {
            this.logger.error('Failed to send email notification:', error);
        }
    }

    async sendSlackNotification(type, data) {
        try {
            const color = type === 'backup_success' ? 'good' : 'danger';
            const text = type === 'backup_success' 
                ? `✅ Backup Success: ${data.backupType}` 
                : `❌ Backup Failure: ${data.backupType}`;
            
            const payload = {
                channel: this.config.monitoring.alerting.slack.channel,
                username: 'Backup Service',
                attachments: [{
                    color,
                    text,
                    fields: [
                        { title: 'Backup Type', value: data.backupType, short: true },
                        { title: 'Timestamp', value: data.timestamp, short: true },
                        ...(data.error ? [{ title: 'Error', value: data.error, short: false }] : [])
                    ],
                    footer: 'Piper Newsletter Backup Service',
                    ts: Math.floor(Date.now() / 1000)
                }]
            };
            
            await axios.post(this.config.monitoring.alerting.slack.webhook_url, payload);
            this.logger.info('Slack notification sent successfully');
        } catch (error) {
            this.logger.error('Failed to send Slack notification:', error);
        }
    }

    async sendWebhookNotification(type, data) {
        try {
            const payload = {
                type,
                data,
                timestamp: new Date().toISOString()
            };
            
            await axios.post(
                this.config.monitoring.alerting.webhook.url,
                payload,
                { headers: this.config.monitoring.alerting.webhook.headers }
            );
            
            this.logger.info('Webhook notification sent successfully');
        } catch (error) {
            this.logger.error('Failed to send webhook notification:', error);
        }
    }

    async verifyBackup(backupPath) {
        try {
            this.logger.info('Verifying backup integrity...');
            
            // Check if file exists and has content
            const stats = await fs.stat(backupPath);
            if (stats.size === 0) {
                throw new Error('Backup file is empty');
            }
            
            // Verify tar.gz integrity
            await execAsync(`tar -tzf ${backupPath} > /dev/null`);
            
            this.logger.info('Backup verification completed successfully');
            return true;
        } catch (error) {
            this.logger.error('Backup verification failed:', error);
            return false;
        }
    }

    async runScheduledBackups() {
        if (this.isRunning) {
            this.logger.warn('Backup service is already running');
            return;
        }
        
        this.isRunning = true;
        
        try {
            this.logger.info('Starting scheduled backup process...');
            
            // Database backups
            if (this.config.databases?.mongodb?.enabled) {
                await this.performBackup('mongodb', this.config.databases.mongodb);
            }
            
            if (this.config.databases?.redis?.enabled) {
                await this.performBackup('redis', this.config.databases.redis);
            }
            
            if (this.config.databases?.postgres?.enabled) {
                await this.performBackup('postgres', this.config.databases.postgres);
            }
            
            // Application data backups
            for (const [backupType, config] of Object.entries(this.config.application_data || {})) {
                if (config.enabled) {
                    await this.performBackup(backupType, config);
                }
            }
            
            // System data backups
            for (const [backupType, config] of Object.entries(this.config.system_data || {})) {
                if (config.enabled) {
                    await this.performBackup(backupType, config);
                }
            }
            
            // Cleanup old backups
            await this.cleanupOldBackups();
            
            this.logger.info('Scheduled backup process completed successfully');
        } catch (error) {
            this.logger.error('Scheduled backup process failed:', error);
        } finally {
            this.isRunning = false;
        }
    }

    async start() {
        try {
            await this.initialize();
            
            this.logger.info('Backup service started successfully');
            
            // Run scheduled backups based on cron schedule
            const cron = require('node-cron');
            
            // Schedule different backup types based on their individual schedules
            for (const [backupType, config] of Object.entries(this.config.databases || {})) {
                if (config.enabled && config.schedule) {
                    cron.schedule(config.schedule, async () => {
                        await this.performBackup(backupType, config);
                    });
                    this.logger.info(`Scheduled ${backupType} backups: ${config.schedule}`);
                }
            }
            
            for (const [backupType, config] of Object.entries(this.config.application_data || {})) {
                if (config.enabled && config.schedule) {
                    cron.schedule(config.schedule, async () => {
                        await this.performBackup(backupType, config);
                    });
                    this.logger.info(`Scheduled ${backupType} backups: ${config.schedule}`);
                }
            }
            
            for (const [backupType, config] of Object.entries(this.config.system_data || {})) {
                if (config.enabled && config.schedule) {
                    cron.schedule(config.schedule, async () => {
                        await this.performBackup(backupType, config);
                    });
                    this.logger.info(`Scheduled ${backupType} backups: ${config.schedule}`);
                }
            }
            
            // Schedule cleanup task
            if (this.config.backup?.retention_days) {
                cron.schedule('0 0 * * *', async () => {
                    await this.cleanupOldBackups();
                });
                this.logger.info('Scheduled daily cleanup task');
            }
            
        } catch (error) {
            this.logger.error('Failed to start backup service:', error);
            process.exit(1);
        }
    }
}

// CLI interface
if (require.main === module) {
    const backupService = new BackupService();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'start':
            backupService.start();
            break;
        case 'backup':
            const backupType = process.argv[3];
            if (!backupType) {
                console.error('Please specify backup type');
                process.exit(1);
            }
            backupService.runScheduledBackups();
            break;
        case 'cleanup':
            backupService.cleanupOldBackups();
            break;
        case 'verify':
            const backupPath = process.argv[3];
            if (!backupPath) {
                console.error('Please specify backup path');
                process.exit(1);
            }
            backupService.verifyBackup(backupPath);
            break;
        default:
            console.log('Usage: node backup-service.js [start|backup <type>|cleanup|verify <path>]');
            process.exit(1);
    }
}

module.exports = BackupService;