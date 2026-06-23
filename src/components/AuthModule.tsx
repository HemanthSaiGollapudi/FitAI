import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Mail, User, Shield, 
  ArrowRight, ShieldAlert, 
  Eye, EyeOff
} from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

// Import real Firebase auth elements
import { auth, googleProvider, isFirebaseConfigured } from '../firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';

export interface UserProfile {
  name: string;
  email: string;
  password?: string;
  age: number;
  gender: 'Male' | 'Female';
  height: number;
  weight: number;
  goal: string;
  dietPreference: 'Veg' | 'Non-Veg' | 'Eggetarian';
  activityLevel?: string;
  targetWeight?: number;
  biometricsEnabled: boolean;
  biometricType?: 'Android Fingerprint' | 'Android Face Unlock' | 'iPhone Face ID / Touch ID';
}

interface AuthModuleProps {
  onAuthSuccess: (user: UserProfile) => void;
}

const SEEDED_USER: UserProfile = {
  name: 'FitAI Coach',
  email: 'coach@fitai.com',
  password: 'Password123',
  age: 26,
  gender: 'Male',
  height: 175,
  weight: 74,
  goal: 'Gain Muscle',
  dietPreference: 'Veg',
  activityLevel: 'Moderately Active',
  targetWeight: 68,
  biometricsEnabled: false
};

