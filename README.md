# FlowBudget ⚡

**Production-ready Dual-Mode Personal Finance & Group Trip Expense Tracker**

Designed for zero-friction personal budgeting and group trip expense splitting.

---

## 🌟 Key Features

### 1. Frictionless Profile Authentication
- Unique **Username + 4–6 Digit PIN** security (no email verification hurdles).
- Instant login and profile switching.

### 2. Personal Finance Ledger & Analytics (Daily Tracking)
- **Daily Inflow & Outflow**: Log income and expenses with amount, category, payment mode (Card, Cash, UPI, Bank Transfer), and notes.
- **Category Budget Caps**: Set monthly limits per category with real-time visual alerts (Safe, 80% Warning, 100%+ Exceeded).
- **Interactive Visualizations (Recharts)**:
  - Monthly Cash Flow Bar Chart (Income vs Outflow)
  - Expense Category Breakdown Donut Chart
  - Daily Spending Velocity Burn Curve
- **Export Statements**: 1-click CSV download and clean Printable / PDF audit view.

### 3. Group Trip Expense Splitter
- **1-Click Shareable Links & Codes**: Create a group (e.g. `Summer Trip 2026`), share the link (`/trips/join?code=SUMMER-TRIP-4A9`) via WhatsApp / Telegram / Message.
- **Admin Powers**: Group creator has full administrative controls to manage trip settings, remove unwanted members, or delete expenses.
- **Multi-Payer Expense Splits**: Log single or multiple contributors per expense entry with equal or custom split shares.
- **Minimum-Cash-Flow Optimal Settlement**: $O(V \log V)$ graph algorithm that computes the absolute minimum transfers needed to settle all debts across members.
- **Mark as Settled**: Track settlements with live balance updates.

### 4. Multi-Currency Support
- Default: **USD ($)**
- Switcher: **USD ($), EUR (€), GBP (£), INR (₹), CAD (CA$), AUD (AU$), JPY (¥)**.

---

## 🚀 Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Push database schema
npx prisma db push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ 1-Click Deployment to Vercel (Live URL)

### Environment Variables:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `DIRECT_URL`: Your direct PostgreSQL migration connection string.
- `JWT_SECRET`: Random 32-character secure secret string.
