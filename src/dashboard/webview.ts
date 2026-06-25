import { DailyUsage, SessionUsage, BudgetStatus } from '../types';

export function getWebviewContent(data: {
  dailyUsages: DailyUsage[];
  sessions: SessionUsage[];
  budgetStatuses: BudgetStatus[];
  totalCostAllTime: number;
}): string {
  const { dailyUsages, budgetStatuses, totalCostAllTime } = data;

  const dailyLabels = dailyUsages.map(d => d.date);
  const dailyCosts = dailyUsages.map(d => d.totalCost);

  const budgetRows = budgetStatuses
    .filter(b => b.limit > 0)
    .map(b => {
      const color = b.isExceeded ? '#ef4444' : b.isWarning ? '#f59e0b' : '#22c55e';
      return `<tr>
        <td>${b.period}</td>
        <td>$${b.spent.toFixed(2)}</td>
        <td>$${b.limit.toFixed(2)}</td>
        <td style="color:${color};font-weight:bold">${b.percentage.toFixed(1)}%</td>
      </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; color: var(--vscode-foreground); background: var(--vscode-editor-background); }
    .card { background: var(--vscode-editor-inactiveSelectionBackground); border-radius: 8px; padding: 16px; margin: 12px 0; }
    h2 { margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid var(--vscode-panel-border); }
    .stat { font-size: 24px; font-weight: bold; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
</head>
<body>
  <h1>Claude Budget Monitor</h1>
  <div class="card">
    <div class="stat">Total: $${totalCostAllTime.toFixed(2)}</div>
  </div>

  <h2>Daily Cost</h2>
  <div class="card">
    <canvas id="dailyChart" height="200"></canvas>
  </div>

  <h2>Budget Status</h2>
  <table>
    <tr><th>Period</th><th>Spent</th><th>Limit</th><th>Usage</th></tr>
    ${budgetRows || '<tr><td colspan="4">No budgets configured</td></tr>'}
  </table>

  <script>
    new Chart(document.getElementById('dailyChart'), {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(dailyLabels)},
        datasets: [{
          label: 'Cost ($)',
          data: ${JSON.stringify(dailyCosts)},
          backgroundColor: '#3b82f6'
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } }
      }
    });
  </script>
</body>
</html>`;
}
