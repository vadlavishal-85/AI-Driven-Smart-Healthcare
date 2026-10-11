import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminDoctorsPage from './pages/admin/AdminDoctorsPage';
import AdminPatientsPage from './pages/admin/AdminPatientsPage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';
import AdminAccessLogsPage from './pages/admin/AdminAccessLogsPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorPatientsPage from './pages/doctor/DoctorPatientsPage';
import DoctorAppointmentsPage from './pages/doctor/DoctorAppointmentsPage';
import DoctorRecordsPage from './pages/doctor/DoctorRecordsPage';
import DoctorPrescriptionsPage from './pages/doctor/DoctorPrescriptionsPage';
import DoctorNotesPage from './pages/doctor/DoctorNotesPage';
import DoctorDataSharingPage from './pages/doctor/DoctorDataSharingPage';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointmentsPage from './pages/patient/PatientAppointmentsPage';
import PatientRecordsPage from './pages/patient/PatientRecordsPage';
import PatientPrescriptionsPage from './pages/patient/PatientPrescriptionsPage';
import PatientSharedRecordsPage from './pages/patient/PatientSharedRecordsPage';
import PatientLabReportsPage from './pages/patient/PatientLabReportsPage';
import PatientProfilePage from './pages/patient/PatientProfilePage';

// Lab Pages
import LabDashboard from './pages/lab/LabDashboard';
import LabReportsPage from './pages/lab/LabReportsPage';
import LabProfilePage from './pages/lab/LabProfilePage';

// Shared Notification Page
import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Landing & Authentication */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/patient/login" element={<LoginPage roleHint="PATIENT" />} />
          <Route path="/doctor/login" element={<LoginPage roleHint="DOCTOR" />} />
          <Route path="/admin/login" element={<LoginPage roleHint="ADMIN" />} />
          <Route path="/lab/login" element={<LoginPage roleHint="LAB" />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/doctors" element={<AdminDoctorsPage />} />
            <Route path="/admin/patients" element={<AdminPatientsPage />} />
            <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
            <Route path="/admin/analytics" element={<AdminDashboard />} />
            <Route path="/admin/access-logs" element={<AdminAccessLogsPage />} />
            <Route path="/admin/notifications" element={<NotificationsPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
          </Route>

          {/* Protected Doctor Routes */}
          <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/patients" element={<DoctorPatientsPage />} />
            <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
            <Route path="/doctor/medical-records" element={<DoctorRecordsPage />} />
            <Route path="/doctor/prescriptions" element={<DoctorPrescriptionsPage />} />
            <Route path="/doctor/notes" element={<DoctorNotesPage />} />
            <Route path="/doctor/doctor-notes" element={<DoctorNotesPage />} />
            <Route path="/doctor/data-sharing" element={<DoctorDataSharingPage />} />
            <Route path="/doctor/notifications" element={<NotificationsPage />} />
            <Route path="/doctor/profile" element={<DoctorProfilePage />} />
          </Route>

          {/* Protected Patient Routes */}
          <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
            <Route path="/patient/medical-records" element={<PatientRecordsPage />} />
            <Route path="/patient/prescriptions" element={<PatientPrescriptionsPage />} />
            <Route path="/patient/shared-records" element={<PatientSharedRecordsPage />} />
            <Route path="/patient/lab-reports" element={<PatientLabReportsPage />} />
            <Route path="/patient/notifications" element={<NotificationsPage />} />
            <Route path="/patient/profile" element={<PatientProfilePage />} />
          </Route>

          {/* Protected Lab Routes */}
          <Route element={<ProtectedRoute allowedRoles={['LAB']} />}>
            <Route path="/lab/dashboard" element={<LabDashboard />} />
            <Route path="/lab/reports" element={<LabReportsPage />} />
            <Route path="/lab/notifications" element={<NotificationsPage />} />
            <Route path="/lab/profile" element={<LabProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
