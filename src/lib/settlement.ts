export interface MemberBalance {
  userId: string;
  username: string;
  totalPaid: number;
  totalShare: number;
  netBalance: number; // positive = owed money, negative = owes money
}

export interface SettlementTransfer {
  id: string;
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  toUsername: string;
  amount: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface ExpenseItem {
  id: string;
  paidById?: string | null;
  amount: number;
  description: string;
  category: string;
  date: Date | string;
  payers?: {
    userId: string;
    amountPaid: number;
  }[];
  splits: {
    userId: string;
    shareAmount: number;
  }[];
}

export interface SettlementRecord {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  isSettled: boolean;
}

export interface GroupCalculationResult {
  totalSpent: number;
  memberBalances: MemberBalance[];
  settlementTransfers: SettlementTransfer[];
  categoryBreakdown: CategoryBreakdown[];
}

export function calculateGroupSettlement(
  members: { id: string; user: { id: string; username: string } }[],
  expenses: ExpenseItem[],
  settlements: SettlementRecord[] = []
): GroupCalculationResult {
  const userMap = new Map<string, string>();
  const totalPaidMap = new Map<string, number>();
  const totalShareMap = new Map<string, number>();
  const netBalanceMap = new Map<string, number>();
  const categoryMap = new Map<string, number>();

  let totalSpent = 0;

  // Initialize all members
  for (const m of members) {
    userMap.set(m.user.id, m.user.username);
    totalPaidMap.set(m.user.id, 0);
    totalShareMap.set(m.user.id, 0);
    netBalanceMap.set(m.user.id, 0);
  }

  // Aggregate expenses
  for (const exp of expenses) {
    const amount = Number(exp.amount) || 0;
    totalSpent += amount;

    // Track category totals
    const cat = exp.category || "General";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + amount);

    // Track Payers: Support Multiple Payers or Single Payer
    if (exp.payers && exp.payers.length > 0) {
      for (const p of exp.payers) {
        const paidAmt = Number(p.amountPaid) || 0;
        const currentPaid = totalPaidMap.get(p.userId) || 0;
        totalPaidMap.set(p.userId, currentPaid + paidAmt);

        const currentNet = netBalanceMap.get(p.userId) || 0;
        netBalanceMap.set(p.userId, currentNet + paidAmt);
      }
    } else if (exp.paidById) {
      const currentPaid = totalPaidMap.get(exp.paidById) || 0;
      totalPaidMap.set(exp.paidById, currentPaid + amount);

      const currentNet = netBalanceMap.get(exp.paidById) || 0;
      netBalanceMap.set(exp.paidById, currentNet + amount);
    }

    // Track Splits (Beneficiaries)
    for (const split of exp.splits) {
      const share = Number(split.shareAmount) || 0;
      const currentShare = totalShareMap.get(split.userId) || 0;
      totalShareMap.set(split.userId, currentShare + share);

      const currentNet = netBalanceMap.get(split.userId) || 0;
      netBalanceMap.set(split.userId, currentNet - share);
    }
  }

  // Factor in completed settlements
  for (const s of settlements) {
    if (s.isSettled) {
      const amount = Number(s.amount) || 0;
      const netFrom = netBalanceMap.get(s.fromUserId) || 0;
      const netTo = netBalanceMap.get(s.toUserId) || 0;

      netBalanceMap.set(s.fromUserId, netFrom + amount);
      netBalanceMap.set(s.toUserId, netTo - amount);
    }
  }

  // Construct Member Balance Summaries
  const memberBalances: MemberBalance[] = [];
  for (const m of members) {
    const uId = m.user.id;
    const paid = totalPaidMap.get(uId) || 0;
    const share = totalShareMap.get(uId) || 0;
    const net = netBalanceMap.get(uId) || 0;

    memberBalances.push({
      userId: uId,
      username: userMap.get(uId) || "Unknown",
      totalPaid: Math.round(paid * 100) / 100,
      totalShare: Math.round(share * 100) / 100,
      netBalance: Math.round(net * 100) / 100,
    });
  }

  // Calculate Min-Cash-Flow optimal transfers
  const debtors: { userId: string; amount: number }[] = [];
  const creditors: { userId: string; amount: number }[] = [];

  for (const mb of memberBalances) {
    if (mb.netBalance < -0.01) {
      debtors.push({ userId: mb.userId, amount: -mb.netBalance });
    } else if (mb.netBalance > 0.01) {
      creditors.push({ userId: mb.userId, amount: mb.netBalance });
    }
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlementTransfers: SettlementTransfer[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settledAmount = Math.min(debtor.amount, creditor.amount);
    if (settledAmount > 0.01) {
      settlementTransfers.push({
        id: `transfer-${debtor.userId}-${creditor.userId}-${settlementTransfers.length}`,
        fromUserId: debtor.userId,
        fromUsername: userMap.get(debtor.userId) || "Unknown",
        toUserId: creditor.userId,
        toUsername: userMap.get(creditor.userId) || "Unknown",
        amount: Math.round(settledAmount * 100) / 100,
      });
    }

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    if (debtor.amount <= 0.01) dIdx++;
    if (creditor.amount <= 0.01) cIdx++;
  }

  // Construct Category Breakdown
  const categoryBreakdown: CategoryBreakdown[] = [];
  for (const [cat, amt] of categoryMap.entries()) {
    categoryBreakdown.push({
      category: cat,
      amount: Math.round(amt * 100) / 100,
      percentage: totalSpent > 0 ? Math.round((amt / totalSpent) * 1000) / 10 : 0,
    });
  }
  categoryBreakdown.sort((a, b) => b.amount - a.amount);

  return {
    totalSpent: Math.round(totalSpent * 100) / 100,
    memberBalances,
    settlementTransfers,
    categoryBreakdown,
  };
}
