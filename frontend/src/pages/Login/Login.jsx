import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  UserCheck,
  Shield,
  ShieldCheck,
  KeyRound,
  HeartPulse,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import ThemeToggle from '../../components/ui/ThemeToggle';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import doctorRoleImg from '../../assets/images/doctor_role.jpg';
import patientRoleImg from '../../assets/images/patient_role.jpg';
import adminRoleImg from '../../assets/images/admin_role.jpg';
import './Login.css';

const DEMO_ACCOUNTS = import.meta.env.DEV ? {
  DOCTOR: {
    label: 'DEMO DOCTOR ACCOUNT',
    name: 'Dr. Ananya Rao',
    email: 'doctor.demo@smarthealthcare.local',
    password: 'DemoDoctor@123',
  },
  PATIENT: {
    label: 'DEMO PATIENT ACCOUNT',
    name: 'Rahul Mehta',
    email: 'patient.demo@smarthealthcare.local',
    password: 'DemoPatient@123',
  },
  ADMIN: {
    label: 'DEMO ADMIN ACCOUNT',
    name: 'SmartCare Admin',
    email: 'admin.demo@smarthealthcare.local',
    password: 'DemoAdmin@123',
  },
} : {};

const ROLE_CONFIGS = {
  DOCTOR: {
    id: 'DOCTOR',
    title: 'Doctor Login',
    workspaceName: 'Clinical Workspace',
    subtitle: 'Access your Clinical Workspace',
    image: doctorRoleImg,
    icon: Stethoscope,
    theme: 'teal',
    demo: DEMO_ACCOUNTS.DOCTOR,
  },
  PATIENT: {
    id: 'PATIENT',
    title: 'Patient Login',
    workspaceName: 'Personal Healthcare Portal',
    subtitle: 'Access your Personal Healthcare Portal',
    image: patientRoleImg,
    icon: UserCheck,
    theme: 'blue',
    demo: DEMO_ACCOUNTS.PATIENT,
  },
  ADMIN: {
    id: 'ADMIN',
    title: 'Admin Login',
    workspaceName: 'Smart Hospital Operations',
    subtitle: 'Access Smart Hospital Operations',
    image: adminRoleImg,
    icon: Shield,
    theme: 'cyan',
    demo: DEMO_ACCOUNTS.ADMIN,
  },
};

export default function Login() {
  const location = useLocation();
  const requestedRole = new URLSearchParams(location.search).get('role')?.toUpperCase();
  const roleParam = (requestedRole || 'DOCTOR').toUpperCase();
  const roleConfig = ROLE_CONFIGS[roleParam] || ROLE_CONFIGS.DOCTOR;

  return <LoginForm key={roleParam} roleConfig={roleConfig} requiredRole={ROLE_CONFIGS[roleParam] ? requestedRole : null} />;
}

