import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Brain, Award, Flame, Dumbbell, 
  Apple, ChevronRight, Activity, RotateCcw
} from 'lucide-react';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

type OnboardingData = {
  age: number;
  gender: string;
  weight: number; // in kg
  height: number; // in cm
  goal: string;
  level: string;
};

const LOADING_PHASES = [
  "Analyzing biological constraints and weight metrics...",
  "Calculating basal metabolic rate (BMR) & daily calorie thresholds...",
  "Structuring custom resistance training splits...",
  "Optimizing protein, fat, and carb ratios (macronutrient balance)...",
  "Tailoring progressive overload parameters and recovery cycles...",
  "Finalizing your premium FitAI custom dashboard..."
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: form, 2: loader, 3: dashboard
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>({
    age: 26,
    gender: 'Male',
    weight: 74,
    height: 178,
    goal: 'Gain Muscle',
    level: 'Intermediate'
  });

  // Calculate BMI
  const heightInMeters = formData.height / 100;
  const bmi = parseFloat((formData.weight / (heightInMeters * heightInMeters)).toFixed(1));

  // Determine BMI category
  let bmiCategory = 'Normal';
  let bmiColor = 'text-brand-lime border-brand-lime/20 bg-brand-lime/10';
  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = 'text-brand-cyan border-brand-cyan/20 bg-brand-cyan/10';
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'Overweight';
    bmiColor = 'text-amber-400 border-amber-400/20 bg-amber-400/10';
  } else if (bmi >= 30) {
    bmiCategory = 'Obese';
    bmiColor = 'text-red-400 border-red-400/20 bg-red-400/10';
  }

  // Handle phase loading animation
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (step === 2) {
      setCurrentPhaseIdx(0);
      const interval = setInterval(() => {
        setCurrentPhaseIdx((prev) => {
          if (prev >= LOADING_PHASES.length - 1) {
            clearInterval(interval);
            timer = setTimeout(() => setStep(3), 1000);
            return prev;
          }
          return prev + 1;
        });
      }, 900);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [step]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleReset = () => {
    setStep(1);
  };

  // Generate Personalized Recommendations
  const getAiDiet = () => {
    const isLose = formData.goal === 'Lose Weight';
    const isMuscle = formData.goal === 'Gain Muscle';
    const isStrength = formData.goal === 'Build Strength';
    
    let calories = 2000;
    if (isLose) calories = Math.round((formData.weight * 22) - 400);
    else if (isMuscle) calories = Math.round((formData.weight * 24) + 350);
    else if (isStrength) calories = Math.round((formData.weight * 23) + 150);
    else calories = Math.round(formData.weight * 22); // endurance / health

    const protein = Math.round(formData.weight * 2.0); // 2g per kg
    const fat = Math.round((calories * 0.25) / 9); // 25% of calories
    const carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4);

    return { calories, protein, carbs, fat };
  };

  const getAiWorkout = () => {
    switch (formData.goal) {
      case 'Lose Weight':
        return {
          title: "HIIT & Fat Oxidation Split",
          frequency: "4 days / week",
          duration: "45 mins",
          focus: "Cardio conditioning + compound lifts at 65% 1RM for metabolic burnout",
          routine: [
            { day: "Day 1", routine: "Lower Body Push + Metabolic Conditioning Circuits" },
            { day: "Day 2", routine: "Upper Body Pull + Core Stability & Intervals" },
            { day: "Day 3", routine: "Active Recovery (Yoga, Mobility & Zone 2 Cardio)" },
            { day: "Day 4", routine: "Full-Body Strength HIIT Blast (High Heart Rate Focus)" }
          ]
        };
      case 'Gain Muscle':
        return {
          title: "PPL (Push-Pull-Legs) Hypertrophy Program",
          frequency: "5 days / week",
          duration: "60 mins",
          focus: "Mechanical tension + high training volume (8-12 rep ranges) with progressive overload",
          routine: [
            { day: "Day 1", routine: "Push (Chest, Shoulders & Triceps) - Focus Bench & Overhead press" },
            { day: "Day 2", routine: "Pull (Back, Rear Delts & Biceps) - Focus Deadlifts & Rows" },
            { day: "Day 3", routine: "Legs (Quads, Hamstrings & Calves) - Focus Squats & Leg Press" },
            { day: "Day 4", routine: "Upper Body Hypertrophy (Pump & Accessory Focus)" },
            { day: "Day 5", routine: "Lower Body Quad/Posterior Chain Split Volume" }
          ]
        };
      case 'Build Strength':
        return {
          title: "5x5 Linear Strength Adaptation Protocol",
          frequency: "3 days / week",
          duration: "75 mins",
          focus: "High neurological loading + low volume (3-5 rep ranges) centered on core compound barbell movements",
          routine: [
            { day: "Day 1", routine: "Squat (5x5), Bench Press (5x5), Barbell Row (5x5)" },
            { day: "Day 2", routine: "Squat (5x5), Overhead Press (5x5), Deadlift (1x5)" },
            { day: "Day 3", routine: "Squat (5x5), Bench Press (5x5), Barbell Row (5x5) - Increment Weights" }
          ]
        };
      default:
        return {
          title: "Full-Body Conditioning & Core Performance",
          frequency: "4 days / week",
          duration: "50 mins",
          focus: "Cardiovascular stamina, core stability, and agility-based athletic circuits",
          routine: [
            { day: "Day 1", routine: "Functional Movements + Agility Ladder Workouts" },
            { day: "Day 2", routine: "Posterior Chain Force + Core Anti-rotation Circuits" },
            { day: "Day 3", routine: "Aerobic Threshold Runs (30-40 mins Zone 3/4)" },
            { day: "Day 4", routine: "Unilateral Dumbbell Conditioning + Calisthenics" }
          ]
        };
    }
  };

  const diet = getAiDiet();
  const workout = getAiWorkout();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-dark-950/80 backdrop-blur-xl"
      />

      {/* Modal Box */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-dark-900 border border-white/10 rounded-2xl shadow-glass overflow-hidden z-10 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-dark-950/50">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-brand-violet" />
            <span className="font-display font-bold text-lg text-white">FitAI Core Intelligence</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: FORM INPUT */}
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-left space-y-2">
                <h2 className="text-2xl font-display font-extrabold text-white">Synthesize Your Personal Protocol</h2>
                <p className="text-zinc-400 text-sm">Provide your biological traits and workout targets, and let FitAI calculate your optimal fitness program.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Age */}
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Age (Years)</label>
                  <input 
                    type="number" 
                    min="12" 
                    max="100" 
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || 20})}
                    className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-white focus:outline-none focus:border-brand-violet transition-colors"
                    required
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Gender</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-white focus:outline-none focus:border-brand-violet transition-colors"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Weight */}
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Weight (kg)</label>
                  <input 
                    type="number" 
                    min="30" 
                    max="250"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value) || 70})}
                    className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-white focus:outline-none focus:border-brand-violet transition-colors"
                    required
                  />
                </div>

                {/* Height */}
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Height (cm)</label>
                  <input 
                    type="number" 
                    min="100" 
                    max="250"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: parseInt(e.target.value) || 170})}
                    className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-white focus:outline-none focus:border-brand-violet transition-colors"
                    required
                  />
                </div>

                {/* Goal */}
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Fitness Goal</label>
                  <select 
                    value={formData.goal}
                    onChange={(e) => setFormData({...formData, goal: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-white focus:outline-none focus:border-brand-violet transition-colors"
                  >
                    <option value="Gain Muscle">Gain Muscle / Bulking</option>
                    <option value="Lose Weight">Lose Weight / Fat Loss</option>
                    <option value="Build Strength">Build Power & Strength</option>
                    <option value="Improve Stamina">Improve Cardiovascular Endurance</option>
                  </select>
                </div>

                {/* Level */}
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Experience Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setFormData({...formData, level: lvl})}
                        className={`py-3 text-xs font-bold rounded-xl border transition-all ${
                          formData.level === lvl 
                            ? 'bg-brand-violet/20 border-brand-violet text-white shadow-glow-purple' 
                            : 'bg-dark-950 border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-sm font-bold rounded-xl shadow-glow-purple hover:scale-[1.01] transition-transform flex items-center gap-2"
                >
                  Generate Plan <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: LOAD SCREEN */}
          {step === 2 && (
            <div className="py-20 flex flex-col items-center justify-center space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-violet rounded-full blur-[30px] opacity-40 animate-pulse" />
                <div className="relative p-6 bg-dark-950 border border-brand-violet/40 rounded-full animate-spin-slow">
                  <Activity className="h-12 w-12 text-brand-cyan" />
                </div>
              </div>

              <div className="space-y-2 max-w-md text-center">
                <h3 className="text-xl font-display font-extrabold text-white">Synthesizing Protocol...</h3>
                <p className="text-brand-violet text-sm font-semibold animate-pulse h-12">
                  {LOADING_PHASES[currentPhaseIdx]}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 5, ease: 'easeInOut' }}
                  className="h-full bg-gradient-to-r from-brand-violet to-brand-cyan"
                />
              </div>
            </div>
          )}

          {/* STEP 3: DASHBOARD */}
          {step === 3 && (
            <div className="space-y-8 text-left">
              {/* Header Profile Dashboard */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-brand-violet/20 border border-brand-violet/30 rounded-xl text-brand-violet">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-extrabold text-white">Athlete Profile Configured</h3>
                    <p className="text-xs text-zinc-400">Genetics Match: Optimal Performance Engine Activated</p>
                  </div>
                </div>

                {/* Biological Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-dark-950 border border-white/5 rounded-full text-xs text-zinc-300 font-medium">
                    Age: {formData.age}
                  </span>
                  <span className="px-3 py-1 bg-dark-950 border border-white/5 rounded-full text-xs text-zinc-300 font-medium">
                    Weight: {formData.weight}kg
                  </span>
                  <span className="px-3 py-1 bg-dark-950 border border-white/5 rounded-full text-xs text-zinc-300 font-medium">
                    Height: {formData.height}cm
                  </span>
                  <span className={`px-3 py-1 border rounded-full text-xs font-semibold ${bmiColor}`}>
                    BMI: {bmi} ({bmiCategory})
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Diet and Macronutrients (Left Side) */}
                <div className="md:col-span-5 p-6 bg-dark-950 border border-white/5 rounded-2xl space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Apple className="h-5 w-5 text-brand-cyan" />
                      <h4 className="font-display font-bold text-white">Macronutrient Target</h4>
                    </div>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">AI Synced</span>
                  </div>

                  <div className="text-center py-4 bg-white/5 border border-white/5 rounded-xl">
                    <span className="text-3xl font-display font-black text-white">{diet.calories}</span>
                    <span className="text-xs text-zinc-400 font-bold block mt-1 uppercase tracking-widest">Target Daily Kcal</span>
                  </div>

                  {/* Macros Progress Bars */}
                  <div className="space-y-4">
                    {/* Protein */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-zinc-300">Protein (2.0g/kg)</span>
                        <span className="text-brand-violet">{diet.protein}g</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-violet rounded-full" style={{ width: '40%' }} />
                      </div>
                    </div>

                    {/* Carbs */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-zinc-300">Carbohydrates</span>
                        <span className="text-brand-cyan">{diet.carbs}g</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-cyan rounded-full" style={{ width: '45%' }} />
                      </div>
                    </div>

                    {/* Fat */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-zinc-300">Fats (Essential Fats)</span>
                        <span className="text-brand-pink">{diet.fat}g</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-pink rounded-full" style={{ width: '15%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Metabolic tip */}
                  <div className="p-3.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl text-xs text-zinc-300 leading-relaxed flex items-start gap-2">
                    <Flame className="h-4 w-4 text-brand-cyan shrink-0 mt-0.5" />
                    <span>Metabolic advice: Drink 3.5 liters of water daily to match the dynamic nutrient partition. Consume 30g of protein within 1 hour post-workout.</span>
                  </div>
                </div>

                {/* Workout routine (Right Side) */}
                <div className="md:col-span-7 p-6 bg-dark-950 border border-white/5 rounded-2xl space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Dumbbell className="h-5 w-5 text-brand-violet" />
                      <h4 className="font-display font-bold text-white">Custom Workout Cycle</h4>
                    </div>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{formData.level}</span>
                  </div>

                  {/* Workout Title Card */}
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
                    <h5 className="font-display font-extrabold text-brand-violet text-lg">{workout.title}</h5>
                    <div className="flex items-center space-x-4 text-xs font-semibold text-zinc-400">
                      <span>Frequency: <span className="text-white">{workout.frequency}</span></span>
                      <span>•</span>
                      <span>Avg Duration: <span className="text-white">{workout.duration}</span></span>
                    </div>
                    <p className="text-xs text-zinc-500 italic mt-2">Focus: {workout.focus}</p>
                  </div>

                  {/* Routine Days timeline */}
                  <div className="space-y-3">
                    {workout.routine.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-3 bg-dark-900 border border-white/5 rounded-xl">
                        <span className="px-2 py-1 bg-brand-violet/20 border border-brand-violet/30 rounded text-[10px] font-black text-brand-violet uppercase tracking-wide shrink-0">
                          {item.day}
                        </span>
                        <p className="text-sm text-zinc-300 font-medium">{item.routine}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-brand-cyan" />
                  <span className="text-xs text-zinc-400">FitAI Engine v1.8 generated this based on linear compound cycles.</span>
                </div>
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <button
                    onClick={handleReset}
                    className="w-full sm:w-auto px-5 py-3 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-zinc-300"
                  >
                    <RotateCcw className="h-4 w-4" /> Recalculate Plan
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-bold rounded-xl shadow-glow-purple hover:scale-[1.01] transition-transform text-center"
                  >
                    Launch Core Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
