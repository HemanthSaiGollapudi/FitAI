import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, Check, Bell, Dumbbell, Droplet, 
  Calendar, Shield, Target, Edit, Trophy, Trash2, Camera, 
  Upload, Download, Globe, Lock, Activity, Eye, EyeOff, 
  AlertCircle, Apple, LogOut
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
  workout: { enabled: boolean; time: string; days: string[] };
  meal: { enabled: boolean; breakfast: string; lunch: string; dinner: string };
  water: { enabled: boolean; interval: string; start: string; end: string };
  weighIn: { enabled: boolean; day: string; time: string };
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

const AVATAR_PRESETS = [
  { name: 'Iron Warrior', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&auto=format&fit=crop&q=80' },
  { name: 'Cardio Queen', url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=150&auto=format&fit=crop&q=80' },
  { name: 'Zen Master', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=150&auto=format&fit=crop&q=80' },
  { name: 'Muscle Legend', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&auto=format&fit=crop&q=80' }
];

export const ProfileView: React.FC<ProfileViewProps> = ({ onSaveProfile, savedGoal, onLogout }) => {
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'traits' | 'settings'>('dashboard');

  // Load biological profile state from localStorage
  const [name, setName] = useState<string>('Champion');
  const [email, setEmail] = useState<string>('champion@fitai.com');
  const [age, setAge] = useState<number>(26);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [height, setHeight] = useState<number>(175);
  const [weight, setWeight] = useState<number>(74);
  const [goalWeight, setGoalWeight] = useState<number>(68);
  const [activity, setActivity] = useState<string>('Moderately Active');
  const [type, setType] = useState<'Veg' | 'Non-Veg' | 'Eggetarian'>('Veg');
  const [goal, setGoal] = useState<string>('Gain Muscle');
  
  // Custom Profile Picture
  const [profilePic, setProfilePic] = useState<string>(() => {
    return localStorage.getItem('fitai_user_profile_pic') || AVATAR_PRESETS[0].url;
  });

  // Save statuses
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [reminderSaveSuccess, setReminderSaveSuccess] = useState(false);

  // Security and Account settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [language, setLanguage] = useState(() => localStorage.getItem('fitai_language') || 'English');
  const [darkMode, setDarkMode] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);
  const [biometricUnlock, setBiometricUnlock] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Notification settings categories config
  const [notifSettings, setNotifSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('fitai_notification_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      workout: true,
      meals: true,
      water: true,
      coach: true,
      weeklyReport: true,
      goal: true
    };
  });

  const updateNotifSetting = (key: keyof typeof notifSettings, val: boolean) => {
    const next = { ...notifSettings, [key]: val };
    setNotifSettings(next);
    localStorage.setItem('fitai_notification_settings', JSON.stringify(next));
    window.dispatchEvent(new Event('fitai_notification_settings_changed'));
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('fitai_language', lang);
  };

  // Load reminder settings
  const [reminders, setReminders] = useState<ReminderSettings>(() => {
    try {
      const saved = localStorage.getItem('fitai_reminders');
      if (saved) return JSON.parse(saved);
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

  // Sync state with localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('fitai_user_name');
    const savedAge = localStorage.getItem('fitai_user_age');
    const savedGender = localStorage.getItem('fitai_user_gender');
    const savedHeight = localStorage.getItem('fitai_user_height');
    const savedWeight = localStorage.getItem('fitai_user_weight');
    const savedGoalWeight = localStorage.getItem('fitai_user_goal_weight');
    const savedActivity = localStorage.getItem('fitai_user_activity');
    const savedType = localStorage.getItem('fitai_diet_type');
    const savedGoalVal = localStorage.getItem('fitai_diet_goal') || 'Muscle Gain';
    
    if (savedName) setName(savedName);
    if (savedAge) setAge(Number(savedAge));
    if (savedGender) setGender(savedGender as 'Male' | 'Female');
    if (savedHeight) setHeight(Number(savedHeight));
    if (savedWeight) setWeight(Number(savedWeight));
    if (savedGoalWeight) setGoalWeight(Number(savedGoalWeight));
    if (savedActivity) setActivity(savedActivity);
    if (savedType) setType(savedType as 'Veg' | 'Non-Veg' | 'Eggetarian');

    let mappedGoal = 'Gain Muscle';
    if (savedGoalVal === 'Fat Loss' || savedGoalVal === 'Lose Weight') mappedGoal = 'Lose Weight';
    else if (savedGoalVal === 'Muscle Gain' || savedGoalVal === 'Gain Muscle') mappedGoal = 'Gain Muscle';
    else if (savedGoalVal === 'Stamina' || savedGoalVal === 'Improve Stamina') mappedGoal = 'Improve Stamina';
    setGoal(mappedGoal);

    const savedUser = localStorage.getItem('fitai_current_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.email) setEmail(u.email);
      } catch {}
    }
  }, []);

  // Fetch dynamic telemetry datasets from localStorage
  const workoutHistory = React.useMemo<any[]>(() => {
    try {
      const saved = localStorage.getItem('fitai_workout_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  }, []);

  const waterLogs = React.useMemo<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('fitai_water_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  }, []);

  const loggedScannedFoods = React.useMemo<any[]>(() => {
    try {
      const saved = localStorage.getItem('fitai_scanned_food_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  }, []);

  const bodyFatLogs = React.useMemo<any[]>(() => {
    try {
      const saved = localStorage.getItem('fitai_body_fat_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  }, []);

  const latestScan = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('fitai_latest_body_composition');
      if (saved) return JSON.parse(saved);
      if (bodyFatLogs.length > 0) return bodyFatLogs[0];
    } catch {}
    return null;
  }, [bodyFatLogs]);

  // Streak calculations
  const workoutStreak = React.useMemo(() => {
    if (workoutHistory.length === 0) return 0;
    const sorted = [...workoutHistory].sort((a, b) => b.timestamp - a.timestamp);
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const hasLatest = sorted.some(w => {
      const d = new Date(w.timestamp);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime() || d.getTime() === yesterday.getTime();
    });

    if (!hasLatest) return 0;

    const currentCheck = new Date(today);
    for (let i = 0; i < 30; i++) {
      const dayTime = currentCheck.getTime();
      const hasWorkoutOnDay = sorted.some(w => {
        const d = new Date(w.timestamp);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === dayTime;
      });

      if (hasWorkoutOnDay) {
        streak++;
      } else {
        if (currentCheck.getTime() === today.getTime()) {
          const hasYesterday = sorted.some(w => {
            const d = new Date(w.timestamp);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === yesterday.getTime();
          });
          if (!hasYesterday) break;
        } else {
          break;
        }
      }
      currentCheck.setDate(currentCheck.getDate() - 1);
    }
    return streak;
  }, [workoutHistory]);

  // Biometrics & Targets mapping
  const heightInMeters = height / 100;
  const bmi = heightInMeters > 0 ? parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1)) : 0;

  let bmiCategory = 'Normal';
  let bmiDesc = 'You are in a healthy weight range. Maintain active compound cycles!';
  let bmiColor = 'text-brand-lime border-brand-lime/20 bg-brand-lime/10';

  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiDesc = 'Your BMI is low. Focus on linear compound loads and a clean caloric bulk.';
    bmiColor = 'text-brand-cyan border-brand-cyan/20 bg-brand-cyan/10';
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'Overweight';
    bmiDesc = 'Your BMI is slightly high. Focus on progressive deficits and steady state cardio.';
    bmiColor = 'text-amber-400 border-amber-400/20 bg-amber-400/10';
  } else if (bmi >= 30) {
    bmiCategory = 'Obese';
    bmiDesc = 'Health alert: High body fat. Prioritize caloric safety guidelines and low-impact circuits.';
    bmiColor = 'text-red-400 border-red-400/20 bg-red-400/10';
  }

  const targetCals = Number(localStorage.getItem('fitai_diet_calories') || '2000');
  const targetProt = Number(localStorage.getItem('fitai_diet_protein') || '140');
  const targetCarbs = Number(localStorage.getItem('fitai_diet_carbs') || '225');
  const targetFats = Number(localStorage.getItem('fitai_diet_fats') || '60');
  const targetFiber = Math.round((targetCals / 1000) * 14);
  const targetWater = Number(localStorage.getItem('fitai_water_goal') || '3000');

  // Lean body mass / Fat mass derivations
  const estBodyFatPct = latestScan ? latestScan.bodyFat : (gender === 'Female' ? 22 : 15);
  const leanMass = latestScan ? latestScan.leanMass : parseFloat((weight * (1 - estBodyFatPct / 100)).toFixed(1));
  const fatMass = latestScan ? latestScan.fatMass : parseFloat((weight - leanMass).toFixed(1));

  // Today's consumption calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCalories = loggedScannedFoods.reduce((sum: number, item: any) => sum + (item.kcal || 0), 0);
  const todayProtein = loggedScannedFoods.reduce((sum: number, item: any) => sum + (item.protein || 0), 0);
  const todayCarbs = loggedScannedFoods.reduce((sum: number, item: any) => sum + (item.carbs || 0), 0);
  const todayFat = loggedScannedFoods.reduce((sum: number, item: any) => sum + (item.fats || 0), 0);
  const todayFiber = loggedScannedFoods.reduce((sum: number, item: any) => sum + (item.fiber || 0), 0);
  const todayWater = waterLogs[todayStr] || 0;

  // Weekly Nutrition dataset
  const weeklyNutrition = React.useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayScans = loggedScannedFoods.filter((f: any) => {
        const fDate = new Date(f.timestamp).toISOString().split('T')[0];
        return fDate === dateStr;
      });

      let cals = dayScans.reduce((sum: number, item: any) => sum + (item.kcal || 0), 0);
      let prot = dayScans.reduce((sum: number, item: any) => sum + (item.protein || 0), 0);

      // Past mock data filler
      if (cals === 0 && i > 0) {
        const seed = dateStr.split('-').reduce((acc, c) => acc + Number(c), 0);
        cals = targetCals - 250 + (seed % 6) * 80;
        prot = targetProt - 15 + (seed % 5) * 6;
      }

      data.push({ date: dateStr, label: dayLabel, calories: cals, protein: prot });
    }
    return data;
  }, [loggedScannedFoods, targetCals, targetProt]);

  const [weeklyMetric, setWeeklyMetric] = useState<'calories' | 'protein'>('calories');
  const [hoveredBar, setHoveredBar] = useState<{
    index: number;
    x: number;
    y: number;
    val: number;
    label: string;
  } | null>(null);

  // SVG dimensions
  const svgWidth = 460;
  const svgHeight = 180;
  const padding = { top: 20, right: 10, bottom: 25, left: 40 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;
  const maxVal = Math.max(...weeklyNutrition.map(d => weeklyMetric === 'calories' ? d.calories : d.protein)) * 1.15 || 100;

  // Fitness stats calculations
  const totalVolume = workoutHistory.reduce((sum: number, w: any) => {
    let vol = 0;
    if (w.exercises) {
      w.exercises.forEach((ex: any) => {
        if (ex.sets) {
          ex.sets.forEach((s: any) => {
            vol += (s.weight || 0) * (s.reps || 0);
          });
        }
      });
    }
    return sum + vol;
  }, 0);
  
  const totalCaloriesBurned = Math.round(totalVolume * 0.08 + workoutHistory.length * 180);
  const totalTrainingHours = parseFloat(((workoutHistory.length * 45) / 60).toFixed(1));
  const weeklyWorkoutCount = workoutHistory.filter((w: any) => w.timestamp >= Date.now() - 7*24*60*60*1000).length;
  const monthlyWorkoutCount = workoutHistory.filter((w: any) => w.timestamp >= Date.now() - 30*24*60*60*1000).length;

  // File Change for Custom profile picture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfilePic(base64);
        localStorage.setItem('fitai_user_profile_pic', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPreset = (url: string) => {
    setProfilePic(url);
    localStorage.setItem('fitai_user_profile_pic', url);
  };

  // Save Settings forms
  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Commit profile values to localStorage keys
    localStorage.setItem('fitai_user_name', name);
    localStorage.setItem('fitai_user_age', String(age));
    localStorage.setItem('fitai_user_gender', gender);
    localStorage.setItem('fitai_user_height', String(height));
    localStorage.setItem('fitai_user_weight', String(weight));
    localStorage.setItem('fitai_user_goal_weight', String(goalWeight));
    localStorage.setItem('fitai_user_activity', activity);
    localStorage.setItem('fitai_diet_type', type);

    let dGoal = goal;
    if (goal === 'Lose Weight') dGoal = 'Fat Loss';
    else if (goal === 'Gain Muscle') dGoal = 'Muscle Gain';
    else if (goal === 'Improve Stamina') dGoal = 'Stamina';
    localStorage.setItem('fitai_diet_goal', dGoal);

    // Sync fitai_current_user session
    const savedUser = localStorage.getItem('fitai_current_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        const nextUser = { 
          ...u, name, age, weight, height, targetWeight: goalWeight, 
          gender, activityLevel: activity, dietPreference: type, goal: dGoal, email 
        };
        localStorage.setItem('fitai_current_user', JSON.stringify(nextUser));

        // Registry sync
        const rawUsers = localStorage.getItem('fitai_users');
        if (rawUsers) {
          const users = JSON.parse(rawUsers);
          const idx = users.findIndex((user: any) => user.email.toLowerCase() === u.email.toLowerCase());
          if (idx !== -1) {
            users[idx] = { ...users[idx], ...nextUser };
            localStorage.setItem('fitai_users', JSON.stringify(users));
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    onSaveProfile({
      name,
      age,
      weight,
      height,
      goalWeight,
      gender,
      activity,
      type,
      goal: dGoal
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSaveReminders = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('fitai_reminders', JSON.stringify(reminders));
    setReminderSaveSuccess(true);
    setTimeout(() => setReminderSaveSuccess(false), 2000);
  };

  // Change Password submit handler
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const savedUser = localStorage.getItem('fitai_current_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.password && u.password !== currentPassword) {
          setPasswordError('Current password does not match registry.');
          return;
        }
        u.password = newPassword;
        localStorage.setItem('fitai_current_user', JSON.stringify(u));

        const rawUsers = localStorage.getItem('fitai_users');
        if (rawUsers) {
          const users = JSON.parse(rawUsers);
          const idx = users.findIndex((user: any) => user.email.toLowerCase() === u.email.toLowerCase());
          if (idx !== -1) {
            users[idx].password = newPassword;
            localStorage.setItem('fitai_users', JSON.stringify(users));
          }
        }
        setPasswordSuccess(true);
        setPasswordError('');
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => setPasswordSuccess(false), 3000);
      } catch (err) {
        setPasswordError('Failed to change password credentials.');
      }
    }
  };

  // JSON Data Exporter
  const handleExportData = () => {
    const data = {
      profile: { name, email, age, gender, height, weight, goalWeight, activity, goal, dietPreference: type },
      workouts: workoutHistory,
      foodLogs: loggedScannedFoods,
      waterLogs: waterLogs,
      bodyFatLogs: bodyFatLogs,
      reminders
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `fitai_fitness_data_${name.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDeleteAccount = () => {
    localStorage.clear();
    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  // Render progress bar helper
  const renderProgressBar = (pct: number, colorClass: string) => {
    const filled = Math.min(10, Math.round(pct / 10));
    return (
      <div className="font-mono text-[9px] flex items-center gap-2">
        <span className={colorClass}>
          {'█'.repeat(filled)}
          <span className="opacity-20">{'█'.repeat(10 - filled)}</span>
        </span>
        <span className="font-extrabold text-zinc-300">{pct}%</span>
      </div>
    );
  };

  return (
    <section className="relative py-24 overflow-hidden min-h-screen text-zinc-100 bg-[#03000a] text-left">
      <div className="absolute top-[20%] right-[20%] w-[350px] h-[350px] bg-brand-violet/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[20%] w-[350px] h-[350px] bg-brand-cyan/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-12">
        
        {/* Header Profile Summary block */}
        <SpotlightCard className="p-6 md:p-8 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left">
            {/* Avatar block */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-brand-violet/40 bg-dark-950 flex items-center justify-center relative">
                <img src={profilePic} className="w-full h-full object-cover" alt="Profile" />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-200">
                  <Camera className="w-5 h-5 text-white mb-0.5" />
                  <span className="text-[7.5px] font-black uppercase text-zinc-300">Upload</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* Profile Info metadata */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                <h2 className="text-2xl font-display font-black text-white">{name}</h2>
                <div className="flex gap-2 justify-center">
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-violet/10 border border-brand-violet/20 text-brand-violet text-[9px] font-black uppercase tracking-wider">
                    {goal}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-[9px] font-black uppercase tracking-wider">
                    🔥 {workoutStreak} Day Streak
                  </span>
                </div>
              </div>
              <p className="text-zinc-550 text-xs font-semibold">{email} | {gender}, {age} y/o | {type} Diet</p>
              
              {/* Preset selection carousel */}
              <div className="pt-2 border-t border-white/5 flex flex-col md:flex-row items-center gap-2">
                <span className="text-[8px] text-zinc-655 font-black uppercase tracking-wider flex items-center gap-1">
                  <Upload className="w-3 h-3" /> Quick Presets:
                </span>
                <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-[280px] custom-scrollbar">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => selectPreset(preset.url)}
                      className={`px-2 py-0.5 rounded bg-white/5 border border-white/5 hover:border-brand-violet text-[8px] text-zinc-400 font-bold transition-all truncate shrink-0 ${
                        profilePic === preset.url ? 'border-brand-violet text-white bg-brand-violet/5' : ''
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA logout */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2 border border-white/5 hover:border-red-500/30 bg-white/5 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 text-[10px] font-black rounded-xl transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Log Out
              </button>
            )}
          </div>
        </SpotlightCard>

        {/* Tab Navigation Menu */}
        <div className="flex justify-center max-w-6xl mx-auto border-b border-white/5 pb-2">
          <div className="flex bg-white/5 p-1 rounded-2xl gap-2 w-full max-w-md">
            {[
              { id: 'dashboard' as const, label: '📊 Dashboard', desc: 'Telemetry analytics' },
              { id: 'traits' as const, label: '✏️ Edit Traits', desc: 'Biological traits' },
              { id: 'settings' as const, label: '⚙️ Settings', desc: 'Account & Reminders' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all tracking-wider ${
                  activeTab === tab.id 
                    ? 'bg-brand-violet text-white shadow-lg shadow-brand-violet/20 border border-brand-violet/25' 
                    : 'text-zinc-555 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Panes */}
        <div className="max-w-6xl mx-auto">
          
          {/* TAB 1: PERFORMANCE DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (8 cols): Health metrics + statistics + nutrition chart */}
              <div className="md:col-span-8 space-y-8">
                
                {/* Health Metrics Deck */}
                <SpotlightCard className="p-6 space-y-4 text-left">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Scale className="h-4 w-4 text-brand-cyan" /> Health & Biometric Metrics
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="p-3.5 bg-dark-950/60 border border-white/5 rounded-xl space-y-1">
                      <span className="text-[9px] text-zinc-555 font-bold uppercase block">Current Weight</span>
                      <span className="text-sm font-black text-white">{weight} kg</span>
                    </div>
                    <div className="p-3.5 bg-dark-950/60 border border-white/5 rounded-xl space-y-1">
                      <span className="text-[9px] text-zinc-555 font-bold uppercase block">Goal Weight</span>
                      <span className="text-sm font-black text-white">{goalWeight} kg</span>
                    </div>
                    <div className="p-3.5 bg-dark-950/60 border border-white/5 rounded-xl space-y-1 relative">
                      <span className="text-[9px] text-zinc-555 font-bold uppercase block">BMI Value</span>
                      <span className="text-sm font-black text-white block">{bmi} kg/m²</span>
                      <span className={`absolute right-2 top-2 px-1.5 py-0.2 rounded text-[7px] font-black uppercase ${bmiColor}`}>
                        {bmiCategory}
                      </span>
                    </div>
                    <div className="p-3.5 bg-dark-950/60 border border-white/5 rounded-xl space-y-1">
                      <span className="text-[9px] text-zinc-555 font-bold uppercase block">Lean Body Mass</span>
                      <span className="text-sm font-black text-brand-lime">{leanMass} kg</span>
                    </div>
                    <div className="p-3.5 bg-dark-950/60 border border-white/5 rounded-xl space-y-1">
                      <span className="text-[9px] text-zinc-555 font-bold uppercase block">Fat Mass</span>
                      <span className="text-sm font-black text-brand-pink">{fatMass} kg</span>
                    </div>
                    <div className="p-3.5 bg-dark-950/60 border border-white/5 rounded-xl space-y-1">
                      <span className="text-[9px] text-zinc-555 font-bold uppercase block">Estimated BF%</span>
                      <span className="text-sm font-black text-brand-cyan">{estBodyFatPct}%</span>
                    </div>
                  </div>

                  {/* BMI risk dynamic detail */}
                  <div className="p-3.5 bg-brand-cyan/5 border border-brand-cyan/10 text-zinc-400 rounded-xl text-[10px] leading-relaxed">
                    <strong className="text-brand-cyan uppercase text-[8px] block mb-0.5">Metabolic Evaluation Advisory</strong>
                    {bmiDesc}
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-white/5 text-[9px] text-zinc-450 uppercase font-black">
                    <div>
                      <span className="block text-[8px] text-zinc-500 font-bold">Daily Calorie Target</span>
                      <strong className="text-white text-xs">{targetCals} kcal</strong>
                    </div>
                    <div>
                      <span className="block text-[8px] text-zinc-500 font-bold">Daily Protein Goal</span>
                      <strong className="text-brand-lime text-xs">{targetProt}g</strong>
                    </div>
                    <div>
                      <span className="block text-[8px] text-zinc-500 font-bold">Daily Water Target</span>
                      <strong className="text-brand-cyan text-xs">{(targetWater / 1000).toFixed(1)} L</strong>
                    </div>
                  </div>
                </SpotlightCard>

                {/* Fitness Statistics */}
                <SpotlightCard className="p-6 space-y-4 text-left">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Activity className="h-4 w-4 text-brand-pink" /> Fitness Aggregates & Statistics
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="p-3.5 bg-dark-950/60 border border-white/5 rounded-xl space-y-1">
                      <span className="text-[9px] text-zinc-555 font-bold uppercase block">Workout Streak</span>
                      <span className="text-sm font-black text-brand-lime">🔥 {workoutStreak} Days</span>
                    </div>
                    <div className="p-3.5 bg-dark-950/60 border border-white/5 rounded-xl space-y-1">
                      <span className="text-[9px] text-zinc-555 font-bold uppercase block">Total Workouts</span>
                      <span className="text-sm font-black text-white">{workoutHistory.length} Sessions</span>
                    </div>
                    <div className="p-3.5 bg-dark-950/60 border border-white/5 rounded-xl space-y-1">
                      <span className="text-[9px] text-zinc-555 font-bold uppercase block">Training Volume Burn</span>
                      <span className="text-sm font-black text-white">{totalCaloriesBurned} kcal</span>
                    </div>
                    <div className="p-3.5 bg-dark-950/60 border border-white/5 rounded-xl space-y-1">
                      <span className="text-[9px] text-zinc-555 font-bold uppercase block">Training Duration</span>
                      <span className="text-sm font-black text-white">{totalTrainingHours} Hours</span>
                    </div>
                    <div className="p-3.5 bg-dark-950/60 border border-white/5 rounded-xl space-y-1">
                      <span className="text-[9px] text-zinc-555 font-bold uppercase block">Weekly Count</span>
                      <span className="text-sm font-black text-brand-cyan">{weeklyWorkoutCount} / Week</span>
                    </div>
                    <div className="p-3.5 bg-dark-950/60 border border-white/5 rounded-xl space-y-1">
                      <span className="text-[9px] text-zinc-555 font-bold uppercase block">Monthly Count</span>
                      <span className="text-sm font-black text-white">{monthlyWorkoutCount} / Month</span>
                    </div>
                  </div>
                </SpotlightCard>

                {/* Nutrition Summary & Weekly SVG Chart */}
                <SpotlightCard className="p-6 space-y-4 text-left">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Apple className="h-4 w-4 text-brand-lime" /> Weekly Nutrition Summary
                    </h3>
                    <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5">
                      {(['calories', 'protein'] as const).map(metric => (
                        <button
                          key={metric}
                          onClick={() => setWeeklyMetric(metric)}
                          className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase transition-all ${
                            weeklyMetric === metric ? 'bg-brand-violet text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {metric}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SVG Bar Chart block */}
                  <div className="bg-dark-950/40 p-4 border border-white/5 rounded-2xl">
                    <div className="relative">
                      <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="overflow-visible mx-auto">
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
                          </linearGradient>
                        </defs>
                        {/* Background Grid Lines */}
                        {[0, 1, 2, 3, 4].map(lineIdx => {
                          const yVal = padding.top + (chartHeight / 4) * lineIdx;
                          const scaleVal = Math.round(maxVal - (maxVal / 4) * lineIdx);
                          return (
                            <g key={lineIdx}>
                              <line 
                                x1={padding.left} 
                                y1={yVal} 
                                x2={svgWidth - padding.right} 
                                y2={yVal} 
                                stroke="rgba(255,255,255,0.05)" 
                                strokeWidth="1"
                                strokeDasharray="3 3"
                              />
                              <text 
                                x={padding.left - 8} 
                                y={yVal + 3} 
                                fill="rgba(255,255,255,0.4)" 
                                fontSize="8" 
                                fontWeight="bold"
                                textAnchor="end"
                              >
                                {scaleVal}
                              </text>
                            </g>
                          );
                        })}

                        {/* Target Threshold Line */}
                        {(() => {
                          const targetVal = weeklyMetric === 'calories' ? targetCals : targetProt;
                          const targetY = padding.top + chartHeight - (targetVal / maxVal) * chartHeight;
                          if (targetY >= padding.top && targetY <= padding.top + chartHeight) {
                            return (
                              <g>
                                <line 
                                  x1={padding.left} 
                                  y1={targetY} 
                                  x2={svgWidth - padding.right} 
                                  y2={targetY} 
                                  stroke="#a3e635" 
                                  strokeWidth="1.2" 
                                  strokeDasharray="2 2"
                                />
                                <text 
                                  x={svgWidth - padding.right - 5} 
                                  y={targetY - 4} 
                                  fill="#a3e635" 
                                  fontSize="7" 
                                  fontWeight="black" 
                                  textAnchor="end"
                                >
                                  GOAL: {targetVal} {weeklyMetric === 'calories' ? 'kcal' : 'g'}
                                </text>
                              </g>
                            );
                          }
                          return null;
                        })()}

                        {/* Bars */}
                        {weeklyNutrition.map((day, idx) => {
                          const val = weeklyMetric === 'calories' ? day.calories : day.protein;
                          const barHeight = Math.max(5, (val / maxVal) * chartHeight);
                          const barWidth = Math.max(16, (chartWidth / 7) - 16);
                          const x = padding.left + (idx * (chartWidth / 7)) + (chartWidth / 14) - barWidth / 2;
                          const y = padding.top + chartHeight - barHeight;
                          
                          const isHovered = hoveredBar && hoveredBar.index === idx;

                          return (
                            <g key={day.date}>
                              {/* Hover hitbox */}
                              <rect 
                                x={x - 4} 
                                y={padding.top} 
                                width={barWidth + 8} 
                                height={chartHeight} 
                                fill="transparent"
                                className="cursor-pointer"
                                onMouseEnter={() => {
                                  setHoveredBar({
                                    index: idx,
                                    x: x + barWidth / 2,
                                    y: y,
                                    val: val,
                                    label: day.label
                                  });
                                }}
                                onMouseLeave={() => setHoveredBar(null)}
                              />
                              {/* Glowing Bar */}
                              <rect 
                                x={x} 
                                y={y} 
                                width={barWidth} 
                                height={barHeight} 
                                rx="3"
                                fill={isHovered ? (weeklyMetric === 'calories' ? '#a3e635' : '#06b6d4') : 'url(#barGradient)'}
                                stroke={isHovered ? 'white' : 'rgba(255,255,255,0.05)'}
                                strokeWidth="1"
                                className="transition-all duration-200"
                              />
                              {/* Axis X Label */}
                              <text 
                                x={x + barWidth / 2} 
                                y={padding.top + chartHeight + 14} 
                                fill={isHovered ? 'white' : 'rgba(255,255,255,0.4)'} 
                                fontSize="8" 
                                fontWeight="black"
                                textAnchor="middle"
                              >
                                {day.label}
                              </text>
                            </g>
                          );
                        })}
                      </svg>

                      {/* Bar Tooltip overlay */}
                      <AnimatePresence>
                        {hoveredBar && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ 
                              position: 'absolute', 
                              left: `${((hoveredBar.x) / svgWidth) * 100}%`, 
                              top: `${hoveredBar.y - 45}px`,
                              transform: 'translateX(-50%)'
                            }}
                            className="z-50 px-2 py-1 bg-dark-900 border border-white/10 rounded-lg shadow-xl text-[10px] text-center font-bold text-white pointer-events-none"
                          >
                            <div className="text-zinc-500 uppercase text-[8px] font-black">{hoveredBar.label}</div>
                            <div>{hoveredBar.val} {weeklyMetric === 'calories' ? 'kcal' : 'g'}</div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </SpotlightCard>

              </div>

              {/* Right Column (4 cols): Nutrition macro progress bars + AI Estimator + Achievements */}
              <div className="md:col-span-4 space-y-8">
                
                {/* Today's macro splits */}
                <SpotlightCard className="p-6 space-y-4 text-left">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Apple className="h-4 w-4 text-brand-lime" /> Today's Macro Progress
                  </h3>

                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between items-center text-[9px] uppercase font-bold text-zinc-500 mb-1">
                        <span>Calories ({todayCalories} / {targetCals} kcal)</span>
                      </div>
                      {renderProgressBar(Math.min(100, Math.round((todayCalories / targetCals) * 100)), 'text-brand-pink')}
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-[9px] uppercase font-bold text-zinc-500 mb-1">
                        <span>Protein ({todayProtein} / {targetProt}g)</span>
                      </div>
                      {renderProgressBar(Math.min(100, Math.round((todayProtein / targetProt) * 100)), 'text-brand-lime')}
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-[9px] uppercase font-bold text-zinc-500 mb-1">
                        <span>Carbs ({todayCarbs} / {targetCarbs}g)</span>
                      </div>
                      {renderProgressBar(Math.min(100, Math.round((todayCarbs / targetCarbs) * 100)), 'text-brand-cyan')}
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-[9px] uppercase font-bold text-zinc-500 mb-1">
                        <span>Fat ({todayFat} / {targetFats}g)</span>
                      </div>
                      {renderProgressBar(Math.min(100, Math.round((todayFat / targetFats) * 100)), 'text-brand-pink')}
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-[9px] uppercase font-bold text-zinc-500 mb-1">
                        <span>Fiber ({todayFiber} / {targetFiber}g)</span>
                      </div>
                      {renderProgressBar(Math.min(100, Math.round((todayFiber / targetFiber) * 100)), 'text-yellow-400')}
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-[9px] uppercase font-bold text-zinc-500 mb-1">
                        <span>Water Intake ({todayWater} / {targetWater} ml)</span>
                      </div>
                      {renderProgressBar(Math.min(100, Math.round((todayWater / targetWater) * 100)), 'text-brand-cyan')}
                    </div>
                  </div>
                </SpotlightCard>

                {/* Body Composition Estimator sync card */}
                <SpotlightCard className="p-6 space-y-4 text-left">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Target className="h-4 w-4 text-brand-cyan" /> Body Fat Composition
                  </h3>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between items-center text-zinc-400">
                      <span className="font-semibold">Current Body Fat:</span>
                      <strong className="text-white">{estBodyFatPct}%</strong>
                    </div>
                    <div className="flex justify-between items-center text-zinc-400">
                      <span className="font-semibold">Target Body Fat:</span>
                      <strong className="text-brand-cyan">{latestScan ? latestScan.targetBodyFat : (gender === 'Female' ? 22 : 15)}%</strong>
                    </div>
                    <div className="flex justify-between items-center text-zinc-400">
                      <span className="font-semibold">Last Scan Date:</span>
                      <strong className="text-white">{latestScan ? latestScan.date : 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-550 uppercase font-black block mb-1">Recomposition Goal Progress</span>
                      {renderProgressBar(
                        latestScan ? Math.max(0, Math.min(100, Math.round(((estBodyFatPct - latestScan.targetBodyFat) / (estBodyFatPct || 1)) * 100))) : 0, 
                        'text-brand-lime'
                      )}
                    </div>
                  </div>
                </SpotlightCard>

                {/* Achievements Badges */}
                <SpotlightCard className="p-6 space-y-4 text-left">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Trophy className="h-4 w-4 text-yellow-400 animate-pulse" /> Achievements Badges
                  </h3>

                  <div className="space-y-2.5">
                    {[
                      { name: '🔥 7 Day Streak', desc: 'Run consecutive workouts cycles', unlocked: workoutStreak >= 7 },
                      { name: '🏋 Gym Warrior', desc: '5+ exercise sessions completed', unlocked: workoutHistory.length >= 5 },
                      { name: '🥩 Protein Master', desc: 'Preserved lean tissue protein target', unlocked: todayProtein >= targetProt },
                      { name: '💧 Hydration Hero', desc: 'Hit optimal hydration thresholds', unlocked: todayWater >= targetWater },
                      { name: '⚖ Goal Achieved', desc: 'Body weight hit targeted thresholds', unlocked: Math.abs(weight - goalWeight) <= 0.5 }
                    ].map((badge) => (
                      <div 
                        key={badge.name} 
                        className={`p-2.5 rounded-xl border flex items-start gap-3 transition-opacity duration-300 ${
                          badge.unlocked 
                            ? 'bg-brand-violet/10 border-brand-violet/20 opacity-100' 
                            : 'bg-dark-950/20 border-white/5 opacity-40'
                        }`}
                      >
                        <div className="text-xl">{badge.unlocked ? '🏆' : '🔒'}</div>
                        <div>
                          <h4 className="text-[10px] font-black text-white">{badge.name}</h4>
                          <p className="text-[8.5px] text-zinc-555 leading-normal">{badge.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </SpotlightCard>

              </div>

            </div>
          )}

          {/* TAB 2: EDIT BIOLOGICAL TRAITS */}
          {activeTab === 'traits' && (
            <div className="max-w-xl mx-auto">
              <SpotlightCard className="p-6 text-left">
                <form onSubmit={handleSaveClick} className="space-y-6">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
                    <Edit className="h-4.5 w-4.5 text-brand-cyan" /> Edit Personal Traits
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Alias */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[9px] text-zinc-555 font-black uppercase tracking-wider block">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet font-semibold"
                        placeholder="Name Alias"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[9px] text-zinc-555 font-black uppercase tracking-wider block">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
                        placeholder="email@fitai.com"
                        required
                      />
                    </div>

                    {/* Age */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-zinc-555 font-black uppercase tracking-wider block">Age (Years)</label>
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
                      <label className="text-[9px] text-zinc-555 font-black uppercase tracking-wider block">Gender</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['Male', 'Female'] as const).map(g => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setGender(g)}
                            className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                              gender === g ? 'bg-brand-violet/20 border-brand-violet text-white' : 'bg-dark-950 border-white/5 text-zinc-500'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Height */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-zinc-555 font-black uppercase tracking-wider block">Height (cm)</label>
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
                      <label className="text-[9px] text-zinc-555 font-black uppercase tracking-wider block">Weight (kg)</label>
                      <input
                        type="number"
                        min="30"
                        max="200"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
                        required
                      />
                    </div>

                    {/* Goal Weight */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-zinc-555 font-black uppercase tracking-wider block">Target Weight (kg)</label>
                      <input
                        type="number"
                        min="30"
                        max="200"
                        value={goalWeight}
                        onChange={(e) => setGoalWeight(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
                        required
                      />
                    </div>

                    {/* Activity Level */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-zinc-555 font-black uppercase tracking-wider block">Activity Level</label>
                      <select
                        value={activity}
                        onChange={(e) => setActivity(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
                      >
                        {['Sedentary', 'Moderately Active', 'Very Active', 'Athlete/Highly Active'].map(lvl => (
                          <option key={lvl} value={lvl} className="bg-dark-950">{lvl}</option>
                        ))}
                      </select>
                    </div>

                    {/* Fitness Goal */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-zinc-555 font-black uppercase tracking-wider block">Fitness Goal</label>
                      <select
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
                      >
                        {['Lose Weight', 'Gain Muscle', 'Improve Stamina'].map(g => (
                          <option key={g} value={g} className="bg-dark-950">{g}</option>
                        ))}
                      </select>
                      {savedGoal && <span className="text-[8px] text-brand-lime font-bold block mt-1">Currently synced in database to: {savedGoal}</span>}
                    </div>

                    {/* Diet Preference */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-zinc-555 font-black uppercase tracking-wider block">Diet Preference</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
                      >
                        {['Veg', 'Non-Veg', 'Eggetarian'].map(diet => (
                          <option key={diet} value={diet} className="bg-dark-950">{diet}</option>
                        ))}
                      </select>
                    </div>

                  </div>

                  <AnimatePresence>
                    {saveSuccess && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl text-center"
                      >
                        ✓ Biological traits updated in profile registry!
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-violet hover:bg-brand-violet-hover text-white text-xs font-black rounded-xl hover:scale-101 hover:shadow-glow-purple transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                  >
                    <Check className="h-4.5 w-4.5" /> Save Changes
                  </button>
                </form>
              </SpotlightCard>
            </div>
          )}

          {/* TAB 3: ACCOUNT & REMINDERS SETTINGS */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Settings (5 cols): Reminders Alert Form */}
              <div className="lg:col-span-7">
                <SpotlightCard className="p-6 h-full text-left">
                  <form onSubmit={handleSaveReminders} className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
                      <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                          <Bell className="h-4.5 w-4.5 text-brand-violet animate-pulse" /> Notification Reminders
                        </h3>
                        <p className="text-[10px] text-zinc-550 leading-relaxed">Schedule alarm timers to keep workout compliance synced.</p>
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-brand-violet text-white text-[10px] font-black rounded-xl hover:scale-102 hover:shadow-glow-purple transition-all cursor-pointer"
                      >
                        Save Reminders
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Workout timers */}
                      <div className={`p-4 rounded-xl border transition-all duration-300 ${
                        reminders.workout.enabled ? 'bg-dark-950/40 border-brand-violet/20' : 'bg-dark-950/10 border-white/5 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black text-white flex items-center gap-1.5">
                            <Dumbbell className="w-3.5 h-3.5 text-brand-violet" /> Workouts
                          </span>
                          <ToggleButton 
                            enabled={reminders.workout.enabled} 
                            onChange={(val) => setReminders(prev => ({
                              ...prev, workout: { ...prev.workout, enabled: val }
                            }))}
                          />
                        </div>
                        {reminders.workout.enabled && (
                          <div className="space-y-2">
                            <input 
                              type="time" 
                              value={reminders.workout.time}
                              onChange={(e) => setReminders(prev => ({
                                ...prev, workout: { ...prev.workout, time: e.target.value }
                              }))}
                              className="w-full px-2 py-1 bg-dark-950 border border-white/5 rounded-lg text-xs text-white"
                            />
                            <div className="flex flex-wrap gap-1">
                              {['Mon', 'Wed', 'Fri'].map(day => {
                                const isSelected = reminders.workout.days.includes(day);
                                return (
                                  <button
                                    key={day}
                                    type="button"
                                    onClick={() => {
                                      const current = reminders.workout.days;
                                      const next = current.includes(day) ? current.filter(d => d !== day) : [...current, day];
                                      setReminders(prev => ({ ...prev, workout: { ...prev.workout, days: next } }));
                                    }}
                                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                                      isSelected ? 'bg-brand-violet/20 border-brand-violet text-white' : 'bg-dark-950 border-white/5 text-zinc-650'
                                    }`}
                                  >
                                    {day}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Meal timers */}
                      <div className={`p-4 rounded-xl border transition-all duration-300 ${
                        reminders.meal.enabled ? 'bg-dark-950/40 border-brand-lime/20' : 'bg-dark-950/10 border-white/5 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black text-white flex items-center gap-1.5">
                            <Apple className="w-3.5 h-3.5 text-brand-lime" /> Meal Timers
                          </span>
                          <ToggleButton 
                            enabled={reminders.meal.enabled} 
                            onChange={(val) => setReminders(prev => ({
                              ...prev, meal: { ...prev.meal, enabled: val }
                            }))}
                          />
                        </div>
                        {reminders.meal.enabled && (
                          <div className="space-y-1.5 text-[9px] text-zinc-555">
                            <div>
                              <span>Breakfast:</span>
                              <input type="time" value={reminders.meal.breakfast} onChange={(e) => setReminders(prev => ({ ...prev, meal: { ...prev.meal, breakfast: e.target.value } }))} className="w-full px-2 py-0.5 bg-dark-950 border border-white/5 rounded text-[10px] text-white" />
                            </div>
                            <div>
                              <span>Lunch:</span>
                              <input type="time" value={reminders.meal.lunch} onChange={(e) => setReminders(prev => ({ ...prev, meal: { ...prev.meal, lunch: e.target.value } }))} className="w-full px-2 py-0.5 bg-dark-950 border border-white/5 rounded text-[10px] text-white" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Water alarms */}
                      <div className={`p-4 rounded-xl border transition-all duration-300 ${
                        reminders.water.enabled ? 'bg-dark-950/40 border-brand-cyan/20' : 'bg-dark-950/10 border-white/5 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black text-white flex items-center gap-1.5">
                            <Droplet className="w-3.5 h-3.5 text-brand-cyan" /> Water Alerts
                          </span>
                          <ToggleButton 
                            enabled={reminders.water.enabled} 
                            onChange={(val) => setReminders(prev => ({
                              ...prev, water: { ...prev.water, enabled: val }
                            }))}
                          />
                        </div>
                        {reminders.water.enabled && (
                          <div className="space-y-1.5">
                            <select value={reminders.water.interval} onChange={(e) => setReminders(prev => ({ ...prev, water: { ...prev.water, interval: e.target.value } }))} className="w-full px-2 py-1 bg-dark-950 border border-white/5 rounded text-[10px] text-white">
                              {['30 Min', '1 Hour', '2 Hours'].map(int => <option key={int} value={int}>{int}</option>)}
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Weigh-in */}
                      <div className={`p-4 rounded-xl border transition-all duration-300 ${
                        reminders.weighIn.enabled ? 'bg-dark-950/40 border-brand-pink/20' : 'bg-dark-950/10 border-white/5 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black text-white flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-brand-pink" /> Weigh-In
                          </span>
                          <ToggleButton 
                            enabled={reminders.weighIn.enabled} 
                            onChange={(val) => setReminders(prev => ({
                              ...prev, weighIn: { ...prev.weighIn, enabled: val }
                            }))}
                          />
                        </div>
                        {reminders.weighIn.enabled && (
                          <div className="space-y-1">
                            <select value={reminders.weighIn.day} onChange={(e) => setReminders(prev => ({ ...prev, weighIn: { ...prev.weighIn, day: e.target.value } }))} className="w-full px-2 py-1 bg-dark-950 border border-white/5 rounded text-[10px] text-white">
                              {['Monday', 'Wednesday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {reminderSaveSuccess && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg text-center"
                        >
                          ✓ Timers synchronized successfully!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                </SpotlightCard>
              </div>

              {/* Right Settings (7 cols): Password Change & Account Security settings */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Account Security options */}
                <SpotlightCard className="p-6 text-left space-y-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Shield className="h-4.5 w-4.5 text-brand-cyan" /> App Preferences & Privacy
                  </h3>

                  <div className="space-y-3">
                    {/* Public Profile toggle */}
                    <div className="flex items-center justify-between p-2.5 bg-dark-950/40 border border-white/5 rounded-xl">
                      <div>
                        <span className="block text-[10px] font-bold text-white">Public Analytics Profile</span>
                        <span className="text-[8px] text-zinc-550">Allow other users to search your stats</span>
                      </div>
                      <ToggleButton enabled={publicProfile} onChange={setPublicProfile} />
                    </div>

                    {/* Biometric Toggle placeholder */}
                    <div className="flex items-center justify-between p-2.5 bg-dark-950/40 border border-white/5 rounded-xl">
                      <div>
                        <span className="block text-[10px] font-bold text-white">Biometric Fingerprint Lock</span>
                        <span className="text-[8px] text-zinc-550">Lock dashboard on app execution</span>
                      </div>
                      <ToggleButton enabled={biometricUnlock} onChange={setBiometricUnlock} />
                    </div>

                    {/* Dark Mode toggle */}
                    <div className="flex items-center justify-between p-2.5 bg-dark-950/40 border border-white/5 rounded-xl">
                      <div>
                        <span className="block text-[10px] font-bold text-white">Dark Theme Interface</span>
                        <span className="text-[8px] text-zinc-550">FitAI Curated Glassmorphism theme</span>
                      </div>
                      <ToggleButton enabled={darkMode} onChange={setDarkMode} />
                    </div>

                    {/* Language select */}
                    <div className="flex items-center justify-between p-2.5 bg-dark-950/40 border border-white/5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-brand-violet" />
                        <span className="text-[10px] font-bold text-white">App Language</span>
                      </div>
                      <select 
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="px-2 py-1 bg-dark-950 border border-white/5 rounded text-[10px] text-white focus:outline-none cursor-pointer"
                      >
                        {['English', 'Spanish', 'German', 'French'].map(lang => <option key={lang} value={lang}>{lang}</option>)}
                      </select>
                    </div>
                  </div>
                </SpotlightCard>

                {/* Smart Notification Preferences */}
                <SpotlightCard className="p-6 text-left space-y-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Bell className="h-4.5 w-4.5 text-brand-violet animate-pulse" /> Notification Channels
                  </h3>

                  <div className="space-y-3">
                    {/* Workouts */}
                    <div className="flex items-center justify-between p-2.5 bg-dark-950/40 border border-white/5 rounded-xl">
                      <div>
                        <span className="block text-[10px] font-bold text-white">Workout Training Reminders</span>
                        <span className="text-[8px] text-zinc-550">Alerts for scheduled and incomplete workouts</span>
                      </div>
                      <ToggleButton enabled={notifSettings.workout} onChange={(val) => updateNotifSetting('workout', val)} />
                    </div>

                    {/* Meals */}
                    <div className="flex items-center justify-between p-2.5 bg-dark-950/40 border border-white/5 rounded-xl">
                      <div>
                        <span className="block text-[10px] font-bold text-white">Meal & Nutrition Alerts</span>
                        <span className="text-[8px] text-zinc-550">Alerts for meal schedules and macro goals remaining</span>
                      </div>
                      <ToggleButton enabled={notifSettings.meals} onChange={(val) => updateNotifSetting('meals', val)} />
                    </div>

                    {/* Water */}
                    <div className="flex items-center justify-between p-2.5 bg-dark-950/40 border border-white/5 rounded-xl">
                      <div>
                        <span className="block text-[10px] font-bold text-white">Water Hydration Reminders</span>
                        <span className="text-[8px] text-zinc-550">Periodic notifications to drink and log water</span>
                      </div>
                      <ToggleButton enabled={notifSettings.water} onChange={(val) => updateNotifSetting('water', val)} />
                    </div>

                    {/* AI Coach */}
                    <div className="flex items-center justify-between p-2.5 bg-dark-950/40 border border-white/5 rounded-xl">
                      <div>
                        <span className="block text-[10px] font-bold text-white">AI Coach Smart Advisory</span>
                        <span className="text-[8px] text-zinc-550">Intelligent alerts regarding recovery and routines</span>
                      </div>
                      <ToggleButton enabled={notifSettings.coach} onChange={(val) => updateNotifSetting('coach', val)} />
                    </div>

                    {/* Weekly Performance Reports */}
                    <div className="flex items-center justify-between p-2.5 bg-dark-950/40 border border-white/5 rounded-xl">
                      <div>
                        <span className="block text-[10px] font-bold text-white">Weekly Performance Reports</span>
                        <span className="text-[8px] text-zinc-550">Summarized dashboard alerts for weekly weight/fat metrics</span>
                      </div>
                      <ToggleButton enabled={notifSettings.weeklyReport} onChange={(val) => updateNotifSetting('weeklyReport', val)} />
                    </div>

                    {/* Goal Updates */}
                    <div className="flex items-center justify-between p-2.5 bg-dark-950/40 border border-white/5 rounded-xl">
                      <div>
                        <span className="block text-[10px] font-bold text-white">Goal & Milestone Milestones</span>
                        <span className="text-[8px] text-zinc-550">Notifications tracking proximity to weight target</span>
                      </div>
                      <ToggleButton enabled={notifSettings.goal} onChange={(val) => updateNotifSetting('goal', val)} />
                    </div>
                  </div>
                </SpotlightCard>

                {/* Password Changer */}
                <SpotlightCard className="p-6 text-left">
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <Lock className="h-4 w-4 text-brand-violet" /> Change Password
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-555 font-bold uppercase tracking-wider block">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-white focus:outline-none focus:border-brand-violet"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-555 font-bold uppercase tracking-wider block">New Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-white focus:outline-none focus:border-brand-violet"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(!showPasswords)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-555 cursor-pointer"
                          >
                            {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {passwordError && <p className="text-[9px] text-red-400 font-bold">{passwordError}</p>}
                    {passwordSuccess && <p className="text-[9px] text-emerald-400 font-bold">✓ Password updated successfully!</p>}

                    <button
                      type="submit"
                      className="w-full py-2 bg-white/5 border border-white/5 hover:border-brand-violet rounded-xl text-[10px] font-black uppercase text-zinc-300 hover:text-white transition-all cursor-pointer"
                    >
                      Change Security Password
                    </button>
                  </form>
                </SpotlightCard>

                {/* Account Deletion & Exporter */}
                <SpotlightCard className="p-6 text-left space-y-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Trash2 className="h-4 w-4 text-red-400" /> Account Management
                  </h3>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleExportData}
                      className="w-full py-2.5 bg-brand-violet/10 border border-brand-violet/20 hover:border-brand-violet/40 text-brand-violet rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Export Fitness Data (.json)
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full py-2.5 bg-red-500/5 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Profile Account
                    </button>
                  </div>
                </SpotlightCard>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* Delete Confirmation Modal Overlay */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-dark-900 border border-red-500/20 rounded-2xl max-w-sm w-full text-center space-y-4"
          >
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Permanent Account Wiped</h4>
            <p className="text-xs text-zinc-555 leading-relaxed font-semibold">
              This action will completely delete all cached fitness progress, daily scans, and local workouts registry data. This is irreversible.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-[10px] font-black uppercase text-white shadow-lg shadow-red-500/10 cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </section>
  );
};
