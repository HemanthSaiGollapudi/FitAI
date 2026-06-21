import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Mail, User, Shield, 
  ArrowRight, ShieldAlert, 
  Loader2, Ruler, Target, Heart, Eye, EyeOff
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
  biometricsEnabled: true,
  biometricType: 'iPhone Face ID / Touch ID'
};

export const AuthModule: React.FC<AuthModuleProps> = ({ onAuthSuccess }) => {
  const [view, setView] = useState<'login' | 'signup' | 'onboarding'>('login');
  
  // Input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration specific fields
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [goal, setGoal] = useState('Gain Muscle');
  const [dietPref, setDietPref] = useState<'Veg' | 'Non-Veg' | 'Eggetarian'>('Veg');
  
  // Onboarding specific fields
  const [activityLevel, setActivityLevel] = useState('Moderately Active');
  const [targetWeight, setTargetWeight] = useState(65);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [onboardingPhase, setOnboardingPhase] = useState(0);

  // Active user during flows
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
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

  // Simulated Google Sign In
  const handleGoogleSignIn = () => {
    setOnboardingLoading(true);
    setOnboardingPhase(0);
    setErrorMsg('');
    
    // Simulate API delay
    setTimeout(() => {
      setOnboardingLoading(false);
      const googleUser: UserProfile = {
        name: 'Google Athlete',
        email: 'google.athlete@gmail.com',
        age: 28,
        gender: 'Male',
        height: 180,
        weight: 78,
        goal: 'Lose Weight',
        dietPreference: 'Non-Veg',
        biometricsEnabled: false
      };

      // Add to registered users if not exists
      const users = getRegisteredUsers();
      let existing = users.find(u => u.email === googleUser.email);
      if (!existing) {
        users.push(googleUser);
        saveRegisteredUsers(users);
        existing = googleUser;
      }
      
      handleLoginFlow(existing);
    }, 1200);
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
    setActiveUser(user);

    if (rememberMe) {
      localStorage.setItem('fitai_remembered_email', user.email);
    } else {
      localStorage.removeItem('fitai_remembered_email');
    }

    // Check if onboarding completed for this user
    const hasOnboarded = localStorage.getItem(`fitai_onboarded_${user.email}`) === 'true';
    if (!hasOnboarded) {
      setView('onboarding');
      // Populate defaults for onboarding input based on register selection
      setTargetWeight(user.goal === 'Lose Weight' ? Math.round(user.weight - 6) : Math.round(user.weight + 4));
    } else {
      // Direct login or check biometrics ask
      completeAuthentication(user);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const users = getRegisteredUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setErrorMsg('This email is already registered. Please login.');
      return;
    }

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
      biometricsEnabled: false
    };

    users.push(newUser);
    saveRegisteredUsers(users);
    handleLoginFlow(newUser);
  };

  // Onboarding workflow
  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;
    setOnboardingLoading(true);
    setOnboardingPhase(0);

    const phases = [
      "Calculating biological constraints...",
      "Matching custom workout programs...",
      "Optimizing nutrient partitions...",
      "Compiling fitness index dashboard..."
    ];

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current >= phases.length) {
        clearInterval(interval);
        // Onboarding computation complete
        const updatedUser = {
          ...activeUser,
          activityLevel,
          targetWeight
        };

        // Update in database
        const users = getRegisteredUsers();
        const updatedList = users.map(u => u.email === activeUser.email ? updatedUser : u);
        saveRegisteredUsers(updatedList);
        setActiveUser(updatedUser);
        localStorage.setItem(`fitai_onboarded_${activeUser.email}`, 'true');

        setOnboardingLoading(false);
        onAuthSuccess(updatedUser);
      } else {
        setOnboardingPhase(current);
      }
    }, 850);
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

                  {/* Remember Me */}
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
                    <div className="space-y-1">
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

                    {/* Age */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Age</label>
                      <input
                        type="number"
                        min="12"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value) || 20)}
                        className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                        required
                      />
                    </div>

                    {/* Gender */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
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

          {/* VIEW C: ONBOARDING WIZARD */}
          {view === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SpotlightCard className="p-8 text-left">
                {onboardingLoading ? (
                  <div className="py-16 flex flex-col items-center justify-center space-y-6 text-center">
                    <Loader2 className="w-12 h-12 text-brand-cyan animate-spin" />
                    <div className="space-y-1.5">
                      <h4 className="font-display font-extrabold text-white text-base">Configuring Onboarding Parameters</h4>
                      <p className="text-brand-violet text-xs font-semibold animate-pulse">
                        {onboardingPhase === 0 && "Analyzing biological constraints..."}
                        {onboardingPhase === 1 && "Matching custom workout programs..."}
                        {onboardingPhase === 2 && "Optimizing nutrient partitions..."}
                        {onboardingPhase === 3 && "Compiling fitness index dashboard..."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleOnboardingSubmit} className="space-y-6">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-violet/10 text-brand-violet border border-brand-violet/20 text-[9px] font-black uppercase tracking-widest">Onboarding Wizard</span>
                      <h3 className="text-xl font-display font-black text-white mt-1">Configure Onboarding Goals</h3>
                      <p className="text-xs text-zinc-500">Personalize calorie boundaries and activity multiplier adjustments.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Step 1: Goal Select */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-brand-cyan" /> Select Primary Target
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                          {['Gain Muscle', 'Lose Weight', 'Build Strength', 'Improve Stamina'].map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setGoal(g)}
                              className={`py-3 px-3 rounded-xl border text-xs font-extrabold transition-all text-center ${
                                goal === g 
                                  ? 'bg-brand-violet/10 border-brand-violet text-white shadow-glow-purple' 
                                  : 'bg-dark-950 border-white/5 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {g === 'Gain Muscle' && '💪 Muscle Gain'}
                              {g === 'Lose Weight' && '🔥 Fat Loss'}
                              {g === 'Build Strength' && '⚡ Powerlifting / Strength'}
                              {g === 'Improve Stamina' && '🫁 Cardio Endurance'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Step 2: Activity level */}
                      <div className="space-y-2 pt-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                          <Heart className="w-4 h-4 text-brand-pink" /> Activity Level Multiplier
                        </label>
                        <select
                          value={activityLevel}
                          onChange={(e) => setActivityLevel(e.target.value)}
                          className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
                        >
                          <option value="Sedentary">Sedentary (Office worker, minimal workouts)</option>
                          <option value="Moderately Active">Moderately Active (Train 3-5 days/week)</option>
                          <option value="Very Active">Very Active (Heavy training 6-7 days/week)</option>
                          <option value="Athlete/Highly Active">Competitive Athlete (Double training sessions)</option>
                        </select>
                      </div>

                      {/* Step 3: Target Weight */}
                      <div className="space-y-2 pt-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                          <Ruler className="w-4 h-4 text-brand-lime" /> Target Body Weight (kg)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="35"
                            value={targetWeight}
                            onChange={(e) => setTargetWeight(Number(e.target.value) || 60)}
                            className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet font-semibold"
                            required
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-bold">kg</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-black rounded-xl hover:scale-101 hover:shadow-glow-purple transition-all uppercase tracking-wider"
                    >
                      Process & Synthesize Plan
                    </button>
                  </form>
                )}
              </SpotlightCard>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
};
