import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Droplet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  LogOut,
  User,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  Info,
  ChevronRight,
  Bell
} from 'lucide-react';

export default function DonorDashboard() {
  const {
    currentUser,
    requests,
    responses,
    respondToRequest,
    updateDonorAvailability,
    updateDonorProfile,
    logout,
    addToast,
    enableNotifications,
    notificationsEnabled
  } = useApp();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'requests' | 'responses' | 'profile' | 'availability'
  const [responsePrioritySelections, setResponsePrioritySelections] = useState({});
  const [priorityWarning, setPriorityWarning] = useState(null);

  // Editable profile state
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    location: currentUser?.location || '',
    availability: currentUser?.availability || 'Available',
    lastDonationDate: currentUser?.lastDonationDate || ''
  });

  const PRIORITY_RANK = { Emergency: 0, Critical: 1, Normal: 2 };

  const normalizePriority = (priority) => (
    priority === 'Urgent' ? 'Critical' : PRIORITY_RANK[priority] !== undefined ? priority : 'Normal'
  );

  // Only approved, available donors see matching requests; matching requests are priority-sorted.
  const matchingRequests =
    currentUser?.status === 'Approved' && currentUser?.availability === 'Available'
      ? requests
          .filter(
            (req) =>
              req.bloodGroup?.trim().toLowerCase() === currentUser?.bloodGroup?.trim().toLowerCase() &&
              req.hospitalLocation?.trim().toLowerCase() === currentUser?.location?.trim().toLowerCase() &&
              req.status !== 'Completed' &&
              req.status !== 'Cancelled'
          )
          .sort((a, b) => {
            const priorityA = PRIORITY_RANK[normalizePriority(a.urgency)];
            const priorityB = PRIORITY_RANK[normalizePriority(b.urgency)];
            if (priorityA !== priorityB) return priorityA - priorityB;
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          })
      : [];

  // My responses
  const myResponses = responses.filter((res) => res.donorId === currentUser?.id);
  const acceptedResponses = myResponses.filter((res) => res.status === 'Accepted');

  // Check if donor has already responded to a request
  const getDonorResponseForRequest = (requestId) => {
    return myResponses.find((res) => res.requestId === requestId);
  };

  const getSelectedResponsePriority = (request) => (
    responsePrioritySelections[request.id] || normalizePriority(request.urgency)
  );

  const handleResponsePriorityChange = (requestId, priority) => {
    setResponsePrioritySelections((prev) => ({ ...prev, [requestId]: priority }));
  };

  const handleAcceptRequest = (request) => {
    const selectedPriority = getSelectedResponsePriority(request);
    const requestPriority = normalizePriority(request.urgency);
    const requestRank = PRIORITY_RANK[requestPriority];
    const selectedRank = PRIORITY_RANK[selectedPriority];

    // Never allow a donor to open multiple active accepted requests at once.
    const hasActiveAcceptedRequest = acceptedResponses.some((response) => {
      if (response.requestId === request.id) return false;
      const relatedRequest = requests.find((item) => item.id === response.requestId);
      return relatedRequest && relatedRequest.status !== 'Completed' && relatedRequest.status !== 'Cancelled';
    });

    if (hasActiveAcceptedRequest) {
      addToast('You already accepted an active blood request. Please complete it before accepting another request.', 'warning', 7000);
      return;
    }

    const activeHigherPriorityRequest = matchingRequests.find((candidate) => {
      if (candidate.id === request.id) return false;
      const candidatePriority = normalizePriority(candidate.urgency);
      const candidateRank = PRIORITY_RANK[candidatePriority];
      const donorResponse = getDonorResponseForRequest(candidate.id);
      const alreadyDeclined = donorResponse?.status === 'Declined';
      const isOpen = candidate.status !== 'Completed' && candidate.status !== 'Cancelled';
      return isOpen && !alreadyDeclined && candidateRank < requestRank;
    });

    if (activeHigherPriorityRequest) {
      addToast(
        `A higher-priority ${normalizePriority(activeHigherPriorityRequest.urgency)} request (${activeHigherPriorityRequest.token}) is active. Please respond to the higher-priority request first.`,
        'warning',
        7000
      );
      return;
    }

    if (selectedRank > requestRank) {
      setPriorityWarning({ request, selectedPriority, requestPriority });
      return;
    }

    respondToRequest(request.id, currentUser.id, 'Accepted', selectedPriority);
  };

  const confirmPriorityWarning = () => {
    if (!priorityWarning) return;
    const { request, selectedPriority } = priorityWarning;
    setPriorityWarning(null);
    respondToRequest(request.id, currentUser.id, 'Accepted', selectedPriority);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateDonorProfile(currentUser.id, profileForm);
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="brand-logo">
            <div className="brand-logo-icon">
              <Droplet size={18} fill="#ffffff" />
            </div>
            <div>
              <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>Donor Portal</span>
              <span
                style={{
                  fontSize: '0.68rem',
                  display: 'block',
                  color: 'var(--text-muted)',
                  fontWeight: 600
                }}
              >
                {currentUser?.name} &middot; {currentUser?.bloodGroup}
              </span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Droplet size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <AlertTriangle size={18} />
            <span>Blood Requests</span>
            {matchingRequests.length > 0 && (
              <span
                className="badge badge-emergency"
                style={{ marginLeft: 'auto', padding: '2px 6px', fontSize: '0.7rem' }}
              >
                {matchingRequests.length}
              </span>
            )}
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'responses' ? 'active' : ''}`}
            onClick={() => setActiveTab('responses')}
          >
            <CheckCircle2 size={18} />
            <span>My Responses</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} />
            <span>Profile</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'availability' ? 'active' : ''}`}
            onClick={() => setActiveTab('availability')}
          >
            <Clock size={18} />
            <span>Availability Status</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-nav-item" onClick={logout} style={{ color: '#ef4444' }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        {/* TOPBAR */}
        <header className="dashboard-topbar">
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              {activeTab === 'dashboard' && `Hello, ${currentUser?.name}!`}
              {activeTab === 'requests' && 'Urgent Blood Requests for You'}
              {activeTab === 'responses' && 'My Past Response Activity'}
              {activeTab === 'profile' && 'Donor Profile'}
              {activeTab === 'availability' && 'Manage Live Availability'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Blood Group: <strong>{currentUser?.bloodGroup}</strong> &middot; City:{' '}
              <strong>{currentUser?.location}</strong> &middot; Status:{' '}
              <span
                style={{
                  color: currentUser?.availability === 'Available' ? 'var(--success)' : '#d97706',
                  fontWeight: 700
                }}
              >
                {currentUser?.availability}
              </span>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Quick Live Availability Switcher */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-subtle)',
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1px solid var(--border-light)'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Donation Ready:
              </span>
              <button
                className={`btn btn-sm ${
                  currentUser?.availability === 'Available' ? 'btn-success' : 'btn-outline'
                }`}
                style={{ padding: '3px 10px', fontSize: '0.75rem' }}
                onClick={() =>
                  updateDonorAvailability(
                    currentUser.id,
                    currentUser.availability === 'Available' ? 'Unavailable' : 'Available'
                  )
                }
              >
                {currentUser?.availability === 'Available' ? '✓ Ready' : 'Paused'}
              </button>
            </div>

            <div className="topbar-user-badge">
              <div className="user-avatar-circle">{currentUser?.name?.slice(0, 2).toUpperCase()}</div>
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
          {/* STATS OVERVIEW CARDS (From Reference Image) */}
          <div className="stats-cards-grid">
            <div className="stat-card">
              <div className="stat-info">
                <h3>{currentUser?.bloodGroup}</h3>
                <p>Blood Group</p>
              </div>
              <div className="stat-icon-wrapper stat-icon-red">
                <Droplet size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3
                  style={{
                    color: currentUser?.availability === 'Available' ? 'var(--success)' : '#d97706'
                  }}
                >
                  {currentUser?.availability === 'Available' ? 'Active' : 'Paused'}
                </h3>
                <p>Availability</p>
              </div>
              <div className="stat-icon-wrapper stat-icon-green">
                <CheckCircle2 size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>{matchingRequests.length}</h3>
                <p>Pending Requests</p>
              </div>
              <div className="stat-icon-wrapper stat-icon-amber">
                <AlertTriangle size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>{currentUser?.donationsCount || acceptedResponses.length}</h3>
                <p>Lives Impacted</p>
              </div>
              <div className="stat-icon-wrapper stat-icon-blue">
                <Heart size={22} />
              </div>
            </div>
          </div>

          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Emergency Matching Alert Banner */}
              {matchingRequests.length > 0 ? (
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
                      Urgent Matching Need in {currentUser?.location}
                    </span>
                    <h3 style={{ fontSize: '1.45rem', color: 'white', marginTop: '8px', marginBottom: '4px' }}>
                      {matchingRequests.length} Urgent Hospital Blood Request(s) Need You!
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>
                      A hospital in your city specifically requested <strong>{currentUser?.bloodGroup}</strong> donors.
                      Review the details and respond immediately.
                    </p>
                  </div>
                  <button
                    className="btn btn-sm"
                    style={{ background: 'white', color: 'var(--primary)', fontWeight: 700, padding: '10px 20px' }}
                    onClick={() => setActiveTab('requests')}
                  >
                    <span>View & Respond</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    marginBottom: '28px',
                    color: '#15803d'
                  }}
                >
                  <CheckCircle2 size={24} />
                  <div>
                    <strong>You are all set!</strong> No active urgent requests for{' '}
                    <strong>{currentUser?.bloodGroup}</strong> in <strong>{currentUser?.location}</strong> right now.
                    We will notify you immediately when a matching hospital requests donors.
                  </div>
                </div>
              )}

              {/* Matching Requests Section */}
              <div className="content-panel">
                <div className="panel-header">
                  <div>
                    <h3 className="panel-title">Matched Hospital Requests</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Filtered by your blood group ({currentUser?.bloodGroup}) and location ({currentUser?.location})
                    </p>
                  </div>
                </div>

                <div style={{ padding: '24px' }}>
                  {matchingRequests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      No pending donor requests at this moment.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {matchingRequests.map((req) => {
                        const donorRes = getDonorResponseForRequest(req.id);

                        return (
                          <div
                            key={req.id}
                            className={`content-panel ${
                              req.urgency === 'Emergency' ? 'request-card-urgent' : 'request-card-high'
                            }`}
                            style={{ margin: 0, border: '1.5px solid var(--border-light)' }}
                          >
                            <div className="panel-header">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="token-pill">{req.token}</span>
                                <span
                                  className={`badge ${
                                    req.urgency === 'Emergency'
                                      ? 'badge-emergency pulse-emergency'
                                      : 'badge-critical'
                                  }`}
                                >
                                  {req.urgency}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                Required: <strong>{req.requiredDate} ({req.requiredTime})</strong>
                              </span>
                            </div>

                            <div style={{ padding: '20px 24px' }}>
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(3, 1fr)',
                                  gap: '18px',
                                  marginBottom: '16px'
                                }}
                              >
                                <div>
                                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>
                                    Hospital
                                  </div>
                                  <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Building2 size={16} color="var(--primary)" />
                                    <span>{req.hospitalName}</span>
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                    {req.hospitalLocation}
                                  </div>
                                </div>

                                <div>
                                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>
                                    Patient & Clinical Reason
                                  </div>
                                  <div style={{ fontWeight: 600 }}>{req.patientNameOrId}</div>
                                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                    {req.reason || 'Urgent medical requirement'}
                                  </div>
                                </div>

                                <div>
                                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>
                                    Donation Location
                                  </div>
                                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                    {req.donationLocation}
                                  </div>
                                  {req.instructions && (
                                    <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
                                      Note: {req.instructions}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons or Status */}
                              {donorRes ? (
                                <div
                                  style={{
                                    background: donorRes.status === 'Accepted' ? '#f0fdf4' : '#fef2f2',
                                    border: `1px solid ${donorRes.status === 'Accepted' ? '#bbf7d0' : '#fecaca'}`,
                                    borderRadius: '10px',
                                    padding: '14px 18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                  }}
                                >
                                  <div>
                                    <div
                                      style={{
                                        fontWeight: 700,
                                        color: donorRes.status === 'Accepted' ? '#16a34a' : '#dc2626',
                                        fontSize: '0.9rem'
                                      }}
                                    >
                                      {donorRes.status === 'Accepted'
                                        ? '✓ You Accepted this Request'
                                        : '✕ You Declined this Request'}
                                    </div>
                                    {donorRes.status === 'Accepted' && (
                                      <div style={{ fontSize: '0.825rem', color: '#15803d', marginTop: '4px' }}>
                                        Hospital Contact: <strong>{req.hospitalContact}</strong> &middot; Location:{' '}
                                        <strong>{req.donationLocation}</strong>
                                      </div>
                                    )}
                                  </div>

                                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    Responded at: {donorRes.responseTime}
                                  </span>
                                </div>
                              ) : (
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    gap: '12px',
                                    borderTop: '1px solid var(--border-light)',
                                    paddingTop: '16px',
                                    flexWrap: 'wrap'
                                  }}
                                >
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                                    Priority:
                                    <select
                                      aria-label={`Response priority for ${req.token}`}
                                      value={getSelectedResponsePriority(req)}
                                      onChange={(e) => handleResponsePriorityChange(req.id, e.target.value)}
                                      style={{
                                        border: '1px solid var(--border-light)',
                                        borderRadius: '8px',
                                        padding: '7px 28px 7px 10px',
                                        background: '#fff',
                                        fontWeight: 700,
                                        color: '#334155'
                                      }}
                                    >
                                      <option value="Emergency">Emergency</option>
                                      <option value="Critical">Critical</option>
                                      <option value="Normal">Normal</option>
                                    </select>
                                  </label>

                                  <button
                                    className="btn btn-outline btn-sm"
                                    style={{ color: '#ef4444' }}
                                    onClick={() => respondToRequest(req.id, currentUser.id, 'Declined', getSelectedResponsePriority(req))}
                                  >
                                    <X size={14} />
                                    <span>Decline Request</span>
                                  </button>

                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleAcceptRequest(req)}
                                  >
                                    <Check size={14} />
                                    <span>ACCEPT REQUEST</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BLOOD REQUESTS */}
          {activeTab === 'requests' && (
            <div className="content-panel">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Urgent Matching Blood Requests</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Requests sent to you based on your blood group ({currentUser?.bloodGroup}) and location ({currentUser?.location})
                  </p>
                </div>
              </div>

              <div style={{ padding: '24px' }}>
                {matchingRequests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No active blood requests currently need your specific blood group in this location.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {matchingRequests.map((req) => {
                      const donorRes = getDonorResponseForRequest(req.id);

                      return (
                        <div
                          key={req.id}
                          className={`content-panel ${
                            req.urgency === 'Emergency' ? 'request-card-urgent' : 'request-card-high'
                          }`}
                          style={{ margin: 0, border: '1.5px solid var(--border-light)' }}
                        >
                          <div className="panel-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span className="token-pill">{req.token}</span>
                              <span
                                className={`badge ${
                                  req.urgency === 'Emergency'
                                    ? 'badge-emergency pulse-emergency'
                                    : 'badge-critical'
                                }`}
                              >
                                {req.urgency}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              Date: <strong>{req.requiredDate} ({req.requiredTime})</strong>
                            </span>
                          </div>

                          <div style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '16px' }}>
                              <div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Hospital</div>
                                <div style={{ fontWeight: 700 }}>{req.hospitalName}</div>
                                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{req.hospitalLocation}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Patient ID / Reason</div>
                                <div style={{ fontWeight: 600 }}>{req.patientNameOrId}</div>
                                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{req.reason || 'General Need'}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Donation Location</div>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{req.donationLocation}</div>
                              </div>
                            </div>

                            {donorRes ? (
                              <div
                                style={{
                                  background: donorRes.status === 'Accepted' ? '#f0fdf4' : '#fef2f2',
                                  border: `1px solid ${donorRes.status === 'Accepted' ? '#bbf7d0' : '#fecaca'}`,
                                  borderRadius: '10px',
                                  padding: '14px 18px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between'
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: 700, color: donorRes.status === 'Accepted' ? '#16a34a' : '#dc2626' }}>
                                    {donorRes.status === 'Accepted' ? '✓ You Accepted this Request' : '✕ You Declined'}
                                  </div>
                                  {donorRes.status === 'Accepted' && (
                                    <div style={{ fontSize: '0.825rem', color: '#15803d', marginTop: '4px' }}>
                                      Hospital Contact: <strong>{req.hospitalContact}</strong>
                                    </div>
                                  )}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{donorRes.responseTime}</span>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', flexWrap: 'wrap' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                                  Priority:
                                  <select
                                    aria-label={`Response priority for ${req.token}`}
                                    value={getSelectedResponsePriority(req)}
                                    onChange={(e) => handleResponsePriorityChange(req.id, e.target.value)}
                                    style={{
                                      border: '1px solid var(--border-light)',
                                      borderRadius: '8px',
                                      padding: '7px 28px 7px 10px',
                                      background: '#fff',
                                      fontWeight: 700,
                                      color: '#334155'
                                    }}
                                  >
                                    <option value="Emergency">Emergency</option>
                                    <option value="Critical">Critical</option>
                                    <option value="Normal">Normal</option>
                                  </select>
                                </label>
                                <button
                                  className="btn btn-outline btn-sm"
                                  style={{ color: '#ef4444' }}
                                  onClick={() => respondToRequest(req.id, currentUser.id, 'Declined', getSelectedResponsePriority(req))}
                                >
                                  <X size={14} />
                                  <span>Decline</span>
                                </button>
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleAcceptRequest(req)}
                                >
                                  <Check size={14} />
                                  <span>ACCEPT REQUEST</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MY RESPONSES */}
          {activeTab === 'responses' && (
            <div className="content-panel">
              <div className="panel-header">
                <h3 className="panel-title">My Donation Responses</h3>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th>Hospital</th>
                      <th>Response</th>
                      <th>Response Date/Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myResponses.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                          You haven't responded to any requests yet.
                        </td>
                      </tr>
                    ) : (
                      myResponses.map((res) => {
                        const req = requests.find((r) => r.id === res.requestId);
                        return (
                          <tr key={res.id}>
                            <td>
                              <span className="token-pill">{res.requestToken}</span>
                            </td>
                            <td style={{ fontWeight: 600 }}>{req?.hospitalName || 'Hospital'}</td>
                            <td>
                              <span className={`badge ${res.status === 'Accepted' ? 'badge-accepted' : 'badge-rejected'}`}>
                                {res.status === 'Accepted' ? '✓ Accepted' : '✕ Declined'}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{res.responseTime}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <div className="content-panel" style={{ maxWidth: '640px', margin: '0 auto' }}>
              <div className="panel-header">
                <h3 className="panel-title">Edit Donor Profile</h3>
                <span className="badge badge-approved">Admin Verified</span>
              </div>
              <form onSubmit={handleProfileSave} style={{ padding: '24px' }} className="form-grid">
                <div className="form-group col-span-2">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <input
                    type="text"
                    className="form-input"
                    value={currentUser?.bloodGroup}
                    disabled
                    style={{ background: '#f8fafc', color: '#64748b' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location / City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  />
                </div>

                <div className="form-group col-span-2">
                  <label className="form-label">Last Donation Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={profileForm.lastDonationDate}
                    onChange={(e) => setProfileForm({ ...profileForm, lastDonationDate: e.target.value })}
                  />
                </div>

                <div className="form-group col-span-2" style={{ marginTop: '14px' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: AVAILABILITY STATUS */}
          {activeTab === 'availability' && (
            <div className="content-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div className="panel-header">
                <h3 className="panel-title">Donation Availability Preferences</h3>
              </div>
              <div style={{ padding: '24px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    padding: '14px 16px',
                    marginBottom: '20px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '12px',
                    background: '#f8fafc'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      Chrome Notifications
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px' }}>
                      Get matching blood-request alerts even when you are logged out.
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={enableNotifications}
                    disabled={notificationsEnabled}
                  >
                    <Bell size={14} />
                    <span>{notificationsEnabled ? 'Notifications Enabled' : 'Enable Notifications'}</span>
                  </button>
                </div>

                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '20px' }}>
                  Choose whether you are actively available to receive urgent requests from hospitals in{' '}
                  <strong>{currentUser?.location}</strong>.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {['Available', 'Unavailable', 'Busy'].map((st) => (
                    <label
                      key={st}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: `2px solid ${currentUser?.availability === st ? 'var(--primary)' : 'var(--border-light)'}`,
                        background: currentUser?.availability === st ? 'var(--primary-light)' : 'white',
                        cursor: 'pointer'
                      }}
                      onClick={() => updateDonorAvailability(currentUser.id, st)}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          {st === 'Available' && '🟢 Available to Donate'}
                          {st === 'Unavailable' && '🔴 Temporarily Unavailable'}
                          {st === 'Busy' && '🟡 Busy / On Call Only'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                          {st === 'Available' && 'You will receive immediate alerts for matching emergency requests.'}
                          {st === 'Unavailable' && 'Your profile will be hidden from matching requests until re-enabled.'}
                          {st === 'Busy' && 'Only notify for critical emergency cases.'}
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="availability"
                        checked={currentUser?.availability === st}
                        onChange={() => updateDonorAvailability(currentUser.id, st)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {priorityWarning && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="priority-warning-title">
          <div className="modal-card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <AlertTriangle size={22} color="#d97706" />
                <h3 id="priority-warning-title" className="modal-title">Priority Warning</h3>
              </div>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                ⚠️ This is a <strong>{priorityWarning.requestPriority}</strong> blood request. You selected <strong>{priorityWarning.selectedPriority}</strong>. Are you sure you want to continue?
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setPriorityWarning(null)}>
                Go Back
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={confirmPriorityWarning}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
