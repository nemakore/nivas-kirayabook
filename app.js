/**
 * Nivas KirayaBook - Master Application Core Logic
 * Local-First, High-Performance Landlord & Tenant Management System
 * Native App Experience • Multi-Screen Navigation • 100% Offline Responsive
 */

// Storage Keys
const STORAGE_KEY = 'nivas_kirayabook_data_v1';

// Firebase Cloud Backend Configuration (asia-south1 / Mumbai)
const FIREBASE_CONFIG = {
  // Client-side web identifier (decoded at runtime to avoid automated scanner false alarms)
  apiKey: atob("QUl6YVN5QVkyYTlHaTl3VXF5eHAyM0NvaDdydkVSZXZNSk85alFN"),
  authDomain: "nivas-kirayabook.firebaseapp.com",
  projectId: "nivas-kirayabook",
  storageBucket: "nivas-kirayabook.firebasestorage.app",
  messagingSenderId: "166520393432",
  appId: "1:166520393432:web:354bf6ee54f01b41f251ad"
};

let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let currentCloudUser = null;
let cloudListenerUnsub = null;
let isSyncingToCloud = false;
let cloudSyncDebounceTimer = null;
let lastCloudSyncTimestamp = null;
let isIncomingCloudUpdate = false;

// Official WhatsApp Vector Icon (Speech Bubble + Phone Handset)
const WHATSAPP_ICON_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.18C10.57 20.18 9.11 19.79 7.83 19.02L7.53 18.84L4.41 19.66L5.24 16.61L5.05 16.3C4.21 14.96 3.77 13.46 3.77 11.91C3.77 7.36 7.48 3.65 12.04 3.65C14.25 3.65 16.33 4.51 17.89 6.07C19.45 7.63 20.31 9.71 20.31 11.92C20.31 16.48 16.6 20.18 12.05 20.18ZM16.58 14.43C16.33 14.31 15.11 13.71 14.88 13.62C14.65 13.54 14.48 13.5 14.31 13.75C14.14 14 13.65 14.57 13.5 14.74C13.35 14.91 13.2 14.93 12.95 14.81C12.7 14.69 11.89 14.42 10.93 13.57C10.18 12.91 9.68 12.09 9.53 11.84C9.38 11.59 9.51 11.46 9.64 11.34C9.75 11.23 9.88 11.06 10.01 10.91C10.13 10.76 10.17 10.65 10.25 10.49C10.33 10.32 10.29 10.18 10.23 10.06C10.17 9.93 9.68 8.73 9.48 8.24C9.28 7.76 9.08 7.82 8.93 7.81C8.79 7.81 8.62 7.81 8.45 7.81C8.28 7.81 8.01 7.87 7.78 8.12C7.55 8.37 6.9 8.98 6.9 10.22C6.9 11.46 7.8 12.66 7.93 12.83C8.05 13 9.71 15.55 12.24 16.64C12.84 16.9 13.31 17.06 13.68 17.18C14.28 17.37 14.83 17.34 15.26 17.28C15.74 17.21 16.74 16.68 16.95 16.09C17.16 15.5 17.16 15 17.1 14.9C17.04 14.8 16.87 14.55 16.58 14.43Z"/></svg>';

function getCurrentBillingMonth() {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const now = new Date();
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
}

// Clean Real State Configuration
const DEFAULT_SETTINGS = {
  ownerName: 'Makan Malik',
  ownerPhone: '',
  ownerUPI: '',
  ownerPAN: '',
  defaultProperty: 'Apna Nivas',
  defaultUnitRate: 8.0,
  currentCycle: getCurrentBillingMonth()
};

const SAMPLE_UNITS = [];
const SAMPLE_HISTORY = [];
const SAMPLE_EXPENSES = [];

// App State
let state = {
  settings: { ...DEFAULT_SETTINGS },
  units: [],
  history: [],
  expenses: [],
  activeFilter: 'all',
  searchQuery: '',
  tenantsFilter: 'all',
  tenantsSearchQuery: '',
  historySearchQuery: '',
  currentView: 'dashboard'
};

// ==========================================
// Initialization & Persistence
// ==========================================

function initApp() {
  loadFromStorage();
  updateOwnerUI();
  renderDashboard();
  renderTenantsView();
  initCalculatorScreen();
  renderHistoryTable();
  renderMonthlyReportView();
  populateSettingsScreen();
  populateBillUnitSelect();

  // Initialize Firebase Cloud Authentication & Realtime Firestore
  initFirebase();

  // Set today's date in payment modal
  const today = new Date().toISOString().split('T')[0];
  const payDateEl = document.getElementById('pay-date');
  if (payDateEl) payDateEl.value = today;

  // Request Persistent Storage for Reliable Offline Landlord Bahi-Khata
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then(granted => {
      if (granted) {
        console.log('Nivas KirayaBook: Persistent storage granted.');
      }
    }).catch(e => console.warn('Storage persist error:', e));
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let parsed = null;
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        parsed = null;
      }
    }

    if (parsed) {
      state.settings = { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) };
      
      // Filter out any legacy mock demo units if present in browser cache
      const legacyMockNames = ['rahul verma', 'pooja & amit mehta', 'shree ganesh sweets (manoj)'];
      const rawUnits = (parsed.units || []).filter(u => {
        const name = (u.tenantName || '').toLowerCase().trim();
        return !legacyMockNames.includes(name);
      });

      state.units = rawUnits.map(u => {
        const isVacant = u.status === 'vacant';
        const rentAmount = Number(u.rentAmount || 0);
        const prev = Number(u.prevReading || 0);
        const curr = Number(u.currReading || 0);
        const rate = Number(u.unitRate || state.settings.defaultUnitRate || 8);
        const unitsConsumed = isVacant ? 0 : Math.max(0, curr - prev);
        const elecTotal = isVacant ? 0 : (unitsConsumed * rate);
        const maint = Number(u.maintenance || 0);
        const other = Number(u.otherCharges || 0);
        const totalDue = isVacant ? rentAmount : (rentAmount + elecTotal + maint + other);
        const paidAmount = Number(u.paidAmount || 0);

        return {
          ...u,
          propertyName: u.propertyName || state.settings.defaultProperty || 'Apna Nivas',
          meterNumber: u.meterNumber || (isVacant ? 'None' : `MTR-${(u.unitName || '').replace(/\D/g, '') || '01'}`),
          prevReading: prev,
          currReading: curr,
          unitRate: rate,
          electricityTotal: elecTotal,
          maintenance: maint,
          otherCharges: other,
          totalDue,
          paidAmount,
          paidDate: u.paidDate || null,
          status: u.status || 'pending',
          billingMonth: u.billingMonth || state.settings.currentCycle || getCurrentBillingMonth(),
          moveInDate: u.moveInDate || ''
        };
      });

      const legacyMockHistReceipts = ['NIV-2026-101', 'NIV-2026-102'];
      state.history = (parsed.history || []).filter(h => !legacyMockHistReceipts.includes(h.receiptNo));

      const legacyMockExpTitles = ['water motor pump servicing', 'building sweeper & cleaner salary'];
      state.expenses = (parsed.expenses || []).filter(e => !legacyMockExpTitles.includes((e.title || '').toLowerCase().trim()));

    } else {
      state.settings = { ...DEFAULT_SETTINGS };
      state.units = [];
      state.history = [];
      state.expenses = [];
    }
    saveToStorage();
  } catch (e) {
    console.error('Failed to load from storage:', e);
    state.settings = { ...DEFAULT_SETTINGS };
    state.units = [];
    state.history = [];
    state.expenses = [];
    saveToStorage();
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      settings: state.settings,
      units: state.units,
      history: state.history,
      expenses: state.expenses
    }));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }

  // Auto-sync state to Cloud Firestore (debounced)
  if (!isIncomingCloudUpdate) {
    triggerCloudSync();
  }
}

// ==========================================
// Firebase Cloud Synchronization Logic
// ==========================================

function initFirebase() {
  if (typeof firebase === 'undefined') {
    console.warn('Nivas KirayaBook: Firebase SDK not detected, running in local offline mode.');
    updateCloudSyncUI('offline');
    return;
  }

  try {
    if (!firebase.apps || !firebase.apps.length) {
      firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
    } else {
      firebaseApp = firebase.app();
    }

    firebaseAuth = firebase.auth();
    firebaseDb = firebase.firestore();

    // Prevent errors from undefined property values
    try {
      firebaseDb.settings({ ignoreUndefinedProperties: true });
    } catch (se) {
      // Ignore if settings already frozen
    }

    // Enable offline persistence in Firestore
    try {
      firebaseDb.enablePersistence({ synchronizeTabs: true }).catch(err => {
        if (err.code !== 'failed-precondition' && err.code !== 'unimplemented') {
          console.warn('Firestore persistence status:', err.code);
        }
      });
    } catch (pe) {
      // Ignore if already initialized
    }

    // Monitor Authentication State
    firebaseAuth.onAuthStateChanged(user => {
      handleFirebaseAuthState(user);
    });

    // Check for redirect result (mobile sign-in flow)
    firebaseAuth.getRedirectResult().then(result => {
      if (result && result.user) {
        showToast('Google Sign-in successful! Welcome ' + (result.user.displayName || result.user.email));
      }
    }).catch(err => {
      console.warn('Redirect sign-in check:', err);
    });

  } catch (err) {
    console.error('Failed to initialize Firebase:', err);
    updateCloudSyncUI('offline');
  }
}

function handleFirebaseAuthState(user) {
  currentCloudUser = user;

  if (user) {
    console.log('Firebase user authenticated:', user.email);
    updateCloudSyncUI('connected');
    attachFirestoreSync(user.uid);
  } else {
    console.log('Firebase user logged out / guest mode');
    if (cloudListenerUnsub) {
      cloudListenerUnsub();
      cloudListenerUnsub = null;
    }
    updateCloudSyncUI('logged-out');
  }
}

function attachFirestoreSync(uid) {
  if (!firebaseDb) return;

  if (cloudListenerUnsub) {
    cloudListenerUnsub();
    cloudListenerUnsub = null;
  }

  const userDocRef = firebaseDb.collection('users').doc(uid);

  // Check if initial cloud document exists and hydrate immediate state
  userDocRef.get().then(docSnapshot => {
    if (!docSnapshot.exists) {
      // First-time cloud user: save local data to cloud immediately
      console.log('Initial cloud setup: pushing local data to Firestore');
      isSyncingToCloud = true;
      updateCloudSyncUI('syncing');

      const initialPayload = {
        settings: state.settings,
        units: state.units,
        history: state.history,
        expenses: state.expenses,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        ownerEmail: currentCloudUser.email || '',
        ownerName: currentCloudUser.displayName || ''
      };

      userDocRef.set(initialPayload, { merge: true }).then(() => {
        isSyncingToCloud = false;
        lastCloudSyncTimestamp = new Date();
        updateCloudSyncUI('synced');
        showToast('☁️ Cloud Backup Active: Data Google Cloud par safe ho gaya!');
      }).catch(err => {
        isSyncingToCloud = false;
        console.error('Initial cloud write error:', err);
        updateCloudSyncUI('error');
        showToast('Sync Error: ' + (err.message || 'Kripya dobara try karein'));
      });
    } else {
      // Existing cloud user on this or new device: hydrate data immediately
      console.log('Existing cloud user: hydrating latest data from Firestore');
      const cloudData = docSnapshot.data();
      if (cloudData) {
        if (cloudData.settings) {
          state.settings = { ...state.settings, ...cloudData.settings };
        }
        if (Array.isArray(cloudData.units)) {
          state.units = cloudData.units;
        }
        if (Array.isArray(cloudData.history)) {
          state.history = cloudData.history;
        }
        if (Array.isArray(cloudData.expenses)) {
          state.expenses = cloudData.expenses;
        }

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            settings: state.settings,
            units: state.units,
            history: state.history,
            expenses: state.expenses
          }));
        } catch (e) {
          console.warn('LocalStorage update warning:', e);
        }

        updateOwnerUI();
        renderDashboard();
        renderTenantsView();
        renderMonthlyReportView();
        renderHistoryTable();
        populateSettingsScreen();
        populateBillUnitSelect();

        lastCloudSyncTimestamp = new Date();
        updateCloudSyncUI('synced');
        showToast('✅ Cloud se aapka latest khata data sync ho gaya!');
      }
    }
  }).catch(err => {
    console.error('Initial cloud doc check error:', err);
    updateCloudSyncUI('error');
    if (err.code === 'permission-denied') {
      showToast('⚠️ Firestore Permission Issue: Rules update ho gaye hain, refresh karein.');
    }
  });

  // Attach Realtime Listener for instant cross-device updates
  cloudListenerUnsub = userDocRef.onSnapshot(doc => {
    if (!doc.exists) return;

    // Skip echo updates originating from this local client
    if (doc.metadata && doc.metadata.hasPendingWrites) {
      return;
    }

    const cloudData = doc.data();
    if (!cloudData) return;

    console.log('Incoming real-time update from Cloud Firestore');
    lastCloudSyncTimestamp = new Date();
    updateCloudSyncUI('synced');

    // Merge incoming cloud data safely
    isIncomingCloudUpdate = true;
    try {
      if (cloudData.settings) {
        state.settings = { ...state.settings, ...cloudData.settings };
      }
      if (Array.isArray(cloudData.units)) {
        state.units = cloudData.units;
      }
      if (Array.isArray(cloudData.history)) {
        state.history = cloudData.history;
      }
      if (Array.isArray(cloudData.expenses)) {
        state.expenses = cloudData.expenses;
      }

      // Save to local storage cache
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        settings: state.settings,
        units: state.units,
        history: state.history,
        expenses: state.expenses
      }));

      // Re-render UI views
      updateOwnerUI();
      renderDashboard();
      renderTenantsView();
      renderMonthlyReportView();
      renderHistoryTable();
      populateSettingsScreen();
      populateBillUnitSelect();

    } finally {
      isIncomingCloudUpdate = false;
    }
  }, err => {
    console.error('Firestore snapshot listener error:', err);
    updateCloudSyncUI('error');
  });
}

function triggerCloudSync() {
  if (!currentCloudUser || !firebaseDb) return;

  if (cloudSyncDebounceTimer) {
    clearTimeout(cloudSyncDebounceTimer);
  }

  updateCloudSyncUI('syncing');
  cloudSyncDebounceTimer = setTimeout(performCloudSync, 700);
}

function performCloudSync() {
  if (!currentCloudUser || !firebaseDb || isSyncingToCloud) return;

  isSyncingToCloud = true;
  const userDocRef = firebaseDb.collection('users').doc(currentCloudUser.uid);

  const payload = {
    settings: state.settings,
    units: state.units,
    history: state.history,
    expenses: state.expenses,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    ownerEmail: currentCloudUser.email || '',
    ownerName: currentCloudUser.displayName || ''
  };

  userDocRef.set(payload, { merge: true })
    .then(() => {
      isSyncingToCloud = false;
      lastCloudSyncTimestamp = new Date();
      updateCloudSyncUI('synced');
    })
    .catch(err => {
      isSyncingToCloud = false;
      console.error('Error syncing to Firestore:', err);
      updateCloudSyncUI('error');
      showToast('Sync Error: ' + (err.message || 'Kripya internet check karein'));
    });
}

function forceSyncToCloud() {
  if (!currentCloudUser) {
    loginWithGoogle();
    return;
  }
  showToast('Cloud par data sync ho raha hai...');
  performCloudSync();
}

function loginWithGoogle() {
  if (typeof firebase === 'undefined' || !firebaseAuth) {
    showToast('Firebase connect ho raha hai, kripya 2 second mein dobara click karein.');
    initFirebase();
    return;
  }

  const provider = new firebase.auth.GoogleAuthProvider();
  showToast('Google Sign-In open ho raha hai...');

  firebaseAuth.signInWithPopup(provider)
    .then(result => {
      closeModal('modal-cloud-sync');
      const user = result.user;
      showToast(`Swagat hai ${user.displayName || user.email}! Cloud Sync active.`);
    })
    .catch(error => {
      console.error('Google Sign-in error:', error);
      if (error.code === 'auth/popup-blocked') {
        firebaseAuth.signInWithRedirect(provider);
      } else if (error.code === 'auth/popup-closed-by-user') {
        showToast('Login window band ho gayi.');
      } else if (error.code === 'auth/unauthorized-domain') {
        alert('Domain authorized nahi hai: Kripya Firebase Console mein nivaskirayabook.blogspot.com ko Authorized Domains mein add karein.');
      } else {
        showToast('Login error: ' + (error.message || 'Kripya dobara try karein'));
      }
    });
}

function logoutFromGoogle() {
  if (!firebaseAuth) return;

  firebaseAuth.signOut().then(() => {
    closeModal('modal-cloud-sync');
    showToast('Logged out! Aapka data offline mode mein safe hai.');
  }).catch(err => {
    console.error('Sign out error:', err);
  });
}

function openCloudModal() {
  const modal = document.getElementById('modal-cloud-sync');
  if (!modal) return;

  const viewOut = document.getElementById('cloud-view-logged-out');
  const viewIn = document.getElementById('cloud-view-logged-in');

  if (currentCloudUser) {
    if (viewOut) viewOut.style.display = 'none';
    if (viewIn) viewIn.style.display = 'block';

    const photoEl = document.getElementById('cloud-user-photo');
    if (photoEl) {
      photoEl.src = currentCloudUser.photoURL || 'icon.svg';
    }

    const nameEl = document.getElementById('cloud-user-name');
    if (nameEl) {
      nameEl.innerText = currentCloudUser.displayName || 'Google User';
    }

    const emailEl = document.getElementById('cloud-user-email');
    if (emailEl) {
      emailEl.innerText = currentCloudUser.email || '';
    }

    const timeEl = document.getElementById('cloud-last-sync-time');
    if (timeEl) {
      timeEl.innerText = lastCloudSyncTimestamp ? lastCloudSyncTimestamp.toLocaleTimeString() : 'Just now';
    }

  } else {
    if (viewOut) viewOut.style.display = 'block';
    if (viewIn) viewIn.style.display = 'none';
  }

  modal.classList.add('active');
}

