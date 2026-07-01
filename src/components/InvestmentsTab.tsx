/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { TrendingUp, Coins, ShieldCheck, Play, Calculator, History, Check, AlertCircle } from "lucide-react";

interface Plan {
  id: string;
  title: string;
  minimumAmount: number;
  maximumAmount: number;
  roiPercentage: number;
  durationDays: number;
  capitalReturn: boolean;
}

interface Investment {
  id: string;
  userId: string;
  planId: string;
  planTitle: string;
  amount: number;
  expectedProfit: number;
  dailyRoi: number;
  returnsEarned: number;
  startDate: string;
  endDate: string;
  status: string;
}

interface InvestmentsTabProps {
  plans: Plan[];
  investments: Investment[];
  walletBalance: number;
  onPurchasePlan: (planId: string, amount: number) => Promise<boolean>;
}

export function InvestmentsTab({ plans, investments, walletBalance, onPurchasePlan }: InvestmentsTabProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>("plan-silver");
  const [investAmount, setInvestAmount] = useState<string>("");
  const [purchaseError, setPurchaseError] = useState("");
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter plans & investments
  const activeInvestments = investments.filter((i) => i.status === "ACTIVE");
  const completedInvestments = investments.filter((i) => i.status === "COMPLETED");

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investAmount || isNaN(Number(investAmount))) {
      setPurchaseError("Please enter a valid amount.");
      return;
    }

    const amountNum = parseFloat(investAmount);

    if (amountNum < selectedPlan.minimumAmount) {
      setPurchaseError(`Minimum investment for ${selectedPlan.title} is $${selectedPlan.minimumAmount}`);
      return;
    }
    if (amountNum > selectedPlan.maximumAmount) {
      setPurchaseError(`Maximum investment for ${selectedPlan.title} is $${selectedPlan.maximumAmount}`);
      return;
    }

    if (walletBalance < amountNum) {
      setPurchaseError(`Insufficient wallet balance. You need $${(amountNum - walletBalance).toFixed(2)} more cash in your available wallet.`);
      return;
    }

    setPurchaseError("");
    setIsSubmitting(true);

    try {
      const success = await onPurchasePlan(selectedPlan.id, amountNum);
      if (success) {
        setPurchaseSuccess(true);
        setInvestAmount("");
        setTimeout(() => setPurchaseSuccess(false), 5000);
      } else {
        setPurchaseError("Failed to purchase investment plan. Please try again.");
      }
    } catch (err) {
      setPurchaseError("Network error. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h2 className="text-2xl font-bold font-display text-white">
          Liquidity Staking Packages
        </h2>
        <p className="text-slate-400 text-xs">
          Deploy your assets in high-yield liquidity pools. Returns are paid out dynamically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2. PURCHASE PLAN INTERACTIVE CONSOLE */}
        <div className="lg:col-span-7 glass-card p-6 rounded-2xl space-y-5">
          <div className="flex items-center gap-2 text-brand-secondary font-bold text-xs uppercase tracking-wider">
            <Coins className="w-4 h-4" />
            <span>Investment Purchase Terminal</span>
          </div>

          <form onSubmit={handlePurchaseSubmit} className="space-y-5">
            {purchaseError && (
              <div className="p-3 bg-brand-danger/10 border border-brand-danger/20 rounded-xl text-brand-danger text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{purchaseError}</span>
              </div>
            )}

            {purchaseSuccess && (
              <div className="p-3 bg-brand-success/10 border border-brand-success/20 rounded-xl text-brand-success text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Investment active! Watch your returns compile live every 15 seconds.</span>
              </div>
            )}

            {/* Select plan */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Choose Staking Pool
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlanId(p.id);
                      setPurchaseError("");
                    }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPlanId === p.id
                        ? "bg-brand-primary/10 border-brand-primary text-white"
                        : "bg-white/3 border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-bold block">{p.title.split(" ")[0]}</span>
                    <span className="text-lg font-extrabold font-display text-white mt-1 block">
                      {p.roiPercentage}% <span className="text-xs font-normal text-slate-400">/day</span>
                    </span>
                    <span className="text-[10px] text-brand-secondary mt-1 block font-mono">
                      Term: {p.durationDays}d
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Plan Details box */}
            {selectedPlan && (
              <div className="p-4 bg-brand-bg/50 border border-white/5 rounded-xl text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Limits:</span>
                  <span className="font-bold text-white font-mono">
                    ${selectedPlan.minimumAmount.toLocaleString()} - ${selectedPlan.maximumAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Maturity Return:</span>
                  <span className="font-bold text-brand-success">
                    +{selectedPlan.roiPercentage * selectedPlan.durationDays}% Expected Yield
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Capital Protection:</span>
                  <span className="font-bold text-brand-secondary flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Checked (Zurich Audited)
                  </span>
                </div>
              </div>
            )}

            {/* Invest amount field */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label className="font-bold text-slate-400 uppercase tracking-widest">
                  Staking Amount ($)
                </label>
                <span className="text-slate-400">
                  Wallet Cash: <strong className="text-brand-secondary font-mono">${walletBalance.toFixed(2)}</strong>
                </span>
              </div>
              <input
                type="number"
                placeholder={`Min: $${selectedPlan?.minimumAmount || 100}`}
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary font-mono text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !investAmount}
              className="w-full h-12 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary hover:to-brand-primary/90 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-primary/15 transition-all"
            >
              <Play className="w-4 h-4" />
              <span>{isSubmitting ? "Activating Package..." : `Secure ${selectedPlan?.title} Contract`}</span>
            </button>
          </form>
        </div>

        {/* 3. ROI PLAN SPECIFICATIONS LIST/CALCULATOR SUMMARY */}
        <div className="lg:col-span-5 glass-card p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <Calculator className="w-4 h-4 text-brand-primary" />
              <span>Quick Yield Calculator</span>
            </h3>
            <p className="text-xs text-slate-400">
              Input hypothetical scenarios to review projected yields
            </p>
          </div>

          {/* Simple table calculation based on amount input */}
          <div className="p-4 bg-white/3 border border-white/5 rounded-xl space-y-4">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Invested capital</span>
              <span className="text-xl font-bold block text-white font-mono">
                ${investAmount ? parseFloat(investAmount).toLocaleString() : "1,000"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 divide-x divide-white/5 pt-2">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Accumulating Daily</span>
                <span className="text-lg font-bold block text-brand-secondary font-mono">
                  ${investAmount ? (parseFloat(investAmount) * (selectedPlan.roiPercentage / 100)).toFixed(2) : (1000 * (selectedPlan.roiPercentage / 100)).toFixed(2)}
                </span>
              </div>
              <div className="pl-4">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Expected profit</span>
                <span className="text-lg font-bold block text-brand-success font-mono">
                  ${investAmount ? (parseFloat(investAmount) * (selectedPlan.roiPercentage / 100) * selectedPlan.durationDays).toFixed(2) : (1000 * (selectedPlan.roiPercentage / 100) * selectedPlan.durationDays).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 pt-2 border-t border-white/5 text-center leading-relaxed">
              *Calculations are based on selected plan terms. Maturity payouts represent guaranteed daily yield accrual. Capital principal is unlocked on day {selectedPlan.durationDays}.
            </div>
          </div>
        </div>
      </div>

      {/* 4. ACTIVE INVESTMENTS LEDGER TABLE */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <TrendingUp className="w-4 h-4 text-brand-primary" />
          <span>Active Yield Contracts</span>
        </div>

        {activeInvestments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            You do not have any active investment contracts. Deposit funds and purchase a plan to begin earning.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3">Plan Package</th>
                  <th className="py-3">Staked Amount</th>
                  <th className="py-3">Daily ROI</th>
                  <th className="py-3">Returns Earned</th>
                  <th className="py-3">Target Payout</th>
                  <th className="py-3 text-right">Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {activeInvestments.map((inv) => {
                  const percentComplete = Math.min(100, (inv.returnsEarned / inv.expectedProfit) * 100);
                  return (
                    <tr key={inv.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-4">
                        <strong className="text-white block">{inv.planTitle}</strong>
                        <span className="text-[10px] text-slate-500 block">ID: {inv.id}</span>
                      </td>
                      <td className="py-4 font-bold font-mono text-white">${inv.amount.toFixed(2)}</td>
                      <td className="py-4 text-brand-secondary font-bold font-mono">+{inv.dailyRoi}%</td>
                      <td className="py-4 text-brand-success font-bold font-mono">
                        ${inv.returnsEarned.toFixed(4)}
                      </td>
                      <td className="py-4 font-mono text-slate-400">${inv.expectedProfit.toFixed(2)}</td>
                      <td className="py-4 text-right">
                        <div className="inline-flex flex-col items-end gap-1.5">
                          <span className="font-bold text-white font-mono">{percentComplete.toFixed(1)}%</span>
                          {/* Progress bar */}
                          <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-success transition-all duration-300"
                              style={{ width: `${percentComplete}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. COMPLETED CONTRACTS HISTORY */}
      {completedInvestments.length > 0 && (
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <History className="w-4 h-4 text-slate-400" />
            <span>Matured & Completed Contracts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3">Plan Title</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Total Gains</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Finished Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {completedInvestments.map((inv) => (
                  <tr key={inv.id} className="text-slate-400">
                    <td className="py-3">{inv.planTitle}</td>
                    <td className="py-3 font-mono text-white">${inv.amount.toFixed(2)}</td>
                    <td className="py-3 font-mono text-brand-success">+${inv.expectedProfit.toFixed(2)}</td>
                    <td className="py-3">
                      <span className="text-[10px] text-brand-success font-semibold uppercase">
                        ● MATURED
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-slate-500">
                      {new Date(inv.endDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
