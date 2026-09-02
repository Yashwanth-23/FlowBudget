export interface TransactionData {
  id: string;
  type: string; // "INCOME" | "EXPENSE"
  amount: number;
  category: string;
  paymentMethod: string;
  date: Date | string;
  notes?: string | null;
}

export interface BudgetData {
  id: string;
  category: string;
  monthlyLimit: number;
  monthYear: string;
}

export interface CategoryStat {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface MonthlyTrend {
  month: string; // "YYYY-MM" or "Jan 2026"
  income: number;
  expense: number;
  net: number;
}

export interface DailySpend {
  date: string; // "YYYY-MM-DD"
  amount: number;
  cumulative: number;
}

export interface BudgetHealthItem {
  category: string;
  monthlyLimit: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: "SAFE" | "WARNING" | "EXCEEDED";
  isOverBudget: boolean;
}

export interface PersonalAnalyticsResult {
  summary: {
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
    savingsRate: number;
    transactionCount: number;
    avgDailyExpense: number;
    projectedMonthEndExpense: number;
  };
  categoryBreakdown: CategoryStat[];
  incomeCategoryBreakdown: CategoryStat[];
  monthlyTrends: MonthlyTrend[];
  dailyTrends: DailySpend[];
  budgetHealth: BudgetHealthItem[];
  alerts: {
    type: "DANGER" | "WARNING" | "INFO";
    category: string;
    message: string;
  }[];
}

export function calculatePersonalAnalytics(
  transactions: TransactionData[],
  budgets: BudgetData[] = [],
  targetMonthYear?: string // e.g. "2026-09"
): PersonalAnalyticsResult {
  const currentMonth = targetMonthYear || new Date().toISOString().slice(0, 7);

  let totalIncome = 0;
  let totalExpense = 0;
  const expenseCatMap = new Map<string, { amount: number; count: number }>();
  const incomeCatMap = new Map<string, { amount: number; count: number }>();
  const monthlyMap = new Map<string, { income: number; expense: number }>();
  const dailyMap = new Map<string, number>();

  // Filter transactions for target month or process all for trends
  const currentMonthTransactions: TransactionData[] = [];

  for (const tx of transactions) {
    const amt = Number(tx.amount) || 0;
    const dateObj = new Date(tx.date);
    const txMonth = dateObj.toISOString().slice(0, 7);
    const txDay = dateObj.toISOString().slice(0, 10);

    // Monthly trends
    if (!monthlyMap.has(txMonth)) {
      monthlyMap.set(txMonth, { income: 0, expense: 0 });
    }
    const mData = monthlyMap.get(txMonth)!;

    if (tx.type === "INCOME") {
      mData.income += amt;
    } else {
      mData.expense += amt;
    }

    // If matches target month, include in current month calculations
    if (txMonth === currentMonth) {
      currentMonthTransactions.push(tx);

      if (tx.type === "INCOME") {
        totalIncome += amt;
        const c = incomeCatMap.get(tx.category) || { amount: 0, count: 0 };
        incomeCatMap.set(tx.category, { amount: c.amount + amt, count: c.count + 1 });
      } else {
        totalExpense += amt;
        const c = expenseCatMap.get(tx.category) || { amount: 0, count: 0 };
        expenseCatMap.set(tx.category, { amount: c.amount + amt, count: c.count + 1 });

        dailyMap.set(txDay, (dailyMap.get(txDay) || 0) + amt);
      }
    }
  }

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 1000) / 10 : 0;

