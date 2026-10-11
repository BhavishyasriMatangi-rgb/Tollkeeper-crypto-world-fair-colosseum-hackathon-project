import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings } from '../lib/types';
import { ScoringThresholds, DEFAULT_THRESHOLDS, DEFAULT_RPC_URL } from '../config/thresholds';
import { getStoredSettings, saveStoredSettings, clearAllLocalData } from '../lib/storage';

interface SettingsContextType {
  settings: AppSettings;
  updateRpcUrl: (url: string) => void;
  updateThresholds: (thresholds: Partial<ScoringThresholds>) => void;
  resetThresholds: () => void;
  clearAllData: () => boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  const updateRpcUrl = (url: string) => {
    const trimmed = url.trim() || DEFAULT_RPC_URL;
    setSettings((prev) => ({ ...prev, rpcUrl: trimmed }));
  };

  const updateThresholds = (thresholds: Partial<ScoringThresholds>) => {
    setSettings((prev) => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        ...thresholds,
      },
    }));
  };

  const resetThresholds = () => {
    setSettings((prev) => ({
      ...prev,
      thresholds: { ...DEFAULT_THRESHOLDS },
    }));
  };

  const clearAllData = () => {
    const success = clearAllLocalData();
    if (success) {
      setSettings({
        rpcUrl: DEFAULT_RPC_URL,
        thresholds: DEFAULT_THRESHOLDS,
        theme: 'system',
      });
    }
    return success;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateRpcUrl,
        updateThresholds,
        resetThresholds,
        clearAllData,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
