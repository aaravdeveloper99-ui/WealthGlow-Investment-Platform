/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum KYCStatus {
  PENDING_SUBMISSION = "PENDING_SUBMISSION",
  PENDING_REVIEW = "PENDING_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
  INVESTMENT = "INVESTMENT",
  ROI = "ROI",
  REFERRAL = "REFERRAL",
  BONUS = "BONUS",
  ADJUSTMENT = "ADJUSTMENT",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum InvestmentStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  referralCode: string;
  referredBy?: string; // sponsor's user ID
  status: UserStatus;
  kycStatus: KYCStatus;
  kycDetails?: {
    documentType: string;
    documentNumber: string;
    frontImage?: string;
    backImage?: string;
    selfieImage?: string;
    rejectionReason?: string;
  };
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    ifscCode: string;
    upiId?: string;
  };
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number; // available
  lockedBalance: number; // in active investments
  totalDeposit: number;
  totalWithdraw: number;
  totalProfit: number;
  totalBonus: number;
}

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  referenceNo: string;
  type: TransactionType;
  amount: number;
  fee: number;
  netAmount: number;
  status: TransactionStatus;
  description: string;
  createdAt: string;
}

export interface InvestmentPlan {
  id: string;
  title: string;
  minimumAmount: number;
  maximumAmount: number;
  roiPercentage: number; // expected ROI (e.g., 2% per day)
  durationDays: number;
  capitalReturn: boolean; // if capital is returned after maturity
  status: boolean; // active plan
}

export interface Investment {
  id: string;
  userId: string;
  planId: string;
  planTitle: string;
  amount: number;
  expectedProfit: number;
  dailyRoi: number;
  returnsEarned: number; // accumulated earnings so far
  startDate: string;
  endDate: string;
  status: InvestmentStatus;
  completedAt?: string;
  lastPayoutAt?: string;
}

export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  paymentMethod: string;
  paymentReference: string;
  receiptUrl?: string;
  status: TransactionStatus;
  createdAt: string;
  approvedAt?: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  fee: number;
  paymentMethod: string;
  bankAccount: string; // account number or upi id
  status: TransactionStatus;
  createdAt: string;
  approvedAt?: string;
}

export interface ReferralNode {
  userId: string;
  fullName: string;
  email: string;
  level: number;
  joinDate: string;
  investmentVolume: number;
}

export interface ReferralCommission {
  id: string;
  sponsorId: string;
  refereeId: string;
  refereeName: string;
  investmentId: string;
  amount: number;
  level: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}

export interface SystemStats {
  totalInvestors: number;
  totalAssets: number;
  totalWithdrawals: number;
  countriesCount: number;
}
