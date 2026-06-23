import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Scan, Lock, Key, ShieldAlert } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';
import type { UserProfile } from './AuthModule';

interface BiometricLockScreenProps {
  currentUser: UserProfile;
  onUnlock: () => void;
  onLogout: () => void;
  verifyPassword: (password: string) => Promise<boolean>;
}

export const BiometricLockScreen: React.FC<BiometricLockScreenProps> = ({
  currentUser,
  onUnlock,
  onLogout,
  verifyPassword
}) => {
  const [authMode, setAuthMode] = useState<'biometric' | 'password'>('biometric');
  const [isScanning, setIsScanning] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const biometricLabel = currentUser.biometricType || 'Biometric Key';

  useEffect(() => {
    // Automatically switch to password mode if biometrics are disabled for web
    // but keep the biometric tab available for UI compliance
  }, [authMode]);



  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsScanning(true);

    const success = await verifyPassword(password);
    setIsScanning(false);

    if (success) {
      onUnlock();
    } else {
      setErrorMsg('Invalid password. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#03000a] flex flex-col justify-center items-center p-6 text-zinc-100 overflow-hidden">
      {/* Background glow flares */}
      <div className="absolute top-[15%] left-[20%] w-[300px] h-[300px] bg-brand-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[20%] w-[300px] h-[300px] bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10 text-center space-y-8">
        {/* App Title */}
        <div className="flex items-center justify-center space-x-2">
          <div className="p-2 bg-brand-violet/10 border border-brand-violet/20 rounded-xl text-brand-cyan shadow-glow-purple">
            <Lock className="h-5 w-5" />
          </div>
          <span className="font-display font-black text-xl tracking-wider text-white">
            FIT<span className="text-brand-violet">AI</span> SECURE
          </span>
        </div>

        <SpotlightCard className="p-8">
          <AnimatePresence mode="wait">
            {authMode === 'biometric' ? (
              <motion.div
                key="biometric"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6 flex flex-col items-center"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-display font-extrabold text-white">App is Locked</h3>
                  <p className="text-xs text-zinc-400">Biometrics are configured for mobile environments.</p>
                </div>

                {/* Scanner Target Circle */}
                <div className="relative h-32 w-32 flex items-center justify-center bg-dark-950 border border-white/5 rounded-full my-6 opacity-60">
                  {/* Icon representation (disabled style) */}
                  {biometricLabel.includes('Fingerprint') || biometricLabel.includes('Touch ID') ? (
                    <Fingerprint className="w-14 h-14 text-zinc-600 cursor-not-allowed" />
                  ) : (
                    <Scan className="w-14 h-14 text-zinc-600 cursor-not-allowed" />
                  )}
                </div>

                <div className="space-y-4 w-full">
                  <p className="text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl leading-relaxed">
                    Biometric unlock will be available in the FitAI mobile app.
                  </p>

                  <button
                    type="button"
                    onClick={() => setAuthMode('password')}
                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5" /> Use Password Instead
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="password"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <form onSubmit={handlePasswordSubmit} className="space-y-5 text-left">
                  <div className="space-y-1 text-center">
                    <h3 className="text-lg font-display font-extrabold text-white">Verify Password</h3>
                    <p className="text-xs text-zinc-400">Unlock your active session using password.</p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Account Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet font-mono"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isScanning}
                    className="w-full py-3 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-black rounded-xl hover:scale-101 hover:shadow-glow-purple transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isScanning ? 'Verifying...' : 'Verify & Unlock App'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMode('biometric')}
                    className="w-full text-center text-xs font-bold text-brand-cyan hover:underline mt-2 block"
                  >
                    Back to Biometric Scan
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </SpotlightCard>

        {/* Alternate log out link */}
        <button
          onClick={onLogout}
          className="text-xs text-zinc-500 hover:text-red-400 font-bold tracking-wider uppercase transition-colors min-h-[44px]"
        >
          Exit & Log Out of Account 🚪
        </button>
      </div>
    </div>
  );
};
