/**
 * Meeting Scheduling Service
 * Comprehensive scheduling system with calendar integration and availability management
 * Similar to Calendly but built internally for the ecosystem
 */

import { QuantumSecurityProvider } from '../security/QuantumSecurityManager';
import PrivacyTracker from '../privacy/PrivacyTracker';
import AuthenticationService from './AuthenticationService';

class MeetingSchedulingService {
    constructor() {
        this.security = new QuantumSecurityManager();
        this.privacy = new PrivacyTracker();
        this.auth = new AuthenticationService();
        this.meetings = new Map();
        this.availabilitySlots = new Map();
        this.calendarIntegrations = new Map();
        this.meetingTypes = new Map();
        this.notifications = new NotificationManager();
        this.initializeMeetingTypes();
    }

    /**
     * Initialize default meeting types
     */
    initializeMeetingTypes() {
        const defaultTypes = [
            {
                id: 'quick_call',
                name: '15-minute Quick Call',
                duration: 15,
                description: 'Brief discussion or check-in',
                features: ['voice', 'chat'],
                maxParticipants: 2
            },
            {
                id: 'standard_meeting',
                name: '30-minute Meeting',
                duration: 30,
                description: 'Standard business meeting',
                features: ['voice', 'video', 'chat', 'screen_share'],
                maxParticipants: 10
            },
            {
                id: 'extended_session',
                name: '60-minute Session',
                duration: 60,
                description: 'Extended discussion or workshop',
                features: ['voice', 'video', 'chat', 'screen_share', 'recording'],
                maxParticipants: 25
            },
            {
                id: 'group_conference',
                name: 'Group Conference',
                duration: 90,
                description: 'Large group conference or presentation',
                features: ['voice', 'video', 'chat', 'screen_share', 'recording', 'breakout_rooms'],
                maxParticipants: 100
            }
        ];
        
        defaultTypes.forEach(type => {
            this.meetingTypes.set(type.id, type);
        });
    }

    /**
     * Create a new meeting
     */
    async createMeeting(hostId, meetingData) {
        try {
            const meetingId = this.security.generateSecureId();
            const meeting = {
                id: meetingId,
                hostId,
                title: meetingData.title,
                description: meetingData.description,
                type: meetingData.type || 'standard_meeting',
                scheduledTime: meetingData.scheduledTime,
                duration: meetingData.duration || this.meetingTypes.get(meetingData.type)?.duration || 30,
                timezone: meetingData.timezone || 'UTC',
                participants: meetingData.participants || [],
                settings: {
                    requireAuth: meetingData.requireAuth !== false,
                    allowAnonymous: meetingData.allowAnonymous === true,
                    recordingEnabled: meetingData.recordingEnabled === true,
                    chatEnabled: meetingData.chatEnabled !== false,
                    screenShareEnabled: meetingData.screenShareEnabled !== false,
                    waitingRoom: meetingData.waitingRoom === true
                },
                status: 'scheduled',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                joinUrl: this.generateJoinUrl(meetingId),
                hostUrl: this.generateHostUrl(meetingId)
            };
            
            this.meetings.set(meetingId, meeting);
            
            // Send calendar invitations
            await this.sendCalendarInvitations(meeting);
            
            // Track meeting creation
            this.privacy.trackEvent('meeting_created', {
                meetingId,
                hostId,
                type: meeting.type,
                participantCount: meeting.participants.length
            });
            
            return meeting;
        } catch (error) {
            throw new Error(`Failed to create meeting: ${error.message}`);
        }
    }

    /**
     * Schedule a meeting based on availability
     */
    async scheduleMeeting(hostId, guestEmail, preferences) {
        try {
            const availableSlots = await this.getAvailableSlots(hostId, preferences);
            
            if (availableSlots.length === 0) {
                throw new Error('No available time slots found');
            }
            
            const selectedSlot = preferences.preferredTime 
                ? availableSlots.find(slot => slot.startTime === preferences.preferredTime)
                : availableSlots[0];
            
            if (!selectedSlot) {
                throw new Error('Preferred time slot not available');
            }
            
            const meeting = await this.createMeeting(hostId, {
                title: preferences.title || 'Scheduled Meeting',
                description: preferences.description,
                type: preferences.meetingType || 'standard_meeting',
                scheduledTime: selectedSlot.startTime,
                duration: preferences.duration || selectedSlot.duration,
                timezone: preferences.timezone,
                participants: [{ email: guestEmail, role: 'attendee' }],
                requireAuth: preferences.requireAuth,
                allowAnonymous: preferences.allowAnonymous
            });
            
            // Send confirmation emails
            await this.sendMeetingConfirmation(meeting, guestEmail);
            
            return meeting;
        } catch (error) {
            throw new Error(`Failed to schedule meeting: ${error.message}`);
        }
    }