export const AuthModule: React.FC<AuthModuleProps> = ({ onAuthSuccess }) => {
  const [view, setView] = useState<'login' | 'signup' | 'forgot_password'>(() => {
    const path = window.location.pathname;
    if (path === '/signup') return 'signup';
    if (path === '/forgot-password') return 'forgot_password';
    return 'login';
  });
  
  // Input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  
  // Registration specific fields
  const [name, setName] = useState('');
  const age = 25;
  const gender: 'Male' | 'Female' = 'Male';
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [goal, setGoal] = useState('Gain Muscle');
  const [dietPref, setDietPref] = useState<'Veg' | 'Non-Veg' | 'Eggetarian'>('Veg');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [unverifiedUser, setUnverifiedUser] = useState<FirebaseUser | null>(null);

  // Sync state view on browser history traversal
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setErrorMsg('');
      setSuccessMsg('');
      if (path === '/signup') {
        setView('signup');
      } else if (path === '/forgot-password') {
        setView('forgot_password');
      } else {
        setView('login');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initial user profiles seeding and remembered session check
  useEffect(() => {
    // Seed default coach profile metadata if none exists
    const usersRaw = localStorage.getItem('fitai_users');
    if (!usersRaw) {
      localStorage.setItem('fitai_users', JSON.stringify([SEEDED_USER]));
    } else {
      try {
        const users = JSON.parse(usersRaw);
        if (!users.some((u: any) => u.email.toLowerCase() === SEEDED_USER.email.toLowerCase())) {
          users.push(SEEDED_USER);
          localStorage.setItem('fitai_users', JSON.stringify(users));
        }
      } catch {}
    }

    // Check remember me
    const rememberedEmail = localStorage.getItem('fitai_remembered_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
    }
  }, []);

  const navigateToPath = (path: string) => {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  const getRegisteredUsers = (): UserProfile[] => {
    try {
      const raw = localStorage.getItem('fitai_users');
      return raw ? JSON.parse(raw) : [SEEDED_USER];
    } catch {
      return [SEEDED_USER];
    }
  };

  const saveRegisteredUsers = (users: UserProfile[]) => {
    localStorage.setItem('fitai_users', JSON.stringify(users));
  };

  // Validations helper
  const validateEmail = (val: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(val);
  };

  // Google Sign In handler (Real OAuth)
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!isFirebaseConfigured) {
      setErrorMsg('Google Sign-In is unavailable because Firebase is not configured.');
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      if (!fbUser.email) {
        setErrorMsg('Could not retrieve email from Google Account.');
        return;
      }

      // Look up profile details or build a default profile
      const users = getRegisteredUsers();
      let profile = users.find(u => u.email.toLowerCase() === fbUser.email!.toLowerCase());
      
      if (!profile) {
        const googleName = fbUser.displayName || 'Google Athlete';
        const defaultTargetWeight = Math.round(weight - 6);
        profile = {
          name: googleName,
          email: fbUser.email.toLowerCase(),
          age: 28,
          gender: 'Male',
          height: 180,
          weight: 78,
          goal: 'Lose Weight',
          dietPreference: 'Non-Veg',
          activityLevel: 'Moderately Active',
          targetWeight: defaultTargetWeight,
          biometricsEnabled: false
        };
        users.push(profile);
        saveRegisteredUsers(users);
      }

      onAuthSuccess(profile);
      navigateToPath('/dashboard');
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      // Display clean error or general failure message
      setErrorMsg(err.message || 'Google authentication was cancelled or failed.');
    }
  };

  // Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setUnverifiedUser(null);

    if (!isFirebaseConfigured) {
      setErrorMsg('Authentication is offline due to missing configuration.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      // Check if email is verified
      if (!fbUser.emailVerified) {
        setUnverifiedUser(fbUser);
        setErrorMsg('Please verify your email before logging in.');
        await signOut(auth);
        return;
      }

      // Find local profile
      const users = getRegisteredUsers();
      let profile = users.find(u => u.email.toLowerCase() === fbUser.email!.toLowerCase());

      if (!profile) {
        // Construct default profile if it's missing locally
        profile = {
          name: fbUser.displayName || 'Athlete',
          email: fbUser.email!.toLowerCase(),
          age: 25,
          gender: 'Male',
          height: 170,
          weight: 70,
          goal: 'Gain Muscle',
          dietPreference: 'Veg',
          activityLevel: 'Moderately Active',
          targetWeight: 66,
          biometricsEnabled: false
        };
        users.push(profile);
        saveRegisteredUsers(users);
      }

      if (rememberMe) {
        localStorage.setItem('fitai_remembered_email', fbUser.email!);
      } else {
        localStorage.removeItem('fitai_remembered_email');
      }

      onAuthSuccess(profile);
      navigateToPath('/dashboard');
    } catch (err: any) {
      console.error("Login submission error:", err);
      setErrorMsg('Invalid email or password.');
    }
  };

  // Registration submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isFirebaseConfigured) {
      setErrorMsg('Registration is unavailable. Please configure Firebase.');
      return;
    }

    // Client-side validations
    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setErrorMsg('Password must contain at least one uppercase letter.');
      return;
    }

    if (!/[a-z]/.test(password)) {
      setErrorMsg('Password must contain at least one lowercase letter.');
      return;
    }

    if (!/[0-9]/.test(password)) {
      setErrorMsg('Password must contain at least one number.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your password entry.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      // Update name profile details on Firebase
      await updateProfile(fbUser, { displayName: name });

      // Save user profile settings locally
      const users = getRegisteredUsers();
      const defaultTargetWeight = goal === 'Lose Weight' ? Math.round(weight - 6) : Math.round(weight + 4);
      const newUser: UserProfile = {
        name,
        email: email.toLowerCase(),
        age,
        gender,
        height,
        weight,
        goal,
        dietPreference: dietPref,
        activityLevel: 'Moderately Active',
        targetWeight: defaultTargetWeight,
        biometricsEnabled: false
      };

      users.push(newUser);
      saveRegisteredUsers(users);

      // Send verification email and sign out
      await sendEmailVerification(fbUser);
      await signOut(auth);

      const msg = 'Verification email sent. Please verify your email before logging in.';
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      navigateToPath('/login');
      setTimeout(() => {
        setSuccessMsg(msg);
      }, 50);
    } catch (err: any) {
      console.error("Signup error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('This email is already registered. Please login.');
      } else {
        setErrorMsg(err.message || 'Account registration failed.');
      }
    }
  };

  // Forgot password submission
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isFirebaseConfigured) {
      setErrorMsg('Password reset is offline due to missing configuration.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg('Password reset instructions have been sent.');
    } catch (err: any) {
      console.error("Reset password error:", err);
      if (err.code === 'auth/user-not-found') {
        setErrorMsg('This email is not registered with FitAI.');
      } else {
        setErrorMsg(err.message || 'Failed to dispatch reset email.');
      }
    }
  };

  // Resend email verification
  const handleResendEmail = async () => {
    if (!unverifiedUser) return;
    try {
      await sendEmailVerification(unverifiedUser);
      setSuccessMsg('Verification email resent. Please check your inbox.');
      setErrorMsg('');
    } catch (err: any) {
      console.error("Resend email error:", err);
      setErrorMsg(err.message || 'Failed to resend verification email.');
    }
  };

  return (
    <div className="min-h-screen grid-bg relative flex flex-col justify-center items-center py-16 px-6 bg-[#03000a]">
      {/* Background glow flares */}
      <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-brand-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[300px] h-[300px] bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Configuration warning banner */}
      {!isFirebaseConfigured && (
        <div className="w-full max-w-lg mb-6 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-xl flex items-start gap-2.5 leading-relaxed z-20">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-white font-bold uppercase tracking-wider mb-0.5">Firebase Configuration Missing</strong>
            Authentication is currently offline. Please populate the credentials in your `.env` file at the root of the project to initialize Firebase Auth.
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-lg z-10">
        
        {/* FitAI Header Title */}
        <div className="flex items-center justify-center space-x-2.5 mb-8">
          <div className="p-2.5 bg-brand-violet/10 border border-brand-violet/20 rounded-xl text-brand-cyan shadow-glow-purple">
            <Shield className="h-6 w-6 animate-pulse" />
          </div>
          <span className="font-display font-black text-2xl tracking-wider text-white">
            FIT<span className="text-brand-violet">AI</span> SECURE
          </span>
        </div>

        <AnimatePresence mode="wait">
          
          {/* VIEW A: LOGIN PAGE */}
          {view === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <SpotlightCard className="p-8">
                <form onSubmit={handleLoginSubmit} className="space-y-5 text-left">
                  <div className="space-y-1">
                    <h3 className="text-xl font-display font-extrabold text-white">Welcome Back</h3>
                    <p className="text-xs text-zinc-400">Unlock your personal progressive logs dashboard.</p>
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl flex flex-col gap-2.5 leading-relaxed">
                      <div className="flex items-start gap-2">
                        <ShieldAlert className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{errorMsg}</span>
                      </div>
                      {errorMsg === 'Please verify your email before logging in.' && unverifiedUser && (
                        <button
                          type="button"
                          onClick={handleResendEmail}
                          className="mt-1 self-start px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 hover:border-rose-500/50 text-rose-300 hover:text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
                        >
                          Resend Verification Email
                        </button>
                      )}
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl flex items-start gap-2 leading-relaxed">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold mt-0.5">✓</div>
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        type="email"
                        placeholder="coach@fitai.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet font-semibold"
                        required
                        disabled={!isFirebaseConfigured}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Password</label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-11 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet font-mono"
                        required
                        disabled={!isFirebaseConfigured}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                        disabled={!isFirebaseConfigured}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center space-x-2 text-xs font-bold text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded bg-dark-950 border-white/5 text-brand-violet focus:ring-0"
                        disabled={!isFirebaseConfigured}
                      />
                      <span>Remember Me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => { navigateToPath('/forgot-password'); }}
                      className="text-xs font-bold text-brand-cyan hover:underline cursor-pointer"
                      disabled={!isFirebaseConfigured}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-black rounded-xl hover:scale-101 hover:shadow-glow-purple transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
                    disabled={!isFirebaseConfigured}
                  >
                    Authenticate Account <ArrowRight className="h-4 w-4" />
                  </button>

                  <div className="relative my-6 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
                    <span className="relative bg-[#0d0720]/90 px-3 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Or login with</span>
                  </div>

                  {/* Social Google Sign-in */}
                  <div className="w-full">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="w-full py-2.5 px-4 border border-white/5 bg-dark-950 hover:bg-white/5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                      disabled={!isFirebaseConfigured}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#ea4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.99 5.99 0 0 1 8 12.5a5.99 5.99 0 0 1 5.991-6.014c1.6 0 2.92.593 3.93 1.554l3.18-3.185C19.063 2.89 16.745 2 13.99 2 8.163 2 3.5 6.663 3.5 12.5S8.163 23 13.99 23c5.44 0 9.873-3.85 9.873-9.5 0-.585-.058-1.15-.175-1.715H12.24Z" />
                      </svg>
                      Continue with Google
                    </button>
                  </div>

                  <div className="pt-2 text-center">
                    <span className="text-xs text-zinc-500">Don't have an account? </span>
                    <button
                      type="button"
                      onClick={() => navigateToPath('/signup')}
                      className="text-xs font-bold text-brand-cyan hover:underline cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </div>
                </form>
              </SpotlightCard>
            </motion.div>
          )}

          {/* VIEW B: SIGN UP PAGE */}
          {view === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <SpotlightCard className="p-8">
                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <h3 className="text-xl font-display font-extrabold text-white">Create Protocol</h3>
                    <p className="text-xs text-zinc-400">Start logging workouts and tracking biological weight.</p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl text-center">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-1">
                    {/* Full Name */}
                    <div className="col-span-2 space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                        <input
                          type="text"
                          placeholder="Athlete Alias"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
                          required
                          disabled={!isFirebaseConfigured}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-span-2 space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Email</label>
                      <input
                        type="email"
                        placeholder="athlete@fitai.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
                        required
                        disabled={!isFirebaseConfigured}
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Password</label>
                      <input
                        type="password"
                        placeholder="Min 8 chars"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
                        required
                        disabled={!isFirebaseConfigured}
                      />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Confirm Password</label>
                      <input
                        type="password"
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
                        required
                        disabled={!isFirebaseConfigured}
                      />
                    </div>

                    {/* Height */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Height (cm)</label>
                      <input
                        type="number"
                        min="100"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value) || 170)}
                        className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                        required
                        disabled={!isFirebaseConfigured}
                      />
                    </div>

                    {/* Weight */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Weight (kg)</label>
                      <input
                        type="number"
                        min="30"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value) || 70)}
                        className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                        required
                        disabled={!isFirebaseConfigured}
                      />
                    </div>

                    {/* Fitness Goal */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Fitness Goal</label>
                      <select
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                        disabled={!isFirebaseConfigured}
                      >
                        <option value="Gain Muscle">Muscle Gain</option>
                        <option value="Lose Weight">Fat Loss</option>
                        <option value="Build Strength">Strength</option>
                        <option value="Improve Stamina">Cardio/Stamina</option>
                      </select>
                    </div>

                    {/* Diet Preference */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Diet Preference</label>
                      <select
                        value={dietPref}
                        onChange={(e) => setDietPref(e.target.value as any)}
                        className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                        disabled={!isFirebaseConfigured}
                      >
                        <option value="Veg">Vegetarian</option>
                        <option value="Non-Veg">Non-Vegetarian</option>
                        <option value="Eggetarian">Eggetarian</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 mt-2 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-black rounded-xl hover:scale-101 hover:shadow-glow-purple transition-all uppercase tracking-wider cursor-pointer"
                    disabled={!isFirebaseConfigured}
                  >
                    Create Account
                  </button>

                  <div className="pt-2 text-center">
                    <span className="text-xs text-zinc-500">Already registered? </span>
                    <button
                      type="button"
                      onClick={() => navigateToPath('/login')}
                      className="text-xs font-bold text-brand-cyan hover:underline cursor-pointer"
                    >
                      Login
                    </button>
                  </div>
                </form>
              </SpotlightCard>
            </motion.div>
          )}

          {/* VIEW C: FORGOT PASSWORD PAGE */}
          {view === 'forgot_password' && (
            <motion.div
              key="forgot_password"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <SpotlightCard className="p-8">
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-5 text-left">
                  <div className="space-y-1">
                    <h3 className="text-xl font-display font-extrabold text-white">Reset Password</h3>
                    <p className="text-xs text-zinc-400">Enter your email and we'll send you recovery steps.</p>
                  </div>

                  {successMsg ? (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl text-center">
                      Password reset instructions have been sent.
                    </div>
                  ) : (
                    <>
                      {errorMsg && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl text-center">
                          {errorMsg}
                        </div>
                      )}
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                          <input
                            type="email"
                            placeholder="coach@fitai.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet font-semibold"
                            required
                            disabled={!isFirebaseConfigured}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-black rounded-xl hover:scale-101 hover:shadow-glow-purple transition-all uppercase tracking-wider cursor-pointer"
                        disabled={!isFirebaseConfigured}
                      >
                        Send Reset Email
                      </button>
                    </>
                  )}

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => { navigateToPath('/login'); }}
                      className="text-xs font-bold text-brand-cyan hover:underline cursor-pointer"
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              </SpotlightCard>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
};
