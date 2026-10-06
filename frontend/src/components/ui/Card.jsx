import React from 'react';
import './Card.css';

export default function Card({
  children,
  className = '',
  hoverable = false,
  glass = false,
  padding = 'md',
  onClick,
  ...props
}) {
  const classes = `sh-card sh-card-pad-${padding} ${hoverable ? 'sh-card-hover' : ''} ${glass ? 'sh-card-glass' : ''} ${className}`;

  return (
    <div className={classes.trim()} onClick={onClick} {...props}>
      {children}
    </div>
  );
}
