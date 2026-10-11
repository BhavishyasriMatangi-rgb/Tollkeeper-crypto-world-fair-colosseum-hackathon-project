/**
 * Solana JSON-RPC Client & Verification Engine
 * Read-only, no private keys, supports rate-limit backoff and 60-second in-memory caching.
 */

import { getStoredSettings } from './storage';

// Base58 regex: 32 to 44 alphanumeric characters excluding 0, O, I, l
const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export interface Base58ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateSolanaAddress(address: string): Base58ValidationResult {
  const trimmed = address.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Address is required.' };
  }
  if (trimmed.length < 32 || trimmed.length > 44) {
    return {
      isValid: false,
      error: `Address length is ${trimmed.length} characters. Solana addresses must be 32 to 44 characters.`,
    };
  }
  if (!BASE58_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: 'Invalid characters found. Solana addresses use Base58 (no 0, O, I, or l).',
    };
  }
  return { isValid: true };
}

// 60-second in-memory cache: address -> { timestamp, data }
interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 60_000; // 60 seconds

export function clearMemoryCache() {
  memoryCache.clear();
}

export class SolanaRpcError extends Error {
  isRateLimit: boolean;
  statusCode?: number;
  retryAfterSeconds?: number;

  constructor(message: string, isRateLimit = false, statusCode?: number, retryAfterSeconds?: number) {
    super(message);
    this.name = 'SolanaRpcError';
    this.isRateLimit = isRateLimit;
    this.statusCode = statusCode;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Executes a raw Solana JSON-RPC call with retry logic and rate-limit handling.
 */
export async function callSolanaRpc<T = any>(
  method: string,
  params: any[] = [],
  customRpcUrl?: string,
  retryCount = 0
): Promise<T> {
  const rpcUrl = customRpcUrl || getStoredSettings().rpcUrl;

  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: `tk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        method,
        params,
      }),
    });

    if (response.status === 429) {
      const retryHeader = response.headers.get('Retry-After');
      const retrySec = retryHeader ? parseInt(retryHeader, 10) : 5 * (retryCount + 1);
      
      if (retryCount < 2) {
        // Wait and retry once or twice with backoff
        await new Promise((res) => setTimeout(res, retrySec * 1000));
        return callSolanaRpc<T>(method, params, customRpcUrl, retryCount + 1);
      }
      throw new SolanaRpcError(
        'Public Solana RPC rate limit exceeded (429). Please wait a moment or configure your own Helius/RPC URL in Settings.',
        true,
        429,
        retrySec
      );
    }

    if (!response.ok) {
      throw new SolanaRpcError(
        `RPC HTTP error ${response.status}: ${response.statusText}`,
        false,
        response.status
      );
    }

    const json = await response.json();

    if (json.error) {
      const msg = json.error.message || 'RPC returned error';
      const isLimit = msg.toLowerCase().includes('rate') || msg.toLowerCase().includes('limit');
      throw new SolanaRpcError(msg, isLimit, isLimit ? 429 : 500);
    }

    return json.result;
  } catch (error: any) {
    if (error instanceof SolanaRpcError) {
      throw error;
    }
    const message = error?.message || 'Network request failed';
    const isLimit = message.toLowerCase().includes('rate') || message.includes('429');
    throw new SolanaRpcError(message, isLimit, isLimit ? 429 : undefined);
  }
}

// ------------------- HIGH-LEVEL QUERIES -------------------

export interface RawAccountInfo {
  lamports: number;
  owner: string;
  executable: boolean;
  rentEpoch: number;
  data: any;
}

export interface RawSignatureInfo {
  signature: string;
  slot: number;
  err: any | null;
  memo: string | null;
  blockTime: number | null; // unix timestamp in seconds
}

export interface RawTokenSupply {
  amount: string;
  decimals: number;
  uiAmount: number | null;
  uiAmountString: string;
}

export interface RawTokenLargestAccount {
  address: string;
  amount: string;
  decimals: number;
  uiAmount: number | null;
  uiAmountString: string;
}

/**
 * Fetches account information with jsonParsed encoding.
 */
export async function getAccountInfo(address: string, customRpc?: string): Promise<RawAccountInfo | null> {
  const cacheKey = `accountInfo:${address}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const result = await callSolanaRpc<{ value: RawAccountInfo | null }>(
    'getAccountInfo',
    [address, { encoding: 'jsonParsed' }],
    customRpc
  );

  const data = result?.value ?? null;
  memoryCache.set(cacheKey, { timestamp: Date.now(), data });
  return data;
}

/**
 * Fetches SOL balance in lamports.
 */
export async function getBalance(address: string, customRpc?: string): Promise<number> {
  const cacheKey = `balance:${address}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const result = await callSolanaRpc<{ value: number }>(
    'getBalance',
    [address],
    customRpc
  );

  const lamports = result?.value ?? 0;
  memoryCache.set(cacheKey, { timestamp: Date.now(), data: lamports });
  return lamports;
}

/**
 * Fetches transaction signatures for address (up to 1000).
 */
export async function getSignaturesForAddress(
  address: string,
  limit = 1000,
  customRpc?: string
): Promise<RawSignatureInfo[]> {
  const cacheKey = `sigs:${address}:${limit}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const result = await callSolanaRpc<RawSignatureInfo[]>(
    'getSignaturesForAddress',
    [address, { limit }],
    customRpc
  );

  const list = Array.isArray(result) ? result : [];
  memoryCache.set(cacheKey, { timestamp: Date.now(), data: list });
  return list;
}

/**
 * Fetches token supply for a token mint.
 */
export async function getTokenSupply(mintAddress: string, customRpc?: string): Promise<RawTokenSupply | null> {
  const cacheKey = `supply:${mintAddress}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const result = await callSolanaRpc<{ value: RawTokenSupply }>(
      'getTokenSupply',
      [mintAddress],
      customRpc
    );
    const data = result?.value ?? null;
    memoryCache.set(cacheKey, { timestamp: Date.now(), data });
    return data;
  } catch (error) {
    console.warn('Could not fetch token supply:', error);
    return null;
  }
}

/**
 * Fetches the largest token accounts (top 20) for a token mint.
 */
export async function getTokenLargestAccounts(
  mintAddress: string,
  customRpc?: string
): Promise<RawTokenLargestAccount[]> {
  const cacheKey = `largest:${mintAddress}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const result = await callSolanaRpc<{ value: RawTokenLargestAccount[] }>(
      'getTokenLargestAccounts',
      [mintAddress],
      customRpc
    );
    const list = Array.isArray(result?.value) ? result.value : [];
    memoryCache.set(cacheKey, { timestamp: Date.now(), data: list });
    return list;
  } catch (error) {
    console.warn('Could not fetch largest accounts:', error);
    return [];
  }
}
