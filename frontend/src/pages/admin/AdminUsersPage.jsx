import React, { useState, useEffect } from 'react';
import { Users, Shield, UserCheck, Stethoscope, HeartPulse, TestTubes, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';
import { analyticsService } from '../../services/analyticsService';

const AdminUsersPage = () => {
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getUserAnalytics();
        setUserAnalytics(data);
      } catch {
        // error handled
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
          User Directory & Role Distribution
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '4px', margin: 0 }}>
          System-wide user accounts, role allocations, and active user metrics
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading user demographics..." />
      ) : userAnalytics && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <StatCard
              icon={Users}
              label="Total Registered Users"
              value={userAnalytics.total_users || 0}
              trend="All roles combined"
              color="#0284c7"
            />
            <StatCard
              icon={UserCheck}
              label="Active Accounts"
              value={userAnalytics.active_users || 0}
              trend="Verified credentials"
              color="#10b981"
            />
            <StatCard
              icon={Stethoscope}
              label="Licensed Doctors"
              value={userAnalytics.roles?.DOCTOR || 0}
              trend="Medical staff"
              color="#0d9488"
            />
            <StatCard
              icon={HeartPulse}
              label="Registered Patients"
              value={userAnalytics.roles?.PATIENT || 0}
              trend="Patient portals"
              color="#f59e0b"
            />
          </div>

          <div className="card" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '20px' }}>
              Role Allocation Breakdown
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #fee2e2', backgroundColor: '#fef2f2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', fontWeight: 800, marginBottom: '8px' }}>
                  <Shield size={20} />
                  <span>ADMINISTRATORS</span>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#991b1b' }}>
                  {userAnalytics.roles?.ADMIN || 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '4px' }}>
                  Superuser governance & audit control
                </div>
              </div>

              <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #ccfbf1', backgroundColor: '#f0fdfa' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0d9488', fontWeight: 800, marginBottom: '8px' }}>
                  <Stethoscope size={20} />
                  <span>DOCTORS</span>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#115e59' }}>
                  {userAnalytics.roles?.DOCTOR || 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#0d9488', marginTop: '4px' }}>
                  Physicians, consultations & notes
                </div>
              </div>

              <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #fef3c7', backgroundColor: '#fffbeb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#d97706', fontWeight: 800, marginBottom: '8px' }}>
                  <HeartPulse size={20} />
                  <span>PATIENTS</span>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#92400e' }}>
                  {userAnalytics.roles?.PATIENT || 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#d97706', marginTop: '4px' }}>
                  Health records & appointments
                </div>
              </div>

              <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #e0e7ff', backgroundColor: '#eef2ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4f46e5', fontWeight: 800, marginBottom: '8px' }}>
                  <TestTubes size={20} />
                  <span>LABORATORY</span>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3730a3' }}>
                  {userAnalytics.roles?.LAB || 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#4f46e5', marginTop: '4px' }}>
                  Diagnostics & biochemistry reports
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminUsersPage;
