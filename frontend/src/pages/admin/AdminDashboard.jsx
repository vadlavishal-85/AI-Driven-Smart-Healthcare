import React, { useState, useEffect } from 'react';
import { Users, Stethoscope, HeartPulse, Calendar, ShieldAlert, Share2, Activity, ArrowUpRight } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { AppointmentTrendChart, UserRoleDistributionChart, DocumentDistributionChart } from '../../components/charts/Charts';
import { analyticsService } from '../../services/analyticsService';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [overviewData, trendData, activityData, topDocData] = await Promise.all([
          analyticsService.getOverview().catch(() => ({})),
          analyticsService.getAppointmentTrend().catch(() => ({ trend: [] })),
          analyticsService.getRecentActivity(8).catch(() => ({ activities: [] })),
          analyticsService.getTopDoctors(5).catch(() => ({ doctors: [] })),
        ]);
        setOverview(overviewData || {});
        setTrend(trendData?.trend || []);
        setRecentActivities(activityData?.activities || []);
        setTopDoctors(topDocData?.doctors || []);
      } catch (err) {
        setError('Failed to load system analytics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="System Administration & Analytics Overview">
        <LoadingSpinner message="Aggregating healthcare analytics across PostgreSQL & MongoDB..." />
      </DashboardLayout>
    );
  }

  const users = overview?.users || {};
  const appts = overview?.appointments || {};
  const docs = overview?.healthcare_documents || {};
  const sharing = overview?.data_sharing || {};

  return (
    <DashboardLayout
      title="Hospital Operations & Analytics Overview"
      subtitle="Real-time multi-database metrics from PostgreSQL governance and MongoDB clinical documents."
    >
      {error && (
        <div style={{ padding: '14px 18px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '12px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Top Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        <StatCard
          title="Total Users"
          value={users.total || 0}
          icon={Users}
          color="blue"
          subtitle={`${users.doctors || 0} Doctors • ${users.patients || 0} Patients`}
        />
        <StatCard
          title="Clinical Doctors"
          value={users.doctors || 0}
          icon={Stethoscope}
          color="teal"
          subtitle="Active registered specialists"
        />
        <StatCard
          title="Registered Patients"
          value={users.patients || 0}
          icon={HeartPulse}
          color="emerald"
          subtitle="Receiving active care"
        />
        <StatCard
          title="Total Appointments"
          value={appts.total || 0}
          icon={Calendar}
          color="purple"
          subtitle={`${appts.scheduled || 0} Scheduled • ${appts.completed || 0} Completed`}
        />
      </div>

      {/* Secondary Metrics: Documents & Sharing */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={24} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>MongoDB Clinical Documents</p>
            <p style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{docs.total || 0}</p>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>{docs.medical_records || 0} Records • {docs.prescriptions || 0} Rx • {docs.lab_reports || 0} Labs</p>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Share2 size={24} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Authorized Data Sharing</p>
            <p style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{sharing.total || 0}</p>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>{sharing.approved || 0} Approved • {sharing.revoked || 0} Revoked</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        {/* Trend Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>Appointment Volume Trend</h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Monthly appointment activity (PostgreSQL)</p>
            </div>
            <span className="badge badge-primary">Dynamic</span>
          </div>
          <AppointmentTrendChart trendData={trend} />
        </div>

        {/* User Distribution Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>User Role Distribution</h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Breakdown across system roles</p>
            </div>
          </div>
          <UserRoleDistributionChart usersData={users} />
        </div>
      </div>

      {/* Bottom Grid: Documents & Recent Activity */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Healthcare Documents Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            Clinical Documents by Collection
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
            Active document counts residing in local MongoDB database
          </p>
          <DocumentDistributionChart docsData={docs} />
        </div>

        {/* Recent Audit Activities */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>Recent System Activity</h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Latest audit access events (no PHI)</p>
            </div>
            <span className="badge badge-secondary">Audit Trail</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentActivities.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '24px' }}>No recent activity records found.</p>
            ) : (
              recentActivities.map((act, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284c7' }} />
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                      {act.action}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
                      {act.resource_type}
                    </span>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                    {act.created_at ? new Date(act.created_at).toLocaleTimeString() : ''}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
