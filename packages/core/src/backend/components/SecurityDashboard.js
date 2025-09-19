import React, { useState, useEffect } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  BarElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const SecurityDashboard = () => {
  const [securityData, setSecurityData] = useState({
    threats: [],
    vulnerabilities: [],
    events: [],
    metrics: {},
    alerts: []
  });
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    fetchSecurityData();
    
    if (isAutoRefresh) {
      const interval = setInterval(fetchSecurityData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [timeRange, refreshInterval, isAutoRefresh]);

  const fetchSecurityData = async () => {
    try {
      const [threatsResponse, vulnerabilitiesResponse, eventsResponse, metricsResponse, alertsResponse] = 
        await Promise.all([
          fetch(`/api/security/threats?timeRange=${timeRange}`),
          fetch(`/api/security/vulnerabilities?timeRange=${timeRange}`),
          fetch(`/api/security/events?timeRange=${timeRange}`),
          fetch(`/api/security/metrics?timeRange=${timeRange}`),
          fetch(`/api/security/alerts?timeRange=${timeRange}`)
        ]);

      const [threats, vulnerabilities, events, metrics, alerts] = await Promise.all([
        threatsResponse.json(),
        vulnerabilitiesResponse.json(),
        eventsResponse.json(),
        metricsResponse.json(),
        alertsResponse.json()
      ]);

      setSecurityData({
        threats: threats.data || [],
        vulnerabilities: vulnerabilities.data || [],
        events: events.data || [],
        metrics: metrics.data || {},
        alerts: alerts.data || []
      });
    } catch (error) {
      console.error('Error fetching security data:', error);
    }
  };

  const handleVulnerabilityScan = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/security/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const results = await response.json();
        setSecurityData(prev => ({
          ...prev,
          vulnerabilities: results.vulnerabilities || []
        }));
      }
    } catch (error) {
      console.error('Error running vulnerability scan:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleThreatResponse = async (threatId, action) => {
    try {
      await fetch(`/api/security/threats/${threatId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      fetchSecurityData();
    } catch (error) {
      console.error('Error responding to threat:', error);
    }
  };

  const getThreatLevelColor = (level) => {
    switch (level) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#fbc02d';
      case 'low': return '#689f38';
      default: return '#0288d1';
    }
  };

  // Chart configurations
  const threatsByTypeData = {
    labels: ['SQL Injection', 'XSS', 'Command Injection', 'Path Traversal', 'SSRF', 'XXE'],
    datasets: [{
      data: [
        securityData.metrics.sqlInjectionThreats || 0,
        securityData.metrics.xssThreats || 0,
        securityData.metrics.commandInjectionThreats || 0,
        securityData.metrics.pathTraversalThreats || 0,
        securityData.metrics.ssrfThreats || 0,
        securityData.metrics.xxeThreats || 0
      ],
      backgroundColor: ['#d32f2f', '#f57c00', '#fbc02d', '#689f38', '#0288d1', '#7b1fa2'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const vulnerabilityTrendData = {
    labels: securityData.vulnerabilities.slice(-7).map(v => new Date(v.discoveredAt).toLocaleDateString()),
    datasets: [{
      label: 'Critical',
      data: securityData.vulnerabilities.slice(-7).map(v => v.severity === 'critical' ? 1 : 0),
      borderColor: '#d32f2f',
      backgroundColor: 'rgba(211, 47, 47, 0.1)',
      tension: 0.4
    }, {
      label: 'High',
      data: securityData.vulnerabilities.slice(-7).map(v => v.severity === 'high' ? 1 : 0),
      borderColor: '#f57c00',
      backgroundColor: 'rgba(245, 124, 0, 0.1)',
      tension: 0.4
    }, {
      label: 'Medium',
      data: securityData.vulnerabilities.slice(-7).map(v => v.severity === 'medium' ? 1 : 0),
      borderColor: '#fbc02d',
      backgroundColor: 'rgba(251, 192, 45, 0.1)',
      tension: 0.4
    }]
  };

  const securityEventsData = {
    labels: securityData.events.slice(-10).map(e => new Date(e.timestamp).toLocaleTimeString()),
    datasets: [{
      label: 'Security Events',
      data: securityData.events.slice(-10).map(e => e.count || 1),
      backgroundColor: 'rgba(2, 136, 209, 0.8)',
      borderColor: '#0288d1',
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Dashboard</h1>
        <p className="text-gray-600">Monitor and respond to security threats in real-time</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Auto Refresh:</label>
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                isAutoRefresh 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-gray-100 text-gray-800 border border-gray-300'
              }`}
            >
              {isAutoRefresh ? 'ON' : 'OFF'}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Refresh Interval:</label>
            <select 
              value={refreshInterval} 
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value={10}>10 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
            </select>
          </div>
          
          <button
            onClick={handleVulnerabilityScan}
            disabled={isScanning}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isScanning 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isScanning ? 'Scanning...' : 'Run Vulnerability Scan'}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Threats</p>
              <p className="text-2xl font-bold text-red-600">
                {securityData.metrics.activeThreats || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vulnerabilities</p>
              <p className="text-2xl font-bold text-orange-600">
                {securityData.metrics.totalVulnerabilities || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-xl">🔍</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Blocked Attacks</p>
              <p className="text-2xl font-bold text-green-600">
                {securityData.metrics.blockedAttacks || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">🛡️</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Security Score</p>
              <p className="text-2xl font-bold text-blue-600">
                {securityData.metrics.securityScore || 85}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Threats by Type */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Threats by Type</h3>
          <div className="h-64">
            <Doughnut 
              data={threatsByTypeData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'right'
                  }
                }
              }}
            />
          </div>
        </div>
        
        {/* Vulnerability Trend */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vulnerability Trend</h3>
          <div className="h-64">
            <Line data={vulnerabilityTrendData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Security Events Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Events</h3>
        <div className="h-64">
          <Bar data={securityEventsData} options={chartOptions} />
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Active Security Alerts</h3>
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {securityData.alerts.length} Active
          </span>
        </div>
        
        {securityData.alerts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No active security alerts</p>
        ) : (
          <div className="space-y-3">
            {securityData.alerts.map((alert, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getThreatLevelColor(alert.severity)}`}></span>
                    <span className="font-medium text-gray-900">{alert.title}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{alert.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleThreatResponse(alert.id, 'acknowledge')}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => handleThreatResponse(alert.id, 'resolve')}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleThreatResponse(alert.id, 'escalate')}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Escalate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Threats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Threats</h3>
        
        {securityData.threats.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent threats detected</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Threat Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source IP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {securityData.threats.slice(0, 10).map((threat, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {threat.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        threat.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        threat.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        threat.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {threat.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {threat.sourceIp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(threat.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        threat.status === 'blocked' ? 'bg-green-100 text-green-800' :
                        threat.status === 'detected' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {threat.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityDashboard;