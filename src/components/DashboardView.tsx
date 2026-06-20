import React from 'react';
import { 
  Heart, Flame, Dumbbell, 
  Apple, CheckSquare, AlertCircle, RefreshCw, Check,
  Plus, Trash2, Clock, Award, Award as Trophy, Scale,
  BookOpen, TrendingUp
} from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';
import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import type { WorkoutRoutine } from './WorkoutBuilder';
import type { LoggedScannedFood } from './FoodScanner';
import type { LoggedWorkout } from './ProgressTracker';
import type { ActiveWorkout } from './ActiveWorkoutSession';

export type { ActiveWorkout, ActiveWorkoutExercise, ActiveWorkoutSet } from './ActiveWorkoutSession';

// Full meal dataset with calories and protein for checklist lookup
const DIET_LOOKUP: Record<string, Record<string, { title: string; name: string; kcal: number; protein: number }[]>> = {
  'Weight Loss': {
    'Veg': [
      { title: 'Breakfast', name: 'Ragi Upma with Mixed Vegetables', kcal: 280, protein: 8 },
      { title: 'Mid-Morning', name: 'Sprouts & Pomegranate Salad', kcal: 120, protein: 6 },
      { title: 'Lunch', name: 'Paneer Bhurji & 1 Missi Roti', kcal: 410, protein: 22 },
      { title: 'Evening', name: 'Roasted Spicy Chickpeas (Chana)', kcal: 140, protein: 7 },
      { title: 'Dinner', name: 'Moong Dal Soup & Sautéed Greens', kcal: 220, protein: 12 }
    ],
    'Non-Veg': [
      { title: 'Breakfast', name: 'Spinach & Egg White Scramble', kcal: 250, protein: 20 },
      { title: 'Mid-Morning', name: 'Boiled Egg Whites & Sprouts', kcal: 130, protein: 10 },
      { title: 'Lunch', name: 'Grilled Chicken & Brown Rice', kcal: 450, protein: 38 },
      { title: 'Evening', name: 'Boiled Black Chana Salad', kcal: 120, protein: 5 },
      { title: 'Dinner', name: 'Baked Fish Fillet & Lentil Broth', kcal: 280, protein: 30 }
    ],
    'Eggetarian': [
      { title: 'Breakfast', name: 'Egg White Omelette & 1 Toast', kcal: 240, protein: 19 },
      { title: 'Mid-Morning', name: 'Sprouts & Pomegranate Salad', kcal: 120, protein: 6 },
      { title: 'Lunch', name: 'Paneer Bhurji & 1 Missi Roti', kcal: 410, protein: 22 },
      { title: 'Evening', name: '2 Hard Boiled Eggs & Green Tea', kcal: 155, protein: 13 },
      { title: 'Dinner', name: 'Moong Dal Soup & Stir-fried Tofu', kcal: 250, protein: 18 }
    ]
  },
  'Fat Loss': {
    'Veg': [
      { title: 'Breakfast', name: 'Savoury Besan Cheela & Chutney', kcal: 260, protein: 10 },
      { title: 'Mid-Morning', name: 'Masala Buttermilk & Flax Seeds', kcal: 110, protein: 4 },
      { title: 'Lunch', name: 'Sautéed Tofu & Quinoa Bowl', kcal: 380, protein: 24 },
      { title: 'Evening', name: 'Roasted Foxnuts (Makhana)', kcal: 120, protein: 2 },
      { title: 'Dinner', name: 'High-Protein Soya Chunk Salad', kcal: 240, protein: 18 }
    ],
    'Non-Veg': [
      { title: 'Breakfast', name: 'Egg White Omelette with Mushrooms', kcal: 180, protein: 18 },
      { title: 'Mid-Morning', name: 'Clear Chicken & Veg Broth', kcal: 130, protein: 12 },
      { title: 'Lunch', name: 'Big Grilled Chicken Salad (180g)', kcal: 360, protein: 36 },
      { title: 'Evening', name: 'Boiled Egg Whites (3 pcs)', kcal: 75, protein: 12 },
      { title: 'Dinner', name: 'Lemon-Herb Steamed Fish & Asparagus', kcal: 250, protein: 28 }
    ],
    'Eggetarian': [
      { title: 'Breakfast', name: '3 Egg White Omelette with Spinach', kcal: 160, protein: 17 },
      { title: 'Mid-Morning', name: 'Masala Buttermilk & Chia Seeds', kcal: 115, protein: 4 },
      { title: 'Lunch', name: 'Sautéed Paneer & Broccoli Bowl', kcal: 310, protein: 20 },
      { title: 'Evening', name: 'Boiled Egg Whites (3 pcs) with Pepper', kcal: 75, protein: 12 },
      { title: 'Dinner', name: 'High-Protein Soya & Egg Salad', kcal: 260, protein: 23 }
    ]
  },
  'Muscle Gain': {
    'Veg': [
      { title: 'Breakfast', name: 'Paneer Parathas & Greek Yogurt', kcal: 550, protein: 24 },
      { title: 'Mid-Morning', name: 'Peanut Butter Oatmeal Shake', kcal: 420, protein: 15 },
      { title: 'Lunch', name: 'Soya Chunks Curry & Quinoa', kcal: 610, protein: 38 },
      { title: 'Evening', name: 'Roasted Paneer Cubes & Almonds', kcal: 320, protein: 18 },
      { title: 'Dinner', name: 'Kabuli Chana (Chole) & 2 Rotis', kcal: 480, protein: 22 }
    ],
    'Non-Veg': [
      { title: 'Breakfast', name: 'Egg Omelette & Banana Oatmeal', kcal: 520, protein: 32 },
      { title: 'Mid-Morning', name: 'Chicken Breast Sandwich', kcal: 380, protein: 30 },
      { title: 'Lunch', name: 'Chicken Breast Curry & Basmati Rice', kcal: 680, protein: 52 },
      { title: 'Evening', name: 'Whey Protein Shake & Almonds', kcal: 350, protein: 30 },
      { title: 'Dinner', name: 'Grilled Fish & Steamed Sweet Potato', kcal: 510, protein: 42 }
    ],
    'Eggetarian': [
      { title: 'Breakfast', name: 'Egg Omelette (3 Eggs) & Oats Bowl', kcal: 525, protein: 30 },
      { title: 'Mid-Morning', name: 'Egg Salad Sandwich', kcal: 360, protein: 18 },
      { title: 'Lunch', name: 'Soya Chunks Curry & Quinoa', kcal: 610, protein: 38 },
      { title: 'Evening', name: 'Whey Protein Shake & Almonds', kcal: 350, protein: 30 },
      { title: 'Dinner', name: 'Paneer Bhurji & 2 Multigrain Rotis', kcal: 540, protein: 26 }
    ]
  },
  'Body Recomposition': {
    'Veg': [
      { title: 'Breakfast', name: 'Soya Flour Cheela & Low-fat Paneer', kcal: 380, protein: 25 },
      { title: 'Mid-Morning', name: 'Sprouts & Roasted Peanut Salad', kcal: 200, protein: 10 },
      { title: 'Lunch', name: 'Paneer Bhurji, Soya Chunks & 1 Roti', kcal: 480, protein: 35 },
      { title: 'Evening', name: 'Roasted Paneer Cubes & Almonds', kcal: 320, protein: 18 },
      { title: 'Dinner', name: 'Dal Soup, Tofu Stir-fry & Quinoa', kcal: 350, protein: 24 }
    ],
    'Non-Veg': [
      { title: 'Breakfast', name: 'Egg White (3) + 1 Whole Egg Omelette', kcal: 320, protein: 24 },
      { title: 'Mid-Morning', name: 'Shredded Chicken Breast Salad', kcal: 220, protein: 25 },
      { title: 'Lunch', name: 'Grilled Chicken & Brown Rice', kcal: 450, protein: 38 },
      { title: 'Evening', name: 'Whey Protein Shake & Almonds', kcal: 350, protein: 30 },
      { title: 'Dinner', name: 'Baked Fish Fillet & Lentil Broth', kcal: 360, protein: 36 }
    ],
    'Eggetarian': [
      { title: 'Breakfast', name: '4 Egg Whites Scramble & 1 Toast', kcal: 280, protein: 22 },
      { title: 'Mid-Morning', name: 'Sprouts & Pomegranate Salad', kcal: 120, protein: 6 },
      { title: 'Lunch', name: 'Egg Bhurji (3 eggs) & 1 Roti', kcal: 410, protein: 24 },
      { title: 'Evening', name: 'Whey Protein Shake & Roasted Paneer', kcal: 320, protein: 34 },
      { title: 'Dinner', name: 'Soya Chunks Salad & Lentil Soup', kcal: 300, protein: 22 }
    ]
  },
  'Maintenance': {
    'Veg': [
      { title: 'Breakfast', name: 'Vegetable Oats Idli & Chutney', kcal: 350, protein: 12 },
      { title: 'Mid-Morning', name: 'Mixed Nuts & Fresh Apple', kcal: 210, protein: 5 },
      { title: 'Lunch', name: 'Dal Tadka, Paneer Bhurji & 2 Rotis', kcal: 520, protein: 20 },
      { title: 'Evening', name: 'Hummus with Carrot & Cucumber Sticks', kcal: 180, protein: 6 },
      { title: 'Dinner', name: 'Moong Dal Khichdi & Curd', kcal: 380, protein: 14 }
    ],
    'Non-Veg': [
      { title: 'Breakfast', name: 'Boiled Eggs & Avocado Wheat Toast', kcal: 380, protein: 16 },
      { title: 'Mid-Morning', name: 'Greek Yogurt with Berries & Honey', kcal: 190, protein: 12 },
      { title: 'Lunch', name: 'Fish Curry, Rice & Salad', kcal: 540, protein: 34 },
      { title: 'Evening', name: 'Grilled Chicken Skewers', kcal: 180, protein: 22 },
      { title: 'Dinner', name: 'Egg Bhurji (3 Eggs) & 1 Roti', kcal: 410, protein: 24 }
    ],
    'Eggetarian': [
      { title: 'Breakfast', name: '2 Boiled Eggs & Whole Wheat Toast', kcal: 280, protein: 14 },
      { title: 'Mid-Morning', name: 'Greek Yogurt with Banana & Honey', kcal: 210, protein: 11 },
      { title: 'Lunch', name: 'Paneer Bhurji, Dal & 2 Rotis', kcal: 520, protein: 20 },
      { title: 'Evening', name: 'Roasted Foxnuts (Makhana) & 1 Egg', kcal: 180, protein: 8 },
      { title: 'Dinner', name: 'Moong Dal Khichdi & Curd', kcal: 380, protein: 14 }
    ]
  }
};

