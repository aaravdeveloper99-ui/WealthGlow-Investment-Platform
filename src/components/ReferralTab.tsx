/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Users, Copy, Check, QrCode, Sparkles, Network, Trophy, Coins, UserCheck } from "lucide-react";

interface RefereeNode {
  userId: string;
  fullName: string;
  email: string;
  level: number;
  joinDate: string;
  investmentVolume: number;
}

interface Commission {
  id: string;
  sponsorId: string;
  refereeId: string;
  refereeName: string;
  investmentId: string;
  amount: number;
  level: number;
  createdAt: string;
}

interface ReferralTabProps {
  referralCode: string;
  referralsCount: number;
  totalCommissions: number;
  tree: RefereeNode[];
  commissions: Commission[];
}

export function ReferralTab({ referralCode, referralsCount, totalCommissions, tree, commissions }: ReferralTabProps) {
  const [copied, setCopied] = useState(false);

  // Derive invite link
  const inviteLink = `${window.location.origin}/?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Group referees by level
  const level1 = tree.filter((t) => t.level === 1);
  const level2 = tree.filter((t) => t.level === 2);
  const level3 = tree.filter((t) => t.level === 3);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h2 className="text-2xl font-bold font-display text-white">
          Affiliate & Sponsor Network
        </h2>
        <p className="text-slate-400 text-xs">
          Grow your downline, track active volumes, and accumulate commissions across 3 vertical sponsor tiers.
        </p>
      </div>

      {/* 2. REFERRAL LINK SHARE PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sharing controls */}
        <div className="lg:col-span-8 glass-card p-6 rounded-2xl space-y-5 relative overflow-hidden">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2 text-brand-secondary font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>My Affiliate Links & QR Terminal</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                My Unique Referral Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralCode}
                  className="h-12 flex-1 px-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold font-mono text-center tracking-widest text-lg"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Sponsor Referral Invite Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="h-12 flex-1 px-4 bg-white/5 border border-white/10 rounded-xl text-slate-400 focus:outline-none text-xs font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="w-14 h-12 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-white flex items-center justify-center cursor-pointer transition-all"
                >
                  {copied ? <Check className="w-5 h-5 text-brand-success" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Micro warning */}
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <span>*Commision payouts are processed instantly when downlines activate any Staking Pool package.</span>
            </p>
          </div>
        </div>

        {/* Shareable QR card */}
        <div className="lg:col-span-4 glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
          <QrCode className="w-24 h-24 text-brand-secondary p-1 border border-white/10 rounded-xl bg-white/3" />
          <div>
            <span className="text-[10px] text-slate-500 font-mono">SCAN TO SPONSOR</span>
            <h4 className="text-xs font-bold text-slate-300 font-display mt-0.5">Secure QR Onboarding</h4>
          </div>
        </div>
      </div>

      {/* 3. MULTI-LEVEL SPONSOR TIER CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Level 1 */}
        <div className="glass-card p-5 rounded-2xl space-y-3 border-l-4 border-l-brand-primary">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Level 1 (Direct)</span>
            <span className="text-[10px] font-extrabold text-brand-primary px-2 py-0.5 bg-brand-primary/10 rounded-full">10% Payout</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div>
              <span className="text-[10px] text-slate-500 block">Total downlines</span>
              <strong className="text-lg font-bold font-mono text-white">{level1.length}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Active Volume</span>
              <strong className="text-lg font-bold font-mono text-brand-secondary">
                ${level1.reduce((sum, n) => sum + n.investmentVolume, 0).toLocaleString()}
              </strong>
            </div>
          </div>
        </div>

        {/* Level 2 */}
        <div className="glass-card p-5 rounded-2xl space-y-3 border-l-4 border-l-brand-secondary">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Level 2 (Tier 2)</span>
            <span className="text-[10px] font-extrabold text-brand-secondary px-2 py-0.5 bg-brand-secondary/10 rounded-full">5% Payout</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div>
              <span className="text-[10px] text-slate-500 block">Total downlines</span>
              <strong className="text-lg font-bold font-mono text-white">{level2.length}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Active Volume</span>
              <strong className="text-lg font-bold font-mono text-brand-secondary">
                ${level2.reduce((sum, n) => sum + n.investmentVolume, 0).toLocaleString()}
              </strong>
            </div>
          </div>
        </div>

        {/* Level 3 */}
        <div className="glass-card p-5 rounded-2xl space-y-3 border-l-4 border-l-brand-accent">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Level 3 (Tier 3)</span>
            <span className="text-[10px] font-extrabold text-brand-accent px-2 py-0.5 bg-brand-accent/10 rounded-full">2% Payout</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div>
              <span className="text-[10px] text-slate-500 block">Total downlines</span>
              <strong className="text-lg font-bold font-mono text-white">{level3.length}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Active Volume</span>
              <strong className="text-lg font-bold font-mono text-brand-secondary">
                ${level3.reduce((sum, n) => sum + n.investmentVolume, 0).toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DOWNLINE TREE MEMBERS DIRECTORY */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Network className="w-4 h-4 text-brand-primary" />
            <span>Downline Network Directory</span>
          </div>
          <span className="text-xs text-slate-400">Total Referrals: <strong className="text-white">{tree.length}</strong></span>
        </div>

        {tree.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Your affiliate network is currently empty. Copy your invite link and share it with referees to build your passive income stream!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3">Member Name</th>
                  <th className="py-3">Level Tier</th>
                  <th className="py-3">Active Investments</th>
                  <th className="py-3 text-right">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {tree.map((node) => (
                  <tr key={node.userId} className="hover:bg-white/2 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                          {node.fullName[0].toUpperCase()}
                        </div>
                        <div>
                          <strong className="text-white block">{node.fullName}</strong>
                          <span className="text-[10px] text-slate-500 font-mono block">{node.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        node.level === 1 ? "bg-brand-primary/15 text-brand-primary" :
                        node.level === 2 ? "bg-brand-secondary/15 text-brand-secondary" :
                        "bg-brand-accent/15 text-brand-accent"
                      }`}>
                        Level {node.level}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold font-mono text-white">
                      ${node.investmentVolume.toFixed(2)}
                    </td>
                    <td className="py-3.5 text-right font-mono text-slate-500">
                      {new Date(node.joinDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. COMMISSION LOGS RECEIVED */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Coins className="w-4 h-4 text-brand-secondary" />
          <span>Sponsor Commission Ledgers</span>
        </div>

        {commissions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No affiliate commissions accrued yet. Earn cash bonuses as soon as your downlines secure standard yield packs.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3">Commission ID</th>
                  <th className="py-3">Referee Source</th>
                  <th className="py-3">Level</th>
                  <th className="py-3">Bonus Earned</th>
                  <th className="py-3 text-right">Credited On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {commissions.map((comm) => (
                  <tr key={comm.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-3.5 font-semibold font-mono text-white">{comm.id}</td>
                    <td className="py-3.5 font-semibold text-slate-300">{comm.refereeName}</td>
                    <td className="py-3.5">
                      <span className="font-semibold text-slate-400">Level {comm.level}</span>
                    </td>
                    <td className="py-3.5 text-brand-success font-bold font-mono">
                      +${comm.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 text-right font-mono text-slate-500">
                      {new Date(comm.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
