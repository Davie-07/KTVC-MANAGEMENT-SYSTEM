import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface SystemStatus {
  database: 'online' | 'offline' | 'warning';
  lastBackup: string;
  backupSize: string;
  diskUsage: number;
  memoryUsage: number;
  uptime: string;
}

interface SystemSettings {
  emailEnabled: boolean;
  jwtExpiry: number;
  maxFileSize: number;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

const SystemManagement: React.FC = () => {
  const { token } = useAuth();
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      // Fetch system status
      const statusResponse = await fetch('http://localhost:5000/api/system/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statusData = await statusResponse.json();
      setSystemStatus(statusData);

      // Fetch system settings
      const settingsResponse = await fetch('http://localhost:5000/api/system/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const settingsData = await settingsResponse.json();
      setSystemSettings(settingsData);
    } catch (error) {
      console.error('Error fetching system data:', error);
      // Mock data for demonstration
      setSystemStatus({
        database: 'online',
        lastBackup: new Date().toISOString(),
        backupSize: '2.5 GB',
        diskUsage: 65,
        memoryUsage: 45,
        uptime: '5 days, 12 hours'
      });
      setSystemSettings({
        emailEnabled: true,
        jwtExpiry: 7,
        maxFileSize: 10,
        autoBackup: true,
        backupFrequency: 'daily'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!systemSettings) return;
    
    setSaving(true);
    try {
      await fetch('http://localhost:5000/api/system/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(systemSettings)
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const triggerBackup = async () => {
    try {
      await fetch('http://localhost:5000/api/system/backup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Backup initiated successfully!');
      fetchSystemData(); // Refresh data
    } catch (error) {
      console.error('Error triggering backup:', error);
      alert('Failed to trigger backup');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'offline': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return '#10b981';
    if (percentage < 80) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>Loading system data...</div>;
  }

  return (
    <div style={{ color: '#fff' }}>
      <h2 style={{ marginBottom: '2rem', fontSize: '1.8rem' }}>⚙️ System Management</h2>

      {/* System Status */}
      <div style={{
        background: '#23232b',
        borderRadius: 12,
        padding: '1.5rem',
        marginBottom: '2rem',
        border: '1px solid #374151'
      }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>📊 System Status</h3>
        
        {systemStatus && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#374151', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span>Database:</span>
                <span style={{ 
                  color: getStatusColor(systemStatus.database),
                  fontWeight: 'bold'
                }}>
                  {systemStatus.database.toUpperCase()}
                </span>
              </div>
            </div>

            <div style={{ background: '#374151', padding: '1rem', borderRadius: '8px' }}>
              <div>Last Backup: {new Date(systemStatus.lastBackup).toLocaleString()}</div>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Size: {systemStatus.backupSize}
              </div>
            </div>

            <div style={{ background: '#374151', padding: '1rem', borderRadius: '8px' }}>
              <div>Disk Usage: {systemStatus.diskUsage}%</div>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#4b5563',
                borderRadius: '4px',
                marginTop: '0.5rem'
              }}>
                <div style={{
                  width: `${systemStatus.diskUsage}%`,
                  height: '100%',
                  background: getUsageColor(systemStatus.diskUsage),
                  borderRadius: '4px'
                }} />
              </div>
            </div>

            <div style={{ background: '#374151', padding: '1rem', borderRadius: '8px' }}>
              <div>Memory Usage: {systemStatus.memoryUsage}%</div>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#4b5563',
                borderRadius: '4px',
                marginTop: '0.5rem'
              }}>
                <div style={{
                  width: `${systemStatus.memoryUsage}%`,
                  height: '100%',
                  background: getUsageColor(systemStatus.memoryUsage),
                  borderRadius: '4px'
                }} />
              </div>
            </div>

            <div style={{ background: '#374151', padding: '1rem', borderRadius: '8px' }}>
              <div>Uptime: {systemStatus.uptime}</div>
            </div>
          </div>
        )}

        <button
          onClick={triggerBackup}
          style={{
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            marginTop: '1rem',
            fontSize: '0.875rem'
          }}
        >
          🔄 Trigger Manual Backup
        </button>
      </div>

      {/* System Settings */}
      <div style={{
        background: '#23232b',
        borderRadius: 12,
        padding: '1.5rem',
        border: '1px solid #374151'
      }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>🔧 System Settings</h3>
        
        {systemSettings && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={systemSettings.emailEnabled}
                  onChange={(e) => setSystemSettings(prev => prev ? { ...prev, emailEnabled: e.target.checked } : null)}
                  style={{ marginRight: '0.5rem' }}
                />
                Enable Email Notifications
              </label>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                JWT Token Expiry (days):
                <input
                  type="number"
                  value={systemSettings.jwtExpiry}
                  onChange={(e) => setSystemSettings(prev => prev ? { ...prev, jwtExpiry: parseInt(e.target.value) } : null)}
                  style={{
                    background: '#374151',
                    color: '#fff',
                    border: '1px solid #4b5563',
                    borderRadius: '4px',
                    padding: '0.25rem',
                    marginLeft: '0.5rem',
                    width: '80px'
                  }}
                />
              </label>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Max File Size (MB):
                <input
                  type="number"
                  value={systemSettings.maxFileSize}
                  onChange={(e) => setSystemSettings(prev => prev ? { ...prev, maxFileSize: parseInt(e.target.value) } : null)}
                  style={{
                    background: '#374151',
                    color: '#fff',
                    border: '1px solid #4b5563',
                    borderRadius: '4px',
                    padding: '0.25rem',
                    marginLeft: '0.5rem',
                    width: '80px'
                  }}
                />
              </label>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={systemSettings.autoBackup}
                  onChange={(e) => setSystemSettings(prev => prev ? { ...prev, autoBackup: e.target.checked } : null)}
                  style={{ marginRight: '0.5rem' }}
                />
                Enable Auto Backup
              </label>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Backup Frequency:
                <select
                  value={systemSettings.backupFrequency}
                  onChange={(e) => setSystemSettings(prev => prev ? { ...prev, backupFrequency: e.target.value as any } : null)}
                  style={{
                    background: '#374151',
                    color: '#fff',
                    border: '1px solid #4b5563',
                    borderRadius: '4px',
                    padding: '0.25rem',
                    marginLeft: '0.5rem'
                  }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>
            </div>
          </div>
        )}

        <button
          onClick={saveSettings}
          disabled={saving}
          style={{
            background: saving ? '#6b7280' : '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            cursor: saving ? 'not-allowed' : 'pointer',
            marginTop: '1rem',
            fontSize: '0.875rem'
          }}
        >
          {saving ? '⏳ Saving...' : '💾 Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SystemManagement; 