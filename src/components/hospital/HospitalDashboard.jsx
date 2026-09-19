import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
  LogOut,
  ChevronRight,
  UserCheck,
  X,
  Sparkles,
  Check,
  Ban
} from 'lucide-react';

export default function HospitalDashboard() {
  const {
    currentUser,
    requests,
    responses,
    users,
    createBloodRequest,
    completeBloodRequest,
    cancelBloodRequest,
    logout,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'create' | 'requests' | 'responses' | 'profile'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Selected request for Donor Response View
  const [selectedRequestForResponses, setSelectedRequestForResponses] = useState(null);

  // Contact Donor Modal State
  const [contactModalDonor, setContactModalDonor] = useState(null);

  // New Request Form State
  const [requestForm, setRequestForm] = useState({
    patientNameOrId: '',
    bloodGroup: 'O+',
    donorsRequired: 1,
    requiredDate: 'Today (Immediate)',
    requiredTime: 'Within 2 Hours',
    donationLocation: `${currentUser?.name || 'Hospital'} Emergency Donor Ward`,
    urgency: 'Emergency',
    reason: '',
    instructions: ''
  });

  // Calculate Hospital Requests
  const hospitalRequests = requests.filter(
    (r) => r.hospitalId === currentUser?.id || r.hospitalName === currentUser?.name
  );

  // Calculate Metrics
  const activeCount = hospitalRequests.filter((r) => r.status === 'Pending' || r.status === 'Accepted').length;
  const pendingCount = hospitalRequests.filter((r) => r.status === 'Pending').length;
  const completedCount = hospitalRequests.filter((r) => r.status === 'Completed').length;

  // Total accepted donors for this hospital
  const hospitalRequestIds = hospitalRequests.map((r) => r.id);
  const acceptedResponses = responses.filter(
    (res) => hospitalRequestIds.includes(res.requestId) && res.status === 'Accepted'
  );

  // Matching Donors live preview for the form
  const potentialMatchingDonors = users.filter(
    (u) =>
      u.role === 'donor' &&
      u.status === 'Approved' &&
      u.availability === 'Available' &&
      u.bloodGroup.trim().toLowerCase() === requestForm.bloodGroup.trim().toLowerCase() &&
      u.location.trim().toLowerCase() === (currentUser?.location || '').trim().toLowerCase()
  );

  // Handle Create Request Submit
  const handleCreateRequestSubmit = (e) => {
    e.preventDefault();
    if (!requestForm.patientNameOrId.trim()) {
      alert('Please enter Patient Name or Patient ID.');
      return;
    }

    const created = createBloodRequest({
      ...requestForm,
      hospitalName: currentUser?.name,
      hospitalLocation: currentUser?.location,
      hospitalContact: currentUser?.contact
    });

    // Reset form and view requests
    setRequestForm({
      patientNameOrId: '',
      bloodGroup: 'O+',
      donorsRequired: 1,
      requiredDate: 'Today (Immediate)',
      requiredTime: 'Within 2 Hours',
      donationLocation: `${currentUser?.name} Emergency Donor Ward, ${currentUser?.location}`,
      urgency: 'Emergency',
      reason: '',
      instructions: ''
    });

    setActiveTab('requests');
  };

  // Filtered Requests
  const filteredRequests = hospitalRequests.filter((r) => {
    const matchesSearch =
      r.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.patientNameOrId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUrgency = filterUrgency === 'ALL' || r.urgency === filterUrgency;
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    return matchesSearch && matchesUrgency && matchesStatus;
  });

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="brand-logo">
            <div className="brand-logo-icon">
              <Building2 size={18} fill="#ffffff" />
            </div>
            <div>
              <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>Hospital Portal</span>
              <span
                style={{
                  fontSize: '0.68rem',
                  display: 'block',
                  color: 'var(--text-muted)',
                  fontWeight: 600
                }}
              >
                {currentUser?.name || 'Hospital'}
              </span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Clock size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <PlusCircle size={18} />
            <span>Create Blood Request</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <FileText size={18} />
            <span>My Requests</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'responses' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('responses');
              if (!selectedRequestForResponses && hospitalRequests.length > 0) {
                setSelectedRequestForResponses(hospitalRequests[0]);
              }
            }}
          >
            <Users size={18} />
            <span>Donor Responses</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <UserCheck size={18} />
            <span>Hospital Profile</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-nav-item" onClick={logout} style={{ color: '#ef4444' }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="dashboard-main">
        {/* TOPBAR */}
        <header className="dashboard-topbar">
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              {activeTab === 'overview' && 'Hospital Command Center'}
              {activeTab === 'create' && 'Create Emergency Blood Request'}
              {activeTab === 'requests' && 'Blood Request Registry'}
              {activeTab === 'responses' && 'Donor Responses & Contact View'}
              {activeTab === 'profile' && 'Hospital Profile & Verification'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Location: <strong>{currentUser?.location || 'Vijayawada'}</strong> &middot; License:{' '}
              {currentUser?.licenseNumber || 'LIC-AP-2024-8842'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setActiveTab('create')}
            >
              <PlusCircle size={15} />
              <span>Raise Request</span>
            </button>

            <div className="topbar-user-badge">
              <div className="user-avatar-circle">
                {currentUser?.name?.slice(0, 2).toUpperCase() || 'HP'}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{currentUser?.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  ID: {currentUser?.id}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* STATS OVERVIEW CARDS (Always visible or in overview) */}
          <div className="stats-cards-grid">
            <div className="stat-card">
              <div className="stat-info">
                <h3>{activeCount}</h3>
                <p>Active Requests</p>
              </div>
              <div className="stat-icon-wrapper stat-icon-red">
                <AlertTriangle size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>{pendingCount}</h3>
                <p>Pending Donor Match</p>
              </div>
              <div className="stat-icon-wrapper stat-icon-amber">
                <Clock size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>{acceptedResponses.length}</h3>
                <p>Accepted Donors</p>
              </div>
              <div className="stat-icon-wrapper stat-icon-green">
                <Users size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>{completedCount}</h3>
                <p>Completed Transfusions</p>
              </div>
              <div className="stat-icon-wrapper stat-icon-blue">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              {/* Quick Actions Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #b91c1c, #991b1b)',
                  borderRadius: '16px',
                  padding: '24px 28px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '28px',
                  boxShadow: 'var(--shadow-crimson)'
                }}
              >
                <div>
                  <span
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}
                  >
                    Immediate Donor Discovery
                  </span>
                  <h3 style={{ fontSize: '1.5rem', color: 'white', marginTop: '8px', marginBottom: '4px' }}>
                    Need Blood Donors for an Emergency?
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>
                    Create a request token to automatically search registered, approved donors matching your required blood group and city.
                  </p>
                </div>
                <button
                  className="btn btn-sm"
                  style={{ background: 'white', color: 'var(--primary)', fontWeight: 700, padding: '10px 20px' }}
                  onClick={() => setActiveTab('create')}
                >
                  <PlusCircle size={16} />
                  <span>Create Blood Request</span>
                </button>
              </div>

              {/* Recent Requests Table */}
              <div className="content-panel">
                <div className="panel-header">
                  <div>
                    <h3 className="panel-title">Recent Blood Requests</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Track live request tokens and donor responses
                    </p>
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setActiveTab('requests')}
                  >
                    View All ({hospitalRequests.length})
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Request Token</th>
                        <th>Patient ID / Name</th>
                        <th>Blood Group</th>
                        <th>Required Units</th>
                        <th>Urgency</th>
                        <th>Required When</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hospitalRequests.slice(0, 5).map((req) => (
                        <tr key={req.id}>
                          <td>
                            <span className="token-pill">{req.token}</span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{req.patientNameOrId}</td>
                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'var(--primary-light)',
                                color: 'var(--primary)',
                                fontWeight: 800
                              }}
                            >
                              {req.bloodGroup}
                            </span>
                          </td>
                          <td>{req.donorsRequired} Donor(s)</td>
                          <td>
                            <span
                              className={`badge ${
                                req.urgency === 'Emergency'
                                  ? 'badge-emergency pulse-emergency'
                                  : req.urgency === 'Critical'
                                  ? 'badge-critical'
                                  : 'badge-normal'
                              }`}
                            >
                              {req.urgency}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem' }}>
                            {req.requiredDate} &middot; {req.requiredTime}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                req.status === 'Accepted'
                                  ? 'badge-accepted'
                                  : req.status === 'Completed'
                                  ? 'badge-completed'
                                  : req.status === 'Cancelled'
                                  ? 'badge-cancelled'
                                  : 'badge-pending'
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                className="btn btn-outline btn-sm"
                                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                                onClick={() => {
                                  setSelectedRequestForResponses(req);
                                  setActiveTab('responses');
                                }}
                              >
                                View Responses
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE BLOOD REQUEST */}
          {activeTab === 'create' && (
            <div className="content-panel" style={{ maxWidth: '840px', margin: '0 auto 32px' }}>
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">New Blood Donor Request</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Fill in clinical requirements to automatically dispatch to matching registered donors.
                  </p>
                </div>
                <div className="badge badge-emergency">
                  <span className="pulse-dot" /> Live Matching Engine
                </div>
              </div>

              <div style={{ padding: '28px' }}>
                {/* Visual Token Preview Box */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                      Generated Token Preview
                    </div>
                    <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary)' }}>
                      BDR-2026-{String(requests.length + 102).padStart(6, '0')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                      Matching Donors in {currentUser?.location || 'Vijayawada'}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a' }}>
                      {potentialMatchingDonors.length} Available Donors Ready
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCreateRequestSubmit} className="form-grid">
                  {/* Auto-filled Hospital Fields */}
                  <div className="form-group">
                    <label className="form-label">Hospital Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={currentUser?.name || 'Hospital'}
                      disabled
                      style={{ background: '#f8fafc', color: '#64748b' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hospital Location</label>
                    <input
                      type="text"
                      className="form-input"
                      value={currentUser?.location || 'Vijayawada'}
                      disabled
                      style={{ background: '#f8fafc', color: '#64748b' }}
                    />
                  </div>

                  {/* Patient Info */}
                  <div className="form-group col-span-2">
                    <label className="form-label">
                      Patient Name or Patient ID <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. PT-9920 (Trauma ICU / Ward 4B)"
                      value={requestForm.patientNameOrId}
                      onChange={(e) => setRequestForm({ ...requestForm, patientNameOrId: e.target.value })}
                      required
                    />
                  </div>

                  {/* Blood Group & Units */}
                  <div className="form-group">
                    <label className="form-label">
                      Required Blood Group <span className="req">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={requestForm.bloodGroup}
                      onChange={(e) => setRequestForm({ ...requestForm, bloodGroup: e.target.value })}
                      required
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+ (Universal Donor / High Demand)</option>
                      <option value="O-">O- (Universal Red Cell)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Number of Donors Required <span className="req">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="form-input"
                      value={requestForm.donorsRequired}
                      onChange={(e) => setRequestForm({ ...requestForm, donorsRequired: Number(e.target.value) })}
                      required
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="form-group">
                    <label className="form-label">
                      Required Date <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Today / Immediate or 2026-09-18"
                      value={requestForm.requiredDate}
                      onChange={(e) => setRequestForm({ ...requestForm, requiredDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Required Time <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Within 2 Hours / 10:00 AM"
                      value={requestForm.requiredTime}
                      onChange={(e) => setRequestForm({ ...requestForm, requiredTime: e.target.value })}
                      required
                    />
                  </div>

                  {/* Donation Location */}
                  <div className="form-group col-span-2">
                    <label className="form-label">
                      Blood Donation Location <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Specific room or building for donor arrival"
                      value={requestForm.donationLocation}
                      onChange={(e) => setRequestForm({ ...requestForm, donationLocation: e.target.value })}
                      required
                    />
                  </div>

                  {/* Urgency Level */}
                  <div className="form-group col-span-2">
                    <label className="form-label">
                      Urgency Level <span className="req">*</span>
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <label
                        style={{
                          border: `2px solid ${requestForm.urgency === 'Normal' ? 'var(--normal)' : 'var(--border-light)'}`,
                          background: requestForm.urgency === 'Normal' ? 'var(--normal-bg)' : 'white',
                          borderRadius: '8px',
                          padding: '12px',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          value="Normal"
                          checked={requestForm.urgency === 'Normal'}
                          onChange={() => setRequestForm({ ...requestForm, urgency: 'Normal' })}
                          style={{ display: 'none' }}
                        />
                        <div style={{ fontWeight: 700, color: 'var(--normal)', fontSize: '0.9rem' }}>Normal</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Scheduled / Within 48h</div>
                      </label>

                      <label
                        style={{
                          border: `2px solid ${requestForm.urgency === 'Critical' ? 'var(--urgent)' : 'var(--border-light)'}`,
                          background: requestForm.urgency === 'Critical' ? 'var(--urgent-bg)' : 'white',
                          borderRadius: '8px',
                          padding: '12px',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          value="Critical"
                          checked={requestForm.urgency === 'Critical'}
                          onChange={() => setRequestForm({ ...requestForm, urgency: 'Critical' })}
                          style={{ display: 'none' }}
                        />
                        <div style={{ fontWeight: 700, color: 'var(--urgent)', fontSize: '0.9rem' }}>Critical</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Within 6-12 hours</div>
                      </label>

                      <label
                        style={{
                          border: `2px solid ${requestForm.urgency === 'Emergency' ? 'var(--emergency)' : 'var(--border-light)'}`,
                          background: requestForm.urgency === 'Emergency' ? 'var(--emergency-bg)' : 'white',
                          borderRadius: '8px',
                          padding: '12px',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          value="Emergency"
                          checked={requestForm.urgency === 'Emergency'}
                          onChange={() => setRequestForm({ ...requestForm, urgency: 'Emergency' })}
                          style={{ display: 'none' }}
                        />
                        <div style={{ fontWeight: 700, color: 'var(--emergency)', fontSize: '0.9rem' }}>
                          Emergency
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Immediate Life Threat</div>
                      </label>
                    </div>
                  </div>

                  {/* Reason (Optional) */}
                  <div className="form-group col-span-2">
                    <label className="form-label">Reason for Request (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Acute internal trauma / Surgery standby"
                      value={requestForm.reason}
                      onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                    />
                  </div>

                  {/* Additional Instructions (Optional) */}
                  <div className="form-group col-span-2">
                    <label className="form-label">Additional Instructions for Donors (Optional)</label>
                    <textarea
                      className="form-textarea"
                      placeholder="e.g. Enter through Gate 2, report to Sister in-charge at counter 3"
                      value={requestForm.instructions}
                      onChange={(e) => setRequestForm({ ...requestForm, instructions: e.target.value })}
                    />
                  </div>

                  <div className="form-group col-span-2" style={{ marginTop: '14px' }}>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                      <Sparkles size={18} />
                      <span>Submit Request & Dispatch to Matching Donors</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: MY REQUESTS REGISTRY */}
          {activeTab === 'requests' && (
            <div className="content-panel">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Blood Request Registry</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Manage and update all blood donor requests issued by your hospital
                  </p>
                </div>

                <div className="panel-actions">
                  <div style={{ position: 'relative' }}>
                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '32px', width: '220px', height: '36px', fontSize: '0.825rem' }}
                      placeholder="Search Token / Patient..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <select
                    className="form-select"
                    style={{ width: '140px', height: '36px', fontSize: '0.825rem' }}
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value)}
                  >
                    <option value="ALL">All Urgencies</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Critical">Critical</option>
                    <option value="Normal">Normal</option>
                  </select>

                  <select
                    className="form-select"
                    style={{ width: '140px', height: '36px', fontSize: '0.825rem' }}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th>Patient</th>
                      <th>Blood Group</th>
                      <th>Donors</th>
                      <th>Urgency</th>
                      <th>Required Time</th>
                      <th>Status</th>
                      <th>Responses</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                          No blood requests match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((req) => {
                        const reqResponses = responses.filter((res) => res.requestId === req.id);
                        const acceptedCount = reqResponses.filter((res) => res.status === 'Accepted').length;

                        return (
                          <tr key={req.id}>
                            <td>
                              <span className="token-pill">{req.token}</span>
                            </td>
                            <td>{req.patientNameOrId}</td>
                            <td>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '50%',
                                  background: 'var(--primary-light)',
                                  color: 'var(--primary)',
                                  fontWeight: 800
                                }}
                              >
                                {req.bloodGroup}
                              </span>
                            </td>
                            <td>{req.donorsRequired} required</td>
                            <td>
                              <span
                                className={`badge ${
                                  req.urgency === 'Emergency'
                                    ? 'badge-emergency pulse-emergency'
                                    : req.urgency === 'Critical'
                                    ? 'badge-critical'
                                    : 'badge-normal'
                                }`}
                              >
                                {req.urgency}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.8rem' }}>
                              {req.requiredDate} &middot; {req.requiredTime}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  req.status === 'Accepted'
                                    ? 'badge-accepted'
                                    : req.status === 'Completed'
                                    ? 'badge-completed'
                                    : req.status === 'Cancelled'
                                    ? 'badge-cancelled'
                                    : 'badge-pending'
                                }`}
                              >
                                {req.status}
                              </span>
                            </td>
                            <td>
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: acceptedCount > 0 ? 'var(--success)' : '#64748b'
                                }}
                              >
                                {acceptedCount} Accepted
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                  onClick={() => {
                                    setSelectedRequestForResponses(req);
                                    setActiveTab('responses');
                                  }}
                                >
                                  Responses
                                </button>

                                {req.status !== 'Completed' && req.status !== 'Cancelled' && (
                                  <>
                                    <button
                                      className="btn btn-success btn-sm"
                                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                      title="Mark request completed"
                                      onClick={() => completeBloodRequest(req.id)}
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      className="btn btn-outline btn-sm"
                                      style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ef4444' }}
                                      title="Cancel request"
                                      onClick={() => cancelBloodRequest(req.id)}
                                    >
                                      <Ban size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DONOR RESPONSES & CONTACT VIEW */}
          {activeTab === 'responses' && (
            <div>
              {/* Request Selector Tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  overflowX: 'auto',
                  paddingBottom: '12px',
                  marginBottom: '20px'
                }}
              >
                {hospitalRequests.map((req) => (
                  <button
                    key={req.id}
                    className={`btn btn-sm ${
                      selectedRequestForResponses?.id === req.id ? 'btn-primary' : 'btn-outline'
                    }`}
                    onClick={() => setSelectedRequestForResponses(req)}
                  >
                    <span>{req.token}</span>
                    <span style={{ opacity: 0.8, fontSize: '0.75rem' }}>({req.bloodGroup})</span>
                  </button>
                ))}
              </div>

              {selectedRequestForResponses ? (
                <div>
                  {/* Selected Request Summary Header */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-light)',
                      borderRadius: '16px',
                      padding: '20px 24px',
                      marginBottom: '24px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '16px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                        Blood Request Token
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                        {selectedRequestForResponses.token}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Patient: {selectedRequestForResponses.patientNameOrId}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                        Required Blood Group & Urgency
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {selectedRequestForResponses.bloodGroup}
                        </span>
                        <span
                          className={`badge ${
                            selectedRequestForResponses.urgency === 'Emergency'
                              ? 'badge-emergency pulse-emergency'
                              : 'badge-critical'
                          }`}
                        >
                          {selectedRequestForResponses.urgency}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                        Donation Location
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>
                        {selectedRequestForResponses.donationLocation}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {selectedRequestForResponses.requiredDate} ({selectedRequestForResponses.requiredTime})
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                      <span
                        className={`badge ${
                          selectedRequestForResponses.status === 'Accepted'
                            ? 'badge-accepted'
                            : selectedRequestForResponses.status === 'Completed'
                            ? 'badge-completed'
                            : 'badge-pending'
                        }`}
                        style={{ marginBottom: '8px' }}
                      >
                        Status: {selectedRequestForResponses.status}
                      </span>
                      {selectedRequestForResponses.status !== 'Completed' && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => completeBloodRequest(selectedRequestForResponses.id)}
                        >
                          <CheckCircle2 size={14} />
                          <span>Mark Request Completed</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Donor Responses List */}
                  <div className="content-panel">
                    <div className="panel-header">
                      <div>
                        <h3 className="panel-title">Registered Donor Responses</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Donors who have viewed and accepted or declined this specific request token
                        </p>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Donor Name</th>
                            <th>Blood Group</th>
                            <th>Location</th>
                            <th>Contact Phone</th>
                            <th>Response Status</th>
                            <th>Response Time</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {responses.filter((res) => res.requestId === selectedRequestForResponses.id).length === 0 ? (
                            <tr>
                              <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                No donor responses yet. Waiting for registered donors in{' '}
                                <strong>{selectedRequestForResponses.hospitalLocation}</strong> to respond.
                              </td>
                            </tr>
                          ) : (
                            responses
                              .filter((res) => res.requestId === selectedRequestForResponses.id)
                              .map((res) => (
                                <tr key={res.id}>
                                  <td style={{ fontWeight: 700 }}>{res.donorName}</td>
                                  <td>
                                    <span
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: 'var(--primary-light)',
                                        color: 'var(--primary)',
                                        fontWeight: 800,
                                        fontSize: '0.8rem'
                                      }}
                                    >
                                      {res.bloodGroup}
                                    </span>
                                  </td>
                                  <td>{res.donorLocation}</td>
                                  <td style={{ fontFamily: 'monospace' }}>{res.donorPhone}</td>
                                  <td>
                                    <span
                                      className={`badge ${
                                        res.status === 'Accepted' ? 'badge-accepted' : 'badge-rejected'
                                      }`}
                                    >
                                      {res.status === 'Accepted' ? '✓ Accepted Request' : '✕ Declined'}
                                    </span>
                                  </td>
                                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{res.responseTime}</td>
                                  <td>
                                    {res.status === 'Accepted' && (
                                      <button
                                        className="btn btn-primary btn-sm"
                                        style={{ padding: '6px 12px' }}
                                        onClick={() => setContactModalDonor(res)}
                                      >
                                        <Phone size={14} />
                                        <span>Contact Donor</span>
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                  No active requests available to view responses. Please create a blood request first.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: HOSPITAL PROFILE */}
          {activeTab === 'profile' && (
            <div className="content-panel" style={{ maxWidth: '700px', margin: '0 auto' }}>
              <div className="panel-header">
                <h3 className="panel-title">Hospital Profile & Verification</h3>
                <span className="badge badge-approved">Admin Verified & Active</span>
              </div>
              <div style={{ padding: '28px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  <div>
                    <label className="form-label" style={{ color: '#64748b' }}>Hospital Name</label>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{currentUser?.name}</div>
                  </div>

                  <div>
                    <label className="form-label" style={{ color: '#64748b' }}>Unique Hospital ID</label>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)', fontFamily: 'monospace' }}>
                      {currentUser?.id}
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ color: '#64748b' }}>Facility Type</label>
                    <div style={{ fontWeight: 600 }}>{currentUser?.type || 'Multi-Specialty'}</div>
                  </div>

                  <div>
                    <label className="form-label" style={{ color: '#64748b' }}>License Number</label>
                    <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      {currentUser?.licenseNumber || 'LIC-AP-2024-8842'}
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ color: '#64748b' }}>Official Contact Number</label>
                    <div style={{ fontWeight: 600 }}>{currentUser?.contact}</div>
                  </div>

                  <div>
                    <label className="form-label" style={{ color: '#64748b' }}>Official Email</label>
                    <div style={{ fontWeight: 600 }}>{currentUser?.email}</div>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" style={{ color: '#64748b' }}>Address / City</label>
                    <div style={{ fontWeight: 600 }}>
                      {currentUser?.address || `${currentUser?.location}, Andhra Pradesh`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CONTACT DONOR MODAL */}
      {contactModalDonor && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone color="var(--primary)" size={20} />
                <h3 className="modal-title">Contact Accepted Donor</h3>
              </div>
              <button onClick={() => setContactModalDonor(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px',
                    fontSize: '1.4rem',
                    fontWeight: 800
                  }}
                >
                  {contactModalDonor.bloodGroup}
                </div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{contactModalDonor.donorName}</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Location: {contactModalDonor.donorLocation} &middot; Blood Group:{' '}
                  <strong>{contactModalDonor.bloodGroup}</strong>
                </p>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Phone size={18} color="var(--primary)" />
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>
                        Direct Phone
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'monospace' }}>
                        {contactModalDonor.donorPhone}
                      </div>
                    </div>
                  </div>
                  <a
                    href={`tel:${contactModalDonor.donorPhone}`}
                    className="btn btn-outline btn-sm"
                    onClick={() => addToast(`Calling ${contactModalDonor.donorName}...`, 'info')}
                  >
                    Call Now
                  </a>
                </div>

                {contactModalDonor.donorEmail && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Mail size={18} color="var(--primary)" />
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>
                          Email Address
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {contactModalDonor.donorEmail}
                        </div>
                      </div>
                    </div>
                    <a
                      href={`mailto:${contactModalDonor.donorEmail}`}
                      className="btn btn-outline btn-sm"
                    >
                      Email
                    </a>
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 14px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: '#15803d'
                }}
              >
                ✓ <strong>Donor Accepted at:</strong> {contactModalDonor.responseTime}. Please provide the donor with arriving directions and hospital ward contact.
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setContactModalDonor(null);
                  addToast(`Contact initiated with ${contactModalDonor.donorName}.`, 'success');
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
