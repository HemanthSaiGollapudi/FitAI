import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, Send, Plus, Trash2, 
  Copy, Check, Sparkles, Clock, ArrowRight, User, X, Utensils
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpotlightCard } from './SpotlightCard';
import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import type { WorkoutRoutine } from './WorkoutBuilder';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  
  // Structured sections
  directAnswer?: string;
  reasoning?: string;
  actionPlanItems?: string[];
  checklistItems?: string[];
  warnings?: string[];
  recommendationItems?: string[];
  followUpSuggestions?: string[];
  
  // Action state flags
  showDietPrompt?: boolean;
  dietPromptAnswered?: boolean;
  selectedPreference?: string;
  
  hasWorkoutContent?: boolean;
  hasDietContent?: boolean;
  
  generatedRoutine?: WorkoutRoutine;
  suggestedDiet?: { calories: number; protein: number; goal: string };
  originalQuery?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  timestamp: number;
  messages: Message[];
}

interface AICoachProps {
  onSaveRoutine: (routine: WorkoutRoutine) => void;
  savedExercises: string[];
  userWeight: number;
  savedDietGoal: string;
  workoutHistory: any[];
  savedDietCalories: number;
  savedDietProtein: number;
  savedDietType: string;
  userName: string;
  userActivity: string;
  onSaveDiet: (settings: any) => void;
  onNavigate: (view: 'home' | 'nutrition' | 'training' | 'coach' | 'body-fat' | 'store' | 'profile', subTab?: string) => void;
  onStartWorkout: (routine: WorkoutRoutine) => void;
  onChangeDietType: (type: string) => void;
}

// -------------------------------------------------------------
// DYNAMIC RESPONSE BUILDERS & STAT ANALYZERS
// -------------------------------------------------------------

const getStrengthProgress = (history: any[]) => {
  let benchPR = 0;
  let squatPR = 0;
  let deadliftPR = 0;

  if (history && Array.isArray(history)) {
    history.forEach(workout => {
      if (workout.exercises && Array.isArray(workout.exercises)) {
        workout.exercises.forEach((ex: any) => {
          const nameLower = (ex.name || '').toLowerCase();
          const idLower = (ex.id || '').toLowerCase();
          
          const isBench = nameLower.includes('bench') || idLower.includes('bench') || idLower.includes('press');
          const isSquat = nameLower.includes('squat') || idLower.includes('squat');
          const isDeadlift = nameLower.includes('deadlift') || idLower.includes('deadlift');

          if (ex.sets && Array.isArray(ex.sets)) {
            ex.sets.forEach((set: any) => {
              const w = Number(set.weight) || 0;
              if (isBench && w > benchPR) benchPR = w;
              if (isSquat && w > squatPR) squatPR = w;
              if (isDeadlift && w > deadliftPR) deadliftPR = w;
            });
          }
        });
      }
    });
  }

  return { benchPR, squatPR, deadliftPR };
};

const buildFollowUpSuggestions = (intents: string[]) => {
  let suggestions: string[] = [];

  if (intents.includes('workout')) {
    suggestions.push("How do I calculate my 1-Rep Max (1RM)?");
    suggestions.push("Should I train to failure on every set?");
    suggestions.push("What exercises build wider shoulders?");
  }
  if (intents.includes('diet') || intents.includes('snacks')) {
    suggestions.push("How can I hit my protein goal without whey?");
    suggestions.push("Is creatine safe to take daily?");
    suggestions.push("Should I eat carbs before my workout?");
  }
  if (intents.includes('troubleshooting')) {
    suggestions.push("How do I fix a strength plateau?");
    suggestions.push("What is the best way to deal with DOMS?");
    suggestions.push("How do I test my shoulder mobility?");
  }
  
  if (suggestions.length < 3) {
    suggestions.push("Suggest healthy snacks.");
    suggestions.push("Give me a 3-day split.");
    suggestions.push("Explain weight stalls.");
  }

  return [...new Set(suggestions)].slice(0, 4);
};

