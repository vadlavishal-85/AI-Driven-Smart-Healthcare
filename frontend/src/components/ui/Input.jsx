import React, { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Input.css';

export default function Input({
  label,
  error,
  helperText,
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  id,
  name,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const generatedId = useId();
  const inputId = id || name || `input-${generatedId.replaceAll(':', '')}`;
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`sh-input-group ${error ? 'sh-input-has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="sh-input-label">
          {label} {required && <span className="sh-input-required">*</span>}
        </label>
      )}

      <div className="sh-input-wrapper">
        {Icon && <Icon className="sh-input-icon-left" size={18} />}

        <input
          id={inputId}
          name={name}
          type={effectiveType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`sh-input-field ${Icon ? 'sh-input-with-left-icon' : ''} ${isPassword ? 'sh-input-with-right-icon' : ''}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className="sh-input-toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <p className="sh-input-error-msg">{error}</p>}
      {!error && helperText && <p className="sh-input-helper-msg">{helperText}</p>}
    </div>
  );
}
