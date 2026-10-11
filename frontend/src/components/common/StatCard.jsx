import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  const colorThemes = {
    blue: {
      iconBg: '#e0f2fe',
      iconColor: '#0284c7',
      borderAccent: '#bae6fd',
    },
    teal: {
      iconBg: '#ccfbf1',
      iconColor: '#0d9488',
      borderAccent: '#99f6e4',
    },
    emerald: {
      iconBg: '#d1fae5',
      iconColor: '#059669',
      borderAccent: '#a7f3d0',
    },
    amber: {
      iconBg: '#fef3c7',
      iconColor: '#d97706',
      borderAccent: '#fde68a',
    },
    purple: {
      iconBg: '#f3e8ff',
      iconColor: '#9333ea',
      borderAccent: '#e9d5ff',
    },
  };

  const theme = colorThemes[color] || colorThemes.blue;

  return (
    <div
      className="card card-hover"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '22px 24px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {Icon && (
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            backgroundColor: theme.iconBg,
            color: theme.iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={28} strokeWidth={2} />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
          {title}
        </p>
        <p style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
          {value !== undefined && value !== null ? value : '--'}
        </p>
        {subtitle && (
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
