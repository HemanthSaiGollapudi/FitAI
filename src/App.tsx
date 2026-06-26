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

import { DashboardView } from './components/DashboardView';
import type { ActiveWorkout } from './components/DashboardView';
import type { SavedDietPlan } from './components/DietModule';
import type { WorkoutRoutine } from './components/WorkoutBuilder';
import type { LoggedWorkout, WeightLog, MeasurementLog } from './components/ProgressTracker';
import { WarmUpProtocol } from './components/WarmUpProtocol';
import { EXERCISE_DATABASE } from './data/exerciseDatabase';
import { motion, AnimatePresence } from 'framer-motion';
import type { LoggedScannedFood } from './components/FoodScanner';
import { ProfileView } from './components/ProfileView';
import { AICoach } from './components/AICoach';
import { BodyFatEstimator } from './components/BodyFatEstimator';
import { AccessoriesStore } from './components/AccessoriesStore';
import { NutritionHub } from './components/NutritionHub';
import { TrainingHub } from './components/TrainingHub';
import { Trophy, Fingerprint, Scan, Unlock, Loader2 } from 'lucide-react';
import { ActiveWorkoutSession } from './components/ActiveWorkoutSession';
import { AuthModule } from './components/AuthModule';
import type { UserProfile } from './components/AuthModule';
import { BiometricLockScreen } from './components/BiometricLockScreen';

// Real Firebase Auth
import { auth, isFirebaseConfigured } from './firebase';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';

