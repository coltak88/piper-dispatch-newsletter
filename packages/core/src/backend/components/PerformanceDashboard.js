import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from './ui/card';
import { 
    Tabs, 
    TabsContent, 
    TabsList, 
    TabsTrigger 
} from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
    Activity, 
    Database, 
    Server, 
    TrendingUp, 
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Clock,
    Zap,
    HardDrive
} from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const PerformanceDashboard = () => {
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(30);

    // Fetch performance data
    const fetchPerformanceData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/analytics/performance?range=${selectedTimeRange}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch performance data');
            }

            const data = await response.json();
            setPerformanceData(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching performance data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch real-time data
    const fetchRealtimeData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/analytics/realtime', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch real-time data');
            }

            const data = await response.json();
            setPerformanceData(prev => ({
                ...prev,
                ...data
            }));
        } catch (err) {
            console.error('Error fetching real-time data:', err);
        }
    };

    useEffect(() => {
        fetchPerformanceData();
        
        let interval;
        if (autoRefresh) {
            interval = setInterval(() => {
                fetchRealtimeData();
            }, refreshInterval * 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [selectedTimeRange, autoRefresh, refreshInterval]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    Error loading performance data: {error}
                </AlertDescription>
            </Alert>
        );
    }

    if (!performanceData) {
        return (
            <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    No performance data available
                </AlertDescription>
            </Alert>
        );
    }

    const { performance, cache, database, trends } = performanceData;

    // Response time chart data
    const responseTimeChartData = {
        labels: performance?.responseTimes?.map(item => 
            new Date(item.timestamp).toLocaleTimeString()
        ) || [],
        datasets: [{
            label: 'Response Time (ms)',
            data: performance?.responseTimes?.map(item => item.value) || [],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    // Cache hit rate chart data
    const cacheHitRateData = {
        labels: ['Cache Hits', 'Cache Misses'],
        datasets: [{
            data: [
                cache?.hitRate || 0,
                100 - (cache?.hitRate || 0)
            ],
            backgroundColor: [
                'rgba(34, 197, 94, 0.8)',
                'rgba(239, 68, 68, 0.8)'
            ],
            borderWidth: 0
        }]
    };

    // Database query performance data
    const queryPerformanceData = {
        labels: database?.queryStats?.map(item => item.queryType) || [],
        datasets: [{
            label: 'Average Execution Time (ms)',
            data: database?.queryStats?.map(item => item.avgTime) || [],
            backgroundColor: 'rgba(147, 51, 234, 0.8)',
            borderColor: 'rgb(147, 51, 234)',
            borderWidth: 1
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Time'
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Value'
                }
            }
        }
    };

    const getPerformanceStatus = (value, threshold) => {
        if (value < threshold * 0.5) return 'good';
        if (value < threshold) return 'warning';
        return 'critical';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'good':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'critical':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Performance Dashboard</h1>
                    <p className="text-muted-foreground">
                        Monitor system performance, cache efficiency, and database optimization
                    </p>
                </div>
                
                <div className="flex items-center space-x-4">
                    <select
                        value={selectedTimeRange}
                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="1h">Last Hour</option>
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                    </select>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                        {autoRefresh ? 'Pause' : 'Resume'} Auto-refresh
                    </Button>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchPerformanceData}
                    >
                        Refresh Now
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Avg Response Time
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {performance?.avgResponseTime || 0}ms
                        </div>
                        <div className="flex items-center space-x-2">
                            {getStatusIcon(getPerformanceStatus(performance?.avgResponseTime || 0, 500))}
                            <p className="text-xs text-muted-foreground">
                                {performance?.responseTimeChange > 0 ? '+' : ''}
                                {performance?.responseTimeChange || 0}% from last period
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Cache Hit Rate
                        </CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {cache?.hitRate || 0}%
                        </div>
                        <div className="flex items-center space-x-2">
                            {getStatusIcon(getPerformanceStatus(100 - (cache?.hitRate || 0), 20))}
                            <p className="text-xs text-muted-foreground">
                                {cache?.hitRateChange > 0 ? '+' : ''}
                                {cache?.hitRateChange || 0}% from last period
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Database Queries/sec
                        </CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {database?.queriesPerSecond || 0}
                        </div>
                        <div className="flex items-center space-x-2">
                            {getStatusIcon(getPerformanceStatus(database?.queriesPerSecond || 0, 100))}
                            <p className="text-xs text-muted-foreground">
                                {database?.queryRateChange > 0 ? '+' : ''}
                                {database?.queryRateChange || 0}% from last period
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Memory Usage
                        </CardTitle>
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {performance?.memoryUsage || 0}MB
                        </div>
                        <div className="flex items-center space-x-2">
                            {getStatusIcon(getPerformanceStatus(performance?.memoryUsage || 0, 1024))}
                            <p className="text-xs text-muted-foreground">
                                {performance?.memoryChange > 0 ? '+' : ''}
                                {performance?.memoryChange || 0}% from last period
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Charts */}
            <Tabs defaultValue="response-time" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="response-time">Response Times</TabsTrigger>
                    <TabsTrigger value="cache">Cache Performance</TabsTrigger>
                    <TabsTrigger value="database">Database Queries</TabsTrigger>
                    <TabsTrigger value="trends">Performance Trends</TabsTrigger>
                </TabsList>

                <TabsContent value="response-time" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>API Response Times</CardTitle>
                            <CardDescription>
                                Monitor response times for different API endpoints
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <Line data={responseTimeChartData} options={chartOptions} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cache" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cache Hit Rate</CardTitle>
                                <CardDescription>
                                    Distribution of cache hits vs misses
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px]">
                                    <Doughnut 
                                        data={cacheHitRateData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'bottom'
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Cache Statistics</CardTitle>
                                <CardDescription>
                                    Detailed cache performance metrics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Total Requests</span>
                                        <span className="text-sm text-muted-foreground">
                                            {cache?.totalRequests || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Cache Hits</span>
                                        <span className="text-sm text-muted-foreground">
                                            {cache?.hits || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Cache Misses</span>
                                        <span className="text-sm text-muted-foreground">
                                            {cache?.misses || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Evictions</span>
                                        <span className="text-sm text-muted-foreground">
                                            {cache?.evictions || 0}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="database" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Database Query Performance</CardTitle>
                            <CardDescription>
                                Average execution time by query type
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <Bar 
                                    data={queryPerformanceData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: false
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                title: {
                                                    display: true,
                                                    text: 'Execution Time (ms)'
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Database Health</CardTitle>
                            <CardDescription>
                                Current database performance indicators
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {database?.connectionPool?.active || 0}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Active Connections</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {database?.slowQueries || 0}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Slow Queries</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {database?.indexUsage || 0}%
                                    </div>
                                    <p className="text-sm text-muted-foreground">Index Usage</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="trends" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Trends</CardTitle>
                            <CardDescription>
                                Historical performance data over time
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                {trends && trends.length > 0 && (
                                    <Line 
                                        data={{
                                            labels: trends.map(item => 
                                                new Date(item.timestamp).toLocaleDateString()
                                            ),
                                            datasets: [
                                                {
                                                    label: 'Response Time (ms)',
                                                    data: trends.map(item => item.responseTime),
                                                    borderColor: 'rgb(59, 130, 246)',
                                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                    fill: true,
                                                    tension: 0.4
                                                },
                                                {
                                                    label: 'Error Rate (%)',
                                                    data: trends.map(item => item.errorRate),
                                                    borderColor: 'rgb(239, 68, 68)',
                                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                    fill: true,
                                                    tension: 0.4
                                                }
                                            ]
                                        }}
                                        options={chartOptions}
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Auto-refresh controls */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        <span className="text-sm">Auto-refresh</span>
                    </label>
                    
                    {autoRefresh && (
                        <select
                            value={refreshInterval}
                            onChange={(e) => setRefreshInterval(Number(e.target.value))}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                            <option value={10}>10 seconds</option>
                            <option value={30}>30 seconds</option>
                            <option value={60}>1 minute</option>
                            <option value={300}>5 minutes</option>
                        </select>
                    )}
                </div>
                
                <div className="text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
};

export default PerformanceDashboard;