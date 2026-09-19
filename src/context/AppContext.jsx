import React, { createContext, useContext, useEffect, useState } from 'react';

const AppContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const INITIAL_USERS = [];
const INITIAL_REQUESTS = [];
const INITIAL_RESPONSES = [];
const INITIAL_ACTIVITIES = [];

// Donor eligibility: a donor can donate again on the same calendar day
// three calendar months after the last donation (for example, Jan 20 -> Apr 20).
function parseDateOnly(value) {
  if (typeof value !== 'string' || value === 'None' || value.trim() === '') return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) return null;
  return date;
}

function getDonorEligibleOn(lastDonationDate) {
  const lastDonation = parseDateOnly(lastDonationDate);
  if (!lastDonation) return null;

  const target = new Date(lastDonation.getFullYear(), lastDonation.getMonth() + 3, 1);
  const lastDayOfTargetMonth = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0
  ).getDate();

  return new Date(
    target.getFullYear(),
    target.getMonth(),
    Math.min(lastDonation.getDate(), lastDayOfTargetMonth)
  );
}

function isDonorEligible(donor, asOf = new Date()) {
  const eligibleOn = getDonorEligibleOn(donor?.lastDonationDate);
  if (!eligibleOn) return true; // blank/None means first-time donor
  return asOf >= eligibleOn;
}

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  let payload = {};
  try { payload = await response.json(); } catch { /* empty response */ }
  if (!response.ok) {
    const error = new Error(payload?.message || payload?.error || 'Request failed');
    error.payload = payload;
    throw error;
  }
  return payload;
}

