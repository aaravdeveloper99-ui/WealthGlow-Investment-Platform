/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import {
  User,
  Wallet,
  Transaction,
  InvestmentPlan,
  Investment,
  Deposit,
  Withdrawal,
  Notification,
  UserRole,
  UserStatus,
  KYCStatus,
  TransactionType,
  TransactionStatus,
  InvestmentStatus,
  ReferralCommission,
} from "./src/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "server_db.json");

// Helper interfaces for server storage
interface DatabaseSchema {
  users: User[];
  wallets: Wallet[];
  transactions: Transaction[];
  plans: InvestmentPlan[];
  investments: Investment[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  commissions: ReferralCommission[];
  notifications: Notification[];
}

// Default initial database state
const INITIAL_DB: DatabaseSchema = {
  users: [],
  wallets: [],
  transactions: [],
  plans: [
    {
      id: "plan-silver",
      title: "Silver Starter",
      minimumAmount: 100,
      maximumAmount: 1999,
      roiPercentage: 1.5, // 1.5% per day (simulated payout)
      durationDays: 30,
      capitalReturn: true,
      status: true,
    },
    {
      id: "plan-gold",
      title: "Gold Growth",
      minimumAmount: 2000,
      maximumAmount: 9999,
      roiPercentage: 2.5, // 2.5% per day
      durationDays: 60,
      capitalReturn: true,
      status: true,
    },
    {
      id: "plan-platinum",
      title: "Platinum Pro Portfolio",
      minimumAmount: 10000,
      maximumAmount: 100000,
      roiPercentage: 4.0, // 4% per day
      durationDays: 90,
      capitalReturn: true,
      status: true,
    },
  ],
  investments: [],
  deposits: [],
  withdrawals: [],
  commissions: [],
  notifications: [],
};

let firestoreDb: any = null;
let lastSyncedData: DatabaseSchema | null = null;

async function initFirestore() {
  try {
    const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (!fs.existsSync(firebaseConfigPath)) {
      console.warn("firebase-applet-config.json not found, skipping Firestore sync");
      return;
    }
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));
    const app = initializeApp(firebaseConfig);
    firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
    console.log("[Firebase] Initialized successfully in backend.");

    const collections = [
      "users",
      "wallets",
      "transactions",
      "plans",
      "investments",
      "deposits",
      "withdrawals",
      "commissions",
      "notifications"
    ];

    const dbData: any = {};
    for (const colName of collections) {
      dbData[colName] = [];
      const querySnapshot = await getDocs(collection(firestoreDb, colName));
      querySnapshot.forEach((doc) => {
        dbData[colName].push({ ...doc.data() });
      });
    }

    // Merge default plans if empty
    if (!dbData.plans || dbData.plans.length === 0) {
      dbData.plans = INITIAL_DB.plans;
      for (const plan of INITIAL_DB.plans) {
        await setDoc(doc(firestoreDb, "plans", plan.id), plan);
      }
    }

    // Merge admin user if empty
    if (!dbData.users || dbData.users.length === 0) {
      let localData = INITIAL_DB;
      if (fs.existsSync(DB_FILE)) {
        try {
          localData = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
        } catch (e) {}
      }
      
      for (const colName of collections) {
        const items = (localData as any)[colName] || [];
        for (const item of items) {
          if (item && item.id) {
            await setDoc(doc(firestoreDb, colName, item.id), item);
          }
        }
      }
      lastSyncedData = localData;
    } else {
      fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
      lastSyncedData = dbData;
      console.log("[Firebase] Local database fully synced with Cloud Firestore.");
    }
  } catch (err) {
    console.error("[Firebase] Failed to initialize or sync with Firestore", err);
  }
}

async function syncChangesToFirestore(newData: DatabaseSchema) {
  if (!firestoreDb) return;
  try {
    const collections = [
      "users",
      "wallets",
      "transactions",
      "plans",
      "investments",
      "deposits",
      "withdrawals",
      "commissions",
      "notifications"
    ];

    for (const colName of collections) {
      const newItems = (newData as any)[colName] || [];
      const oldItems = lastSyncedData ? ((lastSyncedData as any)[colName] || []) : [];

      for (const item of newItems) {
        if (!item || !item.id) continue;
        const oldItem = oldItems.find((oi: any) => oi.id === item.id);
        if (!oldItem || JSON.stringify(oldItem) !== JSON.stringify(item)) {
          await setDoc(doc(firestoreDb, colName, item.id), item);
        }
      }

      for (const oldItem of oldItems) {
        if (!oldItem || !oldItem.id) continue;
        const existsInNew = newItems.some((ni: any) => ni.id === oldItem.id);
        if (!existsInNew) {
          await deleteDoc(doc(firestoreDb, colName, oldItem.id));
        }
      }
    }

    lastSyncedData = JSON.parse(JSON.stringify(newData));
  } catch (err) {
    console.error("[Firebase] Error syncing changes to Firestore", err);
  }
}

