/**
 * Tollkeeper Scoring & Risk Evaluation Engine
 * Evaluates Solana Wallets and Token Mints against strict rule-based criteria.
 */

import {
  AddressType,
  RiskReason,
  RiskReport,
  Verdict,
  WalletDetails,
  TokenMintDetails,
} from './types';
import { ScoringThresholds, DEFAULT_THRESHOLDS } from '../config/thresholds';
import {
  getAccountInfo,
  getBalance,
  getSignaturesForAddress,
  getTokenSupply,
  getTokenLargestAccounts,
  validateSolanaAddress,
} from './solana';

const SPL_TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

/**
 * Calculates verdict from score based on current thresholds
 */
export function getVerdictFromScore(score: number, thresholds: ScoringThresholds): Verdict {
  if (score <= thresholds.safeMaxScore) return 'SAFE';
  if (score <= thresholds.cautionMaxScore) return 'CAUTION';
  return 'BLOCK';
}

/**
 * Evaluates a Wallet address on Solana
 */
async function evaluateWallet(
  address: string,
  thresholds: ScoringThresholds,
  customRpc?: string
): Promise<{
  score: number;
  reasons: RiskReason[];
  summary: string;
  walletDetails: WalletDetails;
}> {
  const [balanceLamports, signatures] = await Promise.all([
    getBalance(address, customRpc),
    getSignaturesForAddress(address, 1000, customRpc),
  ]);

  const balanceSol = balanceLamports / 1_000_000_000;
  const txCount = signatures.length;
  const hasMoreThan1000 = txCount >= 1000;

  let oldestTxTimestamp: number | null = null;
  let ageInDays: number | null = null;

  if (txCount > 0) {
    const oldestSig = signatures[signatures.length - 1];
    if (oldestSig.blockTime) {
      oldestTxTimestamp = oldestSig.blockTime;
      const nowSec = Math.floor(Date.now() / 1000);
      ageInDays = Math.max(0, Math.round(((nowSec - oldestTxTimestamp) / 86400) * 10) / 10);
    }
  }

  const reasons: RiskReason[] = [];
  let score = 0;

  // Rule 1: No transaction history (+40)
  if (txCount === 0) {
    score += thresholds.walletNoHistory;
    reasons.push({
      id: 'wallet_no_history',
      title: 'No Transaction History',
      description: 'This address has never recorded any transactions on Solana.',
      pointsAdded: thresholds.walletNoHistory,
      evidence: 'Signatures count = 0. No prior on-chain interaction found.',
      severity: 'critical',
    });
  }

  // Rule 2: Wallet younger than 7 days (+35, only if fewer than 1000 signatures)
  if (!hasMoreThan1000 && ageInDays !== null && ageInDays < 7) {
    score += thresholds.walletYoungerThan7Days;
    reasons.push({
      id: 'wallet_young_age',
      title: 'New Account (< 7 Days Old)',
      description: 'Account was first active less than a week ago, a common marker for burner wallets.',
      pointsAdded: thresholds.walletYoungerThan7Days,
      evidence: `First transaction recorded ${ageInDays} days ago (${new Date((oldestTxTimestamp || 0) * 1000).toLocaleDateString()}).`,
      severity: 'high',
    });
  }

  // Rule 3: Fewer than 5 transactions (+15)
  if (txCount > 0 && txCount < 5) {
    score += thresholds.walletFewerThan5Txs;
    reasons.push({
      id: 'wallet_few_txs',
      title: 'Sparse Activity (< 5 Transactions)',
      description: 'Wallet has very low lifetime engagement, indicating lack of verified reputation.',
      pointsAdded: thresholds.walletFewerThan5Txs,
      evidence: `Total transactions recorded = ${txCount} (threshold is at least 5).`,
      severity: 'medium',
    });
  }

  // Rule 4: Zero balance (+10)
  if (balanceSol === 0) {
    score += thresholds.walletZeroBalance;
    reasons.push({
      id: 'wallet_zero_balance',
      title: 'Zero SOL Balance',
      description: 'Wallet holds no native SOL, which is unusual for established payment receivers.',
      pointsAdded: thresholds.walletZeroBalance,
      evidence: `Current native balance: 0.000000 SOL (${balanceLamports} lamports).`,
      severity: 'low',
    });
  }

  // Clamp score
  score = Math.min(100, Math.max(0, score));

  // Plain-English summary
  let summary = '';
  if (score === 0) {
    summary = `Mature Solana wallet with ${hasMoreThan1000 ? '1,000+' : txCount} verified transactions and ${balanceSol.toFixed(4)} SOL balance. No anomalous flags detected.`;
  } else if (score < thresholds.cautionMaxScore) {
    summary = `Wallet exhibits minor risk signals (${score}/100) including ${reasons.map((r) => r.title.toLowerCase()).join(' and ')}. Manual confirmation suggested.`;
  } else {
    summary = `High risk detected (${score}/100). The destination shows characteristics typical of disposable or unvetted accounts (${reasons.map((r) => r.title).join(', ')}).`;
  }

  const walletDetails: WalletDetails = {
    balanceSol,
    transactionCount: txCount,
    oldestTxTimestamp,
    ageInDays,
    hasMoreThan1000Txs: hasMoreThan1000,
    ownerProgram: 'System Program',
  };

  return { score, reasons, summary, walletDetails };
}

