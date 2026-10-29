# 🧠 Nivas KirayaBook — Central Architecture & Developer Brain (brain.md)

> **Purpose:** Single source of truth for rapid development, instant codebase navigation, and error-free additions, updates, deletions, and replacements.

---

## 🗺️ 1. Project Overview & Tech Stack

* **Platform:** Offline-First Progressive Web App (PWA) + Google Play / Blogger compatibility.
* **Stack:** Pure Vanilla HTML5, Modern CSS3 (Grid/Flexbox + Custom Properties), Vanilla JavaScript (ES6+).
* **Storage:** Local-First (`localStorage` + Browser Persistent Storage API) with real-time **Google Firebase Cloud Sync** (Firestore `asia-south1` + Firebase Auth).
* **Target Audience:** Indian Property Owners, Landlords, PG / Hostel Managers needing zero-distraction rent collection, electricity sub-meter calculation, and 1-click WhatsApp reminders with direct UPI deep-links.

---

## 📁 2. File Map & Responsibilities

| File | Purpose & Contents |
| :--- | :--- |
| [`index.html`](file:///c:/Users/Nema%20Kore/OneDrive/Desktop/Nivas%20KirayaBook/index.html) | Semantic UI structure, 4 primary screen `<section>`s, native modals, header, and bottom dock. |
| [`app.js`](file:///c:/Users/Nema%20Kore/OneDrive/Desktop/Nivas%20KirayaBook/app.js) | Core application controller, state management, meter calculations, WhatsApp formatters, PDF receipt generator, and Firebase sync engine. |
| [`i18n.js`](file:///c:/Users/Nema%20Kore/OneDrive/Desktop/Nivas%20KirayaBook/i18n.js) | Multi-language localization system supporting Marathi (`mr`), Hindi (`hi`), and English (`en`). Contains dictionary dictionaries, `t(key)`, `applyTranslations()`, and `setLanguage()`. |
| [`styles.css`](file:///c:/Users/Nema%20Kore/OneDrive/Desktop/Nivas%20KirayaBook/styles.css) | Complete design system, theme variables, 4-tab bottom navigation, responsive cards, glassmorphic effects, and print stylesheet. |
| [`sw.js`](file:///c:/Users/Nema%20Kore/OneDrive/Desktop/Nivas%20KirayaBook/sw.js) | Service Worker for offline asset caching and PWA app installation lifecycle. |
| [`manifest.json`](file:///c:/Users/Nema%20Kore/OneDrive/Desktop/Nivas%20KirayaBook/manifest.json) | Web app manifest with standalone display mode, theme colors, and icons. |
| [`privacy.html`](file:///c:/Users/Nema%20Kore/OneDrive/Desktop/Nivas%20KirayaBook/privacy.html) | Standalone legal privacy policy for Play Store and web distribution. |

---

## 📱 3. Core Screen Architecture (4 Symmetrical Tabs)

Legacy screens (`view-tenants`, `view-reports`) have been cleanly removed and consolidated into 4 core screens:

```
[ App Header: Brand Logo | 🌐 Lang (mr/hi/en) | Oct 2026 ▾ | Avatar (Sync Dot) ]
 │
 ├── 1. #view-dashboard (किराया / Rent)
 │     ├── .ledger-summary-strip (Kul Baaki, Kul Aaya, + Room Button)
 │     ├── .ledger-controls-row (Search input + Filter pills: Sabhi, Baaki, Aadha, Jama, Khali)
 │     └── #tenants-card-container (2-button Room cards: WhatsApp Reminder, Jama/Receipt)
 │
 ├── 2. #view-calculator (बिजली मीटर / Electricity Meter)
 │     ├── .quick-meter-board-section (#quick-meter-container for rapid all-room meter entry)
 │     ├── .calc-input-card (Room select, old/new readings, rate/unit, rent, dues)
 │     └── .calc-output-card (Grand Total, WhatsApp Live Preview Bubble, Send/Save actions)
 │
 ├── 3. #view-history (खाता & रिपोर्ट / Khata & Reports)
 │     ├── .khata-subnav-pills ([ 🧾 Payment Receipts ] | [ 📊 Monthly Audit & Reports ])
 │     ├── #khata-subview-receipts (Search, Total Logged pill, Desktop table, Mobile cards)
 │     └── #khata-subview-report (KPI grid, Room audit table, Building expenses list)
 │
 └── 4. #view-settings (सेटिंग्स / Settings)
       ├── .settings-guide-card (Interactive walkthrough guide)
       ├── Landlord Profile Form (Name, phone, default property, default rate, cycle, PAN)
       ├── Active UPI Banner (Direct payment receiver ID)
       ├── Firebase Cloud Sync Box (Google Auth sign-in / live sync status badge)
       └── Local Backup & Recovery (JSON Download, Restore file, Clear all data)
```

---

## 💾 4. State & Data Schema (`state`)

The single global state object in [`app.js`](file:///c:/Users/Nema%20Kore/OneDrive/Desktop/Nivas%20KirayaBook/app.js) is `state`:

```javascript
state = {
  activeFilter: 'all',       // 'all' | 'pending' | 'partial' | 'paid' | 'vacant'
  currentView: 'dashboard',  // 'dashboard' | 'calculator' | 'history' | 'settings'
  settings: {
    ownerName: 'Makan Malik',
    ownerPhone: '',
    ownerUpi: '',            // e.g. '9876543210@paytm' (Generates upi://pay deep-links)
    defaultProperty: 'Gokul Nivas',
    defaultUnitRate: 8,      // ₹ per kWh unit
    currentCycle: 'October 2026',
    language: 'hi',          // 'mr' | 'hi' | 'en'
    ownerPan: ''             // For HRA tax receipt generation
  },
  units: [
    {
      id: 'unit_123',
      unitName: 'Room 101',
      propertyName: 'Gokul Nivas',
      tenantName: 'Ramesh Kumar',
      tenantPhone: '9876543210',
      rentAmount: 6000,
      previousReading: 1000,
      currentReading: 1050,
      unitRate: 8,
      electricityTotal: 400, // 50 units * ₹8
      maintenance: 0,
      otherCharges: 0,
      previousDue: 0,        // Arrears carried over from previous months
      totalDue: 6400,        // rent + elec + maint + other + prevDue
      paidAmount: 6400,
      status: 'paid',        // 'pending' | 'partial' | 'paid' | 'vacant'
      billingMonth: 'October 2026',
      moveInDate: '2026-01-01',
      dueDay: '05'
    }
  ],
  history: [
    {
      id: 'rcpt_456',
      receiptNo: 'RCP-202610-001',
      unitId: 'unit_123',
      unitName: 'Room 101',
      tenantName: 'Ramesh Kumar',
      amount: 6400,
      paymentMode: 'UPI',    // 'UPI' | 'Cash' | 'Bank' | 'Cheque'
      date: '2026-10-15',
      month: 'October 2026',
      note: 'GPay payment received'
    }
  ],
  expenses: [
    {
      id: 'exp_789',
      title: 'Water pump repair',
      amount: 450,
      category: 'Maintenance',
      date: '2026-10-10',
      note: 'Plumber fees'
    }
  ]
};
```

---

## ⚡ 5. Rapid Operations Cheat-Sheet (CRUD)

| Goal | Primary Function | Relevant File / DOM ID |
| :--- | :--- | :--- |
| **Switch View** | `switchView(viewName)` | Auto-redirects legacy `'tenants'` ➔ `'dashboard'`, `'reports'` ➔ `'history'`. |
| **Switch Khata Subtab** | `switchKhataSubTab('receipts' \| 'report')` | Toggles `#khata-subview-receipts` and `#khata-subview-report`. |
| **Add Room** | `openAddTenantModal()`, `handleSaveTenant(e)` | Form `#tenant-form`, saves via `saveToStorage()`. |
| **Edit Room** | `openEditTenantModal(unitId)` | Prepopulates `#tenant-form` fields. |
| **Delete / Vacate Room** | `deleteOrVacateUnit(unitId)` | Native modal with option to either mark Vacant or completely Delete. |
| **Record Payment** | `openPaymentModal(unitId)`, `handleRecordPayment(e)` | Modal `#modal-payment`, computes balance, adds receipt to `state.history`. |
| **Quick Meter Entry** | `onQmbReadingInput(unitId)`, `saveQmbReading(unitId)` | Inputs `#qmb-input-{unitId}`, updates current reading & electricity total. |
| **Single Room Calc** | `runScreenCalc()`, `saveBillFromScreenCalc()` | Screen `#view-calculator`, updates live WhatsApp preview bubble. |
| **Month Rollover** | `openMonthRolloverModal()`, `confirmMonthRollover()` | Modal `#modal-rollover`, carries over unpaid arrears automatically. |
| **WhatsApp Notice** | `sendWhatsAppNotice(unitId)` | Opens `https://wa.me/{phone}?text={encoded}` with direct UPI link. |
| **Official Receipt** | `openReceiptModal(histId)`, `printOfficialReceipt()` | Generates printable HRA legal rent receipt. |
| **Cloud Sync** | `loginWithGoogle()`, `forceSyncToCloud()`, `logoutFromGoogle()` | Updates avatar dot `#header-cloud-dot` and badge `#settings-cloud-badge`. |

---

## 🚨 6. Critical Golden Rules (Avoid Common Pitfalls)

1. **Storage Function Name:**
   * ALWAYS use `saveToStorage();`.
   * **NEVER** call `saveState();` (does not exist in the codebase).

2. **Electricity & Units Calculation:**
   * ALWAYS compute `unitsConsumed` before calculating electricity total:
     ```javascript
     const curr = Number(unit.currentReading || unit.currReading || 0);
     const prev = Number(unit.previousReading || unit.prevReading || 0);
     const unitsConsumed = Math.max(0, curr - prev);
     const elecTotal = unit.electricityTotal !== undefined 
       ? Number(unit.electricityTotal) 
       : (unitsConsumed * (unit.unitRate || 8));
     ```

3. **Multi-Language (i18n) Protocol:**
   * Any new label, button, or heading in `index.html` MUST have a `data-i18n="key"` attribute.
   * Input placeholders use `data-i18n-ph="key"`.
   * Tooltip titles use `data-i18n-title="key"`.
   * The new key MUST be added to all 3 language blocks in `i18n.js`: `mr` (Marathi), `hi` (Hindi), and `en` (English).

4. **Tag Balance & DOM Integrity:**
   * All screens use `<section id="view-{name}" class="view-screen">`.
   * Never delete container tags (`#tenants-card-container`, `#quick-meter-container`, `#history-mobile-cards`).

---

## 🛠️ 7. Instant 1-Second Health Check Command

To verify complete codebase integrity (JS syntax, HTML tag balance, and 100% i18n coverage across all 3 languages) after any addition, update, or deletion:

```bash
node check.js
```

This validates:
1. Syntax correctness of `app.js` and `i18n.js`
2. Perfect opening/closing balance of all structural HTML tags (`div`, `section`, `form`, `table`, etc.)
3. 100% coverage of every `data-i18n` attribute in Marathi, Hindi, and English dictionaries
