import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Scale, Check, 
  Sparkles, User, Bell, Dumbbell, Utensils, Droplet, Calendar, Clock,
  Shield, Fingerprint, Target, Edit
} from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';


interface ProfileViewProps {
  onSaveProfile: (settings: {
    name: string;
    age: number;
    weight: number;
    height: number;
    goalWeight: number;
    gender: 'Male' | 'Female';
    activity: string;
    type: 'Veg' | 'Non-Veg' | 'Eggetarian';
    goal: string;
  }) => void;
  savedGoal: string;
  onLogout?: () => void;
}

interface ReminderSettings {
  workout: {
    enabled: boolean;
    time: string;
    days: string[];
  };
  meal: {
    enabled: boolean;
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  water: {
    enabled: boolean;
    interval: string;
    start: string;
    end: string;
  };
  weighIn: {
    enabled: boolean;
    day: string;
    time: string;
  };
}

const ToggleButton = ({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
      enabled ? 'bg-brand-violet' : 'bg-zinc-800'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        enabled ? 'translate-x-4' : 'translate-x-0'
      }`}
    />
  </button>
);

export const ProfileView: React.FC<ProfileViewProps> = ({ onSaveProfile, savedGoal, onLogout }) => {
  // Load initial settings from localStorage
  const [name, setName] = useState<string>('Champion');
  const [age, setAge] = useState<number>(26);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [height, setHeight] = useState<number>(175);
  const [weight, setWeight] = useState<number>(74);
  const [goalWeight, setGoalWeight] = useState<number>(68);
  const [activity, setActivity] = useState<string>('Moderately Active');
  const [type, setType] = useState<'Veg' | 'Non-Veg' | 'Eggetarian'>('Veg');
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [reminderSaveSuccess, setReminderSaveSuccess] = useState(false);

  const [reminders, setReminders] = useState<ReminderSettings>(() => {
    try {
      const saved = localStorage.getItem('fitai_reminders');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading reminders:', e);
    }
    return {
      workout: { enabled: true, time: '07:00', days: ['Mon', 'Wed', 'Fri'] },
      meal: { enabled: true, breakfast: '08:00', lunch: '13:00', dinner: '20:00' },
      water: { enabled: true, interval: '1 Hour', start: '08:00', end: '22:00' },
      weighIn: { enabled: true, day: 'Sunday', time: '09:00' }
    };
  });

  useEffect(() => {
    const savedName = localStorage.getItem('fitai_user_name');
    const savedAge = localStorage.getItem('fitai_user_age');
    const savedGender = localStorage.getItem('fitai_user_gender');
    const savedHeight = localStorage.getItem('fitai_user_height');
    const savedWeight = localStorage.getItem('fitai_user_weight');
    const savedGoalWeight = localStorage.getItem('fitai_user_goal_weight');
    const savedActivity = localStorage.getItem('fitai_user_activity');
    const savedType = localStorage.getItem('fitai_diet_type');
    
    if (savedName) setName(savedName);
    if (savedAge) setAge(Number(savedAge));
    if (savedGender) setGender(savedGender as 'Male' | 'Female');
    if (savedHeight) setHeight(Number(savedHeight));
    if (savedWeight) setWeight(Number(savedWeight));
    if (savedGoalWeight) setGoalWeight(Number(savedGoalWeight));
    if (savedActivity) setActivity(savedActivity);
    if (savedType) setType(savedType as 'Veg' | 'Non-Veg' | 'Eggetarian');
  }, []);

  const [goal, setGoal] = useState<string>('Gain Muscle');
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('fitai_current_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);

        const savedGoalVal = localStorage.getItem('fitai_diet_goal') || user.goal || 'Gain Muscle';
        let mappedGoal = savedGoalVal;
        if (savedGoalVal === 'Fat Loss') mappedGoal = 'Lose Weight';
        else if (savedGoalVal === 'Muscle Gain') mappedGoal = 'Gain Muscle';
        else if (savedGoalVal === 'Stamina') mappedGoal = 'Improve Stamina';
        setGoal(mappedGoal);
      } catch {}
    }
  }, []);

  const activities = ['Sedentary', 'Moderately Active', 'Very Active', 'Athlete/Highly Active'];

  // BMI calculations
  const heightInMeters = height / 100;
  const bmi = heightInMeters > 0 ? parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1)) : 0;

  // Determine BMI category
  let bmiCategory = 'Normal';
  let bmiDesc = 'You are in a healthy weight range. Maintain active compound cycles!';
  let bmiColor = 'text-brand-lime border-brand-lime/20 bg-brand-lime/10';
  let dialColor = '#a3e635';
  let dialOffset = 251 - (251 * 50) / 100; // Normal center

  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiDesc = 'Your BMI is low. Focus on linear compound loads and a clean caloric bulk.';
    bmiColor = 'text-brand-cyan border-brand-cyan/20 bg-brand-cyan/10';
    dialColor = '#06b6d4';
    dialOffset = 251 - (251 * 25) / 100;
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'Overweight';
    bmiDesc = 'Your BMI is slightly high. Focus on progressive deficits and steady state cardio.';
    bmiColor = 'text-amber-400 border-amber-400/20 bg-amber-400/10';
    dialColor = '#fbbf24';
    dialOffset = 251 - (251 * 75) / 100;
  } else if (bmi >= 30) {
    bmiCategory = 'Obese';
    bmiDesc = 'Health alert: High body fat. Prioritize caloric safety guidelines and low-impact circuits.';
    bmiColor = 'text-red-400 border-red-400/20 bg-red-400/10';
    dialColor = '#f87171';
    dialOffset = 251 - (251 * 95) / 100;
  }

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to localStorage
    localStorage.setItem('fitai_user_name', name);
    localStorage.setItem('fitai_user_age', String(age));
    localStorage.setItem('fitai_user_gender', gender);
    localStorage.setItem('fitai_user_height', String(height));
    localStorage.setItem('fitai_user_weight', String(weight));

    onSaveProfile({
      name,
      age,
      weight,
      height,
      goalWeight,
      gender,
      activity,
      type,
      goal
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();

    // Save preferences to localStorage
    localStorage.setItem('fitai_user_goal_weight', String(goalWeight));
    localStorage.setItem('fitai_user_activity', activity);
    localStorage.setItem('fitai_diet_type', type);

    onSaveProfile({
      name,
      age,
      weight,
      height,
      goalWeight,
      gender,
      activity,
      type,
      goal
    });

    setIsEditingPreferences(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSaveReminders = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('fitai_reminders', JSON.stringify(reminders));
    setReminderSaveSuccess(true);
    setTimeout(() => setReminderSaveSuccess(false), 2000);
  };

  return (
    <section className="relative py-24 overflow-hidden min-h-screen text-zinc-100 bg-[#03000a] text-left">
      <div className="absolute top-[20%] right-[20%] w-[350px] h-[350px] bg-brand-violet/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[20%] w-[350px] h-[350px] bg-brand-cyan/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-brand-violet/10 border border-brand-violet/20 px-3.5 py-1 rounded-full text-brand-violet font-semibold text-xs tracking-wider uppercase">
            Profile Settings
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-white">
            User Profile & Biometrics
          </h2>
          
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            Manage your biological parameters and evaluate health constraints dynamically.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
          
          {/* Form details (7 Columns) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Card 1: Personal Traits */}
            <SpotlightCard className="p-6">
              <form onSubmit={handleSaveClick} className="space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                  <User className="h-4.5 w-4.5 text-brand-cyan" /> Edit Personal Traits
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* User Name */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Full Name / Champion Alias</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet font-semibold"
                      placeholder="e.g. Champion"
                      required
                    />
                  </div>

                  {/* Age */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Age (Years)</label>
                    <input
                      type="number"
                      min="12"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
                      required
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Gender</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setGender('Male')}
                        className={`py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          gender === 'Male'
                            ? 'bg-brand-violet/20 border-brand-violet text-white'
                            : 'bg-dark-950 border-white/5 text-zinc-500'
                        }`}
                      >
                        Male
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('Female')}
                        className={`py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          gender === 'Female'
                            ? 'bg-brand-violet/20 border-brand-violet text-white'
                            : 'bg-dark-950 border-white/5 text-zinc-500'
                        }`}
                      >
                        Female
                      </button>
                    </div>
                  </div>

                  {/* Height */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Height (cm)</label>
                    <input
                      type="number"
                      min="100"
                      max="250"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
                      required
                    />
                  </div>

                  {/* Weight */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Current Weight (kg)</label>
                    <input
                      type="number"
                      min="35"
                      max="200"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-black rounded-xl hover:scale-101 transition-transform flex items-center justify-center gap-2 shadow-glow-purple cursor-pointer"
                  >
                    <Check className="h-4.5 w-4.5" /> Save Personal Traits
                  </button>
                </div>
              </form>
            </SpotlightCard>

            {/* Card 2: Fitness Preferences */}
            <SpotlightCard className="p-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Target className="h-4.5 w-4.5 text-brand-violet" /> Fitness Preferences
                </h3>
                {!isEditingPreferences && (
                  <button
                    type="button"
                    onClick={() => setIsEditingPreferences(true)}
                    className="px-3 py-1.5 bg-brand-violet/10 border border-brand-violet/20 hover:bg-brand-violet/20 hover:border-brand-violet/40 text-brand-violet text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Preferences
                  </button>
                )}
              </div>

              {isEditingPreferences ? (
                <form onSubmit={handleSavePreferences} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Primary Goal */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Primary Fitness Goal</label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { val: 'Gain Muscle', label: '💪 Muscle Gain' },
                          { val: 'Lose Weight', label: '🔥 Fat Loss' },
                          { val: 'Build Strength', label: '⚡ Powerlifting / Strength' },
                          { val: 'Improve Stamina', label: '🫁 Cardio Endurance' }
                        ].map((g) => (
                          <button
                            key={g.val}
                            type="button"
                            onClick={() => setGoal(g.val)}
                            className={`py-3 px-3 rounded-xl border text-xs font-extrabold transition-all text-center cursor-pointer ${
                              goal === g.val
                                ? 'bg-brand-violet/15 border-brand-violet text-white shadow-glow-purple'
                                : 'bg-dark-950 border-white/5 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Activity Level */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Activity Level</label>
                      <select
                        value={activity}
                        onChange={(e) => setActivity(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet font-semibold cursor-pointer"
                      >
                        {activities.map((act) => (
                          <option key={act} value={act} className="bg-dark-950">
                            {act}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Target Weight */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Target Goal Weight (kg)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="35"
                          max="200"
                          value={goalWeight}
                          onChange={(e) => setGoalWeight(Number(e.target.value))}
                          className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet font-semibold"
                          required
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-bold">kg</span>
                      </div>
                    </div>

                    {/* Diet Preference */}
                    <div className="space-y-1.5 sm:col-span-2 pt-2">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Dietary Preference</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Veg', 'Non-Veg', 'Eggetarian'].map((pref) => (
                          <button
                            key={pref}
                            type="button"
                            onClick={() => setType(pref as any)}
                            className={`py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              type === pref
                                ? 'bg-brand-lime/20 border-brand-lime text-brand-lime'
                                : 'bg-dark-950 border-white/5 text-zinc-500'
                            }`}
                          >
                            {pref}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingPreferences(false);
                        const userRaw = localStorage.getItem('fitai_current_user');
                        if (userRaw) {
                          try {
                            const user = JSON.parse(userRaw);
                            setGoalWeight(user.targetWeight || 68);
                            setActivity(user.activityLevel || 'Moderately Active');
                            setType(user.dietPreference || 'Veg');
                            const savedGoalVal = localStorage.getItem('fitai_diet_goal') || user.goal || 'Gain Muscle';
                            let mappedGoal = savedGoalVal;
                            if (savedGoalVal === 'Fat Loss') mappedGoal = 'Lose Weight';
                            else if (savedGoalVal === 'Muscle Gain') mappedGoal = 'Gain Muscle';
                            else if (savedGoalVal === 'Stamina') mappedGoal = 'Improve Stamina';
                            setGoal(mappedGoal);
                          } catch {}
                        }
                      }}
                      className="flex-1 py-3.5 border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3.5 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-black rounded-xl hover:scale-101 transition-all shadow-glow-purple cursor-pointer text-center"
                    >
                      Save Preferences
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-dark-950/40 border border-white/5 rounded-2xl flex items-center gap-3">
                    <div className="p-2.5 bg-brand-violet/10 border border-brand-violet/20 rounded-xl text-brand-violet">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Primary Goal</span>
                      <strong className="text-xs text-white font-bold">{
                        goal === 'Gain Muscle' ? 'Muscle Gain' :
                        goal === 'Lose Weight' ? 'Fat Loss' :
                        goal === 'Build Strength' ? 'Strength' :
                        goal === 'Improve Stamina' ? 'Cardio Endurance' : goal
                      }</strong>
                    </div>
                  </div>

                  <div className="p-4 bg-dark-950/40 border border-white/5 rounded-2xl flex items-center gap-3">
                    <div className="p-2.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl text-brand-cyan">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Activity Level</span>
                      <strong className="text-xs text-white font-bold">{activity}</strong>
                    </div>
                  </div>

                  <div className="p-4 bg-dark-950/40 border border-white/5 rounded-2xl flex items-center gap-3">
                    <div className="p-2.5 bg-brand-pink/10 border border-brand-pink/20 rounded-xl text-brand-pink">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Target Weight</span>
                      <strong className="text-xs text-white font-bold">{goalWeight} kg</strong>
                    </div>
                  </div>

                  <div className="p-4 bg-dark-950/40 border border-white/5 rounded-2xl flex items-center gap-3">
                    <div className="p-2.5 bg-brand-lime/10 border border-brand-lime/20 rounded-xl text-brand-lime">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Diet Preference</span>
                      <strong className="text-xs text-white font-bold">{type}</strong>
                    </div>
                  </div>
                </div>
              )}
            </SpotlightCard>

            <AnimatePresence>
              {saveSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 justify-center"
                >
                  <Check className="h-4 w-4" /> Profile parameters synchronized successfully!
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BMI Dial (5 Columns) */}
          <div className="lg:col-span-5">
            <SpotlightCard className="p-6 h-full flex flex-col justify-between items-center text-center space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2 w-full justify-center">
                <Scale className="h-4.5 w-4.5 text-brand-pink" /> AI Body Mass Index
              </h3>

              <div className="relative h-44 w-44 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle 
                    cx="88" 
                    cy="88" 
                    r="76" 
                    stroke="rgba(255,255,255,0.05)" 
                    strokeWidth="12" 
                    fill="transparent" 
                  />
                  <circle 
                    cx="88" 
                    cy="88" 
                    r="76" 
                    stroke={dialColor} 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray={477}
                    strokeDashoffset={dialOffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="z-10 text-center space-y-1">
                  <span className="text-4xl font-display font-black text-white">{bmi}</span>
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">BMI Score</span>
                </div>
              </div>

              {/* Status tags */}
              <div className="space-y-4 w-full">
                <span className={`inline-block px-4 py-1.5 border rounded-full text-xs font-black uppercase tracking-wider ${bmiColor}`}>
                  {bmiCategory}
                </span>

                <p className="text-xs text-zinc-400 leading-relaxed font-normal px-4">
                  {bmiDesc}
                </p>

                {savedGoal && (
                  <div className="p-3.5 bg-dark-950/60 border border-white/5 rounded-2xl text-[11px] text-zinc-500 font-semibold">
                    <Award className="h-4 w-4 text-brand-cyan inline-block mr-1.5 align-text-bottom animate-bounce" />
                    Active Metabolic Split: <strong className="text-white">{savedGoal}</strong>
                  </div>
                )}
              </div>

              {/* Tips block */}
              <div className="p-3.5 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded-xl flex items-start gap-2 text-[10px] font-semibold text-left">
                <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-brand-cyan" />
                <p>FitAI evaluates cardiovascular risks dynamically. Ensure your body weight remains aligned with progressive metabolic goals.</p>
              </div>

            </SpotlightCard>
          </div>

        </div>

        {/* Security & Biometrics + Notification Reminders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 max-w-6xl mx-auto items-stretch">
          
          {/* Card 1: Device Security & Biometrics */}
          <div className="lg:col-span-5">
            <SpotlightCard className="p-6 h-full flex flex-col justify-between space-y-6 text-left">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Shield className="h-4.5 w-4.5 text-brand-cyan" /> Security & Biometrics
                  </h3>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                    Mobile Only
                  </span>
                </div>

                <div className="space-y-4 w-full opacity-60 pointer-events-none">
                  <div className="flex items-center justify-between p-3.5 bg-dark-950/40 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <Fingerprint className="w-5 h-5 text-brand-cyan" />
                      <div>
                        <h4 className="text-xs font-bold text-white">Biometric Lock</h4>
                        <p className="text-[10px] text-zinc-500">Lock session on app launch</p>
                      </div>
                    </div>
                    <ToggleButton 
                      enabled={false} 
                      onChange={() => {}} 
                    />
                  </div>
                  <div className="text-[11px] text-zinc-400 font-semibold text-center italic bg-brand-violet/5 p-2.5 rounded-xl border border-brand-violet/10">
                    Biometric unlock will be available in the FitAI mobile app.
                  </div>
                </div>
              </div>

              {/* Log out CTA */}
              {onLogout && (
                <div className="pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full py-3 border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-black rounded-xl hover:scale-101 transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Log Out of Account 🚪
                  </button>
                </div>
              )}
            </SpotlightCard>
          </div>

          {/* Card 2: Notification Reminders Manager */}
          <div className="lg:col-span-7">
            <SpotlightCard className="p-6">
              <form onSubmit={handleSaveReminders} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                      <Bell className="h-4.5 w-4.5 text-brand-violet animate-pulse" /> Notification Reminders Manager
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Schedule active timers and reminders to keep your metabolic goals and workout compliance locked.
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand-violet text-white text-xs font-black rounded-xl hover:scale-102 hover:shadow-glow-purple transition-all flex items-center gap-2 self-start sm:self-center cursor-pointer"
                  >
                    <Check className="h-4 w-4" /> Save Reminders
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Card 1: Workout Reminders */}
                  <div className={`p-5 rounded-2xl border transition-all duration-300 ${
                    reminders.workout.enabled 
                      ? 'bg-dark-950/40 border-brand-violet/20' 
                      : 'bg-dark-950/10 border-white/5 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-brand-violet/10 text-brand-violet">
                          <Dumbbell className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">Workouts</h4>
                          <p className="text-[10px] text-zinc-500">Log training sessions</p>
                        </div>
                      </div>
                      <ToggleButton 
                        enabled={reminders.workout.enabled} 
                        onChange={(val) => setReminders(prev => ({
                          ...prev,
                          workout: { ...prev.workout, enabled: val }
                        }))}
                      />
                    </div>

                    <AnimatePresence initial={false}>
                      {reminders.workout.enabled ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-4 overflow-hidden pt-1"
                        >
                          <div className="space-y-1.5">
                            <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Reminder Time</label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                              <input
                                type="time"
                                value={reminders.workout.time}
                                onChange={(e) => setReminders(prev => ({
                                  ...prev,
                                  workout: { ...prev.workout, time: e.target.value }
                                }))}
                                className="w-full pl-9 pr-4 py-2.5 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Target Days</label>
                            <div className="flex flex-wrap gap-1.5">
                              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                const isSelected = reminders.workout.days.includes(day);
                                return (
                                  <button
                                    key={day}
                                    type="button"
                                    onClick={() => {
                                      setReminders(prev => {
                                        const currentDays = prev.workout.days;
                                        const newDays = currentDays.includes(day)
                                          ? currentDays.filter(d => d !== day)
                                          : [...currentDays, day];
                                        return {
                                          ...prev,
                                          workout: { ...prev.workout, days: newDays }
                                        };
                                      });
                                    }}
                                    className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all ${
                                      isSelected 
                                        ? 'bg-brand-violet/20 border-brand-violet text-white' 
                                        : 'bg-dark-950 border-white/5 text-zinc-500'
                                    }`}
                                  >
                                    {day}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="h-28 flex items-center justify-center text-[10px] text-zinc-600 font-medium italic">
                          Workout notifications muted
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Card 2: Meal Reminders */}
                  <div className={`p-5 rounded-2xl border transition-all duration-300 ${
                    reminders.meal.enabled 
                      ? 'bg-dark-950/40 border-brand-lime/20' 
                      : 'bg-dark-950/10 border-white/5 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-brand-lime/10 text-brand-lime">
                          <Utensils className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">Meal Timers</h4>
                          <p className="text-[10px] text-zinc-500">Track protein intake</p>
                        </div>
                      </div>
                      <ToggleButton 
                        enabled={reminders.meal.enabled} 
                        onChange={(val) => setReminders(prev => ({
                          ...prev,
                          meal: { ...prev.meal, enabled: val }
                        }))}
                      />
                    </div>

                    <AnimatePresence initial={false}>
                      {reminders.meal.enabled ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-3 overflow-hidden pt-1"
                        >
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Breakfast</label>
                            <input
                              type="time"
                              value={reminders.meal.breakfast}
                              onChange={(e) => setReminders(prev => ({
                                ...prev,
                                  meal: { ...prev.meal, breakfast: e.target.value }
                              }))}
                              className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-lime"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Lunch</label>
                            <input
                              type="time"
                              value={reminders.meal.lunch}
                              onChange={(e) => setReminders(prev => ({
                                ...prev,
                                  meal: { ...prev.meal, lunch: e.target.value }
                              }))}
                              className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-lime"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Dinner</label>
                            <input
                              type="time"
                              value={reminders.meal.dinner}
                              onChange={(e) => setReminders(prev => ({
                                ...prev,
                                  meal: { ...prev.meal, dinner: e.target.value }
                              }))}
                              className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-lime"
                            />
                          </div>
                        </motion.div>
                      ) : (
                        <div className="h-28 flex items-center justify-center text-[10px] text-zinc-600 font-medium italic">
                          Meal timers disabled
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Card 3: Water Reminders */}
                  <div className={`p-5 rounded-2xl border transition-all duration-300 ${
                    reminders.water.enabled 
                      ? 'bg-dark-950/40 border-brand-cyan/20' 
                      : 'bg-dark-950/10 border-white/5 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-brand-cyan/10 text-brand-cyan">
                          <Droplet className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">Water Alerts</h4>
                          <p className="text-[10px] text-zinc-500">Hydration compliance</p>
                        </div>
                      </div>
                      <ToggleButton 
                        enabled={reminders.water.enabled} 
                        onChange={(val) => setReminders(prev => ({
                          ...prev,
                          water: { ...prev.water, enabled: val }
                        }))}
                      />
                    </div>

                    <AnimatePresence initial={false}>
                      {reminders.water.enabled ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-3 overflow-hidden pt-1"
                        >
                          <div className="space-y-1.5">
                            <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Interval</label>
                            <select
                              value={reminders.water.interval}
                              onChange={(e) => setReminders(prev => ({
                                ...prev,
                                  water: { ...prev.water, interval: e.target.value }
                              }))}
                              className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-cyan"
                            >
                              {['30 Minutes', '1 Hour', '2 Hours', '3 Hours'].map(int => (
                                <option key={int} value={int} className="bg-dark-950">{int}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Start</label>
                              <input
                                type="time"
                                value={reminders.water.start}
                                onChange={(e) => setReminders(prev => ({
                                  ...prev,
                                    water: { ...prev.water, start: e.target.value }
                                }))}
                                className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-cyan"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">End</label>
                              <input
                                type="time"
                                value={reminders.water.end}
                                onChange={(e) => setReminders(prev => ({
                                  ...prev,
                                    water: { ...prev.water, end: e.target.value }
                                }))}
                                className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-cyan"
                              />
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="h-28 flex items-center justify-center text-[10px] text-zinc-600 font-medium italic">
                          Hydration alerts off
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Card 4: Weigh-in Reminders */}
                  <div className={`p-5 rounded-2xl border transition-all duration-300 ${
                    reminders.weighIn.enabled 
                      ? 'bg-dark-950/40 border-brand-pink/20' 
                      : 'bg-dark-950/10 border-white/5 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-brand-pink/10 text-brand-pink">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">Weigh-in</h4>
                          <p className="text-[10px] text-zinc-500">Weight tracking log</p>
                        </div>
                      </div>
                      <ToggleButton 
                        enabled={reminders.weighIn.enabled} 
                        onChange={(val) => setReminders(prev => ({
                          ...prev,
                          weighIn: { ...prev.weighIn, enabled: val }
                        }))}
                      />
                    </div>

                    <AnimatePresence initial={false}>
                      {reminders.weighIn.enabled ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-3 overflow-hidden pt-1"
                        >
                          <div className="space-y-1.5">
                            <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Check-in Day</label>
                            <select
                              value={reminders.weighIn.day}
                              onChange={(e) => setReminders(prev => ({
                                ...prev,
                                  weighIn: { ...prev.weighIn, day: e.target.value }
                              }))}
                              className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-pink"
                            >
                              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                <option key={d} value={d} className="bg-dark-950">{d}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Time</label>
                            <input
                              type="time"
                              value={reminders.weighIn.time}
                              onChange={(e) => setReminders(prev => ({
                                ...prev,
                                  weighIn: { ...prev.weighIn, time: e.target.value }
                              }))}
                              className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-pink"
                            />
                          </div>
                        </motion.div>
                      ) : (
                        <div className="h-28 flex items-center justify-center text-[10px] text-zinc-600 font-medium italic">
                          Check-ins unprompted
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <AnimatePresence>
                  {reminderSaveSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 justify-center"
                    >
                      <Check className="h-4 w-4" /> Notification reminders synchronized successfully!
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </SpotlightCard>
          </div>
        </div>

      </div>


    </section>
  );
};