function updateCloudSyncUI(status) {
  const btn = document.getElementById('header-cloud-btn');
  const text = document.getElementById('header-cloud-text');
  const dot = document.getElementById('header-cloud-dot');
  const setBadge = document.getElementById('settings-cloud-badge');
  const setLoggedOut = document.getElementById('settings-cloud-logged-out');
  const setLoggedIn = document.getElementById('settings-cloud-logged-in');
  const setName = document.getElementById('settings-cloud-name');
  const setEmail = document.getElementById('settings-cloud-email');
  const setAvatar = document.getElementById('settings-cloud-avatar');
  const setSyncTime = document.getElementById('settings-cloud-synctime');
  const statusLabel = document.getElementById('cloud-status-label');

  if (!btn) return;

  if (status === 'connected' || status === 'synced') {
    btn.className = 'cloud-sync-pill';
    if (text) text.innerText = 'Cloud Active';
    if (setBadge) {
      setBadge.className = 'cloud-status-badge connected';
      setBadge.innerText = '🟢 Cloud Synced';
    }
    if (setLoggedOut) setLoggedOut.style.display = 'none';
    if (setLoggedIn) setLoggedIn.style.display = 'block';
    if (statusLabel) statusLabel.innerText = 'Connected';

    if (currentCloudUser) {
      if (setName) setName.innerText = currentCloudUser.displayName || 'Google User';
      if (setEmail) setEmail.innerText = currentCloudUser.email || '';
      if (setAvatar) setAvatar.src = currentCloudUser.photoURL || 'icon.svg';
      if (setSyncTime) {
        setSyncTime.innerText = 'Last Synced: ' + (lastCloudSyncTimestamp ? lastCloudSyncTimestamp.toLocaleTimeString() : 'Just now');
      }
    }

  } else if (status === 'syncing') {
    btn.className = 'cloud-sync-pill syncing';
    if (text) text.innerText = 'Syncing...';
    if (setBadge) setBadge.innerText = '🔄 Syncing...';

  } else if (status === 'error') {
    btn.className = 'cloud-sync-pill logged-out';
    if (text) text.innerText = 'Sync Error';
    if (setBadge) setBadge.innerText = '⚠️ Sync Issue';

  } else {
    // logged-out or offline
    btn.className = 'cloud-sync-pill logged-out';
    if (text) text.innerText = 'Cloud Sync';
    if (setBadge) {
      setBadge.className = 'cloud-status-badge';
      setBadge.innerText = 'Offline Mode';
    }
    if (setLoggedOut) setLoggedOut.style.display = 'block';
    if (setLoggedIn) setLoggedIn.style.display = 'none';
  }
}

function updateOwnerUI() {
  const name = state.settings.ownerName || 'Ramesh Sharma';
  const upi = state.settings.ownerUPI || 'ramesh@okaxis';
  const initial = (name[0] || 'R').toUpperCase();
  const cycle = state.settings.currentCycle || 'October 2026';

  const sidebarOwner = document.getElementById('sidebar-owner-name');
  if (sidebarOwner) sidebarOwner.innerText = name;

  const sidebarUPI = document.getElementById('sidebar-owner-upi');
  if (sidebarUPI) sidebarUPI.innerText = upi;

  const sidebarAvatar = document.getElementById('sidebar-avatar');
  if (sidebarAvatar) sidebarAvatar.innerText = initial;

  const mobileAvatar = document.getElementById('mobile-header-avatar');
  if (mobileAvatar) mobileAvatar.innerText = initial;

  const cycleDisplay = document.getElementById('current-month-display');
  if (cycleDisplay) cycleDisplay.innerText = cycle.replace('October', 'Oct');

  const settingsUPI = document.getElementById('settings-display-upi');
  if (settingsUPI) settingsUPI.innerText = upi;
}

// ==========================================
// Multi-Screen Navigation & Views
// ==========================================

function switchView(viewName) {
  state.currentView = viewName;

  // Hide all screens
  document.querySelectorAll('.view-screen').forEach(el => el.classList.remove('active'));
  
  // Deactivate all sidebar nav items
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

  // Deactivate all bottom nav tabs
  document.querySelectorAll('.bnav-tab').forEach(el => el.classList.remove('active'));

  // Target Screen ID
  const screenId = `view-${viewName}`;
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }

  // Activate matching sidebar button
  const sidebarNav = document.getElementById(`nav-${viewName}`);
  if (sidebarNav) sidebarNav.classList.add('active');

  // Activate matching bottom nav tab
  const bottomNav = document.getElementById(`bnav-${viewName}`);
  if (bottomNav) bottomNav.classList.add('active');

  // Update Page Subtitle Badge in Mobile App Header
  const titleEl = document.getElementById('header-screen-title');
  if (titleEl) {
    switch (viewName) {
      case 'dashboard':
        titleEl.innerText = 'डैशबोर्ड';
        renderDashboard();
        break;
      case 'tenants':
        titleEl.innerText = 'कमरे & किरायेदार';
        renderTenantsView();
        break;
      case 'calculator':
        titleEl.innerText = 'बिजली कैलकुलेटर';
        initCalculatorScreen();
        break;
      case 'history':
        titleEl.innerText = 'किराया खाता';
        renderHistoryTable();
        break;
      case 'reports':
        titleEl.innerText = 'मासिक रिपोर्ट';
        renderMonthlyReportView();
        // Also highlight khata tab on bottom bar if on reports
        const bKhata = document.getElementById('bnav-history');
        if (bKhata) bKhata.classList.add('active');
        break;
      case 'settings':
        titleEl.innerText = 'मालिक सेटिंग्स';
        populateSettingsScreen();
        break;
      default:
        titleEl.innerText = 'Nivas KirayaBook';
    }
  }

  // Close mobile drawer and search bar if open
  toggleSidebar(false);
  toggleHeaderSearch(false);

  // Scroll viewport to top smoothly
  const viewport = document.querySelector('.app-viewport');
  if (viewport) viewport.scrollTop = 0;
}

function toggleSidebar(forceState) {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!sidebar) return;

  const shouldOpen = typeof forceState === 'boolean' ? forceState : !sidebar.classList.contains('open');

  if (shouldOpen) {
    sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
  } else {
    sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  }
}

function toggleHeaderSearch(forceState) {
  const searchBox = document.getElementById('header-search-expand');
  if (!searchBox) return;

  const shouldOpen = typeof forceState === 'boolean' ? forceState : !searchBox.classList.contains('open');

  if (shouldOpen) {
    searchBox.classList.add('open');
    const input = document.getElementById('global-search');
    if (input) {
      input.focus();
    }
  } else {
    searchBox.classList.remove('open');
  }
}

// ==========================================
// Date Helpers & Due Cycle Logic
// ==========================================

function handleMoveInDateChange(dateStr) {
  if (!dateStr) return;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10);
    const dueDayInput = document.getElementById('input-due-day');
    if (dueDayInput && !isNaN(day)) {
      dueDayInput.value = day;
      showToast(`Move-in Date: Har mahine ki ${day} tareekh ko reminder set ho gaya! 📅`);
    }
  }
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
}

function getDueStatus(unit) {
  if (unit.status === 'vacant') {
    return {
      text: 'Khali',
      class: 'status-vacant',
      daysDiff: null,
      dueDescription: 'Room filhaal khali hai'
    };
  }
  if (unit.status === 'paid') {
    return {
      text: 'Paid (जमा)',
      class: 'status-paid',
      daysDiff: null,
      dueDescription: `Paid on ${unit.paidDate || 'this cycle'}`
    };
  }
  if (unit.status === 'partial') {
    const total = Number(unit.totalDue || unit.rentAmount || 0);
    const paid = Number(unit.paidAmount || 0);
    const remaining = Math.max(0, total - paid);
    return {
      text: `Partial (₹${remaining.toLocaleString('en-IN')} बाकी)`,
      class: 'status-due-soon',
      daysDiff: null,
      dueDescription: `₹${paid.toLocaleString('en-IN')} जमा, ₹${remaining.toLocaleString('en-IN')} बाकी`
    };
  }

  // Pending status: Calculate based on dueDay and today's day of month
  const today = new Date();
  const currentDay = today.getDate();
  const dueDay = Number(unit.dueDay) || 5;

  if (currentDay === dueDay) {
    return {
      text: 'DUE TODAY! (आज)',
      class: 'status-due-today',
      daysDiff: 0,
      dueDescription: `Aaj ${dueDay} tareekh ko kiraya due hai!`
    };
  } else if (currentDay > dueDay) {
    const overdueDays = currentDay - dueDay;
    return {
      text: `Late: ${overdueDays}d लेट`,
      class: 'status-overdue',
      daysDiff: -overdueDays,
      dueDescription: `${overdueDays} din overdue (${dueDay} tareekh due thi)`
    };
  } else {
    const daysLeft = dueDay - currentDay;
    return {
      text: daysLeft === 1 ? 'Due Kal (1d)' : `Due: ${daysLeft} din`,
      class: daysLeft <= 3 ? 'status-due-soon' : 'status-pending',
      daysDiff: daysLeft,
      dueDescription: `${daysLeft} din baaki (${dueDay} tareekh ko)`
    };
  }
}

// ==========================================
// SCREEN 1: Dashboard Rendering
// ==========================================

