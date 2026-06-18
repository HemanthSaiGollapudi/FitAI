import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { BMICalculator } from './components/BMICalculator';
import { WorkoutPlans } from './components/WorkoutPlans';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { OnboardingWizard } from './components/OnboardingWizard';
import { DashboardView } from './components/DashboardView';
import type { ActiveWorkout } from './components/DashboardView';
import type { SavedDietPlan } from './components/DietModule';
import type { WorkoutRoutine } from './components/WorkoutBuilder';
import type { LoggedWorkout, WeightLog, MeasurementLog } from './components/ProgressTracker';
import { WarmUpProtocol } from './components/WarmUpProtocol';
import { EXERCISE_DATABASE } from './data/exerciseDatabase';
import { AnimatePresence } from 'framer-motion';
import type { LoggedScannedFood } from './components/FoodScanner';
import { ProfileView } from './components/ProfileView';
import { AICoach } from './components/AICoach';
import { BodyFatEstimator } from './components/BodyFatEstimator';
import { AccessoriesStore } from './components/AccessoriesStore';
import { NutritionHub } from './components/NutritionHub';
import { TrainingHub } from './components/TrainingHub';

function App() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  
  // 1. Favorites and Checked checklist lists
  const [savedExercises, setSavedExercises] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fitai_saved_exercises') || '[]');
    } catch {
      return [];
    }
  });
  
  const [completedExercises, setCompletedExercises] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fitai_completed_exercises') || '[]');
    } catch {
      return [];
    }
  });

  // 2. Synced Diet configuration
  const [savedDietGoal, setSavedDietGoal] = useState<string>(() => localStorage.getItem('fitai_diet_goal') || '');
  const [savedDietType, setSavedDietType] = useState<string>(() => localStorage.getItem('fitai_diet_type') || '');
  const [savedDietCalories, setSavedDietCalories] = useState<number>(() => Number(localStorage.getItem('fitai_diet_calories') || '0'));
  const [savedDietProtein, setSavedDietProtein] = useState<number>(() => Number(localStorage.getItem('fitai_diet_protein') || '0'));
  const [savedDietCarbs, setSavedDietCarbs] = useState<number>(() => Number(localStorage.getItem('fitai_diet_carbs') || '0'));
  const [savedDietFats, setSavedDietFats] = useState<number>(() => Number(localStorage.getItem('fitai_diet_fats') || '0'));
  
  const [completedMeals, setCompletedMeals] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fitai_completed_meals') || '[]');
    } catch {
      return [];
    }
  });

  // 3. Workout Builder Routines
  const [customRoutines, setCustomRoutines] = useState<WorkoutRoutine[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fitai_custom_routines') || '[]');
    } catch {
      return [];
    }
  });

  // 4. Active Workout Logger State
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(() => {
    try {
      const active = localStorage.getItem('fitai_active_workout');
      return active ? JSON.parse(active) : null;
    } catch {
      return null;
    }
  });

  // 5. Tracking History Logs
  const [workoutHistory, setWorkoutHistory] = useState<LoggedWorkout[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fitai_workout_history') || '[]');
    } catch {
      return [];
    }
  });

  const [weightHistory, setWeightHistory] = useState<WeightLog[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fitai_weight_history') || '[]');
    } catch {
      return [];
    }
  });

  const [measurementHistory, setMeasurementHistory] = useState<MeasurementLog[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fitai_measurement_history') || '[]');
    } catch {
      return [];
    }
  });

  const [activeView, setActiveView] = useState<'home' | 'nutrition' | 'training' | 'coach' | 'body-fat' | 'store' | 'profile'>('home');
  const [nutritionActiveTab, setNutritionActiveTab] = useState<'diet' | 'scanner'>('diet');
  const [trainingActiveTab, setTrainingActiveTab] = useState<'library' | 'logger' | 'progress'>('library');

  const handleNavigate = (view: 'home' | 'nutrition' | 'training' | 'coach' | 'body-fat' | 'store' | 'profile', subTab?: string) => {
    setActiveView(view);
    if (view === 'nutrition' && subTab) {
      setNutritionActiveTab(subTab as 'diet' | 'scanner');
    }
    if (view === 'training' && subTab) {
      setTrainingActiveTab(subTab as 'library' | 'logger' | 'progress');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('fitai_user_name') || 'Champion';
  });

  const [waterLogs, setWaterLogs] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem('fitai_water_logs') || '{}');
    } catch {
      return {};
    }
  });

  const [goalWeight, setGoalWeight] = useState<number>(() => {
    return Number(localStorage.getItem('fitai_user_goal_weight') || '65');
  });

  const [userWeight, setUserWeight] = useState<number>(() => {
    return Number(localStorage.getItem('fitai_user_weight') || '70');
  });

  const [expectedWeightChange, setExpectedWeightChange] = useState<string>(() => {
    return localStorage.getItem('fitai_diet_expected_change') || '0.00 kg / week';
  });

  const [loggedScannedFoods, setLoggedScannedFoods] = useState<LoggedScannedFood[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fitai_scanned_food_logs') || '[]');
    } catch {
      return [];
    }
  });

  // Water tracker handlers
  const handleAddWater = (ml: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setWaterLogs((prev) => {
      const next = {
        ...prev,
        [todayStr]: (prev[todayStr] || 0) + ml
      };
      localStorage.setItem('fitai_water_logs', JSON.stringify(next));
      return next;
    });
  };

  // Sync to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem('fitai_saved_exercises', JSON.stringify(savedExercises));
  }, [savedExercises]);

  useEffect(() => {
    localStorage.setItem('fitai_completed_exercises', JSON.stringify(completedExercises));
  }, [completedExercises]);

  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem('fitai_active_workout', JSON.stringify(activeWorkout));
    } else {
      localStorage.removeItem('fitai_active_workout');
    }
  }, [activeWorkout]);

  // Actions
  const openOnboarding = () => setIsOnboardingOpen(true);
  const closeOnboarding = () => setIsOnboardingOpen(false);

  // Toggle saving an exercise
  const handleSaveExercise = (id: string) => {
    setSavedExercises((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle completing an exercise
  const handleCompleteExercise = (id: string) => {
    setCompletedExercises((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Save Diet Configuration
  const handleSaveDiet = (settings: SavedDietPlan) => {
    setSavedDietGoal(settings.goal);
    setSavedDietType(settings.type);
    setSavedDietCalories(settings.calories);
    setSavedDietProtein(settings.protein);
    setSavedDietCarbs(settings.carbs);
    setSavedDietFats(settings.fats);

    localStorage.setItem('fitai_diet_goal', settings.goal);
    localStorage.setItem('fitai_diet_type', settings.type);
    localStorage.setItem('fitai_diet_calories', String(settings.calories));
    localStorage.setItem('fitai_diet_protein', String(settings.protein));
    localStorage.setItem('fitai_diet_carbs', String(settings.carbs));
    localStorage.setItem('fitai_diet_fats', String(settings.fats));
  };

  // Toggle meal checklist item
  const handleToggleMeal = (mealTitle: string) => {
    setCompletedMeals((prev) => {
      const next = prev.includes(mealTitle)
        ? prev.filter((m) => m !== mealTitle)
        : [...prev, mealTitle];
      localStorage.setItem('fitai_completed_meals', JSON.stringify(next));
      return next;
    });
  };

  // Routine Builder Handlers
  const handleSaveRoutine = (routine: WorkoutRoutine) => {
    setCustomRoutines((prev) => {
      const exists = prev.some((r) => r.id === routine.id);
      const next = exists
        ? prev.map((r) => r.id === routine.id ? routine : r)
        : [...prev, routine];
      localStorage.setItem('fitai_custom_routines', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteRoutine = (id: string) => {
    setCustomRoutines((prev) => {
      const next = prev.filter((r) => r.id !== id);
      localStorage.setItem('fitai_custom_routines', JSON.stringify(next));
      return next;
    });
  };

  const handleDuplicateRoutine = (routine: WorkoutRoutine) => {
    const duplicated: WorkoutRoutine = {
      ...routine,
      id: `routine-${Date.now()}`,
      name: `${routine.name} (Copy)`
    };
    handleSaveRoutine(duplicated);
  };

  // Active Logger Handlers
  const handleStartWorkout = (routine: WorkoutRoutine) => {
    setActiveWorkout({
      id: routine.id,
      name: routine.name,
      startTime: Date.now(),
      exercises: routine.exercises.map((eid) => {
        const exName = EXERCISE_DATABASE.find(e => e.id === eid)?.name || 'Exercise';
        return {
          id: eid,
          name: exName,
          sets: [{ weight: 0, reps: 0, completed: false }]
        };
      })
    });
    // Scroll to dashboard where active workout log sheet is presented
    document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartEmptyWorkout = () => {
    setActiveWorkout({
      id: `session-${Date.now()}`,
      name: 'Quick Log Workout',
      startTime: Date.now(),
      exercises: []
    });
    document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUpdateActiveWorkout = (workout: ActiveWorkout) => {
    setActiveWorkout(workout);
  };

  const handleCancelActiveWorkout = () => {
    if (window.confirm("Are you sure you want to discard this workout session?")) {
      setActiveWorkout(null);
    }
  };

  const handleFinishActiveWorkout = () => {
    if (!activeWorkout) return;
    
    // Filter out uncompleted sets and empty exercises
    const loggedExercises = activeWorkout.exercises
      .map((ex) => ({
        id: ex.id,
        name: ex.name,
        sets: ex.sets.filter((s) => s.completed).map((s) => ({ weight: s.weight, reps: s.reps }))
      }))
      .filter((ex) => ex.sets.length > 0);

    if (loggedExercises.length === 0) {
      alert("No sets were checked off. Please check off at least one set to save!");
      return;
    }

    const newLog: LoggedWorkout = {
      id: `log-${Date.now()}`,
      name: activeWorkout.name,
      timestamp: Date.now(),
      exercises: loggedExercises
    };

    setWorkoutHistory((prev) => {
      const next = [newLog, ...prev];
      localStorage.setItem('fitai_workout_history', JSON.stringify(next));
      return next;
    });

    // Toggle corresponding favorites to completed list
    activeWorkout.exercises.forEach(ex => {
      if (!completedExercises.includes(ex.id)) {
        setCompletedExercises(prev => [...prev, ex.id]);
      }
    });

    setActiveWorkout(null);
    alert("Workout logged successfully! High five!");
    document.getElementById('tracker')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Biometrics Handlers
  const handleAddWeightLog = (weight: number) => {
    const newLog: WeightLog = {
      id: `weight-${Date.now()}`,
      timestamp: Date.now(),
      weight
    };
    setWeightHistory((prev) => {
      const next = [...prev, newLog];
      localStorage.setItem('fitai_weight_history', JSON.stringify(next));
      return next;
    });
    setUserWeight(weight);
    localStorage.setItem('fitai_user_weight', String(weight));
  };

  const handleSaveGoalWeight = (w: number) => {
    setGoalWeight(w);
    localStorage.setItem('fitai_user_goal_weight', String(w));
  };

  const handleAddMeasurementLog = (chest: number, waist: number, arms: number, hips: number, thighs: number) => {
    const newLog: MeasurementLog = {
      id: `measurement-${Date.now()}`,
      timestamp: Date.now(),
      chest,
      waist,
      arms,
      hips,
      thighs
    };
    setMeasurementHistory((prev) => {
      const next = [...prev, newLog];
      localStorage.setItem('fitai_measurement_history', JSON.stringify(next));
      return next;
    });
  };

  const handleAddScannedFood = (food: Omit<LoggedScannedFood, 'id' | 'timestamp'>) => {
    const newLog: LoggedScannedFood = {
      ...food,
      id: `scan-log-${Date.now()}`,
      timestamp: Date.now()
    };
    setLoggedScannedFoods((prev) => {
      const next = [...prev, newLog];
      localStorage.setItem('fitai_scanned_food_logs', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteScannedFood = (id: string) => {
    setLoggedScannedFoods((prev) => {
      const next = prev.filter((item) => item.id !== id);
      localStorage.setItem('fitai_scanned_food_logs', JSON.stringify(next));
      return next;
    });
  };

  const handleSaveProfile = (settings: {
    name: string;
    age: number;
    weight: number;
    height: number;
    goalWeight: number;
    gender: 'Male' | 'Female';
    activity: string;
    type: 'Veg' | 'Non-Veg' | 'Eggetarian';
  }) => {
    setUserName(settings.name);
    localStorage.setItem('fitai_user_name', settings.name);
    setUserWeight(settings.weight);
    setGoalWeight(settings.goalWeight);
    setSavedDietType(settings.type);

    let calculatedBmr = 0;
    if (settings.gender === 'Male') {
      calculatedBmr = 10 * settings.weight + 6.25 * settings.height - 5 * settings.age + 5;
    } else {
      calculatedBmr = 10 * settings.weight + 6.25 * settings.height - 5 * settings.age - 161;
    }

    let multiplier = 1.55;
    if (settings.activity === 'Sedentary') multiplier = 1.2;
    else if (settings.activity === 'Moderately Active') multiplier = 1.55;
    else if (settings.activity === 'Very Active') multiplier = 1.725;
    else if (settings.activity === 'Athlete/Highly Active') multiplier = 1.9;

    const calculatedTdee = calculatedBmr * multiplier;

    let dailyCal = calculatedTdee;
    let expectedChange = '0.00 kg / week';
    if (savedDietGoal === 'Fat Loss') {
      dailyCal = calculatedTdee - 500;
      expectedChange = '-0.50 kg / week';
    } else if (savedDietGoal === 'Muscle Gain') {
      dailyCal = calculatedTdee + 350;
      expectedChange = '+0.25 kg / week';
    }

    const minCalories = settings.gender === 'Male' ? 1500 : 1200;
    if (dailyCal < minCalories) dailyCal = minCalories;

    const targetC = Math.round(dailyCal);
    const targetP = Math.round(settings.weight * 2.0);
    const targetF = Math.round((targetC * 0.25) / 9);
    const targetCarb = Math.round((targetC - (targetP * 4) - (targetF * 9)) / 4);

    setSavedDietCalories(targetC);
    setSavedDietProtein(targetP);
    setSavedDietCarbs(targetCarb);
    setSavedDietFats(targetF);
    setExpectedWeightChange(expectedChange);

    localStorage.setItem('fitai_diet_calories', String(targetC));
    localStorage.setItem('fitai_diet_protein', String(targetP));
    localStorage.setItem('fitai_diet_carbs', String(targetCarb));
    localStorage.setItem('fitai_diet_fats', String(targetF));
    localStorage.setItem('fitai_diet_expected_change', expectedChange);
    localStorage.setItem('fitai_user_weight', String(settings.weight));
    localStorage.setItem('fitai_user_goal_weight', String(settings.goalWeight));
    localStorage.setItem('fitai_diet_type', settings.type);

    const lastWeightLog = weightHistory[weightHistory.length - 1];
    if (!lastWeightLog || lastWeightLog.weight !== settings.weight) {
      handleAddWeightLog(settings.weight);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your entire tracking history?")) {
      setWorkoutHistory([]);
      setWeightHistory([]);
      setMeasurementHistory([]);
      setLoggedScannedFoods([]);
      setWaterLogs({});
      localStorage.removeItem('fitai_workout_history');
      localStorage.removeItem('fitai_weight_history');
      localStorage.removeItem('fitai_measurement_history');
      localStorage.removeItem('fitai_scanned_food_logs');
      localStorage.removeItem('fitai_water_logs');
    }
  };

  return (
    <div className="bg-[#03000a] min-h-screen text-zinc-100 selection:bg-brand-violet/30 selection:text-white relative">
      {/* Navbar Header */}
      <Navbar 
        onStartOnboarding={openOnboarding} 
        activeView={activeView}
        onChangeView={(view) => handleNavigate(view)}
      />

      {activeView === 'nutrition' ? (
        <NutritionHub
          activeTab={nutritionActiveTab}
          onTabChange={setNutritionActiveTab}
          onSaveDiet={handleSaveDiet}
          savedGoal={savedDietGoal}
          savedType={savedDietType}
          savedCalories={savedDietCalories}
          onAddScannedFood={handleAddScannedFood}
        />
      ) : activeView === 'training' ? (
        <TrainingHub
          activeTab={trainingActiveTab}
          onTabChange={setTrainingActiveTab}
          onSaveExercise={handleSaveExercise}
          onCompleteExercise={handleCompleteExercise}
          savedExercises={savedExercises}
          completedExercises={completedExercises}
          customRoutines={customRoutines}
          onSaveRoutine={handleSaveRoutine}
          onDeleteRoutine={handleDeleteRoutine}
          onDuplicateRoutine={handleDuplicateRoutine}
          onStartWorkout={handleStartWorkout}
          workoutHistory={workoutHistory}
          weightHistory={weightHistory}
          measurementHistory={measurementHistory}
          onAddWeightLog={handleAddWeightLog}
          onAddMeasurementLog={handleAddMeasurementLog}
          onClearHistory={handleClearHistory}
          goalWeight={goalWeight}
          onSaveGoalWeight={handleSaveGoalWeight}
        />
      ) : activeView === 'coach' ? (
        <AICoach 
          onSaveRoutine={handleSaveRoutine}
          savedExercises={savedExercises}
        />
      ) : activeView === 'body-fat' ? (
        <BodyFatEstimator />
      ) : activeView === 'store' ? (
        <AccessoriesStore />
      ) : activeView === 'profile' ? (
        <ProfileView 
          onSaveProfile={handleSaveProfile}
          savedGoal={savedDietGoal}
        />
      ) : (
        <>
          {/* Hero Presentation */}
          <Hero onStartOnboarding={openOnboarding} />

          {/* Persistent User Control Centre Dashboard */}
          <DashboardView 
            savedExercises={savedExercises}
            savedDietGoal={savedDietGoal}
            savedDietType={savedDietType}
            savedCalories={savedDietCalories}
            savedProtein={savedDietProtein}
            savedCarbs={savedDietCarbs}
            savedFats={savedDietFats}
            onOpenOnboarding={openOnboarding}
            activeWorkout={activeWorkout}
            onUpdateActiveWorkout={handleUpdateActiveWorkout}
            onFinishActiveWorkout={handleFinishActiveWorkout}
            onCancelActiveWorkout={handleCancelActiveWorkout}
            onStartEmptyWorkout={handleStartEmptyWorkout}
            completedMeals={completedMeals}
            onToggleMeal={handleToggleMeal}
            workoutHistory={workoutHistory}
            customRoutines={customRoutines}
            onStartWorkout={handleStartWorkout}
            goalWeight={goalWeight}
            userWeight={userWeight}
            expectedWeightChange={expectedWeightChange}
            loggedScannedFoods={loggedScannedFoods}
            onDeleteScannedFood={handleDeleteScannedFood}
            userName={userName}
            waterLogs={waterLogs}
            onAddWater={handleAddWater}
            onNavigate={handleNavigate}
          />

          {/* Core Capability Cards */}
          <Features />

          {/* Preparation warmups and stretching */}
          <WarmUpProtocol />

          {/* Workflow Steps */}
          <HowItWorks />

          {/* Dynamic BMI Calibrations */}
          <BMICalculator />

          {/* Categorized workout splits */}
          <WorkoutPlans />

          {/* Metrics success cards */}
          <Testimonials />

          {/* Pricing options */}
          <Pricing onStartOnboarding={openOnboarding} />

          {/* FAQ support accordion */}
          <FAQ />
        </>
      )}

      {/* Footer Navigation details */}
      <Footer />

      {/* Full-Screen AI wizard and user dashboard */}
      <AnimatePresence>
        {isOnboardingOpen && (
          <OnboardingWizard isOpen={isOnboardingOpen} onClose={closeOnboarding} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
