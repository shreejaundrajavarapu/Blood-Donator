import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { Resend } from 'resend';
import webpush from 'web-push';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);
const MONGODB_URI = process.env.MONGODB_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@bloodconnect.org';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

const REQUEST_PRIORITIES = ['Emergency', 'Critical', 'Normal'];
const REQUEST_PRIORITY_RANK = Object.freeze({ Emergency: 0, Critical: 1, Normal: 2 });

function normalizeRequestPriority(value) {
  const normalized = String(value || 'Normal').trim();
  if (!normalized) return 'Normal';
  if (normalized === 'Urgent') return 'Critical';
  return normalized;
}

function isValidRequestPriority(value) {
  return REQUEST_PRIORITIES.includes(value);
}

function sanitizeRequestPriority(value) {
  const normalized = normalizeRequestPriority(value);
  return isValidRequestPriority(normalized) ? normalized : 'Normal';
}

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  loginId: { type: String, unique: true, sparse: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'hospital', 'donor', 'bloodbank'], required: true },
  name: { type: String, required: true },
  type: String,
  bloodGroup: String,
  location: String,
  address: String,
  contact: String,
  phone: String,
  email: String,
  age: Number,
  availability: String,
  lastDonationDate: String,
  donationsCount: { type: Number, default: 0 },
  licenseNumber: String,
  status: { type: String, default: 'Pending Verification' },
  rejectionReason: String,
  pushSubscriptions: { type: [mongoose.Schema.Types.Mixed], default: [] },
  createdAt: { type: String, required: true }
}, { timestamps: true });

const requestSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  token: { type: String, unique: true, required: true },
  hospitalId: String,
  hospitalName: String,
  hospitalLocation: String,
  hospitalContact: String,
  patientNameOrId: String,
  bloodGroup: String,
  donorsRequired: Number,
  requiredDate: String,
  requiredTime: String,
  donationLocation: String,
  urgency: { type: String, enum: REQUEST_PRIORITIES, default: 'Normal' },
  reason: String,
  instructions: String,
  status: String,
  createdAt: String,
  matchedDonorsCount: { type: Number, default: 0 }
}, { timestamps: true });

const responseSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  requestId: String,
  requestToken: String,
  donorId: String,
  donorName: String,
  bloodGroup: String,
  donorLocation: String,
  donorPhone: String,
  donorEmail: String,
  donorSelectedPriority: { type: String, enum: REQUEST_PRIORITIES, default: 'Normal' },
  status: String,
  responseTime: String
}, { timestamps: true });

const activitySchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  activity: String,
  userOrOrg: String,
  role: String,
  date: String,
  time: String,
  status: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const BloodRequest = mongoose.model('BloodRequest', requestSchema);
const Response = mongoose.model('Response', responseSchema);
const Activity = mongoose.model('Activity', activitySchema);

function publicUser(user) {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.passwordHash;
  delete obj.__v;
  delete obj.pushSubscriptions;
  return obj;
}

async function logActivity(activity, userOrOrg, role, status = 'Info') {
  const now = new Date();
  await Activity.create({
    id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    activity,
    userOrOrg,
    role,
    date: now.toISOString().split('T')[0],
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status
  });
}

function notificationsConfigured() {
  return Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
}

