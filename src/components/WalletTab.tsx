/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Wallet, ArrowUpRight, ArrowDownLeft, Landmark, Send, Info, Check, AlertTriangle, ShieldCheck, QrCode, Coins, Copy, Sparkles, Shield, ExternalLink, RefreshCw, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  referenceNo: string;
  type: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: string;
  description: string;
  createdAt: string;
}

interface WalletTabProps {
  wallet: any;
  transactions: Transaction[];
  onDepositSubmit: (amount: number, method: string, ref: string) => Promise<boolean>;
  onWithdrawSubmit: (amount: number, method: string, bankAcc: string) => Promise<boolean>;
}

export function WalletTab({ wallet, transactions, onDepositSubmit, onWithdrawSubmit }: WalletTabProps) {
  const [activeForm, setActiveForm] = useState<"deposit" | "withdraw" | null>("deposit");

  // Form states
  const [depositAmount, setDepositAmount] = useState("");
  const [depositRef, setDepositRef] = useState("");
  const [depositMethod, setDepositMethod] = useState("UPI Pay");
  const [depositError, setDepositError] = useState("");
  const [depositSuccess, setDepositSuccess] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("Bank Account");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // GPay component dynamic helpers
  const [copied, setCopied] = useState(false);
  const [isGeneratingRef, setIsGeneratingRef] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const autoGenerateRef = () => {
    setIsGeneratingRef(true);
    setTimeout(() => {
      const generatedRef = "UTR-" + Math.floor(100000000000 + Math.random() * 900000000000).toString();
      setDepositRef(generatedRef);
      setIsGeneratingRef(false);
    }, 400);
  };

  const availableBalance = wallet ? wallet.balance : 0;
  const lockedBalance = wallet ? wallet.lockedBalance : 0;
  const totalDeposit = wallet ? wallet.totalDeposit : 0;
  const totalWithdraw = wallet ? wallet.totalWithdraw : 0;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || isNaN(Number(depositAmount)) || parseFloat(depositAmount) <= 0) {
      setDepositError("Please enter a valid deposit amount.");
      return;
    }

    const amt = parseFloat(depositAmount);
    setDepositError("");
    setIsSubmitting(true);

    try {
      const success = await onDepositSubmit(amt, depositMethod, depositRef);
      if (success) {
        setDepositSuccess(true);
        setDepositAmount("");
        setDepositRef("");
        setTimeout(() => setDepositSuccess(false), 5000);
      } else {
        setDepositError("Deposit submission failed.");
      }
    } catch (err) {
      setDepositError("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || parseFloat(withdrawAmount) <= 0) {
      setWithdrawError("Please enter a valid withdrawal amount.");
      return;
    }

    const amt = parseFloat(withdrawAmount);

    if (amt < 20) {
      setWithdrawError("Minimum withdrawal limit is $20.00");
      return;
    }

    if (availableBalance < amt) {
      setWithdrawError("Insufficient available balance.");
      return;
    }

    if (!withdrawAccount) {
      setWithdrawError("Please specify recipient Bank Account or UPI ID.");
      return;
    }

    setWithdrawError("");
    setIsSubmitting(true);

    try {
      const success = await onWithdrawSubmit(amt, withdrawMethod, withdrawAccount);
      if (success) {
        setWithdrawSuccess(true);
        setWithdrawAmount("");
        setWithdrawAccount("");
        setTimeout(() => setWithdrawSuccess(false), 5000);
      } else {
        setWithdrawError("Withdrawal submission failed.");
      }
    } catch (err) {
      setWithdrawError("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h2 className="text-2xl font-bold font-display text-white">
          Secure Capital Operations
        </h2>
        <p className="text-slate-400 text-xs">
          Manage your cash reserves. Deposit funds to trade, or withdraw dynamic profits.
        </p>
      </div>

      {/* 2. OVERVIEW STATS BOX */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Available Balance</span>
          <span className="text-xl font-bold block font-mono text-white mt-1">${availableBalance.toFixed(2)}</span>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">In Staking Lockup</span>
          <span className="text-xl font-bold block font-mono text-slate-400 mt-1">${lockedBalance.toFixed(2)}</span>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Deposits</span>
          <span className="text-xl font-bold block font-mono text-brand-success mt-1">${totalDeposit.toFixed(2)}</span>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Withdrawals</span>
          <span className="text-xl font-bold block font-mono text-slate-400 mt-1">${totalWithdraw.toFixed(2)}</span>
        </div>
      </div>

      {/* 3. OPERATIONS INTERACTIVE FORM CONSOLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 glass-card p-6 rounded-2xl space-y-5">
          {/* Tabs for Deposit vs Withdraw */}
          <div className="flex border-b border-white/5 pb-2">
            <button
              onClick={() => {
                setActiveForm("deposit");
                setDepositError("");
                setWithdrawError("");
              }}
              className={`pb-2.5 px-4 font-bold text-sm flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeForm === "deposit"
                  ? "border-brand-primary text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-brand-success" />
              <span>Deposit Capital</span>
            </button>
            <button
              onClick={() => {
                setActiveForm("withdraw");
                setDepositError("");
                setWithdrawError("");
              }}
              className={`pb-2.5 px-4 font-bold text-sm flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeForm === "withdraw"
                  ? "border-brand-primary text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-brand-primary" />
              <span>Request Withdrawal</span>
            </button>
          </div>

          {activeForm === "deposit" ? (
            /* DEPOSIT CHANNEL */
            <form onSubmit={handleDeposit} className="space-y-4">
              {depositError && (
                <div className="p-3 bg-brand-danger/10 border border-brand-danger/20 rounded-xl text-brand-danger text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{depositError}</span>
                </div>
              )}

              {depositSuccess && (
                <div className="p-3 bg-brand-success/10 border border-brand-success/20 rounded-xl text-brand-success text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Deposit submitted! Please switch to Admin view to approve it.</span>
                </div>
              )}

              {/* Secure mockup deposit details instructions */}
              {depositMethod === "UPI Pay" ? (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="p-5 bg-white/3 border border-white/5 rounded-2xl text-xs space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2 text-brand-secondary font-bold">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span>Google Pay Gateway</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-medium">Instant Verification</span>
                  </div>

                  {/* Premium GPay-Inspired Mobile Checkout Canvas */}
                  <div className="flex flex-col items-center justify-center p-6 bg-[#f4f7fc] rounded-[24px] shadow-2xl max-w-sm mx-auto space-y-5 border border-slate-200">
                    
                    {/* Brand Identifier (Contact Name) */}
                    <div className="flex items-center gap-3 w-full px-2 text-slate-800">
                      <div className="w-11 h-11 rounded-full bg-[#c2185b] text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-white shrink-0">
                        J
                      </div>
                      <div className="text-left leading-tight">
                        <div className="flex items-center gap-1">
                          <span className="font-extrabold text-sm tracking-wide text-slate-900 font-sans uppercase">JINWOO SUNG</span>
                          <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold shadow-sm" title="Verified UPI Merchant">✓</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">jinwoosung.jg@oksbi</span>
                      </div>
                    </div>

                    {/* Dynamic Amount Indicator inside Card */}
                    {depositAmount && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center w-full bg-white/80 backdrop-blur p-3 rounded-2xl border border-slate-200/60 shadow-sm"
                      >
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Requested Deposit</span>
                        <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
                          ₹{Number(depositAmount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                      </motion.div>
                    )}

                    {/* QR Code Card with Rounded Corners */}
                    <div className="w-full bg-white rounded-[24px] p-5 shadow-lg border border-slate-100 flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
                      {/* Ambient background decoration */}
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500" />

                      {/* QR Code with absolute centered Google logo badge */}
                      <div className="relative p-2.5 bg-white rounded-2xl border border-slate-100 flex items-center justify-center mt-2 group">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=0&data=${encodeURIComponent(`upi://pay?pa=jinwoosung.jg@oksbi&pn=JINWOO SUNG${depositAmount ? `&am=${depositAmount}&cu=INR` : ""}`)}`} 
                          alt="JINWOO SUNG UPI QR Code" 
                          className="w-48 h-48 block rounded-lg select-none transition-transform duration-300 group-hover:scale-[1.02]"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Perfect GPay Center Icon Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-10 h-10 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center p-2.5">
                            <svg viewBox="0 0 24 24" className="w-full h-full">
                              <path d="M21.35 11.1H12v2.7h5.38c-.24 1.28-.96 2.37-2.05 3.1v2.57h3.3c1.93-1.78 3.04-4.4 3.04-7.48 0-.66-.06-1.29-.17-1.89z" fill="#4285F4" />
                              <path d="M12 21c2.43 0 4.47-.8 5.96-2.18l-3.3-2.57c-.9.6-2.07.97-3.66.97-2.82 0-5.22-1.9-6.08-4.47H1.53v2.66C3.01 18.57 7.18 21 12 21z" fill="#34A853" />
                              <path d="M5.92 12.75c-.22-.66-.35-1.37-.35-2.1s.13-1.44.35-2.1V5.89H1.53C.56 7.82 0 10 0 12.35s.56 4.53 1.53 6.46l4.39-3.41c-.22-.67-.35-1.37-.35-2.1z" fill="#FBBC05" />
                              <path d="M12 5.3c1.62 0 3.08.56 4.22 1.66l3.15-3.15C17.46 2.09 14.97 1 12 1 7.18 1 3.01 3.43 1.53 6.46l4.39 3.41c.86-2.57 3.26-4.47 6.08-4.47z" fill="#EA4335" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Display UPI ID inside Card */}
                      <div className="text-center w-full space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Receiver UPI ID</span>
                        <div className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-mono text-xs text-slate-700">
                          <span>jinwoosung.jg@oksbi</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard("jinwoosung.jg@oksbi")}
                            className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Copy UPI ID"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Scan footer */}
                    <div className="text-center flex flex-col items-center justify-center space-y-1">
                      <span className="text-[11px] font-medium text-slate-500 tracking-wide">
                        Scan to pay with any UPI app
                      </span>
                      <div className="flex items-center gap-2 pt-1 opacity-60">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">BHIM • GPAY • PHONEPE • PAYTM</span>
                      </div>
                    </div>
                  </div>

                  {/* Sandbox helpers and quick simulation features */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="text-slate-400 text-[11px] space-y-0.5">
                      <span className="text-brand-secondary font-bold block">Sandbox Dev Assistant:</span>
                      <p>Need a mockup transaction code to test immediately?</p>
                    </div>
                    <button
                      type="button"
                      disabled={isGeneratingRef}
                      onClick={autoGenerateRef}
                      className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-lg border border-blue-500/20 transition-all flex items-center gap-1 cursor-pointer select-none"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isGeneratingRef ? "Generating..." : "⚡ Autofill Mock UTR"}</span>
                    </button>
                  </div>

                  <p className="text-slate-400 text-center text-[11px] leading-relaxed">
                    Once paid, please enter your Transaction UTR / Ref No below. Our audit system will instantly verify it.
                  </p>
                </motion.div>
              ) : (
                /* USDT TRC20 Wallet default fallback */
                <div className="p-4 bg-white/3 border border-white/5 rounded-xl text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-brand-secondary font-bold">
                      <Coins className="w-4 h-4 text-emerald-400" />
                      <span>USDT TRC-20 Wallet</span>
                    </div>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-mono">Network: TRC20</span>
                  </div>
                  <p className="text-slate-400">
                    Send USDT over the Tron Network to our official deposit wallet address. Make sure the network is strictly TRC20.
                  </p>
                  
                  <div className="flex flex-col items-center justify-center p-3 bg-white/5 border border-white/10 rounded-xl space-y-3">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=5&data=TY3xZ8g8VvN6fJpY8rGZfP1F7pY8rGZfP1" 
                      alt="USDT QR Code" 
                      className="w-32 h-32 rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                    <div className="w-full text-center space-y-1">
                      <span className="text-[9px] text-slate-500 block uppercase tracking-wider">TRC20 Wallet Address</span>
                      <div className="flex items-center justify-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                        <code className="text-slate-300 text-[10px] select-all break-all">TY3xZ8g8VvN6fJpY8rGZfP1F7pY8rGZfP1</code>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Deposit Amount ($)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary text-sm font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Payment Method
                    </label>
                    <select
                      value={depositMethod}
                      onChange={(e) => setDepositMethod(e.target.value)}
                      className="w-full h-11 px-4 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-primary text-sm"
                    >
                      <option value="UPI Pay">UPI Quick Pay</option>
                      <option value="USDT TRC20">USDT Stablecoin (TRC20)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Transaction Reference No / Bank Proof Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TXN1029381923"
                    value={depositRef}
                    onChange={(e) => setDepositRef(e.target.value)}
                    className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary text-sm font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !depositAmount || !depositRef}
                  className="w-full h-12 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Transmitting Deposit..." : "Notify Platform compliance"}</span>
                </button>
              </div>
            </form>
          ) : (
            /* WITHDRAWAL CHANNEL */
            <form onSubmit={handleWithdraw} className="space-y-4">
              {withdrawError && (
                <div className="p-3 bg-brand-danger/10 border border-brand-danger/20 rounded-xl text-brand-danger text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{withdrawError}</span>
                </div>
              )}

              {withdrawSuccess && (
                <div className="p-3 bg-brand-success/10 border border-brand-success/20 rounded-xl text-brand-success text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Withdrawal requested successfully! Switch to Admin Panel to approve the payment.</span>
                </div>
              )}

              <div className="p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-xl text-xs space-y-2 text-slate-300">
                <div className="flex items-center gap-2 text-brand-primary font-bold">
                  <Info className="w-4 h-4" />
                  <span>Withdrawal Rules & compliance</span>
                </div>
                <p>
                  Minimum withdrawal is $20.00. Processing fee is 2.0% for blockchain/banking operations. KYC must be approved (or you can self-approve as admin in sandbox).
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Withdraw Amount ($)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 100"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary text-sm font-mono"
                      required
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                      Fee (2%): ${withdrawAmount ? (parseFloat(withdrawAmount) * 0.02).toFixed(2) : "0.00"}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Payout Destination
                    </label>
                    <select
                      value={withdrawMethod}
                      onChange={(e) => setWithdrawMethod(e.target.value)}
                      className="w-full h-11 px-4 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-primary text-sm"
                    >
                      <option value="Bank Account">Direct Bank Transfer</option>
                      <option value="UPI Channel">UPI Mobile Payment</option>
                      <option value="USDT TRC20 Wallet">Crypto Wallet (USDT TRC20)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Your IBAN, Account No or UPI ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CH39 2039 1239 4910 23"
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                    className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary text-sm font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !withdrawAmount || !withdrawAccount}
                  className="w-full h-12 bg-gradient-to-r from-[#FF4D67] to-red-600 hover:from-brand-danger hover:to-red-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Transmitting request..." : "Request secure withdrawal"}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 3. PLATFORM INTEGRITY CAPABILITIES */}
        <div className="lg:col-span-5 glass-card p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-brand-secondary" />
              <span>Capital Reserve Guarantee</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every client deposit is insured by WealthGlow Swiss Reserve Vault. Audited under regulatory supervision.
            </p>
          </div>

          <div className="p-4 bg-brand-bg/60 border border-white/5 rounded-xl space-y-3.5 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Check className="w-4 h-4 text-brand-success" />
              <span>1:1 liquidity backing</span>
            </div>
            <div className="flex items-center gap-2 text-white font-semibold">
              <Check className="w-4 h-4 text-brand-success" />
              <span>TLS 1.3 Bank-grade encryption</span>
            </div>
            <div className="flex items-center gap-2 text-white font-semibold">
              <Check className="w-4 h-4 text-brand-success" />
              <span>Audited Reserves by Zurich Bureau</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TRANSACTION HISTORY DATABASE */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Wallet className="w-4 h-4 text-brand-primary" />
          <span>Core Transaction Ledger</span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Your transaction database is empty. Once you make deposits or earn daily ROI, details will be listed here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3">Reference No</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Description</th>
                  <th className="py-3">Gross Amount</th>
                  <th className="py-3">Net Processed</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Date / Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {transactions.map((tx) => {
                  const isPositive = ["DEPOSIT", "ROI", "REFERRAL", "BONUS"].includes(tx.type);
                  return (
                    <tr key={tx.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-4 font-semibold text-white font-mono">{tx.referenceNo}</td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${
                          tx.type === "DEPOSIT" ? "bg-brand-success/15 text-brand-success" :
                          tx.type === "WITHDRAWAL" ? "bg-brand-danger/15 text-brand-danger" :
                          tx.type === "INVESTMENT" ? "bg-brand-primary/15 text-brand-primary" :
                          "bg-brand-accent/15 text-brand-accent"
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-4 font-medium text-slate-400 truncate max-w-xs">{tx.description}</td>
                      <td className={`py-4 font-bold font-mono ${isPositive ? "text-brand-success" : "text-white"}`}>
                        {isPositive ? "+" : "-"}${tx.amount.toFixed(2)}
                      </td>
                      <td className={`py-4 font-bold font-mono ${isPositive ? "text-brand-success" : "text-white"}`}>
                        {isPositive ? "+" : "-"}${tx.netAmount.toFixed(2)}
                      </td>
                      <td className="py-4">
                        <span className={`text-[10px] font-bold ${
                          tx.status === "COMPLETED" ? "text-brand-success" :
                          tx.status === "PENDING" ? "text-brand-warning animate-pulse" :
                          "text-brand-danger"
                        }`}>
                          ● {tx.status}
                        </span>
                      </td>
                      <td className="py-4 text-right font-mono text-slate-500">
                        {new Date(tx.createdAt).toLocaleString()}
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
