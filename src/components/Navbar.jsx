import React from 'react';
import { useApp } from '../context/AppContext';
import { Droplet, ArrowRight, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { currentUser, setCurrentView, setAuthModal, setAuthInitialRole, logout } = useApp();

  const handleOpenLogin = (role = 'hospital') => {
    setAuthInitialRole(role);
    setAuthModal('login');
  };

  const handleOpenRegister = (role = 'hospital') => {
    setAuthInitialRole(role);
    setAuthModal('register');
  };

  return (
    <header className="landing-header">
      <div className="landing-header-container">
        <div
          className="brand-logo"
          style={{ cursor: 'pointer' }}
          onClick={() => setCurrentView('landing')}
        >
          <div className="brand-logo-icon">
            <Droplet size={20} fill="#ffffff" />
          </div>
          <div>
            <span style={{ color: 'var(--text-main)' }}>Blood</span>
            <span style={{ color: 'var(--primary)' }}>Connect</span>
            <span
              style={{
                fontSize: '0.65rem',
                display: 'block',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginTop: '-2px'
              }}
            >
              Donor Discovery Platform
            </span>
          </div>
        </div>

        <nav className="landing-nav-links">
          <a href="#how-it-works" className="landing-nav-link">
            How It Works
          </a>
          <a href="#roles" className="landing-nav-link">
            Platform Roles
          </a>
          <a href="#features" className="landing-nav-link">
            Why BloodConnect
          </a>
          <a href="#about" className="landing-nav-link">
            About
          </a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setCurrentView('dashboard')}
              >
                <LayoutDashboard size={16} />
                <span>Go to Dashboard</span>
              </button>
              <button className="btn btn-outline btn-sm" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleOpenLogin('hospital')}
              >
                <LogIn size={15} />
                <span>Login</span>
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleOpenRegister('donor')}
              >
                <UserPlus size={15} />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
