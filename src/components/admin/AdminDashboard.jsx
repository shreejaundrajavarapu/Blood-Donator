import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Building2,
  HeartHandshake,
  Droplet,
  Users,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  LogOut,
  Ban,
  Check,
  Eye,
  Trash2,
  RefreshCw,
  X,
  FileText
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    currentUser,
    users,
    requests,
    activities,
    approveAccount,
    rejectAccount,
    blockAccount,
    reactivateAccount,
    logout,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'hospitals' | 'bloodbanks' | 'donors' | 'requests' | 'users' | 'activity'
  const [searchQuery, setSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');

  // Inspection modal state
  const [inspectUser, setInspectUser] = useState(null);

  // Filtered lists
  const hospitals = users.filter((u) => u.role === 'hospital');
  const bloodBanks = users.filter((u) => u.role === 'bloodbank');
  const donors = users.filter((u) => u.role === 'donor');

  // Metric counts
  const pendingHospitals = hospitals.filter((u) => u.status === 'Pending Verification').length;
  const pendingBloodBanks = bloodBanks.filter((u) => u.status === 'Pending Verification').length;
  const pendingDonors = donors.filter((u) => u.status === 'Pending Verification').length;

  const activeRequests = requests.filter((r) => r.status === 'Pending').length;
  const acceptedRequests = requests.filter((r) => r.status === 'Accepted').length;
  const completedRequests = requests.filter((r) => r.status === 'Completed').length;
  const cancelledRequests = requests.filter((r) => r.status === 'Cancelled').length;

  // Filtered users for User Management tab
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.location && u.location.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'ALL' || u.status === userStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="brand-logo">
            <div className="brand-logo-icon">
              <ShieldCheck size={18} fill="#ffffff" />
            </div>
            <div>
              <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>Admin Console</span>
              <span
                style={{
                  fontSize: '0.68rem',
                  display: 'block',
                  color: 'var(--text-muted)',
                  fontWeight: 600
                }}
              >
                National Blood Registry
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
            className={`sidebar-nav-item ${activeTab === 'hospitals' ? 'active' : ''}`}
            onClick={() => setActiveTab('hospitals')}
          >
            <Building2 size={18} />
            <span>Hospital Verification</span>
            {pendingHospitals > 0 && (
              <span
                className="badge badge-pending"
                style={{ marginLeft: 'auto', padding: '2px 6px', fontSize: '0.7rem' }}
              >
                {pendingHospitals}
              </span>
            )}
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'bloodbanks' ? 'active' : ''}`}
            onClick={() => setActiveTab('bloodbanks')}
          >
            <HeartHandshake size={18} />
            <span>Blood Bank Verification</span>
            {pendingBloodBanks > 0 && (
              <span
                className="badge badge-pending"
                style={{ marginLeft: 'auto', padding: '2px 6px', fontSize: '0.7rem' }}
              >
                {pendingBloodBanks}
              </span>
            )}
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'donors' ? 'active' : ''}`}
            onClick={() => setActiveTab('donors')}
          >
            <Droplet size={18} />
            <span>Donor Verification</span>
            {pendingDonors > 0 && (
              <span
                className="badge badge-pending"
                style={{ marginLeft: 'auto', padding: '2px 6px', fontSize: '0.7rem' }}
              >
                {pendingDonors}
              </span>
            )}
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <FileText size={18} />
            <span>Blood Request Monitoring</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            <span>User Accounts</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <Activity size={18} />
            <span>System Activity</span>
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
              {activeTab === 'overview' && 'System Overview & Quick Verification'}
              {activeTab === 'hospitals' && 'Hospital Account Verification'}
              {activeTab === 'bloodbanks' && 'Blood Bank Verification'}
              {activeTab === 'donors' && 'Donor Verification Queue'}
              {activeTab === 'requests' && 'Blood Request Token Monitoring'}
              {activeTab === 'users' && 'Global Account Management'}
              {activeTab === 'activity' && 'Real-time System Audit Trail'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Super Admin &middot; Authenticated System Administrator
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

            <div className="topbar-user-badge">
              <div className="user-avatar-circle" style={{ background: '#0f172a' }}>
                AD
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>System Admin</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: ADMIN-001</div>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* STATS OVERVIEW CARDS (Strictly matching Specification) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '12px',
              marginBottom: '32px'
            }}
          >
            <div className="stat-card" style={{ padding: '16px 12px' }}>
              <div className="stat-info">
                <h3 style={{ fontSize: '1.4rem' }}>{pendingHospitals}</h3>
                <p style={{ fontSize: '0.72rem' }}>Pending Hospitals</p>
              </div>
            </div>

            <div className="stat-card" style={{ padding: '16px 12px' }}>
              <div className="stat-info">
                <h3 style={{ fontSize: '1.4rem' }}>{pendingBloodBanks}</h3>
                <p style={{ fontSize: '0.72rem' }}>Pending Blood Banks</p>
              </div>
            </div>

            <div className="stat-card" style={{ padding: '16px 12px' }}>
              <div className="stat-info">
                <h3 style={{ fontSize: '1.4rem' }}>{pendingDonors}</h3>
                <p style={{ fontSize: '0.72rem' }}>Pending Donors</p>
              </div>
            </div>

            <div className="stat-card" style={{ padding: '16px 12px' }}>
              <div className="stat-info">
                <h3 style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>{activeRequests}</h3>
                <p style={{ fontSize: '0.72rem' }}>Active Requests</p>
              </div>
            </div>

            <div className="stat-card" style={{ padding: '16px 12px' }}>
              <div className="stat-info">
                <h3 style={{ fontSize: '1.4rem', color: '#16a34a' }}>{acceptedRequests}</h3>
                <p style={{ fontSize: '0.72rem' }}>Accepted</p>
              </div>
            </div>

            <div className="stat-card" style={{ padding: '16px 12px' }}>
              <div className="stat-info">
                <h3 style={{ fontSize: '1.4rem' }}>{completedRequests}</h3>
                <p style={{ fontSize: '0.72rem' }}>Completed</p>
              </div>
            </div>

            <div className="stat-card" style={{ padding: '16px 12px' }}>
              <div className="stat-info">
                <h3 style={{ fontSize: '1.4rem', color: '#94a3b8' }}>{cancelledRequests}</h3>
                <p style={{ fontSize: '0.72rem' }}>Cancelled</p>
              </div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW & PENDING REGISTRATIONS */}
          {activeTab === 'overview' && (
            <div>
              {/* Immediate Attention Callout */}
              {pendingHospitals > 0 || pendingBloodBanks > 0 || pendingDonors > 0 ? (
                <div
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '28px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <AlertTriangle size={24} color="#b45309" />
                    <div>
                      <div style={{ fontWeight: 700, color: '#92400e' }}>
                        Pending Verifications Waiting for Approval:
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#b45309' }}>
                        {pendingHospitals} Hospital(s), {pendingBloodBanks} Blood Bank(s), {pendingDonors} Donor(s)
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {pendingHospitals > 0 && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setActiveTab('hospitals')}
                      >
                        Review Hospitals
                      </button>
                    )}
                    {pendingDonors > 0 && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setActiveTab('donors')}
                      >
                        Review Donors
                      </button>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Pending Queue Table */}
              <div className="content-panel">
                <div className="panel-header">
                  <div>
                    <h3 className="panel-title">Pending Organization & Donor Verifications</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Review registrations and generate unique credentials upon approval
                    </p>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Applicant Name</th>
                        <th>Role</th>
                        <th>Location</th>
                        <th>Contact</th>
                        <th>Email / License</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter((u) => u.status === 'Pending Verification').length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                            No pending registrations right now. All organizations and donors are verified.
                          </td>
                        </tr>
                      ) : (
                        users
                          .filter((u) => u.status === 'Pending Verification')
                          .map((u) => (
                            <tr key={u.id}>
                              <td style={{ fontWeight: 700 }}>{u.name}</td>
                              <td>
                                <span
                                  className="badge"
                                  style={{
                                    background:
                                      u.role === 'hospital'
                                        ? 'var(--primary-light)'
                                        : u.role === 'bloodbank'
                                        ? '#fef3c7'
                                        : '#eff6ff',
                                    color:
                                      u.role === 'hospital'
                                        ? 'var(--primary)'
                                        : u.role === 'bloodbank'
                                        ? '#92400e'
                                        : '#1d4ed8'
                                  }}
                                >
                                  {u.role.toUpperCase()}
                                </span>
                              </td>
                              <td>{u.location}</td>
                              <td>{u.contact || u.phone}</td>
                              <td style={{ fontSize: '0.8rem' }}>{u.licenseNumber || u.email}</td>
                              <td>
                                <span className="badge badge-pending">Pending Verification</span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    className="btn btn-outline btn-sm"
                                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                    onClick={() => setInspectUser(u)}
                                  >
                                    <Eye size={13} />
                                    <span>View</span>
                                  </button>
                                  <button
                                    className="btn btn-success btn-sm"
                                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                    onClick={() => approveAccount(u.id)}
                                  >
                                    <Check size={13} />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    className="btn btn-outline btn-sm"
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ef4444' }}
                                    onClick={() => rejectAccount(u.id)}
                                  >
                                    <Ban size={13} />
                                    <span>Reject</span>
                                  </button>
                                </div>
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

          {/* TAB 2: HOSPITAL VERIFICATION */}
          {activeTab === 'hospitals' && (
            <div className="content-panel">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Hospital Verification Registry</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Verify hospital licenses, approve access, or block accounts
                  </p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Hospital Name</th>
                      <th>Hospital Type</th>
                      <th>Location</th>
                      <th>Contact</th>
                      <th>Email</th>
                      <th>License Number</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hospitals.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                          No registrations are waiting for review.
                        </td>
                      </tr>
                    ) : (
                      hospitals.map((hosp) => (
                      <tr key={hosp.id}>
                        <td style={{ fontWeight: 700 }}>{hosp.name}</td>
                        <td>{hosp.type || 'General'}</td>
                        <td>{hosp.location}</td>
                        <td>{hosp.contact}</td>
                        <td>{hosp.email}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{hosp.licenseNumber}</td>
                        <td>
                          <span
                            className={`badge ${
                              hosp.status === 'Approved'
                                ? 'badge-approved'
                                : hosp.status === 'Pending Verification'
                                ? 'badge-pending'
                                : 'badge-rejected'
                            }`}
                          >
                            {hosp.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => setInspectUser(hosp)}
                            >
                              <Eye size={13} />
                              <span>View</span>
                            </button>

                            {hosp.status === 'Pending Verification' && (
                              <>
                                <button
                                  className="btn btn-success btn-sm"
                                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                  onClick={() => approveAccount(hosp.id)}
                                >
                                  <Check size={13} />
                                  <span>Approve</span>
                                </button>
                                <button
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ef4444' }}
                                  onClick={() => rejectAccount(hosp.id)}
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {hosp.status === 'Approved' && (
                              <button
                                className="btn btn-outline btn-sm"
                                style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ef4444' }}
                                onClick={() => blockAccount(hosp.id)}
                              >
                                Block
                              </button>
                            )}

                            {hosp.status === 'Blocked' && (
                              <button
                                className="btn btn-outline btn-sm"
                                style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#16a34a' }}
                                onClick={() => reactivateAccount(hosp.id)}
                              >
                                Reactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: BLOOD BANK VERIFICATION */}
          {activeTab === 'bloodbanks' && (
            <div className="content-panel">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Blood Bank Verification</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Verify coordination centers (Strictly no blood stock management)
                  </p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Blood Bank Name</th>
                      <th>Location</th>
                      <th>Contact</th>
                      <th>Email</th>
                      <th>Registration Number</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bloodBanks.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                          No registrations are waiting for review.
                        </td>
                      </tr>
                    ) : (
                      bloodBanks.map((bb) => (
                      <tr key={bb.id}>
                        <td style={{ fontWeight: 700 }}>{bb.name}</td>
                        <td>{bb.location}</td>
                        <td>{bb.contact}</td>
                        <td>{bb.email}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{bb.licenseNumber}</td>
                        <td>
                          <span
                            className={`badge ${
                              bb.status === 'Approved'
                                ? 'badge-approved'
                                : bb.status === 'Pending Verification'
                                ? 'badge-pending'
                                : 'badge-rejected'
                            }`}
                          >
                            {bb.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => setInspectUser(bb)}
                            >
                              <Eye size={13} />
                              <span>View</span>
                            </button>

                            {bb.status === 'Pending Verification' && (
                              <>
                                <button
                                  className="btn btn-success btn-sm"
                                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                  onClick={() => approveAccount(bb.id)}
                                >
                                  <Check size={13} />
                                  <span>Approve</span>
                                </button>
                                <button
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ef4444' }}
                                  onClick={() => rejectAccount(bb.id)}
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {bb.status === 'Approved' && (
                              <button
                                className="btn btn-outline btn-sm"
                                style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ef4444' }}
                                onClick={() => blockAccount(bb.id)}
                              >
                                Block
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DONOR VERIFICATION */}
          {activeTab === 'donors' && (
            <div className="content-panel">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Donor Verification Queue</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Verify registered donors before making them available for emergency matching
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
                      <th>Phone</th>
                      <th>Availability</th>
                      <th>Last Donation Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donors.map((d) => (
                      <tr key={d.id}>
                        <td style={{ fontWeight: 700 }}>{d.name}</td>
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
                            {d.bloodGroup}
                          </span>
                        </td>
                        <td>{d.location}</td>
                        <td style={{ fontFamily: 'monospace' }}>{d.phone}</td>
                        <td>
                          <span
                            className={`badge ${
                              d.availability === 'Available' ? 'badge-accepted' : 'badge-pending'
                            }`}
                          >
                            {d.availability}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{d.lastDonationDate}</td>
                        <td>
                          <span
                            className={`badge ${
                              d.status === 'Approved'
                                ? 'badge-approved'
                                : d.status === 'Pending Verification'
                                ? 'badge-pending'
                                : 'badge-rejected'
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => setInspectUser(d)}
                            >
                              <Eye size={13} />
                              <span>View</span>
                            </button>

                            {d.status === 'Pending Verification' && (
                              <>
                                <button
                                  className="btn btn-success btn-sm"
                                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                  onClick={() => approveAccount(d.id)}
                                >
                                  <Check size={13} />
                                  <span>Approve</span>
                                </button>
                                <button
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ef4444' }}
                                  onClick={() => rejectAccount(d.id)}
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {d.status === 'Approved' && (
                              <button
                                className="btn btn-outline btn-sm"
                                style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ef4444' }}
                                onClick={() => blockAccount(d.id)}
                              >
                                Block
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: BLOOD REQUEST MONITORING */}
          {activeTab === 'requests' && (
            <div className="content-panel">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Blood Request Monitoring Hub</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Real-time monitoring of all active and historical blood request tokens
                  </p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Request Token</th>
                      <th>Hospital</th>
                      <th>Blood Group</th>
                      <th>Location</th>
                      <th>Donors Needed</th>
                      <th>Required Date</th>
                      <th>Required Time</th>
                      <th>Urgency</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id}>
                        <td>
                          <span className="token-pill">{req.token}</span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{req.hospitalName}</td>
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
                        <td>{req.hospitalLocation}</td>
                        <td>{req.donorsRequired}</td>
                        <td>{req.requiredDate}</td>
                        <td>{req.requiredTime}</td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: GLOBAL USER ACCOUNT MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="content-panel">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Global User Accounts</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Filter by role and status, block, deactivate or reactivate accounts
                  </p>
                </div>

                <div className="panel-actions">
                  <div style={{ position: 'relative' }}>
                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '32px', width: '220px', height: '36px', fontSize: '0.825rem' }}
                      placeholder="Search accounts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <select
                    className="form-select"
                    style={{ width: '130px', height: '36px', fontSize: '0.825rem' }}
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                  >
                    <option value="ALL">All Roles</option>
                    <option value="hospital">Hospitals</option>
                    <option value="bloodbank">Blood Banks</option>
                    <option value="donor">Donors</option>
                    <option value="admin">Admins</option>
                  </select>

                  <select
                    className="form-select"
                    style={{ width: '150px', height: '36px', fontSize: '0.825rem' }}
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending Verification">Pending</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name / Organization</th>
                      <th>Role</th>
                      <th>Contact</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Registration Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 700 }}>
                          {u.name}
                          <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                            {u.id}
                          </div>
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              background:
                                u.role === 'hospital'
                                  ? 'var(--primary-light)'
                                  : u.role === 'bloodbank'
                                  ? '#fef3c7'
                                  : u.role === 'admin'
                                  ? '#f1f5f9'
                                  : '#eff6ff',
                              color:
                                u.role === 'hospital'
                                  ? 'var(--primary)'
                                  : u.role === 'bloodbank'
                                  ? '#92400e'
                                  : u.role === 'admin'
                                  ? '#0f172a'
                                  : '#1d4ed8'
                            }}
                          >
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td>{u.contact || u.phone}</td>
                        <td>{u.location}</td>
                        <td>
                          <span
                            className={`badge ${
                              u.status === 'Approved'
                                ? 'badge-approved'
                                : u.status === 'Pending Verification'
                                ? 'badge-pending'
                                : 'badge-rejected'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.createdAt}</td>
                        <td>
                          {u.role !== 'admin' && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {u.status === 'Pending Verification' && (
                                <button
                                  className="btn btn-success btn-sm"
                                  style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                                  onClick={() => approveAccount(u.id)}
                                >
                                  Approve
                                </button>
                              )}
                              {u.status === 'Approved' && (
                                <button
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '3px 8px', fontSize: '0.72rem', color: '#ef4444' }}
                                  onClick={() => blockAccount(u.id)}
                                >
                                  Block
                                </button>
                              )}
                              {u.status === 'Blocked' && (
                                <button
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '3px 8px', fontSize: '0.72rem', color: '#16a34a' }}
                                  onClick={() => reactivateAccount(u.id)}
                                >
                                  Reactivate
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: BASIC SYSTEM ACTIVITY AUDIT */}
          {activeTab === 'activity' && (
            <div className="content-panel">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">System Activity Log</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Complete audit trail of registrations, approvals, requests, and donor responses
                  </p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Activity</th>
                      <th>User / Organization</th>
                      <th>Role</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status / Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((act) => (
                      <tr key={act.id}>
                        <td style={{ fontWeight: 600 }}>{act.activity}</td>
                        <td>{act.userOrOrg}</td>
                        <td>
                          <span className="badge" style={{ background: '#f1f5f9', color: '#334155' }}>
                            {act.role}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{act.date}</td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{act.time}</td>
                        <td>
                          <span
                            className={`badge ${
                              act.status === 'Approved' || act.status === 'Accepted'
                                ? 'badge-accepted'
                                : act.status === 'Emergency'
                                ? 'badge-emergency pulse-emergency'
                                : act.status === 'Pending Verification'
                                ? 'badge-pending'
                                : 'badge-completed'
                            }`}
                          >
                            {act.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* USER INSPECTION MODAL */}
      {inspectUser && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye color="var(--primary)" size={20} />
                <h3 className="modal-title">Verification Details: {inspectUser.name}</h3>
              </div>
              <button onClick={() => setInspectUser(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>
                    Entity Name
                  </div>
                  <div style={{ fontWeight: 700 }}>{inspectUser.name}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Role</div>
                  <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{inspectUser.role}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>
                    City / Location
                  </div>
                  <div style={{ fontWeight: 600 }}>{inspectUser.location}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Status</div>
                  <span
                    className={`badge ${
                      inspectUser.status === 'Approved' ? 'badge-approved' : 'badge-pending'
                    }`}
                  >
                    {inspectUser.status}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Contact</div>
                  <div style={{ fontWeight: 600 }}>{inspectUser.contact || inspectUser.phone}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Email</div>
                  <div style={{ fontWeight: 600 }}>{inspectUser.email || 'N/A'}</div>
                </div>

                {inspectUser.licenseNumber && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>
                      Official Registration / License
                    </div>
                    <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>{inspectUser.licenseNumber}</div>
                  </div>
                )}

                {inspectUser.bloodGroup && (
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>
                      Blood Group
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{inspectUser.bloodGroup}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              {inspectUser.status === 'Pending Verification' && (
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => {
                    approveAccount(inspectUser.id);
                    setInspectUser(null);
                  }}
                >
                  <Check size={14} />
                  <span>Approve & Generate Credentials</span>
                </button>
              )}
              <button className="btn btn-outline btn-sm" onClick={() => setInspectUser(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