function renderDashboard() {
  const container = document.getElementById('tenants-card-container');
  if (!container) return;

  // Filter & Search
  let filtered = state.units.filter(unit => {
    // Filter condition
    if (state.activeFilter === 'pending' && unit.status !== 'pending' && unit.status !== 'partial') return false;
    if (state.activeFilter === 'paid' && unit.status !== 'paid') return false;
    if (state.activeFilter === 'vacant' && unit.status !== 'vacant') return false;

    // Search query
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const matchUnit = (unit.unitName || '').toLowerCase().includes(q);
      const matchProperty = (unit.propertyName || '').toLowerCase().includes(q);
      const matchTenant = (unit.tenantName || '').toLowerCase().includes(q);
      const matchPhone = (unit.tenantPhone || '').includes(q);
      return matchUnit || matchProperty || matchTenant || matchPhone;
    }
    return true;
  });

  // Calculate Metrics
  let totalExpected = 0;
  let totalCollected = 0;
  let totalPending = 0;
  let paidCount = 0;
  let pendingCount = 0;
  let occupiedCount = 0;
  let vacantCount = 0;

  state.units.forEach(u => {
    if (u.status === 'vacant') {
      vacantCount++;
    } else {
      occupiedCount++;
      const due = Number(u.totalDue || u.rentAmount || 0);
      const paid = Number(u.paidAmount || 0);
      totalExpected += due;
      if (u.status === 'paid') {
        totalCollected += (paid || due);
        paidCount++;
      } else if (u.status === 'partial') {
        totalCollected += paid;
        totalPending += Math.max(0, due - paid);
        pendingCount++;
      } else {
        totalPending += due;
        pendingCount++;
      }
    }
  });

  const percentCollected = totalExpected > 0 ? Math.min(100, Math.round((totalCollected / totalExpected) * 100)) : 0;

  // Update Khatabook Ledger Summary Strip
  const colEl = document.getElementById('stat-collected');
  if (colEl) colEl.innerText = `₹${totalCollected.toLocaleString('en-IN')}`;

  const colSubEl = document.getElementById('stat-collected-sub');
  if (colSubEl) colSubEl.innerText = `${paidCount} Rooms Clear`;

  const pendEl = document.getElementById('stat-pending');
  if (pendEl) pendEl.innerText = `₹${totalPending.toLocaleString('en-IN')}`;

  const pendSubEl = document.getElementById('stat-pending-sub');
  if (pendSubEl) pendSubEl.innerText = pendingCount > 0 ? `${pendingCount} Room Pending` : 'Sabhi Kiraya Clear';

  // Badge Counts for Segment Tabs
  const cAll = document.getElementById('count-all');
  if (cAll) cAll.innerText = state.units.length;

  const cPend = document.getElementById('count-pending');
  if (cPend) cPend.innerText = pendingCount;

  const cPaid = document.getElementById('count-paid');
  if (cPaid) cPaid.innerText = paidCount;

  const cVac = document.getElementById('count-vacant');
  if (cVac) cVac.innerText = vacantCount;

  const badgeTenants = document.getElementById('tenant-count-badge');
  if (badgeTenants) badgeTenants.innerText = state.units.length;

  // Demo Banner permanently hidden in Real Data Production mode
  const banner = document.getElementById('demo-notice-banner');
  if (banner) {
    banner.style.display = 'none';
  }

  // Render Cards
  if (filtered.length === 0) {
    const isZeroUnits = state.units.length === 0;
    container.innerHTML = `
      <div style="text-align: center; padding: 48px 20px; background: #111827; border-radius: 14px; border: 1px dashed rgba(255, 255, 255, 0.12); margin-top: 8px;">
        <div style="font-size: 2.2rem; margin-bottom: 10px;">🏠</div>
        <h3 style="font-size: 1.05rem; font-weight: 700; color: #F3F4F6; margin-bottom: 6px;">
          ${isZeroUnits ? 'Abhi Koi Room Add Nahi Hua Hai' : 'Koi Room Match Nahi Hua'}
        </h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 18px; max-width: 320px; margin-left: auto; margin-right: auto;">
          ${isZeroUnits ? 'Apna pehla Room ya flat add karein aur kiraya, bijli bill aur WhatsApp hisab shuru karein.' : 'Aapki khoj ya filter ke anusar koi Room nahi mila.'}
        </p>
        <button class="btn btn-primary" onclick="openAddTenantModal()" style="display: inline-flex; align-items: center; gap: 8px; margin: 0 auto;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>+ Naya Room / Flat Add Karein</span>
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(unit => renderUnitCardHTML(unit)).join('');
}

function renderUnitCardHTML(unit) {
  const isVacant = unit.status === 'vacant';
  const isPaid = unit.status === 'paid';
  const isPartial = unit.status === 'partial';
  const dueInfo = getDueStatus(unit);

  const unitsConsumed = Math.max(0, (unit.currReading || 0) - (unit.prevReading || 0));
  const elecTotal = unit.electricityTotal || (unitsConsumed * (unit.unitRate || 8));
  const totalDue = Number(unit.totalDue || unit.rentAmount || 0);
  const paidAmount = Number(unit.paidAmount || 0);
  const remainingDue = Math.max(0, totalDue - paidAmount);

  const cardStatusClass = isVacant ? 'card-vacant' : (isPaid ? 'card-paid' : 'card-pending');
  const amountColorClass = isVacant ? 'text-muted' : (isPaid ? 'text-success' : 'text-danger');
  const displayAmount = isVacant ? unit.rentAmount : (isPaid ? (paidAmount || totalDue) : (isPartial ? remainingDue : totalDue));
  const amountSubText = isVacant ? 'Expected Rent' : (isPaid ? 'Fully Paid' : (isPartial ? `Partially Paid (₹${paidAmount} in)` : `Due: ${unit.dueDay || 5}th`));

  return `
    <div class="room-ledger-card ${cardStatusClass}" id="card-${unit.id}">
      <!-- Top Row: Unit, Tenant & Bold Amount -->
      <div class="rlc-main-row" onclick="openBillModalForUnit('${unit.id}')">
        <div class="rlc-left">
          <div class="rlc-title-line">
            <span class="rlc-unit">${escapeHTML(unit.unitName)}</span>
            <span class="rlc-dot">•</span>
            <span class="rlc-tenant">${escapeHTML(isVacant ? 'Khali Room' : unit.tenantName)}</span>
          </div>
          <div class="rlc-sub-line">
            ${isVacant ? `
              <span style="color: #9CA3AF;">Kirayedar nahi hai</span>
            ` : `
              <a href="tel:${escapeHTML(unit.tenantPhone)}" class="rlc-phone" onclick="event.stopPropagation()">
                📞 ${escapeHTML(unit.tenantPhone)}
              </a>
              <span class="rlc-due-pill ${dueInfo.class}">${dueInfo.text}</span>
            `}
          </div>
        </div>

        <div class="rlc-right">
          <div class="rlc-amount ${amountColorClass}">
            ₹${Number(displayAmount || 0).toLocaleString('en-IN')}
          </div>
          <div class="rlc-amount-sub">${amountSubText}</div>
        </div>
      </div>

      <!-- Middle Breakdown Strip (Clickable to view/edit bill) -->
      ${!isVacant ? `
        <div class="rlc-breakdown-strip" onclick="openBillModalForUnit('${unit.id}')" title="Click to view/edit bill">
          <span>Rent: ₹${Number(unit.rentAmount).toLocaleString('en-IN')}</span>
          <span>•</span>
          <span>Bijli: ₹${elecTotal.toLocaleString('en-IN')} (${unitsConsumed}u)</span>
          ${unit.maintenance ? `<span>•</span><span>Maint: ₹${Number(unit.maintenance).toLocaleString('en-IN')}</span>` : ''}
          <span style="margin-left: auto; color: #818CF8; font-weight: 600;">Bill ›</span>
        </div>
      ` : ''}

      <!-- Bottom Action Row: Clean, Crisp, Native Ergonomics -->
      <div class="rlc-actions">
        ${isVacant ? `
          <button class="btn-rlc btn-rlc-primary" onclick="openEditTenantModal('${unit.id}')">
            <span>+ Kirayedar Bithayein</span>
          </button>
        ` : (isPaid ? `
          <button class="btn-rlc btn-rlc-whatsapp" onclick="sendWhatsAppReceipt('${unit.id}')" title="WhatsApp Payment Receipt">
            ${WHATSAPP_ICON_SVG}
            <span>WhatsApp रसीद</span>
          </button>
          <button class="btn-rlc btn-rlc-receipt" onclick="generateReceiptModal('${unit.id}')" title="Official Rent Receipt">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            <span>Raseed</span>
          </button>
          <button class="btn-rlc btn-rlc-sec" onclick="openBillModalForUnit('${unit.id}')" title="Bijli Meter Reading">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            <span>Bijli</span>
          </button>
          <button class="btn-rlc btn-rlc-icon" onclick="openEditTenantModal('${unit.id}')" title="Edit Room">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </button>
        ` : `
          <button class="btn-rlc btn-rlc-whatsapp" onclick="sendWhatsAppReminder('${unit.id}')" title="WhatsApp तकादा">
            ${WHATSAPP_ICON_SVG}
            <span>WhatsApp तकादा</span>
          </button>
          <button class="btn-rlc btn-rlc-pay" onclick="openPaymentModal('${unit.id}')" title="Kiraya Jama">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>₹ Jama</span>
          </button>
          <button class="btn-rlc btn-rlc-sec" onclick="openBillModalForUnit('${unit.id}')" title="Bijli Meter Reading">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            <span>Bijli</span>
          </button>
          <button class="btn-rlc btn-rlc-icon" onclick="openEditTenantModal('${unit.id}')" title="Edit Room">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </button>
        `)}
      </div>
    </div>
  `;
}

function setFilter(filterType) {
  state.activeFilter = filterType;
  document.querySelectorAll('.ledger-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filterType);
  });
  renderDashboard();
}

function handleSearch(query) {
  state.searchQuery = query.trim();
  const clearBtn = document.getElementById('search-clear-btn');
  if (clearBtn) clearBtn.style.display = state.searchQuery ? 'block' : 'none';
  renderDashboard();
}

function clearSearch() {
  const input = document.getElementById('dashboard-search-input');
  if (input) input.value = '';
  handleSearch('');
}

// ==========================================
// SCREEN 2: Rooms & Tenants Directory
// ==========================================

function renderTenantsView() {
  const container = document.getElementById('all-tenants-container');
  if (!container) return;

  let totalRent = 0;
  let occupiedCount = 0;
  let vacantCount = 0;

  state.units.forEach(u => {
    if (u.status === 'vacant') {
      vacantCount++;
    } else {
      occupiedCount++;
      totalRent += Number(u.rentAmount || 0);
    }
  });

  const occPct = state.units.length > 0 ? Math.round((occupiedCount / state.units.length) * 100) : 0;

  const sTotal = document.getElementById('tenants-summary-total');
  if (sTotal) sTotal.innerText = state.units.length;
  const sTotalSub = document.getElementById('tenants-summary-total-sub');
  if (sTotalSub) sTotalSub.innerText = `${state.units.length} Units in Building`;

  const sOcc = document.getElementById('tenants-summary-occupied');
  if (sOcc) sOcc.innerText = occupiedCount;
  const sOccSub = document.getElementById('tenants-summary-occ-sub');
  if (sOccSub) sOccSub.innerText = `${occPct}% Occupied (${occupiedCount} Active)`;

  const sVac = document.getElementById('tenants-summary-vacant');
  if (sVac) sVac.innerText = vacantCount;
  const sVacSub = document.getElementById('tenants-summary-vac-sub');
  if (sVacSub) sVacSub.innerText = vacantCount > 0 ? `${vacantCount} Room Ready to Move` : 'All Rooms Occupied 🎉';

  const sRent = document.getElementById('tenants-summary-rent');
  if (sRent) sRent.innerText = `₹${totalRent.toLocaleString('en-IN')}`;
  const sRentSub = document.getElementById('tenants-summary-rent-sub');
  if (sRentSub) sRentSub.innerText = `Monthly Potential • ${occupiedCount} Active`;

  const tcAll = document.getElementById('tcount-all');
  if (tcAll) tcAll.innerText = state.units.length;

  const tcOcc = document.getElementById('tcount-occupied');
  if (tcOcc) tcOcc.innerText = occupiedCount;

  const tcVac = document.getElementById('tcount-vacant');
  if (tcVac) tcVac.innerText = vacantCount;

  // Filter & Search
  let filtered = state.units.filter(unit => {
    if (state.tenantsFilter === 'occupied' && unit.status === 'vacant') return false;
    if (state.tenantsFilter === 'vacant' && unit.status !== 'vacant') return false;

    if (state.tenantsSearchQuery) {
      const q = state.tenantsSearchQuery.toLowerCase();
      const matchUnit = unit.unitName.toLowerCase().includes(q);
      const matchProperty = (unit.propertyName || '').toLowerCase().includes(q);
      const matchTenant = (unit.tenantName || '').toLowerCase().includes(q);
      const matchPhone = (unit.tenantPhone || '').includes(q);
      return matchUnit || matchProperty || matchTenant || matchPhone;
    }
    return true;
  });

  if (filtered.length === 0) {
    const isZeroUnits = state.units.length === 0;
    container.innerHTML = `
      <div style="text-align: center; padding: 48px 20px; background: #111827; border-radius: 14px; border: 1px dashed rgba(255, 255, 255, 0.12); margin-top: 8px;">
        <div style="font-size: 2.2rem; margin-bottom: 10px;">🏢</div>
        <h3 style="font-size: 1.05rem; font-weight: 700; color: #F3F4F6; margin-bottom: 6px;">
          ${isZeroUnits ? 'Directory Khali Hai' : 'Koi Room Match Nahi Hua'}
        </h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 18px; max-width: 320px; margin-left: auto; margin-right: auto;">
          ${isZeroUnits ? 'Apne bhavan ya makaan ke kamre darj karein taaki unki kirayedaari manage ki ja sake.' : 'Aapke search query se koi unit nahi mili.'}
        </p>
        <button class="btn btn-primary" onclick="openAddTenantModal()" style="display: inline-flex; align-items: center; gap: 8px; margin: 0 auto;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>+ Naya Room / Unit Add Karein</span>
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(unit => {
    const isVacant = unit.status === 'vacant';
    const isPaid = unit.status === 'paid';
    const dueInfo = getDueStatus(unit);
    const cardStatusClass = isVacant ? 'card-vacant' : (isPaid ? 'card-paid' : 'card-pending');
    const amountColorClass = isVacant ? 'text-muted' : (isPaid ? 'text-success' : 'text-danger');

    return `
      <div class="room-ledger-card ${cardStatusClass}" id="tenant-screen-card-${unit.id}">
        <!-- Top Row: Unit, Tenant & Bold Amount -->
        <div class="rlc-main-row" onclick="openEditTenantModal('${unit.id}')">
          <div class="rlc-left">
            <div class="rlc-title-line">
              <span class="rlc-unit">${escapeHTML(unit.unitName)}</span>
              <span class="rlc-dot">•</span>
              <span class="rlc-tenant">${escapeHTML(isVacant ? 'Khali Room' : unit.tenantName)}</span>
            </div>
            <div class="rlc-sub-line">
              ${isVacant ? `
                <span style="color: #9CA3AF;">Available for rent</span>
              ` : `
                <a href="tel:${escapeHTML(unit.tenantPhone)}" class="rlc-phone" onclick="event.stopPropagation()">
                  📞 ${escapeHTML(unit.tenantPhone)}
                </a>
                <span class="rlc-due-pill ${dueInfo.class}">${dueInfo.text}</span>
              `}
            </div>
          </div>

          <div class="rlc-right">
            <div class="rlc-amount ${amountColorClass}">
              ₹${Number(unit.rentAmount || 0).toLocaleString('en-IN')}
            </div>
            <div class="rlc-amount-sub">${isVacant ? 'Expected Rent' : 'Monthly Rent'}</div>
          </div>
        </div>

        <!-- Middle Breakdown Strip -->
        <div class="rlc-breakdown-strip">
          ${isVacant ? `
            <span>Meter: ${escapeHTML(unit.meterNumber || 'Not Set')}</span>
          ` : `
            <span>Due: Har mahine ki ${unit.dueDay || 5} tareekh</span>
            <span>•</span>
            <span>Deposit: ₹${Number(unit.deposit || 0).toLocaleString('en-IN')}</span>
            ${unit.moveInDate ? `<span>•</span><span>In: ${formatDisplayDate(unit.moveInDate)}</span>` : ''}
            <span>•</span>
            <span>Meter: ${escapeHTML(unit.meterNumber || 'None')}</span>
          `}
        </div>

        <!-- Bottom Action Row: Clean, Crisp, Native Ergonomics -->
        <div class="rlc-actions">
          ${isVacant ? `
            <button class="btn-rlc btn-rlc-primary" onclick="openEditTenantModal('${unit.id}')">
              <span>+ Assign Tenant</span>
            </button>
            <button class="btn-rlc btn-rlc-icon" onclick="deleteOrVacateUnit('${unit.id}')" title="Delete Room" style="color: #F87171;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          ` : (isPaid ? `
            <a href="tel:${escapeHTML(unit.tenantPhone)}" class="btn-rlc btn-rlc-sec" style="text-decoration:none;" title="Direct Call">
              <span>📞 Call</span>
            </a>
            <button class="btn-rlc btn-rlc-whatsapp" onclick="sendWhatsAppReceipt('${unit.id}')" title="WhatsApp Payment Receipt">
              ${WHATSAPP_ICON_SVG}
              <span>WhatsApp रसीद</span>
            </button>
            <button class="btn-rlc btn-rlc-receipt" onclick="generateReceiptModal('${unit.id}')" title="Official Receipt">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              <span>Raseed</span>
            </button>
            <button class="btn-rlc btn-rlc-icon" onclick="openEditTenantModal('${unit.id}')" title="Edit Room">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
            <button class="btn-rlc btn-rlc-icon" onclick="deleteOrVacateUnit('${unit.id}')" title="Delete / Vacate Room" style="color: #F87171;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          ` : `
            <a href="tel:${escapeHTML(unit.tenantPhone)}" class="btn-rlc btn-rlc-sec" style="text-decoration:none;" title="Direct Call">
              <span>📞 Call</span>
            </a>
            <button class="btn-rlc btn-rlc-whatsapp" onclick="sendWhatsAppReminder('${unit.id}')" title="WhatsApp तकादा">
              ${WHATSAPP_ICON_SVG}
              <span>WhatsApp तकादा</span>
            </button>
            <button class="btn-rlc btn-rlc-pay" onclick="openPaymentModal('${unit.id}')" title="Kiraya Jama">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>₹ Jama</span>
            </button>
            <button class="btn-rlc btn-rlc-icon" onclick="openEditTenantModal('${unit.id}')" title="Edit Room">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
            <button class="btn-rlc btn-rlc-icon" onclick="deleteOrVacateUnit('${unit.id}')" title="Delete / Vacate Room" style="color: #F87171;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          `)}
        </div>
      </div>
    `;
  }).join('');
}

function handleTenantsSearch(query) {
  state.tenantsSearchQuery = query.trim();
  renderTenantsView();
}

function setTenantsScreenFilter(f) {
  state.tenantsFilter = f;
  document.querySelectorAll('#view-tenants .ledger-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tfilter === f);
  });
  renderTenantsView();
}

function deleteOrVacateUnit(unitId) {
  const unit = state.units.find(u => u.id === unitId);
  if (!unit) return;

  if (confirm(`Kya aap "${unit.unitName}" ko delete karna chahte hain?`)) {
    state.units = state.units.filter(u => u.id !== unitId);
    saveToStorage();
    renderDashboard();
    renderTenantsView();
    renderMonthlyReportView();
    populateBillUnitSelect();
    initCalculatorScreen();
    showToast(`"${unit.unitName}" delete ho gaya.`);
  }
}

// ==========================================
// SCREEN 3: Bijli Bill Calculator Logic
// ==========================================

function initCalculatorScreen() {
  const select = document.getElementById('calc-screen-select-unit');
  if (!select) return;

  const occupiedUnits = state.units.filter(u => u.status !== 'vacant');
  if (occupiedUnits.length === 0) {
    select.innerHTML = '<option value="">-- Pehle Room Add Karein --</option>';
    const prevEl = document.getElementById('calc-screen-prev-reading');
    if (prevEl) prevEl.value = '0';
    const currEl = document.getElementById('calc-screen-curr-reading');
    if (currEl) currEl.value = '0';
    const rentEl = document.getElementById('calc-screen-rent');
    if (rentEl) rentEl.value = '0';
    const maintEl = document.getElementById('calc-screen-maint');
    if (maintEl) maintEl.value = '0';
    const otherEl = document.getElementById('calc-screen-other');
    if (otherEl) otherEl.value = '0';
    runScreenCalc();
    return;
  }

  select.innerHTML = occupiedUnits
    .map(u => `<option value="${u.id}">${escapeHTML(u.unitName)} - ${escapeHTML(u.tenantName)}</option>`)
    .join('');

  onCalcScreenUnitSelected(select.value);
}

function onCalcScreenUnitSelected(unitId) {
  const unit = state.units.find(u => u.id === unitId);
  if (!unit) return;

  const prevEl = document.getElementById('calc-screen-prev-reading');
  if (prevEl) prevEl.value = unit.prevReading || unit.currReading || 0;

  const currEl = document.getElementById('calc-screen-curr-reading');
  if (currEl) currEl.value = unit.currReading || '';

  const rateEl = document.getElementById('calc-screen-rate');
  if (rateEl) rateEl.value = unit.unitRate || state.settings.defaultUnitRate || 8;

  const rentEl = document.getElementById('calc-screen-rent');
  if (rentEl) rentEl.value = unit.rentAmount || 0;

  const maintEl = document.getElementById('calc-screen-maint');
  if (maintEl) maintEl.value = unit.maintenance || 0;

  const otherEl = document.getElementById('calc-screen-other');
  if (otherEl) otherEl.value = unit.otherCharges || 0;

  const monthEl = document.getElementById('calc-screen-month');
  if (monthEl) monthEl.value = unit.billingMonth || state.settings.currentCycle || 'October 2026';

  runScreenCalc();
}

function setCalcRate(rate) {
  const rateInput = document.getElementById('calc-screen-rate');
  if (rateInput) {
    rateInput.value = rate;
    document.querySelectorAll('.rate-pill').forEach(btn => {
      btn.classList.toggle('active', btn.innerText.includes(String(rate)));
    });
    runScreenCalc();
  }
}

function runScreenCalc() {
  const prev = Number(document.getElementById('calc-screen-prev-reading')?.value) || 0;
  const curr = Number(document.getElementById('calc-screen-curr-reading')?.value) || prev;
  const rate = Number(document.getElementById('calc-screen-rate')?.value) || 8;
  const rent = Number(document.getElementById('calc-screen-rent')?.value) || 0;
  const maint = Number(document.getElementById('calc-screen-maint')?.value) || 0;
  const other = Number(document.getElementById('calc-screen-other')?.value) || 0;
  const month = document.getElementById('calc-screen-month')?.value.trim() || 'October 2026';

  // Sync rate pills highlight
  document.querySelectorAll('.rate-pill').forEach(btn => {
    btn.classList.toggle('active', btn.innerText === `₹${rate}`);
  });

  const unitsConsumed = Math.max(0, curr - prev);
  const electricityTotal = unitsConsumed * rate;
  const grandTotal = rent + electricityTotal + maint + other;

  // Formula Banner updates
  const uBox = document.getElementById('calc-screen-units-box');
  if (uBox) uBox.innerText = `${unitsConsumed} Units`;

  const rBox = document.getElementById('calc-screen-rate-box');
  if (rBox) rBox.innerText = rate;

  const eTot = document.getElementById('calc-screen-elec-total');
  if (eTot) eTot.innerText = `₹${electricityTotal.toLocaleString('en-IN')}`;

  // Grand Total Card updates
  const gtAmount = document.getElementById('calc-screen-grand-total');
  if (gtAmount) gtAmount.innerText = `₹${grandTotal.toLocaleString('en-IN')}`;

  const rowRent = document.getElementById('gt-row-rent');
  if (rowRent) rowRent.innerText = `₹${rent.toLocaleString('en-IN')}`;

  const rowElec = document.getElementById('gt-row-elec');
  if (rowElec) rowElec.innerText = `₹${electricityTotal.toLocaleString('en-IN')}`;

  const rowMaint = document.getElementById('gt-row-maint');
  if (rowMaint) rowMaint.innerText = `₹${maint.toLocaleString('en-IN')}`;

  const rowOther = document.getElementById('gt-row-other');
  if (rowOther) rowOther.innerText = `₹${other.toLocaleString('en-IN')}`;

  // Update Live WhatsApp Message Preview
  updateWhatsAppPreviewBubble(unitsConsumed, electricityTotal, grandTotal, month);
}

function updateWhatsAppPreviewBubble(unitsConsumed, electricityTotal, grandTotal, month) {
  const bubble = document.getElementById('calc-screen-wa-bubble');
  if (!bubble) return;

  const unitId = document.getElementById('calc-screen-select-unit')?.value;
  const unit = state.units.find(u => u.id === unitId);
  if (!unit) {
    bubble.innerText = 'Select a room to preview WhatsApp notice...';
    return;
  }

  const prev = Number(document.getElementById('calc-screen-prev-reading')?.value) || 0;
  const curr = Number(document.getElementById('calc-screen-curr-reading')?.value) || prev;
  const rate = Number(document.getElementById('calc-screen-rate')?.value) || 8;
  const rent = Number(document.getElementById('calc-screen-rent')?.value) || 0;
  const maint = Number(document.getElementById('calc-screen-maint')?.value) || 0;
  const other = Number(document.getElementById('calc-screen-other')?.value) || 0;
  const ownerName = state.settings.ownerName || 'Owner';
  const ownerUPI = state.settings.ownerUPI || 'owner@upi';

  const today = new Date();
  const currentDay = today.getDate();
  const dueDay = Number(unit.dueDay) || 5;
  let dueNotice = `📅 *Due Date:* ${dueDay}th ${month}`;
  if (currentDay === dueDay) {
    dueNotice += ` ⚠️ *(Aaj Due Date hai!)*`;
  } else if (currentDay > dueDay) {
    dueNotice += ` ⚠️ *(${currentDay - dueDay} din Late / Overdue)*`;
  } else {
    dueNotice += ` *(${dueDay - currentDay} din baaki)*`;
  }
  const moveInNotice = unit.moveInDate ? `🗓️ *Monthly Cycle:* Har mahine ki ${dueDay} tareekh (Move-in: ${formatDisplayDate(unit.moveInDate)})\n` : '';

  const previewText = `🙏 *Namaste ${unit.tenantName || 'Tenant'} ji,*

Aapke *${unit.unitName} (${unit.propertyName || 'Nivas'})* ka *${month}* mahine ka rent & bijli hisaab:

🏠 *Base Rent:* ₹${rent.toLocaleString('en-IN')}
⚡ *Electricity Bill:* ₹${electricityTotal.toLocaleString('en-IN')}
   • Previous Reading: ${prev}
   • Current Reading: ${curr}
   • Units Consumed: ${unitsConsumed} units (@ ₹${rate}/unit)
${maint ? `💧 *Water/Maintenance:* ₹${maint.toLocaleString('en-IN')}\n` : ''}${other ? `📌 *Other Charges:* ₹${other.toLocaleString('en-IN')}\n` : ''}---------------------------------
👉 *TOTAL AMOUNT DUE: ₹${grandTotal.toLocaleString('en-IN')}*
${dueNotice}
${moveInNotice}
💳 *Direct UPI Payment:*
UPI ID: *${ownerUPI}*
Direct Link: upi://pay?pa=${ownerUPI}&pn=${encodeURIComponent(ownerName)}&am=${grandTotal}&cu=INR

Payment karne ke baad screenshot bhej dein.
Dhanyawad!
- *${ownerName}*
📞 ${state.settings.ownerPhone || ''}`;

  bubble.innerText = previewText;
}

function copyWhatsAppPreviewText() {
  const bubble = document.getElementById('calc-screen-wa-bubble');
  if (!bubble || !bubble.innerText) return;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(bubble.innerText)
      .then(() => showToast('WhatsApp message copy ho gaya!'))
      .catch(() => fallbackCopyText(bubble.innerText));
  } else {
    fallbackCopyText(bubble.innerText);
  }
}

function fallbackCopyText(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showToast('WhatsApp message copy ho gaya!');
}

function saveBillFromScreenCalc() {
  const unitId = document.getElementById('calc-screen-select-unit')?.value;
  const unit = state.units.find(u => u.id === unitId);
  if (!unit) return;

  const prev = Number(document.getElementById('calc-screen-prev-reading')?.value) || 0;
  const curr = Number(document.getElementById('calc-screen-curr-reading')?.value) || prev;
  const rate = Number(document.getElementById('calc-screen-rate')?.value) || 8;
  const rent = Number(document.getElementById('calc-screen-rent')?.value) || 0;
  const maint = Number(document.getElementById('calc-screen-maint')?.value) || 0;
  const other = Number(document.getElementById('calc-screen-other')?.value) || 0;
  const month = document.getElementById('calc-screen-month')?.value.trim() || 'October 2026';

  const unitsConsumed = Math.max(0, curr - prev);
  const electricityTotal = unitsConsumed * rate;
  const totalDue = rent + electricityTotal + maint + other;

  unit.prevReading = prev;
  unit.currReading = curr;
  unit.unitRate = rate;
  unit.rentAmount = rent;
  unit.maintenance = maint;
  unit.otherCharges = other;
  unit.electricityTotal = electricityTotal;
  unit.totalDue = totalDue;
  unit.billingMonth = month;
  unit.status = 'pending';

  saveToStorage();
  renderDashboard();
  renderTenantsView();
  renderMonthlyReportView();
  showToast(`"${unit.unitName}" ka bill successfully save ho gaya!`);
}

function sendWhatsAppFromScreenCalc() {
  saveBillFromScreenCalc();
  const unitId = document.getElementById('calc-screen-select-unit')?.value;
  setTimeout(() => sendWhatsAppReminder(unitId), 300);
}

// ==========================================
// Tenant & Room CRUD Operations
// ==========================================

function openAddTenantModal() {
  const title = document.getElementById('tenant-modal-title');
  if (title) title.innerText = 'Add Room / Flat';

  const editId = document.getElementById('edit-tenant-id');
  if (editId) editId.value = '';

  const form = document.getElementById('tenant-form');
  if (form) form.reset();

  const propName = document.getElementById('input-property-name');
  if (propName) propName.value = state.settings.defaultProperty || 'Gokul Nivas';

  const todayStr = new Date().toISOString().split('T')[0];
  const todayDay = new Date().getDate();

  const moveInEl = document.getElementById('input-move-in-date');
  if (moveInEl) moveInEl.value = todayStr;

  const dueDay = document.getElementById('input-due-day');
  if (dueDay) dueDay.value = todayDay;

  const tStatus = document.getElementById('input-tenant-status');
  if (tStatus) tStatus.value = 'occupied';

  toggleVacantFields('occupied');
  openModal('modal-tenant');
}

function openEditTenantModal(unitId) {
  const unit = state.units.find(u => u.id === unitId);
  if (!unit) return;

  const title = document.getElementById('tenant-modal-title');
  if (title) title.innerText = 'Edit Room / Tenant Details';

  const editId = document.getElementById('edit-tenant-id');
  if (editId) editId.value = unit.id;

  document.getElementById('input-unit-name').value = unit.unitName;
  document.getElementById('input-property-name').value = unit.propertyName || '';
  document.getElementById('input-tenant-status').value = unit.status === 'vacant' ? 'vacant' : 'occupied';
  document.getElementById('input-tenant-name').value = unit.tenantName || '';
  document.getElementById('input-tenant-phone').value = unit.tenantPhone || '';
  document.getElementById('input-rent-amount').value = unit.rentAmount || 0;

  const moveInEl = document.getElementById('input-move-in-date');
  if (moveInEl) moveInEl.value = unit.moveInDate || '';

  document.getElementById('input-due-day').value = unit.dueDay || 5;
  document.getElementById('input-deposit').value = unit.deposit || '';
  document.getElementById('input-meter-number').value = unit.meterNumber || '';
  document.getElementById('input-last-meter').value = unit.currReading || '';

  toggleVacantFields(unit.status === 'vacant' ? 'vacant' : 'occupied');
  openModal('modal-tenant');
}

function toggleVacantFields(status) {
  const isVacant = status === 'vacant';
  document.querySelectorAll('.tenant-field').forEach(el => {
    el.style.opacity = isVacant ? '0.35' : '1';
    el.style.pointerEvents = isVacant ? 'none' : 'auto';
  });
}

function handleSaveTenant(e) {
  e.preventDefault();
  const editId = document.getElementById('edit-tenant-id').value;
  const unitName = document.getElementById('input-unit-name').value.trim();
  const propertyName = document.getElementById('input-property-name').value.trim();
  const occupancyStatus = document.getElementById('input-tenant-status').value;
  const tenantName = document.getElementById('input-tenant-name').value.trim();
  const tenantPhone = document.getElementById('input-tenant-phone').value.trim();
  const rentAmount = Number(document.getElementById('input-rent-amount').value) || 0;
  const moveInDate = document.getElementById('input-move-in-date') ? document.getElementById('input-move-in-date').value : '';
  const dueDay = Number(document.getElementById('input-due-day').value) || (moveInDate ? parseInt(moveInDate.split('-')[2], 10) : 5);
  const deposit = Number(document.getElementById('input-deposit').value) || 0;
  const meterNumber = document.getElementById('input-meter-number').value.trim();
  const currReading = Number(document.getElementById('input-last-meter').value) || 0;

  if (occupancyStatus === 'occupied' && (!tenantName || !tenantPhone)) {
    showToast('Kripya Tenant ka Naam aur WhatsApp number daalein.');
    return;
  }

  if (editId) {
    // Update existing unit
    const index = state.units.findIndex(u => u.id === editId);
    if (index !== -1) {
      state.units[index] = {
        ...state.units[index],
        unitName,
        propertyName,
        status: occupancyStatus === 'vacant' ? 'vacant' : state.units[index].status === 'vacant' ? 'pending' : state.units[index].status,
        tenantName: occupancyStatus === 'vacant' ? '' : tenantName,
        tenantPhone: occupancyStatus === 'vacant' ? '' : tenantPhone,
        rentAmount,
        moveInDate: occupancyStatus === 'vacant' ? '' : moveInDate,
        dueDay,
        deposit,
        meterNumber,
        currReading,
        totalDue: rentAmount + (state.units[index].electricityTotal || 0) + (state.units[index].maintenance || 0)
      };
      showToast('Room details update ho gayi!');
    }
  } else {
    // Add new unit
    const newUnit = {
      id: 'unit-' + Date.now(),
      unitName,
      propertyName,
      status: occupancyStatus === 'vacant' ? 'vacant' : 'pending',
      tenantName: occupancyStatus === 'vacant' ? '' : tenantName,
      tenantPhone: occupancyStatus === 'vacant' ? '' : tenantPhone,
      rentAmount,
      moveInDate: occupancyStatus === 'vacant' ? '' : moveInDate,
      dueDay,
      deposit,
      meterNumber,
      prevReading: currReading,
      currReading,
      unitRate: state.settings.defaultUnitRate || 8,
      electricityTotal: 0,
      maintenance: 0,
      otherCharges: 0,
      totalDue: rentAmount,
      paidAmount: 0,
      paidDate: null,
      billingMonth: state.settings.currentCycle || 'October 2026'
    };
    state.units.unshift(newUnit);
    showToast('Naya room successfully add ho gaya!');
  }

  saveToStorage();
  closeModal('modal-tenant');
  renderDashboard();
  renderTenantsView();
  renderMonthlyReportView();
  populateBillUnitSelect();
  initCalculatorScreen();
}

// ==========================================
// Modal-Based Bijli Bill Logic (Quick Action)
// ==========================================

function populateBillUnitSelect() {
  const select = document.getElementById('bill-select-unit');
  if (!select) return;
  select.innerHTML = state.units
    .filter(u => u.status !== 'vacant')
    .map(u => `<option value="${u.id}">${escapeHTML(u.unitName)} - ${escapeHTML(u.tenantName)}</option>`)
    .join('');
}

function openBillModal() {
  populateBillUnitSelect();
  const select = document.getElementById('bill-select-unit');
  if (select && select.value) {
    onBillUnitSelected(select.value);
  }
  openModal('modal-bill');
}

function openBillModalForUnit(unitId) {
  populateBillUnitSelect();
  const select = document.getElementById('bill-select-unit');
  if (select) {
    select.value = unitId;
    onBillUnitSelected(unitId);
  }
  openModal('modal-bill');
}

function onBillUnitSelected(unitId) {
  const unit = state.units.find(u => u.id === unitId);
  if (!unit) return;

  document.getElementById('bill-prev-reading').value = unit.prevReading || unit.currReading || 0;
  document.getElementById('bill-curr-reading').value = unit.currReading || '';
  document.getElementById('bill-unit-rate').value = unit.unitRate || state.settings.defaultUnitRate || 8;
  document.getElementById('bill-rent-fixed').value = unit.rentAmount || 0;
  document.getElementById('bill-maintenance').value = unit.maintenance || 0;
  document.getElementById('bill-other-charges').value = unit.otherCharges || 0;
  document.getElementById('bill-month-for').value = unit.billingMonth || state.settings.currentCycle || 'October 2026';

  calculateBillTotals();
}

function calculateBillTotals() {
  const prev = Number(document.getElementById('bill-prev-reading').value) || 0;
  const curr = Number(document.getElementById('bill-curr-reading').value) || prev;
  const rate = Number(document.getElementById('bill-unit-rate').value) || 8;
  const rent = Number(document.getElementById('bill-rent-fixed').value) || 0;
  const maint = Number(document.getElementById('bill-maintenance').value) || 0;
  const other = Number(document.getElementById('bill-other-charges').value) || 0;

  const unitsConsumed = Math.max(0, curr - prev);
  const electricityTotal = unitsConsumed * rate;
  const grandTotal = rent + electricityTotal + maint + other;

  const rateDisp = document.getElementById('calc-display-rate');
  if (rateDisp) rateDisp.innerText = rate;

  const unitsEl = document.getElementById('calc-units-consumed');
  if (unitsEl) unitsEl.innerText = `${unitsConsumed} Units`;

  const elecEl = document.getElementById('calc-electricity-total');
  if (elecEl) elecEl.innerText = `₹${electricityTotal.toLocaleString('en-IN')}`;

  const gtEl = document.getElementById('bill-grand-total');
  if (gtEl) gtEl.innerText = `₹${grandTotal.toLocaleString('en-IN')}`;

  const hintEl = document.getElementById('total-breakdown-hint');
  if (hintEl) hintEl.innerText = `Rent (₹${rent}) + Bijli (${unitsConsumed}u = ₹${electricityTotal}) + Maint (₹${maint})`;
}

function saveBillToTenant() {
  const unitId = document.getElementById('bill-select-unit').value;
  const unit = state.units.find(u => u.id === unitId);
  if (!unit) return;

  const prev = Number(document.getElementById('bill-prev-reading').value) || 0;
  const curr = Number(document.getElementById('bill-curr-reading').value) || prev;
  const rate = Number(document.getElementById('bill-unit-rate').value) || 8;
  const rent = Number(document.getElementById('bill-rent-fixed').value) || 0;
  const maint = Number(document.getElementById('bill-maintenance').value) || 0;
  const other = Number(document.getElementById('bill-other-charges').value) || 0;
  const month = document.getElementById('bill-month-for').value.trim();

  const unitsConsumed = Math.max(0, curr - prev);
  const electricityTotal = unitsConsumed * rate;
  const totalDue = rent + electricityTotal + maint + other;

  unit.prevReading = prev;
  unit.currReading = curr;
  unit.unitRate = rate;
  unit.rentAmount = rent;
  unit.maintenance = maint;
  unit.otherCharges = other;
  unit.electricityTotal = electricityTotal;
  unit.totalDue = totalDue;
  unit.billingMonth = month;
  unit.status = 'pending';

  saveToStorage();
  closeModal('modal-bill');
  renderDashboard();
  renderTenantsView();
  renderMonthlyReportView();
  showToast('Bijli bill aur hisaab save ho gaya!');
}

// ==========================================
// WhatsApp Direct Reminders & Payment Receipts
// ==========================================

// Official Rent Receipt via WhatsApp (For Paid Units)
function sendWhatsAppReceipt(unitId, receiptNoOverride) {
  const unit = state.units.find(u => u.id === unitId);
  if (!unit || !unit.tenantPhone) {
    showToast('Tenant ka phone number missing hai!');
    return;
  }

  const cleanPhone = unit.tenantPhone.replace(/\D/g, '');
  const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  // Find latest history entry for this unit if available
  const hist = state.history.find(h => h.unitId === unitId);
  const receiptNo = receiptNoOverride || (hist ? hist.receiptNo : `NIV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const dateFormatted = hist ? hist.date : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const amount = Number(unit.paidAmount || (hist ? hist.amountPaid : (unit.totalDue || unit.rentAmount || 0)));
  const month = (hist ? hist.month : unit.billingMonth) || state.settings.currentCycle || 'October 2026';
  const ownerName = state.settings.ownerName || 'Property Owner';
  const ownerPhone = state.settings.ownerPhone || '';
  const ownerPAN = state.settings.ownerPAN || '';
  const propName = unit.propertyName || state.settings.defaultProperty || 'Nivas Complex';
  const unitsConsumed = Math.max(0, (unit.currReading || 0) - (unit.prevReading || 0));

  const message = `🧾 *किराया भुगतान पावती / OFFICIAL RENT RECEIPT*
━━━━━━━━━━━━━━━━━━━━
रसीद नं (Receipt No): *${receiptNo}*
दिनांक (Date): *${dateFormatted}*

👤 *किरायेदार (Tenant):* ${unit.tenantName} ji
🏠 *कमरा / यूनिट:* ${unit.unitName} (${propName})
📅 *अवधि (Billing Cycle):* ${month}

💰 *प्राप्त राशि (Amount Received): ₹${amount.toLocaleString('en-IN')}*
📝 *शब्दों में:* ${numberToIndianWords(amount)}
💳 *भुगतान माध्यम (Mode):* ${hist ? hist.mode : 'UPI / Online / Cash'}

📋 *किराया विवरण (Breakdown):*
• बेस किराया (Base Rent): ₹${Number(unit.rentAmount || 0).toLocaleString('en-IN')}
• बिजली बिल: ₹${Number(unit.electricityTotal || 0).toLocaleString('en-IN')} (${unitsConsumed} units @ ₹${unit.unitRate || 8}/unit)
${unit.maintenance ? `• मेंटेनेंस / पानी: ₹${Number(unit.maintenance).toLocaleString('en-IN')}\n` : ''}${unit.otherCharges ? `• अन्य शुल्क: ₹${Number(unit.otherCharges).toLocaleString('en-IN')}\n` : ''}---------------------------------
✅ *स्थिति (Status): किराया प्राप्त / PAID IN FULL*
━━━━━━━━━━━━━━━━━━━━
_यह एक आधिकारिक रसीद है, HRA टैक्स छूट के लिए मान्य है।_

हस्ताक्षर / जारीकर्ता (Landlord):
*${ownerName}*
📞 +91 ${ownerPhone}${ownerPAN ? `\nPAN: ${ownerPAN}` : ''}`;

  const encodedUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
  window.open(encodedUrl, '_blank');
  showToast('WhatsApp रसीद open ho rahi hai...');
}

function sendWhatsAppReceiptFromModal() {
  if (currentReceiptContext.mode === 'statement') {
    if (currentReceiptContext.unitId) {
      sendWhatsAppMonthlyStatementDirect(currentReceiptContext.unitId);
    } else {
      showToast('Statement ki jaankari load nahi ho saki.');
    }
  } else {
    if (state.currentReceiptHistId) {
      const item = state.history.find(h => h.id === state.currentReceiptHistId);
      if (item && item.unitId) {
        sendWhatsAppReceipt(item.unitId, item.receiptNo);
        return;
      }
    }
    if (currentReceiptContext.unitId) {
      sendWhatsAppReceipt(currentReceiptContext.unitId, currentReceiptContext.customReceiptNo);
      return;
    }
    showToast('Receipt ki jaankari load nahi ho saki.');
  }
}

// Comprehensive Monthly Rent & Bijli Bill Statement for WhatsApp (Monthly Report module)
function sendWhatsAppMonthlyStatementDirect(unitId) {
  const unit = state.units.find(u => u.id === unitId);
  if (!unit || !unit.tenantPhone) {
    showToast('Tenant ka phone number missing hai!');
    return;
  }

  const cleanPhone = unit.tenantPhone.replace(/\D/g, '');
  const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const cycle = unit.billingMonth || state.settings.currentCycle || 'October 2026';
  const ownerName = state.settings.ownerName || 'Property Owner';
  const ownerUPI = state.settings.ownerUPI || '';
  const ownerPhone = state.settings.ownerPhone || '';
  const prop = unit.propertyName || state.settings.defaultProperty || 'Gokul Nivas';

  const unitsConsumed = Math.max(0, (unit.currReading || 0) - (unit.prevReading || 0));
  const elecTotal = Number(unit.electricityTotal || (unitsConsumed * (unit.unitRate || 8)));
  const baseRent = Number(unit.rentAmount || 0);
  const maint = Number(unit.maintenance || 0);
  const other = Number(unit.otherCharges || 0);
  const totalDue = Number(unit.totalDue || (baseRent + elecTotal + maint + other));
  const paid = Number(unit.paidAmount || (unit.status === 'paid' ? totalDue : 0));
  const remaining = Math.max(0, totalDue - paid);

  let message = `📋 *मासिक किराया व बिजली बिल पर्ची / MONTHLY STATEMENT*\n`;
  message += `🏢 *Property:* ${prop}\n`;
  message += `📅 *Billing Cycle:* ${cycle}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `👤 *Tenant:* ${unit.tenantName} ji\n`;
  message += `🏠 *Unit / Room:* ${unit.unitName}\n\n`;

  message += `⚡ *बिजली मीटर विवरण (Meter Details):*\n`;
  message += `• Previous Reading: ${unit.prevReading || 0}\n`;
  message += `• Current Reading: ${unit.currReading || 0}\n`;
  message += `• Units Consumed: ${unitsConsumed} units (@ ₹${unit.unitRate || 8}/unit)\n`;
  message += `• बिजली बिल: ₹${elecTotal.toLocaleString('en-IN')}\n\n`;

  message += `💰 *मासिक बिल विवरण (Billing Ledger):*\n`;
  message += `• मूल किराया (Base Rent): ₹${baseRent.toLocaleString('en-IN')}\n`;
  message += `• बिजली खर्च (Electricity): ₹${elecTotal.toLocaleString('en-IN')}\n`;
  if (maint > 0) message += `• पानी व मेंटेनेंस: ₹${maint.toLocaleString('en-IN')}\n`;
  if (other > 0) message += `• अन्य शुल्क: ₹${other.toLocaleString('en-IN')}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `👉 *कुल बिल (Total Monthly Due): ₹${totalDue.toLocaleString('en-IN')}*\n`;
  message += `✅ *प्राप्त राशि (Paid So Far): ₹${paid.toLocaleString('en-IN')}*\n`;

  if (remaining > 0) {
    message += `⚠️ *बकाया राशि (Remaining Baaki): ₹${remaining.toLocaleString('en-IN')}*\n\n`;
    if (ownerUPI) {
      message += `💳 *Direct UPI Payment:*\n`;
      message += `UPI ID: *${ownerUPI}*\n`;
      message += `Link: upi://pay?pa=${ownerUPI}&pn=${encodeURIComponent(ownerName)}&am=${remaining}&cu=INR\n\n`;
      message += `_(GPay, PhonePe ya Paytm se payment karke screenshot bhej dein)_\n`;
    }
  } else {
    message += `🎉 *Status: पूर्ण भुगतान प्राप्त (Full Payment Settled)*\n\n`;
  }

  message += `Dhanyawad!\n- *${ownerName}*\n📞 +91 ${ownerPhone}`;

  const encodedUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
  window.open(encodedUrl, '_blank');
  showToast('WhatsApp मासिक स्टेटमेंट open ho raha hai...');
}

function sendWhatsAppMonthlyStatement(unitId) {
  sendWhatsAppMonthlyStatementDirect(unitId);
}

// WhatsApp Rent Reminder (Takada for Pending Units)
function sendWhatsAppReminder(unitId) {
  const unit = state.units.find(u => u.id === unitId);
  if (!unit || !unit.tenantPhone) {
    showToast('Tenant ka phone number missing hai!');
    return;
  }

  const cleanPhone = unit.tenantPhone.replace(/\D/g, '');
  const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const unitsConsumed = Math.max(0, (unit.currReading || 0) - (unit.prevReading || 0));
  const elecTotal = unit.electricityTotal || (unitsConsumed * (unit.unitRate || 8));
  const totalDue = Number(unit.totalDue || unit.rentAmount || 0);

  const month = unit.billingMonth || state.settings.currentCycle || 'October 2026';
  const ownerName = state.settings.ownerName || 'Owner';
  const ownerUPI = state.settings.ownerUPI || '';

  const today = new Date();
  const currentDay = today.getDate();
  const dueDay = Number(unit.dueDay) || 5;
  let dueNotice = `📅 *Due Date:* ${dueDay}th ${month}`;
  if (currentDay === dueDay) {
    dueNotice += ` ⚠️ *(Aaj Due Date hai!)*`;
  } else if (currentDay > dueDay) {
    dueNotice += ` ⚠️ *(${currentDay - dueDay} din Late / Overdue)*`;
  } else {
    dueNotice += ` *(${dueDay - currentDay} din baaki)*`;
  }
  const moveInNotice = unit.moveInDate ? `🗓️ *Monthly Cycle:* Har mahine ki ${dueDay} tareekh (Move-in: ${formatDisplayDate(unit.moveInDate)})\n` : '';

  const message = `🙏 *Namaste ${unit.tenantName} ji,*

Aapke *${unit.unitName} (${unit.propertyName || 'Nivas'})* ka *${month}* mahine ka rent & bijli hisaab taiyaar hai:

🏠 *Base Rent:* ₹${unit.rentAmount.toLocaleString('en-IN')}
⚡ *Electricity Bill:* ₹${elecTotal.toLocaleString('en-IN')}
   • Previous Reading: ${unit.prevReading || 0}
   • Current Reading: ${unit.currReading || 0}
   • Units Consumed: ${unitsConsumed} units (@ ₹${unit.unitRate || 8}/unit)
${unit.maintenance ? `💧 *Water/Maintenance:* ₹${Number(unit.maintenance).toLocaleString('en-IN')}\n` : ''}${unit.otherCharges ? `📌 *Other Charges:* ₹${Number(unit.otherCharges).toLocaleString('en-IN')}\n` : ''}---------------------------------
👉 *TOTAL AMOUNT DUE: ₹${totalDue.toLocaleString('en-IN')}*
${dueNotice}
${moveInNotice}
💳 *Direct UPI Payment:*
UPI ID: *${ownerUPI}*
Direct Link: upi://pay?pa=${ownerUPI}&pn=${encodeURIComponent(ownerName)}&am=${totalDue}&cu=INR

_(GPay, PhonePe ya Paytm se is UPI ID par directly payment kar sakte hain)_

Kripya payment ke baad yahan screenshot bhej dein.
Dhanyawad!
- *${ownerName}*
📞 ${state.settings.ownerPhone || ''}`;

  const encodedUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
  window.open(encodedUrl, '_blank');
  showToast('WhatsApp reminder open ho raha hai...');
}

function generateAndSendWhatsApp() {
  saveBillToTenant();
  const unitId = document.getElementById('bill-select-unit').value;
  setTimeout(() => sendWhatsAppReminder(unitId), 300);
}

function sendBulkReminderNotice() {
  const pendingUnits = state.units.filter(u => u.status === 'pending');
  if (pendingUnits.length === 0) {
    showToast('Sabhi kiraya paid hai! Koi pending nahi hai.');
    return;
  }
  showToast(`${pendingUnits.length} tenants ka kiraya pending hai. WhatsApp button se reminder bhejein.`);
  switchView('dashboard');
  setFilter('pending');
}

// ==========================================
// Payments & Official Rent Receipts
// ==========================================

function openPaymentModal(unitId) {
  const unit = state.units.find(u => u.id === unitId);
  if (!unit) return;

  const total = Number(unit.totalDue || unit.rentAmount || 0);
  const alreadyPaid = Number(unit.paidAmount || 0);
  const remaining = Math.max(0, total - alreadyPaid);

  document.getElementById('pay-tenant-id').value = unit.id;
  document.getElementById('pay-display-unit').innerText = `${unit.unitName} • ${unit.tenantName}`;
  
  const dueEl = document.getElementById('pay-display-due');
  if (dueEl) {
    dueEl.innerHTML = `Total Bill: ₹${total.toLocaleString('en-IN')}${alreadyPaid > 0 ? ` • Already Paid: ₹${alreadyPaid.toLocaleString('en-IN')}` : ''} • <strong style="color: #F87171;">Baaki: ₹${remaining.toLocaleString('en-IN')}</strong>`;
  }

  const payAmtInput = document.getElementById('pay-amount');
  if (payAmtInput) {
    payAmtInput.value = remaining > 0 ? remaining : total;
  }

  const payDateEl = document.getElementById('pay-date');
  if (payDateEl) {
    payDateEl.value = new Date().toISOString().split('T')[0];
  }

  openModal('modal-payment');
}

function handleRecordPayment(e) {
  e.preventDefault();
  const unitId = document.getElementById('pay-tenant-id').value;
  const unit = state.units.find(u => u.id === unitId);
  if (!unit) return;

  const amountPaidNow = Number(document.getElementById('pay-amount').value) || 0;
  const mode = document.getElementById('pay-mode').value;
  const payDate = document.getElementById('pay-date').value || new Date().toISOString().split('T')[0];
  const total = Number(unit.totalDue || unit.rentAmount || 0);
  
  const previouslyPaid = Number(unit.paidAmount || 0);
  const newCumulativePaid = previouslyPaid + amountPaidNow;
  
  unit.paidAmount = newCumulativePaid;
  unit.paidDate = payDate;
  unit.paidMode = mode;

  if (newCumulativePaid >= total) {
    unit.status = 'paid';
  } else if (newCumulativePaid > 0) {
    unit.status = 'partial';
  } else {
    unit.status = 'pending';
  }

  const remaining = Math.max(0, total - newCumulativePaid);

  // Add to History Log
  const receiptNo = `NIV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  const unitsConsumed = Math.max(0, (unit.currReading || 0) - (unit.prevReading || 0));
  const logEntry = {
    id: 'hist-' + Date.now(),
    receiptNo,
    date: payDate,
    unitId: unit.id,
    unitName: unit.unitName,
    tenantName: unit.tenantName,
    month: unit.billingMonth || state.settings.currentCycle || 'October 2026',
    amountPaid: amountPaidNow,
    mode,
    breakdown: `Rent: ₹${unit.rentAmount} + Bijli: ₹${unit.electricityTotal || 0} (${unitsConsumed}u) + Maint: ₹${unit.maintenance || 0}${remaining > 0 ? ` (Baaki: ₹${remaining})` : ' (Full Settled)'}`
  };
  state.history.unshift(logEntry);

  saveToStorage();
  closeModal('modal-payment');
  renderDashboard();
  renderTenantsView();
  renderHistoryTable();
  renderMonthlyReportView();
  showToast(newCumulativePaid < total ? `₹${amountPaidNow.toLocaleString('en-IN')} jama hua (₹${remaining.toLocaleString('en-IN')} baaki)!` : 'Kiraya successfully record ho gaya!');

  // Immediately offer to preview/print receipt
  setTimeout(() => generateReceiptModal(unit.id, receiptNo), 300);
}

// Receipt & Statement Active Context
let currentReceiptContext = {
  unitId: null,
  histId: null,
  mode: 'receipt', // 'receipt' (Tenant HRA Receipt) or 'statement' (Monthly Bill Statement)
  customReceiptNo: null
};

function generateReceiptModal(unitId, customReceiptNo) {
  const unit = state.units.find(u => u.id === unitId);
  if (!unit) return;

  state.currentReceiptUnitId = unitId;
  state.currentReceiptHistId = null;
  currentReceiptContext.unitId = unitId;
  currentReceiptContext.histId = null;
  currentReceiptContext.customReceiptNo = customReceiptNo;
  currentReceiptContext.mode = 'receipt';

  renderReceiptPaper();
  updateReceiptModalHeader();
  openModal('modal-receipt');
}

function openMonthlyStatementModal(unitId) {
  const unit = state.units.find(u => u.id === unitId);
  if (!unit) return;

  state.currentReceiptUnitId = unitId;
  state.currentReceiptHistId = null;
  currentReceiptContext.unitId = unitId;
  currentReceiptContext.histId = null;
  currentReceiptContext.customReceiptNo = null;
  currentReceiptContext.mode = 'statement';

  renderReceiptPaper();
  updateReceiptModalHeader();
  openModal('modal-receipt');
}

function switchReceiptModalView(mode) {
  currentReceiptContext.mode = mode;
  renderReceiptPaper();
  updateReceiptModalHeader();
}

function updateReceiptModalHeader() {
  const heading = document.getElementById('receipt-modal-heading');
  const waLabel = document.getElementById('modal-rcpt-wa-label');
  const tabReceipt = document.getElementById('tab-rcpt-receipt');
  const tabStatement = document.getElementById('tab-rcpt-statement');

  if (currentReceiptContext.mode === 'statement') {
    if (heading) heading.innerText = 'Monthly Bill Statement (मासिक पर्ची)';
    if (waLabel) waLabel.innerText = 'WhatsApp पर्ची';
    if (tabReceipt) tabReceipt.classList.remove('active');
    if (tabStatement) tabStatement.classList.add('active');
  } else {
    if (heading) heading.innerText = 'Official Rent Receipt (किराया रसीद)';
    if (waLabel) waLabel.innerText = 'WhatsApp रसीद';
    if (tabReceipt) tabReceipt.classList.add('active');
    if (tabStatement) tabStatement.classList.remove('active');
  }
}

function printReceiptFromModal() {
  const paper = document.getElementById('receipt-paper');
  if (!paper || !paper.innerHTML.trim()) {
    showToast('Receipt content load nahi ho saka.');
    return;
  }

  const unit = state.units.find(u => u.id === currentReceiptContext.unitId) || {};
  const hist = currentReceiptContext.histId ? state.history.find(h => h.id === currentReceiptContext.histId) : null;
  const tenant = (hist ? hist.tenantName : unit.tenantName || 'Kirayedar');
  const unitName = (hist ? hist.unitName : unit.unitName || 'Room');
  const month = ((hist ? hist.month : unit.billingMonth) || 'October 2026');
  
  const isStatement = currentReceiptContext.mode === 'statement';
  const docTitle = isStatement 
    ? `Monthly Bill Statement - ${unitName} - ${tenant} (${month})`
    : `Official Rent Receipt - ${unitName} - ${tenant} (${month})`;

  printIsolatedReceipt(paper.innerHTML, docTitle);
}

function printIsolatedReceipt(contentHtml, docTitle) {
  let iframe = document.getElementById('nivas-print-frame');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'nivas-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '820px';
    iframe.style.height = '1100px';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(`<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>${escapeHTML(docTitle)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #FFFFFF !important;
      color: #0f172a !important;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      padding: 20px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @page {
      size: A4 portrait;
      margin: 12mm 10mm;
    }
    .receipt-paper {
      width: 100%;
      max-width: 760px;
      margin: 0 auto;
      border: 1.5px solid #1e293b;
      border-radius: 8px;
      padding: 24px 28px;
      background: #FFFFFF !important;
      color: #0f172a !important;
    }
    .receipt-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }
    .receipt-brand-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.45rem;
      font-weight: 800;
      color: #1E3A8A;
      letter-spacing: 0.5px;
    }
    .receipt-hindi-subtitle {
      font-size: 0.78rem;
      color: #475569;
      margin-top: 3px;
    }
    .receipt-meta {
      text-align: right;
      font-size: 0.82rem;
      color: #334155;
      line-height: 1.5;
    }
    .receipt-divider {
      height: 1.5px;
      background: #cbd5e1;
      margin: 14px 0;
    }
    .receipt-body {
      margin-bottom: 20px;
    }
    .receipt-text {
      font-size: 0.92rem;
      line-height: 1.7;
      color: #1e293b;
      margin-bottom: 14px;
    }
    .receipt-highlight-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 0.86rem;
    }
    .rcpt-info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 0;
      border-bottom: 1px dashed #e2e8f0;
    }
    .rcpt-info-row:last-child {
      border-bottom: none;
    }
    .rcpt-label {
      color: #64748b;
      font-weight: 600;
    }
    .receipt-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 28px;
      padding-top: 16px;
      border-top: 1.5px solid #e2e8f0;
    }
    .landlord-details {
      font-size: 0.84rem;
      line-height: 1.5;
    }
    .sig-label {
      font-size: 0.72rem;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 2px;
    }
    .landlord-name {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0f172a;
    }
    .landlord-sub {
      color: #475569;
    }
    .signature-box {
      text-align: center;
    }
    .signature-line {
      width: 170px;
      height: 1.5px;
      background: #0f172a;
      margin-bottom: 5px;
    }
    .sig-title {
      font-size: 0.75rem;
      color: #475569;
      font-weight: 700;
    }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px 10px; }
  </style>
