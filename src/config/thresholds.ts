/**
 * Tollkeeper Risk Scoring Configuration & Thresholds
 * All weights and score boundaries are configurable and tunable.
 */

export interface ScoringThresholds {
  // Verdict boundaries (0-100)
  safeMaxScore: number;       // 0 - 24: SAFE
  cautionMaxScore: number;    // 25 - 59: CAUTION
  // 60+: BLOCK

  // Wallet penalty weights
  walletNoHistory: number;    // +40 risk
  walletYoungerThan7Days: number; // +35 risk (if signatures < 1000)
  walletFewerThan5Txs: number;    // +15 risk
  walletZeroBalance: number;      // +10 risk

  // Token mint penalty weights
  tokenMintAuthNotRenounced: number; // +30 risk
  tokenFreezeAuthPresent: number;    // +20 risk
  tokenTop10Over80Percent: number;   // +35 risk
  tokenTop10Over50Percent: number;   // +20 risk
}

export const DEFAULT_THRESHOLDS: ScoringThresholds = {
  safeMaxScore: 24,
  cautionMaxScore: 59,
  walletNoHistory: 40,
  walletYoungerThan7Days: 35,
  walletFewerThan5Txs: 15,
  walletZeroBalance: 10,
  tokenMintAuthNotRenounced: 30,
  tokenFreezeAuthPresent: 20,
  tokenTop10Over80Percent: 35,
  tokenTop10Over50Percent: 20,
};

export const DEFAULT_RPC_URL = 
  import.meta.env.VITE_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
