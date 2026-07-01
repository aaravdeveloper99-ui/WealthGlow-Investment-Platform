/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, Phone, User as UserIcon, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (token: string, userData: any, walletData: any) => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP Step simulation
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setReferralCode("");
    setError("");
    setOtpError("");
    setShowOtp(false);
    setIsRegister(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Invalid credentials");
      } else {
        onAuthSuccess(data.token, data.user, data.wallet);
        resetForm();
        onClose();
      }
    } catch (err) {
      setError("Server connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    setLoading(true);

    // Simulate OTP generation step first to build a beautiful fintech compliance trust flow!
    setTimeout(() => {
      setLoading(false);
      setShowOtp(true);
    }, 1000);
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const joinedOtp = otpCode.join("");
    if (joinedOtp.length < 6) {
      setOtpError("Please enter the complete 6-digit OTP.");
      return;
    }

    setOtpError("");
    setLoading(true);

    try {
      // Create user after OTP is successfully "verified"
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, password, referralCode }),
      });
      const data = await res.json();

      if (!data.success) {
        setOtpError(data.message || "Registration failed");
      } else {
        onAuthSuccess(data.token, data.user, data.wallet);
        resetForm();
        onClose();
      }
    } catch (err) {
      setOtpError("Failed to register. Server error.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otpCode];
    newOtp[index] = element.value;
    setOtpCode(newOtp);

    // Auto focus next input
    if (element.value !== "" && element.nextElementSibling) {
      (element.nextElementSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otpCode[index] && e.currentTarget.previousElementSibling) {
      (e.currentTarget.previousElementSibling as HTMLInputElement).focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-brand-bg/90 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative z-10 w-full max-w-md overflow-hidden glass-panel rounded-3xl glow-blue"
      >
        {/* Banner Glow Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent animate-pulse" />

        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-xs font-semibold tracking-wider text-brand-secondary uppercase">
                Secure Terminal
              </span>
              <h3 className="text-2xl font-bold font-display text-white mt-0.5">
                {showOtp ? "Verify OTP" : isRegister ? "Create Account" : "Welcome Back"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {showOtp ? (
              /* OTP VERIFICATION VIEW */
              <motion.form
                key="otp-form"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                onSubmit={handleOtpVerify}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="inline-flex p-3 bg-brand-warning/10 rounded-2xl text-brand-warning mb-2">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-slate-300">
                    We've simulated a secure verification OTP and sent it to <span className="font-semibold text-white">{email}</span>.
                  </p>
                  <p className="text-xs text-slate-400">
                    Enter any 6-digit code to complete verification (e.g. <span className="text-brand-warning font-mono">123456</span>)
                  </p>
                </div>

                <div className="flex justify-between gap-2 justify-center py-2">
                  {otpCode.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={data}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onFocus={(e) => e.target.select()}
                      className="w-12 h-12 text-center text-xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-warning focus:ring-1 focus:ring-brand-warning transition-all font-mono"
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-sm text-brand-danger text-center font-medium">
                    {otpError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-brand-warning to-orange-500 hover:from-brand-warning hover:to-orange-600 disabled:opacity-50 text-brand-bg font-semibold rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-warning/20 transition-all"
                >
                  {loading ? "Verifying Token..." : "Confirm & Access Dashboard"}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowOtp(false)}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    ← Back to Sign Up
                  </button>
                </div>
              </motion.form>
            ) : isRegister ? (
              /* REGISTRATION FORM */
              <motion.form
                key="register-form"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                onSubmit={handleRegisterSubmit}
                className="space-y-4"
              >
                {error && (
                  <div className="p-3 bg-brand-danger/10 border border-brand-danger/20 rounded-xl text-brand-danger text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Mobile Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Security Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Referral Sponsor Code (Optional)
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="WGADMIN"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-all text-sm uppercase"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-primary/20 transition-all"
                  >
                    {loading ? "Sending OTP..." : "Continue to Verify OTP"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-center text-xs text-slate-400 pt-2">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsRegister(false)}
                    className="font-semibold text-brand-secondary hover:underline"
                  >
                    Login here
                  </button>
                </p>
              </motion.form>
            ) : (
              /* LOGIN FORM */
              <motion.form
                key="login-form"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                onSubmit={handleLoginSubmit}
                className="space-y-5"
              >
                {error && (
                  <div className="p-3 bg-brand-danger/10 border border-brand-danger/20 rounded-xl text-brand-danger text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Security Password
                    </label>
                    <button
                      type="button"
                      onClick={() => alert("Simulated flow: Enter your standard email and credentials. Super Admin account is admin@wealthglow.com")}
                      className="text-xs font-semibold text-brand-primary hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-primary/20 transition-all"
                  >
                    {loading ? "Verifying..." : "Access secure terminal"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-center text-xs text-slate-400 pt-2">
                  Don't have an account yet?{" "}
                  <button
                    type="button"
                    onClick={() => setIsRegister(true)}
                    className="font-semibold text-brand-secondary hover:underline"
                  >
                    Create one now
                  </button>
                </p>

                <div className="pt-4 border-t border-white/5 text-center">
                  <span className="text-[10px] font-mono text-slate-500 block">
                    Secured by TLS 1.3 & AES-256
                  </span>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
