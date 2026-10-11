/**
 * Safe LocalStorage Persistence for Tollkeeper
 * Every read and write is wrapped in try/catch with fallback defaults.
 */

import { HistoryItem, WatchlistItem, AppSettings, UserProfile } from './types';
import { DEFAULT_THRESHOLDS, DEFAULT_RPC_URL } from '../config/thresholds';

const KEYS = {
  HISTORY: 'tollkeeper_history_v1',
  WATCHLIST: 'tollkeeper_watchlist_v1',
  SETTINGS: 'tollkeeper_settings_v1',
  USER: 'tollkeeper_user_v1',
  CACHE: 'tollkeeper_cache_v1',
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  rpcUrl: DEFAULT_RPC_URL,
  thresholds: DEFAULT_THRESHOLDS,
  theme: 'system',
};

// ------------------- HISTORY -------------------

export function getStoredHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(KEYS.HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to read history from localStorage:', error);
    return [];
  }
}

export function saveStoredHistory(history: HistoryItem[]): boolean {
  try {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('Failed to save history to localStorage:', error);
    return false;
  }
}

export function addHistoryItem(item: HistoryItem): HistoryItem[] {
  try {
    const current = getStoredHistory();
    // Prepend new check, deduplicate if already at top or limit to 100 entries
    const filtered = current.filter((h) => h.id !== item.id);
    const updated = [item, ...filtered].slice(0, 100);
    saveStoredHistory(updated);
    return updated;
  } catch (error) {
    console.warn('Failed to add history item:', error);
    return [item];
  }
}

export function clearStoredHistory(): boolean {
  try {
    localStorage.removeItem(KEYS.HISTORY);
    return true;
  } catch (error) {
    console.error('Failed to clear history:', error);
    return false;
  }
}

export function deleteStoredHistoryItem(id: string): HistoryItem[] {
  try {
    const current = getStoredHistory();
    const updated = current.filter((h) => h.id !== id);
    saveStoredHistory(updated);
    return updated;
  } catch (error) {
    console.warn('Failed to delete history item:', error);
    return [];
  }
}

// ------------------- WATCHLIST -------------------

export function getStoredWatchlist(): WatchlistItem[] {
  try {
    const raw = localStorage.getItem(KEYS.WATCHLIST);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to read watchlist from localStorage:', error);
    return [];
  }
}

export function saveStoredWatchlist(watchlist: WatchlistItem[]): boolean {
  try {
    localStorage.setItem(KEYS.WATCHLIST, JSON.stringify(watchlist));
    return true;
  } catch (error) {
    console.error('Failed to save watchlist to localStorage:', error);
    return false;
  }
}

export function addWatchlistItem(item: WatchlistItem): WatchlistItem[] {
  try {
    const current = getStoredWatchlist();
    const existingIndex = current.findIndex((w) => w.address === item.address);
    let updated: WatchlistItem[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...item };
    } else {
      updated = [item, ...current];
    }
    saveStoredWatchlist(updated);
    return updated;
  } catch (error) {
    console.warn('Failed to add watchlist item:', error);
    return [item];
  }
}

export function removeWatchlistItem(idOrAddress: string): WatchlistItem[] {
  try {
    const current = getStoredWatchlist();
    const updated = current.filter(
      (w) => w.id !== idOrAddress && w.address !== idOrAddress
    );
    saveStoredWatchlist(updated);
    return updated;
  } catch (error) {
    console.warn('Failed to remove watchlist item:', error);
    return [];
  }
}

// ------------------- SETTINGS -------------------

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      rpcUrl: parsed.rpcUrl || DEFAULT_SETTINGS.rpcUrl,
      thresholds: {
        ...DEFAULT_THRESHOLDS,
        ...(parsed.thresholds || {}),
      },
      theme: parsed.theme || DEFAULT_SETTINGS.theme,
    };
  } catch (error) {
    console.warn('Failed to read settings from localStorage:', error);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): boolean {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
    return false;
  }
}

// ------------------- USER / AUTH -------------------

export function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(KEYS.USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to read user from localStorage:', error);
    return null;
  }
}

export function saveStoredUser(user: UserProfile | null): boolean {
  try {
    if (!user) {
      localStorage.removeItem(KEYS.USER);
    } else {
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    }
    return true;
  } catch (error) {
    console.error('Failed to save user to localStorage:', error);
    return false;
  }
}

// ------------------- CLEAR ALL DATA -------------------

export function clearAllLocalData(): boolean {
  try {
    localStorage.removeItem(KEYS.HISTORY);
    localStorage.removeItem(KEYS.WATCHLIST);
    localStorage.removeItem(KEYS.SETTINGS);
    localStorage.removeItem(KEYS.USER);
    return true;
  } catch (error) {
    console.error('Failed to clear all data:', error);
    return false;
  }
}
