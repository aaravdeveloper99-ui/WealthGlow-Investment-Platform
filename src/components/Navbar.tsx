/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShieldCheck, LogIn, LayoutDashboard, Database } from "lucide-react";

interface NavbarProps {
  user: any;
  onOpenAuth: () => void;
  onLogout: () => void;
  onGoToDashboard: () => void;
  currentView: string;
}

export function Navbar({ user, onOpenAuth, onLogout, onGoToDashboard, currentView }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/20">
            <ShieldCheck className="w-5.5 h-5.5" />
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary blur opacity-30 group-hover:opacity-100 transition duration-300" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-white">
            Wealth<span className="text-brand-secondary">Glow</span>
          </span>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          <a href="#plans" className="hidden sm:inline-block text-sm text-slate-300 hover:text-white font-medium transition-colors mr-2">
            Investment Plans
          </a>
          <a href="#faq" className="hidden sm:inline-block text-sm text-slate-300 hover:text-white font-medium transition-colors mr-4">
            FAQs
          </a>

          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onGoToDashboard}
                className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                {user.role === "ADMIN" ? (
                  <>
                    <Database className="w-4 h-4 text-brand-secondary" />
                    Admin Panel
                  </>
                ) : (
                  <>
                    <LayoutDashboard className="w-4 h-4 text-brand-primary" />
                    Dashboard
                  </>
                )}
              </button>
              <button
                onClick={onLogout}
                className="hidden md:inline-block text-xs text-slate-400 hover:text-white font-medium hover:underline transition-all cursor-pointer"
              >
                Log Out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="h-10 px-5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary hover:to-brand-primary/90 text-white font-bold text-sm flex items-center gap-2 cursor-pointer shadow-md shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <LogIn className="w-4 h-4" />
              Access Platform
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
