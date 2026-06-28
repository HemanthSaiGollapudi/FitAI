import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, X, Check, Dumbbell, 
  Apple, Droplet, Target, Sparkles, Calendar, Scale 
} from 'lucide-react';

interface NotificationCenterProps {
  onChangeView: (view: 'home' | 'nutrition' | 'training' | 'coach' | 'body-fat' | 'health-connect' | 'profile' | 'settings') => void;
}

export interface NotificationItem {
  id: string;
  category: 'workout' | 'meals' | 'water' | 'body-fat' | 'coach' | 'goal' | 'weekly-report';
  title: string;
  text: string;
  type: 'warning' | 'alert' | 'success' | 'info';
  timestamp: number;
  actionView?: 'home' | 'nutrition' | 'training' | 'coach' | 'body-fat' | 'profile';
  reportData?: {
    totalWorkouts: number;
    trainingHours: number;
    totalVolume: number;
    avgCalories: number;
    avgProtein: number;
    weightChange: number;
    bfChange: number;
    aiAdvice: string;
  };
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onChangeView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fitai_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeReport, setActiveReport] = useState<any | null>(null);
  const [toast, setToast] = useState<NotificationItem | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate dynamic notifications
  const generateNotifications = () => {
    const list: NotificationItem[] = [];

    // 0. Load notification settings & user parameters
    let settings = {
      workout: true,
      meals: true,
      water: true,
      coach: true,
      weeklyReport: true,
      goal: true
    };
    try {
      const savedSettings = localStorage.getItem('fitai_notification_settings');
      if (savedSettings) settings = JSON.parse(savedSettings);
    } catch {}

    const currentUserStr = localStorage.getItem('fitai_current_user');
    let currentUser: any = null;
    if (currentUserStr) {
      try { currentUser = JSON.parse(currentUserStr); } catch {}
    }

    const weight = currentUser ? currentUser.weight : Number(localStorage.getItem('fitai_user_weight') || '74');
    const goalWeight = currentUser ? currentUser.targetWeight : Number(localStorage.getItem('fitai_user_goal_weight') || '68');

    const targetCals = Number(localStorage.getItem('fitai_diet_calories') || '2000');
    const targetProt = Number(localStorage.getItem('fitai_diet_protein') || '140');
    const targetWater = Number(localStorage.getItem('fitai_water_goal') || '3000');

    // Load logs
    let workoutHistory: any[] = [];
    try {
      const saved = localStorage.getItem('fitai_workout_history');
      if (saved) workoutHistory = JSON.parse(saved);
    } catch {}

    let loggedScannedFoods: any[] = [];
    try {
      const saved = localStorage.getItem('fitai_scanned_food_logs');
      if (saved) loggedScannedFoods = JSON.parse(saved);
    } catch {}

    let waterLogs: Record<string, number> = {};
    try {
      const saved = localStorage.getItem('fitai_water_logs');
      if (saved) waterLogs = JSON.parse(saved);
    } catch {}

    let bodyFatLogs: any[] = [];
    try {
      const saved = localStorage.getItem('fitai_body_fat_logs');
      if (saved) bodyFatLogs = JSON.parse(saved);
    } catch {}

    const latestScan = bodyFatLogs.length > 0 ? bodyFatLogs[0] : null;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayCalories = loggedScannedFoods.reduce((sum: number, item: any) => sum + (item.kcal || 0), 0);
    const todayProtein = loggedScannedFoods.reduce((sum: number, item: any) => sum + (item.protein || 0), 0);
    const todayWater = waterLogs[todayStr] || 0;

    const baseTime = new Date().setHours(9, 0, 0, 0); // Reference time for daily alerts

    // 1. WORKOUT REMINDERS
    if (settings.workout) {
      let remindersConfig = { workout: { enabled: true, time: '07:00', days: ['Mon', 'Wed', 'Fri'] } };
      try {
        const savedRem = localStorage.getItem('fitai_reminders');
        if (savedRem) remindersConfig = JSON.parse(savedRem);
      } catch {}

      const daysMap: Record<number, string> = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };
      const currentDayName = daysMap[new Date().getDay()];

      const isWorkoutDay = remindersConfig.workout?.enabled && remindersConfig.workout.days.includes(currentDayName);

      const hasWorkoutToday = workoutHistory.some(w => {
        const d = new Date(w.timestamp).toISOString().split('T')[0];
        return d === todayStr;
      });

      if (isWorkoutDay && !hasWorkoutToday) {
        list.push({
          id: 'workout_today_incomplete',
          category: 'workout',
          title: '🏋️ Workout Reminder',
          text: 'You haven\'t completed today\'s training. Time to hit your workout splits!',
          type: 'alert',
          timestamp: baseTime,
          actionView: 'training'
        });
      }
    }

    // 2. NUTRITION REMINDERS
    if (settings.meals) {
      // Protein goals check
      if (todayProtein > 0 && todayProtein < targetProt) {
        const deficit = targetProt - todayProtein;
        if (deficit <= 30) {
          list.push({
            id: 'nutrition_protein_short',
            category: 'meals',
            title: '🥩 Protein Target Near',
            text: `You are only ${deficit}g short of today's protein goal. Grab a shake or high protein snack to reach your hypertrophy threshold.`,
            type: 'warning',
            timestamp: baseTime + 1000,
            actionView: 'nutrition'
          });
        }
      }

      // Remaining calories
      if (todayCalories < targetCals) {
        list.push({
          id: 'nutrition_cals_remaining',
          category: 'meals',
          title: '🍽️ Daily Caloric Balance',
          text: `Calories remaining today: ${targetCals - todayCalories} kcal. Eat high volume clean meals to maintain steady levels.`,
          type: 'info',
          timestamp: baseTime + 2000,
          actionView: 'nutrition'
        });
      }

      // Lunch alert dynamic check
      const currentHour = new Date().getHours();
      if (currentHour >= 12 && currentHour <= 14) {
        list.push({
          id: 'nutrition_lunch_time',
          category: 'meals',
          title: '🍽️ Meal Schedule Alarms',
          text: 'Time for your balanced lunch. Check your macro target goals.',
          type: 'info',
          timestamp: Date.now(),
          actionView: 'nutrition'
        });
      }
    }

    // 3. HYDRATION REMINDERS
    if (settings.water) {
      if (todayWater < targetWater) {
        list.push({
          id: 'hydration_below_target',
          category: 'water',
          title: '💧 Hydration Watch',
          text: `Drink a glass of water. Today's water intake (${todayWater} ml) is below target (${targetWater} ml).`,
          type: 'warning',
          timestamp: baseTime + 3000,
          actionView: 'home'
        });
      }
    }

    // 4. BODY FAT REMINDERS
    if (settings.goal) {
      const lastScanDate = latestScan ? latestScan.date : null;
      let isDue = false;
      if (!lastScanDate) {
        isDue = true;
      } else {
        const lastScanTime = new Date(lastScanDate).getTime();
        const diffDays = (Date.now() - lastScanTime) / (1000 * 60 * 60 * 24);
        if (diffDays >= 7) isDue = true;
      }

      if (isDue) {
        list.push({
          id: 'bodyfat_weekly_scan_due',
          category: 'body-fat',
          title: '📸 Weekly Body Composition Scan',
          text: 'Weekly Body Fat Scan is due. Track your progress and update metrics with a new camera estimate.',
          type: 'alert',
          timestamp: baseTime - 3600000,
          actionView: 'body-fat'
        });
      }
    }

    // 5. AI COACH REMINDERS
    if (settings.coach) {
      // Rest recommendations based on history
      let consecutiveWorkouts = 0;
      const sortedHistory = [...workoutHistory].sort((a, b) => b.timestamp - a.timestamp);
      
      const checkDay = new Date();
      for (let i = 0; i < 7; i++) {
        const checkStr = checkDay.toISOString().split('T')[0];
        const hadWorkout = sortedHistory.some(w => new Date(w.timestamp).toISOString().split('T')[0] === checkStr);
        if (hadWorkout) {
          consecutiveWorkouts++;
        } else {
          break;
        }
        checkDay.setDate(checkDay.getDate() - 1);
      }

      if (consecutiveWorkouts >= 3) {
        list.push({
          id: 'coach_recovery_day',
          category: 'coach',
          title: '🤖 AI Coach Recommendation',
          text: 'Recovery day recommended. You have trained consecutively. Let muscle fibers repair.',
          type: 'info',
          timestamp: baseTime + 4000,
          actionView: 'coach'
        });
      }

      list.push({
        id: 'coach_sleep_reminder',
        category: 'coach',
        title: '🤖 AI Coach Sleep Check',
        text: 'Sleep at least 8 hours tonight to optimize muscle growth and support neural recharge.',
        type: 'info',
        timestamp: baseTime + 5000,
        actionView: 'coach'
      });
    }

    // 6. GOAL REMINDERS
    if (settings.goal) {
      const deltaWeight = weight - goalWeight;
      if (Math.abs(deltaWeight) <= 5 && deltaWeight !== 0) {
        list.push({
          id: 'goal_weight_distance',
          category: 'goal',
          title: '🎯 Target Weight Progress',
          text: `Only ${Math.abs(deltaWeight).toFixed(1)} kg left to reach your target weight! Keep pushing!`,
          type: 'success',
          timestamp: baseTime + 6000,
          actionView: 'profile'
        });
      }

      // Monthly workout target %
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const monthlyWorkoutsCount = workoutHistory.filter(w => w.timestamp >= startOfMonth.getTime()).length;
      const monthlyTarget = 16; // target 4 workouts per week
      const progressPct = Math.round((monthlyWorkoutsCount / monthlyTarget) * 100);
      if (progressPct > 0) {
        list.push({
          id: 'goal_monthly_workouts',
          category: 'goal',
          title: '🎯 Monthly Workout Milestones',
          text: `You've completed ${progressPct}% of your monthly target of ${monthlyTarget} sessions.`,
          type: 'success',
          timestamp: baseTime + 7000,
          actionView: 'home'
        });
      }
    }

    // 7. WEEKLY REPORTS
    if (settings.weeklyReport) {
      // Calculate report data
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const weekWorkouts = workoutHistory.filter(w => w.timestamp >= oneWeekAgo);
      const totalVolume = weekWorkouts.reduce((sum, w) => {
        let vol = 0;
        if (w.exercises) {
          w.exercises.forEach((ex: any) => {
            if (ex.sets) {
              ex.sets.forEach((s: any) => { vol += (s.weight || 0) * (s.reps || 0); });
            }
          });
        }
        return sum + vol;
      }, 0);
      
      const totalHours = parseFloat(((weekWorkouts.length * 45) / 60).toFixed(1));

      // Calculate averages
      let totalCalsWeek = 0;
      let totalProtWeek = 0;
      const weekFoods = loggedScannedFoods.filter(f => f.timestamp >= oneWeekAgo);
      if (weekFoods.length > 0) {
        totalCalsWeek = weekFoods.reduce((sum, f) => sum + (f.kcal || 0), 0);
        totalProtWeek = weekFoods.reduce((sum, f) => sum + (f.protein || 0), 0);
      }
      // Fill in mock calorie defaults if user logs are partial
      const avgCalsWeek = weekFoods.length > 0 ? Math.round(totalCalsWeek / 7) : targetCals - 100;
      const avgProtWeek = weekFoods.length > 0 ? Math.round(totalProtWeek / 7) : targetProt - 10;

      // Deltas
      let weightDiff = -0.5;
      let bfDiff = -0.3;
      if (bodyFatLogs.length >= 2) {
        const current = bodyFatLogs[0];
        const past = bodyFatLogs.find(l => new Date(l.date).getTime() < oneWeekAgo) || bodyFatLogs[bodyFatLogs.length - 1];
        weightDiff = parseFloat((current.weight - past.weight).toFixed(1));
        bfDiff = parseFloat((current.bodyFat - past.bodyFat).toFixed(1));
      }

      const reportDataObj = {
        totalWorkouts: weekWorkouts.length,
        trainingHours: totalHours,
        totalVolume: totalVolume,
        avgCalories: avgCalsWeek,
        avgProtein: avgProtWeek,
        weightChange: weightDiff,
        bfChange: bfDiff,
        aiAdvice: `Excellent training consistency. You logged ${weekWorkouts.length} sessions, lifted a total volume of ${totalVolume.toLocaleString()} kg, and maintained a healthy daily intake average. Let's focus on progressive weight overload this upcoming cycle!`
      };

      list.push({
        id: 'weekly_report_generated',
        category: 'weekly-report',
        title: '📊 Weekly Performance Report is Ready',
        text: 'Your fitness and nutrition metrics summary for the past 7 days has been calculated. Click to view.',
        type: 'success',
        timestamp: baseTime - 12 * 3600000,
        reportData: reportDataObj
      });
    }

    // Sort by timestamp descending
    list.sort((a, b) => b.timestamp - a.timestamp);
    setNotifications(list);

    // Dynamic toast triggers for unread alert notifications
    const unread = list.filter(n => !readIds.includes(n.id));
    if (unread.length > 0) {
      // Find the most urgent alert or warning to show as a toast on mount
      const toastTarget = unread.find(n => n.type === 'alert' || n.type === 'warning');
      if (toastTarget) {
        setToast(toastTarget);
        const timer = setTimeout(() => setToast(null), 5000);
        return () => clearTimeout(timer);
      }
    }
  };

  useEffect(() => {
    generateNotifications();

    const handleSettingsChange = () => {
      generateNotifications();
    };

    window.addEventListener('fitai_notification_settings_changed', handleSettingsChange);
    // Listen to log changes so notifications refresh reactively
    window.addEventListener('fitai_logs_updated', handleSettingsChange);

    return () => {
      window.removeEventListener('fitai_notification_settings_changed', handleSettingsChange);
      window.removeEventListener('fitai_logs_updated', handleSettingsChange);
    };
  }, [readIds]);

  // Handle outside dropdown click to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const unreadNotifications = notifications.filter(n => !readIds.includes(n.id));
  const unreadCount = unreadNotifications.length;

  const markAsRead = (id: string) => {
    const next = [...readIds, id];
    setReadIds(next);
    localStorage.setItem('fitai_read_notifications', JSON.stringify(next));
  };

  const markAllAsRead = () => {
    const next = notifications.map(n => n.id);
    setReadIds(next);
    localStorage.setItem('fitai_read_notifications', JSON.stringify(next));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id);
    setIsOpen(false);

    if (item.category === 'weekly-report' && item.reportData) {
      setActiveReport(item.reportData);
    } else if (item.actionView) {
      onChangeView(item.actionView);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workout': return <Dumbbell className="w-4 h-4 text-brand-pink" />;
      case 'meals': return <Apple className="w-4 h-4 text-brand-lime" />;
      case 'water': return <Droplet className="w-4 h-4 text-brand-cyan" />;
      case 'body-fat': return <Scale className="w-4 h-4 text-brand-violet" />;
      case 'coach': return <Sparkles className="w-4 h-4 text-brand-violet" />;
      case 'goal': return <Target className="w-4 h-4 text-brand-cyan" />;
      case 'weekly-report': return <Calendar className="w-4 h-4 text-brand-lime" />;
      default: return <Bell className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-white/5 border border-white/5 hover:border-brand-violet/40 rounded-full text-zinc-400 hover:text-white transition-all cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-pink text-[9px] font-black rounded-full flex items-center justify-center text-white border-2 border-[#03000a] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel (Desktop and Mobile layout responsive) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-dark-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden text-left"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#07040e]">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Smart Notifications</h4>
                <p className="text-[9.5px] text-zinc-555">Personalized compliance and telemetry advisory</p>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="px-2 py-1 rounded bg-brand-violet/10 border border-brand-violet/20 hover:bg-brand-violet text-brand-violet hover:text-white text-[8px] font-black uppercase transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-white/5">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-650 text-xs">
                  <Bell className="w-8 h-8 text-zinc-655 mx-auto mb-2 opacity-30" />
                  No alerts currently registered. Keep building consistency!
                </div>
              ) : (
                notifications.map((item) => {
                  const isRead = readIds.includes(item.id);
                  let styleClass = isRead ? 'bg-dark-950/20 opacity-60' : 'bg-brand-violet/5 opacity-100';
                  
                  return (
                    <div 
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-3.5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 items-start ${styleClass}`}
                    >
                      <div className="p-2 bg-dark-950 border border-white/5 rounded-xl mt-0.5">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <h5 className="text-[10px] font-black text-white truncate">{item.title}</h5>
                          {!isRead && <span className="w-1.5 h-1.5 bg-brand-pink rounded-full shrink-0" />}
                        </div>
                        <p className="text-[9.5px] text-zinc-400 leading-normal font-semibold">
                          {item.text}
                        </p>
                        <span className="text-[8px] text-zinc-550 block mt-1.5 font-bold uppercase tracking-wider">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Reminder Popup */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 50, y: 50 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed bottom-6 right-6 z-50 p-4 max-w-sm bg-dark-900 border border-brand-violet/20 rounded-2xl shadow-glow-purple flex items-start gap-3 text-left"
          >
            <div className="p-2 bg-brand-violet/10 border border-brand-violet/20 rounded-xl mt-0.5">
              {getCategoryIcon(toast.category)}
            </div>
            <div className="flex-1 pr-6">
              <h5 className="text-xs font-black text-white uppercase tracking-wider mb-0.5">{toast.title}</h5>
              <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">{toast.text}</p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="absolute top-2.5 right-2.5 text-zinc-550 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Performance Report Modal */}
      <AnimatePresence>
        {activeReport && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 bg-dark-900 border border-white/10 rounded-2xl max-w-lg w-full space-y-6 text-left"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="h-4.5 w-4.5 text-brand-lime animate-pulse" /> Weekly Performance Report
                  </h3>
                  <p className="text-[9px] text-zinc-550">Telemetry analysis for the past 7 days</p>
                </div>
                <button 
                  onClick={() => setActiveReport(null)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Data Deck */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-dark-950/60 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[8px] text-zinc-555 font-bold uppercase block">Workouts Logged</span>
                  <span className="text-xs font-black text-white">{activeReport.totalWorkouts} sessions</span>
                </div>
                <div className="p-3.5 bg-dark-950/60 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[8px] text-zinc-555 font-bold uppercase block">Training Duration</span>
                  <span className="text-xs font-black text-white">{activeReport.trainingHours} hours</span>
                </div>
                <div className="p-3.5 bg-dark-950/60 border border-white/5 rounded-xl space-y-1 col-span-2">
                  <span className="text-[8px] text-zinc-555 font-bold uppercase block">Total Weight Lifted</span>
                  <span className="text-xs font-black text-brand-violet">{activeReport.totalVolume.toLocaleString()} kg</span>
                </div>
                <div className="p-3.5 bg-dark-950/60 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[8px] text-zinc-555 font-bold uppercase block">Avg Daily Intake</span>
                  <span className="text-xs font-black text-white">{activeReport.avgCalories} kcal</span>
                </div>
                <div className="p-3.5 bg-dark-950/60 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[8px] text-zinc-555 font-bold uppercase block">Avg Daily Protein</span>
                  <span className="text-xs font-black text-brand-lime">{activeReport.avgProtein}g</span>
                </div>
                <div className="p-3.5 bg-dark-950/60 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[8px] text-zinc-555 font-bold uppercase block">Weight Change</span>
                  <span className={`text-xs font-black ${activeReport.weightChange <= 0 ? 'text-brand-lime' : 'text-brand-pink'}`}>
                    {activeReport.weightChange <= 0 ? '' : '+'}{activeReport.weightChange} kg
                  </span>
                </div>
                <div className="p-3.5 bg-dark-950/60 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[8px] text-zinc-555 font-bold uppercase block">Body Fat Change</span>
                  <span className={`text-xs font-black ${activeReport.bfChange <= 0 ? 'text-brand-lime' : 'text-brand-pink'}`}>
                    {activeReport.bfChange <= 0 ? '' : '+'}{activeReport.bfChange}%
                  </span>
                </div>
              </div>

              {/* AI Advice */}
              <div className="p-4 bg-brand-violet/5 border border-brand-violet/10 rounded-xl space-y-1">
                <span className="text-[8px] text-brand-violet font-black uppercase tracking-wider block flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Coach Strategy Review
                </span>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
                  {activeReport.aiAdvice}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setActiveReport(null);
                  onChangeView('home');
                }}
                className="w-full py-2.5 bg-brand-violet hover:bg-brand-violet-hover text-white text-xs font-black rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Sync Dashboard Trends
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
