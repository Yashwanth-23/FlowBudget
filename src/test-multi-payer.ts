import { calculateGroupSettlement } from "./lib/settlement";

async function testMultiPayerSettlement() {
  console.log("==================================================");
  console.log("🧪 TESTING MULTI-PAYER EXPENSE SETTLEMENT LOGIC");
  console.log("==================================================\n");

  const members = [
    { id: "m1", user: { id: "u1", username: "alex" } },
    { id: "m2", user: { id: "u2", username: "bob" } },
    { id: "m3", user: { id: "u3", username: "charlie" } },
    { id: "m4", user: { id: "u4", username: "david" } },
    { id: "m5", user: { id: "u5", username: "emma" } },
    { id: "m6", user: { id: "u6", username: "frank" } },
  ];

  // Example: Group Dinner was $300.
  // 3 people paid together: Alex paid $80, Bob paid $100, Charlie paid $120.
  // Split equally among all 6 people ($50 each).
  const expenses = [
    {
      id: "e1",
      amount: 300,
      description: "Group Mountain Dinner",
      category: "Food & Drinks",
      date: new Date(),
      payers: [
        { userId: "u1", amountPaid: 80 },
        { userId: "u2", amountPaid: 100 },
        { userId: "u3", amountPaid: 120 },
      ],
      splits: members.map((m) => ({
        userId: m.user.id,
        shareAmount: 50,
      })),
    },
  ];

  const result = calculateGroupSettlement(members, expenses, []);

  console.log(`- Total Expense: $${result.totalSpent.toFixed(2)}`);
  console.log("- Calculated Member Net Balances:");
  for (const mb of result.memberBalances) {
    console.log(
      `  • @${mb.username.padEnd(8)}: Paid $${mb.totalPaid.toFixed(2)}, Share $${mb.totalShare.toFixed(2)}, Net: ${
        mb.netBalance >= 0 ? "+" : ""
      }$${mb.netBalance.toFixed(2)}`
    );
  }

  console.log("\n- Min-Cash-Flow Optimal Transfers:");
  for (const t of result.settlementTransfers) {
    console.log(`  ➔ @${t.fromUsername} pays @${t.toUsername}: $${t.amount.toFixed(2)}`);
  }

  // Verify
  const alex = result.memberBalances.find((m) => m.userId === "u1")!;
  const bob = result.memberBalances.find((m) => m.userId === "u2")!;
  const charlie = result.memberBalances.find((m) => m.userId === "u3")!;
  const david = result.memberBalances.find((m) => m.userId === "u4")!;

  if (alex.netBalance !== 30 || bob.netBalance !== 50 || charlie.netBalance !== 70 || david.netBalance !== -50) {
    throw new Error("Multi-payer balance math mismatch!");
  }

  console.log("\n==================================================");
  console.log("🎉 MULTI-PAYER SETTLEMENT TEST PASSED (100% EXACT)");
  console.log("==================================================");
}

testMultiPayerSettlement().catch((err) => {
  console.error("❌ Test error:", err);
  process.exit(1);
});
