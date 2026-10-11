import React from 'react';

const StatusBadge = ({ status }) => {
  if (status === undefined || status === null || status === '') return null;

  const strStatus = typeof status === 'string' ? status : String(status);
  const normalized = strStatus.toUpperCase();

  const styles = {
    // Appointment Statuses
    SCHEDULED: { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd', label: 'Scheduled' },
    COMPLETED: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0', label: 'Completed' },
    CANCELLED: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', label: 'Cancelled' },

    // Sharing Statuses
    APPROVED: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0', label: 'Approved & Shared' },
    REVOKED: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', label: 'Revoked' },
    PENDING: { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: 'Pending' },

    // General / Roles
    ACTIVE: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0', label: 'Active' },
    INACTIVE: { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: 'Inactive' },
    DOCTOR: { bg: '#e0f2fe', color: '#0284c7', border: '#bae6fd', label: 'Doctor' },
    PATIENT: { bg: '#ccfbf1', color: '#0f766e', border: '#99f6e4', label: 'Patient' },
    ADMIN: { bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff', label: 'Admin' },
    LAB: { bg: '#fef3c7', color: '#d97706', border: '#fde68a', label: 'Lab' },
  };

  const current = styles[normalized] || {
    bg: '#f1f5f9',
    color: '#475569',
    border: '#e2e8f0',
    label: status,
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        fontSize: '12px',
        fontWeight: 600,
        borderRadius: '9999px',
        backgroundColor: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`,
        letterSpacing: '0.02em',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: current.color,
          marginRight: '6px',
        }}
      />
      {current.label}
    </span>
  );
};

export default StatusBadge;