export function AppProvider({ children }) {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [responses, setResponses] = useState(INITIAL_RESPONSES);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);

  // Only the current UI session is kept locally. Application data is in MongoDB.
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem('bloodconnect_currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentView, setCurrentView] = useState(() => currentUser ? 'dashboard' : 'landing');
  const [authModal, setAuthModal] = useState(null);
  const [authInitialRole, setAuthInitialRole] = useState('hospital');
  const [generatedCredentialsModal, setGeneratedCredentialsModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const addToast = (message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  };

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const refreshData = async () => {
    try {
      const data = await api('/state');
      setUsers(data.users || []);
      setRequests(data.requests || []);
      setResponses(data.responses || []);
      setActivities(data.activities || []);
      setDataLoaded(true);
      return data;
    } catch (error) {
      console.error('[BloodConnect] Could not load database:', error);
      addToast('Could not connect to the database. Make sure the backend is running.', 'error', 7000);
      return null;
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (currentUser) sessionStorage.setItem('bloodconnect_currentUser', JSON.stringify(currentUser));
    else sessionStorage.removeItem('bloodconnect_currentUser');
  }, [currentUser]);

  const logActivity = async (activity, userOrOrg, role, status = 'Info') => {
    try {
      await api('/activities', {
        method: 'POST',
        body: JSON.stringify({ activity, userOrOrg, role, status })
      });
      await refreshData();
    } catch (error) {
      console.error('[Activity]', error);
    }
  };

  const login = async (role, usernameOrId, password) => {
    try {
      const result = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ role, usernameOrId: usernameOrId.trim(), password })
      });
      setCurrentUser(result.user);
      setCurrentView('dashboard');
      setAuthModal(null);
      await refreshData();
      addToast(`Welcome back, ${result.user.name}! Logged in as ${role.toUpperCase()}.`, 'success');
      return { success: true, user: result.user };
    } catch (error) {
      const p = error.payload || {};
      if (p.status === 'pending') addToast('Account is pending verification by the admin.', 'warning', 6000);
      else if (p.status === 'rejected') addToast('This account registration was rejected by Admin.', 'error');
      else if (p.status === 'blocked') addToast('This account has been deactivated or blocked by Admin.', 'error');
      else addToast(p.message || p.error || 'Login failed.', 'error');
      return { success: false, status: p.status, message: p.message || p.error || 'Login failed.' };
    }
  };

  const logout = async () => {
    if (currentUser) await logActivity(`User logged out: ${currentUser.name}`, currentUser.name, currentUser.role, 'Session Ended');
    setCurrentUser(null);
    setCurrentView('landing');
    addToast('You have been logged out safely.', 'info');
  };

  const register = async (role, formData) => {
    try {
      const result = await api('/users/register', {
        method: 'POST',
        body: JSON.stringify({ role, formData })
      });
      await refreshData();
      addToast('Registration submitted successfully. Your account is waiting for admin verification.', 'success', 6000);
      return result.user;
    } catch (error) {
      addToast(error.message || 'Registration failed.', 'error');
      return null;
    }
  };

  const registerHospital = (formData) => register('hospital', formData);
  const registerBloodBank = (formData) => register('bloodbank', formData);
  // Registration is never blocked by the 3-month rule. The last donation date
  // is only stored so eligibility can be checked later when responding to a request.
  const registerDonor = (formData) => register('donor', formData);

  const sendApprovalEmail = async ({ name, role, email, uniqueId, password }) => {
    if (!email) return { success: false, error: 'No email address on record.' };
    try {
      const payload = await api('/send-approval-email', {
        method: 'POST',
        body: JSON.stringify({ name, role, email, uniqueId, password })
      });
      return { success: true, emailId: payload.emailId };
    } catch (error) {
      return { success: false, error: error.message || 'Unable to send approval email.' };
    }
  };

  const approveAccount = async (userId) => {
    try {
      const result = await api(`/admin/users/${encodeURIComponent(userId)}/approve`, { method: 'POST' });
      await refreshData();
      const emailResult = await sendApprovalEmail(result.credentials);
      if (emailResult.success) addToast(`${result.user.name} approved successfully! Login credentials emailed.`, 'success');
      else addToast(`${result.user.name} approved successfully, but the email could not be sent: ${emailResult.error}`, 'warning', 8000);
      setGeneratedCredentialsModal({ ...result.credentials });
      return result.user;
    } catch (error) {
      addToast(error.message || 'Could not approve account.', 'error');
      return null;
    }
  };

  const rejectAccount = async (userId, reason = 'Documentation incomplete') => {
    try {
      const result = await api(`/admin/users/${encodeURIComponent(userId)}/reject`, {
        method: 'POST', body: JSON.stringify({ reason })
      });
      await refreshData();
      addToast(`${result.user.name} was rejected.`, 'warning');
      return result.user;
    } catch (error) { addToast(error.message, 'error'); return null; }
  };

  const blockAccount = async (userId) => {
    try {
      const result = await api(`/admin/users/${encodeURIComponent(userId)}/block`, { method: 'POST' });
      await refreshData();
      addToast(`Account for ${result.user.name} has been blocked.`, 'error');
      return result.user;
    } catch (error) { addToast(error.message, 'error'); return null; }
  };

  const reactivateAccount = async (userId) => {
    try {
      const result = await api(`/admin/users/${encodeURIComponent(userId)}/reactivate`, { method: 'POST' });
      await refreshData();
      addToast(`Account for ${result.user.name} has been reactivated.`, 'success');
      return result.user;
    } catch (error) { addToast(error.message, 'error'); return null; }
  };

  const createBloodRequest = async (requestData) => {
    try {
      const result = await api('/requests', {
        method: 'POST', body: JSON.stringify({ requestData, currentUser })
      });
      await refreshData();
      addToast(`Blood Request Token generated: ${result.request.token}`, 'success', 5000);
      if (result.matchingDonorsCount > 0) {
        addToast(`Found ${result.matchingDonorsCount} matching registered donors in ${result.request.hospitalLocation}! Requests dispatched.`, 'info', 6000);
      } else {
        addToast(`No immediate donors matching ${result.request.bloodGroup} in ${result.request.hospitalLocation}. Request active on board.`, 'warning', 6000);
      }
      return result.request;
    } catch (error) { addToast(error.message, 'error'); return null; }
  };

  const respondToRequest = async (requestId, donorId, responseStatus) => {
    // Eligibility is checked only when a donor accepts a request, never during registration.
    if (responseStatus === 'Accepted') {
      const donor = users.find((u) => u.id === donorId);
      if (donor && !isDonorEligible(donor)) {
        const eligibleOn = getDonorEligibleOn(donor.lastDonationDate);
        const eligibleDate = eligibleOn ? eligibleOn.toLocaleDateString() : 'a later date';
        addToast(
          `You are not yet eligible to donate blood. You can donate again from ${eligibleDate}.`,
          'warning',
          7000
        );
        return null;
      }
    }

    try {
      const result = await api('/responses', {
        method: 'POST', body: JSON.stringify({ requestId, donorId, responseStatus })
      });
      await refreshData();
      if (responseStatus === 'Accepted') addToast(`Request ${result.response.requestToken} accepted! Hospital contact details revealed.`, 'success', 6000);
      else addToast(`Request ${result.response.requestToken} declined.`, 'info');
      return result.response;
    } catch (error) { addToast(error.message, 'error'); return null; }
  };

  const completeBloodRequest = async (requestId) => {
    try {
      const result = await api(`/requests/${encodeURIComponent(requestId)}/complete`, { method: 'POST' });
      await refreshData();
      addToast(`Blood Request ${result.request.token} marked as Completed!`, 'success');
      return result.request;
    } catch (error) { addToast(error.message, 'error'); return null; }
  };

  const cancelBloodRequest = async (requestId) => {
    try {
      const result = await api(`/requests/${encodeURIComponent(requestId)}/cancel`, { method: 'POST' });
      await refreshData();
      addToast(`Blood Request ${result.request.token} cancelled.`, 'warning');
      return result.request;
    } catch (error) { addToast(error.message, 'error'); return null; }
  };

  const updateDonorAvailability = async (donorId, availability) => {
    try {
      const result = await api(`/users/${encodeURIComponent(donorId)}`, {
        method: 'PATCH', body: JSON.stringify({ availability })
      });
      if (currentUser?.id === donorId) setCurrentUser(result.user);
      await refreshData();
      addToast(`Your availability updated to "${availability}".`, 'info');
    } catch (error) { addToast(error.message, 'error'); }
  };

  const updateDonorProfile = async (donorId, profileData) => {
    try {
      const result = await api(`/users/${encodeURIComponent(donorId)}`, {
        method: 'PATCH', body: JSON.stringify(profileData)
      });
      if (currentUser?.id === donorId) setCurrentUser(result.user);
      await refreshData();
      addToast('Profile updated successfully.', 'success');
    } catch (error) { addToast(error.message, 'error'); }
  };

  const addCoordinationNote = async (requestId, note) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;
    await logActivity(`Blood Bank coordination note logged for ${req.token}: "${note}"`, currentUser?.name || 'Blood Bank', 'Blood Bank', 'Coordinated');
    addToast(`Coordination logged for ${req.token}`, 'success');
  };

  const value = {
    users, requests, responses, activities, currentUser, currentView, authModal,
    authInitialRole, generatedCredentialsModal, toasts, dataLoaded,
    setCurrentView, setAuthModal, setAuthInitialRole, setGeneratedCredentialsModal,
    login, logout, registerHospital, registerBloodBank, registerDonor,
    approveAccount, rejectAccount, blockAccount, reactivateAccount,
    createBloodRequest, respondToRequest, completeBloodRequest, cancelBloodRequest,
    updateDonorAvailability, updateDonorProfile, addCoordinationNote,
    addToast, removeToast, logActivity, refreshData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