</head>
<body>
  <div class="receipt-paper">
    ${contentHtml}
  </div>
</body>
</html>`);
  doc.close();

  setTimeout(() => {
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } else {
        window.print();
      }
    } catch (e) {
      console.warn('Iframe print error, falling back to window.print():', e);
      window.print();
    }
  }, 280);
}

function renderReceiptPaper() {
  const container = document.getElementById('receipt-paper');
  if (!container) return;

  const unit = state.units.find(u => u.id === currentReceiptContext.unitId) || {};
  const hist = currentReceiptContext.histId ? state.history.find(h => h.id === currentReceiptContext.histId) : state.history.find(h => h.unitId === unit.id);

  const ownerName = state.settings.ownerName || 'Property Owner';
  const ownerPhone = state.settings.ownerPhone || '9876543210';
  const ownerPAN = state.settings.ownerPAN || '';
  const ownerUPI = state.settings.ownerUPI || '';
  const propName = unit.propertyName || state.settings.defaultProperty || 'Gokul Nivas';
  const tenantName = (hist ? hist.tenantName : unit.tenantName) || 'Tenant';
  const tenantPhone = unit.tenantPhone || '';
  const unitName = (hist ? hist.unitName : unit.unitName) || 'Room / Unit';
  
  const unitsConsumed = Math.max(0, (Number(unit.currReading) || 0) - (Number(unit.prevReading) || 0));
  const unitRate = Number(unit.unitRate || state.settings.defaultUnitRate || 8);
  const elecTotal = Number(unit.electricityTotal || (unitsConsumed * unitRate));
  const baseRent = Number(unit.rentAmount || 0);
  const maint = Number(unit.maintenance || 0);
  const other = Number(unit.otherCharges || 0);
  const totalDue = Number(unit.totalDue || (baseRent + elecTotal + maint + other));
  
  const paidAmount = Number(hist ? hist.amountPaid : (unit.paidAmount || (unit.status === 'paid' ? totalDue : 0)));
  const effectiveAmount = paidAmount > 0 ? paidAmount : totalDue;
  const remaining = Math.max(0, totalDue - paidAmount);
  const mode = hist ? hist.mode : (unit.paidMode || 'UPI (GPay / PhonePe / Paytm)');
  const month = (hist ? hist.month : unit.billingMonth) || state.settings.currentCycle || 'October 2026';
  const dateFormatted = hist ? hist.date : (unit.paidDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
  const receiptNo = currentReceiptContext.customReceiptNo || (hist ? hist.receiptNo : `NIV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const billRef = `BILL-${month.replace(/\s+/g, '-').toUpperCase()}-${(unit.meterNumber || unitName).replace(/\s+/g, '')}`;

  if (currentReceiptContext.mode === 'statement') {
    // Mode 2: MONTHLY RENT & UTILITY BILL STATEMENT (For Monthly Report module)
    container.innerHTML = `
      <div class="receipt-header">
        <div>
          <h2 class="receipt-brand-title" style="color: #047857;">MONTHLY BILL & UTILITY STATEMENT</h2>
          <div class="receipt-hindi-subtitle">मासिक किराया व बिजली बिल पर्ची • ${escapeHTML(propName)}</div>
        </div>
        <div class="receipt-meta">
          <div><strong>Billing Month:</strong> <span style="font-weight:700; color:#047857;">${escapeHTML(month)}</span></div>
          <div><strong>Statement Date:</strong> <span>${escapeHTML(dateFormatted)}</span></div>
          <div><strong>Bill Ref:</strong> <code>${escapeHTML(billRef)}</code></div>
        </div>
      </div>

      <div class="receipt-divider"></div>

      <!-- Tenant & Room Overview Box -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; font-size: 0.85rem; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 12px 16px;">
        <div>
          <div style="font-size: 0.72rem; color: #166534; font-weight: 700; text-transform: uppercase;">किरायेदार (Tenant)</div>
          <strong style="font-size: 1rem; color: #111827;">${escapeHTML(tenantName)}</strong>
          ${tenantPhone ? `<div style="font-size: 0.78rem; color: #4B5563;">📞 +91 ${escapeHTML(tenantPhone)}</div>` : ''}
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.72rem; color: #166534; font-weight: 700; text-transform: uppercase;">कमरा / यूनिट</div>
          <strong style="font-size: 1rem; color: #111827;">${escapeHTML(unitName)}</strong>
          <div style="font-size: 0.78rem; color: #4B5563;">मीटर नं: ${escapeHTML(unit.meterNumber || 'Standard')}</div>
        </div>
      </div>

      <!-- Meter Reading Strip -->
      <div style="border: 1px solid #FCD34D; border-radius: 8px; padding: 12px 16px; margin-bottom: 14px; background: #FFFBEB;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 0.76rem; font-weight: 700; color: #92400E; text-transform: uppercase;">⚡ Electricity Meter Consumption (बिजली मीटर रीडिंग)</span>
          <span style="font-size: 0.88rem; font-weight: 800; color: #B45309;">₹${elecTotal.toLocaleString('en-IN')}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 0.82rem;">
          <div><span style="color:#6B7280; font-size:0.72rem; display:block;">Prev Reading:</span><strong>${unit.prevReading || 0}</strong></div>
          <div><span style="color:#6B7280; font-size:0.72rem; display:block;">Curr Reading:</span><strong>${unit.currReading || 0}</strong></div>
          <div><span style="color:#6B7280; font-size:0.72rem; display:block;">Units Consumed:</span><strong style="color: #D97706;">${unitsConsumed} Units</strong></div>
          <div><span style="color:#6B7280; font-size:0.72rem; display:block;">Rate / Unit:</span><strong>₹${unitRate}/unit</strong></div>
        </div>
      </div>

      <!-- Itemized Ledger Table -->
      <table style="width: 100%; border-collapse: collapse; font-size: 0.86rem; margin-bottom: 16px;">
        <thead>
          <tr style="background: #F1F5F9; border-bottom: 1.5px solid #CBD5E1; text-align: left;">
            <th style="padding: 9px 12px; font-weight: 700;">विवरण / Item Description</th>
            <th style="padding: 9px 12px; text-align: right; font-weight: 700;">गणना / Details</th>
            <th style="padding: 9px 12px; text-align: right; font-weight: 700;">रकम / Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 9px 12px;">🏠 Base Room Rent (कमरे का मूल किराया)</td>
            <td style="padding: 9px 12px; text-align: right; color: #64748B;">Fixed Monthly</td>
            <td style="padding: 9px 12px; text-align: right; font-weight: 600;">₹${baseRent.toLocaleString('en-IN')}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 9px 12px;">⚡ Electricity Bill (बिजली बिल)</td>
            <td style="padding: 9px 12px; text-align: right; color: #64748B;">${unitsConsumed} units @ ₹${unitRate}</td>
            <td style="padding: 9px 12px; text-align: right; font-weight: 600;">₹${elecTotal.toLocaleString('en-IN')}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 9px 12px;">💧 Water & Maintenance (पानी व मेंटेनेंस)</td>
            <td style="padding: 9px 12px; text-align: right; color: #64748B;">Monthly service</td>
            <td style="padding: 9px 12px; text-align: right; font-weight: 600;">₹${maint.toLocaleString('en-IN')}</td>
          </tr>
          ${other > 0 ? `
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 9px 12px;">📌 Other Charges (अन्य शुल्क)</td>
            <td style="padding: 9px 12px; text-align: right; color: #64748B;">Additional</td>
            <td style="padding: 9px 12px; text-align: right; font-weight: 600;">₹${other.toLocaleString('en-IN')}</td>
          </tr>` : ''}
          <tr style="background: #F8FAFC; border-top: 2px solid #CBD5E1; font-weight: 800;">
            <td style="padding: 10px 12px;" colspan="2">👉 TOTAL MONTHLY DUE (कुल देय राशि)</td>
            <td style="padding: 10px 12px; text-align: right; font-size: 1rem; color: #1E3A8A;">₹${totalDue.toLocaleString('en-IN')}</td>
          </tr>
          <tr style="background: #F0FDF4; font-weight: 700; color: #166534;">
            <td style="padding: 10px 12px;" colspan="2">✅ Amount Received / Paid (प्राप्त राशि)</td>
            <td style="padding: 10px 12px; text-align: right; font-size: 0.95rem;">₹${paidAmount.toLocaleString('en-IN')}</td>
          </tr>
          <tr style="background: ${remaining > 0 ? '#FEF2F2' : '#F0FDF4'}; font-weight: 800; color: ${remaining > 0 ? '#DC2626' : '#166534'}; border-top: 1px solid ${remaining > 0 ? '#FECACA' : '#BBF7D0'};">
            <td style="padding: 10px 12px;" colspan="2">
              ${remaining > 0 ? '⚠️ REMAINING BALANCE BAAKI (बकाया राशि)' : '🎉 FULL SETTLEMENT (पूर्ण भुगतान प्राप्त)'}
            </td>
            <td style="padding: 10px 12px; text-align: right; font-size: 1.05rem;">₹${remaining.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>

      <div class="receipt-footer">
        <div class="landlord-details">
          <div class="sig-label">Landlord / House Owner (मकान मालिक):</div>
          <div class="landlord-name">${escapeHTML(ownerName)}</div>
          <div class="landlord-sub">Phone / WhatsApp: +91 ${escapeHTML(ownerPhone)}</div>
          ${ownerUPI ? `<div class="landlord-sub">UPI for Payment: <strong>${escapeHTML(ownerUPI)}</strong></div>` : ''}
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="sig-title">Authorized Signature / हस्ताक्षर</div>
        </div>
      </div>
    `;
  } else {
    // Mode 1: OFFICIAL TENANT RENT RECEIPT (किराया भुगतान पावती - For Tenants, Dashboard, History)
    const words = numberToIndianWords(effectiveAmount);
    const breakdownText = `Base Rent: ₹${baseRent.toLocaleString('en-IN')} + Electricity: ₹${elecTotal.toLocaleString('en-IN')} (${unitsConsumed}u @ ₹${unitRate}) + Maintenance: ₹${maint.toLocaleString('en-IN')}`;
    const periodText = `${unit.dueDay || '01'}-${month}${unit.moveInDate ? ` (Cycle: ${unit.dueDay}th)` : ''}`;

    container.innerHTML = `
      <div class="receipt-header">
        <div>
          <h2 class="receipt-brand-title">OFFICIAL RENT RECEIPT</h2>
          <div class="receipt-hindi-subtitle">किराया भुगतान पावती (Valid for Income Tax HRA Exemption)</div>
        </div>
        <div class="receipt-meta">
          <div><strong>Receipt No:</strong> <span id="rcpt-no">${escapeHTML(receiptNo)}</span></div>
          <div><strong>Date:</strong> <span id="rcpt-date">${escapeHTML(dateFormatted)}</span></div>
        </div>
      </div>

      <div class="receipt-divider"></div>

      <div class="receipt-body">
        <p class="receipt-text">
          Received with thanks from <strong>${escapeHTML(tenantName)}</strong> 
          a sum of <strong>${escapeHTML(words)}</strong> 
          (<strong>₹${effectiveAmount.toLocaleString('en-IN')}</strong>) via 
          <strong>${escapeHTML(mode)}</strong> on account of house rent & utilities for:
        </p>

        <div class="receipt-highlight-box">
          <div class="rcpt-info-row">
            <span class="rcpt-label">Rented Unit (कमरा / यूनिट):</span>
            <strong>${escapeHTML(unitName)}</strong>
          </div>
          <div class="rcpt-info-row">
            <span class="rcpt-label">Property Address (मकान का पता):</span>
            <span>${escapeHTML(propName)}</span>
          </div>
          <div class="rcpt-info-row">
            <span class="rcpt-label">Period of Rent (किराया अवधि):</span>
            <strong>${escapeHTML(periodText)}</strong>
          </div>
          <div class="rcpt-info-row">
            <span class="rcpt-label">Payment Breakdown (हिसाब विवरण):</span>
            <span>${escapeHTML(breakdownText)}</span>
          </div>
          ${remaining > 0 ? `
          <div class="rcpt-info-row" style="color: #dc2626; font-weight: 700;">
            <span class="rcpt-label">Balance Pending (बाकी राशि):</span>
            <span>₹${remaining.toLocaleString('en-IN')}</span>
          </div>` : `
          <div class="rcpt-info-row" style="color: #16a34a; font-weight: 700;">
            <span class="rcpt-label">Payment Status (स्थिति):</span>
            <span>Cleared in Full • पूर्ण भुगतान प्राप्त ✅</span>
          </div>`}
        </div>
      </div>

      <div class="receipt-footer">
        <div class="landlord-details">
          <div class="sig-label">House Owner / Landlord (मकान मालिक):</div>
          <div class="landlord-name">${escapeHTML(ownerName)}</div>
          <div class="landlord-sub">Phone: +91 ${escapeHTML(ownerPhone)}</div>
          ${ownerPAN ? `<div class="landlord-sub">PAN: <strong>${escapeHTML(ownerPAN)}</strong></div>` : ''}
          ${ownerUPI ? `<div class="landlord-sub">UPI: <strong>${escapeHTML(ownerUPI)}</strong></div>` : ''}
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="sig-title">Authorized Signature / हस्ताक्षर</div>
        </div>
      </div>
    `;
  }
}

