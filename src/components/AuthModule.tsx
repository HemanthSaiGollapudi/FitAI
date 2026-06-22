import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Mail, User, Shield, 
  ArrowRight, ShieldAlert, 
  Eye, EyeOff
} from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

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
  password: 'password',
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
  const [view, setView] = useState<'login' | 'signup' | 'forgot_password'>('login');
  
  // Input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  // Registration specific fields
  const [name, setName] = useState('');
  const age = 25;
  const gender: 'Male' | 'Female' = 'Male';
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [goal, setGoal] = useState('Gain Muscle');
  const [dietPref, setDietPref] = useState<'Veg' | 'Non-Veg' | 'Eggetarian'>('Veg');
  
  const [errorMsg, setErrorMsg] = useState('');

  // Initial user seeding and checking remembered session
  useEffect(() => {
    // Seed default coach if none exists
    const usersRaw = localStorage.getItem('fitai_users');
    if (!usersRaw) {
      localStorage.setItem('fitai_users', JSON.stringify([SEEDED_USER]));
    } else {
      try {
        const users = JSON.parse(usersRaw);
        if (!users.some((u: any) => u.email === SEEDED_USER.email)) {
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

  // Shared OAuth success handler
  const handleOAuthSuccess = (googleEmail: string, googleName: string) => {
    const isCoach = googleEmail.toLowerCase() === 'coach@fitai.com';
    const defaultName = isCoach ? 'FitAI Coach' : (googleName || 'Google Athlete');
    const defaultAge = isCoach ? 26 : 28;
    const defaultHeight = isCoach ? 175 : 180;
    const defaultWeight = isCoach ? 74 : 78;
    const defaultGoal = isCoach ? 'Gain Muscle' : 'Lose Weight';
    const defaultDiet = isCoach ? 'Veg' : 'Non-Veg';

    const googleUser: UserProfile = {
      name: defaultName,
      email: googleEmail,
      age: defaultAge,
      gender: 'Male',
      height: defaultHeight,
      weight: defaultWeight,
      goal: defaultGoal,
      dietPreference: defaultDiet as any,
      biometricsEnabled: false
    };

    if (isCoach) {
      googleUser.password = 'password';
      googleUser.activityLevel = 'Moderately Active';
      googleUser.targetWeight = 68;
    } else {
      googleUser.activityLevel = 'Moderately Active';
      googleUser.targetWeight = googleUser.goal === 'Lose Weight' ? Math.round(googleUser.weight - 6) : Math.round(googleUser.weight + 4);
    }

    const users = getRegisteredUsers();
    let existing = users.find(u => u.email.toLowerCase() === googleUser.email.toLowerCase());
    if (!existing) {
      users.push(googleUser);
      saveRegisteredUsers(users);
      existing = googleUser;
    }

    handleLoginFlow(existing);
  };

  // Listen for simulated Google OAuth popup messages
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data && event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
        const { email: googleEmail, name: googleName } = event.data;
        setErrorMsg('');
        handleOAuthSuccess(googleEmail, googleName);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => {
      window.removeEventListener('message', handleOAuthMessage);
    };
  }, []);

  // Initialize Real Google OAuth if a Client ID is provided in window or environment
  useEffect(() => {
    const clientID = (window as any).VITE_GOOGLE_CLIENT_ID || "";
    if (clientID) {
      // Load GIS client library
      const script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: clientID,
            callback: (response: any) => {
              // Decode JWT payload
              const base64Url = response.credential.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                  return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              const payload = JSON.parse(jsonPayload);
              
              if (payload && payload.email) {
                handleOAuthSuccess(payload.email, payload.name || 'Google User');
              }
            },
            auto_select: false, // Ensure NO auto-login
            prompt_parent_id: 'gsi-parent'
          });
        } catch (e) {
          console.warn("Failed to initialize Google Identity Services SDK:", e);
        }
      };
    }
  }, []);

  const triggerSimulatedGoogleOAuth = () => {
    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      '/google-oauth.html',
      'GoogleOAuthPopup',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
    );

    if (!popup) {
      setErrorMsg('Popup blocked! Please allow popups to sign in with Google.');
    }
  };

  // Google Sign In handler
  const handleGoogleSignIn = () => {
    setErrorMsg('');
    const clientID = (window as any).VITE_GOOGLE_CLIENT_ID || "";

    if (clientID && (window as any).google?.accounts?.id) {
      try {
        // Trigger account picker popup via real Google Identity Services
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // One Tap skipped/blocked, fall back to request oauth code
            try {
              (window as any).google.accounts.id.requestCode();
            } catch {
              triggerSimulatedGoogleOAuth();
            }
          }
        });
      } catch {
        triggerSimulatedGoogleOAuth();
      }
    } else {
      triggerSimulatedGoogleOAuth();
    }
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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const users = getRegisteredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.password !== password) {
      setErrorMsg('Invalid email or password. Try coach@fitai.com / password.');
      return;
    }

    handleLoginFlow(user);
  };

  const handleLoginFlow = (user: UserProfile) => {
    if (rememberMe) {
      localStorage.setItem('fitai_remembered_email', user.email);
    } else {
      localStorage.removeItem('fitai_remembered_email');
    }

    completeAuthentication(user);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your password entry.');
      return;
    }

    const users = getRegisteredUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setErrorMsg('This email is already registered. Please login.');
      return;
    }

    const defaultTargetWeight = goal === 'Lose Weight' ? Math.round(weight - 6) : Math.round(weight + 4);
    const newUser: UserProfile = {
      name,
      email,
      password,
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
    handleLoginFlow(newUser);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const users = getRegisteredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      setErrorMsg('This email is not registered with FitAI.');
      return;
    }

    setResetSent(true);
  };



  const completeAuthentication = (user: UserProfile) => {
    onAuthSuccess(user);
  };

  return (
    <div className="min-h-screen grid-bg relative flex flex-col justify-center items-center py-16 px-6 bg-[#03000a]">
      {/* Background glow flares */}
      <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-brand-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[300px] h-[300px] bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none" />

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
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl flex items-start gap-2 leading-relaxed">
                      <ShieldAlert className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
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
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
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
                      />
                      <span>Remember Me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => { setView('forgot_password'); setErrorMsg(''); }}
                      className="text-xs font-bold text-brand-cyan hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-black rounded-xl hover:scale-101 hover:shadow-glow-purple transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
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
                      className="w-full py-2.5 px-4 border border-white/5 bg-dark-950 hover:bg-white/5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#ea4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.99 5.99 0 0 1 8 12.5a5.99 5.99 0 0 1 5.991-6.014c1.6 0 2.92.593 3.93 1.554l3.18-3.185C19.063 2.89 16.745 2 13.99 2 8.163 2 3.5 6.663 3.5 12.5S8.163 23 13.99 23c5.44 0 9.873-3.85 9.873-9.5 0-.585-.058-1.15-.175-1.715H12.24Z" />
                      </svg>
                      Sign In with Google Account
                    </button>
                  </div>

                  <div className="pt-2 text-center">
                    <span className="text-xs text-zinc-500">Don't have an account? </span>
                    <button
                      type="button"
                      onClick={() => setView('signup')}
                      className="text-xs font-bold text-brand-cyan hover:underline"
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
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Password</label>
                      <input
                        type="password"
                        placeholder="Min 6 chars"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
                        required
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
                      />
                    </div>

                    {/* Fitness Goal */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Fitness Goal</label>
                      <select
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none"
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
                      >
                        <option value="Veg">Vegetarian</option>
                        <option value="Non-Veg">Non-Vegetarian</option>
                        <option value="Eggetarian">Eggetarian</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 mt-2 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-black rounded-xl hover:scale-101 hover:shadow-glow-purple transition-all uppercase tracking-wider"
                  >
                    Create Account
                  </button>

                  <div className="pt-2 text-center">
                    <span className="text-xs text-zinc-500">Already registered? </span>
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="text-xs font-bold text-brand-cyan hover:underline"
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

                  {resetSent ? (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl text-center">
                      Password reset link has been successfully dispatched to your email!
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
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-black rounded-xl hover:scale-101 hover:shadow-glow-purple transition-all uppercase tracking-wider cursor-pointer"
                      >
                        Send Reset Link
                      </button>
                    </>
                  )}

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => { setView('login'); setErrorMsg(''); setResetSent(false); }}
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
