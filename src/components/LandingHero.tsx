/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, Calculator, Coins, TrendingUp, DollarSign, Wallet2, Users } from "lucide-react";

interface Plan {
  id: string;
  title: string;
  minimumAmount: number;
  maximumAmount: number;
  roiPercentage: number;
  durationDays: number;
  capitalReturn: boolean;
}

interface LandingHeroProps {
  onOpenAuth: () => void;
  plans: Plan[];
}

export function LandingHero({ onOpenAuth, plans }: LandingHeroProps) {
  const [stats, setStats] = useState({
    totalInvestors: 1240,
    totalAssets: 4850000,
    totalWithdrawals: 1920000,
    countriesCount: 42,
  });

  // Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(500);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("plan-silver");

  useEffect(() => {
    // Fetch live system statistics
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      })
      .catch((err) => console.log("Failed to load statistics"));
  }, []);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const calculateReturns = () => {
    if (!selectedPlan) return { daily: 0, total: 0, percentage: 0 };
    const daily = calcAmount * (selectedPlan.roiPercentage / 100);
    const total = daily * selectedPlan.durationDays;
    return {
      daily,
      total,
      percentage: selectedPlan.roiPercentage * selectedPlan.durationDays,
    };
  };

  const results = calculateReturns();

  return (
    <section className="relative overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24">
      {/* Background radial gradient flares */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-[500px] h-[500px] bg-brand-secondary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Headline and Left Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-xs font-semibold text-brand-secondary"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Next-Generation Passive Wealth SaaS</span>
            </motion.div>

            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white leading-none mt-2"
            >
              Secure Daily Yields.<br />
              <span className="bg-gradient-to-r from-brand-secondary via-brand-primary to-brand-accent bg-clip-text text-transparent">
                Premium Wealth Autopilot.
              </span>
            </motion.h1>

            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-400 text-lg max-w-2xl mx-auto lg:mx-0 font-sans"
            >
              Deploy your funds across our automated high-performance liquidity and yield plans. Secure audited smart reserves yielding up to 4.0% daily with instant withdrawal capabilities.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button
                onClick={onOpenAuth}
                className="h-14 px-8 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/30 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Start Investing Now
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#plans"
                className="h-14 px-8 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-base flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 transition-all"
              >
                Browse Wealth Plans
              </a>
            </motion.div>

            {/* LIVE SYSTEM STATS */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center lg:text-left"
            >
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
                  ${(stats.totalAssets / 1000000).toFixed(2)}M
                </span>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Assets Managed
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-bold font-display text-brand-secondary tracking-tight">
                  {stats.totalInvestors.toLocaleString()}+
                </span>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active Investors
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-bold font-display text-brand-success tracking-tight">
                  ${(stats.totalWithdrawals / 1000000).toFixed(2)}M
                </span>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Withdrawn Securely
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-bold font-display text-brand-accent tracking-tight">
                  {stats.countriesCount}+
                </span>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Countries Served
                </p>
              </div>
            </motion.div>
          </div>

          {/* Dynamic Returns Calculator Widget & Right Side */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 w-full glass-card p-6 sm:p-8 rounded-3xl border border-white/8 glow-blue relative overflow-hidden"
          >
            {/* Soft decorative glow behind */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-secondary/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider text-brand-secondary uppercase">
                  Interactive Widget
                </span>
                <h3 className="text-lg font-bold font-display text-white">
                  ROI Profit Estimator
                </h3>
              </div>
            </div>

            <div className="space-y-5">
              {/* Amount slider / input */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-slate-400 font-medium">Investment Principal</label>
                  <span className="text-brand-secondary font-mono font-bold">
                    ${calcAmount.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="50000"
                  step="50"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Min: $100</span>
                  <span>Max: $50,000</span>
                </div>
              </div>

              {/* Package selector */}
              <div className="space-y-2">
                <label className="text-sm text-slate-400 font-medium">Select Growth Plan</label>
                <div className="grid grid-cols-3 gap-2">
                  {plans.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`py-2 px-1 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                        selectedPlanId === p.id
                          ? "bg-brand-primary/15 border-brand-primary text-white shadow-md shadow-brand-primary/10"
                          : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/8"
                      }`}
                    >
                      <span className="block truncate">{p.title.split(" ")[0]}</span>
                      <span className="text-[10px] text-brand-secondary block font-mono">
                        {p.roiPercentage}%/d
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculations results */}
              {selectedPlan && (
                <div className="p-4 bg-brand-bg/60 border border-white/5 rounded-2xl space-y-4">
                  <div className="grid grid-cols-2 gap-4 divide-x divide-white/5">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">
                        Daily Payout
                      </span>
                      <span className="text-xl font-bold text-white font-mono">
                        ${results.daily.toFixed(2)}
                      </span>
                    </div>
                    <div className="pl-4">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">
                        Net Profit
                      </span>
                      <span className="text-xl font-bold text-brand-success font-mono">
                        +${results.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex justify-between items-center text-xs text-slate-400">
                    <span>
                      Duration: <strong className="text-white">{selectedPlan.durationDays} Days</strong>
                    </span>
                    <span>
                      Yield: <strong className="text-brand-secondary">+{results.percentage.toFixed(0)}%</strong>
                    </span>
                    <span>
                      Capital: <strong className="text-brand-success">Returned</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Interactive summary and call to action */}
              <button
                onClick={onOpenAuth}
                className="w-full h-12 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary hover:to-brand-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-primary/20 hover:scale-[1.01] transition-all"
              >
                <span>Invest ${calcAmount.toLocaleString()} Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
