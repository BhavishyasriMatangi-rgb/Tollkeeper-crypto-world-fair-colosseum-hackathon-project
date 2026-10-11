import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getBalance } from '../../lib/solana';
import { Wallet, LogOut, ExternalLink, Sparkles, ChevronDown, Check, Shield } from 'lucide-react';

interface PhantomConnectButtonProps {
  className?: string;
  variant?: 'nav' | 'hero' | 'card';
}

export function PhantomConnectButton({ className = '', variant = 'nav' }: PhantomConnectButtonProps) {
  const { user, loginWithPhantom, logout, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch balance if phantom user
  useEffect(() => {
    if (user?.type === 'phantom' && user.phantomAddress) {
      getBalance(user.phantomAddress)
        .then((lamports) => setSolBalance(lamports / 1e9))
        .catch(() => setSolBalance(null));
    } else {
      setSolBalance(null);
    }
  }, [user]);

  const handleConnect = async () => {
    setIsConnecting(true);
    const solana = (window as any).phantom?.solana || (window as any).solana;

    if (!solana || !solana.isPhantom) {
      setIsConnecting(false);
      setIsOpenModal(true);
      return;
    }

    const res = await loginWithPhantom();
    setIsConnecting(false);

    if (res.success) {
      showToast({
        type: 'success',
        title: 'Phantom Connected',
        message: 'Wallet authenticated successfully.',
      });
    } else {
      showToast({
        type: 'error',
        title: 'Connection Failed',
        message: res.error || 'Connection request cancelled.',
      });
    }
  };

  // Allow sandbox simulation if browser extension is not available
  const handleSimulatePhantom = () => {
    const mockPubkey = '7Xw9rY8F3D7fXpZ3j7kQx2M9jN2P4R7S8T9U0V1W2X3';
    localStorage.setItem(
      'tollkeeper_user_v1',
      JSON.stringify({
        id: `phantom_${mockPubkey.substring(0, 8)}`,
        name: `${mockPubkey.substring(0, 4)}...${mockPubkey.substring(mockPubkey.length - 4)}`,
        phantomAddress: mockPubkey,
        type: 'phantom',
        createdAt: Date.now(),
      })
    );
    window.location.reload();
  };

  // If connected as Phantom
  if (isAuthenticated && user?.type === 'phantom' && user.phantomAddress) {
    const shortAddr = `${user.phantomAddress.slice(0, 4)}...${user.phantomAddress.slice(-4)}`;

    return (
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl bg-[#FAF5EB] dark:bg-[#15231B] text-[#1E1713] dark:text-[#FAF6EE] border border-[#D8B468]/70 hover:border-[#D8B468] transition-colors shadow-xs ${className}`}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="w-4 h-4 rounded-full bg-gradient-to-b from-[#E7C77E] to-[#C89F48] text-[10px] text-[#181109] font-bold flex items-center justify-center shrink-0">
            P
          </div>
          <span className="font-mono">{shortAddr}</span>
          {solBalance !== null && (
            <span className="hidden sm:inline font-mono text-[11px] text-[#8C764D] dark:text-[#E7C77E] tabular-nums">
              ({solBalance.toFixed(2)} SOL)
            </span>
          )}
          <ChevronDown className="w-3 h-3 text-[#8C764D]" />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl z-50 text-xs animate-in fade-in duration-150">
            <div className="p-2 border-b border-stone-100 dark:border-stone-800">
              <p className="text-[10px] text-stone-400 font-mono uppercase">Connected Phantom</p>
              <p className="font-mono font-medium text-stone-900 dark:text-stone-100 break-all select-all mt-0.5">
                {user.phantomAddress}
              </p>
              {solBalance !== null && (
                <p className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold mt-1">
                  Balance: {solBalance.toFixed(4)} SOL
                </p>
              )}
            </div>

            <a
              href={`https://explorer.solana.com/address/${user.phantomAddress}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
            >
              <span>View in Solana Explorer</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </a>

            <button
              onClick={() => {
                logout();
                setIsDropdownOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect Wallet</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-cinzel font-semibold text-[#181109] bg-gradient-to-b from-[#E7C77E] to-[#C89F48] hover:from-[#F0D594] hover:to-[#D5AB54] rounded-xl shadow-md border border-[#D8B468]/60 uppercase tracking-wider transition-all active:scale-95 ${className}`}
      >
        <div className="w-3.5 h-3.5 rounded-full bg-[#181109]/15 flex items-center justify-center text-[9px] font-bold text-[#181109]">
          P
        </div>
        <span>{isConnecting ? 'Connecting...' : 'Connect Phantom'}</span>
      </button>

      {/* Phantom Not Found Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
              <Wallet className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                Phantom Wallet Not Found
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                We couldn&apos;t detect the Phantom browser extension. Install Phantom for Chrome, Brave,
                or Firefox to sign in with your Solana key.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-cinzel font-semibold text-[#181109] bg-gradient-to-b from-[#E7C77E] to-[#C89F48] hover:from-[#F0D594] hover:to-[#D5AB54] rounded-xl shadow-md border border-[#D8B468]/60 transition-all uppercase tracking-wider active:scale-95"
              >
                <span>Get Phantom Wallet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleSimulatePhantom}
                className="w-full py-2.5 px-4 text-xs font-cinzel font-semibold rounded-xl bg-[#FAF6EE] dark:bg-[#15231B] hover:bg-[#F3ECE0] text-[#181109] dark:text-[#FAF6EE] border border-[#D8B468]/60 transition-all uppercase tracking-wider"
              >
                Connect Demo Sandbox Key (Testing)
              </button>

              <button
                onClick={() => setIsOpenModal(false)}
                className="w-full py-2 text-xs font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
