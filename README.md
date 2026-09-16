<p align="center">
  <img src="public/mascot.png" width="130" alt="FlowBudget Mascot" />
</p>

<h1 align="center">FlowBudget</h1>

<p align="center">
  <strong>Dual-Engine Personal Finance & Group Trip Ledger with Living Aurora Glass Aesthetics</strong>
</p>

<p align="center">
  <a href="https://flowbudget-track.vercel.app/"><img src="https://img.shields.io/badge/Live_App-flowbudget--track.vercel.app-00df89?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
  <img src="https://img.shields.io/badge/Next.js_16-Turbopack-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/Database-Neon_PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=black" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Styling-Tailwind_Glass-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</p>

---

## 🦊 Overview

**FlowBudget** is a high-performance, full-stack financial workspace designed to eliminate the friction of daily budgeting and group trip expense tracking. Built with an Apple-inspired liquid glass aesthetic, chromatic living aurora engine, and zero-compromise security.

No email verification hurdles. No robotic spreadsheets. Just lightning-fast money management with personality.

---

## ⚡ Key Highlights

### 1. Dual-Engine Architecture
* **Personal Finance Ledger**: Real-time daily inflow/outflow logging, categorized spending velocity, and category budget caps with visual warning thresholds (`Safe`, `80% Warning`, `100%+ Exceeded`).
* **Group Trip Expense Splitter**: Create private trip circles, share 1-click invite links, support multi-payer transactions, and compute debt settlements.

### 2. Algorithmic Debt Simplification
* Built-in **Minimum-Cash-Flow graph algorithm** ($O(V \log V)$) that untangles chaotic multi-party debts into the absolute minimum number of reimbursement transactions. Turn 15 messy cross-payments into 3 clean transfers.

### 3. Living Aurora & Liquid Glass Design
* Ambient multi-orb 2D Canvas engine synchronized with GPU-composited chromatic typography.
* Tactile frosted glass modals with backdrop blur, specular highlights, and zero layout twitching across mobile and desktop.

### 4. Frictionless Profile Security
* **Username + 4–6 Digit PIN**: Instant login and device profile switching without waiting for email magic links.
* **Self-Serve Account Recovery**: Encrypted secret backup word validation allows instant PIN resets directly from the lock screen.

### 5. Multi-Currency Support
Seamless live currency conversion and display formatting across all personal ledgers and trip groups:

`USD ($)` &bull; `EUR (€)` &bull; `GBP (£)` &bull; `INR (₹)` &bull; `CAD (CA$)` &bull; `AUD (AU$)` &bull; `JPY (¥)`

---

## 📊 Analytics & Reporting

* **Cash Flow Balance**: Dynamic Income vs. Outflow monthly comparative charts.
* **Category Breakdown**: Interactive donut charts highlighting expenditure distribution.
* **Spending Velocity**: Real-time daily burn curves with month-end projections.
* **Time Travel & Audits**: Dedicated Month & Year picker modal for instant historical reporting.
* **Export Ready**: 1-click CSV statement export and clean printable audit view.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | Hybrid Server Components, Server Actions & Turbopack |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strict end-to-end type safety |
| **Database** | [PostgreSQL (Neon)](https://neon.tech/) | Serverless cloud relational database with connection pooling |
| **ORM** | [Prisma 6](https://www.prisma.io/) | Declarative schema migrations and type-safe query compiler |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Custom liquid glass, dock capsules & ambient aurora shaders |
| **Charts** | [Recharts](https://recharts.org/) | Declarative responsive financial telemetry & SVG visualization |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, lightweight UI iconography |
| **Deployment** | [Vercel](https://vercel.com/) | Edge-accelerated production CI/CD |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
* **Node.js 18+**
* A free PostgreSQL database (e.g. [Neon.tech](https://neon.tech))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Yashwanth-23/FlowBudget.git
cd FlowBudget

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
```

### Environment Configuration (`.env`)

```env
DATABASE_URL="postgresql://user:password@ep-sample-pooler.region.neon.tech/flowbudget?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-sample.region.neon.tech/flowbudget?sslmode=require"
JWT_SECRET="your-super-secure-random-32-character-secret"
```

### Run Locally

```bash
# Push database schema
npx prisma db push

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment

FlowBudget is pre-configured for zero-config deployment on [Vercel](https://vercel.com):

1. Import this repository in the Vercel Dashboard.
2. Add your `DATABASE_URL` (pooled connection) and `DIRECT_URL` (direct connection).
3. Add a random `JWT_SECRET`.
4. Deploy!

---

## 📄 License

Distributed under the [MIT License](LICENSE).

---

<p align="center">
  <sub>Built with 🦊 | <strong>FlowBudget</strong>: Track your cash, split your trips, and keep your friends. The only finance tracker that guards your wallet while you sleep.</sub>
</p>