interface DashboardViewProps {
  savedExercises: string[];
  savedDietGoal: string;
  savedDietType: string;
  savedCalories: number;
  savedProtein: number;
  savedCarbs: number;
  savedFats: number;
  onOpenOnboarding: () => void;
  
  // Active Workout Logger Props
  activeWorkout: ActiveWorkout | null;
  onStartEmptyWorkout: () => void;
  
  // Diet checklist state
  completedMeals: string[];
  onToggleMeal: (mealTitle: string) => void;

  // Additional props
  workoutHistory: LoggedWorkout[];
  customRoutines: WorkoutRoutine[];
  onStartWorkout: (routine: WorkoutRoutine) => void;
  goalWeight: number;
  userWeight: number;
  expectedWeightChange: string;
  loggedScannedFoods: LoggedScannedFood[];
  onDeleteScannedFood: (id: string) => void;
  userName: string;
  waterLogs: Record<string, number>;
  onAddWater: (ml: number) => void;
  onNavigate: (view: 'home' | 'nutrition' | 'training' | 'coach' | 'body-fat' | 'store' | 'profile', subTab?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  savedExercises,
  savedDietGoal,
  savedDietType,
  savedCalories,
  savedProtein,
  savedCarbs,
  savedFats,
  onOpenOnboarding,
  activeWorkout,
  onStartEmptyWorkout,
  completedMeals,
  onToggleMeal,
  workoutHistory,
  customRoutines,
  onStartWorkout,
  goalWeight,
  userWeight,
  expectedWeightChange,
  loggedScannedFoods,
  onDeleteScannedFood,
  userName,
  waterLogs,
  onAddWater,
  onNavigate
}) => {



  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return `Good Morning, ${userName}! 🌅`;
    if (hrs < 18) return `Good Afternoon, ${userName}! ☀️`;
    return `Good Evening, ${userName}! 🌌`;
  };

  const getWorkoutStreak = () => {
    if (workoutHistory.length === 0) return 0;
    const dates = workoutHistory.map(w => new Date(w.timestamp).toDateString());
    const uniqueDates = Array.from(new Set(dates));
    return Math.min(uniqueDates.length, 7);
  };

  const getDashboardWeightChange = () => {
    const initialW = Number(localStorage.getItem('fitai_user_initial_weight') || String(userWeight));
    const diff = Math.round((userWeight - initialW) * 10) / 10;
    return diff > 0 ? `+${diff} kg` : `${diff} kg`;
  };

  const getNextAchievementProgress = () => {
    const workoutCount = workoutHistory.length;
    if (workoutCount < 1) return { name: "First Workout", desc: "Log your first workout session", pct: 0 };
    if (workoutCount < 5) return { name: "Iron Devotee", desc: "Complete 5 logged sessions", pct: Math.round((workoutCount / 5) * 100) };
    return { name: "Logged 100 Exercises", desc: "Log 100 exercises total", pct: Math.min(100, Math.round((workoutCount * 3 / 100) * 100)) };
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayWater = waterLogs[todayStr] || 0;
  const targetWater = Number(localStorage.getItem('fitai_water_goal') || '3000');
  const remainingWater = Math.max(0, targetWater - todayWater);



  // Get total completed Personal Records (unique exercises where a heavy set is logged)
  const getPersonalRecordsCount = () => {
    const prSet = new Set<string>();
    workoutHistory.forEach(log => {
      log.exercises.forEach(ex => {
        ex.sets.forEach(s => {
          if (s.weight > 0) prSet.add(ex.name);
        });
      });
    });
    return prSet.size;
  };

  // Get list of top heavy lifts
  const getTopLifts = () => {
    const lifts: Record<string, number> = {};
    workoutHistory.forEach(log => {
      log.exercises.forEach(ex => {
        ex.sets.forEach(s => {
          if (!lifts[ex.name] || s.weight > lifts[ex.name]) {
            lifts[ex.name] = s.weight;
          }
        });
      });
    });
    return Object.entries(lifts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  };

  // ----------------------------------------------------
  // DIET CALORIE AND MACROS SUMMING
  // ----------------------------------------------------
  const mealPlanList = DIET_LOOKUP[savedDietGoal]?.[savedDietType] || [];
  const totalMealCals = mealPlanList.reduce((sum, m) => sum + m.kcal, 0);
  const totalMealProt = mealPlanList.reduce((sum, m) => sum + m.protein, 0);

  const baseConsumedCals = mealPlanList
    .filter(m => completedMeals.includes(m.title))
    .reduce((sum, m) => sum + m.kcal, 0);

  const scannedCals = loggedScannedFoods.reduce((sum, item) => sum + item.kcal, 0);
  const consumedCalories = baseConsumedCals + scannedCals;

  const baseConsumedProt = mealPlanList
    .filter(m => completedMeals.includes(m.title))
    .reduce((sum, m) => sum + m.protein, 0);
  const consumedProtein = baseConsumedProt + loggedScannedFoods.reduce((sum, item) => sum + item.protein, 0);

  const carbRatio = savedCalories > 0 ? savedCarbs / savedCalories : 0.45;
  const fatRatio = savedCalories > 0 ? savedFats / savedCalories : 0.25;

  const baseCarbs = Math.round((baseConsumedCals * carbRatio) / 4);
  const consumedCarbs = baseCarbs + loggedScannedFoods.reduce((sum, item) => sum + item.carbs, 0);

  const baseFats = Math.round((baseConsumedCals * fatRatio) / 9);
  const consumedFats = baseFats + loggedScannedFoods.reduce((sum, item) => sum + item.fats, 0);

  // Targets
  const targetCals = savedCalories || totalMealCals || 2000;
  const targetProt = savedProtein || totalMealProt || 120;
  const targetCarbSplit = savedCarbs || Math.round((targetCals * carbRatio) / 4);
  const targetFatSplit = savedFats || Math.round((targetCals * fatRatio) / 9);

  const remainingCals = Math.max(0, targetCals - consumedCalories);

  const calPercentage = Math.min(100, Math.round((consumedCalories / targetCals) * 100));
  const protPercentage = Math.min(100, Math.round((consumedProtein / targetProt) * 100));
  const carbPercentage = Math.min(100, Math.round((consumedCarbs / targetCarbSplit) * 100));
  const fatPercentage = Math.min(100, Math.round((consumedFats / targetFatSplit) * 100));



  return (
    <section id="dashboard" className="relative py-24 overflow-hidden border-t border-white/5 bg-[#03000a]">
      {/* Background Lighting */}
      <div className="absolute top-[10%] left-[20%] w-[350px] h-[350px] bg-brand-violet/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[350px] h-[350px] bg-brand-cyan/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header with Welcome Greeting */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-brand-violet/10 border border-brand-violet/20 px-3.5 py-1 rounded-full text-brand-violet font-semibold text-xs tracking-wider uppercase">
              Control Centre
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-white">
              {getGreeting()}
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl font-normal leading-relaxed">
              Your AI Fitness Coach reports: Your body weight is down {getDashboardWeightChange()} overall. Ready to conquer your daily goals?
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onStartEmptyWorkout}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-black hover:scale-105 transition-transform flex items-center gap-1.5 shadow-glow-purple animate-pulse"
            >
              <Plus className="h-4 w-4" /> Log Empty Workout
            </button>
            <button
              onClick={onOpenOnboarding}
              className="px-5 py-3 rounded-xl border border-white/10 text-xs font-bold hover:bg-white/5 hover:border-brand-violet/40 transition-all text-zinc-300 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Synthesize Profile
            </button>
          </div>
        </div>

        {/* Dynamic Today's Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-left">
          {/* Today's Workout */}
          <div className="p-4 bg-dark-900/30 border border-white/5 rounded-2xl backdrop-blur-md space-y-1">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Today's Workout</span>
            <span className="text-xs font-black text-white truncate block">
              {activeWorkout ? activeWorkout.name : (workoutHistory[0] ? `Completed: ${workoutHistory[0].name}` : 'No active session')}
            </span>
          </div>

          {/* Today's Diet */}
          <div className="p-4 bg-dark-900/30 border border-white/5 rounded-2xl backdrop-blur-md space-y-1">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Today's Diet</span>
            <span className="text-xs font-black text-white block">
              {consumedCalories} / {targetCals} <span className="text-[10px] text-zinc-500 font-normal">kcal</span>
            </span>
          </div>

          {/* Calories Remaining */}
          <div className="p-4 bg-dark-900/30 border border-white/5 rounded-2xl backdrop-blur-md space-y-1">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Cal Remaining</span>
            <span className="text-xs font-black text-brand-lime block">
              {remainingCals} <span className="text-[10px] text-zinc-500 font-normal">kcal left</span>
            </span>
          </div>

          {/* Protein Goal */}
          <div className="p-4 bg-dark-900/30 border border-white/5 rounded-2xl backdrop-blur-md space-y-1">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Protein Goal</span>
            <span className="text-xs font-black text-brand-cyan block">
              {consumedProtein}g / {targetProt}g
            </span>
          </div>

          {/* Water Intake */}
          <div className="p-4 bg-dark-900/30 border border-white/5 rounded-2xl backdrop-blur-md space-y-1">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Water Intake</span>
            <span className="text-xs font-black text-brand-cyan block">
              {todayWater} / {targetWater} <span className="text-[10px] text-zinc-500 font-normal">ml</span>
            </span>
          </div>

          {/* Workout Streak */}
          <div className="p-4 bg-dark-900/30 border border-white/5 rounded-2xl backdrop-blur-md space-y-1">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Active Streak</span>
            <span className="text-xs font-black text-brand-pink block">
              {getWorkoutStreak()} Days 🔥
            </span>
          </div>

          {/* Weight Change */}
          <div className="p-4 bg-dark-900/30 border border-white/5 rounded-2xl backdrop-blur-md space-y-1">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Weight Change</span>
            <span className="text-xs font-black text-white block">
              {getDashboardWeightChange()}
            </span>
          </div>

          {/* Next Achievement */}
          <div className="p-4 bg-dark-900/30 border border-white/5 rounded-2xl backdrop-blur-md space-y-1">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Next Medal</span>
            <span className="text-xs font-black text-amber-400 block truncate">
              {getNextAchievementProgress().name}
            </span>
          </div>
        </div>

        {/* Quick Operations & Actions Panel */}
        <div className="mb-10 text-left space-y-4">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Quick Operations & Actions</span>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Nutrition shortcuts */}
            <div className="p-5 bg-dark-900/40 border border-white/5 rounded-2xl backdrop-blur-md flex flex-col justify-between space-y-4 shadow-glass">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Apple className="h-4 w-4 text-brand-lime" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-300">Nutrition Hub</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onNavigate('nutrition', 'diet')}
                  className="px-3 py-3 bg-white/5 border border-white/5 hover:border-brand-lime hover:bg-brand-lime/10 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  🥗 Diet Planner
                </button>
                <button
                  onClick={() => onNavigate('nutrition', 'scanner')}
                  className="px-3 py-3 bg-white/5 border border-white/5 hover:border-brand-lime hover:bg-brand-lime/10 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  📷 Scan Food
                </button>
              </div>
            </div>

            {/* Training shortcuts */}
            <div className="p-5 bg-dark-900/40 border border-white/5 rounded-2xl backdrop-blur-md flex flex-col justify-between space-y-4 shadow-glass">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Dumbbell className="h-4 w-4 text-brand-violet" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-300">Training Hub</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onNavigate('training', 'library')}
                  className="px-2 py-3 bg-white/5 border border-white/5 hover:border-brand-violet hover:bg-brand-violet/10 rounded-xl text-[10px] font-bold text-zinc-300 hover:text-white transition-all flex flex-col items-center justify-center gap-1.5 shadow-sm text-center"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span className="whitespace-nowrap">Exercises</span>
                </button>
                <button
                  onClick={() => onNavigate('training', 'logger')}
                  className="px-2 py-3 bg-white/5 border border-white/5 hover:border-brand-violet hover:bg-brand-violet/10 rounded-xl text-[10px] font-bold text-zinc-300 hover:text-white transition-all flex flex-col items-center justify-center gap-1.5 shadow-sm text-center"
                >
                  <Dumbbell className="h-3.5 w-3.5" />
                  <span className="whitespace-nowrap">Log Session</span>
                </button>
                <button
                  onClick={() => onNavigate('training', 'progress')}
                  className="px-2 py-3 bg-white/5 border border-white/5 hover:border-brand-violet hover:bg-brand-violet/10 rounded-xl text-[10px] font-bold text-zinc-300 hover:text-white transition-all flex flex-col items-center justify-center gap-1.5 shadow-sm text-center"
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="whitespace-nowrap">Progress</span>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-5 bg-dark-900/40 border border-white/5 rounded-2xl backdrop-blur-md flex flex-col justify-between space-y-4 shadow-glass">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Plus className="h-4 w-4 text-brand-cyan" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-300">Quick Utilities</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onNavigate('coach')}
                  className="px-2 py-3 bg-white/5 border border-white/5 hover:border-brand-cyan hover:bg-brand-cyan/10 rounded-xl text-[10px] font-bold text-zinc-300 hover:text-white transition-all flex flex-col items-center justify-center gap-1.5 shadow-sm text-center"
                >
                  🤖 Coach
                </button>
                <button
                  onClick={() => onAddWater(250)}
                  className="px-2 py-3 bg-white/5 border border-white/5 hover:border-brand-cyan hover:bg-brand-cyan/10 rounded-xl text-[10px] font-bold text-zinc-300 hover:text-white transition-all flex flex-col items-center justify-center gap-1.5 shadow-sm text-center animate-pulse"
                >
                  💧 +250ml
                </button>
                <button
                  onClick={() => onNavigate('training', 'progress')}
                  className="px-2 py-3 bg-white/5 border border-white/5 hover:border-brand-cyan hover:bg-brand-cyan/10 rounded-xl text-[10px] font-bold text-zinc-300 hover:text-white transition-all flex flex-col items-center justify-center gap-1.5 shadow-sm text-center"
                >
                  ⚖️ Weight
                </button>
              </div>
            </div>
          </div>
        </div>



        {/* Core Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
          
          {/* LEFT SECTION (7 Columns) */}
          <div className="lg:col-span-7 space-y-6 text-left flex flex-col justify-between">
            
            {/* Quick Metrics grid */}
            <div className="grid grid-cols-3 gap-4">
              
              {/* Metric 1: Streak */}
              <div className="p-4 bg-dark-900/40 border border-white/5 rounded-2xl backdrop-blur-md flex flex-col justify-between h-28">
                <Flame className="h-5 w-5 text-brand-pink" />
                <div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Training Streak</span>
                  <span className="text-xl font-display font-black text-white">
                    {workoutHistory.length > 0 ? "3 Days 🔥" : "0 Days"}
                  </span>
                </div>
              </div>

              {/* Metric 2: Completed workouts */}
              <div className="p-4 bg-dark-900/40 border border-white/5 rounded-2xl backdrop-blur-md flex flex-col justify-between h-28">
                <Dumbbell className="h-5 w-5 text-brand-cyan" />
                <div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Sessions Done</span>
                  <span className="text-xl font-display font-black text-white">{workoutHistory.length}</span>
                </div>
              </div>

              {/* Metric 3: Personal Records */}
              <div className="p-4 bg-dark-900/40 border border-white/5 rounded-2xl backdrop-blur-md flex flex-col justify-between h-28">
                <Trophy className="h-5 w-5 text-amber-400" />
                <div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Unique PR Lifts</span>
                  <span className="text-xl font-display font-black text-white">{getPersonalRecordsCount()}</span>
                </div>
              </div>

            </div>

            {/* Calorie Goal & Remaining Budget Gauges */}
            <div className="p-6 bg-dark-900/40 border border-white/5 rounded-2xl backdrop-blur-md space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Apple className="h-4 w-4 text-brand-lime" /> Daily Calorie Budget Tracker
                </h3>
                <span className="text-[9px] text-brand-lime font-black uppercase tracking-widest">Macro Splits Sync</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
                {/* Circular calorie gauge */}
                <div className="flex flex-col items-center justify-center space-y-2 col-span-1">
                  <div className="relative h-28 w-28 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="46" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                      <circle 
                        cx="56" 
                        cy="56" 
                        r="46" 
                        stroke="#a3e635" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={289}
                        strokeDashoffset={289 - (289 * calPercentage) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <div className="text-center z-10 space-y-0.5">
                      <span className="text-lg font-display font-black text-white leading-none">{consumedCalories}</span>
                      <span className="text-[8px] text-zinc-500 font-bold block uppercase leading-none">of {targetCals}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-bold">Consumed (kcal)</span>
                </div>

                {/* Remaining budget and progress bars */}
                <div className="col-span-3 space-y-4 text-left">
                  <div className="grid grid-cols-2 gap-4 pb-2 border-b border-white/5">
                    <div>
                      <span className="text-[8px] text-zinc-500 font-bold block uppercase">Remaining Calories</span>
                      <span className="text-2xl font-display font-black text-white">{remainingCals} <span className="text-xs font-semibold text-zinc-500">kcal</span></span>
                    </div>
                    <div>
                      <span className="text-[8px] text-zinc-500 font-bold block uppercase">Goal Status</span>
                      <span className="text-xs text-brand-lime font-black uppercase block mt-1">{savedDietGoal || 'Maintenance'}</span>
                    </div>
                  </div>

                  {/* Macros meters */}
                  <div className="space-y-3">
                    {/* Protein */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs font-semibold">
                        <span className="text-zinc-500 text-[9px] uppercase font-bold">Protein</span>
                        <span className="text-brand-lime font-bold">{consumedProtein}g <span className="text-zinc-500 font-normal">/ {targetProt}g</span></span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-lime h-full rounded-full transition-all duration-500" style={{ width: `${protPercentage}%` }} />
                      </div>
                    </div>

                    {/* Carbs */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs font-semibold">
                        <span className="text-zinc-500 text-[9px] uppercase font-bold">Carbs</span>
                        <span className="text-brand-cyan font-bold">{consumedCarbs}g <span className="text-zinc-500 font-normal">/ {targetCarbSplit}g</span></span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-cyan h-full rounded-full transition-all duration-500" style={{ width: `${carbPercentage}%` }} />
                      </div>
                    </div>

                    {/* Fats */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs font-semibold">
                        <span className="text-zinc-500 text-[9px] uppercase font-bold">Fats</span>
                        <span className="text-brand-pink font-bold">{consumedFats}g <span className="text-zinc-500 font-normal">/ {targetFatSplit}g</span></span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-pink h-full rounded-full transition-all duration-500" style={{ width: `${fatPercentage}%` }} />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Phase 2: Water Intake Hydration Tracker Widget */}
            <div className="p-6 bg-dark-900/40 border border-white/5 rounded-2xl backdrop-blur-md space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Flame className="h-4 w-4 text-brand-cyan animate-pulse" /> Hydration Tracker 💧
                </h3>
                <span className="text-[9px] text-brand-cyan font-black uppercase tracking-widest">Daily Water Balance</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                {/* SVG Progress Circle */}
                <div className="sm:col-span-4 flex flex-col items-center justify-center space-y-2">
                  <div className="relative h-24 w-24 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                      <circle 
                        cx="48" 
                        cy="48" 
                        r="40" 
                        stroke="#06b6d4" 
                        strokeWidth="6" 
                        fill="transparent" 
                        strokeDasharray={251}
                        strokeDashoffset={251 - (251 * Math.min(100, Math.round((todayWater / targetWater) * 100))) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="text-center z-10 space-y-0.5">
                      <span className="text-sm font-display font-black text-white">{todayWater} ml</span>
                      <span className="text-[8px] text-zinc-500 font-bold block uppercase tracking-wider">Logged</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-bold">Goal: {targetWater} ml</span>
                </div>

                {/* Controls */}
                <div className="sm:col-span-8 space-y-4">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-zinc-400">Remaining Water:</span>
                    <span className="text-brand-cyan font-black">{remainingWater} ml</span>
                  </div>

                  {/* Water Quick Add Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: '+250ml', val: 250 },
                      { label: '+500ml', val: 500 },
                      { label: '+750ml', val: 750 },
                      { label: '+1L', val: 1000 }
                    ].map(btn => (
                      <button
                        key={btn.label}
                        onClick={() => onAddWater(btn.val)}
                        className="py-2 bg-white/5 border border-white/5 hover:border-brand-cyan hover:bg-brand-cyan/15 rounded-lg text-[9px] font-black text-zinc-300 hover:text-white transition-all text-center"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Change Daily Water Goal inline */}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Set Daily Goal (ml):</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1000"
                        max="8000"
                        step="250"
                        value={targetWater}
                        onChange={(e) => {
                          const goal = Number(e.target.value);
                          localStorage.setItem('fitai_water_goal', String(goal));
                          onAddWater(0); // force state update
                        }}
                        className="w-16 px-1.5 py-1 bg-dark-950 border border-white/5 rounded text-center text-xs font-mono font-bold text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Hydration Trends SVG Bar Chart */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">7-Day Hydration History</span>
                <div className="h-16 flex items-end justify-between gap-1.5">
                  {Array(7).fill(0).map((_, idx) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - idx));
                    const dateStr = d.toISOString().split('T')[0];
                    const vol = waterLogs[dateStr] || 0;
                    const maxVol = Math.max(...Object.values(waterLogs), 3000);
                    const pct = `${Math.round((vol / maxVol) * 100)}%`;
                    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const label = dayLabels[d.getDay()];
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                        <span className="absolute -top-6 text-[8px] text-brand-cyan font-bold bg-dark-950 border border-white/5 px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                          {vol} ml
                        </span>
                        <div className="w-full bg-white/5 rounded-t h-10 flex items-end overflow-hidden">
                          <div 
                            className="w-full bg-gradient-to-t from-brand-cyan/40 to-brand-cyan rounded-t transition-all"
                            style={{ height: pct }}
                          />
                        </div>
                        <span className="text-[8px] text-zinc-500 font-bold">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Weight Profile Status & Personal Records listing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Weight Profile Card */}
              <div className="p-5 bg-dark-900/40 border border-white/5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <Scale className="h-4 w-4 text-brand-cyan" /> Weight Profile
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-semibold">Current Weight:</span>
                    <span className="text-white font-bold">{userWeight || 'N/A'} kg</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-semibold">Target Goal Weight:</span>
                    <span className="text-white font-bold">{goalWeight || 'N/A'} kg</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-semibold">Weekly Target Rate:</span>
                    <span className="text-brand-lime font-bold">{expectedWeightChange}</span>
                  </div>
                </div>
              </div>

              {/* Personal Records Listing */}
              <div className="p-5 bg-dark-900/40 border border-white/5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <Award className="h-4 w-4 text-amber-400" /> Best Heavy Lifts
                </h3>
                
                {getTopLifts().length === 0 ? (
                  <p className="text-[10px] text-zinc-500 italic pt-2">No heavy sets logged yet. Complete sets to log PRs!</p>
                ) : (
                  <div className="space-y-2.5">
                    {getTopLifts().map(([name, weight]) => (
                      <div key={name} className="flex justify-between items-center text-xs">
                        <span className="text-zinc-300 font-semibold">{name}</span>
                        <span className="text-brand-cyan font-black">{weight} kg</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* RIGHT SECTION: Saved routines, Favorites and Scanned diary logs (5 Columns) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <SpotlightCard className="p-6 space-y-6">
              
              {/* Active Session Launcher / Custom Routines */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <Clock className="h-4 w-4 text-brand-violet" /> Saved Training Routines
                </h3>

                {customRoutines.length === 0 ? (
                  <div className="p-3.5 border border-dashed border-white/10 rounded-xl text-center text-[10px] text-zinc-500 bg-dark-950/20">
                    No custom templates configured. Build one below.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {customRoutines.map(routine => (
                      <div key={routine.id} className="p-3 bg-dark-950/50 border border-white/5 rounded-xl flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white">{routine.name}</h4>
                          <span className="text-[9px] text-zinc-500 block mt-0.5">{routine.exercises.length} Exercises</span>
                        </div>
                        <button
                          onClick={() => onStartWorkout(routine)}
                          className="px-3 py-1.5 bg-brand-violet/20 hover:bg-brand-violet text-brand-cyan hover:text-white rounded-lg text-[10px] font-black transition-colors"
                        >
                          Start
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Logged scanned foods list (Diary Log) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <Apple className="h-4 w-4 text-brand-lime" /> Logged Scanned Foods
                </h3>

                {loggedScannedFoods.length === 0 ? (
                  <div className="p-3.5 border border-dashed border-white/10 rounded-xl text-center text-[10px] text-zinc-500 bg-dark-950/20">
                    No scanned food logged today. Try the AI Food Scanner page!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {loggedScannedFoods.map(item => (
                      <div key={item.id} className="p-2.5 bg-dark-950/60 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                        <div className="text-left max-w-[80%]">
                          <span className="font-bold text-white leading-tight block">{item.name}</span>
                          <span className="text-[9px] text-zinc-500 mt-0.5 block">{item.servingSize} • {item.kcal} kcal</span>
                        </div>
                        <button
                          onClick={() => onDeleteScannedFood(item.id)}
                          className="text-zinc-600 hover:text-red-400 p-1"
                          title="Delete entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Favorite Exercises chips */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <Heart className="h-4 w-4 text-brand-pink" /> Favorite Exercises
                </h3>

                {savedExercises.length === 0 ? (
                  <p className="text-[10px] text-zinc-500 italic">No exercises favorited. Tap hearts in Library to display here.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                    {savedExercises.map(id => {
                      const ex = EXERCISE_DATABASE.find(e => e.id === id);
                      return ex ? (
                        <span key={id} className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] font-bold text-zinc-300">
                          {ex.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Diet meal plan checklist splits */}
              <div className="space-y-3 border-t border-white/5 pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckSquare className="h-4 w-4 text-brand-lime" /> Meal Checklist
                  </h3>
                </div>

                {!savedDietGoal ? (
                  <div className="p-4 border border-dashed border-white/10 rounded-xl text-center space-y-1 bg-dark-950/20">
                    <AlertCircle className="h-5 w-5 text-zinc-500 mx-auto" />
                    <p className="text-xs text-zinc-400 font-semibold">No Indian Diet plan synced yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Diet Goal: {savedDietGoal} ({savedDietType})</span>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {mealPlanList.map((meal) => {
                        const isChecked = completedMeals.includes(meal.title);
                        return (
                          <div 
                            key={meal.title}
                            onClick={() => onToggleMeal(meal.title)}
                            className="p-3 bg-dark-950/50 border border-white/5 rounded-xl flex items-center justify-between cursor-pointer hover:border-brand-lime/20 transition-colors"
                          >
                            <div className="flex items-center space-x-2.5">
                              <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${
                                isChecked ? 'bg-brand-lime border-brand-lime text-dark-950' : 'border-white/20'
                              }`}>
                                {isChecked && <Check className="h-3 w-3 stroke-[4]" />}
                              </div>
                              <div className="text-left">
                                <span className="px-1.5 py-0.5 bg-brand-lime/10 border border-brand-lime/20 rounded text-[7px] font-black text-brand-lime uppercase tracking-wider block w-fit mb-0.5">
                                  {meal.title}
                                </span>
                                <span className={`text-xs font-bold leading-tight block ${isChecked ? 'line-through text-zinc-500' : 'text-white'}`}>
                                  {meal.name}
                                </span>
                              </div>
                            </div>
                            <span className="text-[9px] text-zinc-500 font-semibold shrink-0">{meal.kcal} kcal</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

            </SpotlightCard>
          </div>

        </div>

      </div>

    </section>
  );
};
