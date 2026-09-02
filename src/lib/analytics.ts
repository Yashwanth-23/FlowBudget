export interface TransactionData {
  id: string;
  type: string; // "INCOME" | "EXPENSE"
  amount: number;
  currency?: string;
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

export interface CurrencySummary {
  currency: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  transactionCount: number;
}

export interface DateRangeFilter {
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
}

export interface PersonalAnalyticsResult {
  activeCurrency: string;
  availableCurrencies: string[];
  multiCurrencySummaries: Record<string, CurrencySummary>;
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
  targetMonthYear?: string, // e.g. "2026-09" or "ALL"
  targetCurrency?: string, // e.g. "USD", "INR", or undefined
  dateRange?: DateRangeFilter
): PersonalAnalyticsResult {
  const isLifetime = targetMonthYear === "ALL" && !dateRange;
  const currentMonth = !isLifetime && !dateRange ? (targetMonthYear || new Date().toISOString().slice(0, 7)) : "";

  // 1. Discover all currencies present across user transactions
  const currencySet = new Set<string>();
  for (const tx of transactions) {
    const c = tx.currency || "USD";
    currencySet.add(c);
  }
  const availableCurrencies = Array.from(currencySet);

  // Determine active currency: targetCurrency if present in set, or first available, or "USD"
  const activeCurrency =
    targetCurrency && (currencySet.has(targetCurrency) || availableCurrencies.length === 0)
      ? targetCurrency
      : availableCurrencies[0] || targetCurrency || "USD";

  // Helper to check if a transaction falls within the requested period
  const matchesPeriod = (txDay: string, txMonth: string) => {
    if (dateRange) {
      return txDay >= dateRange.startDate && txDay <= dateRange.endDate;
    }
    if (isLifetime) {
      return true;
    }
    return txMonth === currentMonth;
  };

  // 2. Compute multi-currency summaries across all currencies for the period
  const multiCurrencySummaries: Record<string, CurrencySummary> = {};
  for (const c of availableCurrencies) {
    multiCurrencySummaries[c] = {
      currency: c,
      totalIncome: 0,
      totalExpense: 0,
      netSavings: 0,
      transactionCount: 0,
    };
  }

  for (const tx of transactions) {
    const dateObj = new Date(tx.date);
    const txMonth = dateObj.toISOString().slice(0, 7);
    const txDay = dateObj.toISOString().slice(0, 10);

    if (matchesPeriod(txDay, txMonth)) {
      const c = tx.currency || "USD";
      if (!multiCurrencySummaries[c]) {
        multiCurrencySummaries[c] = {
          currency: c,
          totalIncome: 0,
          totalExpense: 0,
          netSavings: 0,
          transactionCount: 0,
        };
      }
      const amt = Number(tx.amount) || 0;
      multiCurrencySummaries[c].transactionCount += 1;
      if (tx.type === "INCOME") {
        multiCurrencySummaries[c].totalIncome += amt;
      } else {
        multiCurrencySummaries[c].totalExpense += amt;
      }
      multiCurrencySummaries[c].netSavings =
        multiCurrencySummaries[c].totalIncome - multiCurrencySummaries[c].totalExpense;
    }
  }

  // Round multiCurrencySummaries
  for (const c of Object.keys(multiCurrencySummaries)) {
    const s = multiCurrencySummaries[c];
    s.totalIncome = Math.round(s.totalIncome * 100) / 100;
    s.totalExpense = Math.round(s.totalExpense * 100) / 100;
    s.netSavings = Math.round(s.netSavings * 100) / 100;
  }

  // 3. Compute detailed analytics strictly for activeCurrency
  let totalIncome = 0;
  let totalExpense = 0;
  const expenseCatMap = new Map<string, { amount: number; count: number }>();
  const incomeCatMap = new Map<string, { amount: number; count: number }>();
  const monthlyMap = new Map<string, { income: number; expense: number }>();
  const dailyMap = new Map<string, number>();

  const periodTransactions: TransactionData[] = [];

  for (const tx of transactions) {
    const txCurr = tx.currency || "USD";
    if (txCurr !== activeCurrency) continue;

    const amt = Number(tx.amount) || 0;
    const dateObj = new Date(tx.date);
    const txMonth = dateObj.toISOString().slice(0, 7);
    const txDay = dateObj.toISOString().slice(0, 10);

    // Monthly trends (all months for active currency)
    if (!monthlyMap.has(txMonth)) {
      monthlyMap.set(txMonth, { income: 0, expense: 0 });
    }
    const mData = monthlyMap.get(txMonth)!;
    if (tx.type === "INCOME") {
      mData.income += amt;
    } else {
      mData.expense += amt;
    }

    // In-period metrics
    if (matchesPeriod(txDay, txMonth)) {
      periodTransactions.push(tx);

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

  // Monthly Trends
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

  // Daily Trends
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

  // Calculate day count in period for velocity calculation
  let totalDaysInPeriod = 30;
  if (dateRange) {
    const startMs = new Date(dateRange.startDate).getTime();
    const endMs = new Date(dateRange.endDate).getTime();
    totalDaysInPeriod = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1);
  } else if (!isLifetime && currentMonth) {
    const [yearNum, monthNum] = currentMonth.split("-").map(Number);
    totalDaysInPeriod = new Date(yearNum, monthNum, 0).getDate();
  } else if (sortedDays.length > 0) {
    totalDaysInPeriod = Math.max(1, sortedDays.length);
  }

  const avgDailyExpense = totalDaysInPeriod > 0 ? Math.round((totalExpense / totalDaysInPeriod) * 100) / 100 : 0;
  const projectedMonthEndExpense = Math.round(avgDailyExpense * totalDaysInPeriod * 100) / 100;

  // Budget Health (only evaluated when viewing a specific month)
  const budgetHealth: BudgetHealthItem[] = [];
  const alerts: { type: "DANGER" | "WARNING" | "INFO"; category: string; message: string }[] = [];

  if (currentMonth) {
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
            message: `Budget Exceeded: You've spent ${spent.toFixed(2)} (${percentUsed}%) of your ${limit.toFixed(2)} limit for ${b.category}.`,
          });
        } else if (percentUsed >= 80) {
          status = "WARNING";
          alerts.push({
            type: "WARNING",
            category: b.category,
            message: `Budget Warning: You've reached ${percentUsed}% of your ${limit.toFixed(2)} limit for ${b.category}.`,
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
  }

  return {
    activeCurrency,
    availableCurrencies,
    multiCurrencySummaries,
    summary: {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      netSavings: Math.round(netSavings * 100) / 100,
      savingsRate,
      transactionCount: periodTransactions.length,
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
