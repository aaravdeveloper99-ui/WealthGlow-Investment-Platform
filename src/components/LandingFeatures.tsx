/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Sparkles, RefreshCw, Layers, CheckCircle2, ChevronDown, MessageSquare, Send, Globe, Mail, MapPin } from "lucide-react";

interface Plan {
  id: string;
  title: string;
  minimumAmount: number;
  maximumAmount: number;
  roiPercentage: number;
  durationDays: number;
  capitalReturn: boolean;
}

interface LandingFeaturesProps {
  plans: Plan[];
  onOpenAuth: () => void;
}

export function LandingFeatures({ plans, onOpenAuth }: LandingFeaturesProps) {
  // FAQ state
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const faqs = [
    {
      q: "How does the daily payout system work?",
      a: "Every active plan yields daily ROI based on its terms (e.g., 1.5% to 4.0% daily). These returns are processed automatically, credited to your available wallet balance, and can be withdrawn or reinvested immediately without lockup.",
    },
    {
      q: "Is my capital secure?",
      a: "Absolutely. All deposits are backed 1:1 by audited liquidity pool reserves. We maintain a tier-1 reserve insurance fund (WealthGlow Shield) to guarantee 100% of retail investor principal against volatile market movements.",
    },
    {
      q: "What is the referral program structure?",
      a: "WealthGlow operates a high-payout 3-level referral affiliate system. You earn 10% commission on all direct Level 1 downline investments, 5% on Level 2 downlines, and 2% on Level 3 downlines. Rewards are credited instantly in withdrawable funds.",
    },
    {
      q: "What are the withdrawal limits and fees?",
      a: "The minimum withdrawal limit is $20.00. Withdrawal processing incurs a standard 2.0% compliance and transaction fee. Admin reviews are processed securely within 1 to 2 hours of submission.",
    },
    {
      q: "Is Identity Verification (KYC) mandatory?",
      a: "To comply with international Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) standards, we require a quick KYC identity verification (ID + Selfie) prior to initiating any withdrawal requests.",
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactName("");
      setContactEmail("");
      setContactMsg("");
      setContactSubmitted(false);
      alert("Message transmitted securely! Our premium support team will reply within 15 minutes.");
    }, 1500);
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. INVESTMENT PLANS SECTION */}
      <section id="plans" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center space-y-4 mb-14">
          <span className="text-xs font-bold tracking-widest text-brand-secondary uppercase">
            Audited Packages
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            Wealth & Growth Plans
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Choose a yield plan that matches your financial tier. All plans feature automated daily returns and capital insurance coverage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((p, idx) => {
            const isFeatured = idx === 1; // Highlight middle plan
            return (
              <motion.div
                key={p.id}
                whileHover={{ y: -5 }}
                className={`relative overflow-hidden rounded-3xl p-8 flex flex-col justify-between ${
                  isFeatured
                    ? "bg-brand-primary/10 border-2 border-brand-primary glow-blue"
                    : "glass-card"
                }`}
              >
                {/* Visual badge for featured middle plan */}
                {isFeatured && (
                  <span className="absolute top-4 right-4 py-1 px-3 rounded-full bg-brand-primary text-[10px] font-bold tracking-wider text-white uppercase animate-pulse">
                    Most Popular
                  </span>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold font-display text-slate-300">
                      {p.title}
                    </h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-extrabold font-display text-white">
                        {p.roiPercentage}%
                      </span>
                      <span className="text-sm font-semibold text-brand-secondary">Daily</span>
                    </div>
                  </div>

                  {/* Plan Specs List */}
                  <ul className="space-y-3.5 text-sm text-slate-300 border-t border-b border-white/5 py-6">
                    <li className="flex items-center justify-between">
                      <span className="text-slate-500">Minimum Principal</span>
                      <strong className="text-white font-mono">${p.minimumAmount.toLocaleString()}</strong>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-slate-500">Maximum Limit</span>
                      <strong className="text-white font-mono">${p.maximumAmount.toLocaleString()}</strong>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-slate-500">Maturity Duration</span>
                      <strong className="text-white font-mono">{p.durationDays} Days</strong>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-slate-500">Accrual Frequency</span>
                      <strong className="text-brand-secondary">Daily ROI</strong>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-slate-500">Capital Return</span>
                      <strong className="text-brand-success font-medium">100% Unlocked</strong>
                    </li>
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    onClick={onOpenAuth}
                    className={`w-full h-12 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                      isFeatured
                        ? "bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20"
                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    }`}
                  >
                    Select {p.title.split(" ")[0]} Plan
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 2. PLATFORM FEATURES & SECURITY GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-14">
          <span className="text-xs font-bold tracking-widest text-brand-secondary uppercase">
            Fintech Excellence
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            Designed For Supreme Trust
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-white">Audited reserves</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every deposit is cataloged in private ledgers backed by fully audited capital reserves, ensuring zero credit risk.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-white">High Yield Returns</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our automated liquid staking and arbitrage networks generate industry-leading safe returns up to 4.0% daily.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-white">Fast Withdrawals</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No long payout lockups. Withdraw your daily accumulated earnings instantly to any UPI, Bank Account or wallet.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-success/10 flex items-center justify-center text-brand-success">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-white">Tiered Commissions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Share the experience and build an affiliate network. Earn passive rewards up to 10% across three levels.
            </p>
          </div>
        </div>
      </section>

      {/* 3. 3-LEVEL REFERRAL AFFILIATE DISPLAY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-white/8">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <span className="text-xs font-bold tracking-widest text-brand-accent uppercase">
                Global Growth Network
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
                Multi-Level Referral Rewards
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Invite friends and affiliates to build a passive income downline network. You earn high-commission payouts on every plan purchase made by users you sponsor, calculated instantly across three distinct vertical tiers.
              </p>

              {/* Levels checkmark list */}
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-success" />
                  <span><strong>Level 1 (Direct Referee):</strong> 10% Commission on Plan Purchase</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-secondary" />
                  <span><strong>Level 2 (Secondary Referee):</strong> 5% Commission on Plan Purchase</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-accent" />
                  <span><strong>Level 3 (Tertiary Referee):</strong> 2% Commission on Plan Purchase</span>
                </div>
              </div>
            </div>

            {/* Visual Levels Display */}
            <div className="lg:col-span-6 flex justify-center py-4">
              <div className="w-full max-w-sm flex flex-col items-center gap-4 text-center">
                <div className="w-full p-4 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-white font-bold text-sm">
                  👑 You (Referral Captain)
                </div>
                <div className="w-0.5 h-6 bg-brand-primary/20" />
                <div className="w-full p-4 rounded-2xl bg-brand-secondary/10 border border-brand-secondary/20 text-white font-bold text-sm">
                  👥 Level 1 Sponsor Reward: 10%
                </div>
                <div className="w-0.5 h-6 bg-brand-secondary/20" />
                <div className="w-full p-4 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 text-white font-bold text-sm">
                  👥 Level 2 Sponsor Reward: 5%
                </div>
                <div className="w-0.5 h-6 bg-brand-accent/20" />
                <div className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-bold text-sm">
                  👥 Level 3 Sponsor Reward: 2%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DYNAMIC FAQ ACCORDION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="text-center space-y-4 mb-12">
          <span className="text-xs font-bold tracking-widest text-brand-secondary uppercase">
            Knowledge Base
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden border border-white/5 rounded-2xl bg-white/3 hover:bg-white/5 transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full py-5 px-6 flex justify-between items-center text-left text-white font-semibold cursor-pointer"
                >
                  <span className="font-display pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-brand-secondary transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-5 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. SECURE CONTACT FORM & SUPPORT */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold tracking-widest text-brand-secondary uppercase">
              24/7 Premium Support
            </span>
            <h2 className="text-3xl font-extrabold font-display text-white">
              Connect With WealthGlow Compliance
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed font-sans">
              Have questions regarding audited reserves, high-yield liquid arbitrary staking, large corporate deposits, or referral commission payouts? Reach out to our secure support terminal immediately.
            </p>

            <div className="space-y-4 text-sm text-slate-300 pt-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/5 text-brand-primary">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Headquarters</span>
                  <strong className="text-white">Zurich, Switzerland</strong>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/5 text-brand-secondary">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Direct Email</span>
                  <strong className="text-white">support@wealthglow.com</strong>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/5 text-brand-accent">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">compliance center</span>
                  <strong className="text-white">Fintech Tower Suite 402, Singapore</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Secure Contact Form */}
          <div className="lg:col-span-7">
            <div className="glass-card p-8 rounded-3xl border border-white/5">
              <div className="flex items-center gap-2 mb-6 text-brand-primary">
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs font-bold tracking-wider uppercase">
                  Encrypted Contact Channel
                </span>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Smith"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary transition-all text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Your Email
                    </label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Message Body
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter your inquiry..."
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary transition-all text-sm resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactSubmitted}
                  className="w-full h-12 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-primary/15 transition-all"
                >
                  {contactSubmitted ? "Transmitting..." : "Send Message Securely"}
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 pt-12 text-center text-xs text-slate-500 space-y-3">
        <p className="text-slate-400">
          © 2026 WealthGlow Global Wealth Management AG. All rights reserved.
        </p>
        <p className="max-w-2xl mx-auto px-4">
          Risk Warning: High-yield investment returns carry inherent risks. Past performance in staking arbitrage is not indicative of future yield trends. Backed by compliance reserves in accordance with regional AML policies.
        </p>
        <div className="flex justify-center gap-6 pt-2 text-slate-400">
          <a href="#plans" className="hover:underline">Terms of Service</a>
          <a href="#plans" className="hover:underline">Privacy Policy</a>
          <a href="#plans" className="hover:underline">Audits</a>
          <a href="#plans" className="hover:underline">Swiss Reserve Guard</a>
        </div>
      </footer>
    </div>
  );
}
