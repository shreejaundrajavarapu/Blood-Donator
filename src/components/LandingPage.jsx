import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Droplet,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  GitPullRequest,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  HeartHandshake,
  Activity,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const { setAuthModal, setAuthInitialRole } = useApp();

  const handleOpenAuth = (mode, role) => {
    setAuthInitialRole(role);
    setAuthModal(mode);
  };

  return (
    <div className="landing-page-root">
      {/* HERO SECTION */}
      <section className="landing-hero">
        <div className="hero-left-col">
          <div className="hero-pill-badge">
            <Activity size={14} />
            <span>Emergency Blood Resource Coordination</span>
          </div>

          <h1 className="hero-title">
            WHEN EVERY DROP MATTERS, <span>EVERY DECISION</span> COUNTS.
          </h1>

          <p className="hero-desc">
            An intelligent emergency blood-donor discovery platform. We connect hospitals
            directly with verified, compatible blood donors based on required blood group and
            real-time location within minutes.
          </p>

          <div className="hero-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => handleOpenAuth('login', 'hospital')}
            >
              <span>Find a Donor Now</span>
              <ArrowRight size={18} />
            </button>

            <button
              className="btn btn-outline btn-lg"
              onClick={() => handleOpenAuth('register', 'donor')}
            >
              <HeartHandshake size={18} color="var(--primary)" />
              <span>Become a Donor</span>
            </button>
          </div>

          <div className="hero-statement-banner">
            <Droplet size={20} color="var(--primary)" fill="var(--primary-subtle)" style={{ flexShrink: 0 }} />
            <span>
              We don't just <strong>FIND</strong> blood donors. We help <strong>CONNECT</strong>{' '}
              hospitals with verified compatible donors when every second matters.
            </span>
          </div>
        </div>

        {/* HERO RIGHT: Interactive Reference Flow Diagram */}
        <div className="hero-diagram-card">
          <div className="diagram-header">
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Donor Discovery Pipeline</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Real-time matching workflow
              </p>
            </div>
            <span className="badge badge-emergency">
              <span className="pulse-dot"></span> Live Matching
            </span>
          </div>

          <div className="diagram-step-list">
            <div className="diagram-step-item active">
              <div className="diagram-step-dot">1</div>
              <Building2 size={16} />
              <div style={{ flex: 1 }}>
                <span>Hospital Request</span>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 500 }}>
                  Blood Group & Location specified
                </span>
              </div>
            </div>

            <div className="diagram-step-item active">
              <div className="diagram-step-dot">2</div>
              <Activity size={16} />
              <div style={{ flex: 1 }}>
                <span>Unique Token Generated</span>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 500 }}>
                  e.g. BDR-2026-000124
                </span>
              </div>
            </div>

            <div className="diagram-step-item active">
              <div className="diagram-step-dot">3</div>
              <GitPullRequest size={16} />
              <div style={{ flex: 1 }}>
                <span>Compatibility & Location Search</span>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Filters approved & available donors
                </span>
              </div>
            </div>

            <div className="diagram-step-item">
              <div className="diagram-step-dot">4</div>
              <Users size={16} />
              <div style={{ flex: 1 }}>
                <span>Donor Direct Alert</span>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                  Real-time notification dispatched
                </span>
              </div>
            </div>

            <div className="diagram-step-item">
              <div className="diagram-step-dot">5</div>
              <CheckCircle2 size={16} />
              <div style={{ flex: 1 }}>
                <span>Donor Acceptance</span>
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                  Hospital receives contact details
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MANDATORY SCOPE RESTRICTION BANNER */}
      <div style={{ padding: '0 24px' }}>
        <div className="scope-restriction-banner">
          <AlertTriangle size={24} style={{ flexShrink: 0 }} />
          <div>
            <strong>Scope Notice:</strong> BloodConnect is an emergency donor discovery and hospital-donor
            connection platform. This prototype <strong>only</strong> facilitates finding and connecting with suitable
            registered donors. It does <strong>not</strong> manage blood stock, blood units, or blood bank inventory.
          </div>
        </div>
      </div>

      {/* 4 FEATURE HIGHLIGHTS */}
      <section id="features" className="landing-features-section">
        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-icon-box">
              <Activity size={22} />
            </div>
            <h4>Real-time Requests</h4>
            <p>
              Hospitals generate immediate request tokens that notify matching donors within seconds.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-box">
              <GitPullRequest size={22} />
            </div>
            <h4>Smart Matching</h4>
            <p>
              Precise pairing based strictly on blood group compatibility, city/area, and donor availability.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-box">
              <HeartHandshake size={22} />
            </div>
            <h4>Better Coordination</h4>
            <p>
              Blood banks serve as coordinators to bridge communication gaps and expedite donor connection.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-box">
              <ShieldCheck size={22} />
            </div>
            <h4>Admin Verified</h4>
            <p>
              Every hospital, blood bank, and donor profile is formally verified by admins prior to matching.
            </p>
          </div>
        </div>
      </section>

      {/* PLATFORM ROLES SECTION */}
      <section id="roles" className="roles-section">
        <div className="roles-container">
          <div className="section-header">
            <div className="section-tag">Role-Based Platform</div>
            <h2 className="section-title">Designed for Every Stakeholder</h2>
            <p className="section-subtitle">
              Dedicated, permission-controlled dashboards tailored to each participant in the life-saving chain.
            </p>
          </div>

          <div className="roles-grid">
            {/* Hospital Card */}
            <div className="role-card">
              <div>
                <div className="role-card-icon">
                  <Building2 size={26} />
                </div>
                <h3>Hospital</h3>
                <p>
                  Create blood requests with auto-generated tokens, view matched donors, review responses, and directly contact accepted donors.
                </p>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleOpenAuth('login', 'hospital')}
              >
                <span>Hospital Portal</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Donor Card */}
            <div className="role-card">
              <div>
                <div className="role-card-icon">
                  <Droplet size={26} />
                </div>
                <h3>Donor</h3>
                <p>
                  Register your blood group, city and live availability. Receive tailored emergency requests and accept or decline in one click.
                </p>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleOpenAuth('login', 'donor')}
              >
                <span>Donor Portal</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Blood Bank Card */}
            <div className="role-card">
              <div>
                <div className="role-card-icon">
                  <HeartHandshake size={26} />
                </div>
                <h3>Blood Bank</h3>
                <p>
                  Act as a coordination hub. Facilitate hospital-donor connections without managing blood stock or inventory.
                </p>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleOpenAuth('login', 'bloodbank')}
              >
                <span>Coordination Portal</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Admin Card */}
            <div className="role-card">
              <div>
                <div className="role-card-icon">
                  <ShieldCheck size={26} />
                </div>
                <h3>Admin</h3>
                <p>
                  Verify hospitals, blood banks, and donors. Generate secure access credentials and monitor live blood request tokens.
                </p>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleOpenAuth('login', 'admin')}
              >
                <span>Admin Portal</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (7 STEPS) */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-header">
          <div className="section-tag">Step-by-Step Workflow</div>
          <h2 className="section-title">How BloodConnect Works</h2>
          <p className="section-subtitle">
            From initial registration to bedside donation connection in 7 verified steps.
          </p>
        </div>

        <div className="workflow-steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h5>Hospital Registers</h5>
            <p>Submits license, contact details, and facility address.</p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h5>Admin Verifies</h5>
            <p>Admin inspects credentials and issues unique login access.</p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h5>Request Created</h5>
            <p>Hospital specifies blood group, urgency, and token is minted.</p>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <h5>System Matches</h5>
            <p>Engine filters approved donors matching blood group and city.</p>
          </div>

          <div className="step-card">
            <div className="step-number">5</div>
            <h5>Donors Alerted</h5>
            <p>Matching donors receive instant notification on their dashboard.</p>
          </div>

          <div className="step-card">
            <div className="step-number">6</div>
            <h5>Donor Responds</h5>
            <p>Donor reviews hospital details and accepts or declines.</p>
          </div>

          <div className="step-card">
            <div className="step-number">7</div>
            <h5>Hospital Contacts</h5>
            <p>Hospital receives phone/email to coordinate donation arrival.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="about" className="landing-footer">
        <div className="footer-container">
          <div className="footer-col">
            <div className="brand-logo" style={{ marginBottom: '14px' }}>
              <div className="brand-logo-icon">
                <Droplet size={20} fill="#ffffff" />
              </div>
              <div>
                <span>Blood</span>
                <span style={{ color: 'var(--primary)' }}>Connect</span>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', maxWidth: '320px' }}>
              A dedicated emergency blood donor discovery platform designed to save lives by bridging the gap between hospital demand and generous volunteer donors.
            </p>
          </div>

          <div className="footer-col">
            <h5>Navigation</h5>
            <ul>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#roles">Platform Roles</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About Platform</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Quick Access</h5>
            <ul>
              <li>
                <button onClick={() => handleOpenAuth('login', 'hospital')} style={{ color: 'inherit' }}>
                  Hospital Login
                </button>
              </li>
              <li>
                <button onClick={() => handleOpenAuth('login', 'donor')} style={{ color: 'inherit' }}>
                  Donor Login
                </button>
              </li>
              <li>
                <button onClick={() => handleOpenAuth('login', 'bloodbank')} style={{ color: 'inherit' }}>
                  Blood Bank Login
                </button>
              </li>
              <li>
                <button onClick={() => handleOpenAuth('login', 'admin')} style={{ color: 'inherit' }}>
                  Admin Login
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Contact & Support</h5>
            <ul>
              <li>National Emergency Helpline: 108</li>
              <li>Email: contact@bloodconnect.org</li>
              <li>Location: Vijayawada / National Hub</li>
              <li>Strictly No Blood Stock Inventory</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; 2026 BloodConnect Platform. All rights reserved.</span>
          <span>Emergency Blood Donor Finder &middot; Healthcare Platform</span>
        </div>
      </footer>
    </div>
  );
}
