import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import TopNavbar from '../../components/navbar/TopNavbar';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    consent: false,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Compute password strength score (0-4)
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(formData.password);

  const getStrengthLabel = (score) => {
    switch (score) {
      case 0: return { label: 'None', color: 'muted' };
      case 1: return { label: 'Weak', color: 'danger' };
      case 2: return { label: 'Fair', color: 'warning' };
      case 3: return { label: 'Good', color: 'info' };
      case 4: return { label: 'Strong', color: 'success' };
      default: return { label: '', color: 'muted' };
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required.';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required.';

    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters long.';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.consent) {
      errs.consent = 'You must accept the terms and privacy policy.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setLoading(true);

    try {
      await register({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        role: 'PATIENT',
      });

      setLoading(false);
      setSuccessMessage('Patient account created successfully! Redirecting to login...');

      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Account created successfully! Please sign in to access your portal.',
            registeredEmail: formData.email.trim().toLowerCase(),
          },
        });
      }, 1200);
    } catch (err) {
      setLoading(false);
      setServerError(err.message || 'Unable to complete registration. Please try again.');
    }
  };

  const strengthMeta = getStrengthLabel(strength);

  return (
    <div className="sh-register-page">
      <TopNavbar mode="public" />

      <div className="container sh-register-container">
        <div className="sh-register-wrapper animate-fade-scale">
          <Card className="sh-register-card">
            {/* Header Identity Banner */}
            <div className="sh-register-role-banner">
              <div className="sh-register-role-circle">
                <UserCheck size={32} className="text-primary" />
              </div>
              <div className="sh-register-role-info">
                <div className="sh-register-badge-row">
                  <Badge variant="primary" size="sm">
                    Verified Portal Registration
                  </Badge>
                  <span className="sh-security-badge">
                    <ShieldCheck size={13} className="text-success" /> HIPAA/Role Ready
                  </span>
                </div>
                <h2>Create Patient Account</h2>
                <p>Register as a patient to manage medical charts, consultations, and records.</p>
              </div>
            </div>

            {successMessage && (
              <div className="auth-alert auth-alert-success animate-fade-in">
                <CheckCircle2 size={18} />
                <span>{successMessage}</span>
              </div>
            )}

            {serverError && (
              <div className="auth-alert auth-alert-danger animate-fade-in">
                <AlertCircle size={18} />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-row-2">
                <Input
                  label="First Name"
                  name="firstName"
                  placeholder="Jane"
                  icon={User}
                  value={formData.firstName}
                  onChange={(e) => {
                    setFormData({ ...formData, firstName: e.target.value });
                    if (errors.firstName) setErrors({ ...errors, firstName: null });
                    if (serverError) setServerError(null);
                  }}
                  error={errors.firstName}
                  required
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => {
                    setFormData({ ...formData, lastName: e.target.value });
                    if (errors.lastName) setErrors({ ...errors, lastName: null });
                    if (serverError) setServerError(null);
                  }}
                  error={errors.lastName}
                  required
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="jane.doe@example.com"
                icon={Mail}
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: null });
                  if (serverError) setServerError(null);
                }}
                error={errors.email}
                required
              />

              <Input
                label="Contact Phone (Optional)"
                type="tel"
                name="phone"
                placeholder="+1 (555) 000-0000"
                icon={Phone}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="At least 8 characters"
                icon={Lock}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: null });
                  if (serverError) setServerError(null);
                }}
                error={errors.password}
                required
              />

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="password-strength-container animate-fade-in">
                  <div className="strength-header">
                    <span>Password Security Strength:</span>
                    <span className={`strength-label strength-${strengthMeta.color}`}>
                      {strengthMeta.label}
                    </span>
                  </div>
                  <div className="strength-bars">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`strength-bar ${step <= strength ? `bar-${strengthMeta.color}` : ''}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                placeholder="Repeat your password"
                icon={Lock}
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                  if (serverError) setServerError(null);
                }}
                error={errors.confirmPassword}
                required
              />

              {/* Consent Checkbox */}
              <div className="register-consent-group">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.consent}
                    onChange={(e) => {
                      setFormData({ ...formData, consent: e.target.checked });
                      if (errors.consent) setErrors({ ...errors, consent: null });
                    }}
                    className="sh-checkbox"
                  />
                  <span className="consent-text">
                    I agree to the <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Clinical Service</a> and <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
                  </span>
                </label>
                {errors.consent && <p className="sh-input-error-msg">{errors.consent}</p>}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                iconRight={ArrowRight}
              >
                Complete Patient Registration
              </Button>

              <div className="auth-footer-prompt">
                <span>Already registered with SmartHealthcare?</span>{' '}
                <Link to="/login" className="auth-accent-link">
                  Sign In to Portal
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
