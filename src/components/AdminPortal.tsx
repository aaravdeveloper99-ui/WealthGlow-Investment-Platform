/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Database, ShieldCheck, Check, X, AlertCircle, Users, Coins, Landmark, UserMinus, UserCheck, Search } from "lucide-react";

interface AdminPortalProps {
  token: string;
  onRefreshUserData: () => void;
}

export function AdminPortal({ token, onRefreshUserData }: AdminPortalProps) {
  const [adminStats, setAdminStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAdminData = async () => {
    try {
      setError("");
      // Fetch stats
      const statsRes = await fetch("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsRes.json();

      // Fetch users
      const usersRes = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData = await usersRes.json();

      if (statsData.success && usersData.success) {
        setAdminStats(statsData);
        setUsersList(usersData.users);
      } else {
        setError("Unauthorized Admin access");
      }
    } catch (err) {
      setError("Failed to communicate with admin controller.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [token]);

  // Handle Approve / Reject Deposit
  const handleDepositAction = async (id: string, action: "APPROVE" | "REJECT") => {
    try {
      const res = await fetch(`/api/admin/deposits/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        loadAdminData();
        onRefreshUserData();
      } else {
        alert(data.message || "Operation failed");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  // Handle Approve / Reject Withdrawal
  const handleWithdrawalAction = async (id: string, action: "APPROVE" | "REJECT") => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        loadAdminData();
        onRefreshUserData();
      } else {
        alert(data.message || "Operation failed");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  // Handle Approve / Reject KYC
  const handleKYCAction = async (userId: string, action: "APPROVE" | "REJECT", reason?: string) => {
    try {
      const res = await fetch(`/api/admin/kyc/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (data.success) {
        loadAdminData();
        onRefreshUserData();
      } else {
        alert(data.message || "Operation failed");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  // Handle Block / Suspend User status toggle
  const handleUserStatusAction = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        loadAdminData();
      } else {
        alert(data.message || "Status toggle failed");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-500 font-mono">
        Securing Admin Tunnel... Please wait...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-brand-danger/10 border border-brand-danger/20 rounded-2xl text-brand-danger text-sm font-semibold flex items-center gap-2">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  const filteredUsers = usersList.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* 1. Admin System Greeting */}
      <div>
        <h2 className="text-2xl font-bold font-display text-brand-secondary flex items-center gap-2">
          <Database className="w-6 h-6" />
          <span>System Admin Operations Terminal</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Full global system oversight. Approve client transactions, manage identity compliance, and audit general ledgers.
        </p>
      </div>

      {/* 2. STATS AGGREGATED CARDS */}
      {adminStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Platform Investors</span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">{adminStats.stats.totalUsers}</span>
          </div>
          <div className="glass-card p-5 rounded-2xl">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Secured Reserves</span>
            <span className="text-2xl font-bold font-mono text-brand-success mt-1 block">${adminStats.stats.totalDeposited.toFixed(2)}</span>
          </div>
          <div className="glass-card p-5 rounded-2xl">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Staked Contracts</span>
            <span className="text-2xl font-bold font-mono text-brand-secondary mt-1 block">${adminStats.stats.totalActiveInvestments.toFixed(2)}</span>
          </div>
          <div className="glass-card p-5 rounded-2xl">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Paid Withdrawals</span>
            <span className="text-2xl font-bold font-mono text-slate-400 mt-1 block">${adminStats.stats.totalWithdrawn.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* 3. TRANSACTION APPROVAL QUEUES (Deposits & Withdrawals) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deposit Verification Queue */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
            <Coins className="w-4.5 h-4.5 text-brand-success" />
            <span>Pending Deposits Review ({adminStats?.pendingDeposits?.length || 0})</span>
          </h3>

          {adminStats?.pendingDeposits?.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-medium">
              No deposit requests currently pending compliance review.
            </div>
          ) : (
            <div className="space-y-4">
              {adminStats.pendingDeposits.map((dep: any) => (
                <div key={dep.id} className="p-4 bg-brand-bg/50 border border-white/5 rounded-xl text-xs space-y-3">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Ref: {dep.paymentReference}</span>
                    <strong className="text-white">${dep.amount.toFixed(2)}</strong>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-400 text-[10px]">
                    <div>Method: <strong className="text-white">{dep.paymentMethod}</strong></div>
                    <div>Requested: <strong className="text-white">{new Date(dep.createdAt).toLocaleDateString()}</strong></div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleDepositAction(dep.id, "APPROVE")}
                      className="flex-1 h-9 rounded-lg bg-brand-success hover:bg-brand-success/90 text-brand-bg font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleDepositAction(dep.id, "REJECT")}
                      className="flex-1 h-9 rounded-lg bg-brand-danger/20 hover:bg-brand-danger/30 text-brand-danger font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Withdrawal Verification Queue */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
            <Landmark className="w-4.5 h-4.5 text-brand-danger" />
            <span>Pending Withdrawals Review ({adminStats?.pendingWithdrawals?.length || 0})</span>
          </h3>

          {adminStats?.pendingWithdrawals?.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-medium">
              No withdrawal requests pending compliance review.
            </div>
          ) : (
            <div className="space-y-4">
              {adminStats.pendingWithdrawals.map((wit: any) => (
                <div key={wit.id} className="p-4 bg-brand-bg/50 border border-white/5 rounded-xl text-xs space-y-3">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Destination: {wit.bankAccount}</span>
                    <strong className="text-brand-danger">${wit.amount.toFixed(2)}</strong>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-400 text-[10px]">
                    <div>Method: <strong className="text-white">{wit.paymentMethod}</strong></div>
                    <div>Fee (2%): <strong className="text-slate-300">${wit.fee.toFixed(2)}</strong></div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleWithdrawalAction(wit.id, "APPROVE")}
                      className="flex-1 h-9 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <Check className="w-3.5 h-3.5" /> Process Payout
                    </button>
                    <button
                      onClick={() => handleWithdrawalAction(wit.id, "REJECT")}
                      className="flex-1 h-9 rounded-lg bg-brand-danger/20 hover:bg-brand-danger/30 text-brand-danger font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <X className="w-3.5 h-3.5" /> Decline Refund
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. KYC IDENTITY VERIFICATION QUEUE */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
          <ShieldCheck className="w-4.5 h-4.5 text-brand-secondary" />
          <span>Pending KYC Approvals Queue ({adminStats?.pendingKYC?.length || 0})</span>
        </h3>

        {adminStats?.pendingKYC?.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-medium">
            No investor identity verifications pending audit.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminStats.pendingKYC.map((usr: any) => (
              <div key={usr.id} className="p-4 bg-brand-bg/50 border border-white/5 rounded-xl text-xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                    <strong className="text-white text-sm">{usr.fullName}</strong>
                    <span className="text-[10px] text-brand-secondary font-mono">{usr.email}</span>
                  </div>
                  <div className="space-y-1 text-slate-400 text-[10px]">
                    <div>Doc Type: <strong className="text-white">{usr.kycDetails?.documentType}</strong></div>
                    <div>Doc ID No: <strong className="text-white">{usr.kycDetails?.documentNumber}</strong></div>
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    onClick={() => handleKYCAction(usr.id, "APPROVE")}
                    className="flex-1 h-9 rounded-lg bg-brand-success hover:bg-brand-success/95 text-brand-bg font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <Check className="w-3.5 h-3.5" /> Pass Verify
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt("Enter Rejection Reason:", "Document text is blur or ineligible.");
                      if (reason) handleKYCAction(usr.id, "REJECT", reason);
                    }}
                    className="flex-1 h-9 rounded-lg bg-brand-danger/20 hover:bg-brand-danger/35 text-brand-danger font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <X className="w-3.5 h-3.5" /> Decline KYC
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. USER DATABASE AND CONTROL CENTRE */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-brand-primary" />
            <span>Registered Platform Clients</span>
          </h3>

          {/* Search tool */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-primary transition-all"
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No matching client records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3">Client Identity</th>
                  <th className="py-3">Referral Code</th>
                  <th className="py-3">Wallet Balance</th>
                  <th className="py-3">KYC Status</th>
                  <th className="py-3">System Access</th>
                  <th className="py-3 text-right">Term Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {filteredUsers.map((client) => (
                  <tr key={client.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-3.5">
                      <strong className="text-white block">{client.fullName}</strong>
                      <span className="text-[10px] text-slate-500 font-mono block">{client.email}</span>
                    </td>
                    <td className="py-3.5 font-mono text-slate-400">{client.referralCode}</td>
                    <td className="py-3.5 font-bold font-mono text-white">
                      ${client.balance.toFixed(2)}
                    </td>
                    <td className="py-3.5">
                      <span className={`font-bold text-[10px] ${
                        client.kycStatus === "APPROVED" ? "text-brand-success" :
                        client.kycStatus === "PENDING_REVIEW" ? "text-brand-warning animate-pulse" :
                        "text-slate-500"
                      }`}>
                        ● {client.kycStatus}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        client.status === "ACTIVE" ? "bg-brand-success/10 text-brand-success" : "bg-brand-danger/10 text-brand-danger"
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleUserStatusAction(client.id, client.status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          client.status === "ACTIVE"
                            ? "bg-brand-danger/10 hover:bg-brand-danger/20 text-brand-danger"
                            : "bg-brand-success/10 hover:bg-brand-success/20 text-brand-success"
                        }`}
                      >
                        {client.status === "ACTIVE" ? (
                          <span className="flex items-center gap-1"><UserMinus className="w-3.5 h-3.5" /> Block</span>
                        ) : (
                          <span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" /> Unblock</span>
                        )}
                      </button>
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
