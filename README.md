# Claude Budget Monitor

Monitor Claude Code usage, costs, and budget alerts in VS Code.

## Features

- **Status bar** — today's cost, session cost, budget warnings
- **Dashboard** — daily cost chart, budget status table
- **Budget alerts** — set daily/weekly/monthly limits, get notified at 80% and 100%
- **Privacy** — all processing is local, no data sent anywhere

## Install

Search for "Claude Budget Monitor" in VS Code Extensions, or install from VSIX.

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `claudeBudget.dailyBudget` | 0 | Daily budget limit in USD (0 = disabled) |
| `claudeBudget.weeklyBudget` | 0 | Weekly budget limit in USD (0 = disabled) |
| `claudeBudget.monthlyBudget` | 0 | Monthly budget limit in USD (0 = disabled) |
| `claudeBudget.alertThreshold` | 80 | Alert at this % of budget |
| `claudeBudget.refreshInterval` | 60 | Refresh interval in seconds |
| `claudeBudget.dataDirectory` | "" | Custom Claude data directory |
| `claudeBudget.timezone` | "" | IANA timezone for date display |

## Commands

- `Claude Budget: Open Dashboard` — open the full dashboard
- `Claude Budget: Set Daily/Weekly/Monthly Budget` — quick budget configuration

## License

MIT
