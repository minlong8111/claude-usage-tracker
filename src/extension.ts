import * as vscode from 'vscode';
import { readJsonlFiles, getDefaultDataDir } from './logParser';
import { calculateCost, getCostForTokenUsages } from './costCalculator';
import { createStatusBar, updateStatusBar, disposeStatusBar } from './statusBar';
import { checkBudgets, getBudgetStatuses, showBudgetAlerts, resetNotifications } from './budgetManager';
import { getConfig } from './config';
import { openDashboard, updateDashboard } from './dashboard/main';
import { TokenUsage, DailyUsage, SessionUsage } from './types';

let refreshTimer: ReturnType<typeof setInterval> | undefined;

export function activate(context: vscode.ExtensionContext) {
  const statusBar = createStatusBar();
  context.subscriptions.push(statusBar);

  context.subscriptions.push(
    vscode.commands.registerCommand('claudeBudget.openDashboard', () => {
      const data = computeAllData();
      openDashboard(context, data);
    }),
    vscode.commands.registerCommand('claudeBudget.setDailyBudget', async () => {
      const val = await vscode.window.showInputBox({ prompt: 'Daily budget (USD)', validateInput: v => isNaN(Number(v)) ? 'Must be a number' : undefined });
      if (val !== undefined) vscode.workspace.getConfiguration('claudeBudget').update('dailyBudget', Number(val), vscode.ConfigurationTarget.Global);
    }),
    vscode.commands.registerCommand('claudeBudget.setWeeklyBudget', async () => {
      const val = await vscode.window.showInputBox({ prompt: 'Weekly budget (USD)', validateInput: v => isNaN(Number(v)) ? 'Must be a number' : undefined });
      if (val !== undefined) vscode.workspace.getConfiguration('claudeBudget').update('weeklyBudget', Number(val), vscode.ConfigurationTarget.Global);
    }),
    vscode.commands.registerCommand('claudeBudget.setMonthlyBudget', async () => {
      const val = await vscode.window.showInputBox({ prompt: 'Monthly budget (USD)', validateInput: v => isNaN(Number(v)) ? 'Must be a number' : undefined });
      if (val !== undefined) vscode.workspace.getConfiguration('claudeBudget').update('monthlyBudget', Number(val), vscode.ConfigurationTarget.Global);
    })
  );

  refresh();
  const config = getConfig();
  refreshTimer = setInterval(refresh, config.refreshInterval * 1000);

  context.subscriptions.push({
    dispose() { if (refreshTimer) clearInterval(refreshTimer); }
  });
}

function refresh() {
  resetNotifications();
  const data = computeAllData();
  const config = getConfig();

  const todayStr = formatDate(new Date());
  const todayUsages = data.dailyUsages.find(d => d.date === todayStr);
  const todayCost = todayUsages?.totalCost || 0;

  const lastSession = data.sessions[data.sessions.length - 1];
  const sessionCost = lastSession?.totalCost || 0;

  const weekStart = getWeekStart(new Date());
  const weekCost = data.dailyUsages
    .filter(d => d.date >= weekStart)
    .reduce((sum, d) => sum + d.totalCost, 0);

  const monthStart = todayStr.substring(0, 7);
  const monthCost = data.dailyUsages
    .filter(d => d.date.startsWith(monthStart))
    .reduce((sum, d) => sum + d.totalCost, 0);

  const budgetConfig = { daily: config.dailyBudget, weekly: config.weeklyBudget, monthly: config.monthlyBudget, alertThreshold: config.alertThreshold };
  const budgetStatuses = getBudgetStatuses(todayCost, weekCost, monthCost, budgetConfig);

  const alerts = [
    ...checkBudgets(todayCost, budgetConfig, 'daily'),
    ...checkBudgets(weekCost, budgetConfig, 'weekly'),
    ...checkBudgets(monthCost, budgetConfig, 'monthly'),
  ];
  showBudgetAlerts(alerts);

  updateStatusBar({ todayCost, sessionCost, budgetStatuses });
  updateDashboard(data);
}

function computeAllData() {
  const config = getConfig();
  const dataDir = config.dataDirectory || getDefaultDataDir();
  const allUsages = readJsonlFiles(dataDir);

  const byDate = new Map<string, TokenUsage[]>();
  const bySession = new Map<string, TokenUsage[]>();

  for (const u of allUsages) {
    const date = formatDate(new Date(u.timestamp));
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(u);

    if (!bySession.has(u.sessionId)) bySession.set(u.sessionId, []);
    bySession.get(u.sessionId)!.push(u);
  }

  const dailyUsages: DailyUsage[] = Array.from(byDate.entries())
    .map(([date, usages]) => ({
      date,
      totalCost: getCostForTokenUsages(usages),
      tokenUsage: usages,
      costBreakdowns: usages.map(u => calculateCost(u))
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const sessions: SessionUsage[] = Array.from(bySession.entries())
    .map(([sessionId, usages]) => ({
      sessionId,
      projectName: usages[0]?.projectName || 'unknown',
      startTime: Math.min(...usages.map(u => u.timestamp)),
      totalCost: getCostForTokenUsages(usages),
      tokenUsage: usages
    }))
    .sort((a, b) => a.startTime - b.startTime);

  const totalCostAllTime = dailyUsages.reduce((s, d) => s + d.totalCost, 0);

  return { dailyUsages, sessions, budgetStatuses: [], totalCostAllTime };
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function getWeekStart(d: Date): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return formatDate(monday);
}

export function deactivate() {
  disposeStatusBar();
}
