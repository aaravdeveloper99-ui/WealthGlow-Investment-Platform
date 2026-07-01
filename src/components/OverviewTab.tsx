/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Wallet, TrendingUp, Sparkles, Coins, ArrowUpRight, ArrowDownLeft, Landmark, RefreshCw } from "lucide-react";

interface OverviewTabProps {
  user: any;
  wallet: any;
  transactions: any[];
  investments: any[];
  onActionClick: (action: string) => void;
}

export function OverviewTab({ user, wallet, transactions, investments, onActionClick }: OverviewTabProps) {
  // Aggregate stats
  const availableBalance = wallet ? wallet.balance : 0;
  const lockedBalance = wallet ? wallet.lockedBalance : 0;
  const totalProfit = wallet ? wallet.totalProfit : 0;
  const totalBonus = wallet ? wallet.totalBonus : 0;
  const totalAssets = availableBalance + lockedBalance;

  // Render recent transactions (last 4)
  const recentTransactions = transactions.slice(0, 4);

  // Recharts Chart Mock Data representing secure compounding portfolio growth
  const chartData = [
    { day: "Day 0", Balance: totalAssets * 0.7 },
    { day: "Day 5", Balance: totalAssets * 0.78 },
    { day: "Day 10", Balance: totalAssets * 0.85 },
    { day: "Day 15", Balance: totalAssets * 0.9 },
    { day: "Day 20", Balance: totalAssets * 0.94 },
    { day: "Day 25", Balance: totalAssets * 0.98 },
    { day: "Today", Balance: totalAssets },
  ];

  // Pie chart asset distribution
  const assetData = [
    { name: "Available Cash", value: availableBalance },
    { name: "Active Investments", value: lockedBalance },
  ];
  const COLORS = ["#2D7FF9", "#00E5FF"];

  return (
    <div className="space-y-6">
      {/* 1. GREETING STATEMENT */}
      <div>
        <h2 className="text-2xl font-bold font-display text-white">
          Secure Capital Terminal
        </h2>
        <p className="text-slate-400 text-xs">
          Welcome back, <strong className="text-white">{user.fullName}</strong>. Live staking algorithms are running perfectly.
        </p>
      </div>

      {/* 2. STATS OVERVIEW CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallet Balance */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
                Available Wallet
              </span>
              <h3 className="text-2xl font-bold font-mono text-white">
                ${availableBalance.toFixed(2)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-4">
            Audited liquidity available for instant withdrawal
          </p>
        </div>

        {/* Locked Assets */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
                Active Investments
              </span>
              <h3 className="text-2xl font-bold font-mono text-white">
                ${lockedBalance.toFixed(2)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-brand-secondary/10 text-brand-secondary">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-4">
            Principal locked in daily compounding growth plans
          </p>
        </div>

        {/* Accumulated Profits */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
                Accrued ROI Profits
              </span>
              <h3 className="text-2xl font-bold font-mono text-brand-success">
                +${totalProfit.toFixed(4)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-brand-success/10 text-brand-success">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-4">
            Total gains processed from active staking packs
          </p>
        </div>

        {/* Referral Bonus */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
                Referral Commissions
              </span>
              <h3 className="text-2xl font-bold font-mono text-brand-accent">
                +${totalBonus.toFixed(2)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-brand-accent/10 text-brand-accent">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-4">
            Affiliate bonuses earned across 3 vertical tiers
          </p>
        </div>
      </div>

      {/* 3. QUICK ACTIONS RADAR */}
      <div className="p-4 bg-white/3 border border-white/5 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">
          ⚡ Quick Terminal Access
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onActionClick("deposit")}
            className="h-10 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-brand-primary/10 transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Deposit Capital</span>
          </button>
          <button
            onClick={() => onActionClick("invest")}
            className="h-10 px-4 rounded-xl bg-brand-secondary text-brand-bg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-brand-secondary/10 transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Invest in Yield Plan</span>
          </button>
          <button
            onClick={() => onActionClick("withdraw")}
            className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/5 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Withdraw Cash</span>
          </button>
        </div>
      </div>

      {/* 4. PERFORMANCE CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Growth Chart */}
        <div className="lg:col-span-8 glass-card p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Compounding Yield Trend
              </h3>
              <p className="text-xs text-slate-400">
                Visualizing total asset growth (cash + active investments)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
              <span>Total Assets: ${(totalAssets).toFixed(2)}</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D7FF9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2D7FF9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px" }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Area type="monotone" dataKey="Balance" stroke="#2D7FF9" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Allocation Donut Chart */}
        <div className="lg:col-span-4 glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white font-display">
              Asset Allocation
            </h3>
            <p className="text-xs text-slate-400">
              Distribution of your capital resources
            </p>
          </div>

          {totalAssets === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No active assets to plot
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {assetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-2 border-t border-white/5 pt-4 text-xs">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
                Available Cash
              </span>
              <span className="font-bold text-white font-mono">
                {totalAssets > 0 ? ((availableBalance / totalAssets) * 100).toFixed(0) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-secondary" />
                Locked Staking
              </span>
              <span className="font-bold text-white font-mono">
                {totalAssets > 0 ? ((lockedBalance / totalAssets) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. RECENT TRANSACTION LOGS */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-white font-display">
              Recent Activity Ledger
            </h3>
            <p className="text-xs text-slate-400">
              Overview of your latest system transactions
            </p>
          </div>
          <button
            onClick={() => onActionClick("history")}
            className="text-xs font-semibold text-brand-primary hover:underline transition-all cursor-pointer"
          >
            See full history →
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No transactions completed yet. Initiate a deposit to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3">Reference No</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {recentTransactions.map((tx) => {
                  const isPositive = ["DEPOSIT", "ROI", "REFERRAL", "BONUS"].includes(tx.type);
                  return (
                    <tr key={tx.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-3.5 font-semibold text-white font-mono">{tx.referenceNo}</td>
                      <td className="py-3.5 font-medium">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.type === "DEPOSIT" ? "bg-brand-success/15 text-brand-success" :
                          tx.type === "WITHDRAWAL" ? "bg-brand-danger/15 text-brand-danger" :
                          tx.type === "INVESTMENT" ? "bg-brand-primary/15 text-brand-primary" :
                          "bg-brand-accent/15 text-brand-accent"
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`py-3.5 font-bold font-mono ${isPositive ? "text-brand-success" : "text-white"}`}>
                        {isPositive ? "+" : "-"}${tx.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 font-semibold">
                        <span className={`text-[10px] uppercase ${
                          tx.status === "COMPLETED" ? "text-brand-success" :
                          tx.status === "PENDING" ? "text-brand-warning animate-pulse" :
                          "text-brand-danger"
                        }`}>
                          ● {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-mono text-slate-500">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
