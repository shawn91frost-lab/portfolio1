import {
  User,
  PortfolioHolding,
  CalculatedHolding,
  Transaction,
  Watchlist,
  PriceAlert,
  InAppNotification,
} from '../types';
import { marketDataService } from './marketData';

const USERS_STORAGE_KEY = 'niftypulse_users_v2';
const HOLDINGS_STORAGE_KEY = 'niftypulse_holdings_v2';
const TRANSACTIONS_STORAGE_KEY = 'niftypulse_transactions_v2';
const WATCHLISTS_STORAGE_KEY = 'niftypulse_watchlists_v2';
const ALERTS_STORAGE_KEY = 'niftypulse_alerts_v2';
const NOTIFICATIONS_STORAGE_KEY = 'niftypulse_notifications_v2';
const CURRENT_USER_ID_KEY = 'niftypulse_current_user_id';

// Default Seed Users
const SEED_USERS: User[] = [
  {
    id: 'user_investor_101',
    email: 'investor@niftypulse.in',
    name: 'Vikramaditya Sharma',
    role: 'user',
    isVerified: true,
    createdAt: '2025-01-15T10:00:00Z',
    phone: '+91 98201 54321',
    bio: 'Long-term equity investor focused on high ROCE Indian compounders.',
    riskProfile: 'MODERATE',
    notificationPreferences: {
      emailAlerts: true,
      dailyMarketReport: true,
      stopLossAlerts: true,
      targetAlerts: true,
    },
  },
  {
    id: 'user_admin_999',
    email: 'admin@niftypulse.in',
    name: 'Chief Risk Officer (Admin)',
    role: 'admin',
    isVerified: true,
    createdAt: '2024-11-01T08:30:00Z',
    phone: '+91 99887 76655',
    bio: 'System Administrator & Market Risk Controller.',
    riskProfile: 'CONSERVATIVE',
    notificationPreferences: {
      emailAlerts: true,
      dailyMarketReport: true,
      stopLossAlerts: true,
      targetAlerts: true,
    },
  },
];

// Seed Holdings for Default Investor
const SEED_HOLDINGS: PortfolioHolding[] = [
  {
    id: 'hold_1',
    userId: 'user_investor_101',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    sector: 'Oil, Gas & Consumable Fuels',
    quantity: 40,
    buyPrice: 2420.00,
    purchaseDate: '2025-02-10',
    brokerage: 120.00,
    stopLoss: 2350.00,
    target1: 2750.00,
    target2: 2900.00,
    target3: 3100.00,
    notes: 'Accumulated near 200 EMA support with strong telecom & retail momentum.',
    tag: 'Long term',
    createdAt: '2025-02-10T10:30:00Z',
    updatedAt: '2025-02-10T10:30:00Z',
  },
  {
    id: 'hold_2',
    userId: 'user_investor_101',
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    sector: 'Information Technology',
    quantity: 25,
    buyPrice: 3880.00,
    purchaseDate: '2025-03-01',
    brokerage: 110.00,
    stopLoss: 3750.00,
    target1: 4350.00,
    target2: 4500.00,
    notes: 'Top tier Indian IT services leader, excellent dividend payout history.',
    tag: 'Investment',
    createdAt: '2025-03-01T11:00:00Z',
    updatedAt: '2025-03-01T11:00:00Z',
  },
  {
    id: 'hold_3',
    userId: 'user_investor_101',
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    sector: 'Banking & Financial Services',
    quantity: 60,
    buyPrice: 1540.00,
    purchaseDate: '2025-01-20',
    brokerage: 95.00,
    stopLoss: 1480.00,
    target1: 1750.00,
    target2: 1850.00,
    notes: 'Post-merger loan-to-deposit ratio normalizing, valuation reasonable.',
    tag: 'Long term',
    createdAt: '2025-01-20T09:45:00Z',
    updatedAt: '2025-01-20T09:45:00Z',
  },
  {
    id: 'hold_4',
    userId: 'user_investor_101',
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd.',
    sector: 'Automobile and Auto Components',
    quantity: 50,
    buyPrice: 840.00,
    purchaseDate: '2025-04-12',
    brokerage: 60.00,
    stopLoss: 810.00,
    target1: 980.00,
    target2: 1050.00,
    notes: 'Commercial vehicle turnaround & JLR order book robust.',
    tag: 'Swing',
    createdAt: '2025-04-12T14:15:00Z',
    updatedAt: '2025-04-12T14:15:00Z',
  },
  {
    id: 'hold_5',
    userId: 'user_investor_101',
    symbol: 'LT',
    name: 'Larsen & Toubro Ltd.',
    sector: 'Construction & Infrastructure',
    quantity: 15,
    buyPrice: 3410.00,
    purchaseDate: '2025-03-18',
    brokerage: 75.00,
    stopLoss: 3300.00,
    target1: 3750.00,
    target2: 3900.00,
    notes: 'Capex cycle proxy with massive order book visibility.',
    tag: 'High conviction',
    createdAt: '2025-03-18T10:15:00Z',
    updatedAt: '2025-03-18T10:15:00Z',
  },
  {
    id: 'hold_6',
    userId: 'user_investor_101',
    symbol: 'SUNPHARMA',
    name: 'Sun Pharmaceutical Industries Ltd.',
    sector: 'Healthcare & Pharma',
    quantity: 30,
    buyPrice: 1720.00,
    purchaseDate: '2025-05-02',
    brokerage: 65.00,
    stopLoss: 1650.00,
    target1: 1950.00,
    notes: 'Specialty pharma portfolio expansion in US and emerging markets.',
    tag: 'Investment',
    createdAt: '2025-05-02T13:30:00Z',
    updatedAt: '2025-05-02T13:30:00Z',
  },
];