    /**
     * Get available time slots for a host
     */
    async getAvailableSlots(hostId, preferences = {}) {
        const {
            startDate = new Date(),
            endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            duration = 30,
            timezone = 'UTC'
        } = preferences;
        
        const hostAvailability = await this.getHostAvailability(hostId);
        const existingMeetings = await this.getHostMeetings(hostId, startDate, endDate);
        
        const availableSlots = [];
        const current = new Date(startDate);
        
        while (current <= endDate) {
            const dayOfWeek = current.getDay();
            const dayAvailability = hostAvailability.weeklySchedule[dayOfWeek];
            
            if (dayAvailability && dayAvailability.available) {
                const daySlots = this.generateDaySlots(
                    current,
                    dayAvailability.startTime,
                    dayAvailability.endTime,
                    duration
                );
                
                // Filter out conflicting meetings
                const freeSlots = daySlots.filter(slot => 
                    !this.hasConflict(slot, existingMeetings)
                );
                
                availableSlots.push(...freeSlots);
            }
            
            current.setDate(current.getDate() + 1);
        }
        
        return availableSlots;
    }

    /**
     * Generate time slots for a specific day
     */
    generateDaySlots(date, startTime, endTime, duration) {
        const slots = [];
        const start = new Date(date);
        const [startHour, startMinute] = startTime.split(':').map(Number);
        start.setHours(startHour, startMinute, 0, 0);
        
        const end = new Date(date);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        end.setHours(endHour, endMinute, 0, 0);
        
        const current = new Date(start);
        
        while (current.getTime() + (duration * 60 * 1000) <= end.getTime()) {
            const slotEnd = new Date(current.getTime() + (duration * 60 * 1000));
            
            slots.push({
                startTime: new Date(current).toISOString(),
                endTime: slotEnd.toISOString(),
                duration
            });
            
            current.setMinutes(current.getMinutes() + duration);
        }
        
        return slots;
    }

    /**
     * Check if a time slot conflicts with existing meetings
     */
    hasConflict(slot, existingMeetings) {
        const slotStart = new Date(slot.startTime);
        const slotEnd = new Date(slot.endTime);
        
        return existingMeetings.some(meeting => {
            const meetingStart = new Date(meeting.scheduledTime);
            const meetingEnd = new Date(meetingStart.getTime() + (meeting.duration * 60 * 1000));
            
            return (slotStart < meetingEnd && slotEnd > meetingStart);
        });
    }

    /**
     * Set host availability
     */
    async setHostAvailability(hostId, availability) {
        const availabilityData = {
            hostId,
            timezone: availability.timezone || 'UTC',
            weeklySchedule: availability.weeklySchedule || this.getDefaultSchedule(),
            exceptions: availability.exceptions || [], // Specific date overrides
            bufferTime: availability.bufferTime || 0, // Minutes between meetings
            updatedAt: new Date().toISOString()
        };
        
        this.availabilitySlots.set(hostId, availabilityData);
        
        this.privacy.trackEvent('availability_updated', { hostId });
        
        return availabilityData;
    }

    /**
     * Get default weekly schedule
     */
    getDefaultSchedule() {
        return {
            0: { available: false }, // Sunday
            1: { available: true, startTime: '09:00', endTime: '17:00' }, // Monday
            2: { available: true, startTime: '09:00', endTime: '17:00' }, // Tuesday
            3: { available: true, startTime: '09:00', endTime: '17:00' }, // Wednesday
            4: { available: true, startTime: '09:00', endTime: '17:00' }, // Thursday
            5: { available: true, startTime: '09:00', endTime: '17:00' }, // Friday
            6: { available: false } // Saturday
        };
    }

    /**
     * Get host availability
     */
    async getHostAvailability(hostId) {
        return this.availabilitySlots.get(hostId) || {
            hostId,
            timezone: 'UTC',
            weeklySchedule: this.getDefaultSchedule(),
            exceptions: [],
            bufferTime: 0
        };
    }

    /**
     * Get host meetings in date range
     */
    async getHostMeetings(hostId, startDate, endDate) {
        const meetings = Array.from(this.meetings.values())
            .filter(meeting => {
                const meetingDate = new Date(meeting.scheduledTime);
                return meeting.hostId === hostId &&
                       meetingDate >= startDate &&
                       meetingDate <= endDate &&
                       meeting.status !== 'cancelled';
            });
        
        return meetings;
    }

