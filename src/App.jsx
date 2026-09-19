import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import ToastContainer from './components/ToastContainer';

import HospitalDashboard from './components/hospital/HospitalDashboard';
import DonorDashboard from './components/donor/DonorDashboard';
import BloodBankDashboard from './components/bloodbank/BloodBankDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

import { ShieldAlert, LogOut, Home, Clock } from 'lucide-react';

function AppContent() {
  const { currentUser, currentView, setCurrentView, logout, dataLoaded } = useApp();

  // If viewing landing page or no user logged in
  if (currentView === 'landing' || !currentUser) {
    return (
      <div className="app-container">
        <Navbar />
        <LandingPage />
        <AuthModal />
        <ToastContainer />
      </div>
    );
  }

  // Access control check: Check if user's account is Pending or Blocked
  if (currentUser.status === 'Pending Verification') {
    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div className="modal-card" style={{ maxWidth: '480px', textAlign: 'center', padding: '40px 30px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#fffbeb',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <Clock size={36} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
              Account Pending Verification
            </h3>
            <span className="badge badge-pending" style={{ marginBottom: '16px' }}>
              Status: PENDING ADMIN REVIEW
            </span>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', marginBottom: '24px' }}>
              Your account <strong>{currentUser.name}</strong> ({currentUser.role}) has been submitted
              successfully. Admin verification is required before you can access the dashboard.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-outline btn-sm" onClick={logout}>
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setCurrentView('landing')}>
                <Home size={14} />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  if (currentUser.status === 'Blocked' || currentUser.status === 'Rejected') {
    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div className="modal-card" style={{ maxWidth: '480px', textAlign: 'center', padding: '40px 30px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <ShieldAlert size={36} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
              Access Suspended
            </h3>
            <span className="badge badge-rejected" style={{ marginBottom: '16px' }}>
              Status: {currentUser.status.toUpperCase()}
            </span>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', marginBottom: '24px' }}>
              This account has been deactivated or rejected by the platform administrator.
            </p>
            <button className="btn btn-primary btn-sm" onClick={logout}>
              Sign Out
            </button>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  // Role-Based Router
  return (
    <div className="app-container">
      {currentUser.role === 'hospital' && <HospitalDashboard />}
      {currentUser.role === 'donor' && <DonorDashboard />}
      {currentUser.role === 'bloodbank' && <BloodBankDashboard />}
      {currentUser.role === 'admin' && <AdminDashboard />}

      <AuthModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
