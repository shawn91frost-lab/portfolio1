import React, { useState } from 'react';
import { User } from '../types';
import {
  Sliders,
  User as UserIcon,
  Shield,
  Bell,
  CheckCircle2,
  Lock,
  Save,
} from 'lucide-react';

interface SettingsViewProps {
  currentUser: User | null;
  onUpdateProfile: (updates: Partial<User>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [riskProfile, setRiskProfile] = useState<User['riskProfile']>(
    currentUser?.riskProfile || 'MODERATE'
  );
  const [emailAlerts, setEmailAlerts] = useState(
    currentUser?.notificationPreferences?.emailAlerts ?? true
  );
  const [dailyMarketReport, setDailyMarketReport] = useState(
    currentUser?.notificationPreferences?.dailyMarketReport ?? true
  );
  const [stopLossAlerts, setStopLossAlerts] = useState(
    currentUser?.notificationPreferences?.stopLossAlerts ?? true
  );
  const [targetAlerts, setTargetAlerts] = useState(
    currentUser?.notificationPreferences?.targetAlerts ?? true
  );

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      phone,
      bio,
      riskProfile,
      notificationPreferences: {
        emailAlerts,
        dailyMarketReport,
        stopLossAlerts,
        targetAlerts,
      },
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    setPasswordSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-4xl">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-lg font-bold text-slate-100 font-sans">
          Account Settings & Risk Preferences
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage your verified investor identity, risk tolerance profile, and automated email alerts.
        </p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleProfileSave} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-5 text-xs font-sans">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">Investor Profile</h3>
          </div>
          {profileSaved && (
            <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Settings Saved
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-300 font-medium">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-300 font-medium">Registered Email Address</label>
            <input
              type="email"
              value={currentUser?.email || ''}
              disabled
              className="bg-slate-950/60 border border-slate-800/60 rounded-lg px-3 py-2 text-slate-400 font-mono cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-300 font-medium">Contact Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-300 font-medium">Risk Tolerance Profile</label>
            <select
              value={riskProfile}
              onChange={(e) => setRiskProfile(e.target.value as User['riskProfile'])}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="CONSERVATIVE">CONSERVATIVE (Large-cap / Capital Preservation)</option>
              <option value="MODERATE">MODERATE (Diversified Core & Satellites)</option>
              <option value="AGGRESSIVE">AGGRESSIVE (High Beta / Momentum / Mid & Small Caps)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-slate-300 font-medium">Investment Mandate & Bio</label>
          <textarea
            rows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Notifications Checkboxes */}
        <div className="flex flex-col gap-2 pt-3 border-t border-slate-800">
          <label className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Email Notification Dispatch Preferences</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded border-slate-800 text-emerald-500 focus:ring-0"
              />
              <span>Real-time price & indicator alerts</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={dailyMarketReport}
                onChange={(e) => setDailyMarketReport(e.target.checked)}
                className="rounded border-slate-800 text-emerald-500 focus:ring-0"
              />
              <span>Daily post-market digest (16:00 IST)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={stopLossAlerts}
                onChange={(e) => setStopLossAlerts(e.target.checked)}
                className="rounded border-slate-800 text-emerald-500 focus:ring-0"
              />
              <span>Stop loss breach warnings</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={targetAlerts}
                onChange={(e) => setTargetAlerts(e.target.checked)}
                className="rounded border-slate-800 text-emerald-500 focus:ring-0"
              />
              <span>Profit target execution notifications</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Password Change Form */}
      <form onSubmit={handlePasswordChange} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4 text-xs font-sans">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-slate-200">Security & Password</h3>
          </div>
          {passwordSaved && (
            <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Password Updated
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-300 font-medium">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-300 font-medium">New Password</label>
            <input
              type="password"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg border border-slate-700"
          >
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
};
