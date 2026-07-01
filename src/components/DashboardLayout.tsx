/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { LayoutDashboard, Wallet, TrendingUp, Users, User, LogOut, Bell, Shield, Database, Sparkles } from "lucide-react";

interface DashboardLayoutProps {
  user: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onToggleRole: () => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  children: React.ReactNode;
}

export function DashboardLayout({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onToggleRole,
  unreadCount,
  onOpenNotifications,
  children,
}: DashboardLayoutProps) {
  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "wallet", label: "My Wallet", icon: Wallet },
    { id: "investments", label: "Investments", icon: TrendingUp },
    { id: "referral", label: "Referral Network", icon: Users },
    { id: "profile", label: "Profile & KYC", icon: User },
  ];

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-brand-bg text-white flex flex-col md:flex-row font-sans">
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex md:w-64 bg-slate-900/60 border-r border-white/5 flex-col justify-between shrink-0 p-6 glass-panel">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-white">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <span className="text-lg font-bold font-display text-white tracking-tight">
              Wealth<span className="text-brand-secondary">Glow</span>
            </span>
          </div>

          {/* User Brief Summary */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
              {user.fullName ? user.fullName[0].toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate">{user.fullName}</h4>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mt-1 inline-block ${
                isAdmin ? "bg-brand-secondary/20 text-brand-secondary" : "bg-brand-primary/20 text-brand-primary"
              }`}>
                {user.role}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full h-11 px-4 rounded-xl flex items-center gap-3 font-semibold text-sm transition-all cursor-pointer ${
                    isActive
                      ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/25"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Quick access to admin section if admin */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`w-full h-11 px-4 rounded-xl flex items-center gap-3 font-bold text-sm transition-all cursor-pointer mt-6 ${
                  activeTab === "admin"
                    ? "bg-brand-secondary text-brand-bg shadow-lg shadow-brand-secondary/25"
                    : "text-brand-secondary hover:bg-brand-secondary/5"
                }`}
              >
                <Database className="w-4 h-4 shrink-0" />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="space-y-3.5">
          {/* Role Changer Simulator Button */}
          <button
            onClick={onToggleRole}
            className="w-full h-10 rounded-xl border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
            title="Convenient sandbox tool to test Admin features like approving deposits, withdrawals, and KYC"
          >
            <Database className="w-3.5 h-3.5 text-brand-secondary" />
            <span>Simulate: Toggle Role</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full h-11 px-4 rounded-xl flex items-center gap-3 text-slate-400 hover:text-white hover:bg-brand-danger/10 hover:text-brand-danger text-sm font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Terminal</span>
          </button>
        </div>
      </aside>

      {/* DASHBOARD CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER FOR DASHBOARD */}
        <header className="h-16 px-4 sm:px-6 bg-slate-900/40 border-b border-white/5 flex items-center justify-between shrink-0 glass-panel">
          <div className="flex items-center gap-3 md:hidden">
            {/* Mobile Brand */}
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-base font-bold font-display">WealthGlow</span>
          </div>

          {/* User Greetings */}
          <div className="hidden md:block">
            <h1 className="text-sm font-semibold text-slate-400">
              Secured Compliance Terminal / <strong className="text-white">{activeTab.toUpperCase()}</strong>
            </h1>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-4">
            {/* Live Ticker status indicator */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-success/10 border border-brand-success/20 text-[10px] font-bold text-brand-success font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-ping" />
              <span>LIVE ROI ENGINE</span>
            </div>

            {/* Notification trigger */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Mobile User Profile shortcut */}
            <div className="md:hidden w-8 h-8 rounded-full bg-brand-primary/15 flex items-center justify-center text-brand-primary text-xs font-bold">
              {user.fullName ? user.fullName[0].toUpperCase() : "U"}
            </div>
          </div>
        </header>

        {/* MAIN BODY SCROLL VIEW */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
          {children}
        </main>

        {/* MOBILE NAVIGATION BAR */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-slate-900/90 border-t border-white/10 flex justify-around items-center z-40 glass-panel px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all cursor-pointer ${
                  isActive ? "text-brand-primary scale-110" : "text-slate-500"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-1 tracking-tight truncate max-w-full">
                  {item.label.split(" ")[0]}
                </span>
              </button>
            );
          })}
          {isAdmin && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all cursor-pointer ${
                activeTab === "admin" ? "text-brand-secondary scale-110" : "text-slate-500"
              }`}
            >
              <Database className="w-5 h-5" />
              <span className="text-[9px] font-bold mt-1 tracking-tight">Admin</span>
            </button>
          )}
          <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center w-12 h-12 text-slate-500 hover:text-brand-danger cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-1">Exit</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
