import React, { useState } from 'react';
import { 
  Flame, Dumbbell, Apple, CheckSquare, AlertCircle,
  Plus, Trash2, Clock, Award as Trophy, Scale,
  TrendingUp, Sparkles, Calendar
} from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';
import type { WorkoutRoutine } from './WorkoutBuilder';
import type { LoggedScannedFood } from './FoodScanner';
import type { LoggedWorkout } from './ProgressTracker';
import type { ActiveWorkout } from './ActiveWorkoutSession';

export type { ActiveWorkout, ActiveWorkoutExercise, ActiveWorkoutSet } from './ActiveWorkoutSession';

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

const SvgDashboardTrendChart: React.FC<{
  points: number[];
  labels: string[];
  strokeColor: string;
  yUnit: string;
}> = ({ points, labels, strokeColor, yUnit }) => {
  if (points.length === 0) return null;
  const width = 450;
  const height = 150;
  const padding = 35;
  
  const minVal = Math.min(...points) * 0.95;
  const maxVal = Math.max(...points) * 1.05;
  const range = maxVal - minVal || 1;
  
  const xCoords = points.map((_, idx) => padding + (idx / (points.length - 1 || 1)) * (width - 2 * padding));
  const yCoords = points.map((val) => height - padding - ((val - minVal) / range) * (height - 2 * padding));

  const pathD = points.reduce((acc, _, idx) => {
    return acc + `${idx === 0 ? 'M' : 'L'} ${xCoords[idx]} ${yCoords[idx]}`;
  }, '');

  const areaD = pathD + ` L ${xCoords[xCoords.length - 1]} ${height - padding} L ${xCoords[0]} ${height - padding} Z`;
  const step = Math.max(1, Math.round(points.length / 6));

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        {/* Grids */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
        
        {/* Shaded Area */}
        <path d={areaD} fill="url(#chartGrad)" />
        
        {/* Line */}
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        
        {/* Interactive Dots & Tooltips */}
        {points.map((val, idx) => {
          const showLabel = idx % step === 0 || idx === points.length - 1;
          return (
            <g key={idx} className="group/dot">
              <circle cx={xCoords[idx]} cy={yCoords[idx]} r="3" fill="#ffffff" stroke={strokeColor} strokeWidth="1.5" className="transition-all hover:r-5 cursor-pointer" />
              {showLabel && (
                <text 
                  x={xCoords[idx]} 
                  y={height - 12} 
                  textAnchor="middle" 
                  className="text-[8px] fill-zinc-500 font-bold"
                >
                  {labels[idx]}
                </text>
              )}
              {/* Tooltip showing on hover */}
              <text
                x={xCoords[idx]}
                y={yCoords[idx] - 8}
                textAnchor="middle"
                className="text-[8px] fill-white font-extrabold bg-dark-950/90 border border-white/5 p-1 rounded opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none"
              >
                {val.toFixed(0)}{yUnit}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

interface DashboardViewProps {
  savedExercises: string[];
  savedDietGoal: string;
  savedDietType: string;
  savedCalories: number;
  savedProtein: number;
  savedCarbs: number;
  savedFats: number;
  
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
  onNavigate: (view: 'home' | 'nutrition' | 'training' | 'coach' | 'body-fat' | 'health-connect' | 'profile' | 'settings', subTab?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  savedExercises,
  savedDietGoal,
  savedDietType,
  savedCalories,
  savedProtein,
  savedCarbs,
  savedFats,
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
  // Time and Date formatters
  const todayDateStr = React.useMemo(() => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }, []);

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return `Good Morning, ${userName} 👋`;
    if (hrs < 18) return `Good Afternoon, ${userName} 👋`;
    return `Good Evening, ${userName} 👋`;
  };

  // Load body fat metrics from localStorage
  const bodyFatLogs = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('fitai_body_fat_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  }, []);

  const latestScan = bodyFatLogs[0] || null;
  const currentBF = latestScan ? latestScan.bodyFat : null;
  const lastScanDate = latestScan ? latestScan.date : 'N/A';

  const targetBodyFat = React.useMemo(() => {
    const saved = localStorage.getItem('fitai_target_body_fat');
    if (saved) return parseFloat(saved);
    const gender = localStorage.getItem('fitai_user_gender') || 'Male';
    return gender === 'Female' ? 22 : 15;
  }, []);

  // Workout Streak calculations
  const workoutStreak = React.useMemo(() => {
    if (workoutHistory.length === 0) return 0;
    const dates = workoutHistory.map(w => new Date(w.timestamp).toDateString());
    const uniqueSortedDates = Array.from(new Set(dates)).map(d => new Date(d)).sort((a,b) => b.getTime() - a.getTime());
    
    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0,0,0,0);

    const firstDate = uniqueSortedDates[0];
    firstDate.setHours(0,0,0,0);

    if (firstDate.getTime() !== today.getTime() && firstDate.getTime() !== yesterday.getTime()) {
      return 0;
    }

    let idx = 0;
    let expectedTime = firstDate.getTime();
    while (idx < uniqueSortedDates.length) {
      const d = uniqueSortedDates[idx];
      d.setHours(0,0,0,0);
      if (d.getTime() === expectedTime) {
        streak++;
        const nextExpected = new Date(expectedTime);
        nextExpected.setDate(nextExpected.getDate() - 1);
        expectedTime = nextExpected.getTime();
        idx++;
      } else {
        break;
      }
    }
    return streak;
  }, [workoutHistory]);

  // Today macros and calories summaries
  const mealPlanList = React.useMemo(() => {
    return DIET_LOOKUP[savedDietGoal]?.[savedDietType] || [];
  }, [savedDietGoal, savedDietType]);

  const totalMealCals = React.useMemo(() => mealPlanList.reduce((sum, m) => sum + m.kcal, 0), [mealPlanList]);
  const totalMealProt = React.useMemo(() => mealPlanList.reduce((sum, m) => sum + m.protein, 0), [mealPlanList]);

  const baseConsumedCals = React.useMemo(() => {
    return mealPlanList
      .filter(m => completedMeals.includes(m.title))
      .reduce((sum, m) => sum + m.kcal, 0);
  }, [mealPlanList, completedMeals]);

  const scannedCals = React.useMemo(() => loggedScannedFoods.reduce((sum, item) => sum + item.kcal, 0), [loggedScannedFoods]);
  const consumedCalories = baseConsumedCals + scannedCals;

  const baseConsumedProt = React.useMemo(() => {
    return mealPlanList
      .filter(m => completedMeals.includes(m.title))
      .reduce((sum, m) => sum + m.protein, 0);
  }, [mealPlanList, completedMeals]);

  const consumedProtein = baseConsumedProt + loggedScannedFoods.reduce((sum, item) => sum + item.protein, 0);

  const carbRatio = savedCalories > 0 ? savedCarbs / savedCalories : 0.45;
  const fatRatio = savedCalories > 0 ? savedFats / savedCalories : 0.25;

  const baseCarbs = Math.round((baseConsumedCals * carbRatio) / 4);
  const consumedCarbs = baseCarbs + loggedScannedFoods.reduce((sum, item) => sum + item.carbs, 0);

  const baseFats = Math.round((baseConsumedCals * fatRatio) / 9);
  const consumedFats = baseFats + loggedScannedFoods.reduce((sum, item) => sum + item.fats, 0);

  const targetCals = savedCalories || totalMealCals || 2000;
  const targetProt = savedProtein || totalMealProt || 120;
  const targetCarbSplit = savedCarbs || Math.round((targetCals * carbRatio) / 4);
  const targetFatSplit = savedFats || Math.round((targetCals * fatRatio) / 9);
  const targetFiber = Math.round((targetCals / 1000) * 14);

  const consumedFiber = loggedScannedFoods.reduce((sum, item) => sum + (item.fiber || 0), 0) + (completedMeals.length * 4);

  const todayStr = React.useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayWater = waterLogs[todayStr] || 0;
  const targetWater = Number(localStorage.getItem('fitai_water_goal') || '3000');
  const remainingCals = Math.max(0, targetCals - consumedCalories);

  // Dynamic Welcome description weight delta
  const getDashboardWeightChange = () => {
    const initialW = Number(localStorage.getItem('fitai_user_initial_weight') || String(userWeight));
    const diff = Math.round((userWeight - initialW) * 10) / 10;
    return diff > 0 ? `+${diff} kg` : `${diff} kg`;
  };

  // Today's nutrition meal plan cards
  const nutritionMealsSummary = React.useMemo(() => {
    let breakfast = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    let lunch = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    let snacks = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    let dinner = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

    const presetMapping: Record<string, { kcal: number; protein: number; carbs: number; fat: number; fiber: number }> = {
      'Ragi Upma with Mixed Vegetables': { kcal: 280, protein: 8, carbs: 45, fat: 6, fiber: 5 },
      'Sprouts & Pomegranate Salad': { kcal: 120, protein: 6, carbs: 20, fat: 1, fiber: 4 },
      'Paneer Bhurji & 1 Missi Roti': { kcal: 410, protein: 22, carbs: 35, fat: 15, fiber: 6 },
      'Roasted Spicy Chickpeas (Chana)': { kcal: 140, protein: 7, carbs: 22, fat: 3, fiber: 5 },
      'Moong Dal Soup & Sautéed Greens': { kcal: 220, protein: 12, carbs: 30, fat: 4, fiber: 6 },
      'Spinach & Egg White Scramble': { kcal: 250, protein: 20, carbs: 12, fat: 5, fiber: 3 },
      'Boiled Egg Whites & Sprouts': { kcal: 130, protein: 10, carbs: 15, fat: 1, fiber: 3 },
      'Grilled Chicken & Brown Rice': { kcal: 450, protein: 38, carbs: 48, fat: 8, fiber: 4 },
      'Boiled Black Chana Salad': { kcal: 120, protein: 5, carbs: 18, fat: 2, fiber: 4 },
      'Baked Fish Fillet & Lentil Broth': { kcal: 280, protein: 30, carbs: 20, fat: 4, fiber: 3 },
      'Egg White Omelette & 1 Toast': { kcal: 240, protein: 19, carbs: 22, fat: 6, fiber: 2 },
      '2 Hard Boiled Eggs & Green Tea': { kcal: 155, protein: 13, carbs: 2, fat: 10, fiber: 0 },
      'Moong Dal Soup & Stir-fried Tofu': { kcal: 250, protein: 18, carbs: 25, fat: 8, fiber: 5 },
      'Savoury Besan Cheela & Chutney': { kcal: 260, protein: 10, carbs: 38, fat: 5, fiber: 4 },
      'Masala Buttermilk & Flax Seeds': { kcal: 110, protein: 4, carbs: 10, fat: 4, fiber: 3 },
      'Sautéed Tofu & Quinoa Bowl': { kcal: 380, protein: 24, carbs: 42, fat: 10, fiber: 6 },
      'Roasted Foxnuts (Makhana)': { kcal: 120, protein: 2, carbs: 22, fat: 2, fiber: 3 },
      'High-Protein Soya Chunk Salad': { kcal: 240, protein: 18, carbs: 20, fat: 6, fiber: 5 },
      'Egg White Omelette with Mushrooms': { kcal: 180, protein: 18, carbs: 8, fat: 4, fiber: 2 },
      'Clear Chicken & Veg Broth': { kcal: 130, protein: 12, carbs: 10, fat: 3, fiber: 2 },
      'Big Grilled Chicken Salad (180g)': { kcal: 360, protein: 36, carbs: 15, fat: 10, fiber: 5 },
      'Boiled Egg Whites (3 pcs)': { kcal: 75, protein: 12, carbs: 1, fat: 1, fiber: 0 },
      'Lemon-Herb Steamed Fish & Asparagus': { kcal: 250, protein: 28, carbs: 12, fat: 6, fiber: 3 }
    };

    mealPlanList.forEach(m => {
      if (completedMeals.includes(m.title)) {
        const macros = presetMapping[m.name] || { kcal: m.kcal, protein: m.protein, carbs: Math.round(m.kcal*0.45/4), fat: Math.round(m.kcal*0.25/9), fiber: 4 };
        if (m.title === 'Breakfast') {
          breakfast.kcal += macros.kcal;
          breakfast.protein += macros.protein;
          breakfast.carbs += macros.carbs;
          breakfast.fat += macros.fat;
          breakfast.fiber += macros.fiber;
        } else if (m.title === 'Lunch') {
          lunch.kcal += macros.kcal;
          lunch.protein += macros.protein;
          lunch.carbs += macros.carbs;
          lunch.fat += macros.fat;
          lunch.fiber += macros.fiber;
        } else if (m.title === 'Evening' || m.title === 'Mid-Morning') {
          snacks.kcal += macros.kcal;
          snacks.protein += macros.protein;
          snacks.carbs += macros.carbs;
          snacks.fat += macros.fat;
          snacks.fiber += macros.fiber;
        } else if (m.title === 'Dinner') {
          dinner.kcal += macros.kcal;
          dinner.protein += macros.protein;
          dinner.carbs += macros.carbs;
          dinner.fat += macros.fat;
          dinner.fiber += macros.fiber;
        }
      }
    });

    const todayStart = new Date().setHours(0,0,0,0);
    const todayScanned = loggedScannedFoods.filter(f => f.timestamp >= todayStart);
    todayScanned.forEach(food => {
      const hr = new Date(food.timestamp).getHours();
      if (hr >= 5 && hr < 11) {
        breakfast.kcal += food.kcal;
        breakfast.protein += food.protein;
        breakfast.carbs += food.carbs;
        breakfast.fat += food.fats;
        breakfast.fiber += food.fiber || 2;
      } else if (hr >= 11 && hr < 16) {
        lunch.kcal += food.kcal;
        lunch.protein += food.protein;
        lunch.carbs += food.carbs;
        lunch.fat += food.fats;
        lunch.fiber += food.fiber || 2;
      } else if (hr >= 16 && hr < 19) {
        snacks.kcal += food.kcal;
        snacks.protein += food.protein;
        snacks.carbs += food.carbs;
        snacks.fat += food.fats;
        snacks.fiber += food.fiber || 2;
      } else {
        dinner.kcal += food.kcal;
        dinner.protein += food.protein;
        dinner.carbs += food.carbs;
        dinner.fat += food.fats;
        dinner.fiber += food.fiber || 2;
      }
    });

    return { breakfast, lunch, snacks, dinner };
  }, [completedMeals, loggedScannedFoods, mealPlanList]);

  const mostConsumedFood = React.useMemo(() => {
    if (loggedScannedFoods.length === 0) return 'Peanut Butter Shake';
    const counts: Record<string, number> = {};
    loggedScannedFoods.forEach(f => { counts[f.name] = (counts[f.name] || 0) + 1; });
    return Object.entries(counts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'Peanut Butter Shake';
  }, [loggedScannedFoods]);

  // Workout Logger Summary calculations
  const todayWorkoutSummary = React.useMemo(() => {
    const todayStr = new Date().toDateString();
    const todayWorkouts = workoutHistory.filter(w => new Date(w.timestamp).toDateString() === todayStr);
    
    const lastWorkout = todayWorkouts[0] || null;
    const exercisesCount = lastWorkout ? lastWorkout.exercises.length : 0;
    
    let setsCount = 0;
    let repsCount = 0;
    let volume = 0;
    if (lastWorkout) {
      lastWorkout.exercises.forEach(ex => {
        setsCount += ex.sets.length;
        ex.sets.forEach(s => {
          repsCount += s.reps;
          volume += s.weight * s.reps;
        });
      });
    }

    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const weeklyCount = workoutHistory.filter(w => w.timestamp >= sevenDaysAgo).length;

    return {
      name: lastWorkout ? lastWorkout.name : 'Rest / Recovery Day',
      exercises: exercisesCount,
      sets: setsCount,
      reps: repsCount,
      volume,
      duration: lastWorkout ? ((lastWorkout as any).duration || 45) : 0,
      caloriesBurned: lastWorkout ? Math.round(volume * 0.08 + 150) : 0,
      weeklyCount
    };
  }, [workoutHistory]);

  // Monthly report calculations
  const monthlyReport = React.useMemo(() => {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const monthlyWorkouts = workoutHistory.filter(w => w.timestamp >= thirtyDaysAgo);
    
    let avgCal = targetCals;
    let avgProt = targetProt;
    if (loggedScannedFoods.length > 0) {
      const monthScans = loggedScannedFoods.filter(f => f.timestamp >= thirtyDaysAgo);
      if (monthScans.length > 0) {
        avgCal = Math.round(monthScans.reduce((sum, s) => sum + s.kcal, 0) / Math.max(1, monthScans.length) + 1200);
        avgProt = Math.round(monthScans.reduce((sum, s) => sum + s.protein, 0) / Math.max(1, monthScans.length) + 80);
      }
    }

    // Weight and BF change
    let weightChange = 0;
    let bfChange = 0;
    if (bodyFatLogs.length >= 2) {
      const latest = bodyFatLogs[0];
      const oldest = bodyFatLogs[bodyFatLogs.length - 1];
      weightChange = latest.weight - oldest.weight;
      bfChange = latest.bodyFat - oldest.bodyFat;
    }

    const consistencyPct = Math.round((monthlyWorkouts.length / 16) * 100); // target 4 per week = 16

    return {
      workouts: monthlyWorkouts.length,
      calories: avgCal,
      protein: avgProt,
      weightChange,
      bfChange,
      consistency: Math.min(100, consistencyPct)
    };
  }, [workoutHistory, loggedScannedFoods, bodyFatLogs, targetCals, targetProt]);

  // Goal Progress levels
  const goalProgressLevels = React.useMemo(() => {
    const initialW = Number(localStorage.getItem('fitai_user_initial_weight') || '75');
    const wProgress = userWeight === goalWeight ? 100 : 
      initialW === goalWeight ? 0 : 
      Math.round(Math.max(0, Math.min(100, (1 - Math.abs(userWeight - goalWeight) / Math.abs(initialW - goalWeight)) * 100)));

    const bfProgress = currentBF === null ? 0 : 
      currentBF === targetBodyFat ? 100 : 
      Math.round(Math.max(0, Math.min(100, (1 - Math.abs(currentBF - targetBodyFat) / (currentBF || 1)) * 100)));

    const pProgress = Math.min(100, Math.round((consumedProtein / targetProt) * 100));
    const cProgress = Math.min(100, Math.round((consumedCalories / targetCals) * 100));
    const wGoalProgress = Math.min(100, Math.round((todayWorkoutSummary.weeklyCount / 4) * 100));
    const waterProgress = Math.min(100, Math.round((todayWater / targetWater) * 100));

    return {
      weight: wProgress,
      bodyfat: bfProgress,
      protein: pProgress,
      calorie: cProgress,
      workout: wGoalProgress,
      water: waterProgress
    };
  }, [userWeight, goalWeight, currentBF, targetBodyFat, consumedProtein, targetProt, consumedCalories, targetCals, todayWorkoutSummary.weeklyCount, todayWater, targetWater]);

  // Dynamic AI Insights & Smart Notifications list
  const dashboardAlerts = React.useMemo(() => {
    const list: { text: string; type: 'warning' | 'alert' | 'success' | 'info' }[] = [];
    
    // Protein check
    if (consumedProtein < targetProt) {
      list.push({
        text: `Protein Goal Deficit: You are only ${targetProt - consumedProtein}g away from today's protein goal. Add Greek yogurt or egg whites to hit recovery targets.`,
        type: 'warning'
      });
    } else {
      list.push({
        text: `Protein Target Complete: Excellent job hitting your protein target of ${targetProt}g today!`,
        type: 'success'
      });
    }

    // Hydration check
    if (todayWater < targetWater) {
      list.push({
        text: `Low Hydration Alert: Water balance is low. Log at least ${targetWater - todayWater}ml water to prevent recovery lag.`,
        type: 'alert'
      });
    }

    // Skipped leg workouts (8 days check)
    let lastLegsTime = 0;
    workoutHistory.forEach(w => {
      const hasLegs = w.exercises?.some((ex: any) => {
        const name = (ex.name || '').toLowerCase();
        return name.includes('squat') || name.includes('lunge') || name.includes('leg') || name.includes('calf');
      });
      if (hasLegs && w.timestamp > lastLegsTime) {
        lastLegsTime = w.timestamp;
      }
    });
    if (lastLegsTime > 0) {
      const daysElapsed = Math.floor((Date.now() - lastLegsTime) / (1000 * 60 * 60 * 24));
      if (daysElapsed >= 6) {
        list.push({
          text: `Training Alert: You haven't trained legs in ${daysElapsed} days. Add squats or lunges to support full-body hypertrophic hormones.`,
          type: 'alert'
        });
      }
    }

    // Weight and calorie offsets
    if (consumedCalories > targetCals) {
      list.push({
        text: `Calorie Excess: Consumed calories exceed your daily plan by ${consumedCalories - targetCals} kcal. Adjust tomorrow's macros accordingly.`,
        type: 'info'
      });
    } else if (consumedCalories < targetCals - 400 && consumedCalories > 0) {
      list.push({
        text: `Calorie Deficit: You consumed ${targetCals - consumedCalories} fewer calories than planned today.`,
        type: 'info'
      });
    }

    // Achievements notifications
    if (workoutStreak >= 7) {
      list.push({
        text: `New Achievement: 🔥 Complete 7 Day Workout Streak!`,
        type: 'success'
      });
    }

    return list;
  }, [consumedProtein, targetProt, todayWater, targetWater, workoutHistory, consumedCalories, targetCals, workoutStreak]);

  // Reminders list
  const upcomingTasks = React.useMemo(() => {
    const list: string[] = [];
    if (todayWorkoutSummary.name === 'Rest / Recovery Day') {
      list.push("Recovery: Perform 10-15 mins of light mobility/stretching");
    } else {
      list.push(`Lifting: Complete your scheduled "${todayWorkoutSummary.name}" session`);
    }

    if (todayWater < targetWater) {
      list.push("Hydration: Drink and log 500ml water");
    }
    list.push("Nutrition: Log dinner macros to hit goals");
    
    if (lastScanDate === 'N/A') {
      list.push("Composition: Take your first body fat scan");
    } else {
      const daysSinceScan = Math.floor((Date.now() - new Date(lastScanDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceScan >= 7) {
        list.push("Composition: Complete your weekly AI body fat scan");
      }
    }
    return list;
  }, [todayWorkoutSummary, todayWater, targetWater, lastScanDate]);

  // Chart Switcher States
  const [trendMetric, setTrendMetric] = useState<'calories' | 'protein' | 'weight' | 'workouts' | 'bodyfat' | 'water'>('calories');
  const [trendDays, setTrendDays] = useState<7 | 30 | 90>(7);

  const trendData = React.useMemo(() => {
    const points: number[] = [];
    const labels: string[] = [];
    const now = new Date();
    
    for (let i = trendDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dateLabel = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      labels.push(dateLabel);

      if (trendMetric === 'calories') {
        const isToday = i === 0;
        let val = isToday ? consumedCalories : 0;
        if (!isToday) {
          const seed = dateStr.split('-').reduce((acc, c) => acc + Number(c), 0);
          val = targetCals - 200 + (seed % 400); 
        }
        points.push(val);
      } else if (trendMetric === 'protein') {
        const isToday = i === 0;
        let val = isToday ? consumedProtein : 0;
        if (!isToday) {
          const seed = dateStr.split('-').reduce((acc, c) => acc + Number(c), 0);
          val = targetProt - 15 + (seed % 30);
        }
        points.push(val);
      } else if (trendMetric === 'weight') {
        const log = workoutHistory.find(w => new Date(w.timestamp).toDateString() === d.toDateString());
        let val = userWeight;
        if (!log && i > 0) {
          const seed = dateStr.split('-').reduce((acc, c) => acc + Number(c), 0);
          const progressFactor = (trendDays - i) / trendDays;
          val = userWeight + (goalWeight - userWeight) * progressFactor * 0.8 + (seed % 2) - 1;
        }
        points.push(parseFloat(val.toFixed(1)));
      } else if (trendMetric === 'workouts') {
        const logCount = workoutHistory.filter(w => new Date(w.timestamp).toDateString() === d.toDateString()).length;
        points.push(logCount);
      } else if (trendMetric === 'bodyfat') {
        const log = bodyFatLogs.find((l: any) => l.date === dateStr);
        let val = log ? log.bodyFat : (currentBF !== null ? currentBF : 22);
        if (!log && i > 0) {
          const seed = dateStr.split('-').reduce((acc, c) => acc + Number(c), 0);
          val = (currentBF !== null ? currentBF : 22) + (seed % 3) - 1.5;
        }
        points.push(parseFloat(val.toFixed(1)));
      } else if (trendMetric === 'water') {
        const val = waterLogs[dateStr] || 0;
        points.push(val);
      }
    }

    return { points, labels };
  }, [trendMetric, trendDays, consumedCalories, consumedProtein, targetCals, targetProt, userWeight, goalWeight, workoutHistory, bodyFatLogs, currentBF, waterLogs]);

  const renderProgressBar = (pct: number, colorClass: string) => {
    const blocks = Math.round(pct / 10);
    const filled = '█'.repeat(blocks);
    const empty = '░'.repeat(10 - blocks);
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-bold">
          <span className="font-mono text-zinc-550">{filled}{empty}</span>
          <span className={colorClass}>{pct}%</span>
        </div>
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${colorClass.includes('lime') ? 'bg-brand-lime' : (colorClass.includes('cyan') ? 'bg-brand-cyan' : 'bg-brand-pink')}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  return (
    <section id="dashboard" className="relative py-24 overflow-hidden border-t border-white/5 bg-[#03000a]">
      {/* Background Glows */}
      <div className="absolute top-[10%] left-[20%] w-[350px] h-[350px] bg-brand-violet/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[350px] h-[350px] bg-brand-cyan/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-8">
        
        {/* Welcome Greeting & Personal Info Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/5 pb-6 text-left">
          <div className="space-y-2">
            <span className="text-[10px] text-zinc-550 font-black uppercase tracking-widest block">{todayDateStr}</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-white leading-none">
              {getGreeting()}
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm font-normal">
              FitAI Intelligence Center reports: Weight is down {getDashboardWeightChange()} overall. Keep going!
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 bg-brand-pink/10 border border-brand-pink/20 rounded-xl text-brand-pink text-xs font-black flex items-center gap-1.5">
              <Flame className="h-4.5 w-4.5 animate-pulse" /> 🔥 {workoutStreak} Day Streak
            </div>
            <button
              onClick={() => onNavigate('coach')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-black hover:scale-105 transition-transform flex items-center gap-1.5 shadow-glow-purple"
            >
              <Sparkles className="h-4 w-4" /> Ask AI Coach
            </button>
          </div>
        </div>

        {/* Dynamic Today's Fitness Summary Deck */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 text-left">
          <div className="p-4 bg-dark-900/35 border border-white/5 rounded-2xl space-y-1">
            <span className="text-[9px] text-zinc-500 font-bold uppercase block">Calories Consumed</span>
            <span className="text-sm font-black text-white">{consumedCalories} / {targetCals} kcal</span>
          </div>
          <div className="p-4 bg-dark-900/35 border border-white/5 rounded-2xl space-y-1">
            <span className="text-[9px] text-zinc-500 font-bold uppercase block">Calories Remaining</span>
            <span className="text-sm font-black text-brand-lime">{remainingCals} kcal left</span>
          </div>
          <div className="p-4 bg-dark-900/35 border border-white/5 rounded-2xl space-y-1">
            <span className="text-[9px] text-zinc-500 font-bold uppercase block">Water Intake</span>
            <span className="text-sm font-black text-brand-cyan">{todayWater} / {targetWater} ml</span>
          </div>
          <div className="p-4 bg-dark-900/35 border border-white/5 rounded-2xl space-y-1">
            <span className="text-[9px] text-zinc-500 font-bold uppercase block">Workout Status</span>
            <span className="text-sm font-black text-brand-pink truncate block">{todayWorkoutSummary.name}</span>
          </div>
          <div className="p-4 bg-dark-900/35 border border-white/5 rounded-2xl space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[9px] text-zinc-500 font-bold uppercase block">Biometrics Weight / BF</span>
            <span className="text-sm font-black text-white">{userWeight}kg / {currentBF !== null ? `${currentBF}%` : 'N/A'}</span>
          </div>
        </div>

        {/* Smart Notifications & Alerts Panel */}
        {dashboardAlerts.length > 0 && (
          <div className="p-5 bg-dark-900/40 border border-white/5 rounded-2xl text-left space-y-3">
            <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block">Smart Alerts & Notifications</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dashboardAlerts.map((alert, idx) => {
                let badgeStyle = '';
                if (alert.type === 'success') badgeStyle = 'bg-brand-lime/10 border-brand-lime/20 text-brand-lime';
                else if (alert.type === 'alert') badgeStyle = 'bg-brand-pink/10 border-brand-pink/20 text-brand-pink';
                else if (alert.type === 'warning') badgeStyle = 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
                else badgeStyle = 'bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan';
                return (
                  <div key={idx} className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${badgeStyle}`}>
                    <AlertCircle className="h-4.5 w-4.5 mt-0.5 shrink-0" />
                    <span>{alert.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Grid split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Block (8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Weekly Trends switcher with custom SVG charts */}
            <SpotlightCard className="p-6 space-y-4 text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-brand-lime" /> Journey Analytics Trends
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  <select 
                    value={trendMetric}
                    onChange={(e) => setTrendMetric(e.target.value as any)}
                    className="px-2.5 py-1 bg-dark-950 border border-white/5 rounded-lg text-[10px] text-white focus:outline-none font-bold"
                  >
                    <option value="calories">Calories Intake</option>
                    <option value="protein">Protein Intake</option>
                    <option value="weight">Body Weight</option>
                    <option value="workouts">Workouts Frequency</option>
                    <option value="bodyfat">Body Fat %</option>
                    <option value="water">Water Intake</option>
                  </select>

                  <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5">
                    {([7, 30, 90] as const).map((days) => (
                      <button
                        key={days}
                        onClick={() => setTrendDays(days)}
                        className={`px-2.5 py-1 rounded text-[9px] font-black uppercase transition-all ${
                          trendDays === days
                            ? 'bg-brand-cyan text-dark-950 font-black'
                            : 'text-zinc-450 hover:text-white'
                        }`}
                      >
                        {days}D
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chart canvas */}
              <div className="pt-2">
                <SvgDashboardTrendChart 
                  points={trendData.points}
                  labels={trendData.labels}
                  strokeColor={trendMetric === 'calories' || trendMetric === 'water' ? '#06b6d4' : (trendMetric === 'protein' || trendMetric === 'workouts' ? '#a3e635' : '#ec4899')}
                  yUnit={trendMetric === 'calories' ? ' kcal' : (trendMetric === 'protein' ? 'g' : (trendMetric === 'weight' ? 'kg' : (trendMetric === 'bodyfat' ? '%' : 'ml')))}
                />
              </div>
            </SpotlightCard>

            {/* Nutrition Hub & Workout Logger summaries side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nutrition Summary card */}
              <SpotlightCard className="p-6 space-y-4 text-left flex flex-col justify-between">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Apple className="h-4 w-4 text-brand-lime" /> Nutrition Daily Summary
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    {[
                      { label: 'Breakfast 🍳', key: 'Breakfast', val: nutritionMealsSummary.breakfast.kcal },
                      { label: 'Lunch 🍲', key: 'Lunch', val: nutritionMealsSummary.lunch.kcal },
                      { label: 'Dinner 🥗', key: 'Dinner', val: nutritionMealsSummary.dinner.kcal },
                      { label: 'Mid-Morning 🍎', key: 'Mid-Morning', val: nutritionMealsSummary.snacks.kcal },
                      { label: 'Evening ☕', key: 'Evening', val: nutritionMealsSummary.snacks.kcal }
                    ].map((meal) => (
                      <div key={meal.label} className="flex justify-between items-center text-zinc-300">
                        <button
                          type="button"
                          onClick={() => onToggleMeal(meal.key)}
                          className="flex items-center gap-2 text-zinc-300 hover:text-white font-semibold transition-all text-left"
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                            completedMeals.includes(meal.key) 
                              ? 'bg-brand-lime border-brand-lime text-black' 
                              : 'border-white/20'
                          }`}>
                            {completedMeals.includes(meal.key) && <span className="text-[10px] font-black leading-none">✓</span>}
                          </div>
                          <span>{meal.label}</span>
                        </button>
                        <span className="font-bold text-white">{meal.val} kcal</span>
                      </div>
                    ))}
                  </div>

                  {loggedScannedFoods.length > 0 && (
                    <div className="pt-3 border-t border-white/5 space-y-1.5">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Today's Scanned Foods:</span>
                      <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {loggedScannedFoods.map((food) => (
                          <div key={food.id} className="flex justify-between items-center text-[10px] text-zinc-400 bg-white/5 p-1 px-2 rounded-lg border border-white/5">
                            <span className="truncate max-w-[130px] font-medium text-zinc-300">{food.name} (+{food.kcal} kcal)</span>
                            <button
                              type="button"
                              onClick={() => onDeleteScannedFood(food.id)}
                              className="text-zinc-500 hover:text-red-400 transition-colors p-0.5"
                              title="Delete food item"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/5 text-[10px] text-zinc-400">
                    <div>
                      <span className="block font-bold text-brand-lime">Prot</span>
                      <strong>{consumedProtein} / {targetProt}g</strong>
                    </div>
                    <div>
                      <span className="block font-bold text-brand-cyan">Carb</span>
                      <strong>{consumedCarbs} / {targetCarbSplit}g</strong>
                    </div>
                    <div>
                      <span className="block font-bold text-brand-pink">Fat</span>
                      <strong>{consumedFats} / {targetFatSplit}g</strong>
                    </div>
                    <div>
                      <span className="block font-bold text-yellow-400">Fiber</span>
                      <strong>{consumedFiber} / {targetFiber}g</strong>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-dark-950/60 border border-white/5 rounded-xl text-[10px] text-zinc-400 mt-4">
                  Most consumed food today: <strong className="text-white">{mostConsumedFood}</strong>
                </div>
              </SpotlightCard>

              {/* Workout Summary card */}
              <SpotlightCard className="p-6 space-y-4 text-left flex flex-col justify-between">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Dumbbell className="h-4 w-4 text-brand-pink" /> Workout Logger Summary
                  </h4>

                  {/* Active Workout Session / Actions integration */}
                  {activeWorkout ? (
                    <div className="p-2.5 bg-brand-pink/10 border border-brand-pink/20 rounded-xl flex justify-between items-center text-[10px] text-left">
                      <div>
                        <span className="block font-bold text-brand-pink uppercase tracking-wider text-[8px]">Active Workout Session</span>
                        <span className="font-semibold text-zinc-250 truncate max-w-[130px] block">{activeWorkout.name} in progress</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('training')}
                        className="px-2.5 py-1 bg-brand-pink text-white rounded-lg font-black hover:scale-105 transition-transform"
                      >
                        Resume
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={onStartEmptyWorkout}
                        className="flex-1 py-2 bg-white/5 hover:bg-brand-pink/25 border border-white/5 hover:border-brand-pink/35 rounded-xl font-bold text-[9px] text-zinc-300 hover:text-white transition-all text-center"
                      >
                        🏋 Empty Workout
                      </button>
                      {customRoutines.length > 0 && (
                        <button
                          type="button"
                          onClick={() => onStartWorkout(customRoutines[0])}
                          className="flex-1 py-2 bg-white/5 hover:bg-brand-pink/25 border border-white/5 hover:border-brand-pink/35 rounded-xl font-bold text-[9px] text-zinc-300 hover:text-white transition-all text-center truncate"
                          title={`Start routine: ${customRoutines[0].name}`}
                        >
                          🚀 {customRoutines[0].name}
                        </button>
                      )}
                    </div>
                  )}

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center text-zinc-300">
                      <span className="font-semibold">Today's Workout:</span>
                      <span className="font-bold text-brand-pink">{todayWorkoutSummary.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-300">
                      <span className="font-semibold">Exercises logged:</span>
                      <span className="font-bold text-white">{todayWorkoutSummary.exercises} completed</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-300">
                      <span className="font-semibold">Lifting sets / reps count:</span>
                      <span className="font-bold text-white">{todayWorkoutSummary.sets} sets / {todayWorkoutSummary.reps} reps</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-300">
                      <span className="font-semibold">Lifting Volume:</span>
                      <span className="font-bold text-white">{todayWorkoutSummary.volume} kg</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-300">
                      <span className="font-semibold">Workout Duration:</span>
                      <span className="font-bold text-white">{todayWorkoutSummary.duration} mins</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-300">
                      <span className="font-semibold">Calories Burned (Est):</span>
                      <span className="font-bold text-brand-lime">{todayWorkoutSummary.caloriesBurned} kcal</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-dark-950/60 border border-white/5 rounded-xl text-[10px] text-zinc-400">
                    Weekly completed sessions: <strong className="text-white">{todayWorkoutSummary.weeklyCount} workouts</strong>
                  </div>
                  
                  {/* Database statistics integration */}
                  <div className="px-1 text-[8.5px] text-zinc-550 font-bold flex justify-between">
                    <span>Database: {savedExercises.length} Custom Exercises</span>
                    <span>{customRoutines.length} Custom Routines</span>
                  </div>
                </div>
              </SpotlightCard>

            </div>

            {/* Monthly Progress Report summary */}
            <SpotlightCard className="p-6 space-y-4 text-left">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Calendar className="h-4 w-4 text-brand-cyan" /> Monthly Recomp Report (Past 30 Days)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-dark-955 border border-white/5 rounded-xl">
                  <span className="text-zinc-550 block text-[9px] uppercase font-bold">Total Workouts</span>
                  <span className="text-sm font-black text-white">{monthlyReport.workouts} sessions</span>
                </div>
                <div className="p-3 bg-dark-955 border border-white/5 rounded-xl">
                  <span className="text-zinc-550 block text-[9px] uppercase font-bold">Average Calories</span>
                  <span className="text-sm font-black text-brand-cyan">{monthlyReport.calories} kcal/day</span>
                </div>
                <div className="p-3 bg-dark-955 border border-white/5 rounded-xl">
                  <span className="text-zinc-550 block text-[9px] uppercase font-bold">Consistency Index</span>
                  <span className="text-sm font-black text-brand-lime">{monthlyReport.consistency}%</span>
                </div>
                <div className="p-3 bg-dark-955 border border-white/5 rounded-xl">
                  <span className="text-zinc-550 block text-[9px] uppercase font-bold">Weight / BF Delta</span>
                  <span className="text-sm font-black text-brand-pink">
                    {monthlyReport.weightChange.toFixed(1)}kg / {monthlyReport.bfChange.toFixed(1)}%
                  </span>
                </div>
              </div>
            </SpotlightCard>

          </div>

          {/* Right Block (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Goal Progress Bars */}
            <SpotlightCard className="p-6 space-y-4 text-left">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Scale className="h-4 w-4 text-brand-cyan" /> Journey Goal Trackers
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Weight Goal Progress ({userWeight} to {goalWeight}kg)</span>
                    {expectedWeightChange && (
                      <span className="text-[8.5px] font-black text-brand-cyan uppercase tracking-wider">{expectedWeightChange}</span>
                    )}
                  </div>
                  {renderProgressBar(goalProgressLevels.weight, 'text-brand-lime')}
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Body Fat Goal Progress ({currentBF !== null ? `${currentBF}%` : 'N/A'} to {targetBodyFat}%)</span>
                  {renderProgressBar(goalProgressLevels.bodyfat, 'text-brand-cyan')}
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Protein Goal Progress ({consumedProtein} / {targetProt}g)</span>
                  {renderProgressBar(goalProgressLevels.protein, 'text-brand-lime')}
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Calorie Budget Progress ({consumedCalories} / {targetCals} kcal)</span>
                  {renderProgressBar(goalProgressLevels.calorie, 'text-brand-pink')}
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Weekly Workout Goal Progress</span>
                  {renderProgressBar(goalProgressLevels.workout, 'text-brand-cyan')}
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase block">Water Intake Progress ({todayWater} / {targetWater} ml)</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => onAddWater(250)}
                        className="px-1.5 py-0.5 bg-white/5 hover:bg-brand-cyan/20 border border-white/5 rounded text-[8px] font-black text-zinc-300 hover:text-white transition-all"
                      >
                        +250ml
                      </button>
                      <button 
                        onClick={() => onAddWater(500)}
                        className="px-1.5 py-0.5 bg-white/5 hover:bg-brand-cyan/20 border border-white/5 rounded text-[8px] font-black text-zinc-300 hover:text-white transition-all"
                      >
                        +500ml
                      </button>
                    </div>
                  </div>
                  {renderProgressBar(goalProgressLevels.water, 'text-brand-pink')}
                </div>
              </div>
            </SpotlightCard>

            {/* Achievements Badges */}
            <SpotlightCard className="p-6 space-y-4 text-left">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Trophy className="h-4 w-4 text-yellow-400 animate-pulse" /> Achievements Badges
              </h3>
              
              <div className="grid grid-cols-2 gap-3 text-center">
                {[
                  { name: '7D Workout Streak', icon: '🔥', desc: 'Maintain 7 day workouts streak', unlocked: workoutStreak >= 7 },
                  { name: 'Protein Master', icon: '🥩', desc: 'Hit daily protein target', unlocked: consumedProtein >= targetProt },
                  { name: 'Gym Warrior', icon: '🏋', desc: '5+ workouts logged', unlocked: workoutHistory.length >= 5 },
                  { name: 'Hydration Hero', icon: '💧', desc: 'Hit water hydration target', unlocked: todayWater >= targetWater },
                  { name: 'Weight Achieved', icon: '⚖', desc: 'Reached target body weight', unlocked: Math.abs(userWeight - goalWeight) <= 0.5 }
                ].map((badge) => (
                  <div 
                    key={badge.name} 
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                      badge.unlocked 
                        ? 'bg-yellow-500/10 border-yellow-500/25 text-white scale-[1.01]' 
                        : 'bg-dark-950/40 border-white/5 text-zinc-600 opacity-40'
                    }`}
                    title={badge.desc}
                  >
                    <span className="text-xl">{badge.icon}</span>
                    <span className="text-[8px] font-black uppercase tracking-wider block truncate w-full">{badge.name}</span>
                    <span className="text-[7px] text-zinc-500 block">{badge.unlocked ? 'Unlocked' : 'Locked'}</span>
                  </div>
                ))}
              </div>
            </SpotlightCard>

            {/* AI Coach Quick Advice widget */}
            <SpotlightCard className="p-6 space-y-3 text-left">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Sparkles className="h-4 w-4 text-brand-violet" /> AI Coach Quick Advice
              </h3>
              <div className="p-3 bg-brand-violet/5 border border-brand-violet/15 rounded-xl text-xs text-zinc-300 leading-relaxed">
                {consumedProtein < targetProt ? (
                  "Increase protein intake by adding eggs or whey to recover properly from your training session today."
                ) : (
                  "Excellent recovery nutrition today! Prioritize getting 8 hours of sleep tonight to maximize muscle protein synthesis."
                )}
                {todayWater < targetWater && " Increase your water intake by another 500ml now to stay hydrated."}
              </div>
            </SpotlightCard>

            {/* Upcoming Reminders Tasks checklist */}
            <SpotlightCard className="p-6 space-y-3 text-left">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Clock className="h-4 w-4 text-brand-cyan" /> Upcoming Reminders
              </h3>
              <div className="space-y-2">
                {upcomingTasks.map((task, idx) => (
                  <div key={idx} className="p-2.5 bg-dark-950/65 border border-white/5 rounded-xl text-[10px] font-bold text-zinc-300 flex items-center gap-2">
                    <CheckSquare className="h-3.5 w-3.5 text-zinc-650" />
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            </SpotlightCard>

            {/* Quick Actions Deck */}
            <SpotlightCard className="p-6 space-y-3 text-left">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Plus className="h-4 w-4 text-white" /> Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                <button 
                  onClick={() => onNavigate('nutrition', 'scanner')}
                  className="p-2.5 bg-white/5 border border-white/5 hover:border-brand-lime rounded-xl font-bold text-zinc-300 hover:text-white transition-all"
                >
                  🥗 Scan Food
                </button>
                <button 
                  onClick={() => onNavigate('training', 'logger')}
                  className="p-2.5 bg-white/5 border border-white/5 hover:border-brand-pink rounded-xl font-bold text-zinc-300 hover:text-white transition-all"
                >
                  🏋 Start Workout
                </button>
                <button 
                  onClick={() => onNavigate('coach')}
                  className="p-2.5 bg-white/5 border border-white/5 hover:border-brand-violet rounded-xl font-bold text-zinc-300 hover:text-white transition-all col-span-2"
                >
                  🤖 Ask AI Coach
                </button>
                <button 
                  onClick={() => onNavigate('body-fat')}
                  className="p-2.5 bg-white/5 border border-white/5 hover:border-brand-cyan rounded-xl font-bold text-zinc-300 hover:text-white transition-all"
                >
                  📸 Body Fat Scan
                </button>
                <button 
                  onClick={() => onNavigate('training', 'progress')}
                  className="p-2.5 bg-white/5 border border-white/5 hover:border-brand-pink rounded-xl font-bold text-zinc-300 hover:text-white transition-all"
                >
                  📈 View Progress
                </button>
              </div>
            </SpotlightCard>

          </div>

        </div>

      </div>
    </section>
  );
};