function App() {

  const [isWorkoutSessionExpanded, setIsWorkoutSessionExpanded] = useState(() => {
    return localStorage.getItem('fitai_active_workout_expanded') === 'true';
  });
  const [workoutSummaryData, setWorkoutSummaryData] = useState<LoggedWorkout | null>(null);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [authLoading, setAuthLoading] = useState(true);


  const [isLocked, setIsLocked] = useState(() => {
    const savedUser = localStorage.getItem('fitai_current_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        const isMobileApp = !!((window as any).Capacitor || (window as any).cordova);
        if (user.biometricsEnabled && isMobileApp) {
          return true;
        }
      } catch {}
    }
    return false;
  });

  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [registeringBiometricType, setRegisteringBiometricType] = useState<'Android Fingerprint' | 'Android Face Unlock' | 'iPhone Face ID / Touch ID' | null>(null);
  const [biometricRegisterPhase, setBiometricRegisterPhase] = useState<'ask' | 'select' | 'scan' | 'complete'>('ask');

  // Real Firebase auth listener
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.emailVerified) {
          setIsAuthenticated(true);
          
          // Retrieve metadata from local database
          const usersRaw = localStorage.getItem('fitai_users');
          let profile: UserProfile | null = null;
          if (usersRaw) {
            try {
              const users: UserProfile[] = JSON.parse(usersRaw);
              profile = users.find(u => u.email.toLowerCase() === user.email?.toLowerCase()) || null;
            } catch {}
          }

          if (!profile) {
            profile = {
              name: user.displayName || 'Athlete',
              email: user.email!.toLowerCase(),
              age: 25,
              gender: 'Male',
              height: 170,
              weight: 70,
              goal: 'Gain Muscle',
              dietPreference: 'Veg',
              activityLevel: 'Moderately Active',
              targetWeight: 66,
              biometricsEnabled: false
            };
          }

          setCurrentUser(profile);
          localStorage.setItem('fitai_is_authenticated', 'true');
          localStorage.setItem('fitai_current_user', JSON.stringify(profile));

          // Lock the screen if biometrics are enabled and it's a mobile environment
          const isMobileApp = !!((window as any).Capacitor || (window as any).cordova);
          if (profile.biometricsEnabled && isMobileApp) {
            setIsLocked(true);
          }

          // Synchronize states
          setUserName(profile.name);
          localStorage.setItem('fitai_user_name', profile.name);
          setUserWeight(profile.weight);
          localStorage.setItem('fitai_user_weight', String(profile.weight));
          const targetW = profile.targetWeight || 65;
          setGoalWeight(targetW);
          localStorage.setItem('fitai_user_goal_weight', String(targetW));

          const dietType = profile.dietPreference === 'Veg' ? 'Veg' : profile.dietPreference === 'Non-Veg' ? 'Non-Veg' : 'Eggetarian';
          setSavedDietType(dietType);
          localStorage.setItem('fitai_diet_type', dietType);

          const dGoal = profile.goal === 'Lose Weight' ? 'Fat Loss' : profile.goal === 'Gain Muscle' ? 'Muscle Gain' : profile.goal === 'Build Strength' ? 'Build Strength' : 'Stamina';
          setSavedDietGoal(dGoal);
          localStorage.setItem('fitai_diet_goal', dGoal);

          if (profile.activityLevel) {
            setUserActivity(profile.activityLevel);
            localStorage.setItem('fitai_user_activity', profile.activityLevel);
          }
        } else {
          // Logged in but not verified
          setIsAuthenticated(false);
          setCurrentUser(null);
          localStorage.removeItem('fitai_is_authenticated');
          localStorage.removeItem('fitai_current_user');
        }
      } else {
        // Logged out
        setIsAuthenticated(false);
        setCurrentUser(null);
        localStorage.removeItem('fitai_is_authenticated');
        localStorage.removeItem('fitai_current_user');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('fitai_is_authenticated', 'true');
    localStorage.setItem('fitai_current_user', JSON.stringify(user));
    
    // Synchronize states
    setUserName(user.name);
    localStorage.setItem('fitai_user_name', user.name);
    setUserWeight(user.weight);
    localStorage.setItem('fitai_user_weight', String(user.weight));
    const targetW = user.targetWeight || 65;
    setGoalWeight(targetW);
    localStorage.setItem('fitai_user_goal_weight', String(targetW));
    
    const dietType = user.dietPreference === 'Veg' ? 'Veg' : user.dietPreference === 'Non-Veg' ? 'Non-Veg' : 'Eggetarian';
    setSavedDietType(dietType);
    localStorage.setItem('fitai_diet_type', dietType);
    
    const dGoal = user.goal === 'Lose Weight' ? 'Fat Loss' : user.goal === 'Gain Muscle' ? 'Muscle Gain' : user.goal === 'Build Strength' ? 'Build Strength' : 'Stamina';
    setSavedDietGoal(dGoal);
    localStorage.setItem('fitai_diet_goal', dGoal);
    
    if (user.activityLevel) {
      setUserActivity(user.activityLevel);
      localStorage.setItem('fitai_user_activity', user.activityLevel);
    }

    // Force calorie targets recalculation on login
    let calculatedBmr = 0;
    if (user.gender === 'Male') {
      calculatedBmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
    } else {
      calculatedBmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
    }

    let multiplier = 1.55;
    const act = user.activityLevel || 'Moderately Active';
    if (act === 'Sedentary') multiplier = 1.2;
    else if (act === 'Moderately Active') multiplier = 1.55;
    else if (act === 'Very Active') multiplier = 1.725;
    else if (act === 'Athlete/Highly Active') multiplier = 1.9;

    const calculatedTdee = calculatedBmr * multiplier;

    let dailyCal = calculatedTdee;
    let expectedChange = '0.00 kg / week';
    if (dGoal === 'Fat Loss') {
      dailyCal = calculatedTdee - 500;
      expectedChange = '-0.50 kg / week';
    } else if (dGoal === 'Muscle Gain') {
      dailyCal = calculatedTdee + 350;
      expectedChange = '+0.25 kg / week';
    }

    const minCalories = user.gender === 'Male' ? 1500 : 1200;
    if (dailyCal < minCalories) dailyCal = minCalories;

    const targetC = Math.round(dailyCal);
    const targetP = Math.round(user.weight * 2.0);
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

    const isMobileApp = !!((window as any).Capacitor || (window as any).cordova);
    const prompted = localStorage.getItem(`fitai_biometrics_prompted_${user.email}`) === 'true';
    if (isMobileApp && !prompted && !user.biometricsEnabled) {
      setShowBiometricPrompt(true);
      setBiometricRegisterPhase('ask');
    }
  };

  const handleLogout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Firebase signOut error:", err);
      }
    }

    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsLocked(false);
    setShowBiometricPrompt(false);
    
    // Reset all React state to default values on logout
    setSavedExercises([]);
    setCompletedExercises([]);
    setSavedDietGoal('');
    setSavedDietType('');
    setSavedDietCalories(0);
    setSavedDietProtein(0);
    setSavedDietCarbs(0);
    setSavedDietFats(0);
    setCompletedMeals([]);
    setCustomRoutines([]);
    setActiveWorkout(null);
    setWorkoutHistory([]);
    setWeightHistory([]);
    setMeasurementHistory([]);
    setLoggedScannedFoods([]);
    setWaterLogs({});
    setUserName('Champion');
    setUserWeight(70);
    setGoalWeight(65);
    setExpectedWeightChange('0.00 kg / week');
    setUserActivity('Moderately Active');

    localStorage.clear();
    sessionStorage.clear();

    navigateToPath('/login');
  };

  useEffect(() => {
    localStorage.setItem('fitai_active_workout_expanded', String(isWorkoutSessionExpanded));
  }, [isWorkoutSessionExpanded]);

  useEffect(() => {
    if (biometricRegisterPhase === 'scan' && currentUser && registeringBiometricType) {
      const timer = setTimeout(() => {
        const updatedUser = {
          ...currentUser,
          biometricsEnabled: true,
          biometricType: registeringBiometricType
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('fitai_current_user', JSON.stringify(updatedUser));
        
        try {
          const usersRaw = localStorage.getItem('fitai_users');
          if (usersRaw) {
            const users = JSON.parse(usersRaw);
            const idx = users.findIndex((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase());
            if (idx !== -1) {
              users[idx] = updatedUser;
              localStorage.setItem('fitai_users', JSON.stringify(users));
            }
          }
        } catch {}
        localStorage.setItem(`fitai_biometrics_prompted_${currentUser.email}`, 'true');
        setBiometricRegisterPhase('complete');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [biometricRegisterPhase, registeringBiometricType, currentUser]);
  
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

  // Navigation and simple routing state
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const navigateToPath = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [activeView, setActiveView] = useState<'home' | 'nutrition' | 'training' | 'coach' | 'body-fat' | 'store' | 'profile'>('home');
  const [nutritionActiveTab, setNutritionActiveTab] = useState<'diet' | 'scanner'>('diet');
  const [trainingActiveTab, setTrainingActiveTab] = useState<'library' | 'logger' | 'progress'>('library');

  const handleNavigate = (view: 'home' | 'nutrition' | 'training' | 'coach' | 'body-fat' | 'store' | 'profile', subTab?: string) => {
    const path = view === 'home' ? '/dashboard' : `/${view}`;
    navigateToPath(path);
    if (view === 'nutrition' && subTab) {
      setNutritionActiveTab(subTab as 'diet' | 'scanner');
    }
    if (view === 'training' && subTab) {
      setTrainingActiveTab(subTab as 'library' | 'logger' | 'progress');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route Guard matching path state with auth state
  useEffect(() => {
    if (authLoading) return;

    const publicPaths = ['/login', '/signup', '/forgot-password'];
    const protectedPaths = ['/dashboard', '/nutrition', '/training', '/coach', '/body-fat', '/store', '/profile'];

    let path = currentPath;
    if (path === '/' || path === '') {
      path = (isAuthenticated && currentUser) ? '/dashboard' : '/login';
    }

    if (isAuthenticated && currentUser) {
      if (publicPaths.includes(path)) {
        navigateToPath('/dashboard');
      } else if (protectedPaths.includes(path)) {
        const view = path === '/dashboard' ? 'home' : path.substring(1);
        setActiveView(view as any);
      } else {
        navigateToPath('/dashboard');
      }
    } else {
      if (publicPaths.includes(path)) {
        // let public auth modules render
      } else {
        navigateToPath('/login');
      }
    }
  }, [currentPath, isAuthenticated, currentUser, authLoading]);

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

  const [userActivity, setUserActivity] = useState<string>(() => {
    return localStorage.getItem('fitai_user_activity') || 'Moderately Active';
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
      window.dispatchEvent(new Event('fitai_logs_updated'));
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

  const handleChangeDietType = (type: string) => {
    setSavedDietType(type);
    localStorage.setItem('fitai_diet_type', type);
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
  // Active Logger Handlers
  const handleStartWorkout = (routine: WorkoutRoutine) => {
    if (!routine.exercises || routine.exercises.length === 0) {
      alert("Please add at least one exercise before starting.");
      return;
    }

    setActiveWorkout({
      id: routine.id,
      name: routine.name,
      startTime: Date.now(),
      isPaused: false,
      pausedTime: 0,
      totalPausedDuration: 0,
      exercises: routine.exercises.map((eid) => {
        const ex = EXERCISE_DATABASE.find(e => e.id === eid);
        const exName = ex?.name || 'Exercise';
        const defaultReps = ex ? parseInt(ex.setsReps.match(/\d+\s*Reps/)?.[0] || '10') : 10;
        return {
          id: eid,
          name: exName,
          sets: [{ weight: 0, reps: defaultReps, completed: false }]
        };
      })
    });
    setIsWorkoutSessionExpanded(true);
  };

  const handleStartEmptyWorkout = () => {
    setActiveWorkout({
      id: `session-${Date.now()}`,
      name: 'Quick Log Workout',
      startTime: Date.now(),
      isPaused: false,
      pausedTime: 0,
      totalPausedDuration: 0,
      exercises: []
    });
    setIsWorkoutSessionExpanded(true);
  };

  const handleUpdateActiveWorkout = (workout: ActiveWorkout) => {
    setActiveWorkout(workout);
  };

  const handleCancelActiveWorkout = () => {
    if (window.confirm("Are you sure you want to discard this workout session?")) {
      setActiveWorkout(null);
      setIsWorkoutSessionExpanded(false);
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
      window.dispatchEvent(new Event('fitai_logs_updated'));
      return next;
    });

    // Toggle corresponding favorites to completed list
    activeWorkout.exercises.forEach(ex => {
      if (!completedExercises.includes(ex.id)) {
        setCompletedExercises(prev => [...prev, ex.id]);
      }
    });

    setWorkoutSummaryData(newLog);
    setActiveWorkout(null);
    setIsWorkoutSessionExpanded(false);
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
      window.dispatchEvent(new Event('fitai_logs_updated'));
      return next;
    });
  };

  const handleDeleteScannedFood = (id: string) => {
    setLoggedScannedFoods((prev) => {
      const next = prev.filter((item) => item.id !== id);
      localStorage.setItem('fitai_scanned_food_logs', JSON.stringify(next));
      window.dispatchEvent(new Event('fitai_logs_updated'));
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
    goal?: string;
  }) => {
    setUserName(settings.name);
    localStorage.setItem('fitai_user_name', settings.name);
    setUserWeight(settings.weight);
    setGoalWeight(settings.goalWeight);
    setSavedDietType(settings.type);
    setUserActivity(settings.activity);
    localStorage.setItem('fitai_user_activity', settings.activity);

    let currentDietGoal = savedDietGoal;
    if (settings.goal) {
      let dGoal = settings.goal;
      if (settings.goal === 'Lose Weight') dGoal = 'Fat Loss';
      else if (settings.goal === 'Gain Muscle') dGoal = 'Muscle Gain';
      else if (settings.goal === 'Improve Stamina') dGoal = 'Stamina';
      currentDietGoal = dGoal;
      setSavedDietGoal(dGoal);
      localStorage.setItem('fitai_diet_goal', dGoal);
    }

    // Update current user and sync to user registry database
    if (currentUser) {
      const updatedUser: UserProfile = {
        ...currentUser,
        name: settings.name,
        age: settings.age,
        weight: settings.weight,
        height: settings.height,
        targetWeight: settings.goalWeight,
        gender: settings.gender,
        activityLevel: settings.activity,
        dietPreference: settings.type === 'Veg' ? 'Veg' : settings.type === 'Non-Veg' ? 'Non-Veg' : 'Eggetarian',
        goal: settings.goal || currentUser.goal
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('fitai_current_user', JSON.stringify(updatedUser));

      try {
        const raw = localStorage.getItem('fitai_users');
        if (raw) {
          const users: UserProfile[] = JSON.parse(raw);
          const idx = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
          if (idx !== -1) {
            users[idx] = { ...users[idx], ...updatedUser };
            localStorage.setItem('fitai_users', JSON.stringify(users));
          }
        }
      } catch {}
    }

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
    if (currentDietGoal === 'Fat Loss') {
      dailyCal = calculatedTdee - 500;
      expectedChange = '-0.50 kg / week';
    } else if (currentDietGoal === 'Muscle Gain') {
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#03000a] flex items-center justify-center text-zinc-100 flex-col space-y-4">
        <Loader2 className="w-10 h-10 text-brand-cyan animate-spin" />
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider animate-pulse">Loading FitAI Secure...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModule onAuthSuccess={handleAuthSuccess} />;
  }

  // Re-authenticate with Firebase to securely verify password
  const verifyPassword = async (pwd: string): Promise<boolean> => {
    if (!currentUser || !auth) return false;
    try {
      await signInWithEmailAndPassword(auth, currentUser.email, pwd);
      return true;
    } catch (err) {
      console.error("Biometric Lock password verification error:", err);
      return false;
    }
  };

  if (isLocked && currentUser) {
    return (
      <BiometricLockScreen 
        currentUser={currentUser} 
        onUnlock={() => setIsLocked(false)} 
        onLogout={handleLogout} 
        verifyPassword={verifyPassword}
      />
    );
  }

  return (
    <div className="bg-[#03000a] min-h-screen text-zinc-100 selection:bg-brand-violet/30 selection:text-white relative">
      {/* Navbar Header */}
      <Navbar 
        activeView={activeView}
        onChangeView={(view) => handleNavigate(view)}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
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
          userWeight={userWeight}
          savedDietGoal={savedDietGoal}
          workoutHistory={workoutHistory}
          savedDietCalories={savedDietCalories}
          savedDietProtein={savedDietProtein}
          savedDietType={savedDietType}
          userName={userName}
          userActivity={userActivity}
          onSaveDiet={handleSaveDiet}
          onNavigate={handleNavigate}
          onStartWorkout={handleStartWorkout}
          onChangeDietType={handleChangeDietType}
          userAge={currentUser?.age || 25}
          userGender={currentUser?.gender || 'Male'}
          userHeight={currentUser?.height || 170}
          targetWeight={goalWeight}
          loggedScannedFoods={loggedScannedFoods}
          weightHistory={weightHistory}
          completedExercises={completedExercises}
        />
      ) : activeView === 'body-fat' ? (
        <BodyFatEstimator />
      ) : activeView === 'store' ? (
        <AccessoriesStore />
      ) : activeView === 'profile' ? (
        <ProfileView 
          onSaveProfile={handleSaveProfile}
          savedGoal={savedDietGoal}
          onLogout={handleLogout}
        />
      ) : (
        <>
          {/* Hero Presentation */}
          <Hero />

          {/* Persistent User Control Centre Dashboard */}
          <DashboardView 
            savedExercises={savedExercises}
            savedDietGoal={savedDietGoal}
            savedDietType={savedDietType}
            savedCalories={savedDietCalories}
            savedProtein={savedDietProtein}
            savedCarbs={savedDietCarbs}
            savedFats={savedDietFats}
            activeWorkout={activeWorkout}
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
          <Pricing />

          {/* FAQ support accordion */}
          <FAQ />
        </>
      )}

      {/* Footer Navigation details */}
      <Footer />



      {/* Active Workout Session Logger */}
      {activeWorkout && (
        <ActiveWorkoutSession
          activeWorkout={activeWorkout}
          onUpdateActiveWorkout={handleUpdateActiveWorkout}
          onFinishActiveWorkout={handleFinishActiveWorkout}
          onCancelActiveWorkout={handleCancelActiveWorkout}
          isExpanded={isWorkoutSessionExpanded}
          setIsExpanded={setIsWorkoutSessionExpanded}
        />
      )}

      {/* Workout Summary Modal */}
      {workoutSummaryData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div onClick={() => setWorkoutSummaryData(null)} className="absolute inset-0 bg-dark-950/80 backdrop-blur-md" />
          <div className="relative w-full max-w-xl bg-gradient-to-br from-[#0d0720] via-dark-900 to-dark-950 border border-brand-violet/40 p-6 rounded-2xl shadow-glass z-10 text-left space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-brand-violet/15 text-brand-cyan border border-brand-violet/30 animate-bounce">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-display font-black text-white">Workout Complete! 🏆</h3>
              <p className="text-xs text-zinc-400">Excellent job! Here is your session summary.</p>
            </div>

            <div className="p-4 bg-dark-950/50 border border-white/5 rounded-xl text-center">
              <h4 className="text-base font-bold text-brand-cyan">{workoutSummaryData.name}</h4>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mt-1">
                {new Date(workoutSummaryData.timestamp).toLocaleDateString()} at {new Date(workoutSummaryData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center space-y-0.5">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Total Volume</span>
                <span className="text-lg font-black text-white text-center block">
                  {workoutSummaryData.exercises.reduce((sum, ex) => 
                    sum + ex.sets.reduce((setSum, s) => setSum + (s.weight * s.reps), 0)
                  , 0)} kg
                </span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center space-y-0.5">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block text-center">Sets Completed</span>
                <span className="text-lg font-black text-white text-center block">
                  {workoutSummaryData.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)}
                </span>
              </div>
            </div>

            {/* Exercises list */}
            <div className="space-y-3">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Exercise Breakdown</span>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {workoutSummaryData.exercises.map((ex, idx) => (
                  <div key={idx} className="p-3 bg-dark-950/40 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <h5 className="font-bold text-white">{ex.name}</h5>
                      <span className="text-[10px] text-zinc-500">{ex.sets.length} sets completed</span>
                    </div>
                    <div className="text-right text-zinc-400 font-mono">
                      {ex.sets.map((s) => `${s.weight}kg x ${s.reps}`).join(' | ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setWorkoutSummaryData(null);
                handleNavigate('training', 'progress');
              }}
              className="w-full py-3.5 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-black rounded-xl shadow-glow-purple hover:scale-[1.02] transition-transform text-center block uppercase tracking-wider cursor-pointer"
            >
              View in Progress Tracker
            </button>
          </div>
        </div>
      )}

      {/* Biometric Config Dialog Prompt */}
      {showBiometricPrompt && currentUser && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <div onClick={() => {
            localStorage.setItem(`fitai_biometrics_prompted_${currentUser.email}`, 'true');
            setShowBiometricPrompt(false);
          }} className="absolute inset-0 bg-dark-950/80 backdrop-blur-md cursor-pointer" />
          <div className="relative w-full max-w-md bg-gradient-to-br from-[#0d0720] via-dark-900 to-dark-950 border border-brand-violet/40 p-6 rounded-2xl shadow-glass z-10 text-left space-y-6">
            <AnimatePresence mode="wait">
              {biometricRegisterPhase === 'ask' && (
                <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="inline-flex p-3 rounded-full bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 animate-pulse">
                      <Fingerprint className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-display font-black text-white">Enable Biometric Unlock?</h3>
                    <p className="text-xs text-zinc-400">Secure your workouts, diet logs, and biological tracking with biometric device verification.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => {
                        localStorage.setItem(`fitai_biometrics_prompted_${currentUser.email}`, 'true');
                        setShowBiometricPrompt(false);
                      }}
                      className="py-3 border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white text-xs font-bold rounded-xl cursor-pointer text-center"
                    >
                      No Thanks
                    </button>
                    <button
                      onClick={() => setBiometricRegisterPhase('select')}
                      className="py-3 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-black rounded-xl hover:scale-102 transition-transform cursor-pointer text-center"
                    >
                      Enable Biometrics
                    </button>
                  </div>
                </motion.div>
              )}

              {biometricRegisterPhase === 'select' && (
                <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <h3 className="text-base font-display font-extrabold text-white">Select Biometric Method</h3>
                  <p className="text-xs text-zinc-400">Choose the device credential verification system to register:</p>
                  <div className="space-y-2 pt-2">
                    {/iPhone|iPad|iPod|Mac/i.test(navigator.userAgent) ? (
                      <button
                        onClick={() => {
                          setRegisteringBiometricType('iPhone Face ID / Touch ID');
                          setBiometricRegisterPhase('scan');
                        }}
                        className="w-full p-3 bg-dark-950 hover:bg-white/5 border border-white/5 rounded-xl text-left text-xs font-bold flex items-center justify-between text-white cursor-pointer"
                      >
                        <span>iPhone Face ID / Touch ID</span>
                        <Scan className="w-4 h-4 text-brand-cyan" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setRegisteringBiometricType('Android Fingerprint');
                            setBiometricRegisterPhase('scan');
                          }}
                          className="w-full p-3 bg-dark-950 hover:bg-white/5 border border-white/5 rounded-xl text-left text-xs font-bold flex items-center justify-between text-white cursor-pointer"
                        >
                          <span>Android Fingerprint Sensor</span>
                          <Fingerprint className="w-4 h-4 text-brand-cyan" />
                        </button>
                        <button
                          onClick={() => {
                            setRegisteringBiometricType('Android Face Unlock');
                            setBiometricRegisterPhase('scan');
                          }}
                          className="w-full p-3 bg-dark-950 hover:bg-white/5 border border-white/5 rounded-xl text-left text-xs font-bold flex items-center justify-between text-white cursor-pointer"
                        >
                          <span>Android Face Unlock</span>
                          <Scan className="w-4 h-4 text-brand-cyan" />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {biometricRegisterPhase === 'scan' && (
                <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 text-center flex flex-col items-center">
                  <h3 className="text-base font-display font-extrabold text-white">Registering Biometrics</h3>
                  <p className="text-xs text-zinc-400">Please interact with your device biometric scanner now.</p>
                  
                  <div className="relative h-24 w-24 flex items-center justify-center bg-dark-950 border border-white/5 rounded-full my-4">
                    <div className="absolute inset-0 border border-brand-cyan rounded-full animate-ping opacity-25" />
                    <div className="absolute w-full h-0.5 bg-brand-cyan top-0 left-0 animate-sweep rounded" />
                    <Loader2 className="w-10 h-10 text-brand-cyan animate-spin" />
                  </div>

                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Establishing secure device link...</p>
                  
                  {/* Visual scanning sweep animation in progress */}
                </motion.div>
              )}

              {biometricRegisterPhase === 'complete' && (
                <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 text-center">
                  <div className="inline-flex p-3 rounded-full bg-brand-lime/15 text-brand-lime border border-brand-lime/30 my-2">
                    <Unlock className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-display font-black text-white">Biometrics Activated!</h3>
                  <p className="text-xs text-zinc-400">Your device authentication profile has been linked. You can lock/unlock securely on future app opens.</p>
                  <button
                    onClick={() => setShowBiometricPrompt(false)}
                    className="w-full py-3 mt-4 bg-brand-violet text-white text-xs font-black rounded-xl hover:scale-102 transition-transform cursor-pointer block uppercase tracking-wider"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
