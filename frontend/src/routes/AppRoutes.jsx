import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from '../pages/Landing/Landing';
import RoleSelection from '../pages/RoleSelection/RoleSelection';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import Dashboard from '../pages/Dashboard/Dashboard';
import Profile from '../pages/Profile/Profile';
import ModuleView from '../pages/Modules/ModuleView';
import NotFound from '../pages/NotFound/NotFound';
import ProtectedRoute from '../components/routes/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public Full-Screen Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* 2. Public Role Selection Screen */}
      <Route path="/select-role" element={<RoleSelection />} />
      <Route path="/roles" element={<Navigate to="/select-role" replace />} />

      {/* 3. Role-Specific Login & Patient Register */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 4. Primary Dashboard & Profile (All Authenticated Roles) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* 5. Role-Protected Healthcare Modules */}
      {/* Patients Registry: Doctor & Admin only */}
      <Route
        path="/patients"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
            <ModuleView />
          </ProtectedRoute>
        }
      />

      {/* Doctors Roster / Directory: Doctor, Patient, Admin */}
      <Route
        path="/doctors"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR', 'PATIENT', 'ADMIN']}>
            <ModuleView />
          </ProtectedRoute>
        }
      />

      {/* Appointments: Doctor, Patient, Admin */}
      <Route
        path="/appointments"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR', 'PATIENT', 'ADMIN']}>
            <ModuleView />
          </ProtectedRoute>
        }
      />

      {/* Medical Records (EMR): Doctor, Patient, Admin */}
      <Route
        path="/medical-records"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR', 'PATIENT', 'ADMIN']}>
            <ModuleView />
          </ProtectedRoute>
        }
      />

      {/* Clinical Notes (SOAP Progress Notes): Doctor, Patient, Admin */}
      <Route
        path="/clinical-notes"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN', 'PATIENT']}>
            <ModuleView />
          </ProtectedRoute>
        }
      />

      {/* Prescriptions: Doctor, Patient, Admin */}
      <Route
        path="/prescriptions"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR', 'PATIENT', 'ADMIN']}>
            <ModuleView />
          </ProtectedRoute>
        }
      />

      {/* Data Exchange (HIE Gateway): Doctor, Patient, Admin */}
      <Route
        path="/data-exchange"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN', 'PATIENT']}>
            <ModuleView />
          </ProtectedRoute>
        }
      />

      {/* Hospital Analytics & Telemetry: Doctor & Admin */}
      <Route
        path="/analytics"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
            <ModuleView />
          </ProtectedRoute>
        }
      />

      {/* System Settings & Governance / Audit: Admin only */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ModuleView />
          </ProtectedRoute>
        }
      />

      {/* 6. Legacy sub-routes redirection */}
      <Route path="/dashboard/patients" element={<Navigate to="/patients" replace />} />
      <Route path="/dashboard/doctors" element={<Navigate to="/doctors" replace />} />
      <Route path="/dashboard/appointments" element={<Navigate to="/appointments" replace />} />
      <Route path="/dashboard/records" element={<Navigate to="/medical-records" replace />} />
      <Route path="/dashboard/clinical-notes" element={<Navigate to="/clinical-notes" replace />} />
      <Route path="/dashboard/prescriptions" element={<Navigate to="/prescriptions" replace />} />
      <Route path="/dashboard/exchange" element={<Navigate to="/data-exchange" replace />} />
      <Route path="/dashboard/analytics" element={<Navigate to="/analytics" replace />} />
      <Route path="/dashboard/settings" element={<Navigate to="/settings" replace />} />

      {/* 7. 404 Fallback */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