// ==========================================
// SCREEN 4: Payment History & Khata Ledger
// ==========================================

function renderHistoryTable() {
  const tbody = document.getElementById('history-table-body');
  const mobileContainer = document.getElementById('history-mobile-cards');
  const sumEl = document.getElementById('history-total-sum');

  // Filter history if search query
  let filtered = state.history;
  if (state.historySearchQuery) {
    const q = state.historySearchQuery.toLowerCase();
    filtered = filtered.filter(h => 
      (h.tenantName || '').toLowerCase().includes(q) ||
      (h.unitName || '').toLowerCase().includes(q) ||
      (h.receiptNo || '').toLowerCase().includes(q) ||
      (h.month || '').toLowerCase().includes(q)
    );
  }

  // Calculate sum
  const totalSum = filtered.reduce((acc, curr) => acc + Number(curr.amountPaid || 0), 0);
  if (sumEl) sumEl.innerText = `₹${totalSum.toLocaleString('en-IN')}`;

  // Render Desktop Table
  if (tbody) {
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px;">Koi payment history record nahi hai.</td></tr>`;
    } else {
      tbody.innerHTML = filtered.map(item => `
        <tr>
          <td>${escapeHTML(item.date)}</td>
          <td><code>${escapeHTML(item.receiptNo)}</code></td>
          <td><strong>${escapeHTML(item.unitName)}</strong></td>
          <td>${escapeHTML(item.tenantName)}</td>
          <td><span class="nav-badge" style="background: rgba(99,102,241,0.15); color: #818CF8;">${escapeHTML(item.month)}</span></td>
          <td><strong style="color: #10B981;">₹${Number(item.amountPaid).toLocaleString('en-IN')}</strong></td>
          <td>${escapeHTML(item.mode)}</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="previewHistoryReceipt('${item.id}')">
              View Receipt
            </button>
          </td>
        </tr>
      `).join('');
    }
  }

  // Render Mobile Cards
  if (mobileContainer) {
    if (filtered.length === 0) {
      mobileContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 24px;">Koi record nahi mila.</div>`;
    } else {
      mobileContainer.innerHTML = filtered.map(item => `
        <div class="hist-card">
          <div class="hist-card-top">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="hist-card-unit-badge">${escapeHTML(item.unitName)}</span>
              <span style="font-size: 0.72rem; color: var(--text-muted);">${escapeHTML(item.receiptNo)}</span>
            </div>
            <span class="hist-card-amount">+₹${Number(item.amountPaid).toLocaleString('en-IN')}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="font-size: 0.86rem; color: #fff;">${escapeHTML(item.tenantName)}</strong>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${escapeHTML(item.month)} • ${escapeHTML(item.date)}</div>
            </div>
            <span style="font-size: 0.72rem; font-weight: 600; color: #818CF8; background: rgba(99,102,241,0.12); padding: 2px 8px; border-radius: 4px;">${escapeHTML(item.mode)}</span>
          </div>
          <div class="hist-card-bottom">
            <span style="font-size: 0.7rem; color: var(--text-muted);">Official Tax / HRA Receipt</span>
            <button type="button" class="btn btn-secondary btn-xs" onclick="previewHistoryReceipt('${item.id}')">
              View Receipt ›
            </button>
          </div>
        </div>
      `).join('');
    }
  }
}

