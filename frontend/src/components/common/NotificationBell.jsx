import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { notificationService } from '../../services/notificationService';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      // silently handle or empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // handle error
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setFeedback('Notification removed');
      setTimeout(() => setFeedback(''), 2500);
    } catch {
      setFeedback('Failed to remove notification');
      setTimeout(() => setFeedback(''), 2500);
    }
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'APPOINTMENT_BOOKED':
        return { label: 'Appointment Booked', color: '#0284c7', bg: '#e0f2fe' };
      case 'APPOINTMENT_RESCHEDULED':
        return { label: 'Rescheduled', color: '#d97706', bg: '#fef3c7' };
      case 'APPOINTMENT_CANCELLED':
        return { label: 'Cancelled', color: '#dc2626', bg: '#fee2e2' };
      case 'PRESCRIPTION_CREATED':
        return { label: 'Prescription', color: '#059669', bg: '#d1fae5' };
      case 'DATA_SHARED':
        return { label: 'Shared Record', color: '#7c3aed', bg: '#ede9fe' };
      case 'DATA_SHARE_REVOKED':
        return { label: 'Access Revoked', color: '#b91c1c', bg: '#fee2e2' };
      default:
        return { label: 'Notification', color: '#475569', bg: '#f1f5f9' };
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#475569',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '9999px',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #ffffff',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '48px',
            width: '360px',
            maxHeight: '440px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="badge badge-primary">{unreadCount} new</span>
              )}
            </div>
            <button
              onClick={fetchNotifications}
              style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none' }}
            >
              Refresh
            </button>
          </div>

          {feedback && (
            <div
              style={{
                padding: '8px 18px',
                backgroundColor: '#f0fdf4',
                color: '#166534',
                fontSize: '12px',
                fontWeight: 600,
                borderBottom: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>{feedback}</span>
            </div>
          )}

          <div style={{ overflowY: 'auto', maxHeight: '340px' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((item) => {
                const badge = getBadgeStyle(item.type);
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: item.is_read ? '#ffffff' : '#f0f9ff',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: item.is_read ? 600 : 700, color: '#0f172a', margin: 0 }}>
                          {item.title}
                        </h4>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: badge.bg,
                            color: badge.color,
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {!item.is_read && (
                          <button
                            onClick={(e) => handleMarkAsRead(item.id, e)}
                            title="Mark as read"
                            style={{
                              color: '#0284c7',
                              padding: '3px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          title="Delete notification"
                          style={{
                            color: '#94a3b8',
                            padding: '3px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.45, marginBottom: '6px' }}>
                      {item.message}
                    </p>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

