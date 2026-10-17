/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  MarketIndexData,
  CalculatedHolding,
  PortfolioHolding,
  SectorData,
  StockQuote,
  Watchlist,
  PriceAlert,
  InAppNotification,
  Transaction,
} from './types';
import { marketDataService } from './lib/marketData';
import { authStorage } from './lib/authStorage';

// Components
import { Navbar, NavTab } from './components/Navbar';
import { MarketStatusBar } from './components/MarketStatusBar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { DashboardView } from './components/DashboardView';
import { PortfolioView } from './components/PortfolioView';
import { WatchlistView } from './components/WatchlistView';
import { SectorAnalysisView } from './components/SectorAnalysisView';
import { MarketOverviewView } from './components/MarketOverviewView';
import { AlertsManager } from './components/AlertsManager';
import { TransactionsView } from './components/TransactionsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { AdminDashboard } from './components/AdminDashboard';
import { StockDetailModal } from './components/StockDetailModal';
import { AuthModal } from './components/AuthModal';
import { CsvImportModal } from './components/CsvImportModal';

export default function App() {
  // Navigation & User State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(authStorage.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Active Stock Detail Modal State
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(null);

  // Real-time market state
  const [nifty, setNifty] = useState<MarketIndexData>(marketDataService.getNifty50());
  const [indices, setIndices] = useState<MarketIndexData[]>(marketDataService.getAllIndices());
  const [sectors, setSectors] = useState<SectorData[]>(marketDataService.getAllSectors());
  const [lastUpdated, setLastUpdated] = useState<string>(marketDataService.getLastUpdated());
  const [isAutoRefreshActive, setIsAutoRefreshActive] = useState(true);

  // User-isolated data state
  const [holdings, setHoldings] = useState<CalculatedHolding[]>(authStorage.getUserHoldings());
  const [transactions, setTransactions] = useState<Transaction[]>(authStorage.getUserTransactions());
  const [watchlists, setWatchlists] = useState<Watchlist[]>(authStorage.getUserWatchlists());
  const [alerts, setAlerts] = useState<PriceAlert[]>(authStorage.getUserAlerts());
  const [notifications, setNotifications] = useState<InAppNotification[]>(authStorage.getUserNotifications());
  const [allUsers, setAllUsers] = useState<User[]>(authStorage.getAllUsers());

  // Reload current user data whenever user or market updates
  const reloadUserData = useCallback(() => {
    setHoldings(authStorage.getUserHoldings());
    setTransactions(authStorage.getUserTransactions());
    setWatchlists(authStorage.getUserWatchlists());
    setAlerts(authStorage.getUserAlerts());
    setNotifications(authStorage.getUserNotifications());
    setAllUsers(authStorage.getAllUsers());
  }, []);

  // Real-time Tick Simulator Loop (runs every 4 seconds when auto-refresh is active)
  useEffect(() => {
    if (!isAutoRefreshActive) return;

    const interval = setInterval(() => {
      marketDataService.simulateMarketTick();
      setNifty(marketDataService.getNifty50());
      setIndices(marketDataService.getAllIndices());
      setSectors(marketDataService.getAllSectors());
      setLastUpdated(marketDataService.getLastUpdated());

      // Evaluate active user alerts against latest tick
      authStorage.evaluateAlerts();
      reloadUserData();
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoRefreshActive, reloadUserData]);

  // Manual Tick Trigger
  const handleManualRefresh = () => {
    marketDataService.simulateMarketTick();
    setNifty(marketDataService.getNifty50());
    setIndices(marketDataService.getAllIndices());
    setSectors(marketDataService.getAllSectors());
    setLastUpdated(marketDataService.getLastUpdated());
    authStorage.evaluateAlerts();
    reloadUserData();
  };

  // Auth Handlers
  const handleLogin = (email: string, password?: string) => {
    const res = authStorage.login(email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      reloadUserData();
    }
    return res;
  };

  const handleSignup = (name: string, email: string, password?: string) => {
    const res = authStorage.signup(name, email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      reloadUserData();
    }
    return res;
  };

  const handleLogout = () => {
    authStorage.logout();
    setCurrentUser(null);
    reloadUserData();
    setIsAuthModalOpen(true);
  };

  const handleUpdateProfile = (updates: Partial<User>) => {
    const res = authStorage.updateProfile(updates);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      reloadUserData();
    }
  };

  // Portfolio Handlers
  const handleAddHolding = (holding: Omit<PortfolioHolding, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    authStorage.addHolding(holding);
    reloadUserData();
  };

  const handleUpdateHolding = (id: string, updates: Partial<PortfolioHolding>) => {
    authStorage.updateHolding(id, updates);
    reloadUserData();
  };

  const handleDeleteHolding = (id: string) => {
    authStorage.deleteHolding(id);
    reloadUserData();
  };

  // Transaction Handlers
  const handleAddTransaction = (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    authStorage.addTransaction(tx);
    reloadUserData();
  };

  // Watchlist Handlers
  const handleCreateWatchlist = (name: string) => {
    authStorage.createWatchlist(name);
    reloadUserData();
  };

  const handleDeleteWatchlist = (id: string) => {
    authStorage.deleteWatchlist(id);
    reloadUserData();
  };

  const handleAddSymbolToWatchlist = (watchlistId: string, symbol: string) => {
    authStorage.addSymbolToWatchlist(watchlistId, symbol);
    reloadUserData();
  };

  const handleRemoveSymbolFromWatchlist = (watchlistId: string, symbol: string) => {
    authStorage.removeSymbolFromWatchlist(watchlistId, symbol);
    reloadUserData();
  };

  // Alerts Handlers
  const handleCreateAlert = (alert: Omit<PriceAlert, 'id' | 'userId' | 'createdAt' | 'status'>) => {
    authStorage.createAlert(alert);
    reloadUserData();
  };

  const handleDeleteAlert = (id: string) => {
    authStorage.deleteAlert(id);
    reloadUserData();
  };

  const handleToggleAlertStatus = (id: string) => {
    authStorage.toggleAlertStatus(id);
    reloadUserData();
  };

  const handleEvaluateAlertsNow = () => {
    authStorage.evaluateAlerts();
    reloadUserData();
  };

  const handleMarkNotificationRead = (id: string) => {
    authStorage.markNotificationRead(id);
    reloadUserData();
  };

  const handleMarkAllNotificationsRead = () => {
    authStorage.markAllNotificationsRead();
    reloadUserData();
  };

  // CSV Import / Export Handlers
  const handleExportHoldingsCSV = () => {
    const csv = authStorage.exportHoldingsToCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NiftyPulse_Holdings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportTransactionsCSV = () => {
    const csv = authStorage.exportTransactionsToCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NiftyPulse_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (csvText: string) => {
    const res = authStorage.importHoldingsFromCSV(csvText);
    reloadUserData();
    return res;
  };

  // Admin Handlers
  const handleToggleUserStatus = (userId: string) => {
    authStorage.toggleUserStatus(userId);
    reloadUserData();
  };

  const handleRunCronJob = (jobName: string) => {
    if (jobName.includes('Snapshot')) {
      marketDataService.generateDailySnapshot();
    } else {
      marketDataService.simulateMarketTick();
      authStorage.evaluateAlerts();
    }
    reloadUserData();
  };

  // Quick Action: Add symbol from watchlist or stock detail directly to portfolio
  const handleQuickAddToPortfolio = (symbol: string) => {
    const q = marketDataService.getStock(symbol);
    if (!q) return;

    authStorage.addHolding({
      symbol: q.symbol,
      name: q.name,
      sector: q.sector,
      quantity: 10,
      buyPrice: q.cmp,
      purchaseDate: new Date().toISOString().split('T')[0],
      brokerage: 20,
      tag: 'Investment',
      notes: 'Added from Stock Terminal',
    });
    reloadUserData();
    setActiveTab('portfolio');
  };

  const selectedStockQuote = selectedStockSymbol
    ? marketDataService.getStock(selectedStockSymbol)
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-400">
      {/* 1. Regulatory Disclaimer Banner */}
      <DisclaimerBanner />

      {/* 2. Primary Top Bar Contract Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        currentUser={currentUser}
        notifications={notifications}
        onOpenNotifications={() => setActiveTab('alerts')}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* 3. Live Market Status Bar (IST Clock, Session Status, Feed Toggle) */}
      <MarketStatusBar
        lastUpdated={lastUpdated}
        onRefreshTick={handleManualRefresh}
        isAutoRefreshActive={isAutoRefreshActive}
        onToggleAutoRefresh={() => setIsAutoRefreshActive(!isAutoRefreshActive)}
      />

      {/* 4. Main Body Content Area */}
      <main className="flex-1 max-w-[1560px] w-full mx-auto p-4 sm:p-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            nifty={nifty}
            holdings={holdings}
            sectors={sectors}
            onSelectStock={(sym) => setSelectedStockSymbol(sym)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioView
            holdings={holdings}
            onAddHolding={handleAddHolding}
            onUpdateHolding={handleUpdateHolding}
            onDeleteHolding={handleDeleteHolding}
            onSelectStock={(sym) => setSelectedStockSymbol(sym)}
            onExportCSV={handleExportHoldingsCSV}
            onOpenImportModal={() => setIsImportModalOpen(true)}
          />
        )}

        {activeTab === 'watchlist' && (
          <WatchlistView
            watchlists={watchlists}
            onCreateWatchlist={handleCreateWatchlist}
            onDeleteWatchlist={handleDeleteWatchlist}
            onAddSymbol={handleAddSymbolToWatchlist}
            onRemoveSymbol={handleRemoveSymbolFromWatchlist}
            onSelectStock={(sym) => setSelectedStockSymbol(sym)}
            onOpenCreateAlert={(sym) => {
              setActiveTab('alerts');
            }}
            onQuickAddToPortfolio={handleQuickAddToPortfolio}
          />
        )}

        {activeTab === 'sectors' && (
          <SectorAnalysisView
            sectors={sectors}
            onSelectStock={(sym) => setSelectedStockSymbol(sym)}
          />
        )}

        {activeTab === 'market' && (
          <MarketOverviewView
            indices={indices}
            onSelectStock={(sym) => setSelectedStockSymbol(sym)}
            onSelectIndex={(sym) => {
              if (sym === '^NSEI') setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsManager
            alerts={alerts}
            notifications={notifications}
            onCreateAlert={handleCreateAlert}
            onDeleteAlert={handleDeleteAlert}
            onToggleAlertStatus={handleToggleAlertStatus}
            onEvaluateAlertsNow={handleEvaluateAlertsNow}
            onMarkNotificationRead={handleMarkNotificationRead}
            onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onExportCSV={handleExportTransactionsCSV}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            holdings={holdings}
            onExportHoldingsCSV={handleExportHoldingsCSV}
            onExportTransactionsCSV={handleExportTransactionsCSV}
            onOpenImportModal={() => setIsImportModalOpen(true)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <AdminDashboard
            users={allUsers}
            onToggleUserStatus={handleToggleUserStatus}
            onRunCronJobNow={handleRunCronJob}
          />
        )}
      </main>

      {/* 5. Stock Deep-Dive Modal (When any stock is clicked) */}
      {selectedStockQuote && (
        <StockDetailModal
          stock={selectedStockQuote}
          onClose={() => setSelectedStockSymbol(null)}
          onAddToPortfolio={(sym) => {
            handleQuickAddToPortfolio(sym);
            setSelectedStockSymbol(null);
          }}
          onAddToWatchlist={(sym) => {
            if (watchlists[0]) {
              handleAddSymbolToWatchlist(watchlists[0].id, sym);
            }
            setSelectedStockSymbol(null);
            setActiveTab('watchlist');
          }}
          onCreateAlert={(sym) => {
            setSelectedStockSymbol(null);
            setActiveTab('alerts');
          }}
        />
      )}

      {/* 6. Auth Modal (Login, Signup, Forgot, Reset) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />

      {/* 7. CSV Import Modal */}
      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportCsv={handleImportCSV}
      />

      {/* 8. Quiet Institutional Footer */}
      <footer className="w-full bg-slate-900 border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-[1560px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} NiftyPulse Terminal. Multi-User Indian Equity Portfolio Platform.</span>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>NSE/BSE Feeds Active</span>
            <span>·</span>
            <span>RLS Vault Protected</span>
            <span>·</span>
            <span>IST Market Hours Calibrated</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
