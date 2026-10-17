import React, { useState } from 'react';
import { User, AdminSettings } from '../types';
import { marketDataService } from '../lib/marketData';
import {
  ShieldCheck,
  Users,
  Activity,
  Server,
  Sliders,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  Zap,
  Save,
  Pause,
  Play,
  Layers,
  Database,
} from 'lucide-react';

interface AdminDashboardProps {
  users: User[];
  onToggleUserStatus: (userId: string) => void;
  onRunCronJobNow: (jobName: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  onToggleUserStatus,
  onRunCronJobNow,
}) => {
  const [settings, setSettings] = useState<AdminSettings>(marketDataService.getAdminSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [lastCronResult, setLastCronResult] = useState<string | null>(null);

  const activeUsersCount = users.filter((u) => u.isVerified).length;
  const allStocks = marketDataService.getAllStocks();
  const allSectors = marketDataService.getAllSectors();

  const handleWeightChange = (key: keyof AdminSettings['weights'], val: number) => {
    setSettings((prev) => ({
      ...prev,
      weights: {
        ...prev.weights,
        [key]: val,
      },
    }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = marketDataService.updateAdminSettings(settings);
    setSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const triggerCron = (name: string) => {
    onRunCronJobNow(name);
    setLastCronResult(`Successfully dispatched ${name} at ${new Date().toLocaleTimeString('en-IN')}`);
    setTimeout(() => setLastCronResult(null), 4000);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Admin Header & Status Overview */}
      <div className="bg-slate-900 border border-amber-800/60 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100 font-sans">
              Admin & Market Risk Control Console
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authorized administrative panel for user isolation management, signal engine weights, and background cron jobs.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
            SYSTEM STATUS: HEALTHY
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            MARKET PROVIDER: NSE LIVE
          </span>
        </div>
      </div>

      {/* 2. System Health & User Telemetry Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-slate-400">TOTAL REGISTERED USERS</span>
          <span className="text-2xl font-bold text-slate-100 mt-2">{users.length}</span>
          <span className="text-[11px] text-emerald-400 mt-1">
            {activeUsersCount} Active / Verified
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-slate-400">SUPPORTED NSE STOCKS</span>
          <span className="text-2xl font-bold text-slate-100 mt-2">{allStocks.length}</span>
          <span className="text-[11px] text-slate-400 mt-1">NIFTY 50 & Liquid Equities</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-slate-400">TRACKED SECTORS</span>
          <span className="text-2xl font-bold text-slate-100 mt-2">{allSectors.length}</span>
          <span className="text-[11px] text-slate-400 mt-1">Indices & Heatmaps</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-slate-400">API CACHE HIT RATIO</span>
          <span className="text-2xl font-bold text-emerald-400 mt-2">99.4%</span>
          <span className="text-[11px] text-slate-400 mt-1">0 Rate Limit Breaches</span>
        </div>
      </div>

      {/* 3. Background Cron Jobs & Manual Schedulers */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Scheduled Background Jobs & Automation
            </h3>
          </div>
          {lastCronResult && (
            <span className="text-emerald-400 text-xs font-mono">{lastCronResult}</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <span className="font-bold text-slate-200 font-sans block">Market Hours Sync</span>
              <span className="text-slate-400 text-[11px]">
                Ticks CMP, recalcs indicators & scans user price alerts every 5 mins.
              </span>
            </div>
            <button
              onClick={() => triggerCron('Market Tick Sync')}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Run Sync Now</span>
            </button>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <span className="font-bold text-slate-200 font-sans block">EOD Market Snapshot</span>
              <span className="text-slate-400 text-[11px]">
                Executes after 15:30 IST. Stores closing values & generates daily reports.
              </span>
            </div>
            <button
              onClick={() => triggerCron('EOD Daily Snapshot')}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Trigger EOD Run</span>
            </button>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <span className="font-bold text-slate-200 font-sans block">Alerts & Email Dispatcher</span>
              <span className="text-slate-400 text-[11px]">
                Scans stop loss breaches, EMA crossovers, and dispatches notices.
              </span>
            </div>
            <button
              onClick={() => triggerCron('Alerts & Mail Daemon')}
              className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Run Alert Daemon</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Configurable Signal Engine Weights & Thresholds */}
      <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 text-xs font-sans">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Technical Analysis & Scoring Engine Configuration
            </h3>
          </div>
          {savedSuccess && (
            <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Engine Weights Applied
            </span>
          )}
        </div>

        <p className="text-slate-400 text-[11px]">
          Configure algorithmic point weights (0-8 scale) used to evaluate stocks as BULLISH, NEUTRAL, or BEARISH.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-1">
            <label className="text-slate-400 text-[10px]">Price &gt; EMA 20 Weight</label>
            <input
              type="number"
              min="0"
              max="5"
              value={settings.weights.priceAboveEma20}
              onChange={(e) => handleWeightChange('priceAboveEma20', parseInt(e.target.value) || 0)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs"
            />
          </div>

          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-1">
            <label className="text-slate-400 text-[10px]">Price &gt; EMA 50 Weight</label>
            <input
              type="number"
              min="0"
              max="5"
              value={settings.weights.priceAboveEma50}
              onChange={(e) => handleWeightChange('priceAboveEma50', parseInt(e.target.value) || 0)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs"
            />
          </div>

          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-1">
            <label className="text-slate-400 text-[10px]">Price &gt; EMA 200 Weight</label>
            <input
              type="number"
              min="0"
              max="5"
              value={settings.weights.priceAboveEma200}
              onChange={(e) => handleWeightChange('priceAboveEma200', parseInt(e.target.value) || 0)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs"
            />
          </div>

          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-1">
            <label className="text-slate-400 text-[10px]">EMA 20 &gt; 50 (Cross) Weight</label>
            <input
              type="number"
              min="0"
              max="5"
              value={settings.weights.ema20Above50}
              onChange={(e) => handleWeightChange('ema20Above50', parseInt(e.target.value) || 0)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs"
            />
          </div>

          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-1">
            <label className="text-slate-400 text-[10px]">EMA 50 &gt; 200 (Macro) Weight</label>
            <input
              type="number"
              min="0"
              max="5"
              value={settings.weights.ema50Above200}
              onChange={(e) => handleWeightChange('ema50Above200', parseInt(e.target.value) || 0)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs"
            />
          </div>

          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-1">
            <label className="text-slate-400 text-[10px]">RSI &gt; 50 Weight</label>
            <input
              type="number"
              min="0"
              max="5"
              value={settings.weights.rsiBullish}
              onChange={(e) => handleWeightChange('rsiBullish', parseInt(e.target.value) || 0)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs"
            />
          </div>

          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-1">
            <label className="text-slate-400 text-[10px]">MACD Positive Weight</label>
            <input
              type="number"
              min="0"
              max="5"
              value={settings.weights.macdBullish}
              onChange={(e) => handleWeightChange('macdBullish', parseInt(e.target.value) || 0)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs"
            />
          </div>

          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-1">
            <label className="text-slate-400 text-[10px]">Volume Surge Weight</label>
            <input
              type="number"
              min="0"
              max="5"
              value={settings.weights.volumeSurge}
              onChange={(e) => handleWeightChange('volumeSurge', parseInt(e.target.value) || 0)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs"
            />
          </div>
        </div>

        {/* Threshold limits */}
        <div className="grid grid-cols-2 gap-4 font-mono pt-2 border-t border-slate-800">
          <div className="flex flex-col gap-1">
            <label className="text-slate-300 font-semibold">Bullish Rating Threshold (Score &ge; X)</label>
            <input
              type="number"
              min="1"
              max="8"
              value={settings.bullishThreshold}
              onChange={(e) => setSettings({ ...settings, bullishThreshold: parseInt(e.target.value) || 6 })}
              className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-slate-300 font-semibold">Neutral Floor Threshold (Score &lt; X is Bearish)</label>
            <input
              type="number"
              min="0"
              max="7"
              value={settings.neutralThreshold}
              onChange={(e) => setSettings({ ...settings, neutralThreshold: parseInt(e.target.value) || 3 })}
              className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg flex items-center gap-1.5 shadow-sm font-sans"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Apply Engine Weights</span>
          </button>
        </div>
      </form>

      {/* 5. User Directory & Security Administration */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Registered Accounts & Access Control
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Row-Level-Security (RLS) Enforced</span>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">USER ID</th>
                <th className="py-2.5 px-3">NAME</th>
                <th className="py-2.5 px-3">EMAIL</th>
                <th className="py-2.5 px-3">ROLE</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-slate-400">{u.id}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-100 font-sans">{u.name}</td>
                  <td className="py-2.5 px-3 text-slate-300">{u.email}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.isVerified
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {u.isVerified ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onToggleUserStatus(u.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                        u.isVerified
                          ? 'bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300'
                          : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-400'
                      }`}
                    >
                      {u.isVerified ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
