export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  model: string;
  timestamp: number;
  sessionId: string;
  projectName: string;
}

export interface CostBreakdown {
  inputCost: number;
  outputCost: number;
  cacheCreationCost: number;
  cacheReadCost: number;
  totalCost: number;
  model: string;
}

export interface DailyUsage {
  date: string;
  totalCost: number;
  tokenUsage: TokenUsage[];
  costBreakdowns: CostBreakdown[];
}

export interface SessionUsage {
  sessionId: string;
  projectName: string;
  startTime: number;
  totalCost: number;
  tokenUsage: TokenUsage[];
}

export interface BudgetConfig {
  daily: number;
  weekly: number;
  monthly: number;
  alertThreshold: number;
}

export interface BudgetStatus {
  period: 'daily' | 'weekly' | 'monthly';
  spent: number;
  limit: number;
  percentage: number;
  isWarning: boolean;
  isExceeded: boolean;
}

export interface ModelPricing {
  inputPricePerMToken: number;
  outputPricePerMToken: number;
  cacheCreationPricePerMToken: number;
  cacheReadPricePerMToken: number;
}
