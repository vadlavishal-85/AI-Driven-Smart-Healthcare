import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Edit3,
  X,
  Save,
  KeyRound,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { getMyProfile, updateMyProfile, changeMyPassword } from '../../services/userService';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import './Profile.css';

function formatRole(role) {
  if (!role) return 'Verified User';
  if (role === 'ADMIN') return 'Administrator';
  if (role === 'DOCTOR') return 'Doctor';
  if (role === 'PATIENT') return 'Patient';
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function Profile() {
  const { currentUser, updateUser } = useAuth();

  // Profile data & edit mode state
  const [profile, setProfile] = useState(currentUser || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: currentUser?.first_name || '',
    lastName: currentUser?.last_name || '',
    phone: currentUser?.phone || '',
  });
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState(null);
  const [editErrorMsg, setEditErrorMsg] = useState(null);

  // Password change state
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState(null);

  // Fetch freshest profile from MySQL backend on component mount
  useEffect(() => {
    let isMounted = true;

    async function loadFreshProfile() {
      try {
        const data = await getMyProfile();
        if (isMounted) {
          setProfile(data);
          setEditFormData({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            phone: data.phone || '',
          });
          updateUser(data);
        }
      } catch {
        // Fallback to AuthContext state if fetch encounters an issue
        // Keep the authenticated context profile as the fallback when the API is unavailable.
      }
    }

    loadFreshProfile();

    return () => {
      isMounted = false;
    };
  }, [updateUser]);

  // ==========================================
  // PROFILE EDIT HANDLERS
  // ==========================================
  const handleStartEdit = () => {
    setIsEditing(true);
    setEditSuccessMsg(null);
    setEditErrorMsg(null);
    setEditErrors({});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditErrors({});
    setEditErrorMsg(null);
    if (profile) {
      setEditFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        phone: profile.phone || '',
      });
    }
  };

  const validateProfileForm = () => {
    const errs = {};
    if (!editFormData.firstName.trim()) {
      errs.firstName = 'First name is required.';
    }
    if (!editFormData.lastName.trim()) {
      errs.lastName = 'Last name is required.';
    }
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditSuccessMsg(null);
    setEditErrorMsg(null);

    if (!validateProfileForm()) return;

    setEditLoading(true);

    try {
      const updated = await updateMyProfile({
        first_name: editFormData.firstName,
        last_name: editFormData.lastName,
        phone: editFormData.phone,
      });

      setProfile(updated);
      updateUser(updated);
      setIsEditing(false);
      setEditLoading(false);
      setEditSuccessMsg('Profile updated successfully.');
    } catch (err) {
      setEditLoading(false);
      setEditErrorMsg(err.message || 'Unable to update profile. Please try again.');
    }
  };

  // ==========================================
  // PASSWORD CHANGE HANDLERS
  // ==========================================
  const validatePasswordForm = () => {
    const errs = {};
    if (!passwordFormData.currentPassword) {
      errs.currentPassword = 'Current password is required.';
    }

    if (!passwordFormData.newPassword) {
      errs.newPassword = 'New password is required.';
    } else if (passwordFormData.newPassword.length < 8) {
      errs.newPassword = 'New password must be at least 8 characters long.';
    }

    if (!passwordFormData.confirmPassword) {
      errs.confirmPassword = 'Password confirmation is required.';
    } else if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      errs.confirmPassword = 'New passwords do not match.';
    }

    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccessMsg(null);
    setPasswordErrorMsg(null);

    if (!validatePasswordForm()) return;

    setPasswordLoading(true);

    try {
      const result = await changeMyPassword({
        current_password: passwordFormData.currentPassword,
        new_password: passwordFormData.newPassword,
      });

      setPasswordLoading(false);
      setPasswordSuccessMsg(result.message || 'Password changed successfully.');
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
    } catch (err) {
      setPasswordLoading(false);
      setPasswordErrorMsg(err.message || 'Unable to change password. Please try again.');
    }
  };

  const userInitials = profile
    ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || 'SH'
    : 'SH';

  const roleFormatted = formatRole(profile?.role);

  return (
    <DashboardLayout>
      <div className="profile-view-container animate-fade-up">
        {/* Profile Hero Overview Header */}
        <div className="profile-hero-banner">
          <div className="profile-hero-left">
            <div className="profile-avatar-large">
              <span>{userInitials}</span>
            </div>
            <div className="profile-hero-info">
              <div className="profile-badge-row">
                <Badge variant="primary" size="sm" dot>
                  {roleFormatted}
                </Badge>
                <Badge variant={profile?.is_active ? 'success' : 'neutral'} size="sm">
                  {profile?.is_active ? 'Account Active' : 'Deactivated'}
                </Badge>
                <span className="read-only-field-banner">
                  <Calendar size={13} /> Member since {formatDate(profile?.created_at)}
                </span>
              </div>
              <h1 className="profile-full-name">
                {profile?.first_name} {profile?.last_name}
              </h1>
              <span className="profile-user-email">
                <Mail size={15} className="text-muted" /> {profile?.email}
              </span>
            </div>
          </div>

          <div className="profile-hero-right">
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                icon={Edit3}
                onClick={handleStartEdit}
              >
                Edit Identity Details
              </Button>
            )}
          </div>
        </div>

        {/* 2-Column Split: Profile Details & Password Security */}
        <div className="profile-grid-layout">
          {/* Card 1: Identity & Account Information */}
          <Card className="profile-card">
            <div className="profile-card-header">
              <div className="profile-card-title-group">
                <div className="profile-card-icon-box bg-primary-soft">
                  <User size={22} className="text-primary" />
                </div>
                <div>
                  <h2>Identity & Profile Details</h2>
                  <p>Personal information and verified healthcare contact credentials</p>
                </div>
              </div>
            </div>

            {editSuccessMsg && (
              <div className="auth-alert auth-alert-success animate-fade-in">
                <CheckCircle2 size={18} />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            {editErrorMsg && (
              <div className="auth-alert auth-alert-danger animate-fade-in">
                <AlertCircle size={18} />
                <span>{editErrorMsg}</span>
              </div>
            )}

            {isEditing ? (
              /* EDIT MODE FORM */
              <form onSubmit={handleSaveProfile} className="profile-edit-form" noValidate>
                <Input
                  label="First Name"
                  name="firstName"
                  icon={User}
                  value={editFormData.firstName}
                  onChange={(e) => {
                    setEditFormData({ ...editFormData, firstName: e.target.value });
                    if (editErrors.firstName) setEditErrors({ ...editErrors, firstName: null });
                  }}
                  error={editErrors.firstName}
                  required
                />

                <Input
                  label="Last Name"
                  name="lastName"
                  value={editFormData.lastName}
                  onChange={(e) => {
                    setEditFormData({ ...editFormData, lastName: e.target.value });
                    if (editErrors.lastName) setEditErrors({ ...editErrors, lastName: null });
                  }}
                  error={editErrors.lastName}
                  required
                />

                <Input
                  label="Contact Phone"
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  icon={Phone}
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />

                <div className="read-only-field-banner">
                  <ShieldCheck size={14} className="text-muted" />
                  <span>Email and Role assignments are managed under institutional governance.</span>
                </div>

                <div className="profile-form-actions">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={X}
                    onClick={handleCancelEdit}
                    disabled={editLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    icon={Save}
                    loading={editLoading}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              /* VIEW MODE READ-ONLY DISPLAY */
              <div className="profile-info-list">
                <div className="profile-info-row">
                  <span className="profile-info-label">
                    <User size={15} className="text-muted" /> First Name
                  </span>
                  <span className="profile-info-value">{profile?.first_name || '—'}</span>
                </div>

                <div className="profile-info-row">
                  <span className="profile-info-label">
                    <User size={15} className="text-muted" /> Last Name
                  </span>
                  <span className="profile-info-value">{profile?.last_name || '—'}</span>
                </div>

                <div className="profile-info-row">
                  <span className="profile-info-label">
                    <Mail size={15} className="text-muted" /> Registered Email
                  </span>
                  <span className="profile-info-value">{profile?.email || '—'}</span>
                </div>

                <div className="profile-info-row">
                  <span className="profile-info-label">
                    <Phone size={15} className="text-muted" /> Contact Telephone
                  </span>
                  <span className={profile?.phone ? 'profile-info-value' : 'profile-info-value-muted'}>
                    {profile?.phone || 'No phone recorded'}
                  </span>
                </div>

                <div className="profile-info-row">
                  <span className="profile-info-label">
                    <Shield size={15} className="text-muted" /> Institutional Role
                  </span>
                  <span className="profile-info-value">{roleFormatted}</span>
                </div>

                <div className="profile-info-row">
                  <span className="profile-info-label">
                    <CheckCircle2 size={15} className="text-muted" /> Account Status
                  </span>
                  <Badge variant={profile?.is_active ? 'success' : 'neutral'} size="sm">
                    {profile?.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="profile-info-row">
                  <span className="profile-info-label">
                    <Calendar size={15} className="text-muted" /> Registration Date
                  </span>
                  <span className="profile-info-value">{formatDate(profile?.created_at)}</span>
                </div>
              </div>
            )}
          </Card>

          {/* Card 2: Security & Password Management */}
          <Card className="profile-card">
            <div className="profile-card-header">
              <div className="profile-card-title-group">
                <div className="profile-card-icon-box bg-teal-soft">
                  <KeyRound size={22} className="text-secondary" />
                </div>
                <div>
                  <h2>Security & Password</h2>
                  <p>Update your credentials with bcrypt encryption</p>
                </div>
              </div>
            </div>

            {passwordSuccessMsg && (
              <div className="auth-alert auth-alert-success animate-fade-in">
                <CheckCircle2 size={18} />
                <span>{passwordSuccessMsg}</span>
              </div>
            )}

            {passwordErrorMsg && (
              <div className="auth-alert auth-alert-danger animate-fade-in">
                <AlertCircle size={18} />
                <span>{passwordErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="password-change-form" noValidate>
              <Input
                label="Current Password"
                type="password"
                name="currentPassword"
                placeholder="••••••••••••"
                icon={Lock}
                value={passwordFormData.currentPassword}
                onChange={(e) => {
                  setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value });
                  if (passwordErrors.currentPassword) setPasswordErrors({ ...passwordErrors, currentPassword: null });
                  if (passwordErrorMsg) setPasswordErrorMsg(null);
                }}
                error={passwordErrors.currentPassword}
                required
              />

              <Input
                label="New Password"
                type="password"
                name="newPassword"
                placeholder="At least 8 characters"
                icon={Lock}
                value={passwordFormData.newPassword}
                onChange={(e) => {
                  setPasswordFormData({ ...passwordFormData, newPassword: e.target.value });
                  if (passwordErrors.newPassword) setPasswordErrors({ ...passwordErrors, newPassword: null });
                  if (passwordErrorMsg) setPasswordErrorMsg(null);
                }}
                error={passwordErrors.newPassword}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                placeholder="Repeat new password"
                icon={Lock}
                value={passwordFormData.confirmPassword}
                onChange={(e) => {
                  setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value });
                  if (passwordErrors.confirmPassword) setPasswordErrors({ ...passwordErrors, confirmPassword: null });
                  if (passwordErrorMsg) setPasswordErrorMsg(null);
                }}
                error={passwordErrors.confirmPassword}
                required
              />

              <div className="profile-form-actions">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={Lock}
                  loading={passwordLoading}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
