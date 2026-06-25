import * as vscode from 'vscode';
import { getWebviewContent } from './webview';
import { DailyUsage, SessionUsage, BudgetStatus } from '../types';

let panel: vscode.WebviewPanel | undefined;

export function openDashboard(context: vscode.ExtensionContext, data: {
  dailyUsages: DailyUsage[];
  sessions: SessionUsage[];
  budgetStatuses: BudgetStatus[];
  totalCostAllTime: number;
}) {
  if (panel) {
    panel.reveal();
    panel.webview.html = getWebviewContent(data);
    return;
  }

  panel = vscode.window.createWebviewPanel(
    'claudeBudgetDashboard',
    'Claude Budget Monitor',
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  panel.webview.html = getWebviewContent(data);
  panel.onDidDispose(() => { panel = undefined; });
}

export function updateDashboard(data: {
  dailyUsages: DailyUsage[];
  sessions: SessionUsage[];
  budgetStatuses: BudgetStatus[];
  totalCostAllTime: number;
}) {
  if (panel) {
    panel.webview.html = getWebviewContent(data);
  }
}
