import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const STORAGE_KEY = 'bloodconnect_db_v2';

const INITIAL_USERS = [
  // Admin
  {
    id: 'ADMIN-001',
    loginId: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Super Admin',
    status: 'Approved',
    contact: '+91 80000 11222',
    email: 'admin@bloodconnect.org',
    location: 'National HQ',
    createdAt: '2026-01-01'
  }
];

const INITIAL_REQUESTS = [];

const INITIAL_RESPONSES = [];

const INITIAL_ACTIVITIES = [];

export function AppProvider({ children }) {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_requests`);
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [responses, setResponses] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_responses`);
    return saved ? JSON.parse(saved) : INITIAL_RESPONSES;
  });

  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_activities`);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  // Current Logged In User
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_currentUser`);
    return saved ? JSON.parse(saved) : null;
  });

  // Active View / Page (landing, login, register, dashboard)
  const [currentView, setCurrentView] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_currentUser`);
    return saved ? 'dashboard' : 'landing';
  });

  // Auth Modal State: null | 'login' | 'register'
  const [authModal, setAuthModal] = useState(null);
  const [authInitialRole, setAuthInitialRole] = useState('hospital');

  // Simulated Email / Generated Credentials Modal State
  const [generatedCredentialsModal, setGeneratedCredentialsModal] = useState(null);

  // Active toast notifications
  const [toasts, setToasts] = useState([]);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_requests`, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_responses`, JSON.stringify(responses));
  }, [responses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_currentUser`);
    }
  }, [currentUser]);

  // Toast Helper
  const addToast = (message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Activity Log Helper
  const logActivity = (activity, userOrOrg, role, status = 'Info') => {
    const now = new Date();
    const newAct = {
      id: `ACT-${Date.now().toString().slice(-6)}`,
      activity,
      userOrOrg,
      role,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // Authentication: Login
  const login = (role, usernameOrId, password) => {
    const cleanId = usernameOrId.trim();
    const user = users.find(
      (u) =>
        u.role === role &&
        (u.loginId.toLowerCase() === cleanId.toLowerCase() ||
          u.id.toLowerCase() === cleanId.toLowerCase() ||
          (u.email && u.email.toLowerCase() === cleanId.toLowerCase()))
    );

    if (!user) {
      addToast('Invalid credentials. Please check your username/ID and password.', 'error');
      return { success: false, message: 'User not found' };
    }

    if (user.password !== password) {
      addToast('Incorrect password entered.', 'error');
      return { success: false, message: 'Incorrect password' };
    }

    if (user.status === 'Pending Verification') {
      addToast(
        'Account is pending verification by the admin. Access restricted until approved.',
        'warning',
        6000
      );
      return {
        success: false,
        status: 'pending',
        message: 'Your registration is currently under review by Admin.'
      };
    }

    if (user.status === 'Rejected') {
      addToast('This account registration was rejected by Admin.', 'error');
      return { success: false, status: 'rejected', message: 'Account rejected by Admin.' };
    }

    if (user.status === 'Blocked' || user.status === 'Deactivated') {
      addToast('This account has been deactivated or blocked by Admin.', 'error');
      return { success: false, status: 'blocked', message: 'Account deactivated.' };
    }

    // Success
    setCurrentUser(user);
    setCurrentView('dashboard');
    setAuthModal(null);
    addToast(`Welcome back, ${user.name}! Logged in as ${role.toUpperCase()}.`, 'success');
    logActivity(`User logged in: ${user.name}`, user.name, user.role, 'Active');
    return { success: true, user };
  };

  const logout = () => {
    if (currentUser) {
      logActivity(`User logged out: ${currentUser.name}`, currentUser.name, currentUser.role, 'Session Ended');
    }
    setCurrentUser(null);
    setCurrentView('landing');
    addToast('You have been logged out safely.', 'info');
  };

  // Registration: Hospital
  const registerHospital = (formData) => {
    const id = `HOSP-2026-${String(users.filter((u) => u.role === 'hospital').length + 1).padStart(3, '0')}`;
    const newHospital = {
      id,
      loginId: formData.email.split('@')[0] || `hosp_${Date.now().toString().slice(-4)}`,
      password: 'pending_admin_approval',
      role: 'hospital',
      name: formData.name,
      type: formData.type || 'General Hospital',
      contact: formData.contact,
      email: formData.email,
      location: formData.location,
      address: formData.address || `${formData.location} Medical Zone`,
      licenseNumber: formData.licenseNumber,
      status: 'Pending Verification',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers((prev) => [...prev, newHospital]);
    logActivity(`New Hospital registration: ${newHospital.name}`, newHospital.name, 'Hospital', 'Pending Verification');
    addToast('Registration submitted successfully. Your account is waiting for admin verification.', 'success', 6000);
    return newHospital;
  };

  // Registration: Blood Bank
  const registerBloodBank = (formData) => {
    const id = `BB-2026-${String(users.filter((u) => u.role === 'bloodbank').length + 1).padStart(3, '0')}`;
    const newBloodBank = {
      id,
      loginId: formData.email.split('@')[0] || `bb_${Date.now().toString().slice(-4)}`,
      password: 'pending_admin_approval',
      role: 'bloodbank',
      name: formData.name,
      contact: formData.contact,
      email: formData.email,
      location: formData.location,
      address: formData.address || `${formData.location} Central Hub`,
      licenseNumber: formData.licenseNumber,
      status: 'Pending Verification',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers((prev) => [...prev, newBloodBank]);
    logActivity(`New Blood Bank registration: ${newBloodBank.name}`, newBloodBank.name, 'Blood Bank', 'Pending Verification');
    addToast('Registration submitted successfully. Your account is waiting for admin verification.', 'success', 6000);
    return newBloodBank;
  };

  // Registration: Donor
  const registerDonor = (formData) => {
    const id = `DONOR-${String(users.filter((u) => u.role === 'donor').length + 1).padStart(3, '0')}`;
    const newDonor = {
      id,
      loginId: id,
      password: 'donor123',
      role: 'donor',
      name: formData.name,
      bloodGroup: formData.bloodGroup,
      location: formData.location,
      phone: formData.phone,
      email: formData.email || '',
      age: Number(formData.age),
      availability: formData.availability || 'Available',
      lastDonationDate: formData.lastDonationDate || 'None',
      status: 'Pending Verification',
      donationsCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers((prev) => [...prev, newDonor]);
    logActivity(`New Donor registration: ${newDonor.name} (${newDonor.bloodGroup})`, newDonor.name, 'Donor', 'Pending Verification');
    addToast('Registration submitted successfully. Your donor account is waiting for admin verification.', 'success', 6000);
    return newDonor;
  };

  const sendApprovalEmail = async ({ name, role, email, uniqueId, password }) => {
    if (!email) {
      return { success: false, error: 'No email address on record.' };
    }

    try {
      const response = await fetch('http://localhost:4000/api/send-approval-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, email, uniqueId, password })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Email service returned an error.');
      }

      return { success: true, emailId: payload.emailId };
    } catch (error) {
      console.error('[Approval Email] Failed to send:', error);

      const message = error instanceof TypeError && error.message === 'Failed to fetch'
        ? 'The email server is not running. Start it with: node server/index.js from the project root.'
        : error.message || 'Unable to send approval email.';

      return { success: false, error: message };
    }
  };

  // Admin Account Actions
  const approveAccount = async (userId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    // Generate unique ID & password if it's hospital or bloodbank
    let generatedLoginId = user.loginId;
    let generatedPassword = user.password;

    if (user.role === 'hospital') {
      generatedLoginId = user.id; // e.g. HOSP-2026-002
      generatedPassword = `hosp_${Math.floor(100 + Math.random() * 900)}`;
    } else if (user.role === 'bloodbank') {
      generatedLoginId = user.id; // e.g. BB-2026-002
      generatedPassword = `bb_${Math.floor(100 + Math.random() * 900)}`;
    } else if (user.role === 'donor') {
      generatedLoginId = user.id; // e.g. DONOR-007
      generatedPassword = `donor_${Math.floor(100 + Math.random() * 900)}`;
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: 'Approved',
              loginId: generatedLoginId,
              password: generatedPassword
            }
          : u
      )
    );

    const emailResult = await sendApprovalEmail({
      name: user.name,
      role: user.role,
      email: user.email || `${user.loginId}@bloodconnect.org`,
      uniqueId: generatedLoginId,
      password: generatedPassword
    });

    logActivity(`Admin approved ${user.role}: ${user.name}`, 'System Admin', 'Admin', 'Approved');
    if (emailResult.success) {
      addToast(`${user.name} approved successfully! Login credentials emailed.`, 'success');
    } else {
      addToast(`${user.name} approved successfully, but the email could not be sent: ${emailResult.error}`, 'warning', 8000);
    }

    // Simulate generated email flow modal
    setGeneratedCredentialsModal({
      name: user.name,
      role: user.role,
      email: user.email || `${user.loginId}@bloodconnect.org`,
      uniqueId: generatedLoginId,
      password: generatedPassword
    });
  };

  const rejectAccount = (userId, reason = 'Documentation incomplete') => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'Rejected', rejectionReason: reason } : u))
    );

    logActivity(`Admin rejected ${user.role}: ${user.name}`, 'System Admin', 'Admin', 'Rejected');
    addToast(`${user.name} was rejected.`, 'warning');
  };

  const blockAccount = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: 'Blocked' } : u)));

    logActivity(`Admin blocked account: ${user.name}`, 'System Admin', 'Admin', 'Blocked');
    addToast(`Account for ${user.name} has been blocked.`, 'error');
  };

  const reactivateAccount = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: 'Approved' } : u)));

    logActivity(`Admin reactivated account: ${user.name}`, 'System Admin', 'Admin', 'Approved');
    addToast(`Account for ${user.name} has been reactivated.`, 'success');
  };

  // Hospital: Create Blood Request
  const createBloodRequest = (requestData) => {
    // Generate unique token BDR-2026-XXXXXX
    const tokenSeq = String(requests.length + 102).padStart(6, '0');
    const token = `BDR-2026-${tokenSeq}`;

    // Find registered approved donors matching:
    // 1. Blood Group
    // 2. Location
    const matchingDonors = users.filter(
      (u) =>
        u.role === 'donor' &&
        u.status === 'Approved' &&
        u.availability === 'Available' &&
        u.bloodGroup.trim().toLowerCase() === requestData.bloodGroup.trim().toLowerCase() &&
        u.location.trim().toLowerCase() === requestData.hospitalLocation.trim().toLowerCase()
    );

    const newRequest = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      token,
      hospitalId: currentUser?.id || `HOSP-${Date.now().toString().slice(-4)}`,
      hospitalName: currentUser?.name || requestData.hospitalName || 'Registered Hospital',
      hospitalLocation: currentUser?.location || requestData.hospitalLocation || 'Specified Location',
      hospitalContact: currentUser?.contact || requestData.hospitalContact || 'Contact Not Provided',
      patientNameOrId: requestData.patientNameOrId,
      bloodGroup: requestData.bloodGroup,
      donorsRequired: Number(requestData.donorsRequired) || 1,
      requiredDate: requestData.requiredDate,
      requiredTime: requestData.requiredTime,
      donationLocation: requestData.donationLocation,
      urgency: requestData.urgency || 'Normal',
      reason: requestData.reason || '',
      instructions: requestData.instructions || '',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      matchedDonorsCount: matchingDonors.length
    };

    setRequests((prev) => [newRequest, ...prev]);

    logActivity(
      `Blood Request Token generated: ${token} (${newRequest.bloodGroup} at ${newRequest.hospitalLocation})`,
      newRequest.hospitalName,
      'Hospital',
      newRequest.urgency
    );

    addToast(`Blood Request Token generated: ${token}`, 'success', 5000);
    if (matchingDonors.length > 0) {
      addToast(`Found ${matchingDonors.length} matching registered donors in ${newRequest.hospitalLocation}! Requests dispatched.`, 'info', 6000);
    } else {
      addToast(`No immediate donors matching ${newRequest.bloodGroup} in ${newRequest.hospitalLocation}. Request active on board.`, 'warning', 6000);
    }

    return newRequest;
  };

  // Donor: Accept or Decline Request
  const respondToRequest = (requestId, donorId, responseStatus) => {
    const req = requests.find((r) => r.id === requestId);
    const donor = users.find((u) => u.id === donorId);
    if (!req || !donor) return;

    const existingIndex = responses.findIndex(
      (res) => res.requestId === requestId && res.donorId === donorId
    );

    const now = new Date();
    const formattedTime = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const responseEntry = {
      id: existingIndex >= 0 ? responses[existingIndex].id : `RESP-${Date.now().toString().slice(-6)}`,
      requestId,
      requestToken: req.token,
      donorId,
      donorName: donor.name,
      bloodGroup: donor.bloodGroup,
      donorLocation: donor.location,
      donorPhone: donor.phone,
      donorEmail: donor.email || '',
      status: responseStatus,
      responseTime: formattedTime
    };

    if (existingIndex >= 0) {
      setResponses((prev) => prev.map((r, i) => (i === existingIndex ? responseEntry : r)));
    } else {
      setResponses((prev) => [responseEntry, ...prev]);
    }

    // If Accepted, also update request status to 'Accepted' if currently 'Pending'
    if (responseStatus === 'Accepted') {
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId && r.status === 'Pending' ? { ...r, status: 'Accepted' } : r))
      );

      // Increment donor donation counter optionally
      setUsers((prev) =>
        prev.map((u) => (u.id === donorId ? { ...u, donationsCount: (u.donationsCount || 0) + 1 } : u))
      );

      addToast(`Request ${req.token} accepted! Hospital contact details revealed.`, 'success', 6000);
      logActivity(`Donor ${donor.name} accepted request ${req.token}`, donor.name, 'Donor', 'Accepted');
    } else {
      addToast(`Request ${req.token} declined.`, 'info');
      logActivity(`Donor ${donor.name} declined request ${req.token}`, donor.name, 'Donor', 'Declined');
    }
  };

  // Hospital: Complete Request
  const completeBloodRequest = (requestId) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Completed' } : r))
    );

    logActivity(`Request ${req.token} marked as Completed`, req.hospitalName, 'Hospital', 'Completed');
    addToast(`Blood Request ${req.token} marked as Completed!`, 'success');
  };

  // Hospital: Cancel Request
  const cancelBloodRequest = (requestId) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Cancelled' } : r))
    );

    logActivity(`Request ${req.token} cancelled`, req.hospitalName, 'Hospital', 'Cancelled');
    addToast(`Blood Request ${req.token} cancelled.`, 'warning');
  };

  // Donor: Update Availability
  const updateDonorAvailability = (donorId, availability) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === donorId ? { ...u, availability } : u))
    );
    if (currentUser?.id === donorId) {
      setCurrentUser((prev) => ({ ...prev, availability }));
    }
    addToast(`Your availability updated to "${availability}".`, 'info');
  };

  // Donor: Update Profile
  const updateDonorProfile = (donorId, profileData) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === donorId ? { ...u, ...profileData } : u))
    );
    if (currentUser?.id === donorId) {
      setCurrentUser((prev) => ({ ...prev, ...profileData }));
    }
    addToast('Profile updated successfully.', 'success');
  };

  // Blood Bank Coordination Note
  const addCoordinationNote = (requestId, note) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    logActivity(`Blood Bank coordination note logged for ${req.token}: "${note}"`, currentUser?.name || 'Blood Bank', 'Blood Bank', 'Coordinated');
    addToast(`Coordination logged for ${req.token}`, 'success');
  };

  const value = {
    users,
    requests,
    responses,
    activities,
    currentUser,
    currentView,
    authModal,
    authInitialRole,
    generatedCredentialsModal,
    toasts,
    setCurrentView,
    setAuthModal,
    setAuthInitialRole,
    setGeneratedCredentialsModal,
    login,
    logout,
    registerHospital,
    registerBloodBank,
    registerDonor,
    approveAccount,
    rejectAccount,
    blockAccount,
    reactivateAccount,
    createBloodRequest,
    respondToRequest,
    completeBloodRequest,
    cancelBloodRequest,
    updateDonorAvailability,
    updateDonorProfile,
    addCoordinationNote,
    addToast,
    removeToast,
    logActivity
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
