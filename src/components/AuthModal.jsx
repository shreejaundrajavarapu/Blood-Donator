import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Building2,
  Droplet,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  Copy,
  LogIn,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function AuthModal() {
  const {
    authModal,
    setAuthModal,
    authInitialRole,
    setAuthInitialRole,
    login,
    registerHospital,
    registerBloodBank,
    registerDonor,
    generatedCredentialsModal,
    setGeneratedCredentialsModal,
    addToast
  } = useApp();

  const [mode, setMode] = useState(authModal || 'login'); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState(authInitialRole || 'hospital');

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Hospital form state
  const [hospitalForm, setHospitalForm] = useState({
    name: '',
    type: 'Multi-Specialty Hospital',
    location: 'Vijayawada',
    address: '',
    contact: '',
    email: '',
    licenseNumber: ''
  });

  // Blood Bank form state
  const [bloodBankForm, setBloodBankForm] = useState({
    name: '',
    location: 'Vijayawada',
    address: '',
    contact: '',
    email: '',
    licenseNumber: ''
  });

  // Donor form state
  const [donorForm, setDonorForm] = useState({
    name: '',
    phone: '',
    email: '',
    age: '25',
    bloodGroup: 'O+',
    location: 'Vijayawada',
    availability: 'Available',
    lastDonationDate: ''
  });

  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);

  // ─── Phone Validation ───────────────────────────────────────────────────────
  // Valid Indian mobile: exactly 10 digits, first digit 6–9
  const PHONE_REGEX = /^[6-9][0-9]{9}$/;
  const validatePhone = (val) => PHONE_REGEX.test(val.trim());

  const [hospitalPhoneError, setHospitalPhoneError] = useState('');
  const [bloodBankPhoneError, setBloodBankPhoneError] = useState('');
  const [donorPhoneError, setDonorPhoneError] = useState('');

  if (!authModal && !generatedCredentialsModal) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginId.trim() || !password.trim()) {
      setLoginError('Please enter both Login ID/Username and Password.');
      return;
    }

    const res = login(selectedRole, loginId, password);
    if (!res.success) {
      setLoginError(res.message || 'Login failed.');
    }
  };

  const handleHospitalSubmit = (e) => {
    e.preventDefault();
    if (!hospitalForm.name || !hospitalForm.contact || !hospitalForm.email || !hospitalForm.licenseNumber) {
      alert('Please fill out all required hospital details.');
      return;
    }
    if (!validatePhone(hospitalForm.contact)) {
      setHospitalPhoneError('Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }
    registerHospital(hospitalForm);
    setRegistrationSubmitted(true);
  };

  const handleBloodBankSubmit = (e) => {
    e.preventDefault();
    if (!bloodBankForm.name || !bloodBankForm.contact || !bloodBankForm.email || !bloodBankForm.licenseNumber) {
      alert('Please fill out all required blood bank details.');
      return;
    }
    if (!validatePhone(bloodBankForm.contact)) {
      setBloodBankPhoneError('Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }
    registerBloodBank(bloodBankForm);
    setRegistrationSubmitted(true);
  };

  const handleDonorSubmit = (e) => {
    e.preventDefault();
    if (!donorForm.name || !donorForm.phone || !donorForm.location || !donorForm.bloodGroup) {
      alert('Please fill out all required donor details.');
      return;
    }
    if (!validatePhone(donorForm.phone)) {
      setDonorPhoneError('Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }
    registerDonor(donorForm);
    setRegistrationSubmitted(true);
  };

  // Render Simulated Generated Credentials Modal (Step 4 & 5 demo helper)
  if (generatedCredentialsModal) {
    const { name, role, email, uniqueId, password } = generatedCredentialsModal;

    return (
      <div className="modal-backdrop">
        <div className="modal-card" style={{ maxWidth: '520px' }}>
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 color="#16a34a" size={24} />
              <h3 className="modal-title">Account Approved & Credentials Generated</h3>
            </div>
            <button onClick={() => setGeneratedCredentialsModal(null)}>
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Admin has verified and approved <strong>{name}</strong>. The system has generated account login credentials for <strong>{email}</strong>:
            </p>

            <div className="credentials-alert-card">
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginBottom: '8px' }}>
                Account Credentials
              </div>
              <div className="credentials-row">
                <span style={{ color: '#64748b' }}>Generated Unique ID:</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{uniqueId}</span>
              </div>
              <div className="credentials-row">
                <span style={{ color: '#64748b' }}>Generated Password:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{password}</span>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '12px' }}>
              The {role} can now log into their dedicated dashboard using this Unique ID and password.
            </p>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                navigator.clipboard.writeText(`ID: ${uniqueId} | Password: ${password}`);
                addToast('Credentials copied to clipboard!', 'info');
              }}
            >
              <Copy size={14} />
              <span>Copy Credentials</span>
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setGeneratedCredentialsModal(null);
                setAuthModal('login');
                setSelectedRole(role);
                setLoginId(uniqueId);
                setPassword(password);
                login(role, uniqueId, password);
              }}
            >
              <LogIn size={14} />
              <span>Instant Login as {name}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-card-lg" style={{ padding: 0 }}>
        <div className="auth-split-wrapper">
          {/* LEFT: FORM SIDE */}
          <div className="auth-form-side">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="brand-logo-icon" style={{ width: '28px', height: '28px' }}>
                  <Droplet size={16} fill="#ffffff" />
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                  Blood<span style={{ color: 'var(--primary)' }}>Connect</span>
                </span>
              </div>
              <button onClick={() => setAuthModal(null)} title="Close">
                <X size={20} color="#94a3b8" />
              </button>
            </div>

            {registrationSubmitted ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#f0fdf4',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Registration Submitted!</h3>
                <div className="badge badge-pending" style={{ marginBottom: '14px' }}>
                  Account Status: Pending Verification
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
                  Your account registration has been saved and is currently waiting for Admin verification.
                  Once approved by Admin, your generated credentials will be authorized.
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setRegistrationSubmitted(false);
                      setAuthModal(null);
                    }}
                  >
                    Done
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setRegistrationSubmitted(false);
                      setMode('login');
                    }}
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                    {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {mode === 'login'
                      ? 'Select your platform role to sign in'
                      : 'Choose your role to get started'}
                  </p>
                </div>

                {/* ROLE SELECTION CARDS (from Reference Design) */}
                <div className="role-picker-grid">
                  <div
                    className={`role-picker-card ${selectedRole === 'hospital' ? 'selected' : ''}`}
                    onClick={() => setSelectedRole('hospital')}
                  >
                    <div className="role-radio-indicator" />
                    <Building2
                      size={20}
                      color={selectedRole === 'hospital' ? 'var(--primary)' : '#64748b'}
                      style={{ marginBottom: '6px' }}
                    />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Hospital</span>
                  </div>

                  <div
                    className={`role-picker-card ${selectedRole === 'donor' ? 'selected' : ''}`}
                    onClick={() => setSelectedRole('donor')}
                  >
                    <div className="role-radio-indicator" />
                    <Droplet
                      size={20}
                      color={selectedRole === 'donor' ? 'var(--primary)' : '#64748b'}
                      style={{ marginBottom: '6px' }}
                    />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Donor</span>
                  </div>

                  <div
                    className={`role-picker-card ${selectedRole === 'bloodbank' ? 'selected' : ''}`}
                    onClick={() => setSelectedRole('bloodbank')}
                  >
                    <div className="role-radio-indicator" />
                    <HeartHandshake
                      size={20}
                      color={selectedRole === 'bloodbank' ? 'var(--primary)' : '#64748b'}
                      style={{ marginBottom: '6px' }}
                    />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Blood Bank</span>
                  </div>

                  <div
                    className={`role-picker-card ${selectedRole === 'admin' ? 'selected' : ''}`}
                    onClick={() => setSelectedRole('admin')}
                  >
                    <div className="role-radio-indicator" />
                    <ShieldCheck
                      size={20}
                      color={selectedRole === 'admin' ? 'var(--primary)' : '#64748b'}
                      style={{ marginBottom: '6px' }}
                    />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Admin</span>
                  </div>
                </div>

                {/* LOGIN FORM */}
                {mode === 'login' && (
                  <form onSubmit={handleLoginSubmit}>
                    {loginError && (
                      <div
                        style={{
                          padding: '10px 14px',
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '8px',
                          fontSize: '0.825rem',
                          color: '#b91c1c',
                          marginBottom: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <AlertCircle size={16} />
                        <span>{loginError}</span>
                      </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label className="form-label">
                        {selectedRole === 'admin'
                          ? 'Admin ID / Username'
                          : selectedRole === 'hospital'
                          ? 'Hospital Unique ID / Email'
                          : selectedRole === 'bloodbank'
                          ? 'Blood Bank Unique ID / Email'
                          : 'Donor ID / Phone / Email'}
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={
                          selectedRole === 'admin'
                            ? 'e.g. admin'
                            : selectedRole === 'hospital'
                            ? 'e.g. HOSP-2026-001'
                            : selectedRole === 'bloodbank'
                            ? 'e.g. BB-2026-001'
                            : 'e.g. DONOR-001'
                        }
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label className="form-label">Password</label>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer' }}>
                          Forgot password?
                        </span>
                      </div>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '14px' }}>
                      <LogIn size={16} />
                      <span>Sign In as {selectedRole.toUpperCase()}</span>
                    </button>

                    <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
                      {selectedRole !== 'admin' ? (
                        <span>
                          Don't have an account?{' '}
                          <button
                            type="button"
                            onClick={() => setMode('register')}
                            style={{ color: 'var(--primary)', fontWeight: 700 }}
                          >
                            Register
                          </button>
                        </span>
                      ) : (
                        <span>Admin accounts are pre-configured for security.</span>
                      )}
                    </div>
                  </form>
                )}

                {/* REGISTRATION FORMS */}
                {mode === 'register' && (
                  <div>
                    {selectedRole === 'admin' ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                        <ShieldCheck size={36} color="var(--primary)" style={{ margin: '0 auto 10px' }} />
                        <p style={{ fontSize: '0.9rem' }}>
                          Admin registration is restricted. Please sign in with pre-authorized admin credentials.
                        </p>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ marginTop: '14px' }}
                          onClick={() => {
                            setMode('login');
                            setSelectedRole('admin');
                          }}
                        >
                          Go to Admin Login
                        </button>
                      </div>
                    ) : selectedRole === 'hospital' ? (
                      /* HOSPITAL REGISTRATION FORM */
                      <form onSubmit={handleHospitalSubmit} className="form-grid">
                        <div className="form-group col-span-2">
                          <label className="form-label">
                            Hospital Name <span className="req">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Metro Care Super Specialty"
                            value={hospitalForm.name}
                            onChange={(e) => setHospitalForm({ ...hospitalForm, name: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Hospital Type</label>
                          <select
                            className="form-select"
                            value={hospitalForm.type}
                            onChange={(e) => setHospitalForm({ ...hospitalForm, type: e.target.value })}
                          >
                            <option value="Multi-Specialty Hospital">Multi-Specialty Hospital</option>
                            <option value="Government General Hospital">Government General Hospital</option>
                            <option value="Trauma & Critical Care Center">Trauma & Critical Care Center</option>
                            <option value="Speciality Clinic">Speciality Clinic</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            City / Location <span className="req">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Vijayawada"
                            value={hospitalForm.location}
                            onChange={(e) => setHospitalForm({ ...hospitalForm, location: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group col-span-2">
                          <label className="form-label">Address</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Street, Landmark, City"
                            value={hospitalForm.address}
                            onChange={(e) => setHospitalForm({ ...hospitalForm, address: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Official Contact Number <span className="req">*</span>
                          </label>
                          <input
                            type="tel"
                            className="form-input"
                            placeholder="e.g. 9876543210"
                            value={hospitalForm.contact}
                            onChange={(e) => {
                              const val = e.target.value;
                              setHospitalForm({ ...hospitalForm, contact: val });
                              if (val.length > 0) {
                                setHospitalPhoneError(
                                  validatePhone(val) ? '' : 'Enter a valid 10-digit Indian mobile number (6–9 start).'
                                );
                              } else {
                                setHospitalPhoneError('');
                              }
                            }}
                            required
                          />
                          {hospitalPhoneError && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', fontSize: '0.78rem', color: '#b91c1c' }}>
                              <AlertCircle size={13} />
                              <span>{hospitalPhoneError}</span>
                            </div>
                          )}
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Official Email <span className="req">*</span>
                          </label>
                          <input
                            type="email"
                            className="form-input"
                            placeholder="contact@hospital.org"
                            value={hospitalForm.email}
                            onChange={(e) => setHospitalForm({ ...hospitalForm, email: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group col-span-2">
                          <label className="form-label">
                            Hospital License / Reg Number <span className="req">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. LIC-AP-2026-1088"
                            value={hospitalForm.licenseNumber}
                            onChange={(e) => setHospitalForm({ ...hospitalForm, licenseNumber: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group col-span-2" style={{ marginTop: '10px' }}>
                          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Submit Hospital Registration
                          </button>
                        </div>
                      </form>
                    ) : selectedRole === 'bloodbank' ? (
                      /* BLOOD BANK REGISTRATION FORM */
                      <form onSubmit={handleBloodBankSubmit} className="form-grid">
                        <div className="form-group col-span-2">
                          <div
                            style={{
                              padding: '8px 12px',
                              background: '#fffbeb',
                              border: '1px solid #fde68a',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              color: '#92400e',
                              marginBottom: '6px'
                            }}
                          >
                            <strong>Coordination Role:</strong> Blood Banks on BloodConnect help coordinate and connect
                            hospitals and donors. No inventory or stock management.
                          </div>
                        </div>

                        <div className="form-group col-span-2">
                          <label className="form-label">
                            Blood Bank Name <span className="req">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. LifeBridge Coordination Bank"
                            value={bloodBankForm.name}
                            onChange={(e) => setBloodBankForm({ ...bloodBankForm, name: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            City / Location <span className="req">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Vijayawada"
                            value={bloodBankForm.location}
                            onChange={(e) => setBloodBankForm({ ...bloodBankForm, location: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Official Contact <span className="req">*</span>
                          </label>
                          <input
                            type="tel"
                            className="form-input"
                            placeholder="e.g. 9876543210"
                            value={bloodBankForm.contact}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBloodBankForm({ ...bloodBankForm, contact: val });
                              if (val.length > 0) {
                                setBloodBankPhoneError(
                                  validatePhone(val) ? '' : 'Enter a valid 10-digit Indian mobile number (6–9 start).'
                                );
                              } else {
                                setBloodBankPhoneError('');
                              }
                            }}
                            required
                          />
                          {bloodBankPhoneError && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', fontSize: '0.78rem', color: '#b91c1c' }}>
                              <AlertCircle size={13} />
                              <span>{bloodBankPhoneError}</span>
                            </div>
                          )}
                        </div>

                        <div className="form-group col-span-2">
                          <label className="form-label">
                            Official Email <span className="req">*</span>
                          </label>
                          <input
                            type="email"
                            className="form-input"
                            placeholder="coordinator@bloodbank.org"
                            value={bloodBankForm.email}
                            onChange={(e) => setBloodBankForm({ ...bloodBankForm, email: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group col-span-2">
                          <label className="form-label">
                            Blood Bank License Number <span className="req">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. BB-LIC-AP-5520"
                            value={bloodBankForm.licenseNumber}
                            onChange={(e) => setBloodBankForm({ ...bloodBankForm, licenseNumber: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group col-span-2" style={{ marginTop: '10px' }}>
                          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Submit Blood Bank Registration
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* DONOR REGISTRATION FORM */
                      <form onSubmit={handleDonorSubmit} className="form-grid">
                        <div className="form-group col-span-2">
                          <label className="form-label">
                            Full Name <span className="req">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Ramesh Chandra"
                            value={donorForm.name}
                            onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Blood Group <span className="req">*</span>
                          </label>
                          <select
                            className="form-select"
                            value={donorForm.bloodGroup}
                            onChange={(e) => setDonorForm({ ...donorForm, bloodGroup: e.target.value })}
                            required
                          >
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Age <span className="req">*</span>
                          </label>
                          <input
                            type="number"
                            min="18"
                            max="65"
                            className="form-input"
                            value={donorForm.age}
                            onChange={(e) => setDonorForm({ ...donorForm, age: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Phone Number <span className="req">*</span>
                          </label>
                          <input
                            type="tel"
                            className="form-input"
                            placeholder="e.g. 9876543210"
                            value={donorForm.phone}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDonorForm({ ...donorForm, phone: val });
                              if (val.length > 0) {
                                setDonorPhoneError(
                                  validatePhone(val) ? '' : 'Enter a valid 10-digit Indian mobile number (6–9 start).'
                                );
                              } else {
                                setDonorPhoneError('');
                              }
                            }}
                            required
                          />
                          {donorPhoneError && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', fontSize: '0.78rem', color: '#b91c1c' }}>
                              <AlertCircle size={13} />
                              <span>{donorPhoneError}</span>
                            </div>
                          )}
                        </div>

                        <div className="form-group">
                          <label className="form-label">Email (Optional)</label>
                          <input
                            type="email"
                            className="form-input"
                            placeholder="donor@example.com"
                            value={donorForm.email}
                            onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            City / Location <span className="req">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Vijayawada"
                            value={donorForm.location}
                            onChange={(e) => setDonorForm({ ...donorForm, location: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Availability Status</label>
                          <select
                            className="form-select"
                            value={donorForm.availability}
                            onChange={(e) => setDonorForm({ ...donorForm, availability: e.target.value })}
                          >
                            <option value="Available">Available to Donate</option>
                            <option value="Unavailable">Temporarily Unavailable</option>
                            <option value="Busy">Busy / On Call Only</option>
                          </select>
                        </div>

                        <div className="form-group col-span-2">
                          <label className="form-label">Last Donation Date</label>
                          <input
                            type="date"
                            className="form-input"
                            value={donorForm.lastDonationDate}
                            onChange={(e) => setDonorForm({ ...donorForm, lastDonationDate: e.target.value })}
                          />
                        </div>

                        <div className="form-group col-span-2" style={{ marginTop: '10px' }}>
                          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Register as Blood Donor
                          </button>
                        </div>
                      </form>
                    )}

                    <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '16px' }}>
                      Already registered?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        style={{ color: 'var(--primary)', fontWeight: 700 }}
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT: PHOTO / BRANDING SIDE (Matching Reference Image) */}
          <div className="auth-visual-side">
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  marginBottom: '16px'
                }}
              >
                <Droplet size={14} fill="#ffffff" />
                <span>Every Drop Matters</span>
              </div>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 800, lineHeight: 1.2, color: '#ffffff', marginBottom: '14px' }}>
                Together we can save lives.
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6 }}>
                Your quick action connects critical hospital requests with volunteer blood donors in your area.
              </p>
            </div>

            <div
              style={{
                position: 'relative',
                zIndex: 2,
                background: 'rgba(0, 0, 0, 0.2)',
                padding: '18px 20px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <div style={{ fontSize: '0.825rem', fontWeight: 700, marginBottom: '6px' }}>
                Secure Access Platform:
              </div>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                All hospital, blood bank, and donor registrations are verified prior to activating dashboard permissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