// Seed Transactions
const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    userId: 'user_investor_101',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    type: 'BUY',
    date: '2025-02-10',
    quantity: 40,
    price: 2420.00,
    charges: 120.00,
    notes: 'Initial tranche buy order',
    createdAt: '2025-02-10T10:30:00Z',
  },
  {
    id: 'tx_2',
    userId: 'user_investor_101',
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    type: 'BUY',
    date: '2025-03-01',
    quantity: 25,
    price: 3880.00,
    charges: 110.00,
    notes: 'Long-term IT allocation',
    createdAt: '2025-03-01T11:00:00Z',
  },
  {
    id: 'tx_3',
    userId: 'user_investor_101',
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    type: 'BUY',
    date: '2025-01-20',
    quantity: 60,
    price: 1540.00,
    charges: 95.00,
    notes: 'Core private bank holding',
    createdAt: '2025-01-20T09:45:00Z',
  },
  {
    id: 'tx_4',
    userId: 'user_investor_101',
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    type: 'DIVIDEND',
    date: '2025-04-15',
    quantity: 25,
    price: 28.00, // Rs. 28 per share dividend
    charges: 0,
    notes: 'Interim dividend credited to bank',
    createdAt: '2025-04-15T12:00:00Z',
  },
];

// Seed Watchlists
const SEED_WATCHLISTS: Watchlist[] = [
  {
    id: 'wl_core',
    userId: 'user_investor_101',
    name: 'NIFTY Bluechips',
    symbols: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'BHARTIARTL', 'LT', 'SBIN'],
    createdAt: '2025-01-16T10:00:00Z',
  },
  {
    id: 'wl_momentum',
    userId: 'user_investor_101',
    name: 'High Momentum',
    symbols: ['TRENT', 'BEL', 'TATAMOTORS', 'M&M', 'SUNPHARMA', 'COALINDIA'],
    createdAt: '2025-02-01T11:20:00Z',
  },
];

// Seed Alerts
const SEED_ALERTS: PriceAlert[] = [
  {
    id: 'alert_1',
    userId: 'user_investor_101',
    symbol: 'RELIANCE',
    stockName: 'Reliance Industries Ltd.',
    condition: 'PRICE_ABOVE',
    targetValue: 2600.00,
    status: 'ACTIVE',
    emailNotification: true,
    createdAt: '2025-05-10T08:00:00Z',
  },
  {
    id: 'alert_2',
    userId: 'user_investor_101',
    symbol: 'TCS',
    stockName: 'Tata Consultancy Services Ltd.',
    condition: 'CROSS_EMA200',
    status: 'ACTIVE',
    emailNotification: true,
    createdAt: '2025-05-12T09:15:00Z',
  },
];

