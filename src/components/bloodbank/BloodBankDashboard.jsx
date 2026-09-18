import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HeartHandshake,
  Building2,
  Droplet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  LogOut,
  Send,
  MessageSquare,
  ShieldCheck,
  Check,
  ChevronRight
} from 'lucide-react';

export default function BloodBankDashboard() {
  const {
    currentUser,
    requests,
    users,
    responses,
    addCoordinationNote,
    logout,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'coordination' | 'donors' | 'hospitals' | 'profile'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [coordinationNote, setCoordinationNote] = useState('');

  // Strict scope reminder: No inventory or stock management!
  const hospitalsList = users.filter((u) => u.role === 'hospital' && u.status === 'Approved');
  const donorsList = users.filter((u) => u.role === 'donor' && u.status === 'Approved');
  const activeRequests = requests.filter((r) => r.status === 'Pending' || r.status === 'Accepted');
  const completedRequests = requests.filter((r) => r.status === 'Completed');

  // Handle coordination note submit
  const handleAddNote = (e) => {
    e.preventDefault();
    if (!coordinationNote.trim() || !selectedRequest) return;
    addCoordinationNote(selectedRequest.id, coordinationNote);
    setCoordinationNote('');
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="brand-logo">
            <div className="brand-logo-icon">
              <HeartHandshake size={18} fill="#ffffff" />
            </div>
            <div>
              <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>Coordination Hub</span>
              <span
                style={{
                  fontSize: '0.68rem',
                  display: 'block',
                  color: 'var(--text-muted)',
                  fontWeight: 600
                }}
              >
                {currentUser?.name}
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
            className={`sidebar-nav-item ${activeTab === 'coordination' ? 'active' : ''}`}
            onClick={() => setActiveTab('coordination')}
          >
            <HeartHandshake size={18} />
            <span>Coordination Requests</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'donors' ? 'active' : ''}`}
            onClick={() => setActiveTab('donors')}
          >
            <Droplet size={18} />
            <span>Registered Donors</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'hospitals' ? 'active' : ''}`}
            onClick={() => setActiveTab('hospitals')}
          >
            <Building2 size={18} />
            <span>Network Hospitals</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <ShieldCheck size={18} />
            <span>Organization Profile</span>
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
              {activeTab === 'overview' && 'Blood Bank Coordination Dashboard'}
              {activeTab === 'coordination' && 'Active Hospital-Donor Coordination'}
              {activeTab === 'donors' && 'Registered Donors Registry'}
              {activeTab === 'hospitals' && 'Connected Hospital Facilities'}
              {activeTab === 'profile' && 'Blood Bank Details'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Location: <strong>{currentUser?.location}</strong> &middot; Role:{' '}
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Donor & Hospital Connector</span>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
          {/* MANDATORY STRICT SCOPE NOTICE */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-light)',
              borderRadius: '12px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.825rem',
              color: '#475569',
              marginBottom: '24px'
            }}
          >
            <HeartHandshake size={20} color="var(--primary)" />
            <div>
              <strong>Coordination Scope:</strong> As specified, Blood Bank operates exclusively as a liaison
              facilitating rapid connection between hospitals and volunteer donors. No blood stock, unit quantities,
              or inventory tracking.
            </div>
          </div>

          {/* STATS OVERVIEW CARDS (from Specification) */}
          <div className="stats-cards-grid">
            <div className="stat-card">
              <div className="stat-info">
                <h3>{activeRequests.length}</h3>
                <p>Active Coordination</p>
              </div>
              <div className="stat-icon-wrapper stat-icon-red">
                <AlertTriangle size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>{hospitalsList.length}</h3>
                <p>Connected Hospitals</p>
              </div>
              <div className="stat-icon-wrapper stat-icon-blue">
                <Building2 size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>{donorsList.length}</h3>
                <p>Registered Donors</p>
              </div>
              <div className="stat-icon-wrapper stat-icon-amber">
                <Droplet size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>{completedRequests.length}</h3>
                <p>Completed Connections</p>
              </div>
              <div className="stat-icon-wrapper stat-icon-green">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW & LIVE COORDINATION */}
          {activeTab === 'overview' && (
            <div>
              <div className="content-panel">
                <div className="panel-header">
                  <div>
                    <h3 className="panel-title">Active Blood Requests Requiring Coordination</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Help hospitals match and establish direct contact with available volunteer donors
                    </p>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Request Token</th>
                        <th>Hospital</th>
                        <th>Location</th>
                        <th>Blood Group</th>
                        <th>Urgency</th>
                        <th>Donors Needed</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeRequests.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                            No blood requests available yet.
                          </td>
                        </tr>
                      ) : (
                        activeRequests.map((req) => (
                        <tr key={req.id}>
                          <td>
                            <span className="token-pill">{req.token}</span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{req.hospitalName}</td>
                          <td>{req.hospitalLocation}</td>
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
                                fontWeight: 800
                              }}
                            >
                              {req.bloodGroup}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                req.urgency === 'Emergency'
                                  ? 'badge-emergency pulse-emergency'
                                  : 'badge-urgent'
                              }`}
                            >
                              {req.urgency}
                            </span>
                          </td>
                          <td>{req.donorsRequired} Required</td>
                          <td>
                            <span
                              className={`badge ${
                                req.status === 'Accepted' ? 'badge-accepted' : 'badge-pending'
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                setSelectedRequest(req);
                                setActiveTab('coordination');
                              }}
                            >
                              <HeartHandshake size={14} />
                              <span>Coordinate</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COORDINATION DETAILS */}
          {activeTab === 'coordination' && (
            <div>
              {selectedRequest ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
                  {/* Left: Request & Matching Donors */}
                  <div className="content-panel">
                    <div className="panel-header">
                      <div>
                        <h3 className="panel-title">Request: {selectedRequest.token}</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Hospital: {selectedRequest.hospitalName} &middot; Contact: {selectedRequest.hospitalContact}
                        </p>
                      </div>
                      <span className="badge badge-emergency">{selectedRequest.urgency}</span>
                    </div>

                    <div style={{ padding: '24px' }}>
                      <div
                        style={{
                          background: 'var(--bg-subtle)',
                          borderRadius: '12px',
                          padding: '16px',
                          marginBottom: '20px'
                        }}
                      >
                        <div style={{ fontSize: '0.825rem', color: '#64748b' }}>Clinical Requirement:</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '2px' }}>
                          Need {selectedRequest.donorsRequired} donor(s) of{' '}
                          <strong style={{ color: 'var(--primary)' }}>{selectedRequest.bloodGroup}</strong> at{' '}
                          {selectedRequest.donationLocation}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                          Timing: {selectedRequest.requiredDate} ({selectedRequest.requiredTime})
                        </div>
                      </div>

                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px' }}>
                        Matching Available Donors in {selectedRequest.hospitalLocation}:
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {users
                          .filter(
                            (u) =>
                              u.role === 'donor' &&
                              u.status === 'Approved' &&
                              u.bloodGroup === selectedRequest.bloodGroup &&
                              u.location.toLowerCase() === selectedRequest.hospitalLocation.toLowerCase()
                          )
                          .map((donor) => (
                            <div
                              key={donor.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: '#ffffff',
                                border: '1px solid var(--border-light)',
                                borderRadius: '10px',
                                padding: '12px 16px'
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 700 }}>{donor.name}</div>
                                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                  Phone: {donor.phone} &middot; Status: <strong>{donor.availability}</strong>
                                </div>
                              </div>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => {
                                  addCoordinationNote(
                                    selectedRequest.id,
                                    `Contacted donor ${donor.name} (${donor.phone}) for ${selectedRequest.token}`
                                  );
                                }}
                              >
                                <Phone size={13} />
                                <span>Assist Call</span>
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Coordination Log Form */}
                  <div className="content-panel">
                    <div className="panel-header">
                      <h3 className="panel-title">Log Coordination Action</h3>
                    </div>
                    <div style={{ padding: '24px' }}>
                      <form onSubmit={handleAddNote}>
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                          <label className="form-label">Coordination Note / Status Update</label>
                          <textarea
                            className="form-textarea"
                            placeholder="e.g. Telephoned donor, confirmed in-transit to hospital."
                            value={coordinationNote}
                            onChange={(e) => setCoordinationNote(e.target.value)}
                            required
                          />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                          <Send size={15} />
                          <span>Submit Coordination Log</span>
                        </button>
                      </form>

                      <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                          Quick Coordination Actions:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ justifyContent: 'flex-start' }}
                            onClick={() => {
                              addCoordinationNote(
                                selectedRequest.id,
                                `Verified donor availability with hospital ${selectedRequest.hospitalName}`
                              );
                            }}
                          >
                            ✓ Verified with Hospital Reception
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ justifyContent: 'flex-start' }}
                            onClick={() => {
                              addCoordinationNote(
                                selectedRequest.id,
                                `Urgent donor follow-up SMS dispatched for token ${selectedRequest.token}`
                              );
                            }}
                          >
                            ✓ Dispatched Emergency SMS Alert
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                  Please select a blood request from the dashboard to coordinate.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DONORS REGISTRY */}
          {activeTab === 'donors' && (
            <div className="content-panel">
              <div className="panel-header">
                <h3 className="panel-title">Approved Registered Donors Directory</h3>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Donor Name</th>
                      <th>Blood Group</th>
                      <th>Location</th>
                      <th>Contact Phone</th>
                      <th>Availability</th>
                      <th>Last Donation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donorsList.map((donor) => (
                      <tr key={donor.id}>
                        <td style={{ fontWeight: 700 }}>{donor.name}</td>
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
                              fontWeight: 800
                            }}
                          >
                            {donor.bloodGroup}
                          </span>
                        </td>
                        <td>{donor.location}</td>
                        <td style={{ fontFamily: 'monospace' }}>{donor.phone}</td>
                        <td>
                          <span
                            className={`badge ${
                              donor.availability === 'Available' ? 'badge-accepted' : 'badge-pending'
                            }`}
                          >
                            {donor.availability}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{donor.lastDonationDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: NETWORK HOSPITALS */}
          {activeTab === 'hospitals' && (
            <div className="content-panel">
              <div className="panel-header">
                <h3 className="panel-title">Network Hospital Facilities</h3>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Hospital Name</th>
                      <th>Facility Type</th>
                      <th>Location</th>
                      <th>Official Contact</th>
                      <th>Email</th>
                      <th>License Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hospitalsList.map((hosp) => (
                      <tr key={hosp.id}>
                        <td style={{ fontWeight: 700 }}>{hosp.name}</td>
                        <td>{hosp.type || 'General'}</td>
                        <td>{hosp.location}</td>
                        <td>{hosp.contact}</td>
                        <td>{hosp.email}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{hosp.licenseNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PROFILE */}
          {activeTab === 'profile' && (
            <div className="content-panel" style={{ maxWidth: '640px', margin: '0 auto' }}>
              <div className="panel-header">
                <h3 className="panel-title">Blood Bank Profile</h3>
                <span className="badge badge-approved">Admin Verified</span>
              </div>
              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Blood Bank Name</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{currentUser?.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Unique ID</div>
                  <div style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)' }}>{currentUser?.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Contact Phone</div>
                  <div style={{ fontWeight: 600 }}>{currentUser?.contact}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>License Number</div>
                  <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{currentUser?.licenseNumber}</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Address</div>
                  <div style={{ fontWeight: 600 }}>{currentUser?.address || `${currentUser?.location}, AP`}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