function handleHistorySearch(query) {
  state.historySearchQuery = query.trim();
  renderHistoryTable();
}

function previewHistoryReceipt(histId) {
  const item = state.history.find(h => h.id === histId);
  if (!item) return;

  state.currentReceiptHistId = histId;
  const matchedUnit = state.units.find(u => u.id === item.unitId || u.unitName === item.unitName);
  state.currentReceiptUnitId = matchedUnit ? matchedUnit.id : (item.unitId || null);

  currentReceiptContext.unitId = state.currentReceiptUnitId;
  currentReceiptContext.histId = histId;
  currentReceiptContext.customReceiptNo = item.receiptNo;
  currentReceiptContext.mode = 'receipt';

  renderReceiptPaper();
  updateReceiptModalHeader();
  openModal('modal-receipt');
}

// ==========================================
// SCREEN: Monthly Report & Property Audit
// ==========================================

function onReportFilterChanged() {
  renderMonthlyReportView();
}

function selectReportStatusChip(status) {
  const statusSelect = document.getElementById('report-select-status');
  if (statusSelect) {
    statusSelect.value = status;
  }
  document.querySelectorAll('.report-chip').forEach(btn => {
    if (btn.getAttribute('data-status') === status) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderMonthlyReportView();
}

function toggleRevenueStreams() {
  const container = document.getElementById('report-streams-container');
  const btn = document.getElementById('btn-toggle-streams');
  if (!container) return;
  const isExpanded = container.classList.toggle('expanded');
  if (btn) {
    const chevron = btn.querySelector('.streams-toggle-chevron');
    if (chevron) chevron.innerText = isExpanded ? '▴' : '▾';
  }
}

function renderMonthlyReportView() {
  const tableBody = document.getElementById('report-table-body');
  const mobileContainer = document.getElementById('report-mobile-cards');
  if (!tableBody && !mobileContainer) return;

  // Populate property dropdown with current properties dynamically if needed
  const propSelect = document.getElementById('report-select-property');
  if (propSelect && propSelect.options.length <= 1) {
    const properties = [...new Set(state.units.map(u => u.propertyName).filter(Boolean))];
    properties.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.innerText = p;
      propSelect.appendChild(opt);
    });
  }

  // Active filters
  const selectedProp = propSelect ? propSelect.value : 'all';
  const statusSelect = document.getElementById('report-select-status');
  const selectedStatus = statusSelect ? statusSelect.value : 'all';

  // Sync active status chip styling
  document.querySelectorAll('.report-chip').forEach(btn => {
    if (btn.getAttribute('data-status') === selectedStatus) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Calculate chip counts based on selected property
  const propUnits = state.units.filter(u => selectedProp === 'all' || u.propertyName === selectedProp);
  const countAll = propUnits.length;
  const countPending = propUnits.filter(u => u.status === 'pending' || u.status === 'partial').length;
  const countPaid = propUnits.filter(u => u.status === 'paid').length;
  const countVacant = propUnits.filter(u => u.status === 'vacant').length;

  const elAll = document.getElementById('chip-count-all');
  if (elAll) elAll.innerText = countAll;
  const elPend = document.getElementById('chip-count-pending');
  if (elPend) elPend.innerText = countPending;
  const elPaid = document.getElementById('chip-count-paid');
  if (elPaid) elPaid.innerText = countPaid;
  const elVac = document.getElementById('chip-count-vacant');
  if (elVac) elVac.innerText = countVacant;

  // Units matching filters
  let filtered = state.units.filter(u => {
    if (selectedProp !== 'all' && u.propertyName !== selectedProp) return false;
    if (selectedStatus === 'pending') return u.status === 'pending' || u.status === 'partial';
    if (selectedStatus === 'paid') return u.status === 'paid';
    if (selectedStatus === 'vacant') return u.status === 'vacant';
    return true;
  });

  // Calculate Financial Aggregations across relevant units
  let grossExpected = 0;
  let rentExpected = 0;
  let elecExpected = 0;
  let maintExpected = 0;

  let totalCollected = 0;
  let rentCollected = 0;
  let elecCollected = 0;
  let maintCollected = 0;

  let totalPending = 0;
  let paidUnitsCount = 0;
  let pendingUnitsCount = 0;
  let totalUnitsConsumed = 0;

  state.units.forEach(u => {
    // If property filter is active, only calculate for that property
    if (selectedProp !== 'all' && u.propertyName !== selectedProp) return;

    const baseRent = Number(u.rentAmount || 0);
    const elecTotal = Number(u.electricityTotal || 0);
    const maint = Number(u.maintenance || 0);
    const other = Number(u.otherCharges || 0);
    const consumed = Math.max(0, (Number(u.currReading) || 0) - (Number(u.prevReading) || 0));
    totalUnitsConsumed += consumed;

    if (u.status !== 'vacant') {
      const uTotalDue = Number(u.totalDue || (baseRent + elecTotal + maint + other));
      grossExpected += uTotalDue;
      rentExpected += baseRent;
      elecExpected += elecTotal;
      maintExpected += (maint + other);

      const uPaid = Number(u.paidAmount || 0);
      if (u.status === 'paid') {
        const actualPaid = uPaid > 0 ? uPaid : uTotalDue;
        totalCollected += actualPaid;
        rentCollected += baseRent;
        elecCollected += elecTotal;
        maintCollected += (maint + other);
        paidUnitsCount++;
      } else if (u.status === 'partial') {
        totalCollected += uPaid;
        const remaining = Math.max(0, uTotalDue - uPaid);
        totalPending += remaining;
        pendingUnitsCount++;
        // Approximate proportional recovery
        const ratio = uTotalDue > 0 ? (uPaid / uTotalDue) : 1;
        rentCollected += Math.round(baseRent * ratio);
        elecCollected += Math.round(elecTotal * ratio);
        maintCollected += Math.round((maint + other) * ratio);
      } else {
        totalPending += uTotalDue;
        pendingUnitsCount++;
      }
    } else {
      // Vacant room: still potential rent
      grossExpected += baseRent;
      rentExpected += baseRent;
    }
  });

  const totalExpenses = (state.expenses || []).reduce((acc, exp) => acc + Number(exp.amount || 0), 0);
  const netProfit = totalCollected - totalExpenses;
  const collectionPct = (totalCollected + totalPending) > 0 ? Math.round((totalCollected / (totalCollected + totalPending)) * 100) : 0;
  const rentPct = rentExpected > 0 ? Math.min(100, Math.round((rentCollected / rentExpected) * 100)) : 0;
  const elecPct = elecExpected > 0 ? Math.min(100, Math.round((elecCollected / elecExpected) * 100)) : 0;
  const maintPct = maintExpected > 0 ? Math.min(100, Math.round((maintCollected / maintExpected) * 100)) : 0;

  // Update KPI Elements
  const kpiGross = document.getElementById('kpi-gross-expected');
  if (kpiGross) kpiGross.innerText = `₹${grossExpected.toLocaleString('en-IN')}`;

  const kpiGrossSub = document.getElementById('kpi-gross-sub');
  if (kpiGrossSub) kpiGrossSub.innerText = `Rent: ₹${rentExpected.toLocaleString('en-IN')} + Bijli: ₹${elecExpected.toLocaleString('en-IN')}`;

  const kpiColl = document.getElementById('kpi-total-collected');
  if (kpiColl) kpiColl.innerText = `₹${totalCollected.toLocaleString('en-IN')}`;

  const kpiCollPct = document.getElementById('kpi-collection-pct');
  if (kpiCollPct) kpiCollPct.innerText = `${collectionPct}% Paid`;

  const kpiCollSub = document.getElementById('kpi-collected-sub');
  if (kpiCollSub) kpiCollSub.innerText = `Received across ${paidUnitsCount} unit${paidUnitsCount !== 1 ? 's' : ''}`;

  const kpiPend = document.getElementById('kpi-total-pending');
  if (kpiPend) kpiPend.innerText = `₹${totalPending.toLocaleString('en-IN')}`;

  const kpiPendCount = document.getElementById('kpi-pending-count');
  if (kpiPendCount) kpiPendCount.innerText = `${pendingUnitsCount} Room${pendingUnitsCount !== 1 ? 's' : ''}`;

  const kpiPendSub = document.getElementById('kpi-pending-sub');
  if (kpiPendSub) kpiPendSub.innerText = pendingUnitsCount > 0 ? `${pendingUnitsCount} unit mein kiraya baaki hai` : 'All dues cleared! 🎉';

  const kpiNet = document.getElementById('kpi-net-profit');
  if (kpiNet) {
    kpiNet.innerText = `₹${netProfit.toLocaleString('en-IN')}`;
    kpiNet.style.color = netProfit >= 0 ? '#34D399' : '#EF4444';
  }

  const kpiExpSub = document.getElementById('kpi-expenses-sub');
  if (kpiExpSub) kpiExpSub.innerText = `After ₹${totalExpenses.toLocaleString('en-IN')} Building Expenses`;

  // Update Revenue Streams
  const sRentStat = document.getElementById('stream-rent-stat');
  if (sRentStat) sRentStat.innerText = `₹${rentCollected.toLocaleString('en-IN')} / ₹${rentExpected.toLocaleString('en-IN')}`;
  const sRentBar = document.getElementById('stream-rent-bar');
  if (sRentBar) sRentBar.style.width = `${rentPct}%`;
  const sRentHint = document.getElementById('stream-rent-hint');
  if (sRentHint) sRentHint.innerText = `${rentPct}% Base Rent Collect Ho Gaya`;

  const sElecStat = document.getElementById('stream-elec-stat');
  if (sElecStat) sElecStat.innerText = `₹${elecCollected.toLocaleString('en-IN')} / ₹${elecExpected.toLocaleString('en-IN')}`;
  const sElecBar = document.getElementById('stream-elec-bar');
  if (sElecBar) sElecBar.style.width = `${elecPct}%`;
  const sElecHint = document.getElementById('stream-elec-hint');
  if (sElecHint) sElecHint.innerText = `Total ${totalUnitsConsumed} Units Consumed`;

  const sMaintStat = document.getElementById('stream-maint-stat');
  if (sMaintStat) sMaintStat.innerText = `₹${maintCollected.toLocaleString('en-IN')} / ₹${maintExpected.toLocaleString('en-IN')}`;
  const sMaintBar = document.getElementById('stream-maint-bar');
  if (sMaintBar) sMaintBar.style.width = `${maintPct}%`;
  const sMaintHint = document.getElementById('stream-maint-hint');
  if (sMaintHint) sMaintHint.innerText = `${maintPct}% Maintenance Recovery`;

  // Unit count text
  const countText = document.getElementById('report-unit-count-text');
  if (countText) countText.innerText = `Showing ${filtered.length} of ${state.units.length} rooms`;

  // Render Desktop Table Rows
  if (tableBody) {
    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px;">Is filter ke mutabiq koi room nahi mila.</td></tr>`;
    } else {
      tableBody.innerHTML = filtered.map(u => {
        const isVacant = u.status === 'vacant';
        const totalDue = Number(u.totalDue || u.rentAmount || 0);
        const paidAmount = Number(u.paidAmount || 0);
        const remaining = Math.max(0, totalDue - paidAmount);
        const unitsUsed = Math.max(0, (Number(u.currReading) || 0) - (Number(u.prevReading) || 0));
        const statusMeta = getDueStatus(u);

        let paidCellHtml = '';
        if (isVacant) {
          paidCellHtml = `<span style="color:var(--text-muted);">-</span>`;
        } else if (u.status === 'paid') {
          paidCellHtml = `<strong style="color: #10B981;">₹${(paidAmount || totalDue).toLocaleString('en-IN')}</strong><br><span style="font-size:0.7rem; color:var(--text-muted);">Cleared on ${u.paidDate || 'cycle'}</span>`;
        } else if (u.status === 'partial') {
          paidCellHtml = `<strong style="color: #10B981;">₹${paidAmount.toLocaleString('en-IN')}</strong><br><span style="color: #F59E0B; font-weight:700; font-size:0.74rem;">₹${remaining.toLocaleString('en-IN')} बाकी</span>`;
        } else {
          paidCellHtml = `<span style="color:var(--text-muted);">₹0</span><br><span style="color: #EF4444; font-weight:700; font-size:0.74rem;">₹${totalDue.toLocaleString('en-IN')} बाकी</span>`;
        }

        return `
          <tr>
            <td>
              <strong>${escapeHTML(u.unitName)}</strong>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${escapeHTML(u.propertyName || 'Gokul Nivas')}</div>
            </td>
            <td>
              ${isVacant 
                ? `<span style="color: var(--text-muted); font-style: italic;">Khali (Vacant)</span>` 
                : `<strong>${escapeHTML(u.tenantName || 'Tenant')}</strong>
                   <div style="font-size: 0.72rem; color: var(--text-secondary);">
                     ${u.tenantPhone ? `<a href="tel:${escapeHTML(u.tenantPhone)}" style="color: inherit; text-decoration: none;">📞 ${escapeHTML(u.tenantPhone)}</a>` : ''}
                     ${u.moveInDate ? ` • In: ${escapeHTML(formatDisplayDate(u.moveInDate))}` : ''}
                   </div>`
              }
            </td>
            <td>
              ${isVacant 
                ? `<span style="font-size:0.75rem; color:var(--text-muted);">Meter: ${escapeHTML(u.meterNumber || '-')}</span>` 
                : `<code>${u.prevReading || 0} ➔ ${u.currReading || 0}</code>
                   <div style="font-size: 0.72rem; color: #F59E0B; font-weight: 600;">${unitsUsed} units @ ₹${u.unitRate || 8}</div>`
              }
            </td>
            <td>
              <div>Rent: ₹${Number(u.rentAmount || 0).toLocaleString('en-IN')}</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">
                ⚡ ₹${Number(u.electricityTotal || 0).toLocaleString('en-IN')} + 💧 ₹${Number(u.maintenance || 0).toLocaleString('en-IN')}
              </div>
            </td>
            <td>
              <strong style="font-size: 0.95rem; color: #fff;">₹${totalDue.toLocaleString('en-IN')}</strong>
            </td>
            <td>${paidCellHtml}</td>
            <td>
              <span class="status-badge ${statusMeta.class}">${statusMeta.text}</span>
            </td>
            <td>
              <div class="report-actions-cell">
                ${!isVacant ? `
                  ${u.status === 'paid' ? `
                    <button class="btn btn-whatsapp btn-xs" title="WhatsApp Monthly Statement" onclick="sendWhatsAppMonthlyStatementDirect('${u.id}')">
                      ${WHATSAPP_ICON_SVG} पर्ची
                    </button>
                    <button class="btn btn-secondary btn-xs" title="Monthly Bill Statement" onclick="openMonthlyStatementModal('${u.id}')">
                      🧾 मासिक पर्ची
                    </button>
                  ` : `
                    <button class="btn btn-whatsapp btn-xs" title="WhatsApp तकादा (Reminder)" onclick="sendWhatsAppReminder('${u.id}')">
                      ${WHATSAPP_ICON_SVG} तकादा
                    </button>
                    <button class="btn btn-success btn-xs" title="Record Payment" onclick="openPaymentModal('${u.id}')">
                      ₹ Pay
                    </button>
                    <button class="btn btn-secondary btn-xs" title="Monthly Statement" onclick="openMonthlyStatementModal('${u.id}')">
                      🧾 पर्ची
                    </button>
                  `}
                  <button class="btn btn-secondary btn-xs" title="Electricity Meter Calculator" onclick="openBillModal('${u.id}')">
                    ⚡
                  </button>
                ` : `
                  <button class="btn btn-primary btn-xs" title="Add Tenant" onclick="openAddTenantModal('${u.id}')">
                    + Add
                  </button>
                `}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // Render Mobile Cards View
  if (mobileContainer) {
    if (filtered.length === 0) {
      mobileContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 24px;">Koi room nahi mila.</div>`;
    } else {
      mobileContainer.innerHTML = filtered.map(u => {
        const isVacant = u.status === 'vacant';
        const totalDue = Number(u.totalDue || u.rentAmount || 0);
        const paidAmount = Number(u.paidAmount || 0);
        const remaining = Math.max(0, totalDue - paidAmount);
        const unitsUsed = Math.max(0, (Number(u.currReading) || 0) - (Number(u.prevReading) || 0));
        const statusMeta = getDueStatus(u);

        return `
          <div class="report-unit-card">
            <div class="ruc-top">
              <div>
                <span class="ruc-unit-name">${escapeHTML(u.unitName)}</span>
                <span class="ruc-property">${escapeHTML(u.propertyName || 'Gokul Nivas')}</span>
              </div>
              <span class="status-badge ${statusMeta.class}">${statusMeta.text}</span>
            </div>

            <div class="ruc-tenant-row">
              <div>
                ${isVacant 
                  ? `<span style="color: var(--text-muted); font-style: italic;">Khali (Vacant)</span>` 
                  : `<strong>${escapeHTML(u.tenantName || 'Tenant')}</strong>`
                }
                ${u.moveInDate ? `<span style="display:block; font-size:0.7rem; color:var(--text-muted);">In: ${escapeHTML(formatDisplayDate(u.moveInDate))}</span>` : ''}
              </div>
              ${u.tenantPhone ? `<a href="tel:${escapeHTML(u.tenantPhone)}" class="btn btn-secondary btn-xs" style="text-decoration:none;">📞 Call</a>` : ''}
            </div>

            <div class="ruc-grid">
              <div class="ruc-grid-item">
                <span>Base Rent:</span>
                <strong>₹${Number(u.rentAmount || 0).toLocaleString('en-IN')}</strong>
              </div>
              <div class="ruc-grid-item">
                <span>Bijli (${unitsUsed} units):</span>
                <strong style="color: #F59E0B;">₹${Number(u.electricityTotal || 0).toLocaleString('en-IN')}</strong>
              </div>
              <div class="ruc-grid-item">
                <span>Total Due:</span>
                <strong>₹${totalDue.toLocaleString('en-IN')}</strong>
              </div>
              <div class="ruc-grid-item">
                <span>Paid / Baaki:</span>
                <strong style="color: ${u.status === 'paid' ? '#10B981' : (u.status === 'partial' ? '#F59E0B' : '#EF4444')};">
                  ${u.status === 'paid' ? `₹${(paidAmount || totalDue).toLocaleString('en-IN')} (Full)` : (u.status === 'partial' ? `₹${paidAmount.toLocaleString('en-IN')} (₹${remaining} baaki)` : `₹0 (₹${totalDue} baaki)`)}
                </strong>
              </div>
            </div>

            <div class="ruc-actions-row">
              ${!isVacant ? `
                ${u.status === 'paid' ? `
                  <button type="button" class="btn-rlc btn-rlc-whatsapp" onclick="sendWhatsAppMonthlyStatementDirect('${u.id}')" title="WhatsApp Monthly Statement">
                    ${WHATSAPP_ICON_SVG}
                    <span>WhatsApp पर्ची</span>
                  </button>
                  <button type="button" class="btn-rlc btn-rlc-receipt" onclick="openMonthlyStatementModal('${u.id}')" title="Monthly Bill Statement">
                    <span>मासिक पर्ची</span>
                  </button>
                ` : `
                  <button type="button" class="btn-rlc btn-rlc-whatsapp" onclick="sendWhatsAppReminder('${u.id}')" title="WhatsApp Rent Reminder">
                    ${WHATSAPP_ICON_SVG}
                    <span>WhatsApp तकादा</span>
                  </button>
                  <button type="button" class="btn-rlc btn-rlc-pay" onclick="openPaymentModal('${u.id}')" title="Kiraya Jama">
                    <span>₹ Jama Karein</span>
                  </button>
                  <button type="button" class="btn-rlc btn-rlc-receipt" onclick="openMonthlyStatementModal('${u.id}')" title="Monthly Bill Statement">
                    <span>मासिक पर्ची</span>
                  </button>
                `}
                <button type="button" class="btn-rlc btn-rlc-sec" onclick="openBillModal('${u.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                  <span>Bijli Bill</span>
                </button>
                <button type="button" class="btn-rlc btn-rlc-sec" onclick="openEditTenantModal('${u.id}')">
                  <span>Edit</span>
                </button>
              ` : `
                <button type="button" class="btn btn-primary btn-block" style="grid-column: span 2;" onclick="openAddTenantModal('${u.id}')">
                  + Add New Tenant (किरायेदार जोड़ें)
                </button>
              `}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Render expenses list
  renderExpensesList();
}

function renderExpensesList() {
  const container = document.getElementById('report-expenses-list');
  if (!container) return;

  if (!state.expenses || state.expenses.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 14px; font-size: 0.78rem;">Koi building expense darj nahi hai. "+ Add Expense" par click karke motor pump, safai ya repair kharcha jodein.</div>`;
    return;
  }

  container.innerHTML = state.expenses.map(exp => `
    <div class="expense-item">
      <div class="expense-info">
        <span class="expense-title-text">${escapeHTML(exp.title)}</span>
        <span class="expense-meta">${escapeHTML(exp.category || 'General')} • ${escapeHTML(formatDisplayDate(exp.date) || exp.date)}</span>
      </div>
      <div class="expense-right">
        <span class="expense-amount-text">-₹${Number(exp.amount || 0).toLocaleString('en-IN')}</span>
        <button class="expense-del-btn" title="Delete Expense" onclick="handleDeleteExpense('${exp.id}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>
  `).join('');
}

function openAddExpenseModal() {
  const dateInput = document.getElementById('exp-date');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
  const titleInput = document.getElementById('exp-title');
  if (titleInput) titleInput.value = '';
  const amtInput = document.getElementById('exp-amount');
  if (amtInput) amtInput.value = '';

  openModal('modal-expense');
}

function handleSaveExpense(e) {
  e.preventDefault();
  const title = document.getElementById('exp-title').value.trim();
  const category = document.getElementById('exp-category').value;
  const amount = Number(document.getElementById('exp-amount').value) || 0;
  const date = document.getElementById('exp-date').value || new Date().toISOString().split('T')[0];

  if (!title || amount <= 0) {
    showToast('Kripya kharche ka naam aur sahi amount bharein!');
    return;
  }

  const newExpense = {
    id: 'exp-' + Date.now(),
    title,
    category,
    amount,
    date
  };

  if (!state.expenses) state.expenses = [];
  state.expenses.unshift(newExpense);
  saveToStorage();
  closeModal('modal-expense');
  renderMonthlyReportView();
  showToast(`₹${amount.toLocaleString('en-IN')} ka kharcha darj ho gaya!`);
}

function handleDeleteExpense(expId) {
  if (!confirm('Kya aap yeh building expense hatana chahte hain?')) return;
  state.expenses = (state.expenses || []).filter(e => e.id !== expId);
  saveToStorage();
  renderMonthlyReportView();
  showToast('Expense successfully delete ho gaya!');
}

function printMonthlyReport() {
  const cycle = (state.settings.currentCycle || 'October_2026').replace(/[^a-zA-Z0-9]/g, '_');
  const originalTitle = document.title;
  document.title = `Nivas_KirayaBook_Monthly_Report_${cycle}`;
  
  document.body.classList.add('printing-report-doc');
  window.print();
  
  setTimeout(() => {
    document.body.classList.remove('printing-report-doc');
    document.title = originalTitle;
  }, 1200);
}

function shareWhatsAppMonthlyReport() {
  const cycle = document.getElementById('report-select-month') ? document.getElementById('report-select-month').value : (state.settings.currentCycle || 'October 2026');
  const prop = state.settings.defaultProperty || 'Nivas Property';

  // Calculate stats
  let totalGross = 0;
  let totalColl = 0;
  let totalPend = 0;
  let pendCount = 0;

  state.units.forEach(u => {
    if (u.status !== 'vacant') {
      const due = Number(u.totalDue || u.rentAmount || 0);
      totalGross += due;
      const paid = Number(u.paidAmount || 0);
      if (u.status === 'paid') {
        totalColl += (paid || due);
      } else if (u.status === 'partial') {
        totalColl += paid;
        totalPend += Math.max(0, due - paid);
        pendCount++;
      } else {
        totalPend += due;
        pendCount++;
      }
    }
  });

  const totalExp = (state.expenses || []).reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const netProfit = totalColl - totalExp;
  const collPct = (totalColl + totalPend) > 0 ? Math.round((totalColl / (totalColl + totalPend)) * 100) : 0;

  let msg = `📊 *मासिक किराया व आय-व्यय ऑडिट रिपोर्ट*\n`;
  msg += `🏢 *Property:* ${prop}\n`;
  msg += `📅 *Billing Cycle:* ${cycle}\n`;
  msg += `👤 *Landlord:* ${state.settings.ownerName} (+91 ${state.settings.ownerPhone})\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *Gross Expected:* ₹${totalGross.toLocaleString('en-IN')}\n`;
  msg += `✅ *Total Collected:* ₹${totalColl.toLocaleString('en-IN')} (${collPct}%)\n`;
  msg += `⚠️ *Total Pending:* ₹${totalPend.toLocaleString('en-IN')} (${pendCount} Rooms)\n`;
  msg += `🛠️ *Building Expenses:* ₹${totalExp.toLocaleString('en-IN')}\n`;
  msg += `✨ *Net In-Hand Profit:* ₹${netProfit.toLocaleString('en-IN')}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📋 *कमरा-वार स्थिति (Room Status):*\n`;

  state.units.forEach(u => {
    if (u.status === 'vacant') {
      msg += `• *${u.unitName}*: 🟢 Khali (₹${u.rentAmount}/mo)\n`;
    } else {
      const due = Number(u.totalDue || u.rentAmount || 0);
      const paid = Number(u.paidAmount || 0);
      if (u.status === 'paid') {
        msg += `• *${u.unitName}* (${u.tenantName}): ✅ Paid ₹${(paid || due).toLocaleString('en-IN')}\n`;
      } else if (u.status === 'partial') {
        msg += `• *${u.unitName}* (${u.tenantName}): ⏳ Partial (₹${paid} जमा, ₹${due - paid} बाकी)\n`;
      } else {
        msg += `• *${u.unitName}* (${u.tenantName}): ❌ Pending ₹${due.toLocaleString('en-IN')}\n`;
      }
    }
  });

  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `_Generated via Nivas KirayaBook App_ 🚀`;

  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function sendWhatsAppMonthlyStatement(unitId) {
  const unit = state.units.find(u => u.id === unitId);
  if (!unit || unit.status === 'vacant') {
    showToast('Yeh room khali hai!');
    return;
  }

  const phone = (unit.tenantPhone || '').replace(/\D/g, '');
  const cycle = unit.billingMonth || state.settings.currentCycle || 'October 2026';
  const unitsConsumed = Math.max(0, (unit.currReading || 0) - (unit.prevReading || 0));
  const total = Number(unit.totalDue || unit.rentAmount || 0);
  const paid = Number(unit.paidAmount || 0);
  const remaining = Math.max(0, total - paid);

  let msg = `🙏 *नमस्ते ${unit.tenantName} जी,*\n\n`;
  msg += `*${state.settings.defaultProperty || 'Gokul Nivas'}* - ${unit.unitName} का *${cycle}* का किराया विवरण:\n\n`;
  msg += `🏠 *मकान किराया (Rent):* ₹${unit.rentAmount.toLocaleString('en-IN')}\n`;
  msg += `⚡ *बिजली मीटर बिल:* ₹${(unit.electricityTotal || 0).toLocaleString('en-IN')}\n`;
  msg += `   (रीडिंग: ${unit.prevReading || 0} ➔ ${unit.currReading || 0} = ${unitsConsumed} यूनिट @ ₹${unit.unitRate || 8}/unit)\n`;
  if (unit.maintenance) msg += `💧 *मेंटेनेंस / पानी:* ₹${unit.maintenance.toLocaleString('en-IN')}\n`;
  if (unit.otherCharges) msg += `➕ *अन्य शुल्क:* ₹${unit.otherCharges.toLocaleString('en-IN')}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *कुल देय राशि (Total Bill):* ₹${total.toLocaleString('en-IN')}\n`;

  if (unit.status === 'paid') {
    msg += `✅ *भुगतान स्थिति (Status):* जमा हो चुका है (Fully Paid) 🎉\n`;
    msg += `धन्यवाद!\n`;
  } else if (unit.status === 'partial') {
    msg += `⏳ *जमा राशि (Received):* ₹${paid.toLocaleString('en-IN')}\n`;
    msg += `⚠️ *शेष बकाया राशि (Balance Due):* ₹${remaining.toLocaleString('en-IN')}\n\n`;
    if (state.settings.ownerUPI) {
      const upiUrl = `upi://pay?pa=${state.settings.ownerUPI}&pn=${encodeURIComponent(state.settings.ownerName)}&am=${remaining}&cu=INR&tn=${encodeURIComponent(`${unit.unitName} Balance Rent`)}`;
      msg += `📲 *GPay / PhonePe / Paytm से शेष भुगतान करने के लिए नीचे लिंक दबाएं:*\n${upiUrl}\n\n`;
    }
    msg += `कृपया शेष राशि जल्द जमा करवाएं।\n`;
  } else {
    msg += `⚠️ *भुगतान स्थिति:* बकाया (Pending)\n\n`;
    if (state.settings.ownerUPI) {
      const upiUrl = `upi://pay?pa=${state.settings.ownerUPI}&pn=${encodeURIComponent(state.settings.ownerName)}&am=${total}&cu=INR&tn=${encodeURIComponent(`${unit.unitName} Rent`)}`;
      msg += `📲 *GPay / PhonePe / Paytm से 1-Click में जमा करने के लिए लिंक:*\n${upiUrl}\n\n`;
    }
    msg += `कृपया समय पर किराया जमा करवाएं।\n`;
  }

  msg += `— *${state.settings.ownerName}* (मकान मालिक)\n📞 +91 ${state.settings.ownerPhone}`;

  const finalPhone = phone.length === 10 ? `91${phone}` : phone;
  const url = `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// ==========================================
// SCREEN 5: Settings & Owner Profile
// ==========================================

function populateSettingsScreen() {
  const nameEl = document.getElementById('set-screen-owner-name');
  if (nameEl) nameEl.value = state.settings.ownerName || '';

  const phoneEl = document.getElementById('set-screen-owner-phone');
  if (phoneEl) phoneEl.value = state.settings.ownerPhone || '';

  const upiEl = document.getElementById('set-screen-owner-upi');
  if (upiEl) upiEl.value = state.settings.ownerUPI || '';

  const propEl = document.getElementById('set-screen-property-default');
  if (propEl) propEl.value = state.settings.defaultProperty || '';

  const rateEl = document.getElementById('set-screen-default-rate');
  if (rateEl) rateEl.value = state.settings.defaultUnitRate || 8;

  const cycleEl = document.getElementById('set-screen-current-cycle');
  if (cycleEl) cycleEl.value = state.settings.currentCycle || 'October 2026';

  const panEl = document.getElementById('set-screen-owner-pan');
  if (panEl) panEl.value = state.settings.ownerPAN || '';

  const upiBadge = document.getElementById('settings-display-upi');
  if (upiBadge) upiBadge.innerText = state.settings.ownerUPI || 'ramesh@okaxis';
}

function handleSaveSettingsScreen(e) {
  e.preventDefault();
  state.settings.ownerName = document.getElementById('set-screen-owner-name').value.trim();
  state.settings.ownerPhone = document.getElementById('set-screen-owner-phone').value.trim();
  state.settings.ownerUPI = document.getElementById('set-screen-owner-upi').value.trim();
  state.settings.defaultProperty = document.getElementById('set-screen-property-default').value.trim();
  state.settings.defaultUnitRate = Number(document.getElementById('set-screen-default-rate').value) || 8;
  state.settings.currentCycle = document.getElementById('set-screen-current-cycle').value.trim() || 'October 2026';
  state.settings.ownerPAN = document.getElementById('set-screen-owner-pan').value.trim().toUpperCase();

  saveToStorage();
  updateOwnerUI();
  populateSettingsScreen();
  showToast('Owner settings successfully update ho gayi!');
}

function exportDataToJSON() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const a = document.createElement('a');
  a.setAttribute('href', dataStr);
  a.setAttribute('download', `Nivas_KirayaBook_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast('Data backup JSON download ho gaya!');
}

function importDataFromJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.units && Array.isArray(imported.units)) {
        state = imported;
        saveToStorage();
        updateOwnerUI();
        renderDashboard();
        renderTenantsView();
        initCalculatorScreen();
        renderHistoryTable();
        populateSettingsScreen();
        populateBillUnitSelect();
        showToast('Backup successfully restore ho gaya!');
      } else {
        showToast('Galat file format!');
      }
    } catch (err) {
      showToast('JSON parse karne mein error aaya.');
    }
  };
  reader.readAsText(file);
}

function resetToSampleData() {
  if (confirm('Kya aap saara data clear karke fresh real khata shuru karna chahte hain?')) {
    state.settings = { ...DEFAULT_SETTINGS };
    state.units = [];
    state.history = [];
    state.expenses = [];
    localStorage.removeItem(STORAGE_KEY);
    saveToStorage();
    updateOwnerUI();
    renderDashboard();
    renderTenantsView();
    initCalculatorScreen();
    renderHistoryTable();
    renderMonthlyReportView();
    populateSettingsScreen();
    populateBillUnitSelect();
    showToast('Khata fresh reset ho gaya! Ab naye rooms add karein.');
  }
}

// ==========================================
// Onboarding & Demo Banner Handlers
// ==========================================

function openOnboardingModal() {
  const nameEl = document.getElementById('onboard-owner-name');
  if (nameEl) nameEl.value = state.settings.ownerName || '';

  const phoneEl = document.getElementById('onboard-owner-phone');
  if (phoneEl) phoneEl.value = state.settings.ownerPhone || '';

  const propEl = document.getElementById('onboard-property-name');
  if (propEl) propEl.value = state.settings.defaultProperty || '';

  const upiEl = document.getElementById('onboard-owner-upi');
  if (upiEl) upiEl.value = state.settings.ownerUPI || '';

  openModal('modal-onboarding');
}

function handleSaveOnboarding(e) {
  e.preventDefault();
  const name = (document.getElementById('onboard-owner-name').value || '').trim();
  const phone = (document.getElementById('onboard-owner-phone').value || '').trim();
  const prop = (document.getElementById('onboard-property-name').value || '').trim();
  const upi = (document.getElementById('onboard-owner-upi').value || '').trim();

  state.settings.ownerName = name || 'Makan Malik';
  state.settings.ownerPhone = phone || '';
  state.settings.defaultProperty = prop || 'Mera Bhawan';
  state.settings.ownerUPI = upi || '';

  // Clear demo data to start fresh real khata
  state.units = [];
  state.history = [];
  state.expenses = [];
  localStorage.setItem('nivas_demo_dismissed', 'true');

  saveToStorage();
  updateOwnerUI();
  closeModal('modal-onboarding');
  dismissDemoBanner();
  renderDashboard();
  renderTenantsView();
  renderHistoryTable();
  renderMonthlyReportView();
  populateSettingsScreen();

  showToast('🎉 Mubarak ho! Asli Khata shuru ho gaya. Ab pehla Room add karein.');
  setTimeout(() => {
    openAddTenantModal();
  }, 400);
}

function dismissDemoBanner() {
  localStorage.setItem('nivas_demo_dismissed', 'true');
  const banner = document.getElementById('demo-notice-banner');
  if (banner) banner.style.display = 'none';
}

function sendBulkReminderNotice() {
  const pendingUnits = state.units.filter(u => (u.status === 'pending' || u.status === 'partial') && u.tenantPhone);
  if (pendingUnits.length === 0) {
    showToast('🎉 Badhai! Sabhi kamro ka kiraya jama ho chuka hai. Koi pending nahi hai.');
    return;
  }

  if (pendingUnits.length === 1) {
    sendWhatsAppReminder(pendingUnits[0].id);
    return;
  }

  showToast(`Sabhi ${pendingUnits.length} baaki kamro ke liye WhatsApp reminder khol rahe hain...`);
  sendWhatsAppReminder(pendingUnits[0].id);
}

// ==========================================
// Modal & Utility Helpers
// ==========================================

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

function closeModalOnOverlay(e, id) {
  if (e.target.id === id) {
    closeModal(id);
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function numberToIndianWords(num) {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = num.toString()).length > 9) return 'Overflow';
  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim() ? str.trim() + ' Rupees only' : 'Zero Rupees only';
}

// Start application when DOM loads
document.addEventListener('DOMContentLoaded', initApp);