// Seed In-App Notifications
const SEED_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif_1',
    userId: 'user_investor_101',
    title: 'Market Hours Update',
    message: 'NIFTY 50 trading session has opened. Current trend is STRONG BULLISH.',
    type: 'MARKET',
    timestamp: 'Today at 09:15 AM',
    read: false,
  },
  {
    id: 'notif_2',
    userId: 'user_investor_101',
    title: 'Target 1 Approaching',
    message: 'TATAMOTORS is within 2.5% of Target 1 (₹980.00). CMP is ₹915.40.',
    type: 'PORTFOLIO',
    timestamp: 'Yesterday at 02:40 PM',
    read: true,
  },
];

class AuthStorageService {
  private users: User[] = [];
  private holdings: PortfolioHolding[] = [];
  private transactions: Transaction[] = [];
  private watchlists: Watchlist[] = [];
  private alerts: PriceAlert[] = [];
  private notifications: InAppNotification[] = [];
  private currentUserId: string | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      this.users = storedUsers ? JSON.parse(storedUsers) : SEED_USERS;

      const storedHoldings = localStorage.getItem(HOLDINGS_STORAGE_KEY);
      this.holdings = storedHoldings ? JSON.parse(storedHoldings) : SEED_HOLDINGS;

      const storedTxs = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      this.transactions = storedTxs ? JSON.parse(storedTxs) : SEED_TRANSACTIONS;

      const storedWls = localStorage.getItem(WATCHLISTS_STORAGE_KEY);
      this.watchlists = storedWls ? JSON.parse(storedWls) : SEED_WATCHLISTS;

      const storedAlerts = localStorage.getItem(ALERTS_STORAGE_KEY);
      this.alerts = storedAlerts ? JSON.parse(storedAlerts) : SEED_ALERTS;

      const storedNotifs = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      this.notifications = storedNotifs ? JSON.parse(storedNotifs) : SEED_NOTIFICATIONS;

      const activeUserId = localStorage.getItem(CURRENT_USER_ID_KEY);
      this.currentUserId = activeUserId || 'user_investor_101'; // Default logged in as investor