function LoginForm({ roleConfig, requiredRole }) {
  const navigate = useNavigate();
  const { login, logout } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Handler for [ Use Demo Account ] button (Populates fields ONLY!)
  const handleUseDemoAccount = () => {
    setFormData({
      ...formData,
      email: roleConfig.demo.email,
      password: roleConfig.demo.password,
    });
    setErrors({});
    setServerError(null);
  };

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
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
      // Execute real backend authentication
      const authenticatedUser = await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (requiredRole && authenticatedUser.role?.toUpperCase() !== requiredRole) {
        logout();
        const actualRole = authenticatedUser.role?.toLowerCase() || 'different';
        throw new Error(`This account has ${actualRole} access. Choose the matching healthcare portal.`);
      }

      setLoginSuccess(true);
      setLoading(false);

      // Navigate to dashboard after short feedback
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    } catch (err) {
      setLoading(false);
      setLoginSuccess(false);
      setServerError(err.message || 'Invalid email or password.');
    }
  };

  const Icon = roleConfig.icon;

  return (
    <div className="sh-login-wrapper">
      {/* Top Header */}
      <header className="sh-login-topbar">
        <div className="container-wide sh-login-topbar-inner">
          <Link to="/" className="sh-login-brand">
            <div className="sh-login-brand-icon">
              <HeartPulse size={20} />
            </div>
            <span>
              Smart<span className="text-cyan">Healthcare</span>
            </span>
          </Link>

          <ThemeToggle />
          <button
            type="button"
            className="sh-login-change-role-btn"
            aria-label="Change Healthcare Role"
            onClick={() => navigate('/select-role')}
          >
            <ArrowLeft size={16} />
            <span>Change Healthcare Role</span>
          </button>
        </div>
      </header>

      {/* Main Split Login Box */}
      <main className="sh-login-main-container animate-fade-scale">
        <div className="sh-login-split-card">
          {/* LEFT: HEALTHCARE VISUAL PHOTO */}
          <div className="sh-login-photo-side">
            <img
              src={roleConfig.image}
              alt={`${roleConfig.title} Visual`}
              className="sh-login-photo-img"
            />
            <div className="sh-login-photo-overlay" />

            <div className="sh-login-photo-content">
              <div className="sh-photo-icon-box">
                <Icon size={28} />
              </div>
              <h2>{roleConfig.workspaceName}</h2>
              <p>{roleConfig.subtitle}</p>
              <div className="sh-login-trust-pill">
                <ShieldCheck size={16} className="text-success" />
                <span>Bcrypt Salted & JWT Protected</span>
              </div>
            </div>
          </div>

          {/* RIGHT: CLEAN FORM */}
          <div className="sh-login-form-side">
            {/* Header */}
            <div className="sh-form-header">
              <div className="sh-form-role-badge">
                <Icon size={16} />
                <span>{roleConfig.workspaceName}</span>
              </div>
              <h1 className="sh-form-title">{roleConfig.title}</h1>
              <p className="sh-form-subtitle">{roleConfig.subtitle}</p>
            </div>

            {serverError && (
              <div className="auth-alert auth-alert-danger animate-fade-in">
                <AlertCircle size={18} />
                <span>{serverError}</span>
              </div>
            )}

            {loginSuccess && (
              <div className="auth-alert auth-alert-success animate-fade-in">
                <CheckCircle2 size={18} />
                <span>Authentication verified. Opening workspace...</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="user@smarthealthcare.local"
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

              {/* Password with Eye Toggle */}
              <div className="sh-password-wrap">
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="••••••••••••"
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
              </div>

              <div className="sh-form-options">
                <label className="sh-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) =>
                      setFormData({ ...formData, rememberMe: e.target.checked })
                    }
                  />
                  <span>Remember workstation</span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                iconRight={ArrowRight}
              >
                Sign In to {roleConfig.title.replace(' Login', '')}
              </Button>
            </form>

            {/* Development-only demo credentials; production accounts must be provisioned. */}
            {import.meta.env.DEV && <div className="sh-demo-account-box">
              <div className="sh-demo-box-header">
                <KeyRound size={16} className="text-primary" />
                <span className="sh-demo-box-title">{roleConfig.demo.label}</span>
              </div>

              <div className="sh-demo-credentials">
                <div className="demo-cred-row">
                  <span className="demo-cred-label">Name:</span>
                  <span className="demo-cred-val font-bold">{roleConfig.demo.name}</span>
                </div>
                <div className="demo-cred-row">
                  <span className="demo-cred-label">Email:</span>
                  <span className="demo-cred-val">{roleConfig.demo.email}</span>
                </div>
                <div className="demo-cred-row">
                  <span className="demo-cred-label">Password:</span>
                  <span className="demo-cred-val">{roleConfig.demo.password}</span>
                </div>
              </div>

              <button
                type="button"
                className="sh-demo-fill-btn"
                onClick={handleUseDemoAccount}
              >
                Use Demo Account
              </button>
            </div>}
          </div>
        </div>
      </main>
    </div>
  );
}