  // Expense Category Breakdown
  const categoryBreakdown: CategoryStat[] = [];
  for (const [cat, data] of expenseCatMap.entries()) {
    categoryBreakdown.push({
      category: cat,
      amount: Math.round(data.amount * 100) / 100,
      percentage: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 1000) / 10 : 0,
      count: data.count,
    });
  }
  categoryBreakdown.sort((a, b) => b.amount - a.amount);

  // Income Category Breakdown
  const incomeCategoryBreakdown: CategoryStat[] = [];
  for (const [cat, data] of incomeCatMap.entries()) {
    incomeCategoryBreakdown.push({
      category: cat,
      amount: Math.round(data.amount * 100) / 100,
      percentage: totalIncome > 0 ? Math.round((data.amount / totalIncome) * 1000) / 10 : 0,
      count: data.count,
    });
  }
  incomeCategoryBreakdown.sort((a, b) => b.amount - a.amount);

  // Monthly Trends sorted chronologically
  const sortedMonths = Array.from(monthlyMap.keys()).sort();
  const monthlyTrends: MonthlyTrend[] = sortedMonths.map((m) => {
    const data = monthlyMap.get(m)!;
    return {
      month: m,
      income: Math.round(data.income * 100) / 100,
      expense: Math.round(data.expense * 100) / 100,
      net: Math.round((data.income - data.expense) * 100) / 100,
    };
  });

  // Daily Trends for current month
  const sortedDays = Array.from(dailyMap.keys()).sort();
  let runningTotal = 0;
  const dailyTrends: DailySpend[] = sortedDays.map((d) => {
    const amt = dailyMap.get(d)!;
    runningTotal += amt;
    return {
      date: d,
      amount: Math.round(amt * 100) / 100,
      cumulative: Math.round(runningTotal * 100) / 100,
    };
  });

  // Days in current month and velocity
  const now = new Date();
  const [yearNum, monthNum] = currentMonth.split("-").map(Number);
  const totalDaysInMonth = new Date(yearNum, monthNum, 0).getDate();
  const currentDay = currentMonth === now.toISOString().slice(0, 7) ? Math.max(1, now.getDate()) : totalDaysInMonth;
  const avgDailyExpense = currentDay > 0 ? Math.round((totalExpense / currentDay) * 100) / 100 : 0;
  const projectedMonthEndExpense = Math.round(avgDailyExpense * totalDaysInMonth * 100) / 100;

  // Budget Health & Alerts
  const budgetHealth: BudgetHealthItem[] = [];
  const alerts: { type: "DANGER" | "WARNING" | "INFO"; category: string; message: string }[] = [];

  for (const b of budgets) {
    if (b.monthYear === currentMonth) {
      const spent = expenseCatMap.get(b.category)?.amount || 0;
      const limit = b.monthlyLimit;
      const remaining = limit - spent;
      const percentUsed = limit > 0 ? Math.round((spent / limit) * 1000) / 10 : 0;

      let status: "SAFE" | "WARNING" | "EXCEEDED" = "SAFE";
      if (percentUsed >= 100) {
        status = "EXCEEDED";
        alerts.push({
          type: "DANGER",
          category: b.category,
          message: `Budget Exceeded: You've spent $${spent.toFixed(2)} (${percentUsed}%) of your $${limit.toFixed(2)} limit for ${b.category}.`,
        });
      } else if (percentUsed >= 80) {
        status = "WARNING";
        alerts.push({
          type: "WARNING",
          category: b.category,
          message: `Budget Warning: You've reached ${percentUsed}% of your $${limit.toFixed(2)} limit for ${b.category}.`,
        });
      }

      budgetHealth.push({
        category: b.category,
        monthlyLimit: limit,
        spent: Math.round(spent * 100) / 100,
        remaining: Math.round(remaining * 100) / 100,
        percentUsed,
        status,
        isOverBudget: percentUsed >= 100,
      });
    }
  }

  return {
    summary: {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      netSavings: Math.round(netSavings * 100) / 100,
      savingsRate,
      transactionCount: currentMonthTransactions.length,
      avgDailyExpense,
      projectedMonthEndExpense,
    },
    categoryBreakdown,
    incomeCategoryBreakdown,
    monthlyTrends,
    dailyTrends,
    budgetHealth,
    alerts,
  };
}