      this.saveToStorage();
    } catch {
      this.users = SEED_USERS;
      this.holdings = SEED_HOLDINGS;
      this.transactions = SEED_TRANSACTIONS;
      this.watchlists = SEED_WATCHLISTS;
      this.alerts = SEED_ALERTS;
      this.notifications = SEED_NOTIFICATIONS;
      this.currentUserId = 'user_investor_101';
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
      localStorage.setItem(HOLDINGS_STORAGE_KEY, JSON.stringify(this.holdings));
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(this.transactions));
      localStorage.setItem(WATCHLISTS_STORAGE_KEY, JSON.stringify(this.watchlists));
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(this.alerts));
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(this.notifications));
      if (this.currentUserId) {
        localStorage.setItem(CURRENT_USER_ID_KEY, this.currentUserId);
      } else {
        localStorage.removeItem(CURRENT_USER_ID_KEY);
      }
    } catch {
      // storage quota or private browsing fallback
    }
  }

  // --- AUTH METHODS ---

  public getCurrentUser(): User | null {
    if (!this.currentUserId) return null;
    return this.users.find((u) => u.id === this.currentUserId) || null;
  }

  public login(email: string, password?: string): { success: boolean; error?: string; user?: User } {
    const user = this.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return { success: false, error: 'No account found with this email. Please check or sign up.' };
    }

    if (!user.isVerified) {
      return { success: false, error: 'Email verification required. Please verify your email code.' };
    }

    this.currentUserId = user.id;
    this.saveToStorage();
    return { success: true, user };
  }

  public signup(name: string, email: string, password?: string): { success: boolean; error?: string; user?: User } {
    const existing = this.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      role: 'user',
      isVerified: true, // Auto-verified in prototype with prompt to verify
      createdAt: new Date().toISOString(),
      riskProfile: 'MODERATE',
      notificationPreferences: {
        emailAlerts: true,
        dailyMarketReport: true,
        stopLossAlerts: true,
        targetAlerts: true,
      },
    };

    this.users.push(newUser);
    this.currentUserId = newUser.id;

    // Initialize default watchlist for new user
    const defaultWatchlist: Watchlist = {
      id: `wl_${Date.now()}`,
      userId: newUser.id,
      name: 'My Watchlist',
      symbols: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'],
      createdAt: new Date().toISOString(),
    };
    this.watchlists.push(defaultWatchlist);

    // Welcome Notification
    this.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: newUser.id,
      title: 'Welcome to NiftyPulse',
      message: 'Your isolated trading vault is initialized. Add stocks to start tracking real-time CMP and technical signals.',
      type: 'SYSTEM',
      timestamp: 'Just now',
      read: false,
    });

    this.saveToStorage();
    return { success: true, user: newUser };
  }

  public logout(): void {
    this.currentUserId = null;
    this.saveToStorage();
  }

  public updateProfile(updates: Partial<User>): { success: boolean; user?: User } {
    if (!this.currentUserId) return { success: false };
    const idx = this.users.findIndex((u) => u.id === this.currentUserId);
    if (idx === -1) return { success: false };

    this.users[idx] = {
      ...this.users[idx],
      ...updates,
      id: this.currentUserId, // ensure immutable
      role: this.users[idx].role, // ensure role preserved
    };
    this.saveToStorage();
    return { success: true, user: this.users[idx] };
  }

  // --- RLS PROTECTED PORTFOLIO METHODS ---
  // User A can NEVER view or mutate User B's portfolio data!

  public getUserHoldings(): CalculatedHolding[] {
    if (!this.currentUserId) return [];
    const userRaw = this.holdings.filter((h) => h.userId === this.currentUserId);

    let totalPortfolioInvested = 0;
    const computedList: CalculatedHolding[] = [];

    for (const h of userRaw) {
      const quote = marketDataService.getStock(h.symbol);
      const cmp = quote ? quote.cmp : h.buyPrice;
      const change = quote ? quote.change : 0;
      const changePercent = quote ? quote.changePercent : 0;

      const invested = Number((h.quantity * h.buyPrice + (h.brokerage || 0)).toFixed(2));
      const currentValue = Number((h.quantity * cmp).toFixed(2));
      const pnl = Number((currentValue - invested).toFixed(2));
      const pnlPercent = invested > 0 ? Number(((pnl / invested) * 100).toFixed(2)) : 0;
      const dayPnl = Number((h.quantity * change).toFixed(2));

      totalPortfolioInvested += currentValue;

      // Status & Stop Loss / Target Analysis
      let status: 'HOLD' | 'PROFIT_TARGET_HIT' | 'STOP_LOSS_HIT' | 'STOP_LOSS_NEAR' | 'TARGET_NEAR' = 'HOLD';
      let riskAmount: number | undefined;
      let rewardAmount: number | undefined;
      let riskRewardRatio: string | undefined;

      if (h.stopLoss) {
        riskAmount = Number((Math.max(0, cmp - h.stopLoss)).toFixed(2));
        if (cmp <= h.stopLoss) {
          status = 'STOP_LOSS_HIT';
        } else if ((cmp - h.stopLoss) / cmp <= 0.02) {
          status = 'STOP_LOSS_NEAR';
        }
      }

      const activeTarget = h.target1 || h.target2 || h.target3;
      if (activeTarget) {
        rewardAmount = Number((Math.max(0, activeTarget - cmp)).toFixed(2));
        if (cmp >= activeTarget) {
          status = 'PROFIT_TARGET_HIT';
        } else if ((activeTarget - cmp) / cmp <= 0.02) {
          status = 'TARGET_NEAR';
        }
      }

      if (riskAmount && rewardAmount && riskAmount > 0) {
        const ratio = (rewardAmount / riskAmount).toFixed(1);
        riskRewardRatio = `1:${ratio}`;
      }

      // Approximate CAGR if holding > 30 days
      const daysHeld = Math.max(
        1,
        (Date.now() - new Date(h.purchaseDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      let cagr: number | undefined;
      if (daysHeld >= 30 && invested > 0) {
        const years = daysHeld / 365.25;
        cagr = Number(((Math.pow(currentValue / invested, 1 / years) - 1) * 100).toFixed(1));
      }

      computedList.push({
        ...h,
        cmp,
        change,
        changePercent,
        invested,
        currentValue,
        pnl,
        pnlPercent,
        dayPnl,
        allocationPercent: 0, // will compute after total
        status,
        riskAmount,
        rewardAmount,
        riskRewardRatio,
        cagr,
      });
    }

    // Assign allocation %
    for (const item of computedList) {
      item.allocationPercent =
        totalPortfolioInvested > 0
          ? Number(((item.currentValue / totalPortfolioInvested) * 100).toFixed(1))
          : 0;
    }

    return computedList;
  }

  public addHolding(holding: Omit<PortfolioHolding, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): PortfolioHolding {
    if (!this.currentUserId) throw new Error('Unauthorized');
    const quote = marketDataService.getStock(holding.symbol);

    const newHolding: PortfolioHolding = {
      ...holding,
      id: `hold_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: this.currentUserId,
      name: quote ? quote.name : holding.name || holding.symbol,
      sector: quote ? quote.sector : holding.sector || 'Diversified',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.holdings.push(newHolding);

    // Automatically record corresponding BUY Transaction for auditability
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: this.currentUserId,
      symbol: newHolding.symbol,
      name: newHolding.name,
      type: 'BUY',
      date: newHolding.purchaseDate,
      quantity: newHolding.quantity,
      price: newHolding.buyPrice,
      charges: newHolding.brokerage || 0,
      notes: newHolding.notes || 'Portfolio trade entry',
      createdAt: new Date().toISOString(),
    };
    this.transactions.push(tx);

    this.saveToStorage();
    return newHolding;
  }

  public updateHolding(id: string, updates: Partial<PortfolioHolding>): boolean {
    if (!this.currentUserId) return false;
    const idx = this.holdings.findIndex((h) => h.id === id && h.userId === this.currentUserId);
    if (idx === -1) return false;

    this.holdings[idx] = {
      ...this.holdings[idx],
      ...updates,
      id,
      userId: this.currentUserId,
      updatedAt: new Date().toISOString(),
    };

    this.saveToStorage();
    return true;
  }

  public deleteHolding(id: string): boolean {
    if (!this.currentUserId) return false;
    const initialLen = this.holdings.length;
    this.holdings = this.holdings.filter((h) => !(h.id === id && h.userId === this.currentUserId));
    this.saveToStorage();
    return this.holdings.length < initialLen;
  }

  // --- TRANSACTIONS ---

  public getUserTransactions(): Transaction[] {
    if (!this.currentUserId) return [];
    return this.transactions
      .filter((t) => t.userId === this.currentUserId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public addTransaction(tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>): Transaction {
    if (!this.currentUserId) throw new Error('Unauthorized');
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: this.currentUserId,
      createdAt: new Date().toISOString(),
    };
    this.transactions.unshift(newTx);
    this.saveToStorage();
    return newTx;
  }

  // --- WATCHLISTS ---

  public getUserWatchlists(): Watchlist[] {
    if (!this.currentUserId) return [];
    return this.watchlists.filter((w) => w.userId === this.currentUserId);
  }

  public createWatchlist(name: string, symbols: string[] = []): Watchlist {
    if (!this.currentUserId) throw new Error('Unauthorized');
    const newWl: Watchlist = {
      id: `wl_${Date.now()}`,
      userId: this.currentUserId,
      name: name.trim(),
      symbols,
      createdAt: new Date().toISOString(),
    };
    this.watchlists.push(newWl);
    this.saveToStorage();
    return newWl;
  }

  public addSymbolToWatchlist(watchlistId: string, symbol: string): boolean {
    if (!this.currentUserId) return false;
    const wl = this.watchlists.find((w) => w.id === watchlistId && w.userId === this.currentUserId);
    if (!wl) return false;

    const symUpper = symbol.toUpperCase().trim();
    if (!wl.symbols.includes(symUpper)) {
      wl.symbols.push(symUpper);
      this.saveToStorage();
    }
    return true;
  }

  public removeSymbolFromWatchlist(watchlistId: string, symbol: string): boolean {
    if (!this.currentUserId) return false;
    const wl = this.watchlists.find((w) => w.id === watchlistId && w.userId === this.currentUserId);
    if (!wl) return false;

    const symUpper = symbol.toUpperCase().trim();
    wl.symbols = wl.symbols.filter((s) => s !== symUpper);
    this.saveToStorage();
    return true;
  }

  public deleteWatchlist(watchlistId: string): boolean {
    if (!this.currentUserId) return false;
    this.watchlists = this.watchlists.filter(
      (w) => !(w.id === watchlistId && w.userId === this.currentUserId)
    );
    this.saveToStorage();
    return true;
  }

  // --- ALERTS ENGINE & NOTIFICATIONS ---

  public getUserAlerts(): PriceAlert[] {
    if (!this.currentUserId) return [];
    return this.alerts
      .filter((a) => a.userId === this.currentUserId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createAlert(alert: Omit<PriceAlert, 'id' | 'userId' | 'createdAt' | 'status'>): PriceAlert {
    if (!this.currentUserId) throw new Error('Unauthorized');
    const quote = marketDataService.getStock(alert.symbol);

    const newAlert: PriceAlert = {
      ...alert,
      id: `alert_${Date.now()}`,
      userId: this.currentUserId,
      stockName: quote ? quote.name : alert.symbol,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    this.alerts.unshift(newAlert);
    this.saveToStorage();
    return newAlert;
  }

  public deleteAlert(alertId: string): boolean {
    if (!this.currentUserId) return false;
    this.alerts = this.alerts.filter((a) => !(a.id === alertId && a.userId === this.currentUserId));
    this.saveToStorage();
    return true;
  }

  public toggleAlertStatus(alertId: string): boolean {
    if (!this.currentUserId) return false;
    const alert = this.alerts.find((a) => a.id === alertId && a.userId === this.currentUserId);
    if (!alert) return false;

    alert.status = alert.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    this.saveToStorage();
    return true;
  }

  public getUserNotifications(): InAppNotification[] {
    if (!this.currentUserId) return [];
    return this.notifications.filter((n) => n.userId === this.currentUserId);
  }

  public markNotificationRead(notifId: string): void {
    const notif = this.notifications.find((n) => n.id === notifId);
    if (notif) {
      notif.read = true;
      this.saveToStorage();
    }
  }

  public markAllNotificationsRead(): void {
    if (!this.currentUserId) return;
    for (const n of this.notifications) {
      if (n.userId === this.currentUserId) n.read = true;
    }
    this.saveToStorage();
  }

  /**
   * Automatic alert evaluation daemon against real-time market data
   */
  public evaluateAlerts(): number {
    let triggeredCount = 0;

    for (const alert of this.alerts) {
      if (alert.status !== 'ACTIVE') continue;

      const quote = marketDataService.getStock(alert.symbol);
      const nifty = marketDataService.getNifty50();

      const cmp = alert.symbol === '^NSEI' ? nifty.cmp : quote?.cmp;
      const indicators = alert.symbol === '^NSEI'
        ? { ema20: nifty.ema20, ema50: nifty.ema50, ema200: nifty.ema200, rsi: 54, signal: 'BULLISH' as const, score: 7 }
        : quote?.indicators;

      if (!cmp || !indicators) continue;

      let triggered = false;
      let message = '';

      switch (alert.condition) {
        case 'PRICE_ABOVE':
          if (alert.targetValue && cmp >= alert.targetValue) {
            triggered = true;
            message = `${alert.symbol} reached ₹${cmp.toLocaleString('en-IN')}, crossing target of ₹${alert.targetValue.toLocaleString('en-IN')}.`;
          }
          break;
        case 'PRICE_BELOW':
          if (alert.targetValue && cmp <= alert.targetValue) {
            triggered = true;
            message = `${alert.symbol} fell to ₹${cmp.toLocaleString('en-IN')}, dropping below ₹${alert.targetValue.toLocaleString('en-IN')}.`;
          }
          break;
        case 'CROSS_EMA200':
          if (Math.abs(cmp - indicators.ema200) / cmp < 0.005) {
            triggered = true;
            message = `${alert.symbol} (CMP ₹${cmp}) has converged with its 200 EMA (₹${indicators.ema200}).`;
          }
          break;
        case 'CROSS_EMA50':
          if (Math.abs(cmp - indicators.ema50) / cmp < 0.005) {
            triggered = true;
            message = `${alert.symbol} (CMP ₹${cmp}) has converged with its 50 EMA (₹${indicators.ema50}).`;
          }
          break;
        case 'CROSS_EMA20':
          if (Math.abs(cmp - indicators.ema20) / cmp < 0.005) {
            triggered = true;
            message = `${alert.symbol} (CMP ₹${cmp}) has converged with its 20 EMA (₹${indicators.ema20}).`;
          }
          break;
        case 'RSI_BELOW_30':
          if (indicators.rsi <= 30) {
            triggered = true;
            message = `${alert.symbol} RSI has dipped to ${indicators.rsi} (Oversold condition).`;
          }
          break;
        case 'RSI_ABOVE_70':
          if (indicators.rsi >= 70) {
            triggered = true;
            message = `${alert.symbol} RSI has crossed ${indicators.rsi} (Overbought zone).`;
          }
          break;
        case 'SIGNAL_BEARISH_TO_BULLISH':
          if (indicators.signal === 'BULLISH') {
            triggered = true;
            message = `${alert.symbol} technical rating upgraded to BULLISH (Score: ${indicators.score}/8).`;
          }
          break;
        case 'SIGNAL_BULLISH_TO_BEARISH':
          if (indicators.signal === 'BEARISH') {
            triggered = true;
            message = `${alert.symbol} technical rating downgraded to BEARISH.`;
          }
          break;
      }

      if (triggered) {
        alert.status = 'TRIGGERED';
        alert.triggeredAt = new Date().toISOString();
        alert.message = message;
        triggeredCount++;

        // Push In-App notification
        this.notifications.unshift({
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: alert.userId,
          title: `Alert Triggered: ${alert.symbol}`,
          message,
          type: 'ALERT',
          timestamp: 'Just now',
          read: false,
        });
      }
    }

    if (triggeredCount > 0) {
      this.saveToStorage();
    }

    return triggeredCount;
  }

  // --- ADMIN METHODS ---

  public getAllUsers(): User[] {
    return [...this.users];
  }

  public toggleUserStatus(userId: string): boolean {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return false;
    user.isVerified = !user.isVerified; // Toggle active status
    this.saveToStorage();
    return true;
  }

  // --- IMPORT / EXPORT METHODS ---

  public exportHoldingsToCSV(): string {
    const holdings = this.getUserHoldings();
    const headers = [
      'Symbol',
      'Company Name',
      'Sector',
      'Quantity',
      'Buy Price',
      'Invested',
      'CMP',
      'Current Value',
      'P/L',
      'P/L %',
      'Stop Loss',
      'Target 1',
      'Status',
      'Notes',
    ];

    const rows = holdings.map((h) => [
      `"${h.symbol}"`,
      `"${h.name}"`,
      `"${h.sector}"`,
      h.quantity,
      h.buyPrice,
      h.invested,
      h.cmp,
      h.currentValue,
      h.pnl,
      h.pnlPercent,
      h.stopLoss || '',
      h.target1 || '',
      `"${h.status}"`,
      `"${(h.notes || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public exportTransactionsToCSV(): string {
    const txs = this.getUserTransactions();
    const headers = ['Symbol', 'Type', 'Date', 'Quantity', 'Price', 'Charges', 'Notes'];
    const rows = txs.map((t) => [
      `"${t.symbol}"`,
      t.type,
      t.date,
      t.quantity,
      t.price,
      t.charges,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public importHoldingsFromCSV(csvText: string): { imported: number; errors: string[] } {
    if (!this.currentUserId) return { imported: 0, errors: ['User not authenticated'] };

    const lines = csvText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 2) {
      return { imported: 0, errors: ['CSV file is empty or missing headers'] };
    }

    const errors: string[] = [];
    let count = 0;

    // Header parse
    const headerLine = lines[0].toLowerCase();
    const hasSymbol = headerLine.includes('symbol');
    const hasQty = headerLine.includes('quantity') || headerLine.includes('qty');
    const hasPrice = headerLine.includes('price');

    if (!hasSymbol || !hasQty || !hasPrice) {
      return {
        imported: 0,
        errors: ['Invalid CSV format. Header must contain Symbol, Quantity, and Buy Price.'],
      };
    }

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
      if (parts.length < 3) continue;

      const symbol = parts[0].toUpperCase();
      const qty = parseInt(parts[1] || parts[3], 10);
      const buyPrice = parseFloat(parts[2] || parts[4]);

      if (!symbol || isNaN(qty) || qty <= 0 || isNaN(buyPrice) || buyPrice <= 0) {
        errors.push(`Row ${i + 1}: Invalid data for symbol ${symbol}`);
        continue;
      }

      const quote = marketDataService.getStock(symbol);

      this.addHolding({
        symbol,
        name: quote?.name || symbol,
        sector: quote?.sector || 'General',
        quantity: qty,
        buyPrice,
        purchaseDate: new Date().toISOString().split('T')[0],
        brokerage: 20,
        notes: 'Imported via CSV file',
        tag: 'Investment',
      });
      count++;
    }

    return { imported: count, errors };
  }
}

export const authStorage = new AuthStorageService();
