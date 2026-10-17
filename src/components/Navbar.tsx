import React, { useState } from 'react';
import { User, InAppNotification } from '../types';
import {
  Bell,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  LayoutDashboard,
  PieChart,
  ListFilter,
  Layers,
  BarChart2,
  BellRing,
  Receipt,
  FileText,
  Sliders,
  ChevronDown,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'portfolio'
  | 'watchlist'
  | 'sectors'
  | 'market'
  | 'alerts'
  | 'transactions'
  | 'reports'
  | 'settings'
  | 'admin';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentUser: User | null;
  notifications: InAppNotification[];
  onOpenNotifications: () => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  notifications,
  onOpenNotifications,
  onLogout,
  onOpenAuth,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'portfolio', label: 'Portfolio', icon: <PieChart className="w-4 h-4" /> },
    { id: 'watchlist', label: 'Watchlist', icon: <ListFilter className="w-4 h-4" /> },
    { id: 'sectors', label: 'Sector Analysis', icon: <Layers className="w-4 h-4" /> },
    { id: 'market', label: 'Market', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'alerts', label: 'Alerts', icon: <BellRing className="w-4 h-4" /> },
    { id: 'transactions', label: 'Transactions', icon: <Receipt className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Sliders className="w-4 h-4" /> },
    { id: 'admin', label: 'Admin', icon: <ShieldCheck className="w-4 h-4" />, adminOnly: true },
  ];

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-100 font-sans whitespace-nowrap">
                NIFTY<span className="text-emerald-400">PULSE</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 tracking-wider">
                NSE/BSE TERMINAL
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map((item) => {
            if (item.adminOnly && currentUser?.role !== 'admin') return null;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.adminOnly && (
                  <span className="px-1 text-[9px] bg-amber-950 text-amber-400 border border-amber-800 rounded font-mono">
                    ADMIN
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Profile & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse"></span>
            )}
          </button>

          {/* User Profile or Sign In */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors text-xs text-left"
              >
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-[11px]">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-slate-200 font-medium whitespace-nowrap max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {currentUser.role === 'admin' ? 'SYSTEM ADMIN' : 'VERIFIED INVESTOR'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="font-semibold text-slate-200">{currentUser.name}</p>
                    <p className="text-slate-400 text-[11px] font-mono truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-emerald-400 text-[10px]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Isolated Vault RLS Active</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onTabChange('settings');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>Account Profile & Risk</span>
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          onTabChange('admin');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-amber-300 hover:bg-slate-800 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Admin Console & Signals</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-800 pt-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-rose-400 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors whitespace-nowrap"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-slate-800/70 bg-slate-900/60 scrollbar-none">
        {navItems.map((item) => {
          if (item.adminOnly && currentUser?.role !== 'admin') return null;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 flex items-center gap-1 ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
