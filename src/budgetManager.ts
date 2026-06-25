import * as vscode from 'vscode';
import { BudgetConfig, BudgetStatus } from './types';

export interface BudgetAlert {
  period: 'daily' | 'weekly' | 'monthly';
  level: 'warning' | 'exceeded';
  message: string;
  percentage: number;
}

const notifiedWarnings = new Set<string>();

export function checkBudgets(spent: number, config: BudgetConfig, period: 'daily' | 'weekly' | 'monthly'): BudgetAlert[] {
  const limit = period === 'daily' ? config.daily : period === 'weekly' ? config.weekly : config.monthly;
  if (limit <= 0) return [];

  const percentage = (spent / limit) * 100;
  const alerts: BudgetAlert[] = [];
  const key = `${period}-${Math.floor(percentage / 10) * 10}`;

  if (percentage >= 100 && !notifiedWarnings.has(`${period}-exceeded`)) {
    alerts.push({
      period,
      level: 'exceeded',
      message: `${period} budget exceeded! Spent $${spent.toFixed(2)} of $${limit.toFixed(2)} limit (${percentage.toFixed(0)}%)`,
      percentage
    });
    notifiedWarnings.add(`${period}-exceeded`);
  } else if (percentage >= config.alertThreshold && percentage < 100 && !notifiedWarnings.has(key)) {
    alerts.push({
      period,
      level: 'warning',
      message: `${period} budget warning: $${spent.toFixed(2)} / $${limit.toFixed(2)} (${percentage.toFixed(0)}%)`,
      percentage
    });
    notifiedWarnings.add(key);
  }

  return alerts;
}

export function getBudgetStatuses(dailySpent: number, weeklySpent: number, monthlySpent: number, config: BudgetConfig): BudgetStatus[] {
  const periods: Array<{ period: 'daily' | 'weekly' | 'monthly'; spent: number; limit: number }> = [
    { period: 'daily', spent: dailySpent, limit: config.daily },
    { period: 'weekly', spent: weeklySpent, limit: config.weekly },
    { period: 'monthly', spent: monthlySpent, limit: config.monthly },
  ];

  return periods.map(({ period, spent, limit }) => {
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
    return {
      period,
      spent,
      limit,
      percentage,
      isWarning: percentage >= config.alertThreshold && percentage < 100,
      isExceeded: percentage >= 100
    };
  });
}

export function showBudgetAlerts(alerts: BudgetAlert[]) {
  for (const alert of alerts) {
    if (alert.level === 'exceeded') {
      vscode.window.showErrorMessage(alert.message);
    } else {
      vscode.window.showWarningMessage(alert.message);
    }
  }
}

export function resetNotifications() {
  notifiedWarnings.clear();
}