/**
 * Evaluates a Token Mint address on Solana
 */
async function evaluateTokenMint(
  address: string,
  accountInfo: any,
  thresholds: ScoringThresholds,
  customRpc?: string
): Promise<{
  score: number;
  reasons: RiskReason[];
  summary: string;
  tokenMintDetails: TokenMintDetails;
}> {
  const parsedData = accountInfo?.data?.parsed?.info;
  const mintAuthority: string | null = parsedData?.mintAuthority ?? null;
  const freezeAuthority: string | null = parsedData?.freezeAuthority ?? null;
  const decimals: number = parsedData?.decimals ?? 0;
  const rawSupply: string = parsedData?.supply ?? '0';

  const [supplyInfo, largestAccounts] = await Promise.all([
    getTokenSupply(address, customRpc),
    getTokenLargestAccounts(address, customRpc),
  ]);

  const supplyFormatted = supplyInfo?.uiAmountString ?? (parseInt(rawSupply, 10) / 10 ** decimals).toString();

  // Calculate top 10 concentration
  let top10HoldersSharePct: number | null = null;
  const totalRawSupplyNum = supplyInfo?.uiAmount ?? (Number(rawSupply) / 10 ** decimals);

  if (largestAccounts.length > 0 && totalRawSupplyNum > 0) {
    const top10Total = largestAccounts
      .slice(0, 10)
      .reduce((sum, item) => sum + (item.uiAmount || 0), 0);
    top10HoldersSharePct = Math.round((top10Total / totalRawSupplyNum) * 100);
  }

  const reasons: RiskReason[] = [];
  let score = 0;

  // Rule 1: Mint authority NOT renounced (+30)
  if (mintAuthority !== null) {
    score += thresholds.tokenMintAuthNotRenounced;
    reasons.push({
      id: 'token_mint_auth_active',
      title: 'Mint Authority Not Renounced',
      description: 'The creator or admin can print unlimited additional supply at any moment, diluting holders.',
      pointsAdded: thresholds.tokenMintAuthNotRenounced,
      evidence: `Active Mint Authority: ${mintAuthority}`,
      severity: 'high',
    });
  }

  // Rule 2: Freeze authority present (+20)
  if (freezeAuthority !== null) {
    score += thresholds.tokenFreezeAuthPresent;
    reasons.push({
      id: 'token_freeze_auth_active',
      title: 'Freeze Authority Active',
      description: 'The issuer possesses permissions to freeze token accounts and prevent autonomous transfers or liquidation.',
      pointsAdded: thresholds.tokenFreezeAuthPresent,
      evidence: `Active Freeze Authority: ${freezeAuthority}`,
      severity: 'high',
    });
  }

  // Rule 3: Top 10 holders concentration (+35 if > 80%, +20 if > 50%)
  if (top10HoldersSharePct !== null) {
    if (top10HoldersSharePct > 80) {
      score += thresholds.tokenTop10Over80Percent;
      reasons.push({
        id: 'token_extreme_concentration',
        title: 'Severe Holder Concentration (>80%)',
        description: 'The top 10 holder accounts control over 80% of the entire circulating supply, presenting severe exit-liquidity dump danger.',
        pointsAdded: thresholds.tokenTop10Over80Percent,
        evidence: `Top 10 accounts control ${top10HoldersSharePct}% of total supply across ${largestAccounts.length} analyzed accounts.`,
        severity: 'critical',
      });
    } else if (top10HoldersSharePct > 50) {
      score += thresholds.tokenTop10Over50Percent;
      reasons.push({
        id: 'token_high_concentration',
        title: 'High Holder Concentration (>50%)',
        description: 'More than half of the total supply is centralized among the 10 largest token holders.',
        pointsAdded: thresholds.tokenTop10Over50Percent,
        evidence: `Top 10 accounts control ${top10HoldersSharePct}% of total supply.`,
        severity: 'medium',
      });
    }
  }

  score = Math.min(100, Math.max(0, score));

  let summary = '';
  if (score === 0) {
    summary = `Verified safe token mint. Mint and freeze authorities are permanently renounced, and token distribution is decentralized.`;
  } else if (score < thresholds.cautionMaxScore) {
    summary = `Token mint exhibits moderate control flags (${score}/100). Review authorities and liquidity distribution before proceeding.`;
  } else {
    summary = `High token risk detected (${score}/100). The token retains critical control powers or concentrated distribution (${reasons.map((r) => r.title).join(', ')}).`;
  }

  const tokenMintDetails: TokenMintDetails = {
    mintAuthority,
    freezeAuthority,
    decimals,
    supplyFormatted,
    rawSupply,
    top10HoldersSharePct,
    topHoldersCount: largestAccounts.length,
  };

  return { score, reasons, summary, tokenMintDetails };
}

