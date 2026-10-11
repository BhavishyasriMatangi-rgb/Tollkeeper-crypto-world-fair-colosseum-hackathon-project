/**
 * Tollkeeper Core TypeScript Types
 */

import { ScoringThresholds } from '../config/thresholds';

export type AddressType = 'wallet' | 'token_mint' | 'program' | 'unknown';
export type Verdict = 'SAFE' | 'CAUTION' | 'BLOCK';

export interface RiskReason {
  id: string;
  title: string;
  description: string;
  pointsAdded: number;
  evidence: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface WalletDetails {
  balanceSol: number;
  transactionCount: number;
  oldestTxTimestamp: number | null; // unix timestamp in seconds
  ageInDays: number | null;
  hasMoreThan1000Txs: boolean;
  ownerProgram: string;
}

export interface TokenMintDetails {
  mintAuthority: string | null;
  freezeAuthority: string | null;
  decimals: number;
  supplyFormatted: string;
  rawSupply: string;
  top10HoldersSharePct: number | null;
  topHoldersCount: number;
}

export interface RiskReport {
  id: string;
  address: string;
  detectedType: AddressType;
  score: number; // 0 - 100
  verdict: Verdict;
  timestamp: number; // milliseconds
  summary: string;
  reasons: RiskReason[];
  executionTimeMs: number;
  isDemo?: boolean;
  walletDetails?: WalletDetails;
  tokenMintDetails?: TokenMintDetails;
}

export interface HistoryItem {
  id: string;
  address: string;
  detectedType: AddressType;
  score: number;
  verdict: Verdict;
  timestamp: number;
  summary: string;
  isDemo?: boolean;
}

export interface WatchlistItem {
  id: string;
  address: string;
  label: string;
  notes?: string;
  detectedType: AddressType;
  lastVerdict: Verdict;
  lastScore: number;
  addedAt: number;
  lastCheckedAt: number;
  isDemo?: boolean;
}

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  type: 'guest' | 'email' | 'phantom';
  phantomAddress?: string;
  createdAt: number;
}

export interface AppSettings {
  rpcUrl: string;
  thresholds: ScoringThresholds;
  theme: 'light' | 'dark' | 'system';
  enableSound?: boolean;
}
