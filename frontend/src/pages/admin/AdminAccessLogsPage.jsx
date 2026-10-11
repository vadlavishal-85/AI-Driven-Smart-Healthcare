import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Database } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { accessLogService } from '../../services/accessLogService';

const AdminAccessLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const data = await accessLogService.getAccessLogs(100);
        setLogs(Array.isArray(data) ? data : []);
      } catch {
        setError('Failed to load system audit access logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.resource_type && log.resource_type.toLowerCase().includes(term)) ||
      (log.resource_id && log.resource_id.toLowerCase().includes(term))
    );
  });

  return (
    <DashboardLayout
      title="System Audit & Security Access Logs"
      subtitle="Immutable event logs recording clinical data exchange, access events, and system mutations."
    >
      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', maxWidth: '480px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search logs by action, resource type, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Querying PostgreSQL security audit logs..." />
      ) : error ? (
        <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '12px' }}>{error}</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Timestamp</th>
                <th>Action Performed</th>
                <th>Target Resource Type</th>
                <th>Resource Identifier</th>
                <th>Operator User UUID</th>
                <th>Client IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No audit records match the search filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>{' '}
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          backgroundColor:
                            log.action === 'SHARE_RECORD'
                              ? '#e0f2fe'
                              : log.action === 'REVOKE_SHARED_RECORD'
                              ? '#fef2f2'
                              : '#ecfdf5',
                          color:
                            log.action === 'SHARE_RECORD'
                              ? '#0284c7'
                              : log.action === 'REVOKE_SHARED_RECORD'
                              ? '#b91c1c'
                              : '#059669',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontSize: '12.5px', color: '#475569' }}>{log.resource_type}</code>
                    </td>
                    <td>
                      <code style={{ fontSize: '12px', color: '#0284c7' }}>{log.resource_id || '--'}</code>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{log.user_id ? String(log.user_id).slice(0, 13) + '...' : 'System'}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{log.ip_address || '127.0.0.1'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminAccessLogsPage;