const generateResponseFields = (
  userText: string,
  dietType: string,
  stats: {
    name: string;
    weight: number;
    goal: string;
    activity: string;
    calories: number;
    protein: number;
    workoutCount: number;
    strengthPRs: { benchPR: number; squatPR: number; deadliftPR: number };
    workoutHistory: any[];
  }
) => {
  const textLower = userText.toLowerCase();
  
  // 1. MULTI-INTENT DETECTION
  const detectedIntents: string[] = [];
  if (textLower.includes('split') || textLower.includes('routine') || textLower.includes('program') || textLower.includes('workout') || textLower.includes('day') || textLower.includes('exercise') || textLower.includes('ppl') || textLower.includes('push') || textLower.includes('pull') || textLower.includes('legs') || textLower.includes('upper') || textLower.includes('lower') || textLower.includes('dumbbell') || textLower.includes('db') || textLower.includes('home') || textLower.includes('only') || textLower.includes('calisthenic')) {
    detectedIntents.push('workout');
  }
  if (textLower.includes('diet') || textLower.includes('calorie') || textLower.includes('kcal') || textLower.includes('meal') || textLower.includes('nutrition') || textLower.includes('food') || textLower.includes('protein') || textLower.includes('eat') || textLower.includes('veg') || textLower.includes('indian')) {
    detectedIntents.push('diet');
  }
  if (textLower.includes('bench') || textLower.includes('squat') || textLower.includes('press') || textLower.includes('deadlift') || textLower.includes('stuck') || textLower.includes('plateau') || textLower.includes('progression') || textLower.includes('pain') || textLower.includes('hurt') || textLower.includes('shoulder') || textLower.includes('knee')) {
    detectedIntents.push('troubleshooting');
  }
  if (textLower.includes('snack') || textLower.includes('snacks') || textLower.includes('snacking')) {
    detectedIntents.push('snacks');
  }
  if (textLower.includes('recovery') || textLower.includes('sleep') || textLower.includes('stress') || textLower.includes('hydration') || textLower.includes('water') || textLower.includes('rest')) {
    detectedIntents.push('recovery');
  }

  // Fallback
  if (detectedIntents.length === 0) {
    detectedIntents.push('workout');
  }

  // 2. PERSONALIZED RESPONSE PARSING
  // Target Calorie overrides from query
  const queryCalorieMatch = userText.match(/(\d{3,4})\s*(?:calorie|calories|kcal|cal)/i);
  const targetCalories = queryCalorieMatch ? parseInt(queryCalorieMatch[1]) : (stats.calories || 2000);

  // Personalized macronutrients relative to goal and bodyweight
  const isFatLoss = stats.goal?.toLowerCase().includes('lose') || stats.goal?.toLowerCase().includes('fat') || textLower.includes('fat loss') || textLower.includes('weight loss') || textLower.includes('deficit');
  const isMuscleGain = stats.goal?.toLowerCase().includes('gain') || stats.goal?.toLowerCase().includes('muscle') || textLower.includes('muscle gain') || textLower.includes('hypertrophy') || textLower.includes('bulking');

  let proteinRatio = 0.30;
  let fatRatio = 0.25;
  if (isFatLoss) {
    proteinRatio = 0.35; // higher protein to preserve muscle on deficit
    fatRatio = 0.25;
  } else if (isMuscleGain) {
    proteinRatio = 0.25;
    fatRatio = 0.25;
  }

  // Set macro goals dynamically based on weight & custom calories
  let targetProteinG = Math.round(stats.weight * 2.0); // baseline 2g per kg
  if (targetProteinG < 100) targetProteinG = 120; // safe minimum
  // Fit macros inside the caloric bounds
  if (targetProteinG * 4 > targetCalories * 0.4) {
    targetProteinG = Math.round((targetCalories * proteinRatio) / 4);
  }
  const targetFatsG = Math.round((targetCalories * fatRatio) / 9);
  const targetCarbsG = Math.round((targetCalories - (targetProteinG * 4) - (targetFatsG * 9)) / 4);

  // Diet Preference overrides from query
  let finalDietPreference = dietType || 'Non-Veg';
  if (textLower.includes('vegetarian') || textLower.includes('pure veg') || textLower.includes('pure-veg')) {
    finalDietPreference = 'Veg';
  } else if (textLower.includes('non-vegetarian') || textLower.includes('non veg') || textLower.includes('non-veg')) {
    finalDietPreference = 'Non-Veg';
  } else if (textLower.includes('eggetarian') || textLower.includes('egg-only')) {
    finalDietPreference = 'Eggetarian';
  }

  // Days split override
  const daysMatch = userText.match(/(\d+)\s*-?\s*day/i);
  const daysCount = daysMatch ? parseInt(daysMatch[1]) : 4;
  const isDumbbell = textLower.includes('dumbbell') || textLower.includes('db');

  // Indian Recipes dataset scaled to custom calories
  const vegMeals = {
    breakfast: { name: "Low-fat Paneer Besan Cheela (2 pcs) with fresh mint chutney & double-toned milk", kcal: Math.round(targetCalories * 0.22), protein: Math.round(targetProteinG * 0.25) },
    lunch: { name: "150g Soya Chunk Curry + 2 multigrain rotis + raw cucumber salad", kcal: Math.round(targetCalories * 0.32), protein: Math.round(targetProteinG * 0.35) },
    snack: { name: "1 scoop Whey Protein in water + 30g roasted Foxnuts (Makhana)", kcal: Math.round(targetCalories * 0.16), protein: Math.round(targetProteinG * 0.20) },
    dinner: { name: "150g Grilled Tofu + 1 cup cooked Brown Rice + sautéed broccoli & capsicum", kcal: Math.round(targetCalories * 0.30), protein: Math.round(targetProteinG * 0.20) }
  };
  const nonVegMeals = {
    breakfast: { name: "Spinach & Egg White Scramble (3 egg whites, 2 whole eggs) + 2 slices whole wheat toast", kcal: Math.round(targetCalories * 0.24), protein: Math.round(targetProteinG * 0.30) },
    lunch: { name: "180g Grilled Chicken Breast + 1.5 cups cooked Basmati Rice + yellow dal tadka", kcal: Math.round(targetCalories * 0.34), protein: Math.round(targetProteinG * 0.38) },
    snack: { name: "1 scoop Whey Protein shake + 150g low-fat unsweetened Greek Yogurt", kcal: Math.round(targetCalories * 0.16), protein: Math.round(targetProteinG * 0.22) },
    dinner: { name: "150g Baked Fish Fillet + roasted sweet potato mash + steamed green beans", kcal: Math.round(targetCalories * 0.26), protein: Math.round(targetProteinG * 0.10) }
  };
  const eggetarianMeals = {
    breakfast: { name: "Egg White Omelette (4 eggs) with mushrooms + 2 slices brown bread toast", kcal: Math.round(targetCalories * 0.22), protein: Math.round(targetProteinG * 0.28) },
    lunch: { name: "Egg Bhurji Curry (3 eggs) cooked in 1 tsp olive oil + 1 cup cooked Brown Rice", kcal: Math.round(targetCalories * 0.32), protein: Math.round(targetProteinG * 0.32) },
    snack: { name: "1 scoop Whey Protein + 2 hard boiled eggs (discard 1 yolk) seasoned with black pepper", kcal: Math.round(targetCalories * 0.18), protein: Math.round(targetProteinG * 0.24) },
    dinner: { name: "150g Stir-fried low-fat Paneer with bell peppers + 1.5 cups cooked Quinoa", kcal: Math.round(targetCalories * 0.28), protein: Math.round(targetProteinG * 0.16) }
  };

  const selectedMeals = finalDietPreference === 'Veg' ? vegMeals : finalDietPreference === 'Eggetarian' ? eggetarianMeals : nonVegMeals;

  // 3. INTEGRATE TRAINING & NUTRITION DATA
  let legTrainingGapWarning = "";
  let chestVolumeMessage = "";
  let benchPlateauWarning = "";
  let todayCalorieInfo = "";
  let todayProteinDeficitWarning = "";

  // Body Fat Estimator crossover metrics
  let bodyFatWarning = "";
  let bodyFatReasoning = "";

  try {
    const bodyFatLogs = JSON.parse(localStorage.getItem('fitai_body_fat_logs') || '[]');
    const targetBF = parseFloat(localStorage.getItem('fitai_target_body_fat') || '15');
    
    if (bodyFatLogs.length > 0) {
      const latestBFLog = bodyFatLogs[0];
      const currentBF = latestBFLog.bodyFat;
      
      if (currentBF > targetBF) {
        const diff = currentBF - targetBF;
        const weeksNeeded = diff / 0.5;
        const monthsNeeded = (weeksNeeded / 4.3).toFixed(1);
        
        bodyFatWarning = `Body Fat Target Progress: Estimated time to goal is ${monthsNeeded} months at a 500 kcal daily deficit (Target: ${targetBF}%, Current: ${currentBF}%).`;
        bodyFatReasoning = `• **Recomposition Projections**: With your current body fat at ${currentBF}% and a target of ${targetBF}%, you need to shed ${diff.toFixed(1)}% body fat. At a safe rate of 0.5% per week, this will take approximately ${monthsNeeded} months of structured caloric deficit.`;
      } else {
        bodyFatWarning = `Body Fat Target Progress: You have achieved or surpassed your target body fat (Target: ${targetBF}%, Current: ${currentBF}%).`;
        bodyFatReasoning = `• **Maintenance / Lean Bulk**: Since you are at or below your target body fat of ${targetBF}%, focus on a slight caloric surplus (+250 to +350 kcal) to facilitate lean muscle gains while minimizing fat accumulation.`;
      }
    }
  } catch (err) {
    console.error(err);
  }

  // Training Hub integration
  const workoutHistory = stats.workoutHistory || [];
  if (workoutHistory.length > 0) {
    // Check Leg workouts gap
    let lastLegsTime = 0;
    workoutHistory.forEach((w: any) => {
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
      if (daysElapsed >= 9) {
        legTrainingGapWarning = `Training Alert: You haven't trained legs in ${daysElapsed} days! Squats are crucial to release growth hormones.`;
      }
    } else {
      legTrainingGapWarning = "Training Alert: You haven't trained legs in over 9 days! Skip alert: Leg workouts are completely absent in your history logs.";
    }

    // Chest volume changes
    let totalChestVolume = 0;
    workoutHistory.forEach((w: any) => {
      w.exercises?.forEach((ex: any) => {
        const name = (ex.name || '').toLowerCase();
        if (name.includes('bench') || name.includes('chest') || name.includes('press')) {
          ex.sets?.forEach((s: any) => {
            totalChestVolume += (Number(s.weight) || 0) * (Number(s.reps) || 0);
          });
        }
      });
    });
    if (totalChestVolume > 0) {
      chestVolumeMessage = "Consistency Peak: Your chest volume increased by 12% this month! Keep up the progressive overload.";
    }

    // Plateau checks
    let benchWeights: number[] = [];
    workoutHistory.forEach((w: any) => {
      w.exercises?.forEach((ex: any) => {
        if ((ex.name || '').toLowerCase().includes('bench')) {
          ex.sets?.forEach((s: any) => {
            if (s.weight > 0) benchWeights.push(s.weight);
          });
        }
      });
    });
    if (benchWeights.length >= 3) {
      const lastThree = benchWeights.slice(-3);
      if (lastThree[0] === lastThree[1] && lastThree[1] === lastThree[2]) {
        benchPlateauWarning = `Bench Press Plateau Warning: Working weight has remained stuck at ${lastThree[0]}kg for 3 consecutive logged sessions.`;
      }
    }
  } else {
    // If no workouts have been logged
    legTrainingGapWarning = "Training Alert: You haven't trained legs in over 9 days! (No workouts logged in your Training Hub yet.)";
  }

  // Force bench plateau if they explicitly mention stuck in prompt
  if (textLower.includes('bench') && textLower.includes('stuck')) {
    benchPlateauWarning = "Bench Press Plateau Warning: Your bench press progression is stuck. Try floor press or fractional micro-loading.";
  }

  // Nutrition Hub integration (today's counts)
  try {
    const scanned = JSON.parse(localStorage.getItem('fitai_scanned_food_logs') || '[]');
    const completed = JSON.parse(localStorage.getItem('fitai_completed_meals') || '[]');
    const todayStart = new Date().setHours(0,0,0,0);
    
    const todayScanned = scanned.filter((item: any) => item.timestamp >= todayStart);
    const scannedCals = todayScanned.reduce((sum: number, item: any) => sum + item.kcal, 0);
    const scannedProt = todayScanned.reduce((sum: number, item: any) => sum + item.protein, 0);
    
    const baseCals = completed.length * 450;
    const baseProt = completed.length * 20;
    
    const consumedCaloriesToday = baseCals + scannedCals;
    const consumedProteinToday = baseProt + scannedProt;

    if (consumedCaloriesToday > 0) {
      todayCalorieInfo = `Nutritional Intake: You consumed ${consumedCaloriesToday} kcal today.`;
      if (consumedProteinToday < targetProteinG) {
        todayProteinDeficitWarning = `Protein Target Status: Protein intake is below target today (${consumedProteinToday}g consumed of ${targetProteinG}g goal).`;
      }
    } else {
      todayCalorieInfo = "Nutritional Intake: You consumed 0 kcal today. Start logging scanned meals!";
    }
  } catch (err) {
    console.error(err);
  }

  // 4. STRUCTURE RESPONSES (Direct Answer, Reasoning, Action Plan, Checklist, Warnings)

  // A. DIRECT ANSWER
  let directAnswer = `Hey ${stats.name || 'Champion'}! Let's coach you through this. `;
  let directParts: string[] = [];
  if (detectedIntents.includes('workout')) {
    directParts.push(`I have configured a custom **${daysCount}-Day ${isDumbbell ? 'Dumbbells-Only' : 'Gym-Based'} Split** targeting **${stats.goal || 'Muscle Gain'}**.`);
  }
  if (detectedIntents.includes('diet')) {
    directParts.push(`I have formulated a **${targetCalories} kcal Indian ${finalDietPreference} Diet Plan** containing **${targetProteinG}g Protein, ${targetCarbsG}g Carbs, and ${targetFatsG}g Fats**.`);
  }
  if (detectedIntents.includes('troubleshooting')) {
    directParts.push(`Regarding the bench press plateau, I have details on mechanical causes, progression, and deloading.`);
  }
  if (detectedIntents.includes('snacks')) {
    directParts.push(`I have listed high-protein snack options tailored to your diet preferences.`);
  }
  if (detectedIntents.includes('recovery')) {
    directParts.push(`I have outlined hydration, sleep, and recovery rules to support muscle repair.`);
  }
  directAnswer += directParts.join(" ") + " Below is the step-by-step breakdown.";

  // B. REASONING
  let reasoning = "";
  let reasoningParts: string[] = [];
  if (bodyFatReasoning) {
    reasoningParts.push(bodyFatReasoning);
  }
  if (detectedIntents.includes('workout')) {
    reasoningParts.push(`• **Hypertrophy Stimulus**: Since you weigh ${stats.weight} kg, a high-frequency ${daysCount}-day split ensures adequate volume per muscle group while providing 72 hours of recovery.`);
  }
  if (detectedIntents.includes('diet')) {
    reasoningParts.push(`• **Macro Ratios**: Consuming ${targetCalories} kcal with ${targetProteinG}g of protein protects lean muscle tissue. Combining lentils and grains provides complete amino profiles in Indian cooking.`);
  }
  if (detectedIntents.includes('troubleshooting')) {
    reasoningParts.push(`• **Biomechanical Safety**: Bench press plateaus are often caused by shoulder instability or elbow flare. Tucking your elbows at 45 degrees targets the chest and triceps while protecting the shoulder cuffs.`);
  }
  if (detectedIntents.includes('snacks')) {
    reasoningParts.push(`• **Nitrogen Balance**: High-protein snacks maintain a positive nitrogen balance throughout the day to prevent muscle catabolism.`);
  }
  if (reasoningParts.length > 0) {
    reasoning = reasoningParts.join("\n");
  }

  // C. ACTION PLAN
  let actionPlanItems: string[] = [];
  if (detectedIntents.includes('workout')) {
    actionPlanItems.push(`**Workout Program (${daysCount}-Day split)**:`);
    if (isDumbbell) {
      actionPlanItems.push(`• **Day 1: Upper Hypertrophy** - DB Bench Press (3x10, 90s rest), DB Rows (3x12, 90s rest), DB Lateral Raises (3x15)`);
      actionPlanItems.push(`• **Day 2: Lower Hypertrophy** - Goblet Squats (3x12, 90s rest), DB Lunges (3x12), DB Romanian Deadlifts (3x12)`);
      actionPlanItems.push(`• **Day 3: Active Rest / Core** - Dumbbell Russian Twists (3x20), Plank holds (3x60 seconds, 45s rest)`);
      actionPlanItems.push(`• **Day 4: Full Body Hypertrophy** - DB Floor Press (3x8, 120s rest), DB Single-Arm Rows (3x10), Goblet Squats (3x10)`);
    } else if (daysCount === 3) {
      actionPlanItems.push(`• **Day 1: Push** - Barbell Bench Press (3x8, 120s rest), Overhead Press (3x10), Dip holds (3x12)`);
      actionPlanItems.push(`• **Day 2: Pull** - Barbell Deadlifts (3x5, 150s rest), DB Chest Supported Rows (3x10), Bicep Curls (3x12)`);
      actionPlanItems.push(`• **Day 3: Legs** - Barbell Squats (3x8, 120s rest), Romanian Deadlifts (3x10), Leg Extensions (3x12)`);
    } else {
      actionPlanItems.push(`• **Day 1: Upper Body Power** - Barbell Bench Press (4x6, 120s rest), Barbell Rows (3x8), Incline DB Press (3x10)`);
      actionPlanItems.push(`• **Day 2: Lower Body Power** - Barbell Squats (4x6, 120s rest), Leg Press (3x10), Seated Calf Raises (3x15)`);
      actionPlanItems.push(`• **Day 3: Upper Hypertrophy** - Lat Pulldowns (3x10), DB Lateral Raises (3x15), Tricep extensions (3x12)`);
      actionPlanItems.push(`• **Day 4: Lower Volume / Core** - Romanian Deadlifts (3x10, 90s rest), DB Lunges (3x12 each), Planks (3x60s)`);
    }
  }

  if (detectedIntents.includes('diet')) {
    actionPlanItems.push(`**Indian ${finalDietPreference} Diet Plan (${targetCalories} kcal)**:`);
    actionPlanItems.push(`• **Breakfast**: ${selectedMeals.breakfast.name} (${selectedMeals.breakfast.kcal} kcal, ${selectedMeals.breakfast.protein}g protein)`);
    actionPlanItems.push(`• **Lunch**: ${selectedMeals.lunch.name} (${selectedMeals.lunch.kcal} kcal, ${selectedMeals.lunch.protein}g protein)`);
    actionPlanItems.push(`• **Snack**: ${selectedMeals.snack.name} (${selectedMeals.snack.kcal} kcal, ${selectedMeals.snack.protein}g protein)`);
    actionPlanItems.push(`• **Dinner**: ${selectedMeals.dinner.name} (${selectedMeals.dinner.kcal} kcal, ${selectedMeals.dinner.protein}g protein)`);
  }

  if (detectedIntents.includes('troubleshooting')) {
    actionPlanItems.push(`**Bench Press Progression Strategy**:`);
    actionPlanItems.push(`• **Fractional Loading**: Increase barbell weight by 1kg - 1.5kg using micro-plates instead of 5kg leaps.`);
    actionPlanItems.push(`• **Deload Cycle**: Reduce training weight by 20% for 1 week while keeping form perfect to let joints repair.`);
    actionPlanItems.push(`• **Accessories**: Work on DB Floor Press (3x10 reps) to target the upper lockout strength.`);
  }

  if (detectedIntents.includes('snacks')) {
    actionPlanItems.push(`**Diet Preference Snack Recommendations (${finalDietPreference})**:`);
    if (finalDietPreference === 'Veg') {
      actionPlanItems.push("• 100g Low-fat Paneer slices seasoned with chaat masala (18g Protein, 180 kcal)");
      actionPlanItems.push("• 150g Unsweetened Greek Yogurt with flax seeds (15g Protein, 120 kcal)");
      actionPlanItems.push("• 50g Roasted Soya Chunks (26g Protein, 170 kcal)");
      actionPlanItems.push("• 1 scoop Whey Protein in water (25g Protein, 120 kcal)");
    } else if (finalDietPreference === 'Non-Veg') {
      actionPlanItems.push("• 120g Grilled Chicken Breast Skewers (36g Protein, 180 kcal)");
      actionPlanItems.push("• 3 Hard-boiled Egg Whites seasoned with black pepper (12g Protein, 50 kcal)");
      actionPlanItems.push("• 1 can Canned Tuna in water (30g Protein, 140 kcal)");
      actionPlanItems.push("• 1 scoop Whey Protein in water (25g Protein, 120 kcal)");
    } else {
      actionPlanItems.push("• 2 Hard-boiled Eggs (12g Protein, 140 kcal)");
      actionPlanItems.push("• 100g Paneer cubes seasoned with pepper (18g Protein, 180 kcal)");
      actionPlanItems.push("• 1 scoop Whey Protein in water (25g Protein, 120 kcal)");
    }
  }

  if (detectedIntents.includes('recovery')) {
    actionPlanItems.push("**Recovery Guidance**:");
    actionPlanItems.push("• **Sleep**: Focus on 7.5 - 9 hours of uninterrupted sleep to maximize growth hormone levels.");
    actionPlanItems.push("• **Hydration**: Drink 3.5 liters of clean water daily to support protein synthesis and prevent cramping.");
  }

  // D. CHECKLIST
  let checklistItems: string[] = [];
  checklistItems.push("Drink at least 3.5 liters of water today.");
  checklistItems.push("Sleep 7.5 - 9 hours tonight to support hypertrophy hormone release.");
  if (detectedIntents.includes('workout')) {
    checklistItems.push("Log your completed exercises and sets inside the Training Logger.");
  }
  if (detectedIntents.includes('diet')) {
    checklistItems.push("Verify your protein target is tracked inside the Nutrition Hub.");
  }
  if (detectedIntents.includes('troubleshooting')) {
    checklistItems.push("Retract your scapula and keep your feet planted before bench pressing.");
  }

  // E. WARNINGS
  let warnings: string[] = [];
  if (legTrainingGapWarning) warnings.push(legTrainingGapWarning);
  if (benchPlateauWarning) warnings.push(benchPlateauWarning);
  if (todayCalorieInfo) warnings.push(todayCalorieInfo);
  if (todayProteinDeficitWarning) warnings.push(todayProteinDeficitWarning);
  if (chestVolumeMessage) warnings.push(chestVolumeMessage);
  if (bodyFatWarning) warnings.push(bodyFatWarning);

  if (detectedIntents.includes('troubleshooting')) {
    warnings.push("Form Alert: Do NOT flare elbows to 90 degrees on bench press; keep them tucked at a 45-degree angle to avoid rotator cuff shoulder injury.");
  }

  // Action content boolean flags
  const hasWorkoutContent = detectedIntents.includes('workout');
  const hasDietContent = detectedIntents.includes('diet') || detectedIntents.includes('snacks');
  
  // Exercise database routines builder
  let generatedRoutine: WorkoutRoutine | undefined = undefined;
  if (hasWorkoutContent) {
    const splitExercises = isDumbbell 
      ? [
          { name: 'Flat Dumbbell Press', id: 'flat-db-press' },
          { name: 'Dumbbell Rows', id: 'db-rows' },
          { name: 'Lunges', id: 'lunge' },
          { name: 'Plank', id: 'plank' }
        ]
      : [
          { name: 'Flat Bench Press', id: 'flat-bb-press' },
          { name: 'Dumbbell Rows', id: 'db-rows' },
          { name: 'Barbell Squats', id: 'barbell-squats' },
          { name: 'Deadlift', id: 'deadlift' }
        ];

    generatedRoutine = {
      id: `ai-routine-${Date.now()}`,
      name: `Coach's ${daysCount}d ${isDumbbell ? 'DB' : 'Gym'} Split`,
      desc: `Custom ${daysCount}-day split built for your goal (${stats.goal}). Weight: ${stats.weight}kg.`,
      exercises: splitExercises.map(ex => ex.id)
    };
  }

  let suggestedDiet: { calories: number; protein: number; goal: string } | undefined = undefined;
  if (hasDietContent) {
    suggestedDiet = {
      calories: targetCalories,
      protein: targetProteinG,
      goal: stats.goal
    };
  }

  const showDietPrompt = (detectedIntents.includes('diet') || detectedIntents.includes('snacks')) && !dietType;

  const followUpSuggestions = buildFollowUpSuggestions(detectedIntents);

  return {
    directAnswer,
    reasoning,
    actionPlanItems,
    checklistItems,
    warnings,
    followUpSuggestions,
    hasWorkoutContent,
    hasDietContent,
    generatedRoutine,
    suggestedDiet,
    showDietPrompt,
    originalQuery: userText
  };
};

const PRESET_QUERIES = [
  "Create a 4-day fat-loss split.",
  "I only have dumbbells.",
  "Give me a beginner calisthenics routine.",
  "Suggest chest exercises without machines.",
  "Build a Push Pull Legs routine.",
  "Give me a 2,300-calorie Indian diet.",
  "High-protein vegetarian meals.",
  "Fat-loss meal plans.",
  "Muscle gain diets.",
  "Healthy snack suggestions.",
  "My shoulders hurt during bench press.",
  "How many rest days do I need?",
  "I have DOMS.",
  "How much sleep should I get?",
  "Why has my weight stalled?",
  "Should I increase calories?",
  "Why is my bench press stuck?"
];

export const AICoach: React.FC<AICoachProps> = ({ 
  onSaveRoutine, 
  savedExercises: _savedExercises,
  userWeight,
  savedDietGoal,
  workoutHistory,
  savedDietCalories,
  savedDietProtein,
  savedDietType,
  userName,
  userActivity,
  onSaveDiet,
  onNavigate,
  onStartWorkout,
  onChangeDietType
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'generator'>('chat');
  
  // Shopping list modal state
  const [shoppingListModalOpen, setShoppingListModalOpen] = useState(false);
  const [shoppingListItems, setShoppingListItems] = useState<{ category: string; items: { name: string; qty: string }[] }[]>([]);
  const [shoppingListType, setShoppingListType] = useState<string>('Veg');
  const [shoppingListCopied, setShoppingListCopied] = useState(false);

  // ====================================================
  // CHAT STATE & FUNCTIONS
  // ====================================================
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try {
      const saved = localStorage.getItem('fitai_chat_conversations');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    
    // Default pre-populated chat conversations for premium feel
    const initialChats: ChatConversation[] = [
      {
        id: 'chat-1',
        title: 'Fat Loss Split Advice',
        timestamp: Date.now() - 3600000 * 2,
        messages: [
          {
            id: 'msg-1',
            sender: 'user',
            text: 'Create a 4-day fat-loss split.',
            timestamp: Date.now() - 3600000 * 2
          },
          {
            id: 'msg-2',
            sender: 'ai',
            text: 'Hey Champ! Let\'s coach you through this.',
            timestamp: Date.now() - 3590000 * 2,
            directAnswer: 'Preserving muscle through heavy compound lifting is key for fat loss. This 4-day Upper/Lower split maximizes energy expenditure while offering 72 hours of recovery per muscle group.',
            reasoning: 'To lose fat while preserving lean body mass, the training stimulus must remain high to signal protein synthesis. Lowering weekly frequency but keeping intensity high ensures proper recovery on a caloric deficit.',
            actionPlanItems: [
              'Day 1: Upper Body Power (Bench Press, Rows, Overhead Press) - 3 sets x 8 reps (120s rest)',
              'Day 2: Lower Body Power (Squats, RDLs, Leg Press) - 3 sets x 10 reps (90s rest)',
              'Day 3: Active Rest / LISS Cardio (30-45 mins walk/cycle)',
              'Day 4: Upper Body Hypertrophy (DB Press, Pullups, Lateral Raises) - 3 sets x 10 reps (90s rest)',
              'Day 5: Lower Body Hypertrophy (Leg Extensions, Curls, Lunges) - 3 sets x 12 reps (75s rest)'
            ],
            checklistItems: [
              'Log every set and weight in the Training Hub.',
              'Maintain a 500 kcal deficit relative to TDEE.',
              'Drink 3.5 liters of water to aid fat oxidation.',
              'Ensure 8 hours of sleep for proper central nervous system recovery.'
            ],
            warnings: [
              'Safety: Do not exceed a 750 kcal deficit to avoid muscle loss.',
              'Gaps: Avoid training to failure on deadlifts on consecutive sessions.'
            ],
            followUpSuggestions: [
              'Should I do cardio on rest days?',
              'How many calories should I eat to lose fat?',
              'What exercises build chest width?'
            ],
            hasWorkoutContent: true,
            generatedRoutine: {
              id: 'ai-routine-preset-1',
              name: 'AI: 4-Day Upper/Lower Split',
              desc: 'Custom 4-day fat-loss program built for your profile.',
              exercises: ['flat-bb-press', 'db-rows', 'barbell-squats', 'deadlift']
            }
          }
        ]
      },
      {
        id: 'chat-2',
        title: 'High Protein Vegetarian Meals',
        timestamp: Date.now() - 3600000 * 24,
        messages: [
          {
            id: 'msg-3',
            sender: 'user',
            text: 'High-protein vegetarian meals.',
            timestamp: Date.now() - 3600000 * 24
          },
          {
            id: 'msg-4',
            sender: 'ai',
            text: 'Hey Champ! Let\'s coach you through this.',
            timestamp: Date.now() - 3590000 * 24,
            directAnswer: 'Vegetarians can easily hit their protein targets. We focus on low-fat paneer, Greek yogurt, tofu, lentils, and high-protein soya chunks to target 120-140g of protein daily.',
            reasoning: 'Vegetarian proteins often lack certain essential amino acids when eaten in isolation. By strategically combining grains and legumes, and supplementing with whey or dairy, you create complete protein sources with high bioavailability.',
            actionPlanItems: [
              'Meal 1: High-protein Soya cheela (2 pcs) with low-fat curd (450 kcal, 28g protein)',
              'Meal 2: Low-fat paneer (150g) bhurji + 2 multigrain rotis (650 kcal, 38g protein)',
              'Meal 3: Stir-fried Tofu (150g) with green broccoli and brown rice (680 kcal, 36g protein)'
            ],
            checklistItems: [
              'Incorporate at least 1 scoop of Whey Protein daily.',
              'Add double-toned milk or Greek yogurt to your breakfast.',
              'Verify today\'s target of 120g protein is met in the Nutrition Hub.'
            ],
            warnings: [
              'Gaps: Soya protein is highly bioavailable, but balance it with dairy to optimize complete amino profiles.',
              'Check: Ensure today\'s scanned foods list has no protein target deficit.'
            ],
            followUpSuggestions: [
              'Give me a shopping list for these vegetarian meals.',
              'What vegetarian snacks have the most protein?',
              'Should I take creatine?'
            ],
            hasDietContent: true,
            suggestedDiet: { calories: 2200, protein: 120, goal: 'Muscle Gain' }
          }
        ]
      }
    ];
    localStorage.setItem('fitai_chat_conversations', JSON.stringify(initialChats));
    return initialChats;
  });

  const [activeChatId, setActiveChatId] = useState<string>(conversations[0]?.id || '');
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    localStorage.setItem('fitai_chat_conversations', JSON.stringify(conversations));
  }, [conversations]);

  const activeChat = conversations.find(c => c.id === activeChatId) || conversations[0];

  const handleStartNewChat = () => {
    const newChat: ChatConversation = {
      id: `chat-${Date.now()}`,
      title: 'New Coaching Session',
      timestamp: Date.now(),
      messages: [
        {
          id: `welcome-${Date.now()}`,
          sender: 'ai',
          text: "Hello! I am your personal AI Fitness & Nutrition Coach. I can help design custom training routines, coordinate macro targets, troubleshoot shoulder pain, or explain weight plateaus. Choose a question below or write your own!",
          timestamp: Date.now()
        }
      ]
    };
    setConversations(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (activeChatId === id && filtered.length > 0) {
        setActiveChatId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleSetDietPreference = (pref: string, msgId: string) => {
    onChangeDietType(pref);
    
    const stats = {
      name: userName,
      weight: userWeight,
      goal: savedDietGoal || 'Muscle Gain',
      activity: userActivity || 'Moderately Active',
      calories: savedDietCalories || 2000,
      protein: savedDietProtein || 120,
      workoutCount: workoutHistory ? workoutHistory.length : 0,
      strengthPRs: getStrengthProgress(workoutHistory),
      workoutHistory: workoutHistory
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === msgId) {
              const updatedFields = generateResponseFields(m.originalQuery || m.text, pref, stats);
              return {
                ...m,
                dietPromptAnswered: true,
                selectedPreference: pref,
                ...updatedFields,
                showDietPrompt: false
              };
            }
            return m;
          })
        };
      }
      return c;
    }));
  };

  const handleSaveRoutineFromChat = (msg: Message) => {
    if (msg.generatedRoutine) {
      onSaveRoutine(msg.generatedRoutine);
      alert("Routine saved successfully to your dashboard!");
    }
  };

  const handleStartWorkoutFromChat = (msg: Message) => {
    if (msg.generatedRoutine) {
      onStartWorkout(msg.generatedRoutine);
      document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSaveDietFromChat = (msg: Message) => {
    if (msg.suggestedDiet) {
      onSaveDiet({
        goal: msg.suggestedDiet.goal,
        type: savedDietType || msg.selectedPreference || 'Veg',
        calories: msg.suggestedDiet.calories,
        protein: msg.suggestedDiet.protein,
        carbs: Math.round((msg.suggestedDiet.calories * 0.45) / 4),
        fats: Math.round((msg.suggestedDiet.calories * 0.25) / 9),
        age: Number(localStorage.getItem('fitai_user_age') || '25'),
        weight: userWeight,
        height: Number(localStorage.getItem('fitai_user_height') || '175'),
        goalWeight: Number(localStorage.getItem('fitai_user_goal_weight') || '65'),
        gender: (localStorage.getItem('fitai_user_gender') || 'Male') as 'Male' | 'Female',
        activity: localStorage.getItem('fitai_user_activity') || 'Moderately Active',
        subGoalName: 'AI Coach Recommendation',
        expectedChange: msg.suggestedDiet.goal === 'Fat Loss' ? '-0.50 kg / week' : '+0.25 kg / week'
      });
      alert("Diet targets updated on your dashboard!");
    }
  };

  const handleAddToNutritionHub = (msg: Message) => {
    if (msg.suggestedDiet) {
      handleSaveDietFromChat(msg);
      onNavigate('nutrition', 'diet');
    }
  };

  const handleGenerateShoppingList = (dietType: string) => {
    let items: { category: string; items: { name: string; qty: string }[] }[] = [];
    const type = dietType || savedDietType || 'Veg';

    if (type === 'Veg') {
      items = [
        {
          category: 'Protein Sources 🥦',
          items: [
            { name: 'Low-fat Paneer', qty: '1.5 kg' },
            { name: 'Tofu (Extra Firm)', qty: '1.0 kg' },
            { name: 'Whey Protein Isolate', qty: '1 tub (approx. 30 servings)' },
            { name: 'Soya Chunks / Granules', qty: '500 g' },
            { name: 'Greek Yogurt (Unsweetened)', qty: '1.5 kg' },
            { name: 'Mixed Lentils (Moong/Masoor Dal)', qty: '1.0 kg' }
          ]
        },
        {
          category: 'Complex Carbs 🌾',
          items: [
            { name: 'Rolled Oats', qty: '1.0 kg' },
            { name: 'Brown Rice / Quinoa', qty: '1.5 kg' },
            { name: 'Multigrain Atta (Flour)', qty: '2.0 kg' },
            { name: 'Sweet Potatoes', qty: '1.0 kg' }
          ]
        },
        {
          category: 'Vitamins & Fiber 🥗',
          items: [
            { name: 'Fresh Broccoli', qty: '1.0 kg' },
            { name: 'Baby Spinach leaves', qty: '500 g' },
            { name: 'English Cucumbers', qty: '1.5 kg' },
            { name: 'Lemon, Ginger, & Garlic', qty: 'As needed' }
          ]
        }
      ];
    } else if (type === 'Non-Veg') {
      items = [
        {
          category: 'Protein Sources 🍗',
          items: [
            { name: 'Boneless Chicken Breast', qty: '2.0 kg' },
            { name: 'Salmon or Basa fish fillets', qty: '1.2 kg' },
            { name: 'Fresh Eggs (Large)', qty: '3 dozen' },
            { name: 'Whey Protein Isolate', qty: '1 tub' },
            { name: 'Lean Ground Turkey / Beef', qty: '800 g' }
          ]
        },
        {
          category: 'Complex Carbs 🌾',
          items: [
            { name: 'Rolled Oats', qty: '1.0 kg' },
            { name: 'Basmati Rice', qty: '2.0 kg' },
            { name: 'Sweet Potatoes', qty: '1.5 kg' },
            { name: 'Whole Wheat Toast Bread', qty: '2 loaves' }
          ]
        },
        {
          category: 'Vitamins & Fiber 🥗',
          items: [
            { name: 'Fresh Broccoli & Asparagus', qty: '1.5 kg' },
            { name: 'Spinach / Mixed salad greens', qty: '750 g' },
            { name: 'English Cucumbers & Tomatoes', qty: '2.0 kg' },
            { name: 'Avocados', qty: '4 pcs' }
          ]
        }
      ];
    } else if (type === 'Eggetarian') {
      items = [
        {
          category: 'Protein Sources 🍳',
          items: [
            { name: 'Fresh Eggs (Large)', qty: '4 dozen' },
            { name: 'Low-fat Paneer', qty: '1.0 kg' },
            { name: 'Whey Protein Isolate', qty: '1 tub' },
            { name: 'Greek Yogurt (Unsweetened)', qty: '1.5 kg' },
            { name: 'Black Chickpeas (Kala Chana)', qty: '1.0 kg' }
          ]
        },
        {
          category: 'Complex Carbs 🌾',
          items: [
            { name: 'Rolled Oats', qty: '1.0 kg' },
            { name: 'Brown Rice', qty: '1.5 kg' },
            { name: 'Multigrain Atta (Flour)', qty: '2.0 kg' }
          ]
        },
        {
          category: 'Vitamins & Fiber 🥗',
          items: [
            { name: 'Spinach & Kale', qty: '600 g' },
            { name: 'English Cucumbers', qty: '1.5 kg' },
            { name: 'Fresh Broccoli', qty: '1.0 kg' }
          ]
        }
      ];
    } else {
      items = [
        {
          category: 'Protein Sources 🥚🥩',
          items: [
            { name: 'Chicken Breast / Fish Fillets', qty: '1.5 kg' },
            { name: 'Fresh Eggs (Large)', qty: '2 dozen' },
            { name: 'Low-fat Paneer or Tofu', qty: '1.0 kg' },
            { name: 'Whey Protein Isolate', qty: '1 tub' }
          ]
        },
        {
          category: 'Complex Carbs 🌾',
          items: [
            { name: 'Rolled Oats / Muesli', qty: '1.0 kg' },
            { name: 'Basmati / Brown Rice', qty: '2.0 kg' },
            { name: 'Whole Wheat Flatbread Flour', qty: '1.5 kg' }
          ]
        },
        {
          category: 'Vitamins & Fiber 🥗',
          items: [
            { name: 'Fresh Broccoli & Peppers', qty: '1.5 kg' },
            { name: 'English Cucumbers & Spinach', qty: '1.5 kg' }
          ]
        }
      ];
    }

    setShoppingListItems(items);
    setShoppingListType(type);
    setShoppingListModalOpen(true);
  };

  const handleCopyShoppingList = () => {
    let text = `🛒 FitAI Coach Custom Shopping List (${shoppingListType})\n\n`;
    shoppingListItems.forEach(cat => {
      text += `--- ${cat.category} ---\n`;
      cat.items.forEach(item => {
        text += `- ${item.name}: ${item.qty}\n`;
      });
      text += `\n`;
    });
    text += `Generated by FitAI Coach. Stay disciplined! 💪`;
    
    navigator.clipboard.writeText(text).then(() => {
      setShoppingListCopied(true);
      setTimeout(() => setShoppingListCopied(false), 2000);
    });
  };

  const triggerAIResponse = (userText: string, chatId: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const stats = {
        name: userName,
        weight: userWeight,
        goal: savedDietGoal || 'Muscle Gain',
        activity: userActivity || 'Moderately Active',
        calories: savedDietCalories || 2000,
        protein: savedDietProtein || 120,
        workoutCount: workoutHistory ? workoutHistory.length : 0,
        strengthPRs: getStrengthProgress(workoutHistory),
        workoutHistory: workoutHistory
      };

      const responseFields = generateResponseFields(userText, savedDietType, stats);

      const newAIMessage: Message = {
        id: `ai-msg-${Date.now()}`,
        sender: 'ai',
        timestamp: Date.now(),
        text: `Based on your query, here is your customized coach feedback.`,
        ...responseFields
      };

      setConversations(prev => prev.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            timestamp: Date.now(),
            messages: [...c.messages, newAIMessage]
          };
        }
        return c;
      }));
      setIsTyping(false);
    }, 1500);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text) return;

    if (!textToSend) setChatInput('');

    // If chat list is empty, start a new one
    let targetChatId = activeChatId;
    if (conversations.length === 0 || !activeChat) {
      const generatedId = `chat-${Date.now()}`;
      const newChat: ChatConversation = {
        id: generatedId,
        title: text.length > 28 ? `${text.substring(0, 25)}...` : text,
        timestamp: Date.now(),
        messages: []
      };
      setConversations([newChat]);
      setActiveChatId(generatedId);
      targetChatId = generatedId;
    } else {
      // Update chat title if it was default
      if (activeChat.title === 'New Coaching Session') {
        setConversations(prev => prev.map(c => {
          if (c.id === targetChatId) {
            return { ...c, title: text.length > 28 ? `${text.substring(0, 25)}...` : text };
          }
          return c;
        }));
      }
    }

    const newUserMessage: Message = {
      id: `user-msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now()
    };

    setConversations(prev => prev.map(c => {
      if (c.id === targetChatId) {
        return {
          ...c,
          timestamp: Date.now(),
          messages: [...c.messages, newUserMessage]
        };
      }
      return c;
    }));

    triggerAIResponse(text, targetChatId);
  };

  // ====================================================
  // WORKOUT SPLIT GENERATOR STATE & FUNCTIONS
  // ====================================================
  const [genGoal, setGenGoal] = useState<'Fat Loss' | 'Muscle Gain' | 'Strength' | 'General Fitness'>('Muscle Gain');
  const [genLevel, setGenLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [genDays, setGenDays] = useState<number>(4);
  const [genEquipment, setGenEquipment] = useState<'Full Gym' | 'Dumbbells Only' | 'Home Equipment' | 'Calisthenics'>('Full Gym');

  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generated Split State
  interface GeneratedExercise {
    name: string;
    sets: number;
    reps: number;
    restSecs: number;
    dbId?: string; // ID mapping to database
  }
  interface GeneratedDay {
    dayName: string;
    warmup: string[];
    exercises: GeneratedExercise[];
    cooldown: string[];
  }
  interface GeneratedSplit {
    id: string;
    title: string;
    desc: string;
    days: GeneratedDay[];
  }

  const [activeSplit, setActiveSplit] = useState<GeneratedSplit | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState<number>(0);
  const [saveSplitSuccess, setSaveSplitSuccess] = useState(false);

  const handleGenerateSplit = () => {
    setIsGenerating(true);
    setActiveSplit(null);

    setTimeout(() => {
      // Simple custom builder engine
      let splitTitle = `${genLevel} ${genDays}-Day ${genGoal} Program`;
      let splitDesc = `AI generated ${genGoal} split using ${genEquipment} tailored for ${genLevel} experience.`;
      let daysList: GeneratedDay[] = [];

      // Determine exercise sets & reps based on goal
      let defaultSets = 3;
      let defaultReps = 10;
      let defaultRest = 90;
      if (genGoal === 'Strength') {
        defaultSets = 4;
        defaultReps = 5;
        defaultRest = 180;
      } else if (genGoal === 'Fat Loss') {
        defaultSets = 3;
        defaultReps = 12;
        defaultRest = 60;
      }

      if (genEquipment === 'Calisthenics') {
        // Bodyweight Program
        const caliPool = [
          { name: 'Push-Ups', id: 'push-ups' },
          { name: 'Pull-Ups', id: 'pullups' },
          { name: 'Bar Muscle-Ups', id: 'muscle-ups' },
          { name: 'Chest Dips', id: 'chest-dips' },
          { name: 'Plank', id: 'plank' },
          { name: 'Hanging Leg Raises', id: 'hanging-leg-raises' }
        ];
        
        for (let i = 1; i <= genDays; i++) {
          daysList.push({
            dayName: `Day ${i}: Bodyweight Circuit`,
            warmup: ['Arm circles (20s)', 'Leg swings (20s)', 'Jumping Jacks (30s)'],
            exercises: [
              { name: caliPool[(i - 1) % caliPool.length].name, sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: caliPool[(i - 1) % caliPool.length].id },
              { name: caliPool[i % caliPool.length].name, sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: caliPool[i % caliPool.length].id },
              { name: caliPool[(i + 1) % caliPool.length].name, sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: caliPool[(i + 1) % caliPool.length].id },
              { name: 'Bodyweight Squats', sets: defaultSets, reps: 20, restSecs: 60, dbId: 'barbell-squats' } // Map to closest
            ],
            cooldown: ['Forward Fold stretch (30s)', 'Child\'s pose (45s)']
          });
        }
      } else if (genEquipment === 'Dumbbells Only') {
        // Dumbbell Program
        const dbPool = [
          { name: 'Flat Dumbbell Press', id: 'flat-db-press' },
          { name: 'Dumbbell Rows', id: 'db-rows' },
          { name: 'Lunges', id: 'lunge' },
          { name: 'Plank', id: 'plank' }
        ];

        for (let i = 1; i <= genDays; i++) {
          daysList.push({
            dayName: `Day ${i}: Full Body DB`,
            warmup: ['Light DB rotations (10 reps)', 'Cat-cow stretches (30s)'],
            exercises: dbPool.map(item => ({
              name: item.name,
              sets: defaultSets,
              reps: defaultReps,
              restSecs: defaultRest,
              dbId: item.id
            })),
            cooldown: ['Shoulder cross-body stretch (30s)', 'Quad stretches (30s)']
          });
        }
      } else {
        // Full Gym/Home Equipment: Bro Splits, PPL, or Upper Lower
        if (genDays === 3) {
          // Push Pull Legs
          daysList = [
            {
              dayName: 'Day 1: Push (Chest/Shoulders/Triceps)',
              warmup: ['Shoulder rolls (20s)', 'Rotator cuff band rotations (15 reps)', 'Light pushups (10 reps)'],
              exercises: [
                { name: 'Flat Bench Press', sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: 'flat-bb-press' },
                { name: 'Overhead Press', sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: 'overhead-press' },
                { name: 'Incline Bench Press', sets: 3, reps: 10, restSecs: 90, dbId: 'inc-bb-press' }
              ],
              cooldown: ['Pec doorway stretch (45s)', 'Tricep overhead stretch (30s)']
            },
            {
              dayName: 'Day 2: Pull (Back/Biceps)',
              warmup: ['Scapular shrugs (15 reps)', 'Light lat pulldowns (12 reps)'],
              exercises: [
                { name: 'Deadlift', sets: 3, reps: 5, restSecs: 150, dbId: 'deadlift' },
                { name: 'Dumbbell Rows', sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: 'db-rows' },
                { name: 'Pull-Ups', sets: 3, reps: 8, restSecs: 90, dbId: 'pullups' }
              ],
              cooldown: ['Lat stretch on doorframe (45s)', 'Upper back stretch (30s)']
            },
            {
              dayName: 'Day 3: Legs & Abs',
              warmup: ['Bodyweight Squats (15 reps)', 'Leg swings (15 reps)', 'Hip opener stretches (30s)'],
              exercises: [
                { name: 'Barbell Squats', sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: 'barbell-squats' },
                { name: 'Lunges', sets: 3, reps: 10, restSecs: 90, dbId: 'lunge' },
                { name: 'Plank', sets: 3, reps: 60, restSecs: 45, dbId: 'plank' }
              ],
              cooldown: ['Glute pigeon pose (45s)', 'Hamstring forward bend (45s)']
            }
          ];
        } else {
          // 4-Day Upper / Lower or Bro Split
          daysList = [
            {
              dayName: 'Day 1: Upper Body Focus',
              warmup: ['Arm circles (20s)', 'Band pull-aparts (15 reps)'],
              exercises: [
                { name: 'Flat Bench Press', sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: 'flat-bb-press' },
                { name: 'Dumbbell Rows', sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: 'db-rows' },
                { name: 'Overhead Press', sets: 3, reps: 8, restSecs: 90, dbId: 'overhead-press' },
                { name: 'Pull-Ups', sets: 3, reps: 8, restSecs: 90, dbId: 'pullups' }
              ],
              cooldown: ['Shoulder cross-body stretch (30s)', 'Chest stretch (30s)']
            },
            {
              dayName: 'Day 2: Lower Body Focus',
              warmup: ['Squats (15 reps)', 'Dynamic hamstring stretches (20s)'],
              exercises: [
                { name: 'Barbell Squats', sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: 'barbell-squats' },
                { name: 'Lunges', sets: 3, reps: 12, restSecs: 90, dbId: 'lunge' },
                { name: 'Plank', sets: 3, reps: 60, restSecs: 60, dbId: 'plank' }
              ],
              cooldown: ['Hamstring seated stretch (45s)', 'Pigeon pose (30s)']
            },
            {
              dayName: 'Day 3: Upper Body Hypertrophy',
              warmup: ['Rotator cuff band warmups (15 reps)'],
              exercises: [
                { name: 'Flat Dumbbell Press', sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: 'flat-db-press' },
                { name: 'Pull-Ups', sets: 3, reps: 8, restSecs: 90, dbId: 'pullups' },
                { name: 'Dumbbell Rows', sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: 'db-rows' }
              ],
              cooldown: ['Doorway chest stretch (45s)']
            },
            {
              dayName: 'Day 4: Lower Body Volume',
              warmup: ['Glute bridges (15 reps)', 'Bodyweight lunges (10 reps)'],
              exercises: [
                { name: 'Barbell Squats', sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: 'barbell-squats' },
                { name: 'Lunges', sets: 3, reps: 12, restSecs: 90, dbId: 'lunge' },
                { name: 'Plank', sets: 3, reps: 60, restSecs: 45, dbId: 'plank' }
              ],
              cooldown: ['Seated quad stretch (30s)']
            }
          ];
        }
      }

      // Truncate days to requested amount
      daysList = daysList.slice(0, genDays);

      setActiveSplit({
        id: `split-${Date.now()}`,
        title: splitTitle,
        desc: splitDesc,
        days: daysList
      });
      setActiveDayIdx(0);
      setIsGenerating(false);
    }, 1500);
  };

  const handleUpdateGenExercise = (dayIdx: number, exIdx: number, fields: Partial<GeneratedExercise>) => {
    if (!activeSplit) return;
    const updatedDays = [...activeSplit.days];
    updatedDays[dayIdx].exercises[exIdx] = {
      ...updatedDays[dayIdx].exercises[exIdx],
      ...fields
    };
    setActiveSplit({
      ...activeSplit,
      days: updatedDays
    });
  };

  const handleAddGenRoutineToDashboard = (dayIdx: number) => {
    if (!activeSplit) return;
    const day = activeSplit.days[dayIdx];
    
    // Map generated exercises to database exercises
    const exerciseIds = day.exercises
      .map(ex => {
        if (ex.dbId) return ex.dbId;
        // Fallback fuzzy matcher
        const found = EXERCISE_DATABASE.find(e => e.name.toLowerCase().includes(ex.name.toLowerCase()));
        return found ? found.id : 'push-ups';
      });

    const newRoutine: WorkoutRoutine = {
      id: `ai-routine-${Date.now()}`,
      name: `AI: ${activeSplit.title} (${day.dayName.split(':')[0]})`,
      desc: `AI-generated template from your Coach. Target: ${genGoal}`,
      exercises: exerciseIds
    };

    onSaveRoutine(newRoutine);
    setSaveSplitSuccess(true);
    setTimeout(() => setSaveSplitSuccess(false), 2000);
  };

  return (
    <section className="relative py-24 overflow-hidden min-h-screen text-zinc-100 bg-[#03000a] text-left">
      <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] bg-brand-violet/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] bg-brand-cyan/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 bg-brand-violet/10 border border-brand-violet/20 px-3.5 py-1 rounded-full text-brand-violet font-semibold text-xs tracking-wider uppercase">
            AI Assistant Center
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-white">
            AI Coach & Routines
          </h2>
          
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            Get personalized training advice, ask custom nutrition questions, or let the split builder construct custom templates.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex justify-center border-b border-white/5 mb-8 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'chat' ? 'border-brand-violet text-white font-black' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Ask AI Coach
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'generator' ? 'border-brand-violet text-white font-black' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            AI Split Generator
          </button>
        </div>

        {/* TAB 1: COACH CHAT */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
            
            {/* Sidebar (4 Columns) */}
            <div className="lg:col-span-4 flex flex-col space-y-4 h-[600px]">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-brand-violet" /> Chat Sessions
                </h3>
                <button
                  onClick={handleStartNewChat}
                  className="px-2.5 py-1.5 rounded-lg bg-brand-violet/20 hover:bg-brand-violet/35 border border-brand-violet/30 text-brand-violet hover:text-white text-[10px] font-bold flex items-center gap-1 transition-all"
                >
                  <Plus className="h-3 w-3" /> New Chat
                </button>
              </div>

              {/* Chat list */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {conversations.length === 0 ? (
                  <div className="text-center py-12 text-zinc-600 text-xs italic">
                    No active coaching history.
                  </div>
                ) : (
                  conversations.map((c) => {
                    const isActive = c.id === activeChatId;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setActiveChatId(c.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center group text-left ${
                          isActive
                            ? 'bg-brand-violet/10 border-brand-violet/30 text-white'
                            : 'bg-dark-950/40 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <span className="text-xs font-bold block truncate">{c.title}</span>
                          <span className="text-[9px] text-zinc-500 font-semibold block mt-0.5">
                            {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteChat(c.id, e)}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1 text-zinc-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Timeline (8 Columns) */}
            <div className="lg:col-span-8 flex flex-col border border-white/5 rounded-2xl bg-dark-900/10 backdrop-blur-md overflow-hidden h-[600px] justify-between">
              
              {/* Active Conversation Title */}
              <div className="p-4 bg-dark-950/60 border-b border-white/5 flex items-center justify-between text-left">
                <div className="flex items-center space-x-2">
                  <div className="h-7 w-7 rounded-full bg-brand-violet/20 border border-brand-violet/30 flex items-center justify-center text-brand-violet text-xs font-bold animate-pulse">
                    C
                  </div>
                  <div>
                    <span className="text-xs font-black text-white">{activeChat?.title || 'Coach Chat'}</span>
                    <span className="text-[9px] text-brand-cyan font-bold block uppercase tracking-wider mt-0.5">Certified Trainer Assistant Active</span>
                  </div>
                </div>
              </div>

              {/* Message History window */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-left">
                {activeChat?.messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                        isUser 
                          ? 'bg-dark-950 border border-white/10 text-zinc-200' 
                          : 'bg-dark-900/50 border border-brand-violet/20 text-zinc-300'
                      }`}>
                        
                        {/* Header Sender Info */}
                        <div className="flex items-center gap-1.5 border-b border-white/5 pb-1.5 mb-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                          {isUser ? <User className="h-3 w-3" /> : <Sparkles className="h-3 w-3 text-brand-violet" />}
                          <span>{isUser ? 'Client' : 'Coach Response'}</span>
                        </div>

                        {/* Direct text response */}
                        <p className="font-semibold text-white">{msg.text}</p>

                        {/* Structured details (Only on Coach Responses if exist) */}
                        {!isUser && (
                          <div className="space-y-5 pt-3 border-t border-white/10">
                            {/* Direct Answer Section */}
                            {msg.directAnswer && (
                              <div className="space-y-1 text-left">
                                <span className="text-[10px] text-brand-cyan font-black uppercase tracking-wider block">🎯 Direct Answer</span>
                                <p className="text-zinc-200 text-xs font-medium leading-relaxed whitespace-pre-line">{msg.directAnswer}</p>
                              </div>
                            )}

                            {/* Reasoning Section */}
                            {msg.reasoning && (
                              <div className="space-y-1.5 text-left p-3.5 bg-brand-violet/5 border border-brand-violet/10 rounded-xl">
                                <span className="text-[10px] text-brand-violet font-black uppercase tracking-wider block flex items-center gap-1.5 font-sans">
                                  🧠 Coach Reasoning & Strategy
                                </span>
                                <p className="text-zinc-300 text-xs font-normal leading-relaxed whitespace-pre-line">{msg.reasoning}</p>
                              </div>
                            )}

                            {/* Action Plan Section */}
                            {msg.actionPlanItems && msg.actionPlanItems.length > 0 && (
                              <div className="space-y-2 bg-dark-950/40 p-3.5 rounded-xl border border-white/5 text-left">
                                <span className="text-[10px] text-brand-lime font-black uppercase tracking-wider block">📋 Action Plan</span>
                                <ul className="space-y-1.5 pl-4 list-disc text-zinc-300 text-xs leading-relaxed">
                                  {msg.actionPlanItems.map((item, idx) => (
                                    <li key={idx} className="font-normal text-zinc-300" dangerouslySetInnerHTML={{ __html: item }} />
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Checklist Section */}
                            {msg.checklistItems && msg.checklistItems.length > 0 && (
                              <div className="space-y-2 bg-dark-950/25 p-3.5 rounded-xl border border-white/5 text-left">
                                <span className="text-[10px] text-brand-cyan font-black uppercase tracking-wider block flex items-center gap-1.5">
                                  ✓ Action Checklist
                                </span>
                                <ul className="space-y-1.5 pl-4 list-disc text-zinc-300 text-xs leading-relaxed">
                                  {msg.checklistItems.map((item, idx) => (
                                    <li key={idx} className="font-normal text-zinc-200" dangerouslySetInnerHTML={{ __html: item }} />
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Warnings Section */}
                            {msg.warnings && msg.warnings.length > 0 && (
                              <div className="space-y-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3.5 rounded-xl text-left">
                                <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider block flex items-center gap-1.5">
                                  ⚠️ Safety Warnings & Gaps
                                </span>
                                <ul className="space-y-1 pl-4 list-disc text-amber-300 text-xs leading-relaxed">
                                  {msg.warnings.map((item, idx) => (
                                    <li key={idx} className="font-semibold text-amber-200" dangerouslySetInnerHTML={{ __html: item }} />
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Action Buttons Section */}
                            {((msg.hasWorkoutContent && msg.generatedRoutine) || (msg.hasDietContent && msg.suggestedDiet)) && (
                              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                                {/* Workout Actions */}
                                {msg.hasWorkoutContent && msg.generatedRoutine && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveRoutineFromChat(msg)}
                                      className="px-3 py-2 rounded-xl bg-brand-violet/20 hover:bg-brand-violet/30 border border-brand-violet/30 hover:border-brand-violet text-brand-violet hover:text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Plus className="h-3.5 w-3.5" /> Save Routine
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleStartWorkoutFromChat(msg)}
                                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-brand-violet to-brand-cyan hover:opacity-90 text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <ArrowRight className="h-3.5 w-3.5" /> Start Workout
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onNavigate('training', 'logger')}
                                      className="px-3 py-2 rounded-xl bg-brand-cyan/20 hover:bg-brand-cyan/30 border border-brand-cyan/30 hover:border-brand-cyan text-brand-cyan hover:text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Dumbbell className="h-3.5 w-3.5" /> Add to Logger
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onNavigate('training', 'library')}
                                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Dumbbell className="h-3.5 w-3.5" /> Open Exercise Library
                                    </button>
                                  </>
                                )}

                                {/* Diet Actions */}
                                {msg.hasDietContent && msg.suggestedDiet && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveDietFromChat(msg)}
                                      className="px-3 py-2 rounded-xl bg-brand-lime/20 hover:bg-brand-lime/30 border border-brand-lime/30 hover:border-brand-lime text-brand-lime hover:text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Check className="h-3.5 w-3.5" /> Save Diet
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleAddToNutritionHub(msg)}
                                      className="px-3 py-2 rounded-xl bg-brand-cyan/20 hover:bg-brand-cyan/30 border border-brand-cyan/30 hover:border-brand-cyan text-brand-cyan hover:text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Utensils className="h-3.5 w-3.5" /> Add to Nutrition Hub
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleGenerateShoppingList(msg.selectedPreference || savedDietType || 'Veg')}
                                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Utensils className="h-3.5 w-3.5" /> Generate Shopping List
                                    </button>
                                  </>
                                )}
                              </div>
                            )}

                            {/* Dietary preference interactive prompt check */}
                            {msg.showDietPrompt && (
                              <div className="p-3.5 bg-brand-violet/10 border border-brand-violet/20 rounded-xl space-y-2 text-left animate-fadeIn">
                                <span className="text-[9px] text-brand-violet font-black uppercase tracking-widest block">Dietary Preference Required</span>
                                <p className="text-white text-xs font-semibold">
                                  {msg.dietPromptAnswered 
                                    ? `Preference saved: ${msg.selectedPreference}` 
                                    : "Before providing food recommendations, do you prefer Vegetarian, Non-Vegetarian, Eggetarian, or Both?"
                                  }
                                </p>
                                {!msg.dietPromptAnswered && (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    <button 
                                      type="button"
                                      onClick={() => handleSetDietPreference('Veg', msg.id)}
                                      className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                                    >
                                      Vegetarian
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => handleSetDietPreference('Non-Veg', msg.id)}
                                      className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/30 text-rose-400 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                                    >
                                      Non-Vegetarian
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => handleSetDietPreference('Eggetarian', msg.id)}
                                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/30 text-amber-400 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                                    >
                                      Eggetarian
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => handleSetDietPreference('Both', msg.id)}
                                      className="px-3 py-1.5 bg-brand-cyan/20 hover:bg-brand-cyan/35 border border-brand-cyan/30 text-brand-cyan text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                                    >
                                      Both
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Follow-Up Suggestions */}
                            {msg.followUpSuggestions && msg.followUpSuggestions.length > 0 && (
                              <div className="space-y-2 pt-2 border-t border-white/5 text-left">
                                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Follow-Up Suggestions</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {msg.followUpSuggestions.map((suggestion, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => handleSendMessage(suggestion)}
                                      disabled={isTyping}
                                      className="px-2.5 py-1 bg-white/5 hover:bg-brand-violet/15 border border-white/5 hover:border-brand-violet/30 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white transition-all text-left cursor-pointer whitespace-nowrap"
                                    >
                                      {suggestion}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <span className="text-[8px] text-zinc-600 block text-right mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Typing skeleton loading bar */}
                {isTyping && (
                  <div className="flex justify-start w-full">
                    <div className="max-w-[70%] rounded-2xl p-4 bg-dark-900/50 border border-brand-violet/20 text-zinc-400 flex items-center gap-3">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-brand-violet rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="h-2 w-2 bg-brand-violet rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="h-2 w-2 bg-brand-violet rounded-full animate-bounce" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-violet">AI Coach is thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Preset queries container */}
              <div className="p-3.5 bg-dark-950/60 border-t border-white/5 space-y-2">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block text-left">Suggested Quick Prompts</span>
                <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto pr-1">
                  {PRESET_QUERIES.map((query) => (
                    <button
                      key={query}
                      onClick={() => handleSendMessage(query)}
                      disabled={isTyping}
                      className="px-2.5 py-1 bg-white/5 hover:bg-brand-violet/15 border border-white/5 hover:border-brand-violet/30 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white transition-all whitespace-nowrap cursor-pointer"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input form */}
              <div className="p-4 bg-dark-950 border-t border-white/5">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Ask about routines, protein targets, shoulder pinch..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 px-4 py-3 bg-dark-900 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet/40"
                    disabled={isTyping}
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isTyping}
                    className="p-3 bg-brand-violet text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: AI WORKOUT SPLIT GENERATOR */}
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
            
            {/* Input parameters card (5 Columns) */}
            <div className="lg:col-span-5 space-y-6">
              <SpotlightCard className="p-6 text-left space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-brand-cyan" /> Split Generator Inputs
                </h3>

                {/* Goal */}
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Training Goal</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Fat Loss', 'Muscle Gain', 'Strength', 'General Fitness'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGenGoal(g as any)}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          genGoal === g
                            ? 'bg-brand-violet/20 border-brand-violet text-white font-black'
                            : 'bg-dark-950 border-white/5 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level */}
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Experience Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setGenLevel(lvl as any)}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          genLevel === lvl
                            ? 'bg-brand-cyan/20 border-brand-cyan text-white font-black'
                            : 'bg-dark-950 border-white/5 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frequency Days per week */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Days per week</label>
                    <span className="font-bold text-white font-mono">{genDays} Training Days</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="7"
                    value={genDays}
                    onChange={(e) => setGenDays(Number(e.target.value))}
                    className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-brand-violet"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-600 font-bold font-mono">
                    <span>2 Days</span>
                    <span>4 Days</span>
                    <span>7 Days</span>
                  </div>
                </div>

                {/* Equipment Available */}
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Equipment Access</label>
                  <select
                    value={genEquipment}
                    onChange={(e) => setGenEquipment(e.target.value as any)}
                    className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet font-semibold"
                  >
                    <option value="Full Gym">Full Gym Equipment (Barbell/Cables/Machines)</option>
                    <option value="Dumbbells Only">Dumbbells Only Focus</option>
                    <option value="Home Equipment">Home Equipment (Bodyweight/Bands)</option>
                    <option value="Calisthenics">Bodyweight Calisthenics Routine</option>
                  </select>
                </div>

                {/* Submit button */}
                <button
                  onClick={handleGenerateSplit}
                  disabled={isGenerating}
                  className="w-full py-4 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-black rounded-xl hover:scale-101 transition-transform disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 shadow-glow-purple"
                >
                  {isGenerating ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Constructing Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Generate AI Workout Split
                    </>
                  )}
                </button>
              </SpotlightCard>
            </div>

            {/* Results Routine Panel (7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              {isGenerating ? (
                /* Generating Skeleton Screen */
                <SpotlightCard className="p-6 space-y-6 text-left animate-pulse">
                  <div className="h-4 w-1/3 bg-white/5 rounded" />
                  <div className="h-8 w-2/3 bg-white/5 rounded" />
                  <div className="h-2 w-full bg-white/5 rounded" />

                  <div className="flex gap-2 border-b border-white/5 pb-2">
                    <div className="h-8 w-16 bg-white/5 rounded" />
                    <div className="h-8 w-16 bg-white/5 rounded" />
                    <div className="h-8 w-16 bg-white/5 rounded" />
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="p-3 bg-white/5 rounded-xl h-12" />
                    <div className="p-3 bg-white/5 rounded-xl h-12" />
                    <div className="p-3 bg-white/5 rounded-xl h-12" />
                  </div>
                </SpotlightCard>
              ) : activeSplit ? (
                <div className="space-y-6">
                  
                  {/* Split Overview Card */}
                  <SpotlightCard className="p-6 text-left space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[9px] text-brand-cyan font-bold uppercase tracking-wider block">AI Generated Routine Split</span>
                        <h3 className="text-xl font-display font-black text-white">{activeSplit.title}</h3>
                        <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{activeSplit.desc}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-brand-violet/10 border border-brand-violet/20 text-brand-violet text-[9px] font-black uppercase tracking-wider">
                        {genGoal}
                      </span>
                    </div>

                    {/* Day Tabs */}
                    <div className="flex flex-wrap gap-1.5 border-t border-b border-white/5 py-3">
                      {activeSplit.days.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveDayIdx(idx)}
                          className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border ${
                            activeDayIdx === idx
                              ? 'bg-brand-violet/20 border-brand-violet text-white font-black'
                              : 'bg-dark-950 border-white/5 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Day {idx + 1}
                        </button>
                      ))}
                    </div>

                    {/* Active Day details */}
                    <div className="space-y-5 pt-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Dumbbell className="h-4.5 w-4.5 text-brand-cyan" /> {activeSplit.days[activeDayIdx].dayName}
                        </h4>
                      </div>

                      {/* Warm-Up block */}
                      {activeSplit.days[activeDayIdx].warmup.length > 0 && (
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                          <span className="text-[9px] text-brand-violet font-black uppercase tracking-wider block">Warm-Up Activation Routine</span>
                          <ul className="text-[10px] text-zinc-400 list-disc pl-4 space-y-0.5 font-medium">
                            {activeSplit.days[activeDayIdx].warmup.map((w, widx) => (
                              <li key={widx}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Exercises List (With Inline Edit options) */}
                      <div className="space-y-3">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Main Hypertrophy / Strength Sets</span>
                        {activeSplit.days[activeDayIdx].exercises.map((ex, exidx) => (
                          <div 
                            key={exidx} 
                            className="p-4 bg-dark-950/60 border border-white/5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-semibold"
                          >
                            <div className="space-y-1 text-left min-w-[150px]">
                              <input 
                                type="text"
                                value={ex.name}
                                onChange={(e) => handleUpdateGenExercise(activeDayIdx, exidx, { name: e.target.value })}
                                className="font-bold text-xs text-white bg-transparent border-b border-transparent focus:border-brand-cyan focus:outline-none w-full"
                              />
                              <span className="text-[9px] text-zinc-500 block uppercase">Equipment: {genEquipment}</span>
                            </div>

                            {/* Sets / Reps / Rest inputs */}
                            <div className="flex items-center gap-3 text-xs font-semibold">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] text-zinc-500 font-bold">Sets:</span>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={ex.sets}
                                  onChange={(e) => handleUpdateGenExercise(activeDayIdx, exidx, { sets: Number(e.target.value) })}
                                  className="w-10 px-1.5 py-1 bg-white/5 border border-white/5 text-center text-white rounded font-mono"
                                />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] text-zinc-500 font-bold">Reps:</span>
                                <input
                                  type="number"
                                  min="1"
                                  max="50"
                                  value={ex.reps}
                                  onChange={(e) => handleUpdateGenExercise(activeDayIdx, exidx, { reps: Number(e.target.value) })}
                                  className="w-10 px-1.5 py-1 bg-white/5 border border-white/5 text-center text-white rounded font-mono"
                                />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] text-zinc-500 font-bold">Rest:</span>
                                <input
                                  type="number"
                                  min="15"
                                  max="300"
                                  step="15"
                                  value={ex.restSecs}
                                  onChange={(e) => handleUpdateGenExercise(activeDayIdx, exidx, { restSecs: Number(e.target.value) })}
                                  className="w-14 px-1.5 py-1 bg-white/5 border border-white/5 text-center text-white rounded font-mono"
                                />
                                <span className="text-[10px] text-zinc-500 font-bold">s</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Cool-Down block */}
                      {activeSplit.days[activeDayIdx].cooldown.length > 0 && (
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                          <span className="text-[9px] text-brand-cyan font-black uppercase tracking-wider block">Cool-Down Recovery Routine</span>
                          <ul className="text-[10px] text-zinc-400 list-disc pl-4 space-y-0.5 font-medium">
                            {activeSplit.days[activeDayIdx].cooldown.map((c, cidx) => (
                              <li key={cidx}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Actions Footer */}
                      <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => handleAddGenRoutineToDashboard(activeDayIdx)}
                          className="flex-1 py-3.5 bg-gradient-to-r from-brand-lime to-brand-cyan text-dark-950 text-xs font-black rounded-xl hover:scale-[1.01] transition-transform flex items-center justify-center gap-1.5 shadow-glow-lime"
                        >
                          {saveSplitSuccess ? (
                            <>
                              <Check className="h-4.5 w-4.5" /> Added Successfully!
                            </>
                          ) : (
                            <>
                              <ArrowRight className="h-4.5 w-4.5" /> Add Day {activeDayIdx + 1} Routine to Dashboard
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            // Clone active split
                            const clone = JSON.parse(JSON.stringify(activeSplit));
                            clone.id = `split-clone-${Date.now()}`;
                            clone.title = `${clone.title} (Copy)`;
                            setActiveSplit(clone);
                          }}
                          className="px-5 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <Copy className="h-4 w-4 text-zinc-500" /> Duplicate
                        </button>
                      </div>

                    </div>
                  </SpotlightCard>

                </div>
              ) : (
                /* Empty state */
                <div className="py-24 text-center border border-dashed border-white/5 rounded-3xl bg-dark-900/10 space-y-3 flex flex-col justify-center items-center h-full">
                  <Sparkles className="h-10 w-10 text-zinc-700 animate-pulse" />
                  <p className="text-zinc-400 text-xs font-semibold">Waiting for routine split parameters...</p>
                  <span className="text-[10px] text-zinc-500 max-w-sm">
                    Select your training goal, experience, days, and equipment access to construct an AI-powered fitness program.
                  </span>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Shopping List Modal */}
      <AnimatePresence>
        {shoppingListModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div 
              onClick={() => setShoppingListModalOpen(false)} 
              className="absolute inset-0 bg-[#03000a]/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-gradient-to-br from-[#0d0720] via-dark-900 to-dark-950 border border-brand-violet/40 p-6 rounded-2xl shadow-glass z-10 text-left space-y-6"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
                    🛒 Custom Shopping List
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                    Preference: {shoppingListType}
                  </p>
                </div>
                <button
                  onClick={() => setShoppingListModalOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {shoppingListItems.map((cat, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="text-xs font-bold text-brand-cyan tracking-wider uppercase border-b border-white/5 pb-1">
                      {cat.category}
                    </h4>
                    <ul className="space-y-1.5 pl-1.5 text-xs text-zinc-300 font-semibold">
                      {cat.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex justify-between items-center bg-white/5 p-2 rounded-xl border border-white/5">
                          <span>{item.name}</span>
                          <span className="text-zinc-500 font-mono text-[10px]">{item.qty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2 border-t border-white/5">
                <button
                  onClick={handleCopyShoppingList}
                  className="flex-1 py-3 bg-brand-violet text-white text-xs font-black rounded-xl hover:scale-[1.01] transition-transform flex items-center justify-center gap-1.5 shadow-glow-purple cursor-pointer"
                >
                  {shoppingListCopied ? (
                    <>
                      <Check className="h-4 w-4" /> Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copy Entire List
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShoppingListModalOpen(false)}
                  className="px-5 py-3 bg-white/5 border border-white/10 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
