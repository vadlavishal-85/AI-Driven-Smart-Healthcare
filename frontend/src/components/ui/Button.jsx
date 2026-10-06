import React from 'react';
import './Button.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  const baseClasses = `sh-btn sh-btn-${variant} sh-btn-${size} ${fullWidth ? 'sh-btn-full' : ''} ${loading ? 'sh-btn-loading' : ''} ${className}`;

  return (
    <button
      type={type}
      className={baseClasses.trim()}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="sh-btn-spinner" aria-hidden="true" />
      ) : (
        <>
          {Icon && <Icon className="sh-btn-icon sh-btn-icon-left" size={size === 'sm' ? 15 : size === 'lg' ? 20 : 17} />}
          <span className="sh-btn-text">{children}</span>
          {IconRight && <IconRight className="sh-btn-icon sh-btn-icon-right" size={size === 'sm' ? 15 : size === 'lg' ? 20 : 17} />}
        </>
      )}
    </button>
  );
}