function matchingDonorQuery(bloodGroup, hospitalLocation) {
  const escapeRegex = (value) => String(value || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return {
    role: 'donor',
    status: 'Approved',
    availability: 'Available',
    bloodGroup: new RegExp(`^${escapeRegex(bloodGroup)}$`, 'i'),
    location: new RegExp(`^${escapeRegex(hospitalLocation)}$`, 'i')
  };
}

async function getMatchingRegisteredDonors(bloodGroup, hospitalLocation) {
  // Notifications are independent of login state, availability, and donation cooldown.
  // Any donor who is registered and has a matching blood group/location can be notified
  // as long as they have previously granted Chrome push permission on that device.
  const query = {
    role: 'donor',
    bloodGroup: new RegExp(`^${String(bloodGroup || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    location: new RegExp(`^${String(hospitalLocation || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    pushSubscriptions: { $exists: true, $ne: [] }
  };
  return User.find(query).lean();
}

async function removePushSubscription(endpoint) {
  if (!endpoint) return;
  await User.updateMany(
    { 'pushSubscriptions.endpoint': endpoint },
    { $pull: { pushSubscriptions: { endpoint } } }
  );
}

async function sendPushToDonors(donors, request, eventType = 'new-request') {
  if (!notificationsConfigured()) {
    return { configured: false, sent: 0, failed: 0 };
  }

  const notification = JSON.stringify({
    title: `${request.urgency} Blood Request`,
    body: `${request.bloodGroup} blood needed in ${request.hospitalLocation}. Token ${request.token}.`,
    url: `${FRONTEND_URL}/`,
    requestId: request.id,
    token: request.token,
    urgency: request.urgency,
    eventType,
    tag: `bloodconnect-${request.id}`
  });

  let sent = 0;
  let failed = 0;
  for (const donor of donors) {
    for (const subscription of donor.pushSubscriptions || []) {
      try {
        await webpush.sendNotification(subscription, notification);
        sent += 1;
      } catch (error) {
        failed += 1;
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          await removePushSubscription(subscription?.endpoint);
        } else {
          console.error(`[Push] ${donor.id}:`, error?.message || error);
        }
      }
    }
  }

  return { configured: true, sent, failed };
}

async function notifyMatchingDonors(request, eventType = 'new-request') {
  try {
    const donors = await getMatchingRegisteredDonors(request.bloodGroup, request.hospitalLocation);
    const result = await sendPushToDonors(donors, request, eventType);
    console.log(`🔔 Donor push: ${result.sent} sent, ${result.failed} failed for ${request.token}`);
    return { donorCount: donors.length, ...result };
  } catch (error) {
    console.error('[Push] Could not notify matching donors:', error);
    return { donorCount: 0, configured: notificationsConfigured(), sent: 0, failed: 1 };
  }
}

async function nextUserId(role) {
  const year = new Date().getFullYear();
  const count = await User.countDocuments({ role });
  if (role === 'hospital') return `HOSP-${year}-${String(count + 1).padStart(3, '0')}`;
  if (role === 'bloodbank') return `BB-${year}-${String(count + 1).padStart(3, '0')}`;
  if (role === 'donor') return `DONOR-${String(count + 1).padStart(3, '0')}`;
  return 'ADMIN-001';
}

async function nextRequestToken() {
  const count = await BloodRequest.countDocuments();
  return `BDR-${new Date().getFullYear()}-${String(count + 102).padStart(6, '0')}`;
}


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
  if (!eligibleOn) return true;
  return asOf >= eligibleOn;
}

function formatDateOnly(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generatedPassword(role) {
  const prefix = role === 'hospital' ? 'hosp' : role === 'bloodbank' ? 'bb' : 'donor';
  return `${prefix}_${Math.floor(100 + Math.random() * 900)}`;
}

// ---------- Browser push notifications ----------
app.get('/api/notifications/vapid-public-key', (req, res) => {
  if (!VAPID_PUBLIC_KEY) {
    return res.status(503).json({ error: 'Browser notifications are not configured on the server.' });
  }
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

app.post('/api/notifications/subscribe', async (req, res) => {
  try {
    if (!notificationsConfigured()) {
      return res.status(503).json({ error: 'Browser notifications are not configured on the server.' });
    }

    const { userId, subscription } = req.body || {};
    if (!userId || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(400).json({ error: 'A valid donor and push subscription are required.' });
    }

    const donor = await User.findOne({ id: userId, role: 'donor' });
    if (!donor) return res.status(404).json({ error: 'Donor account not found.' });

    // A browser subscription belongs to the donor currently using this browser profile.
    await removePushSubscription(subscription.endpoint);
    donor.pushSubscriptions.push({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      createdAt: new Date().toISOString()
    });
    await donor.save();

    res.json({ success: true });
  } catch (error) {
    console.error('[Push subscribe]', error);
    res.status(500).json({ error: 'Could not save notification subscription.' });
  }
});

// ---------- Health / initial data ----------
app.get('/api/health', (req, res) => {
  res.json({ ok: true, database: mongoose.connection.readyState === 1 });
});

app.get('/api/state', async (req, res) => {
  try {
    const [users, requests, responses, activities] = await Promise.all([
      User.find().sort({ createdAt: 1 }).lean(),
      BloodRequest.find().sort({ createdAt: -1 }).lean(),
      Response.find().sort({ createdAt: -1 }).lean(),
      Activity.find().sort({ createdAt: -1 }).lean()
    ]);
    const normalizedRequests = requests.map((request) => {
      const urgency = sanitizeRequestPriority(request.urgency);
      return { ...request, urgency, priorityRank: REQUEST_PRIORITY_RANK[urgency] };
    });
    res.json({ users: users.map(publicUser), requests: normalizedRequests, responses, activities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not load application data.' });
  }
});

// ---------- Authentication ----------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { role, usernameOrId, password } = req.body;
    const cleanId = String(usernameOrId || '').trim();
    const user = await User.findOne({
      role,
      $or: [
        { loginId: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        { id: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        { email: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      ]
    });

    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    const valid = await bcrypt.compare(String(password || ''), user.passwordHash);
    if (!valid) return res.status(401).json({ success: false, message: 'Incorrect password' });

    if (user.status === 'Pending Verification') {
      return res.status(403).json({ success: false, status: 'pending', message: 'Your registration is currently under review by Admin.' });
    }
    if (user.status === 'Rejected') {
      return res.status(403).json({ success: false, status: 'rejected', message: 'Account rejected by Admin.' });
    }
    if (user.status === 'Blocked' || user.status === 'Deactivated') {
      return res.status(403).json({ success: false, status: 'blocked', message: 'Account deactivated.' });
    }

    await logActivity(`User logged in: ${user.name}`, user.name, user.role, 'Active');
    res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Login failed.' });
  }
});

// ---------- Registration ----------
app.post('/api/users/register', async (req, res) => {
  try {
    const { role, formData } = req.body;
    if (!['hospital', 'bloodbank', 'donor'].includes(role)) {
      return res.status(400).json({ error: 'Invalid registration role.' });
    }

    const id = await nextUserId(role);
    const email = formData.email || '';
    const loginId = role === 'donor' ? id : (email.split('@')[0] || `${role}_${Date.now().toString().slice(-4)}`);
    const exists = await User.findOne({ $or: [{ id }, { loginId }] });
    if (exists) return res.status(409).json({ error: 'An account with this ID already exists. Please try again.' });

    const initialPassword = role === 'donor' ? 'donor123' : 'pending_admin_approval';
    const passwordHash = await bcrypt.hash(initialPassword, 10);
    const base = {
      id, loginId, passwordHash, role, name: formData.name,
      contact: formData.contact, phone: formData.phone, email,
      location: formData.location,
      address: formData.address,
      licenseNumber: formData.licenseNumber,
      status: 'Pending Verification',
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (role === 'hospital') {
      base.type = formData.type || 'General Hospital';
      base.address = formData.address || `${formData.location} Medical Zone`;
    }
    if (role === 'bloodbank') {
      base.address = formData.address || `${formData.location} Central Hub`;
    }
    if (role === 'donor') {
      if (formData.lastDonationDate) {
        const lastDonation = parseDateOnly(formData.lastDonationDate);
        if (!lastDonation || lastDonation > new Date()) {
          return res.status(400).json({
            error: 'Enter a valid last donation date that is not in the future.'
          });
        }
      }

      Object.assign(base, {
        bloodGroup: formData.bloodGroup,
        age: Number(formData.age),
        availability: formData.availability || 'Available',
        lastDonationDate: formData.lastDonationDate || 'None',
        donationsCount: 0
      });
    }

    const user = await User.create(base);
    await logActivity(
      role === 'hospital'
        ? `New Hospital registration: ${user.name}`
        : role === 'bloodbank'
          ? `New Blood Bank registration: ${user.name}`
          : `New Donor registration: ${user.name} (${user.bloodGroup})`,
      user.name,
      role === 'bloodbank' ? 'Blood Bank' : role[0].toUpperCase() + role.slice(1),
      'Pending Verification'
    );

    res.status(201).json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// ---------- Admin account actions ----------
app.post('/api/admin/users/:userId/approve', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.userId });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const newPassword = generatedPassword(user.role);
    user.status = 'Approved';
    user.loginId = user.id;
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    await logActivity(`Admin approved ${user.role}: ${user.name}`, 'System Admin', 'Admin', 'Approved');
    res.json({
      success: true,
      user: publicUser(user),
      credentials: {
        name: user.name,
        role: user.role,
        email: user.email || `${user.loginId}@bloodconnect.org`,
        uniqueId: user.loginId,
        password: newPassword
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not approve account.' });
  }
});

app.post('/api/admin/users/:userId/reject', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.userId });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.status = 'Rejected';
    user.rejectionReason = req.body.reason || 'Documentation incomplete';
    await user.save();
    await logActivity(`Admin rejected ${user.role}: ${user.name}`, 'System Admin', 'Admin', 'Rejected');
    res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not reject account.' });
  }
});

async function setAccountStatus(req, res, status) {
  try {
    const user = await User.findOne({ id: req.params.userId });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.status = status;
    await user.save();
    await logActivity(
      status === 'Blocked' ? `Admin blocked account: ${user.name}` : `Admin reactivated account: ${user.name}`,
      'System Admin', 'Admin', status === 'Blocked' ? 'Blocked' : 'Approved'
    );
    res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not update account status.' });
  }
}
app.post('/api/admin/users/:userId/block', (req, res) => setAccountStatus(req, res, 'Blocked'));
app.post('/api/admin/users/:userId/reactivate', (req, res) => setAccountStatus(req, res, 'Approved'));

// ---------- Blood requests ----------
app.post('/api/requests', async (req, res) => {
  try {
    const { requestData, currentUser } = req.body;
    const token = await nextRequestToken();
    const hospitalLocation = currentUser?.location || requestData.hospitalLocation || 'Specified Location';
    const bloodGroup = requestData.bloodGroup;
    const urgency = normalizeRequestPriority(requestData.urgency);
    if (!isValidRequestPriority(urgency)) {
      return res.status(400).json({ error: 'Priority must be Emergency, Critical, or Normal.' });
    }

    const requestCreatedAt = new Date();
    const eligibleMatchingDonors = await getEligibleMatchingDonors(bloodGroup, hospitalLocation, requestCreatedAt);

    const newRequest = await BloodRequest.create({
      id: `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      token,
      hospitalId: currentUser?.id,
      hospitalName: currentUser?.name || requestData.hospitalName || 'Registered Hospital',
      hospitalLocation,
      hospitalContact: currentUser?.contact || requestData.hospitalContact || 'Contact Not Provided',
      patientNameOrId: requestData.patientNameOrId,
      bloodGroup,
      donorsRequired: Number(requestData.donorsRequired) || 1,
      requiredDate: requestData.requiredDate,
      requiredTime: requestData.requiredTime,
      donationLocation: requestData.donationLocation,
      urgency,
      reason: requestData.reason || '',
      instructions: requestData.instructions || '',
      status: 'Pending',
      createdAt: requestCreatedAt.toISOString(),
      matchedDonorsCount: eligibleMatchingDonors.length
    });

    await logActivity(
      `Blood Request Token generated: ${token} (${newRequest.bloodGroup} at ${newRequest.hospitalLocation})`,
      newRequest.hospitalName, 'Hospital', newRequest.urgency
    );
    await notifyMatchingDonors(newRequest, 'new-request');
    res.status(201).json({ success: true, request: newRequest, matchingDonorsCount: eligibleMatchingDonors.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not create blood request.' });
  }
});

async function updateRequestStatus(req, res, status) {
  try {
    const request = await BloodRequest.findOne({ id: req.params.requestId });
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    request.status = status;
    await request.save();
    const action = status === 'Completed' ? 'marked as Completed' : 'cancelled';
    await logActivity(`Request ${request.token} ${action}`, request.hospitalName, 'Hospital', status);
    res.json({ success: true, request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not update blood request.' });
  }
}

function isOpenRequestStatus(status) {
  return status === 'Pending' || status === 'Accepted';
}

async function validateDonorPriorityOrder(donor, request) {
  // A donor may work on only one active accepted request at a time.
  const acceptedResponses = await Response.find({
    donorId: donor.id,
    status: 'Accepted',
    requestId: { $ne: request.id }
  }).lean();

  if (acceptedResponses.length > 0) {
    const activeRequestIds = acceptedResponses.map((response) => response.requestId);
    const activeRequests = await BloodRequest.find({
      id: { $in: activeRequestIds },
      status: { $in: ['Pending', 'Accepted'] }
    }).lean();

    if (activeRequests.length > 0) {
      const active = activeRequests[0];
      throw Object.assign(
        new Error(`You already accepted request ${active.token}. Please complete that request before accepting another blood request.`),
        { statusCode: 409, code: 'DONOR_ALREADY_ASSIGNED' }
      );
    }
  }

  const donorResponses = await Response.find({ donorId: donor.id }).lean();
  const declinedRequestIds = new Set(
    donorResponses.filter((response) => response.status === 'Declined').map((response) => response.requestId)
  );

  const higherPriorityRequests = await BloodRequest.find({
    id: { $ne: request.id },
    status: { $in: ['Pending', 'Accepted'] },
    bloodGroup: new RegExp(`^${String(donor.bloodGroup || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    hospitalLocation: new RegExp(`^${String(donor.location || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
  }).lean();

  const higher = higherPriorityRequests
    .filter((candidate) => !declinedRequestIds.has(candidate.id))
    .map((candidate) => ({
      ...candidate,
      normalizedPriority: sanitizeRequestPriority(candidate.urgency)
    }))
    .filter((candidate) => REQUEST_PRIORITY_RANK[candidate.normalizedPriority] < REQUEST_PRIORITY_RANK[sanitizeRequestPriority(request.urgency)])
    .sort((a, b) => REQUEST_PRIORITY_RANK[a.normalizedPriority] - REQUEST_PRIORITY_RANK[b.normalizedPriority])[0];

  if (higher) {
    throw Object.assign(
      new Error(`A higher-priority ${higher.normalizedPriority} blood request (${higher.token}) is currently active. Please respond to the higher-priority request first.`),
      { statusCode: 409, code: 'HIGHER_PRIORITY_REQUEST_ACTIVE', higherPriority: higher.normalizedPriority, higherRequestToken: higher.token }
    );
  }
  const requestPriority = sanitizeRequestPriority(request.urgency);

if (requestPriority === 'Emergency') {
  const requestCreatedAt = new Date(request.createdAt || 0).getTime();

  const earlierEmergency = higherPriorityRequests
    .filter((candidate) =>
      sanitizeRequestPriority(candidate.urgency) === 'Emergency' &&
      new Date(candidate.createdAt || 0).getTime() < requestCreatedAt
    )
    .sort(
      (a, b) =>
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime()
    )[0];

  if (earlierEmergency) {
    throw Object.assign(
      new Error(
        `An earlier Emergency blood request (${earlierEmergency.token}) is still active. Please respond to the first Emergency request first.`
      ),
      {
        statusCode: 409,
        code: 'EARLIER_EMERGENCY_REQUEST_ACTIVE',
        higherPriority: 'Emergency',
        higherRequestToken: earlierEmergency.token
      }
    );
  }
}
}
app.patch('/api/requests/:requestId/priority', async (req, res) => {
  try {
    const urgency = normalizeRequestPriority(req.body?.urgency);
    if (!isValidRequestPriority(urgency)) {
      return res.status(400).json({ error: 'Priority must be Emergency, Critical, or Normal.' });
    }

    const request = await BloodRequest.findOne({ id: req.params.requestId });
    if (!request) return res.status(404).json({ error: 'Request not found.' });

    request.urgency = urgency;
    await request.save();
    await logActivity(`Request ${request.token} priority changed to ${urgency}`, request.hospitalName, 'Hospital', urgency);
    await notifyMatchingDonors(request, 'priority-updated');
    res.json({ success: true, request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not update request priority.' });
  }
});
app.post('/api/requests/:requestId/complete', (req, res) => updateRequestStatus(req, res, 'Completed'));
app.post('/api/requests/:requestId/cancel', (req, res) => updateRequestStatus(req, res, 'Cancelled'));

// ---------- Donor responses ----------
app.post('/api/responses', async (req, res) => {
  try {
    const { requestId, donorId, responseStatus, donorSelectedPriority } = req.body;
    const [request, donor] = await Promise.all([
      BloodRequest.findOne({ id: requestId }),
      User.findOne({ id: donorId })
    ]);
    if (!request || !donor) return res.status(404).json({ error: 'Request or donor not found.' });

    if (responseStatus === 'Accepted' && !isDonorEligible(donor)) {
      const eligibleOn = getDonorEligibleOn(donor.lastDonationDate);
      return res.status(409).json({
        success: false,
        error: eligibleOn
          ? `You are not eligible to donate blood until ${formatDateOnly(eligibleOn)}.`
          : 'You are not currently eligible to donate blood.'
      });
    }

    if (responseStatus === 'Accepted') {
      try {
        await validateDonorPriorityOrder(donor, request);
      } catch (priorityError) {
        if (priorityError?.statusCode === 409) {
          return res.status(409).json({
            success: false,
            error: priorityError.message,
            code: priorityError.code,
            higherPriority: priorityError.higherPriority,
            higherRequestToken: priorityError.higherRequestToken
          });
        }
        throw priorityError;
      }
    }

    const selectedPriority = sanitizeRequestPriority(donorSelectedPriority || request.urgency);
    const now = new Date();
    const responseTime = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const existing = await Response.findOne({ requestId, donorId });
    const data = {
      id: existing?.id || `RESP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      requestId,
      requestToken: request.token,
      donorId,
      donorName: donor.name,
      bloodGroup: donor.bloodGroup,
      donorLocation: donor.location,
      donorPhone: donor.phone,
      donorEmail: donor.email || '',
      donorSelectedPriority: selectedPriority,
      status: responseStatus,
      responseTime
    };

    const responseDoc = existing ? await Response.findOneAndUpdate({ _id: existing._id }, data, { new: true }) : await Response.create(data);

    if (responseStatus === 'Accepted') {
      if (request.status === 'Pending') {
        request.status = 'Accepted';
        await request.save();
      }
      donor.donationsCount = (donor.donationsCount || 0) + 1;
      await donor.save();
      await logActivity(`Donor ${donor.name} accepted request ${request.token}`, donor.name, 'Donor', 'Accepted');
    } else {
      await logActivity(`Donor ${donor.name} declined request ${request.token}`, donor.name, 'Donor', 'Declined');
    }

    res.json({ success: true, response: responseDoc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not save donor response.' });
  }
});

// ---------- Donor profile ----------
app.patch('/api/users/:userId', async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'email', 'location', 'availability', 'lastDonationDate'];
    const updates = {};
    for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];
    const user = await User.findOneAndUpdate({ id: req.params.userId }, { $set: updates }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not update profile.' });
  }
});

// ---------- Coordination activity ----------
app.post('/api/activities', async (req, res) => {
  try {
    const { activity, userOrOrg, role, status } = req.body;
    await logActivity(activity, userOrOrg, role, status || 'Info');
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not save activity.' });
  }
});

// ---------- Existing approval email feature ----------
const EMAIL_FROM = process.env.EMAIL_FROM || 'BloodConnect <onboarding@resend.dev>';
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

app.post('/api/send-approval-email', async (req, res) => {
  const { name, role, email, uniqueId, password } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'No email address on record.' });
  if (!resend) return res.status(503).json({ success: false, error: 'RESEND_API_KEY is not configured.' });

  const roleLabel = role === 'bloodbank' ? 'Blood Bank' : role.charAt(0).toUpperCase() + role.slice(1);
  const year = new Date().getFullYear();
  const html = `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden"><div style="background:#dc2626;padding:30px;text-align:center;color:white"><h1>🩸 BloodConnect</h1><p>Blood Donor Discovery &amp; Connection Platform</p></div><div style="padding:30px"><p><strong>Account Approved</strong></p><h2>Welcome aboard, ${name}!</h2><p>Your ${roleLabel} account has been approved by the Admin.</p><div style="background:#fef2f2;padding:20px;border-radius:10px"><p><strong>Login ID:</strong> ${uniqueId}</p><p><strong>Temporary Password:</strong> ${password}</p><p><strong>Role:</strong> ${roleLabel}</p></div><p>Please log in and change your password at the earliest opportunity.</p></div><div style="padding:20px;text-align:center;color:#94a3b8">© ${year} BloodConnect</div></div>`;

  try {
    const { data, error } = await resend.emails.send({ from: EMAIL_FROM, to: [email], subject: `[BloodConnect] Your ${roleLabel} Account Has Been Approved`, html });
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, emailId: data?.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

async function start() {
  if (!MONGODB_URI) {
    console.error('\n❌ MONGODB_URI is missing. Add it to server/.env\n');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);

  const migration = await BloodRequest.updateMany({ urgency: 'Urgent' }, { $set: { urgency: 'Critical' } });
  if (migration.modifiedCount > 0) {
    console.log(`✅ Normalized ${migration.modifiedCount} existing request(s): Urgent → Critical`);
  }

  const admin = await User.findOne({ id: 'ADMIN-001' });
  if (!admin) {
    await User.create({
      id: 'ADMIN-001', loginId: 'admin', passwordHash: await bcrypt.hash('admin123', 10),
      role: 'admin', name: 'Super Admin', status: 'Approved', contact: '+91 80000 11222',
      email: 'admin@bloodconnect.org', location: 'National HQ', createdAt: '2026-01-01'
    });
    console.log('✅ Default admin created: admin / admin123');
  }

  app.listen(PORT, () => {
    console.log(`🚀 BloodConnect API: http://localhost:${PORT}`);
    console.log(`🌐 Frontend allowed: ${FRONTEND_URL}`);
  });
}

start().catch((error) => {
  console.error('❌ Server startup failed:', error);
  process.exit(1);
});
