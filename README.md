# FlowBudget ⚡

**Production-ready Dual-Mode Personal Finance & Group Trip Expense Tracker**

Designed for zero-friction personal budgeting and group trip expense splitting (e.g. 6-person Colorado trip).

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

### 3. Group Trip Expense Splitter ("CO fall 26" Use Case)
- **1-Click Shareable Links & Codes**: Create a group (e.g. `CO fall 26`), share the link (`/trips/join?code=CO-FALL-26-4A9`) via WhatsApp / Telegram / Message.
- **Admin Powers**: Group creator has full administrative controls to manage trip settings, remove unwanted members, or delete expenses.
- **Multi-Payer Expense Splits**: Any member can log expenses paid on behalf of all or selected trip members (equal or custom exact shares).
- **Minimum-Cash-Flow Optimal Settlement**: $O(V \log V)$ graph algorithm that computes the absolute minimum transfers needed to settle all debts across members (e.g. turns 15 chaotic cross-debts into 3 clean payments).
- **Mark as Settled**: Track settlements with live balance updates.

### 4. Multi-Currency Support
- Default: **USD ($)**
- Switcher: **USD ($), EUR (€), GBP (£), INR (₹), CAD (CA$), AUD (AU$), JPY (¥)**.

---

## 🚀 Quick Start (Local Development)

```bash
cd scratch/flowbudget

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

To send the live link to your friend right now:

### Option A: Via Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option B: Via GitHub & Vercel Dashboard
1. Push this directory to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **"New Project"** -> Select your repo.
3. Add Environment Variables:
   - `JWT_SECRET`: Any random 32-character string.
   - `DATABASE_URL`: Your cloud PostgreSQL URL (e.g. free from [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com)) or use Neon Serverless Postgres directly via Vercel Storage.
4. Click **Deploy**. Vercel will give you a live HTTPS URL (e.g. `https://flowbudget-app.vercel.app`) you can send to your friend!