// Initialize DB if doesn't exist
function readDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2));
      return INITIAL_DB;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read server DB, using in-memory fallback", err);
    return INITIAL_DB;
  }
}

function writeDB(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    // Asynchronously push changes to Cloud Firestore
    syncChangesToFirestore(data);
  } catch (err) {
    console.error("Failed to write to server DB", err);
  }
}

// Helper to generate IDs and references
function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateRef(prefix: string): string {
  return `${prefix}${Math.floor(10000000 + Math.random() * 90000000)}`;
}

// Start building express server
async function startServer() {
  await initFirestore();
  const app = express();
  app.use(express.json());

  // Database Access Helpers
  const db = {
    get: () => readDB(),
    save: (data: DatabaseSchema) => writeDB(data),
  };

  // Auth Middleware
  app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const data = db.get();
      // Simple custom token mapping: "token_<userId>"
      if (token.startsWith("token_")) {
        const userId = token.substring(6);
        const user = data.users.find((u) => u.id === userId);
        if (user) {
          (req as any).user = user;
        }
      }
    }
    next();
  });

  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!(req as any).user) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }
    next();
  };

  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!(req as any).user || (req as any).user.role !== UserRole.ADMIN) {
      return res.status(403).json({ success: false, message: "Forbidden - Administrator access required" });
    }
    next();
  };

  // Seed Admin user if database is empty
  const currentData = db.get();
  if (currentData.users.length === 0) {
    const adminId = "admin-user-id";
    const adminUser: User = {
      id: adminId,
      fullName: "Platform Super Admin",
      email: "admin@wealthglow.com",
      phone: "+1555019283",
      referralCode: "WGADMIN",
      status: UserStatus.ACTIVE,
      kycStatus: KYCStatus.APPROVED,
      role: UserRole.ADMIN,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const adminWallet: Wallet = {
      id: "wallet-admin",
      userId: adminId,
      balance: 1000000,
      lockedBalance: 0,
      totalDeposit: 1000000,
      totalWithdraw: 0,
      totalProfit: 0,
      totalBonus: 0,
    };
    currentData.users.push(adminUser);
    currentData.wallets.push(adminWallet);
    db.save(currentData);
    console.log("Seeded default Super Admin account: admin@wealthglow.com / any password");
  }

  // --- API ROUTES ---

  // Auth: Register
  app.post("/api/auth/register", (req, res) => {
    const { fullName, email, phone, password, referralCode } = req.body;
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const data = db.get();
    if (data.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }
    if (data.users.some((u) => u.phone === phone)) {
      return res.status(400).json({ success: false, message: "Phone number is already registered" });
    }

    // Check referral sponsor
    let referredBy: string | undefined = undefined;
    if (referralCode) {
      const sponsor = data.users.find((u) => u.referralCode.toUpperCase() === referralCode.toUpperCase());
      if (sponsor) {
        referredBy = sponsor.id;
      } else {
        return res.status(400).json({ success: false, message: "Invalid referral code" });
      }
    }

    const userId = generateId("user");
    const userReferralCode = "WG" + Math.random().toString(36).substr(2, 6).toUpperCase();

    const newUser: User = {
      id: userId,
      fullName,
      email,
      phone,
      referralCode: userReferralCode,
      referredBy,
      status: UserStatus.ACTIVE,
      kycStatus: KYCStatus.PENDING_SUBMISSION,
      role: UserRole.USER,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newWallet: Wallet = {
      id: generateId("wallet"),
      userId,
      balance: 0,
      lockedBalance: 0,
      totalDeposit: 0,
      totalWithdraw: 0,
      totalProfit: 0,
      totalBonus: 0,
    };

    data.users.push(newUser);
    data.wallets.push(newWallet);

    // Generate welcome notification
    data.notifications.push({
      id: generateId("notif"),
      userId,
      title: "Welcome to WealthGlow!",
      body: "Start your investment journey by making a deposit or exploring our investment plans.",
      type: "info",
      read: false,
      createdAt: new Date().toISOString(),
    });

    db.save(data);

    const token = `token_${userId}`;
    res.json({ success: true, token, user: newUser, wallet: newWallet });
  });

  // Auth: Login
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const data = db.get();
    const user = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (user.status === UserStatus.SUSPENDED) {
      return res.status(403).json({ success: false, message: "Your account is suspended. Please contact support." });
    }

    const wallet = data.wallets.find((w) => w.userId === user.id);
    const token = `token_${user.id}`;

    res.json({
      success: true,
      token,
      user,
      wallet,
    });
  });

  // Auth: Get Current User Data
  app.get("/api/auth/me", requireAuth, (req, res) => {
    const activeUser = (req as any).user as User;
    const data = db.get();
    const user = data.users.find((u) => u.id === activeUser.id);
    const wallet = data.wallets.find((w) => w.userId === activeUser.id);
    res.json({ success: true, user, wallet });
  });

  // Sandbox: Toggle User/Admin Role (Sandbox Simulator helper)
  app.post("/api/sandbox/toggle-role", requireAuth, (req, res) => {
    const activeUser = (req as any).user as User;
    const data = db.get();
    const userIndex = data.users.findIndex((u) => u.id === activeUser.id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const currentRole = data.users[userIndex].role;
    const nextRole = currentRole === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
    data.users[userIndex].role = nextRole;
    
    // Also ensure they have an admin wallet if transitioning to admin
    if (nextRole === UserRole.ADMIN) {
      const wallet = data.wallets.find((w) => w.userId === activeUser.id);
      if (wallet && wallet.balance < 1000000) {
        wallet.balance += 1000000;
        wallet.totalDeposit += 1000000;
      }
    }

    db.save(data);
    res.json({ success: true, role: nextRole });
  });

  // User: Update Profile
  app.put("/api/user/profile", requireAuth, (req, res) => {
    const activeUser = (req as any).user as User;
    const { fullName, phone, bankDetails, avatar } = req.body;

    const data = db.get();
    const userIndex = data.users.findIndex((u) => u.id === activeUser.id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (fullName) data.users[userIndex].fullName = fullName;
    if (phone) data.users[userIndex].phone = phone;
    if (avatar) data.users[userIndex].avatar = avatar;
    if (bankDetails) {
      data.users[userIndex].bankDetails = {
        bankName: bankDetails.bankName || "",
        accountNumber: bankDetails.accountNumber || "",
        accountHolderName: bankDetails.accountHolderName || "",
        ifscCode: bankDetails.ifscCode || "",
        upiId: bankDetails.upiId || "",
      };
    }
    data.users[userIndex].updatedAt = new Date().toISOString();

    db.save(data);
    res.json({ success: true, user: data.users[userIndex] });
  });

  // User: Submit KYC
  app.post("/api/user/kyc", requireAuth, (req, res) => {
    const activeUser = (req as any).user as User;
    const { documentType, documentNumber, frontImage, backImage, selfieImage } = req.body;

    if (!documentType || !documentNumber) {
      return res.status(400).json({ success: false, message: "Document type and number are required" });
    }

    const data = db.get();
    const userIndex = data.users.findIndex((u) => u.id === activeUser.id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    data.users[userIndex].kycStatus = KYCStatus.PENDING_REVIEW;
    data.users[userIndex].kycDetails = {
      documentType,
      documentNumber,
      frontImage: frontImage || "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400&auto=format&fit=crop&q=60",
      backImage: backImage || "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400&auto=format&fit=crop&q=60",
      selfieImage: selfieImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60",
    };
    data.users[userIndex].updatedAt = new Date().toISOString();

    data.notifications.push({
      id: generateId("notif"),
      userId: activeUser.id,
      title: "KYC Submitted",
      body: "Your KYC documents have been successfully uploaded and are currently pending compliance team review.",
      type: "warning",
      read: false,
      createdAt: new Date().toISOString(),
    });

    db.save(data);
    res.json({ success: true, user: data.users[userIndex] });
  });

  // Wallet: Get current balance & ledger
  app.get("/api/wallet", requireAuth, (req, res) => {
    const activeUser = (req as any).user as User;
    const data = db.get();
    const wallet = data.wallets.find((w) => w.userId === activeUser.id);
    res.json({ success: true, wallet });
  });

  // Wallet: Request Deposit
  app.post("/api/wallet/deposit", requireAuth, (req, res) => {
    const activeUser = (req as any).user as User;
    const { amount, paymentMethod, paymentReference, receiptUrl } = req.body;

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Valid deposit amount is required" });
    }

    const depositAmount = parseFloat(amount);
    const data = db.get();
    const wallet = data.wallets.find((w) => w.userId === activeUser.id);
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    const depositId = generateId("dep");
    const newDeposit: Deposit = {
      id: depositId,
      userId: activeUser.id,
      amount: depositAmount,
      paymentMethod: paymentMethod || "Bank Transfer",
      paymentReference: paymentReference || generateRef("TXN"),
      receiptUrl: receiptUrl || "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400&auto=format&fit=crop&q=60",
      status: TransactionStatus.PENDING,
      createdAt: new Date().toISOString(),
    };

    data.deposits.push(newDeposit);

    // Create a pending transaction record
    const newTx: Transaction = {
      id: generateId("tx"),
      userId: activeUser.id,
      walletId: wallet.id,
      referenceNo: newDeposit.paymentReference,
      type: TransactionType.DEPOSIT,
      amount: depositAmount,
      fee: 0,
      netAmount: depositAmount,
      status: TransactionStatus.PENDING,
      description: `Deposit via ${newDeposit.paymentMethod} (Pending Approval)`,
      createdAt: new Date().toISOString(),
    };
    data.transactions.push(newTx);

    // Notification
    data.notifications.push({
      id: generateId("notif"),
      userId: activeUser.id,
      title: "Deposit Requested",
      body: `Your deposit of $${depositAmount.toFixed(2)} is pending manual verification. Reference: ${newDeposit.paymentReference}`,
      type: "info",
      read: false,
      createdAt: new Date().toISOString(),
    });

    db.save(data);
    res.json({ success: true, deposit: newDeposit, transaction: newTx });
  });

  // Wallet: Request Withdrawal
  app.post("/api/wallet/withdraw", requireAuth, (req, res) => {
    const activeUser = (req as any).user as User;
    const { amount, paymentMethod, bankAccount } = req.body;

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Valid withdrawal amount is required" });
    }

    const withdrawAmount = parseFloat(amount);
    const data = db.get();
    const walletIndex = data.wallets.findIndex((w) => w.userId === activeUser.id);
    if (walletIndex === -1) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    const wallet = data.wallets[walletIndex];
    if (wallet.balance < withdrawAmount) {
      return res.status(400).json({ success: false, message: "Insufficient available balance" });
    }

    // Minimum withdrawal threshold
    if (withdrawAmount < 20) {
      return res.status(400).json({ success: false, message: "Minimum withdrawal amount is $20.00" });
    }

    // Process: Lock balance first (moves from balance to lockedBalance, or just deducted immediately to protect double spend)
    wallet.balance -= withdrawAmount;
    wallet.lockedBalance += withdrawAmount; // locked during processing

    const withdrawId = generateId("wit");
    const fee = withdrawAmount * 0.02; // 2% processing fee
    const netAmount = withdrawAmount - fee;
    const ref = generateRef("WD");

    const newWithdrawal: Withdrawal = {
      id: withdrawId,
      userId: activeUser.id,
      amount: withdrawAmount,
      fee,
      paymentMethod: paymentMethod || "Bank Account",
      bankAccount: bankAccount || "Direct UPI",
      status: TransactionStatus.PENDING,
      createdAt: new Date().toISOString(),
    };
    data.withdrawals.push(newWithdrawal);

    // Create transactional record
    const newTx: Transaction = {
      id: generateId("tx"),
      userId: activeUser.id,
      walletId: wallet.id,
      referenceNo: ref,
      type: TransactionType.WITHDRAWAL,
      amount: withdrawAmount,
      fee,
      netAmount,
      status: TransactionStatus.PENDING,
      description: `Withdrawal request to ${newWithdrawal.paymentMethod} (Pending Review)`,
      createdAt: new Date().toISOString(),
    };
    data.transactions.push(newTx);

    // Notification
    data.notifications.push({
      id: generateId("notif"),
      userId: activeUser.id,
      title: "Withdrawal Requested",
      body: `Your withdrawal of $${withdrawAmount.toFixed(2)} (Net: $${netAmount.toFixed(2)} after 2% fee) has been submitted for compliance approval.`,
      type: "warning",
      read: false,
      createdAt: new Date().toISOString(),
    });

    db.save(data);
    res.json({ success: true, withdrawal: newWithdrawal, wallet, transaction: newTx });
  });

  // Wallet: Transaction History
  app.get("/api/wallet/history", requireAuth, (req, res) => {
    const activeUser = (req as any).user as User;
    const data = db.get();
    const userTransactions = data.transactions
      .filter((t) => t.userId === activeUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, transactions: userTransactions });
  });

  // Investments: Get Plans
  app.get("/api/plans", (req, res) => {
    const data = db.get();
    res.json({ success: true, plans: data.plans });
  });

  // Investments: Buy Plan
  app.post("/api/invest", requireAuth, (req, res) => {
    const activeUser = (req as any).user as User;
    const { planId, amount } = req.body;

    if (!planId || !amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Valid plan ID and investment amount are required" });
    }

    const investAmount = parseFloat(amount);
    const data = db.get();

    const plan = data.plans.find((p) => p.id === planId && p.status === true);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Selected investment plan is invalid or inactive" });
    }

    if (investAmount < plan.minimumAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum investment for ${plan.title} is $${plan.minimumAmount}`,
      });
    }
    if (investAmount > plan.maximumAmount) {
      return res.status(400).json({
        success: false,
        message: `Maximum investment for ${plan.title} is $${plan.maximumAmount}`,
      });
    }

    const walletIndex = data.wallets.findIndex((w) => w.userId === activeUser.id);
    if (walletIndex === -1) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    const wallet = data.wallets[walletIndex];
    if (wallet.balance < investAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. Please deposit at least $${(investAmount - wallet.balance).toFixed(2)} more.`,
      });
    }

    // Process investment: deduct balance, add to locked balance
    wallet.balance -= investAmount;
    wallet.lockedBalance += investAmount;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationDays);

    const expectedProfit = investAmount * (plan.roiPercentage / 100) * plan.durationDays;

    const investmentId = generateId("inv");
    const newInvestment: Investment = {
      id: investmentId,
      userId: activeUser.id,
      planId: plan.id,
      planTitle: plan.title,
      amount: investAmount,
      expectedProfit,
      dailyRoi: plan.roiPercentage,
      returnsEarned: 0,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: InvestmentStatus.ACTIVE,
      lastPayoutAt: startDate.toISOString(),
    };

    data.investments.push(newInvestment);

    // Create transaction record
    const ref = generateRef("INV");
    const investTx: Transaction = {
      id: generateId("tx"),
      userId: activeUser.id,
      walletId: wallet.id,
      referenceNo: ref,
      type: TransactionType.INVESTMENT,
      amount: investAmount,
      fee: 0,
      netAmount: investAmount,
      status: TransactionStatus.COMPLETED,
      description: `Invested in plan: ${plan.title}`,
      createdAt: new Date().toISOString(),
    };
    data.transactions.push(investTx);

    // Referral Commissions logic (Up to 3 levels)
    // Level 1: 10%, Level 2: 5%, Level 3: 2%
    const levels = [0.10, 0.05, 0.02];
    let sponsorId = activeUser.referredBy;
    let levelIndex = 0;

    while (sponsorId && levelIndex < levels.length) {
      const sponsor = data.users.find((u) => u.id === sponsorId);
      if (sponsor) {
        const sponsorWallet = data.wallets.find((w) => w.userId === sponsorId);
        if (sponsorWallet) {
          const commissionRate = levels[levelIndex];
          const commissionAmount = investAmount * commissionRate;

          // Credit sponsor wallet balance & record total bonus
          sponsorWallet.balance += commissionAmount;
          sponsorWallet.totalBonus += commissionAmount;

          const commId = generateId("comm");
          const commission: ReferralCommission = {
            id: commId,
            sponsorId,
            refereeId: activeUser.id,
            refereeName: activeUser.fullName,
            investmentId,
            amount: commissionAmount,
            level: levelIndex + 1,
            createdAt: new Date().toISOString(),
          };
          data.commissions.push(commission);

          // Add transaction for sponsor
          const sponsorTxRef = generateRef("REF");
          data.transactions.push({
            id: generateId("tx"),
            userId: sponsorId,
            walletId: sponsorWallet.id,
            referenceNo: sponsorTxRef,
            type: TransactionType.REFERRAL,
            amount: commissionAmount,
            fee: 0,
            netAmount: commissionAmount,
            status: TransactionStatus.COMPLETED,
            description: `Referral Commission (Level ${levelIndex + 1}) from ${activeUser.fullName}'s investment in ${plan.title}`,
            createdAt: new Date().toISOString(),
          });

          // Notify Sponsor
          data.notifications.push({
            id: generateId("notif"),
            userId: sponsorId,
            title: `Referral Commission Credited!`,
            body: `You earned $${commissionAmount.toFixed(2)} (Level ${levelIndex + 1} commission) from ${activeUser.fullName}'s investment of $${investAmount.toFixed(2)}.`,
            type: "success",
            read: false,
            createdAt: new Date().toISOString(),
          });
        }
        sponsorId = sponsor.referredBy;
        levelIndex++;
      } else {
        break;
      }
    }

    // Add purchase notification for investor
    data.notifications.push({
      id: generateId("notif"),
      userId: activeUser.id,
      title: "Investment Activated",
      body: `Your investment of $${investAmount.toFixed(2)} in ${plan.title} is now active. You will receive simulated ROI earnings.`,
      type: "success",
      read: false,
      createdAt: new Date().toISOString(),
    });

    db.save(data);
    res.json({ success: true, investment: newInvestment, wallet });
  });

  // Investments: Get active & completed list
  app.get("/api/investments", requireAuth, (req, res) => {
    const activeUser = (req as any).user as User;
    const data = db.get();
    const userInvestments = data.investments
      .filter((i) => i.userId === activeUser.id)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    res.json({ success: true, investments: userInvestments });
  });

  // Referrals: Get referral summary & tree
  app.get("/api/referral", requireAuth, (req, res) => {
    const activeUser = (req as any).user as User;
    const data = db.get();

    // Compile referral levels
    const tree: any[] = [];
    const commissions = data.commissions.filter((c) => c.sponsorId === activeUser.id);
    const totalBonus = commissions.reduce((sum, c) => sum + c.amount, 0);

    // Helper to recursively find downlines
    function getDownlines(currentUserId: string, currentLevel: number) {
      if (currentLevel > 3) return; // Limit to 3 levels for UI/UX simplicity
      const directReferees = data.users.filter((u) => u.referredBy === currentUserId);

      for (const ref of directReferees) {
        const refWallet = data.wallets.find((w) => w.userId === ref.id);
        const refInvestments = data.investments.filter((i) => i.userId === ref.id);
        const refVolume = refInvestments.reduce((sum, i) => sum + i.amount, 0);

        tree.push({
          userId: ref.id,
          fullName: ref.fullName,
          email: ref.email,
          level: currentLevel,
          joinDate: ref.createdAt,
          investmentVolume: refVolume,
        });

        getDownlines(ref.id, currentLevel + 1);
      }
    }

    getDownlines(activeUser.id, 1);

    res.json({
      success: true,
      referralCode: activeUser.referralCode,
      referralsCount: tree.length,
      totalCommissions: totalBonus,
      tree,
      commissions: commissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    });
  });

  // Notifications: Get list
  app.get("/api/notifications", requireAuth, (req, res) => {
    const activeUser = (req as any).user as User;
    const data = db.get();
    const list = data.notifications
      .filter((n) => n.userId === activeUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, notifications: list });
  });

  // Notifications: Mark as read
  app.patch("/api/notifications/read", requireAuth, (req, res) => {
    const activeUser = (req as any).user as User;
    const data = db.get();
    data.notifications = data.notifications.map((n) => {
      if (n.userId === activeUser.id) {
        return { ...n, read: true };
      }
      return n;
    });
    db.save(data);
    res.json({ success: true });
  });

  // System Stats Endpoint (Landing Page)
  app.get("/api/stats", (req, res) => {
    const data = db.get();
    const investorsCount = data.users.filter((u) => u.role === UserRole.USER).length;
    const totalInvested = data.investments.reduce((sum, i) => sum + i.amount, 0);
    const totalWithdrawn = data.withdrawals.filter((w) => w.status === TransactionStatus.COMPLETED).reduce((sum, w) => sum + w.amount, 0);

    res.json({
      success: true,
      stats: {
        totalInvestors: 1240 + investorsCount,
        totalAssets: 4850000 + totalInvested,
        totalWithdrawals: 1920000 + totalWithdrawn,
        countriesCount: 42,
      },
    });
  });

  // --- ADMINISTRATOR API ROUTES ---

  // Admin Dashboard stats
  app.get("/api/admin/dashboard", requireAuth, requireAdmin, (req, res) => {
    const data = db.get();

    const totalUsers = data.users.filter((u) => u.role === UserRole.USER).length;
    const totalDeposited = data.deposits
      .filter((d) => d.status === TransactionStatus.COMPLETED)
      .reduce((sum, d) => sum + d.amount, 0);
    const totalWithdrawn = data.withdrawals
      .filter((w) => w.status === TransactionStatus.COMPLETED)
      .reduce((sum, w) => sum + w.amount, 0);
    const totalActiveInvestments = data.investments
      .filter((i) => i.status === InvestmentStatus.ACTIVE)
      .reduce((sum, i) => sum + i.amount, 0);

    const pendingDeposits = data.deposits.filter((d) => d.status === TransactionStatus.PENDING);
    const pendingWithdrawals = data.withdrawals.filter((w) => w.status === TransactionStatus.PENDING);
    const pendingKYC = data.users.filter((u) => u.kycStatus === KYCStatus.PENDING_REVIEW);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalDeposited,
        totalWithdrawn,
        totalActiveInvestments,
        pendingDepositsCount: pendingDeposits.length,
        pendingWithdrawalsCount: pendingWithdrawals.length,
        pendingKYCCount: pendingKYC.length,
      },
      pendingDeposits,
      pendingWithdrawals,
      pendingKYC,
    });
  });

  // Admin: List all Users
  app.get("/api/admin/users", requireAuth, requireAdmin, (req, res) => {
    const data = db.get();
    const clients = data.users.filter((u) => u.role === UserRole.USER);
    const clientDetails = clients.map((c) => {
      const wallet = data.wallets.find((w) => w.userId === c.id);
      const investments = data.investments.filter((i) => i.userId === c.id);
      return {
        ...c,
        balance: wallet ? wallet.balance : 0,
        activeInvestmentsCount: investments.filter((i) => i.status === InvestmentStatus.ACTIVE).length,
      };
    });
    res.json({ success: true, users: clientDetails });
  });

  // Admin: Manage User Status
  app.put("/api/admin/users/:userId/status", requireAuth, requireAdmin, (req, res) => {
    const { userId } = req.params;
    const { status } = req.body; // ACTIVE or SUSPENDED

    const data = db.get();
    const userIndex = data.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    data.users[userIndex].status = status;
    db.save(data);

    res.json({ success: true, user: data.users[userIndex] });
  });

  // Admin: Approve / Reject Deposit
  app.put("/api/admin/deposits/:id", requireAuth, requireAdmin, (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // APPROVE or REJECT
    const adminUser = (req as any).user as User;

    const data = db.get();
    const depositIndex = data.deposits.findIndex((d) => d.id === id);
    if (depositIndex === -1) {
      return res.status(404).json({ success: false, message: "Deposit request not found" });
    }

    const deposit = data.deposits[depositIndex];
    if (deposit.status !== TransactionStatus.PENDING) {
      return res.status(400).json({ success: false, message: "Deposit is already processed" });
    }

    const walletIndex = data.wallets.findIndex((w) => w.userId === deposit.userId);
    if (walletIndex === -1) {
      return res.status(404).json({ success: false, message: "User wallet not found" });
    }

    const wallet = data.wallets[walletIndex];

    if (action === "APPROVE") {
      deposit.status = TransactionStatus.COMPLETED;
      deposit.approvedAt = new Date().toISOString();

      // Credit wallet
      wallet.balance += deposit.amount;
      wallet.totalDeposit += deposit.amount;

      // Complete original transaction status
      const txIndex = data.transactions.findIndex(
        (t) => t.userId === deposit.userId && t.referenceNo === deposit.paymentReference
      );
      if (txIndex !== -1) {
        data.transactions[txIndex].status = TransactionStatus.COMPLETED;
      }

      // Notify User
      data.notifications.push({
        id: generateId("notif"),
        userId: deposit.userId,
        title: "Deposit Approved!",
        body: `Your deposit of $${deposit.amount.toFixed(2)} has been successfully verified and credited to your available balance.`,
        type: "success",
        read: false,
        createdAt: new Date().toISOString(),
      });
    } else {
      deposit.status = TransactionStatus.FAILED;

      const txIndex = data.transactions.findIndex(
        (t) => t.userId === deposit.userId && t.referenceNo === deposit.paymentReference
      );
      if (txIndex !== -1) {
        data.transactions[txIndex].status = TransactionStatus.FAILED;
        data.transactions[txIndex].description += " (Rejected by Admin)";
      }

      data.notifications.push({
        id: generateId("notif"),
        userId: deposit.userId,
        title: "Deposit Rejected",
        body: `Your deposit request of $${deposit.amount.toFixed(2)} was rejected. Please verify the receipt/payment details and try again.`,
        type: "error",
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    db.save(data);
    res.json({ success: true, deposit });
  });

  // Admin: Approve / Reject Withdrawal
  app.put("/api/admin/withdrawals/:id", requireAuth, requireAdmin, (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // APPROVE or REJECT

    const data = db.get();
    const withdrawalIndex = data.withdrawals.findIndex((w) => w.id === id);
    if (withdrawalIndex === -1) {
      return res.status(404).json({ success: false, message: "Withdrawal request not found" });
    }

    const withdrawal = data.withdrawals[withdrawalIndex];
    if (withdrawal.status !== TransactionStatus.PENDING) {
      return res.status(400).json({ success: false, message: "Withdrawal is already processed" });
    }

    const walletIndex = data.wallets.findIndex((w) => w.userId === withdrawal.userId);
    if (walletIndex === -1) {
      return res.status(404).json({ success: false, message: "User wallet not found" });
    }

    const wallet = data.wallets[walletIndex];

    if (action === "APPROVE") {
      withdrawal.status = TransactionStatus.COMPLETED;
      withdrawal.approvedAt = new Date().toISOString();

      // Finalize wallet lock deduction
      wallet.lockedBalance -= withdrawal.amount;
      wallet.totalWithdraw += withdrawal.amount;

      // Update Transaction status
      const tx = data.transactions.find(
        (t) => t.userId === withdrawal.userId && t.type === TransactionType.WITHDRAWAL && t.status === TransactionStatus.PENDING
      );
      if (tx) {
        tx.status = TransactionStatus.COMPLETED;
      }

      // Notify User
      data.notifications.push({
        id: generateId("notif"),
        userId: withdrawal.userId,
        title: "Withdrawal Approved!",
        body: `Your withdrawal of $${withdrawal.amount.toFixed(2)} (Fee: $${withdrawal.fee.toFixed(2)}) has been approved and paid.`,
        type: "success",
        read: false,
        createdAt: new Date().toISOString(),
      });
    } else {
      withdrawal.status = TransactionStatus.FAILED;

      // Refund user from locked balance back to active balance
      wallet.lockedBalance -= withdrawal.amount;
      wallet.balance += withdrawal.amount;

      // Update Transaction
      const tx = data.transactions.find(
        (t) => t.userId === withdrawal.userId && t.type === TransactionType.WITHDRAWAL && t.status === TransactionStatus.PENDING
      );
      if (tx) {
        tx.status = TransactionStatus.FAILED;
        tx.description += " (Rejected and Refunded)";
      }

      data.notifications.push({
        id: generateId("notif"),
        userId: withdrawal.userId,
        title: "Withdrawal Rejected",
        body: `Your withdrawal of $${withdrawal.amount.toFixed(2)} was rejected. The full amount has been refunded back to your balance.`,
        type: "error",
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    db.save(data);
    res.json({ success: true, withdrawal });
  });

  // Admin: Approve / Reject KYC
  app.put("/api/admin/kyc/:userId", requireAuth, requireAdmin, (req, res) => {
    const { userId } = req.params;
    const { action, reason } = req.body; // APPROVE or REJECT

    const data = db.get();
    const userIndex = data.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (action === "APPROVE") {
      data.users[userIndex].kycStatus = KYCStatus.APPROVED;
      data.notifications.push({
        id: generateId("notif"),
        userId,
        title: "KYC Verified!",
        body: "Congratulations! Your identity verification has been approved. You now have full withdrawal and investment access.",
        type: "success",
        read: false,
        createdAt: new Date().toISOString(),
      });
    } else {
      data.users[userIndex].kycStatus = KYCStatus.REJECTED;
      if (data.users[userIndex].kycDetails) {
        data.users[userIndex].kycDetails!.rejectionReason = reason || "Incomplete document details or blur image.";
      }
      data.notifications.push({
        id: generateId("notif"),
        userId,
        title: "KYC Rejected",
        body: `Your identity verification request was rejected. Reason: ${reason || "Blur or mismatching document details"}. Please resubmit.`,
        type: "error",
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    db.save(data);
    res.json({ success: true, user: data.users[userIndex] });
  });

  // --- ROI ENGINE SIMULATION ---
  // To provide a breathtaking dynamic feedback, let's simulate daily returns inside AI Studio.
  // We run an automated loop that triggers every 15 seconds.
  // It checks all ACTIVE investments, calculates a miniature payout representing 1 "tick", adds it directly
  // to returnsEarned and credits the user's available balance! This makes the dashboard charts and balances live!
  setInterval(() => {
    const data = db.get();
    let updated = false;

    data.investments.forEach((inv) => {
      if (inv.status === InvestmentStatus.ACTIVE) {
        // Daily rate is inv.dailyRoi. Since we want live payouts, let's credit a small tick amount!
        // Suppose a tick equals 1% of daily profit, paid out every 15 seconds.
        // Payout = inv.amount * (inv.dailyRoi / 100) * 0.1; (Let's make it a noticeable amount to excite the user, e.g. 0.05% of investment)
        const payout = inv.amount * (inv.dailyRoi / 100) * 0.05;
        
        inv.returnsEarned += payout;

        // Credit to owner's wallet
        const wallet = data.wallets.find((w) => w.userId === inv.userId);
        if (wallet) {
          wallet.balance += payout;
          wallet.totalProfit += payout;

          // Record as micro-earning transaction
          const earningRef = generateRef("ROI");
          data.transactions.push({
            id: generateId("tx"),
            userId: inv.userId,
            walletId: wallet.id,
            referenceNo: earningRef,
            type: TransactionType.ROI,
            amount: payout,
            fee: 0,
            netAmount: payout,
            status: TransactionStatus.COMPLETED,
            description: `Live ROI Payout tick from ${inv.planTitle}`,
            createdAt: new Date().toISOString(),
          });

          updated = true;
        }

        // Simulate maturity if returns earned >= expected profit
        if (inv.returnsEarned >= inv.expectedProfit) {
          inv.status = InvestmentStatus.COMPLETED;
          inv.completedAt = new Date().toISOString();

          // Return capital to wallet balance if plan specifies capital return
          const wallet = data.wallets.find((w) => w.userId === inv.userId);
          if (wallet) {
            wallet.lockedBalance -= inv.amount;
            wallet.balance += inv.amount; // Capital returned

            // Transaction for capital return
            data.transactions.push({
              id: generateId("tx"),
              userId: inv.userId,
              walletId: wallet.id,
              referenceNo: generateRef("CAP"),
              type: TransactionType.ADJUSTMENT,
              amount: inv.amount,
              fee: 0,
              netAmount: inv.amount,
              status: TransactionStatus.COMPLETED,
              description: `Maturity Capital Return from ${inv.planTitle}`,
              createdAt: new Date().toISOString(),
            });

            data.notifications.push({
              id: generateId("notif"),
              userId: inv.userId,
              title: "Investment Plan Matured",
              body: `Your investment in ${inv.planTitle} has completed. Capital of $${inv.amount.toFixed(2)} has been unlocked.`,
              type: "success",
              read: false,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    });

    if (updated) {
      db.save(data);
    }
  }, 15000);

  // Serve static assets / Vite Dev Server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[WealthGlow Server] running on http://localhost:${PORT}`);
  });
}

startServer();
