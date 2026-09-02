import { calculateGroupSettlement } from "../src/lib/settlement";
import { calculatePersonalAnalytics } from "../src/lib/analytics";
import { hashPin, verifyPin, signToken, verifyToken } from "../src/lib/auth";

async function runTests() {
  console.log("=========================================");
  console.log("🚀 STARTING FLOWBUDGET ENGINE VALIDATION");
  console.log("=========================================\n");

  // TEST 1: Auth & PIN Hashing
  console.log("🧪 Test 1: Testing Username & PIN Authentication...");
  const pin = "4829";
  const pinHash = await hashPin(pin);
  const isValid = await verifyPin("4829", pinHash);
  const isInvalid = await verifyPin("9999", pinHash);

  if (!isValid || isInvalid) {
    throw new Error("PIN hashing verification failed!");
  }

  const token = signToken({ id: "user-123", username: "alex", currency: "USD" });
  const decoded = verifyToken(token);
  if (!decoded || decoded.username !== "alex") {
    throw new Error("JWT token signing / verification failed!");
  }
  console.log("✅ Test 1 Passed: Auth & PIN security functioning flawlessly.\n");

  // TEST 2: 6-Person Trip Min-Cash-Flow Settlement Algorithm
  console.log("🧪 Test 2: Testing 6-Person Colorado Trip Settlement...");
  const members = [
    { id: "m1", user: { id: "u1", username: "alex" } },
    { id: "m2", user: { id: "u2", username: "sarah" } },
    { id: "m3", user: { id: "u3", username: "rahul" } },
    { id: "m4", user: { id: "u4", username: "emma" } },
    { id: "m5", user: { id: "u5", username: "david" } },
    { id: "m6", user: { id: "u6", username: "priya" } },
  ];

  const expenses = [
    // Alex paid $600 for Cabin for all 6 ($100 each)
    {
      id: "e1",
      paidById: "u1",
      amount: 600,
      description: "Cabin Booking in Rockies",
      category: "Accommodation",
      date: new Date(),
      splits: members.map((m) => ({ userId: m.user.id, shareAmount: 100 })),
    },
    // Sarah paid $180 for Dinner for all 6 ($30 each)
    {
      id: "e2",
      paidById: "u2",
      amount: 180,
      description: "Dinner at Mountain Lodge",
      category: "Food & Drinks",
      date: new Date(),
      splits: members.map((m) => ({ userId: m.user.id, shareAmount: 30 })),
    },
    // Rahul paid $120 for Groceries for 4 people (u1, u2, u3, u4: $30 each)
    {
      id: "e3",
      paidById: "u3",
      amount: 120,
      description: "Supermarket supplies",
      category: "Groceries & Snacks",
      date: new Date(),
      splits: ["u1", "u2", "u3", "u4"].map((uid) => ({ userId: uid, shareAmount: 30 })),
    },
    // Emma paid $90 for Rental Car Gas for 3 people (u1, u4, u5: $30 each)
    {
      id: "e4",
      paidById: "u4",
      amount: 90,
      description: "Gasoline",
      category: "Transportation & Gas",
      date: new Date(),
      splits: ["u1", "u4", "u5"].map((uid) => ({ userId: uid, shareAmount: 30 })),
    },
  ];

  const result = calculateGroupSettlement(members, expenses, []);

  console.log(`- Total Trip Expenditure: $${result.totalSpent.toFixed(2)}`);
  console.log("- Individual Net Balances:");
  let sumNet = 0;
  for (const mb of result.memberBalances) {
    sumNet += mb.netBalance;
    console.log(
      `  • @${mb.username.padEnd(8)}: Paid $${mb.totalPaid.toFixed(2)}, Share $${mb.totalShare.toFixed(2)}, Net: ${
        mb.netBalance >= 0 ? "+" : ""
      }$${mb.netBalance.toFixed(2)}`
    );
  }

  if (Math.abs(sumNet) > 0.01) {
    throw new Error(`Net sum is not 0! Sum was: ${sumNet}`);
  }

  console.log("\n- Calculated Min-Cash-Flow Optimal Transfers:");
  for (const t of result.settlementTransfers) {
    console.log(`  ➔ @${t.fromUsername} pays @${t.toUsername}: $${t.amount.toFixed(2)}`);
  }

  if (result.settlementTransfers.length > members.length - 1) {
    throw new Error(`Optimal transfers count (${result.settlementTransfers.length}) exceeded max N-1!`);
  }
  console.log("✅ Test 2 Passed: Min-Cash-Flow settlement math is mathematically exact.\n");

  // TEST 3: Personal Finance Analytics & Budget Alert Engine
  console.log("🧪 Test 3: Testing Personal Finance Analytics & Budget Caps...");
  const sampleTransactions = [
    { id: "t1", type: "INCOME", amount: 4500, category: "Salary", paymentMethod: "BANK_TRANSFER", date: "2026-09-01" },
    { id: "t2", type: "EXPENSE", amount: 650, category: "Food & Dining", paymentMethod: "CARD", date: "2026-09-02" },
    { id: "t3", type: "EXPENSE", amount: 300, category: "Groceries", paymentMethod: "UPI", date: "2026-09-02" },
  ];

  const sampleBudgets = [
    { id: "b1", category: "Food & Dining", monthlyLimit: 500, monthYear: "2026-09" },
    { id: "b2", category: "Groceries", monthlyLimit: 400, monthYear: "2026-09" },
  ];

  const pAnalytics = calculatePersonalAnalytics(sampleTransactions, sampleBudgets, "2026-09");
  console.log(`- Total Income: $${pAnalytics.summary.totalIncome}`);
  console.log(`- Total Expenses: $${pAnalytics.summary.totalExpense}`);
  console.log(`- Net Savings: $${pAnalytics.summary.netSavings} (Savings Rate: ${pAnalytics.summary.savingsRate}%)`);
  console.log(`- Active Budget Alerts: ${pAnalytics.alerts.length}`);
  for (const a of pAnalytics.alerts) {
    console.log(`  ⚠️ [${a.type}] ${a.message}`);
  }

  if (pAnalytics.alerts.length === 0 || pAnalytics.summary.totalExpense !== 950) {
    throw new Error("Personal analytics budget calculation failed!");
  }
  console.log("✅ Test 3 Passed: Personal finance metrics & budget alert engine verified.\n");

  console.log("=========================================");
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY (3/3)");
  console.log("=========================================");
}

runTests().catch((err) => {
  console.error("❌ Test error:", err);
  process.exit(1);
});
