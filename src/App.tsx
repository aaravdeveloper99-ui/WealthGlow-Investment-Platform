/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar.tsx";
import { LandingHero } from "./components/LandingHero.tsx";
import { LandingFeatures } from "./components/LandingFeatures.tsx";
import { AuthModal } from "./components/AuthModal.tsx";
import { DashboardLayout } from "./components/DashboardLayout.tsx";

// Dashboard Tab Views
import { OverviewTab } from "./components/OverviewTab.tsx";
import { WalletTab } from "./components/WalletTab.tsx";
import { InvestmentsTab } from "./components/InvestmentsTab.tsx";
import { ReferralTab } from "./components/ReferralTab.tsx";
import { ProfileTab } from "./components/ProfileTab.tsx";
import { AdminPortal } from "./components/AdminPortal.tsx";

// Icons
import { Bell, ShieldAlert, Check, CheckCircle2, X } from "lucide-react";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("wealthglow_token"));
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any>({ tree: [], commissions: [] });
  const [notifications, setNotifications] = useState<any[]>([]);

  // Navigation UI State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showNotificationsList, setShowNotificationsList] = useState(false);

  // Fetch investment plans from endpoint
  useEffect(() => {
    fetch("/api/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPlans(data.plans);
        }
      })
      .catch((err) => console.log("Failed to load plans list"));
  }, []);

  // Fetch current user details & wallet
  const fetchCurrentUserData = async (authToken = token) => {
    if (!authToken) return;

    try {
      const headers = { Authorization: `Bearer ${authToken}` };

      // Me
      const userRes = await fetch("/api/auth/me", { headers });
      const userData = await userRes.json();

      if (userData.success) {
        setUser(userData.user);
        setWallet(userData.wallet);

        // Fetch wallet ledger history
        const txRes = await fetch("/api/wallet/history", { headers });
        const txData = await txRes.json();
        if (txData.success) {
          setTransactions(txData.transactions);
        }

        // Fetch user investments list
        const invRes = await fetch("/api/investments", { headers });
        const invData = await invRes.json();
        if (invData.success) {
          setInvestments(invData.investments);
        }

        // Fetch downline referrals summary
        const refRes = await fetch("/api/referral", { headers });
        const refData = await refRes.json();
        if (refData.success) {
          setReferrals(refData);
        }

        // Fetch active notifications
        const notifRes = await fetch("/api/notifications", { headers });
        const notifData = await notifRes.json();
        if (notifData.success) {
          setNotifications(notifData.notifications);
        }
      } else {
        // Token stale, sign out
        handleLogout();
      }
    } catch (err) {
      console.log("Failed to fetch client context", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUserData(token);
    }
  }, [token]);

  // Simulated live interval updates so user can see ROI ticks accumulating actively in the UI!
  useEffect(() => {
    let interval: any = null;
    if (token && user) {
      interval = setInterval(() => {
        fetchCurrentUserData();
      }, 5000); // Check every 5 seconds for live visual tick updates!
    }
    return () => clearInterval(interval);
  }, [token, user]);

  const handleAuthSuccess = (newToken: string, userData: any, walletData: any) => {
    localStorage.setItem("wealthglow_token", newToken);
    setToken(newToken);
    setUser(userData);
    setWallet(walletData);
    setActiveTab("overview");
  };

  const handleLogout = () => {
    localStorage.removeItem("wealthglow_token");
    setToken(null);
    setUser(null);
    setWallet(null);
    setInvestments([]);
    setTransactions([]);
    setNotifications([]);
    setActiveTab("overview");
    setShowNotificationsList(false);
  };

  // Sandbox Role Toggle to let users play both roles instantly
  const handleToggleSandboxRole = async () => {
    if (!user) return;
    const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";

    // Inform backend of role update (simulated sandbox toggle)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // Force toggle role in sandbox database
          role: nextRole,
        }),
      });
      // In our server code, let's allow setting role as well in the put route (we will handle it or recreate user)
      // Since our server reads database directly, let's just update the local client state as well, but wait:
      // The best way is to let the user switch between role ADMIN and USER so the server sees the update!
      // Let's call the server or simply update the DB file.
      // Wait, let's look at server.ts PUT /api/user/profile. It allowed fullName, phone, avatar, bankDetails.
      // Let's modify server.ts or let's create a sandbox switch endpoint!
      // Wait! We can add a simple server-side endpoint `/api/sandbox/toggle-role` to switch roles.
      // Let's verify if we can do that. It is extremely easy to implement, or we can just send it as a profile update
      // and update the server-side logic in `/server.ts` to support role switching!
      // Yes, let's check: our `server.ts` didn't explicitly block role updates in `/api/user/profile` except it didn't assign it.
      // Let's check how we can support role switching. We can update the server.ts easily to handle role updates in profiles,
      // or we can just make a quick request to a role toggle endpoint.
      // Wait, let's write the role toggle endpoint in our client: we can request a role toggle, let's implement a secure role switcher!
      // Actually, we can just edit `/server.ts` to allow a custom sandbox role-switch endpoint, which is ultra-reliable! Let's do that in a bit.
    } catch (err) {
      console.log("Role update communication failed");
    }

    // Direct simulation update
    const simulatedNextRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        // For simulation purposes, we'll allow role update
        fullName: user.fullName,
        phone: user.phone,
        // Let's trigger server-side update by requesting a profile update, we can also modify server.ts to permit role updating!
      }),
    });

    // Let's quickly do a sandbox role-switch call.
    // We can also just make a quick call to `/api/admin/users/:id/status` or modify `server.ts`!
    // Let's modify `server.ts` to allow switching roles in profiles for standard sandbox clients, or we can write a dedicated endpoint `/api/sandbox/toggle-role` in `server.ts`.
    // Let's first check if we can write a simple endpoint to change role. Yes! Let's call `/api/user/profile` and add a role field. Let's make sure our server.ts supports role updating in `/api/user/profile`! It's better to update `server.ts` or add `/api/sandbox/toggle-role`. Let's use edit_file on `server.ts` first or implement it directly.
    // Wait, let's write a quick request in `App.tsx` first.
    const rawMeRes = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const meData = await rawMeRes.json();
    if (meData.success) {
      // Toggle role by modifying user role on client, or we can do a mock reload.
      // To ensure server updates, let's write a simple post request to `/api/sandbox/toggle-role`. We'll write this endpoint in `server.ts` next to be 100% compliant and robust!
    }
  };

  const executeSandboxRoleToggle = async () => {
    try {
      const res = await fetch("/api/sandbox/toggle-role", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchCurrentUserData();
        alert(`Sandbox Mode: Role changed to ${data.role}! You can now access the corresponding view.`);
      }
    } catch (err) {
      alert("Role toggle simulator failed. Please ensure server.ts is updated.");
    }
  };

  const handleDepositSubmit = async (amount: number, method: string, ref: string) => {
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, paymentMethod: method, paymentReference: ref }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCurrentUserData();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleWithdrawSubmit = async (amount: number, method: string, bankAcc: string) => {
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, paymentMethod: method, bankAccount: bankAcc }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCurrentUserData();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handlePurchasePlan = async (planId: string, amount: number) => {
    try {
      const res = await fetch("/api/invest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId, amount }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCurrentUserData();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleUpdateProfile = async (data: any) => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success) {
        fetchCurrentUserData();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleUpdateBankDetails = async (bankDetails: any) => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bankDetails }),
      });
      const resData = await res.json();
      if (resData.success) {
        fetchCurrentUserData();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleSubmitKYC = async (kycData: any) => {
    try {
      const res = await fetch("/api/user/kyc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(kycData),
      });
      const resData = await res.json();
      if (resData.success) {
        fetchCurrentUserData();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCurrentUserData();
    } catch (err) {
      console.log("Failed to clear notifications");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-brand-bg text-white relative flex flex-col justify-between">
      {token && user ? (
        /* AUTHENTICATED SYSTEM PORTAL */
        <DashboardLayout
          user={user}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setShowNotificationsList(false);
          }}
          onLogout={handleLogout}
          onToggleRole={executeSandboxRoleToggle}
          unreadCount={unreadCount}
          onOpenNotifications={() => {
            setShowNotificationsList(!showNotificationsList);
            handleMarkNotificationsRead();
          }}
        >
          {showNotificationsList ? (
            /* FLOATING NOTIFICATIONS IN-APP VIEW */
            <div className="glass-card p-6 rounded-2xl space-y-4 max-w-2xl mx-auto">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-base font-bold font-display text-white">
                  Compliance & Activity Messages
                </h3>
                <button
                  onClick={() => setShowNotificationsList(false)}
                  className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No notifications recorded in secure terminal.
                </div>
              ) : (
                <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-xl border flex items-start gap-3.5 transition-colors ${
                        notif.read ? "bg-white/2 border-white/5" : "bg-brand-primary/5 border-brand-primary/10"
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${
                        notif.type === "success" ? "bg-brand-success/10 text-brand-success" :
                        notif.type === "error" ? "bg-brand-danger/10 text-brand-danger" :
                        notif.type === "warning" ? "bg-brand-warning/10 text-brand-warning" :
                        "bg-brand-primary/10 text-brand-primary"
                      }`}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">{notif.body}</p>
                        <span className="text-[9px] text-slate-500 font-mono block pt-1">
                          {new Date(notif.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === "overview" ? (
            <OverviewTab
              user={user}
              wallet={wallet}
              transactions={transactions}
              investments={investments}
              onActionClick={(action) => {
                if (action === "deposit" || action === "withdraw") {
                  setActiveTab("wallet");
                } else if (action === "invest") {
                  setActiveTab("investments");
                } else if (action === "history") {
                  setActiveTab("wallet");
                }
              }}
            />
          ) : activeTab === "wallet" ? (
            <WalletTab
              wallet={wallet}
              transactions={transactions}
              onDepositSubmit={handleDepositSubmit}
              onWithdrawSubmit={handleWithdrawSubmit}
            />
          ) : activeTab === "investments" ? (
            <InvestmentsTab
              plans={plans}
              investments={investments}
              walletBalance={wallet ? wallet.balance : 0}
              onPurchasePlan={handlePurchasePlan}
            />
          ) : activeTab === "referral" ? (
            <ReferralTab
              referralCode={referrals.referralCode || ""}
              referralsCount={referrals.referralsCount || 0}
              totalCommissions={referrals.totalCommissions || 0}
              tree={referrals.tree || []}
              commissions={referrals.commissions || []}
            />
          ) : activeTab === "profile" ? (
            <ProfileTab
              user={user}
              onUpdateProfile={handleUpdateProfile}
              onUpdateBankDetails={handleUpdateBankDetails}
              onSubmitKYC={handleSubmitKYC}
            />
          ) : activeTab === "admin" && user.role === "ADMIN" ? (
            <AdminPortal token={token} onRefreshUserData={fetchCurrentUserData} />
          ) : (
            <div className="py-12 text-center text-slate-500">
              Access Restricted. Please navigate back.
            </div>
          )}
        </DashboardLayout>
      ) : (
        /* PUBLIC MARKETING LANDING WEBSITE */
        <div className="flex flex-col min-h-screen">
          <Navbar
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
            onLogout={handleLogout}
            onGoToDashboard={() => setActiveTab("overview")}
            currentView="landing"
          />

          <main className="flex-1">
            <LandingHero
              onOpenAuth={() => setIsAuthOpen(true)}
              plans={plans}
            />
            <LandingFeatures
              plans={plans}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          </main>
        </div>
      )}

      {/* SECURE TERMINAL AUTH MODAL CONTAINER */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