/**
 * Main Analysis Orchestrator
 */
export async function analyzeSolanaAddress(
  address: string,
  thresholds: ScoringThresholds = DEFAULT_THRESHOLDS,
  customRpc?: string
): Promise<RiskReport> {
  const startTime = performance.now();
  const trimmed = address.trim();

  // Check format first
  const validation = validateSolanaAddress(trimmed);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid Solana address.');
  }

  // Step 1: Detect account info
  const accountInfo = await getAccountInfo(trimmed, customRpc);

  let detectedType: AddressType = 'wallet';
  let isTokenMint = false;

  if (accountInfo) {
    const owner = accountInfo.owner;
    const isTokenOwner = owner === SPL_TOKEN_PROGRAM_ID || owner === TOKEN_2022_PROGRAM_ID;
    const parsedType = accountInfo.data?.parsed?.type;

    if (isTokenOwner && parsedType === 'mint') {
      detectedType = 'token_mint';
      isTokenMint = true;
    } else if (accountInfo.executable) {
      detectedType = 'program';
    } else {
      detectedType = 'wallet';
    }
  }

  let score = 0;
  let reasons: RiskReason[] = [];
  let summary = '';
  let walletDetails: WalletDetails | undefined;
  let tokenMintDetails: TokenMintDetails | undefined;

  if (isTokenMint) {
    const result = await evaluateTokenMint(trimmed, accountInfo, thresholds, customRpc);
    score = result.score;
    reasons = result.reasons;
    summary = result.summary;
    tokenMintDetails = result.tokenMintDetails;
  } else {
    // If not a token mint, evaluate under wallet/account rules
    const result = await evaluateWallet(trimmed, thresholds, customRpc);
    score = result.score;
    reasons = result.reasons;
    summary = result.summary;
    walletDetails = result.walletDetails;
  }

  const verdict = getVerdictFromScore(score, thresholds);
  const executionTimeMs = Math.round(performance.now() - startTime);

  return {
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    address: trimmed,
    detectedType,
    score,
    verdict,
    timestamp: Date.now(),
    summary,
    reasons,
    executionTimeMs,
    walletDetails,
    tokenMintDetails,
  };
}

// ------------------- PRESET DEMO DATA (CLEARLY LABELED) -------------------

