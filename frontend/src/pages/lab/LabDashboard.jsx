import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Bell, Search, PlusCircle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';

const LabDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const notifData = await notificationService.getNotifications().catch(() => []);
        setNotifications(Array.isArray(notifData) ? notifData : []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Loading laboratory dashboard..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)',
        borderRadius: '16px',
        padding: '28px 32px',
        border: '1px solid #bfdbfe',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: 'var(--primary-color)',
            textTransform: 'uppercase',
            backgroundColor: '#ffffff',
            padding: '4px 10px',
            borderRadius: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            DIAGNOSTIC LABORATORY PORTAL
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '10px', marginBottom: '6px', letterSpacing: '-0.02em' }}>
            Welcome, {user?.full_name || 'Laboratory Staff'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Upload biochemistry and diagnostic test results directly to the secure MongoDB repository.
          </p>
        </div>

        <button
          onClick={() => navigate('/lab/reports')}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
        >
          <PlusCircle size={18} />
          Create Lab Report
        </button>
      </div>

      {/* Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <StatCard
          icon={FlaskConical}
          label="Laboratory Workstation"
          value="Active"
          trend="MongoDB Integration"
          color="#0284c7"
        />
        <StatCard
          icon={Bell}
          label="Staff Notifications"
          value={notifications.length}
          trend="System alerts"
          color="#f59e0b"
        />
        <StatCard
          icon={ShieldCheck}
          label="Access Level"
          value="LAB"
          trend="RBAC Authorized"
          color="#10b981"
        />
      </div>

      {/* Quick Actions & Recent Notifications */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Quick Action Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>
              Publish Diagnostic Test
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Generate complete clinical reports including haematology, lipid profiles, metabolic panels, and pathology notes linked to ordering physicians and patient records.
            </p>
          </div>
          <button
            onClick={() => navigate('/lab/reports')}
            className="btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            Open Diagnostic Entry Console
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Notifications feed */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Recent Notifications
            </h2>
            <button
              onClick={() => navigate('/lab/notifications')}
              style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
              <Bell size={36} color="var(--border-color)" style={{ margin: '0 auto 10px' }} />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>No new notifications.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.slice(0, 3).map(n => (
                <div key={n.id} style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: n.is_read ? 'var(--background)' : '#eff6ff',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {n.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LabDashboard;