    /**
     * Join a meeting
     */
    async joinMeeting(meetingId, userId, joinData = {}) {
        const meeting = this.meetings.get(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }
        
        if (meeting.status === 'cancelled') {
            throw new Error('Meeting has been cancelled');
        }
        
        // Check if meeting requires authentication
        if (meeting.settings.requireAuth && !userId) {
            throw new Error('Authentication required to join this meeting');
        }
        
        // Check if user is authorized to join
        const isHost = meeting.hostId === userId;
        const isInvited = meeting.participants.some(p => p.userId === userId || p.email === joinData.email);
        const canJoinAnonymously = meeting.settings.allowAnonymous;
        
        if (!isHost && !isInvited && !canJoinAnonymously) {
            throw new Error('Not authorized to join this meeting');
        }
        
        // Generate join token
        const joinToken = await this.security.generateJWT({
            meetingId,
            userId: userId || 'anonymous',
            role: isHost ? 'host' : 'participant',
            joinedAt: new Date().toISOString()
        });
        
        this.privacy.trackEvent('meeting_joined', {
            meetingId,
            userId: userId || 'anonymous',
            role: isHost ? 'host' : 'participant'
        });
        
        return {
            meeting,
            joinToken,
            role: isHost ? 'host' : 'participant',
            permissions: this.getMeetingPermissions(meeting, isHost)
        };
    }

    /**
     * Get meeting permissions for user
     */
    getMeetingPermissions(meeting, isHost) {
        const basePermissions = {
            canSpeak: true,
            canChat: meeting.settings.chatEnabled,
            canViewParticipants: true
        };
        
        if (isHost) {
            return {
                ...basePermissions,
                canMute: true,
                canKick: true,
                canRecord: meeting.settings.recordingEnabled,
                canShareScreen: meeting.settings.screenShareEnabled,
                canEndMeeting: true,
                canManageWaitingRoom: meeting.settings.waitingRoom
            };
        }
        
        return {
            ...basePermissions,
            canShareScreen: meeting.settings.screenShareEnabled
        };
    }

    /**
     * Cancel a meeting
     */
    async cancelMeeting(meetingId, userId, reason = '') {
        const meeting = this.meetings.get(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }
        
        if (meeting.hostId !== userId) {
            throw new Error('Only the host can cancel the meeting');
        }
        
        meeting.status = 'cancelled';
        meeting.cancellationReason = reason;
        meeting.cancelledAt = new Date().toISOString();
        
        // Notify participants
        await this.notifyMeetingCancellation(meeting);
        
        this.privacy.trackEvent('meeting_cancelled', {
            meetingId,
            hostId: userId,
            reason
        });
        
        return meeting;
    }

    /**
     * Reschedule a meeting
     */
    async rescheduleMeeting(meetingId, userId, newTime, newDuration) {
        const meeting = this.meetings.get(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }
        
        if (meeting.hostId !== userId) {
            throw new Error('Only the host can reschedule the meeting');
        }
        
        const oldTime = meeting.scheduledTime;
        meeting.scheduledTime = newTime;
        if (newDuration) {
            meeting.duration = newDuration;
        }
        meeting.updatedAt = new Date().toISOString();
        
        // Send updated calendar invitations
        await this.sendCalendarInvitations(meeting, true);
        
        // Notify participants
        await this.notifyMeetingRescheduled(meeting, oldTime);
        
        this.privacy.trackEvent('meeting_rescheduled', {
            meetingId,
            hostId: userId,
            oldTime,
            newTime
        });
        
        return meeting;
    }

    // URL generation methods
    generateJoinUrl(meetingId) {
        return `${window.location.origin}/meeting/join/${meetingId}`;
    }
    
    generateHostUrl(meetingId) {
        return `${window.location.origin}/meeting/host/${meetingId}`;
    }

    // Calendar integration methods
    async sendCalendarInvitations(meeting, isUpdate = false) {
        // Implementation for sending calendar invitations
        // Would integrate with Google Calendar, Outlook, etc.
        console.log(`Sending calendar ${isUpdate ? 'update' : 'invitation'} for meeting ${meeting.id}`);
    }

    async sendMeetingConfirmation(meeting, guestEmail) {
        // Implementation for sending confirmation emails
        console.log(`Sending confirmation email for meeting ${meeting.id} to ${guestEmail}`);
    }

    async notifyMeetingCancellation(meeting) {
        // Implementation for notifying participants of cancellation
        console.log(`Notifying participants of meeting ${meeting.id} cancellation`);
    }

    async notifyMeetingRescheduled(meeting, oldTime) {
        // Implementation for notifying participants of reschedule
        console.log(`Notifying participants of meeting ${meeting.id} reschedule`);
    }
}

/**
 * Notification Manager for meeting-related notifications
 */
class NotificationManager {
    constructor() {
        this.notifications = new Map();
    }

    async sendNotification(userId, type, data) {
        const notification = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            type,
            data,
            createdAt: new Date().toISOString(),
            read: false
        };
        
        this.notifications.set(notification.id, notification);
        
        // Implementation would send via email, SMS, push notification, etc.
        console.log(`Sending ${type} notification to user ${userId}`);
        
        return notification;
    }

    async getNotifications(userId) {
        return Array.from(this.notifications.values())
            .filter(notification => notification.userId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    async markAsRead(notificationId) {
        const notification = this.notifications.get(notificationId);
        if (notification) {
            notification.read = true;
        }
    }
}

export default MeetingSchedulingService;
export { NotificationManager };