export const PRESET_DEMO_REPORTS: Record<string, RiskReport> = {
  // Preset 1: Known-Good Safe Wallet
  'safe-treasury': {
    id: 'demo_safe_treasury',
    address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    detectedType: 'wallet',
    score: 0,
    verdict: 'SAFE',
    timestamp: Date.now() - 3600000,
    summary: 'Mature Solana settlement wallet with 1,000+ verified transactions and 482.45 SOL balance. No anomalous flags detected.',
    reasons: [],
    executionTimeMs: 142,
    isDemo: true,
    walletDetails: {
      balanceSol: 482.451,
      transactionCount: 1000,
      oldestTxTimestamp: Math.floor(Date.now() / 1000) - 86400 * 420,
      ageInDays: 420,
      hasMoreThan1000Txs: true,
      ownerProgram: 'System Program',
    },
  },

  // Preset 2: Cautionary New Wallet (3 txs, 2 days old)
  'caution-new-wallet': {
    id: 'demo_caution_new_wallet',
    address: '4uQeVj5tqViQh7yWWGStvkEG1Zmhx6uasJtWCJziofM',
    detectedType: 'wallet',
    score: 50,
    verdict: 'CAUTION',
    timestamp: Date.now() - 1800000,
    summary: 'Wallet exhibits cautionary risk signals (50/100) including young account age (< 7 days) and sparse activity. Human payment confirmation recommended.',
    reasons: [
      {
        id: 'wallet_young_age',
        title: 'New Account (< 7 Days Old)',
        description: 'Account was first active less than a week ago, a common marker for burner wallets.',
        pointsAdded: 35,
        evidence: 'First transaction recorded 2.4 days ago on Solana Mainnet.',
        severity: 'high',
      },
      {
        id: 'wallet_few_txs',
        title: 'Sparse Activity (< 5 Transactions)',
        description: 'Wallet has very low lifetime engagement, indicating lack of verified reputation.',
        pointsAdded: 15,
        evidence: 'Total transactions recorded = 3 (threshold is at least 5).',
        severity: 'medium',
      },
    ],
    executionTimeMs: 188,
    isDemo: true,
    walletDetails: {
      balanceSol: 1.25,
      transactionCount: 3,
      oldestTxTimestamp: Math.floor(Date.now() / 1000) - 86400 * 2.4,
      ageInDays: 2.4,
      hasMoreThan1000Txs: false,
      ownerProgram: 'System Program',
    },
  },

  // Preset 3: High-Risk Honeypot Token Mint (Block)
  'block-honeypot-token': {
    id: 'demo_block_honeypot_token',
    address: 'DUMMYhoneypotMintToken111111111111111111111',
    detectedType: 'token_mint',
    score: 85,
    verdict: 'BLOCK',
    timestamp: Date.now() - 900000,
    summary: 'Severe risk detected (85/100). The token mint retains active minting power, active freeze authority, and extreme holder centralization (92% owned by top 10).',
    reasons: [
      {
        id: 'token_extreme_concentration',
        title: 'Severe Holder Concentration (>80%)',
        description: 'The top 10 holder accounts control over 80% of the entire circulating supply, presenting severe exit-liquidity dump danger.',
        pointsAdded: 35,
        evidence: 'Top 10 accounts control 92% of total circulating supply.',
        severity: 'critical',
      },
      {
        id: 'token_mint_auth_active',
        title: 'Mint Authority Not Renounced',
        description: 'The creator or admin can print unlimited additional supply at any moment, diluting holders.',
        pointsAdded: 30,
        evidence: 'Active Mint Authority: 7Xw9...B9k2 (unrenounced).',
        severity: 'high',
      },
      {
        id: 'token_freeze_auth_active',
        title: 'Freeze Authority Active',
        description: 'The issuer possesses permissions to freeze token accounts and prevent autonomous transfers or liquidation.',
        pointsAdded: 20,
        evidence: 'Active Freeze Authority: 7Xw9...B9k2 (admin can freeze accounts).',
        severity: 'high',
      },
    ],
    executionTimeMs: 215,
    isDemo: true,
    tokenMintDetails: {
      mintAuthority: '7Xw9rY8F3D7fXpZ3j7kQx2M9jN2P4R7S8T9U0V1W2X3',
      freezeAuthority: '7Xw9rY8F3D7fXpZ3j7kQx2M9jN2P4R7S8T9U0V1W2X3',
      decimals: 9,
      supplyFormatted: '1,000,000,000',
      rawSupply: '1000000000000000000',
      top10HoldersSharePct: 92,
      topHoldersCount: 14,
    },
  },
};
