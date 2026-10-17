export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  phone?: string;
  bio?: string;
  riskProfile?: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  notificationPreferences?: {
    emailAlerts: boolean;
    dailyMarketReport: boolean;
    stopLossAlerts: boolean;
    targetAlerts: boolean;
  };
}

export interface Bar {
  time: string; // YYYY-MM-DD or ISO
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  ema20: number;
  ema50: number;
  ema200: number;
  rsi: number; // 0-100
  macd: {
    macd: number;
    signal: number;
    hist: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  atr: number;
  avgVolume20: number;
  volumeRatio: number;
  prevHigh: number;
  prevLow: number;
  score: number; // 0 - 8
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  trend: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  sector: string;
  cmp: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: number;
  week52High: number;
  week52Low: number;
  marketCapCr: number; // in Crores INR
  pe: number;
  eps: number;
  divYield: number; // %
  bookValue: number;
  roe: number; // %
  debtToEquity: number;
  history: Bar[];
  indicators: TechnicalIndicators;
  lastUpdated: string;
}

export interface PortfolioHolding {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  sector: string;
  quantity: number;
  buyPrice: number;
  purchaseDate: string;
  brokerage: number;
  stopLoss?: number;
  target1?: number;
  target2?: number;
  target3?: number;
  notes?: string;
  tag?: 'Long term' | 'Swing' | 'Investment' | 'Trading' | 'High conviction' | 'Watch';
  createdAt: string;
  updatedAt: string;
}

export interface CalculatedHolding extends PortfolioHolding {
  cmp: number;
  change: number;
  changePercent: number;
  invested: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  dayPnl: number;
  allocationPercent: number;
  status: 'HOLD' | 'PROFIT_TARGET_HIT' | 'STOP_LOSS_HIT' | 'STOP_LOSS_NEAR' | 'TARGET_NEAR';
  riskAmount?: number;
  rewardAmount?: number;
  riskRewardRatio?: string;
  cagr?: number;
}

export type TransactionType = 'BUY' | 'SELL' | 'DIVIDEND' | 'BONUS' | 'SPLIT';

export interface Transaction {
  id: string;
  userId: string;
  symbol: string;
  name?: string;
  type: TransactionType;
  date: string;
  quantity: number;
  price: number;
  charges: number;
  notes?: string;
  createdAt: string;
}

export interface Watchlist {
  id: string;
  userId: string;
  name: string;
  symbols: string[];
  createdAt: string;
}

export type AlertCondition =
  | 'PRICE_ABOVE'
  | 'PRICE_BELOW'
  | 'CROSS_EMA200'
  | 'CROSS_EMA50'
  | 'CROSS_EMA20'
  | 'RSI_BELOW_30'
  | 'RSI_ABOVE_70'
  | 'SIGNAL_BEARISH_TO_BULLISH'
  | 'SIGNAL_BULLISH_TO_BEARISH';

export interface PriceAlert {
  id: string;
  userId: string;
  symbol: string;
  stockName: string;
  condition: AlertCondition;
  targetValue?: number;
  status: 'ACTIVE' | 'TRIGGERED' | 'DISABLED';
  emailNotification: boolean;
  createdAt: string;
  triggeredAt?: string;
  message?: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ALERT' | 'PORTFOLIO' | 'MARKET' | 'SYSTEM';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface SectorData {
  id: string;
  name: string;
  symbol: string;
  cmp: number;
  change: number;
  changePercent: number;
  ema20: number;
  ema50: number;
  ema200: number;
  rsi: number;
  trend: string;
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  volume: number;
  stocks: string[];
}

export interface MarketIndexData {
  symbol: string;
  name: string;
  cmp: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  week52High: number;
  week52Low: number;
  ema20: number;
  ema50: number;
  ema200: number;
  trend: string;
  history: Bar[];
  lastUpdated: string;
}

export interface MarketBreadth {
  advances: number;
  declines: number;
  unchanged: number;
  adRatio: number;
  totalVolume: number;
}

export interface DailyMarketSnapshot {
  date: string;
  niftyClose: number;
  niftyChange: number;
  niftyChangePercent: number;
  bankNiftyClose: number;
  bankNiftyChangePercent: number;
  marketBreadth: MarketBreadth;
  topGainers: { symbol: string; name: string; cmp: number; changePercent: number }[];
  topLosers: { symbol: string; name: string; cmp: number; changePercent: number }[];
  leadingSectors: { name: string; changePercent: number }[];
  laggingSectors: { name: string; changePercent: number }[];
  niftyEmaStatus: string;
  niftyRsi: number;
  marketTrend: string;
  executiveSummary: string;
}

export interface AdminSettings {
  rsiOversold: number;
  rsiOverbought: number;
  bullishThreshold: number; // default 6
  neutralThreshold: number; // default 3
  weights: {
    priceAboveEma20: number;
    priceAboveEma50: number;
    priceAboveEma200: number;
    ema20Above50: number;
    ema50Above200: number;
    rsiBullish: number;
    macdBullish: number;
    volumeSurge: number;
  };
  cronJobs: {
    marketHoursSyncIntervalMinutes: number;
    eodSyncTime: string;
    lastRunAt?: string;
    status: 'ACTIVE' | 'PAUSED';
  };
  mockMode: boolean;
  marketDataStatus: 'HEALTHY' | 'DEGRADED' | 'MAINTENANCE';
}
