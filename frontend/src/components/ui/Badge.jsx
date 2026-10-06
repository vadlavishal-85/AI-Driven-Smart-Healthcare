import React from 'react';
import './Badge.css';

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) {
  return (
    <span className={`sh-badge sh-badge-${variant} sh-badge-${size} ${className}`} {...props}>
      {dot && <span className="sh-badge-dot" />}
      {children}
    </span>
  );
}
