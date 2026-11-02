import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Database, User, AlertCircle, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { accessLogService } from '../../services/accessLogService';

const AdminAccessLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await accessLogService.getAccessLogs(200);
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      const errDetail = err.response?.data?.detail || err.message || 'Server error connecting to PostgreSQL.';
      setError(`Failed to load system audit access logs: ${errDetail}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.resource_type && log.resource_type.toLowerCase().includes(term)) ||
      (log.resource_id && log.resource_id.toLowerCase().includes(term)) ||
      (log.user_name && log.user_name.toLowerCase().includes(term)) ||
      (log.user_email && log.user_email.toLowerCase().includes(term)) ||
      (log.user_role && log.user_role.toLowerCase().includes(term)) ||
      (log.ip_address && log.ip_address.toLowerCase().includes(term))
    );
  });

  const getActionBadgeStyle = (action) => {
    const act = (action || '').toUpperCase();
    if (act.includes('REVOKE') || act.includes('DELETE') || act.includes('DEACTIVATE')) {
      return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
    }
    if (act.includes('SHARE') || act.includes('CREATE') || act.includes('INSERT')) {
      return { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
    }
    if (act.includes('VIEW') || act.includes('GET') || act.includes('READ')) {
      return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
    }
    return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
  };

  return (
    <DashboardLayout
      title="System Audit & Security Access Logs"
      subtitle="Immutable event logs recording clinical data exchange, access events, and administrative actions in PostgreSQL."
      actions={
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Refresh Logs</span>
        </button>
      }
    >
      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', maxWidth: '520px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by actor name, email, action, resource, or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '13px' }}
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Querying PostgreSQL security audit logs..." />
      ) : error ? (
        <div style={{ padding: '20px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={22} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{error}</span>
          </div>
          <button
            onClick={fetchLogs}
            className="btn btn-primary"
            style={{ padding: '6px 16px', fontSize: '13px' }}
          >
            Retry Query
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Timestamp</th>
                <th>Action Performed</th>
                <th>Target Resource</th>
                <th>Resource ID</th>
                <th>Actor / User</th>
                <th>Client IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                    <ShieldCheck size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#334155' }}>
                      {searchTerm ? 'No audit records match your search filter' : 'No system audit logs found in PostgreSQL'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                      {searchTerm ? 'Try adjusting your search criteria.' : 'Audit events will automatically appear here as operations occur.'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const badge = getActionBadgeStyle(log.action);
                  const actorDisplay = log.user_name || (log.user_id ? `User ${String(log.user_id).slice(0, 8)}` : 'System Engine');
                  return (
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
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            backgroundColor: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <code style={{ fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>{log.resource_type}</code>
                      </td>
                      <td>
                        <code style={{ fontSize: '12px', color: '#0284c7' }}>{log.resource_id || '--'}</code>
                      </td>
                      <td>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ fontSize: '13px', color: '#0f172a' }}>{actorDisplay}</strong>
                            {log.user_role && (
                              <span style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor: log.user_role === 'ADMIN' ? '#f3e8ff' : log.user_role === 'DOCTOR' ? '#e0f2fe' : '#ccfbf1',
                                color: log.user_role === 'ADMIN' ? '#7e22ce' : log.user_role === 'DOCTOR' ? '#0284c7' : '#0f766e',
                              }}>
                                {log.user_role}
                              </span>
                            )}
                          </div>
                          {log.user_email && (
                            <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', marginTop: '1px' }}>
                              {log.user_email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{log.ip_address || '127.0.0.1'}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminAccessLogsPage;
