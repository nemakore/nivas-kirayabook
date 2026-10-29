# 🏠 Nivas KirayaBook (निवास किरायाबुक)

> **Smart, Hassle-Free Kiraya, Bijli Bill & Tenant Management Web App**
> Designed specially for landlords, flat owners, and PG managers to eliminate diary calculations, meter headaches, and awkward payment reminders.

---

## 🌟 Key Features

1. **📊 Smart Kiraya Dashboard**
   - Live metrics: Total Expected vs Collected vs Pending Kiraya.
   - Occupancy rate (Rented vs Vacant rooms/flats).
   - Instant filter: All Units, Pending, Paid, and Vacant.

2. **⚡ Automatic Bijli (Electricity) Meter Calculator**
   - Enter *Previous Reading* and *New Reading*.
   - Auto calculates: `(Current - Previous) × Unit Rate = ₹ Electricity Bill`.
   - Adds water, maintenance, and base rent automatically to calculate the grand total.

3. **💬 1-Click WhatsApp Direct Reminders**
   - Directly opens WhatsApp with a pre-formatted, polite message:
     - Room / Flat Number
     - Base Rent
     - Exact Electricity calculation breakdown (Units × Rate)
     - Maintenance / Water charges
     - Total Amount Due & Due Date
     - **Direct UPI ID** (so tenant can pay instantly via GPay / PhonePe / Paytm).

4. **🧾 Official Rent Receipt Generator (Valid for HRA Tax Exemption)**
   - 1-click printable receipt with auto-converted number-to-words in Indian currency format.
   - Clean, professional legal template with Landlord name, Tenant name, PAN, and authorized signature.
   - Standard browser print (`Ctrl + P`) converts it to a clean black-and-white PDF document.

5. **💾 100% Private & Offline First**
   - All data is saved securely in your browser (`localStorage`).
   - Export backup to JSON anytime or restore previous data.
   - 0% CPU lag, extremely lightweight (runs on any low-end laptop or mobile browser).

6. **📱 Progressive Web App (PWA) Support**
   - Installable on Android & iOS devices directly from the browser.
   - Works fully offline with service worker caching.
   - Native app-like experience with standalone display mode.

7. **🌐 Multi-Language Localization (मराठी / हिंदी / English)**
   - Instant language switching with zero reload.
   - Complete UI translation for English, Hindi (हिंदी), and Marathi (मराठी).

8. **💰 Partial Payment & Arrears (बकाया) Rollover**
   - Support for split/partial payments with quick-pay buttons (50% / 100%).
   - Live remaining balance calculation.
   - Automatic rollover of previous month's unpaid dues to the current bill.

---

## 🚀 How to Run Locally

### Option 1: Direct Double Click
Simply double click `index.html` in your file explorer to open it in Chrome, Edge, Brave, or Firefox.

### Option 2: Python HTTP Server
```bash
python -m http.server 3000
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Free Online Deployment (Share with other devices)
You can deploy this folder for free in 10 seconds:
- **Vercel / Netlify / GitHub Pages**: Just drag & drop this folder or connect git repository!
