/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Landmark, ShieldCheck, Check, AlertTriangle, UserCheck, Smartphone, Mail, FileText } from "lucide-react";

interface ProfileTabProps {
  user: any;
  onUpdateProfile: (data: any) => Promise<boolean>;
  onUpdateBankDetails: (data: any) => Promise<boolean>;
  onSubmitKYC: (data: any) => Promise<boolean>;
}

export function ProfileTab({ user, onUpdateProfile, onUpdateBankDetails, onSubmitKYC }: ProfileTabProps) {
  // Personal Info form
  const [fullName, setFullName] = useState(user.fullName || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Bank Info form
  const [bankName, setBankName] = useState(user.bankDetails?.bankName || "");
  const [accountNumber, setAccountNumber] = useState(user.bankDetails?.accountNumber || "");
  const [accountHolderName, setAccountHolderName] = useState(user.bankDetails?.accountHolderName || "");
  const [ifscCode, setIfscCode] = useState(user.bankDetails?.ifscCode || "");
  const [upiId, setUpiId] = useState(user.bankDetails?.upiId || "");
  const [bankSuccess, setBankSuccess] = useState(false);
  const [bankError, setBankError] = useState("");

  // KYC form
  const [documentType, setDocumentType] = useState("National ID");
  const [documentNumber, setDocumentNumber] = useState("");
  const [kycSuccess, setKycSuccess] = useState(false);
  const [kycError, setKycError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      setProfileError("Full Name and Phone are required.");
      return;
    }

    setProfileError("");
    setIsSubmitting(true);

    try {
      const success = await onUpdateProfile({ fullName, phone });
      if (success) {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      } else {
        setProfileError("Failed to update profile details.");
      }
    } catch (err) {
      setProfileError("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !accountNumber || !accountHolderName || !ifscCode) {
      setBankError("Bank Name, Account Number, Holder Name, and IFSC code are required.");
      return;
    }

    setBankError("");
    setIsSubmitting(true);

    try {
      const success = await onUpdateBankDetails({ bankName, accountNumber, accountHolderName, ifscCode, upiId });
      if (success) {
        setBankSuccess(true);
        setTimeout(() => setBankSuccess(false), 3000);
      } else {
        setBankError("Failed to save banking records.");
      }
    } catch (err) {
      setBankError("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentNumber) {
      setKycError("Please specify document identification number.");
      return;
    }

    setKycError("");
    setIsSubmitting(true);

    try {
      const success = await onSubmitKYC({ documentType, documentNumber });
      if (success) {
        setKycSuccess(true);
        setTimeout(() => setKycSuccess(false), 5000);
      } else {
        setKycError("Identity upload failed.");
      }
    } catch (err) {
      setKycError("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h2 className="text-2xl font-bold font-display text-white">
          Secure Identity Terminal
        </h2>
        <p className="text-slate-400 text-xs">
          Manage your personal details, secure your bank payout routes, and process KYC compliance verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2. PERSONAL INFORMATION FORM */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2 border-b border-white/5 pb-3">
              <User className="w-4.5 h-4.5 text-brand-primary" />
              <span>Personal Details</span>
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {profileError && (
                <div className="p-3 bg-brand-danger/10 border border-brand-danger/20 rounded-xl text-brand-danger text-xs font-semibold">
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div className="p-3 bg-brand-success/10 border border-brand-success/20 rounded-xl text-brand-success text-xs font-semibold">
                  Profile updated successfully.
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Full Name / Legal Identity
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Email Address (Immutable)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full h-11 px-4 bg-white/2 border border-white/5 rounded-xl text-slate-500 text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Mobile Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold text-xs rounded-xl flex items-center justify-center cursor-pointer transition-all"
              >
                {isSubmitting ? "Updating..." : "Save personal settings"}
              </button>
            </form>
          </div>

          {/* 3. WITHDRAWAL BANK DETAILS RECORD */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2 border-b border-white/5 pb-3">
              <Landmark className="w-4.5 h-4.5 text-brand-secondary" />
              <span>SaaS Withdrawal Route</span>
            </h3>

            <form onSubmit={handleBankSubmit} className="space-y-4">
              {bankError && (
                <div className="p-3 bg-brand-danger/10 border border-brand-danger/20 rounded-xl text-brand-danger text-xs font-semibold">
                  {bankError}
                </div>
              )}

              {bankSuccess && (
                <div className="p-3 bg-brand-success/10 border border-brand-success/20 rounded-xl text-brand-success text-xs font-semibold">
                  Banking details registered successfully.
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Zuger Kantonalbank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    IFSC / SWIFT Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ZUGBCH22"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Legal Name of User"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  IBAN / Account Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. CH83 0084 1029 3819 00"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  UPI ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. myname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-mono text-slate-300"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold text-xs rounded-xl flex items-center justify-center cursor-pointer transition-all"
              >
                {isSubmitting ? "Saving..." : "Register bank credentials"}
              </button>
            </form>
          </div>
        </div>

        {/* 4. COMPLIANCE KYC IDENTITY REVIEW FORM */}
        <div className="lg:col-span-6">
          <div className="glass-card p-6 rounded-2xl space-y-5">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2 border-b border-white/5 pb-3">
              <ShieldCheck className="w-4.5 h-4.5 text-brand-success" />
              <span>Identity Verification (KYC)</span>
            </h3>

            {/* Current Status Box */}
            <div className="p-4 bg-white/3 border border-white/5 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 font-bold block">CURRENT KYC STATUS</span>
                <span className={`font-extrabold text-sm block mt-1 ${
                  user.kycStatus === "APPROVED" ? "text-brand-success" :
                  user.kycStatus === "PENDING_REVIEW" ? "text-brand-warning animate-pulse" :
                  user.kycStatus === "REJECTED" ? "text-brand-danger" :
                  "text-slate-400"
                }`}>
                  {user.kycStatus}
                </span>
              </div>
              <div className={`p-2 rounded-xl ${
                user.kycStatus === "APPROVED" ? "bg-brand-success/15 text-brand-success" :
                user.kycStatus === "PENDING_REVIEW" ? "bg-brand-warning/15 text-brand-warning" :
                "bg-slate-800 text-slate-400"
              }`}>
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            {user.kycStatus === "APPROVED" ? (
              <div className="p-4 bg-brand-success/10 border border-brand-success/20 rounded-xl text-xs text-brand-success space-y-1 text-center">
                <Check className="w-8 h-8 mx-auto mb-2 bg-brand-success/10 rounded-full p-1.5" />
                <strong className="block text-white">Verification Complete</strong>
                <p>Your identity has been fully verified. Withdrawal lockups and higher capital investment constraints have been cleared successfully.</p>
              </div>
            ) : user.kycStatus === "PENDING_REVIEW" ? (
              <div className="p-4 bg-brand-warning/10 border border-brand-warning/20 rounded-xl text-xs text-brand-warning space-y-1 text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 bg-brand-warning/10 rounded-full p-1.5" />
                <strong className="block text-white">Compliance Review in Progress</strong>
                <p>We are reviewing your uploaded documents. Swiss compliance standard reviews are completed within 15 minutes.</p>
                <div className="pt-2">
                  <span className="text-[10px] text-slate-500 block font-mono">
                    *Tip: Use the role-switcher admin mode to immediately approve your own KYC!
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleKycSubmit} className="space-y-4">
                {kycError && (
                  <div className="p-3 bg-brand-danger/10 border border-brand-danger/20 rounded-xl text-brand-danger text-xs font-semibold">
                    {kycError}
                  </div>
                )}

                {kycSuccess && (
                  <div className="p-3 bg-brand-success/10 border border-brand-success/20 rounded-xl text-brand-success text-xs font-semibold">
                    Verification documents uploaded. compliance review started!
                  </div>
                )}

                {user.kycDetails?.rejectionReason && (
                  <div className="p-3 bg-brand-danger/10 border border-brand-danger/20 rounded-xl text-brand-danger text-xs leading-relaxed">
                    <strong>Previous KYC rejected:</strong> {user.kycDetails.rejectionReason}
                  </div>
                )}

                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Standard global Anti-Money Laundering protocol requires verification prior to triggering payouts. Provide legal ID and document reference details below.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Document Type
                    </label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="w-full h-11 px-4 bg-slate-900 border border-white/10 rounded-xl text-white text-sm"
                    >
                      <option value="National ID">National Passport / ID</option>
                      <option value="Drivers License">Driver's License</option>
                      <option value="Tax Residence Identity">Tax Residence Certificate</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Document Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. G293810293"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-mono uppercase"
                      required
                    />
                  </div>
                </div>

                {/* Simulated photo uploading buttons */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-dashed border-white/10 text-center space-y-1 bg-white/2">
                    <span className="text-slate-500 block font-bold">Front Photo of ID</span>
                    <strong className="text-brand-success text-[10px] block">✓ Mocked Uploaded</strong>
                  </div>
                  <div className="p-3 rounded-xl border border-dashed border-white/10 text-center space-y-1 bg-white/2">
                    <span className="text-slate-500 block font-bold">Selfie with ID Card</span>
                    <strong className="text-brand-success text-[10px] block">✓ Mocked Uploaded</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !documentNumber}
                  className="w-full h-11 bg-brand-success hover:bg-brand-success/95 text-brand-bg font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer transition-all"
                >
                  {isSubmitting ? "Uploading docs..." : "Submit KYC credentials"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
