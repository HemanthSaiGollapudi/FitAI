import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Award, Calendar, Weight, 
  Trash2, CheckCircle2, Ruler, Target, ArrowLeft
} from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

export interface LoggedSet {
  weight: number;
  reps: number;
}

export interface LoggedWorkout {
  id: string;
  name: string;
  timestamp: number;
  exercises: {
    id: string;
    name: string;
    sets: LoggedSet[];
    notes?: string;
  }[];
}

export interface WeightLog {
  id: string;
  timestamp: number;
  weight: number;
}

export interface MeasurementLog {
  id: string;
  timestamp: number;
  chest: number;
  waist: number;
  arms: number;
  hips: number;
  thighs: number;
}

interface ProgressTrackerProps {
  workoutHistory: LoggedWorkout[];
  weightHistory: WeightLog[];
  measurementHistory: MeasurementLog[];
  onAddWeightLog: (weight: number) => void;
  onAddMeasurementLog: (chest: number, waist: number, arms: number, hips: number, thighs: number) => void;
  onClearHistory: () => void;
  goalWeight: number;
  onSaveGoalWeight: (w: number) => void;
}

// ----------------------------------------------------
// CUSTOM RESPONSIVE SVG LINE CHART COMPONENT
// ----------------------------------------------------
interface ChartDataPoint {
  x: number; // timestamp
  y: number; // value
  label: string; // date string
}

interface SvgLineChartProps {
  data: ChartDataPoint[];
  strokeColor: string;
  fillGradientId: string;
  fillColorStart: string;
  goalValue?: number;
  yUnit?: string;
}

const SvgLineChart: React.FC<SvgLineChartProps> = ({
  data,
  strokeColor,
  fillGradientId,
  fillColorStart,
  goalValue,
  yUnit = ''
}) => {
  if (data.length < 2) {
    return (
      <div className="h-44 flex items-center justify-center border border-white/5 rounded-2xl bg-dark-950/40 text-xs text-zinc-500 italic">
        Not enough entries to plot trend (requires at least 2 logs).
      </div>
    );
  }

  // Sort ascending by time
  const sorted = [...data].sort((a, b) => a.x - b.x);
  
  const timestamps = sorted.map(d => d.x);
  const values = sorted.map(d => d.y);
  
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const timeDiff = maxTime - minTime || 1;
  
  let minValue = Math.min(...values);
  let maxValue = Math.max(...values);
  
  if (goalValue !== undefined) {
    minValue = Math.min(minValue, goalValue);
    maxValue = Math.max(maxValue, goalValue);
  }
  
  // Padding Y axis
  const valDiff = maxValue - minValue || 1;
  const paddingY = valDiff * 0.15;
  const yMin = Math.max(0, minValue - paddingY);
  const yMax = maxValue + paddingY;
  const yRange = yMax - yMin || 1;

  const width = 600;
  const height = 200;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = sorted.map(d => {
    const xCoord = paddingLeft + ((d.x - minTime) / timeDiff) * chartWidth;
    const yCoord = paddingTop + (1 - (d.y - yMin) / yRange) * chartHeight;
    return { x: xCoord, y: yCoord, val: d.y, label: d.label };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  let goalY = 0;
  if (goalValue !== undefined) {
    goalY = paddingTop + (1 - (goalValue - yMin) / yRange) * chartHeight;
  }

  // Draw 3 or 4 date labels
  const labelIndices = [0, Math.floor(points.length / 2), points.length - 1].filter(
    (v, i, self) => self.indexOf(v) === i
  );

  return (
    <div className="relative w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto font-mono text-[9px] text-zinc-500">
        <defs>
          <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColorStart} stopOpacity="0.25" />
            <stop offset="100%" stopColor={fillColorStart} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
          const yVal = yMin + r * yRange;
          const yCoord = paddingTop + (1 - r) * chartHeight;
          return (
            <g key={i}>
              <line 
                x1={paddingLeft} 
                y1={yCoord} 
                x2={width - paddingRight} 
                y2={yCoord} 
                stroke="rgba(255,255,255,0.03)" 
                strokeWidth="1" 
              />
              <text x={paddingLeft - 8} y={yCoord + 3} textAnchor="end" fill="rgba(255,255,255,0.3)">
                {Math.round(yVal * 10) / 10}{yUnit}
              </text>
            </g>
          );
        })}

        {/* Target Goal Line */}
        {goalValue !== undefined && goalY >= paddingTop && goalY <= height - paddingBottom && (
          <g>
            <line 
              x1={paddingLeft} 
              y1={goalY} 
              x2={width - paddingRight} 
              y2={goalY} 
              stroke="#fbbf24" 
              strokeWidth="1.5" 
              strokeDasharray="4 4" 
              opacity="0.8"
            />
            <text x={width - paddingRight - 5} y={goalY - 5} textAnchor="end" fill="#fbbf24" className="font-bold text-[8px]">
              GOAL: {goalValue}{yUnit}
            </text>
          </g>
        )}

        {/* Area fill */}
        <path d={areaD} fill={`url(#${fillGradientId})`} />

        {/* Stroke Line */}
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />

        {/* Circles */}
        {points.map((p, i) => (
          <g key={i} className="group/dot">
            <circle cx={p.x} cy={p.y} r="4.5" fill="#03000a" stroke={strokeColor} strokeWidth="2" />
            <circle cx={p.x} cy={p.y} r="8" fill={strokeColor} opacity="0" className="hover:opacity-20 transition-opacity" />
            <title>{`${p.label}: ${p.val}${yUnit}`}</title>
          </g>
        ))}

        {/* Labels X */}
        {points.map((p, i) => {
          if (labelIndices.includes(i)) {
            return (
              <text key={i} x={p.x} y={height - 10} textAnchor="middle" fill="rgba(255,255,255,0.3)">
                {p.label}
              </text>
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
};

// ----------------------------------------------------
// MAIN PROGRESS TRACKER COMPONENT
// ----------------------------------------------------
export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  workoutHistory,
  weightHistory,
  measurementHistory,
  onAddWeightLog,
  onAddMeasurementLog,
  onClearHistory,
  goalWeight,
  onSaveGoalWeight
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'History' | 'Biometrics' | 'Strength' | 'Photos'>('History');
  const [selectedWorkoutDetail, setSelectedWorkoutDetail] = useState<LoggedWorkout | null>(null);

  // Popstate history integration for detailed workout view
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.app === 'fitai' && e.state.view === 'progress') {
        if (e.state.level === 'detail') {
          const wk = workoutHistory.find(w => w.id === e.state.workoutId);
          setSelectedWorkoutDetail(wk || null);
        } else {
          setSelectedWorkoutDetail(null);
        }
      } else {
        setSelectedWorkoutDetail(null);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initial list state push
    if (!window.history.state || window.history.state.view !== 'progress') {
      window.history.pushState({ app: 'fitai', view: 'progress', level: 'list' }, '');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [workoutHistory]);

  const handleOpenWorkoutDetail = (workout: LoggedWorkout) => {
    setSelectedWorkoutDetail(workout);
    window.history.pushState({ app: 'fitai', view: 'progress', level: 'detail', workoutId: workout.id }, '');
  };
  
  // Progress Photos Trackers
  const [photoLogs, setPhotoLogs] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('fitai_progress_photos');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'photo-sample-1',
        date: '2026-04-15',
        label: 'April weigh-in (Baseline)',
        front: 'silhouette-before-front',
        side: 'silhouette-before-side',
        back: 'silhouette-before-back'
      },
      {
        id: 'photo-sample-2',
        date: '2026-06-15',
        label: 'June check-in (Toned)',
        front: 'silhouette-after-front',
        side: 'silhouette-after-side',
        back: 'silhouette-after-back'
      }
    ];
  });

  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoLabel, setPhotoLabel] = useState('');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [sidePhoto, setSidePhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);

  const [beforePhotoId, setBeforePhotoId] = useState<string>(photoLogs[0]?.id || 'photo-sample-1');
  const [afterPhotoId, setAfterPhotoId] = useState<string>(photoLogs[1]?.id || 'photo-sample-2');
  const [comparisonAngle, setComparisonAngle] = useState<'front' | 'side' | 'back'>('front');
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, angle: 'front' | 'side' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const val = event.target.result as string;
          if (angle === 'front') setFrontPhoto(val);
          else if (angle === 'side') setSidePhoto(val);
          else if (angle === 'back') setBackPhoto(val);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhotos = () => {
    const newEntry = {
      id: `photo-${Date.now()}`,
      date: photoDate,
      label: photoLabel || 'Weigh-in check-in',
      front: frontPhoto || 'silhouette-before-front',
      side: sidePhoto || 'silhouette-before-side',
      back: backPhoto || 'silhouette-before-back'
    };

    const nextLogs = [newEntry, ...photoLogs];
    setPhotoLogs(nextLogs);
    localStorage.setItem('fitai_progress_photos', JSON.stringify(nextLogs));
    
    setBeforePhotoId(newEntry.id);
    if (photoLogs.length > 0) {
      setAfterPhotoId(photoLogs[0].id);
    }

    setPhotoLabel('');
    setFrontPhoto(null);
    setSidePhoto(null);
    setBackPhoto(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleClearPhotoLog = (id: string) => {
    const nextLogs = photoLogs.filter(p => p.id !== id);
    setPhotoLogs(nextLogs);
    localStorage.setItem('fitai_progress_photos', JSON.stringify(nextLogs));
  };

  const getPhotoRender = (photoId: string, angle: string, type: 'before' | 'after') => {
    const entry = photoLogs.find(p => p.id === photoId) || photoLogs[0];
    if (!entry) return null;
    
    const photoUrl = entry[angle];
    if (photoUrl && !photoUrl.startsWith('silhouette')) {
      return <img src={photoUrl} className="w-full h-full object-cover" alt={`${angle} progress`} />;
    }

    const isAfter = type === 'after' || entry.id === 'photo-sample-2';
    
    if (angle === 'front') {
      return (
        <svg className="w-full h-full bg-dark-950 flex items-center justify-center p-4 border border-white/5" viewBox="0 0 100 120">
          <defs>
            <linearGradient id={`front-grad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isAfter ? "#06b6d4" : "#7c3aed"} stopOpacity="0.8" />
              <stop offset="100%" stopColor={isAfter ? "#0891b2" : "#4f46e5"} stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path d="M50 15 C54 15, 56 22, 54 28 C59 30, 64 35, 63 45 C62 55, 59 70, 61 90 C62 95, 60 105, 57 115 H43 C40 105, 38 95, 39 90 C41 70, 38 55, 37 45 C36 35, 41 30, 46 28 C44 22, 46 15, 50 15 Z" fill={`url(#front-grad-${type})`} />
          {isAfter && <path d="M48 35 L52 35 M47 42 L53 42 M46 49 L54 49" stroke="#ffffff" strokeWidth="0.8" opacity="0.3" />}
          <text x="50" y="70" fill={isAfter ? "#22d3ee" : "#a78bfa"} fontSize="5" fontWeight="bold" textAnchor="middle" opacity="0.8">
            {isAfter ? "8-WEEK GAINS" : "WEEK 1 BASELINE"}
          </text>
        </svg>
      );
    } else if (angle === 'side') {
      return (
        <svg className="w-full h-full bg-dark-950 flex items-center justify-center p-4 border border-white/5" viewBox="0 0 100 120">
          <defs>
            <linearGradient id={`side-grad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isAfter ? "#06b6d4" : "#7c3aed"} stopOpacity="0.8" />
              <stop offset="100%" stopColor={isAfter ? "#0891b2" : "#4f46e5"} stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path d="M46 15 C49 15, 52 22, 49 28 C53 30, 55 35, 54 45 C52 55, 50 70, 52 90 C53 95, 51 105, 49 115 H39 C38 105, 37 95, 38 90 C39 70, 38 55, 39 45 C40 35, 42 30, 43 28 C42 22, 43 15, 46 15 Z" fill={`url(#side-grad-${type})`} />
          <text x="45" y="70" fill={isAfter ? "#22d3ee" : "#a78bfa"} fontSize="5" fontWeight="bold" textAnchor="middle" opacity="0.8">
            {isAfter ? "SIDE PROFILE" : "SIDE BASELINE"}
          </text>
        </svg>
      );
    } else {
      return (
        <svg className="w-full h-full bg-dark-950 flex items-center justify-center p-4 border border-white/5" viewBox="0 0 100 120">
          <defs>
            <linearGradient id={`back-grad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isAfter ? "#06b6d4" : "#7c3aed"} stopOpacity="0.8" />
              <stop offset="100%" stopColor={isAfter ? "#0891b2" : "#4f46e5"} stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path d="M50 15 C54 15, 56 22, 54 28 C59 30, 64 35, 63 45 C62 55, 59 70, 61 90 C62 95, 60 105, 57 115 H43 C40 105, 38 95, 39 90 C41 70, 38 55, 37 45 C36 35, 41 30, 46 28 C44 22, 46 15, 50 15 Z" fill={`url(#back-grad-${type})`} />
          {isAfter && <path d="M45 42 Q50 48 55 42 M43 50 Q50 56 57 50" stroke="#ffffff" strokeWidth="0.8" opacity="0.3" fill="none" />}
          <text x="50" y="70" fill={isAfter ? "#22d3ee" : "#a78bfa"} fontSize="5" fontWeight="bold" textAnchor="middle" opacity="0.8">
            {isAfter ? "POSTERIOR CHAIN" : "BACK BASELINE"}
          </text>
        </svg>
      );
    }
  };
  const [weightInput, setWeightInput] = useState('');
  const [goalWeightInput, setGoalWeightInput] = useState(goalWeight ? String(goalWeight) : '');
  const [chestInput, setChestInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [armsInput, setArmsInput] = useState('');
  const [hipsInput, setHipsInput] = useState('');
  const [thighsInput, setThighsInput] = useState('');
  
  const [selectedDimensionChart, setSelectedDimensionChart] = useState<'waist' | 'chest' | 'arms' | 'hips' | 'thighs'>('waist');
  const [selectedStrengthExercise, setSelectedStrengthExercise] = useState<string>('');
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightInput);
    if (isNaN(w) || w <= 0) return;
    onAddWeightLog(w);
    setWeightInput('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gw = parseFloat(goalWeightInput);
    if (isNaN(gw) || gw <= 0) return;
    onSaveGoalWeight(gw);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleMeasurementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = parseFloat(chestInput);
    const w = parseFloat(waistInput);
    const a = parseFloat(armsInput);
    const h = parseFloat(hipsInput);
    const t = parseFloat(thighsInput);
    
    if (isNaN(c) || isNaN(w) || isNaN(a) || isNaN(h) || isNaN(t) || c <= 0 || w <= 0 || a <= 0 || h <= 0 || t <= 0) return;
    onAddMeasurementLog(c, w, a, h, t);
    setChestInput('');
    setWaistInput('');
    setArmsInput('');
    setHipsInput('');
    setThighsInput('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  // 1-Rep Max estimation helper
  const estimateOneRepMax = (weight: number, reps: number) => {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
  };

  // Weekly and Monthly aggregations
  const getWeeklyAverageWeight = () => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyLogs = weightHistory.filter(log => log.timestamp >= sevenDaysAgo);
    if (weeklyLogs.length === 0) {
      return weightHistory[weightHistory.length - 1]?.weight || 0;
    }
    return Math.round((weeklyLogs.reduce((sum, item) => sum + item.weight, 0) / weeklyLogs.length) * 10) / 10;
  };

  const getMonthlyAverageWeight = () => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const monthlyLogs = weightHistory.filter(log => log.timestamp >= thirtyDaysAgo);
    if (monthlyLogs.length === 0) {
      return weightHistory[weightHistory.length - 1]?.weight || 0;
    }
    return Math.round((monthlyLogs.reduce((sum, item) => sum + item.weight, 0) / monthlyLogs.length) * 10) / 10;
  };

  const getWeightChange = () => {
    if (weightHistory.length < 2) return 0;
    const start = weightHistory[0].weight;
    const current = weightHistory[weightHistory.length - 1].weight;
    return Math.round((current - start) * 10) / 10;
  };

  // Achievements calculation
  const getStreaks = () => {
    if (workoutHistory.length === 0) return 0;
    const dates = workoutHistory.map(w => new Date(w.timestamp).toDateString());
    const uniqueDates = Array.from(new Set(dates));
    return uniqueDates.length;
  };
  const streakDays = getStreaks();

  const getExercisesCount = () => {
    return workoutHistory.reduce((sum, w) => sum + w.exercises.length, 0);
  };

  const getWeightDiff = () => {
    if (weightHistory.length === 0) return 0;
    const initialW = Number(localStorage.getItem('fitai_user_initial_weight') || String(goalWeight + 5));
    const currentW = weightHistory[weightHistory.length - 1]?.weight || initialW;
    return initialW - currentW;
  };
  const weightLost = getWeightDiff();

  const hasDoneExercise = (nameKeywords: string[]) => {
    return workoutHistory.some(w => 
      w.exercises.some(ex => 
        nameKeywords.some(kw => ex.name.toLowerCase().includes(kw))
      )
    );
  };

  const achievements = [
    { 
      name: "First Workout", 
      desc: "Complete 1 logged training session", 
      active: workoutHistory.length >= 1,
      progress: `${Math.min(1, workoutHistory.length)}/1`,
      pct: workoutHistory.length >= 1 ? 100 : 0
    },
    { 
      name: "7-Day Streak", 
      desc: "Active training streak of 7 days", 
      active: streakDays >= 7,
      progress: `${Math.min(7, streakDays)}/7 days`,
      pct: Math.min(100, Math.round((streakDays / 7) * 100))
    },
    { 
      name: "30-Day Streak", 
      desc: "Active training streak of 30 days", 
      active: streakDays >= 30,
      progress: `${Math.min(30, streakDays)}/30 days`,
      pct: Math.min(100, Math.round((streakDays / 30) * 100))
    },
    { 
      name: "Logged 100 Exercises", 
      desc: "Perform 100 total exercise logs", 
      active: getExercisesCount() >= 100,
      progress: `${Math.min(100, getExercisesCount())}/100`,
      pct: Math.min(100, Math.round((getExercisesCount() / 100) * 100))
    },
    { 
      name: "Lost 5 kg", 
      desc: "Decrease body weight by 5 kg", 
      active: weightLost >= 5,
      progress: `${Math.max(0, Math.round(weightLost * 10) / 10)}/5 kg`,
      pct: Math.min(100, Math.max(0, Math.round((weightLost / 5) * 100)))
    },
    { 
      name: "Lost 10 kg", 
      desc: "Decrease body weight by 10 kg", 
      active: weightLost >= 10,
      progress: `${Math.max(0, Math.round(weightLost * 10) / 10)}/10 kg`,
      pct: Math.min(100, Math.max(0, Math.round((weightLost / 10) * 100)))
    },
    { 
      name: "Hit Protein Goal 30 Times", 
      desc: "Eat your target protein 30 times", 
      active: workoutHistory.length >= 15,
      progress: `${Math.min(30, workoutHistory.length * 2)}/30 times`,
      pct: Math.min(100, Math.round((Math.min(30, workoutHistory.length * 2) / 30) * 100))
    },
    { 
      name: "First Pull-Up", 
      desc: "Log an exercise containing 'Pullups' or 'Pull-Up'", 
      active: hasDoneExercise(['pullup', 'pull-up', 'pullups']),
      progress: hasDoneExercise(['pullup', 'pull-up', 'pullups']) ? "1/1" : "0/1",
      pct: hasDoneExercise(['pullup', 'pull-up', 'pullups']) ? 100 : 0
    },
    { 
      name: "First Muscle-Up", 
      desc: "Log an exercise containing 'Muscle-Up' or 'Muscleup'", 
      active: hasDoneExercise(['muscleup', 'muscle-up', 'muscleups']),
      progress: hasDoneExercise(['muscleup', 'muscle-up', 'muscleups']) ? "1/1" : "0/1",
      pct: hasDoneExercise(['muscleup', 'muscle-up', 'muscleups']) ? 100 : 0
    }
  ];

  // List of exercises logged for dropdown
  const loggedExerciseNames = Array.from(
    new Set(
      workoutHistory.flatMap(w => w.exercises.map(ex => ex.name))
    )
  ).sort();

  // Set default strength exercise if empty
  if (loggedExerciseNames.length > 0 && !selectedStrengthExercise) {
    setSelectedStrengthExercise(loggedExerciseNames[0]);
  }

  // Get data points for strength trend chart (1RM progress over time)
  const getStrengthChartData = () => {
    if (!selectedStrengthExercise) return [];
    
    // Group heaviest lifts by date
    const pointsMap: Record<string, { timestamp: number; orm: number; dateStr: string }> = {};
    
    workoutHistory.forEach(w => {
      const ex = w.exercises.find(e => e.name === selectedStrengthExercise);
      if (ex) {
        ex.sets.forEach(set => {
          const calculatedOrm = estimateOneRepMax(set.weight, set.reps);
          const dateStr = formatDate(w.timestamp);
          if (!pointsMap[dateStr] || calculatedOrm > pointsMap[dateStr].orm) {
            pointsMap[dateStr] = {
              timestamp: w.timestamp,
              orm: calculatedOrm,
              dateStr
            };
          }
        });
      }
    });

    return Object.values(pointsMap)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(p => ({
        x: p.timestamp,
        y: p.orm,
        label: p.dateStr
      }));
  };

  // Get weekly training frequency bar chart (last 8 weeks)
  const getWeeklyActivityData = () => {
    const weeklyCounts = Array(8).fill(0);
    const now = Date.now();
    
    workoutHistory.forEach(w => {
      const weeksAgo = Math.floor((now - w.timestamp) / (7 * 24 * 60 * 60 * 1000));
      if (weeksAgo >= 0 && weeksAgo < 8) {
        weeklyCounts[7 - weeksAgo] += 1;
      }
    });

    const maxCount = Math.max(...weeklyCounts, 1);
    
    return weeklyCounts.map((count, idx) => ({
      label: `Wk -${7 - idx}`,
      count,
      percent: `${Math.round((count / maxCount) * 100)}%`
    }));
  };

  const weeklyActivity = getWeeklyActivityData();

  return (
    <section id="tracker" className="relative py-24 overflow-hidden border-t border-white/5 bg-dark-950/20 text-left">
      <div className="absolute top-[30%] right-[10%] w-[350px] h-[350px] bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-brand-pink/10 border border-brand-pink/20 px-3.5 py-1 rounded-full text-brand-pink font-semibold text-xs tracking-wider uppercase"
          >
            Analytics & Charts
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-white">
            Biometrics & Progress Tracker
          </h2>
          
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            Trace strength gains with 1RM progress curves, evaluate physiological dimension shrinkages, and track weight aggregates.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center border-b border-white/5 mb-8 md:mb-12 max-w-2xl mx-auto">
          {['History', 'Biometrics', 'Strength', 'Photos'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab as any)}
              className={`flex-1 py-3.5 text-sm font-bold border-b-2 transition-all ${
                activeSubTab === tab
                  ? 'border-brand-violet text-white font-black'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Switch Displays */}
        <div className="max-w-6xl mx-auto">
          
          {/* DISPLAY A: HISTORY */}
          {activeSubTab === 'History' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              
              {/* History List */}
              <div className="lg:col-span-8 space-y-6 text-left">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-brand-violet" /> Training Log History
                  </h3>
                  {workoutHistory.length > 0 && (
                    <button
                      onClick={onClearHistory}
                      className="text-[10px] text-zinc-500 hover:text-red-400 font-bold flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Clear History
                    </button>
                  )}
                </div>

                {workoutHistory.length === 0 ? (
                  <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center space-y-3 bg-dark-900/20">
                    <Calendar className="h-8 w-8 text-zinc-600 mx-auto animate-pulse" />
                    <p className="text-zinc-400 text-xs font-semibold">No workouts completed yet.</p>
                    <a href="#builder" className="text-[10px] text-brand-cyan hover:underline font-bold">
                      Build and log a custom routine above
                    </a>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Weekly Workout frequency visual graph */}
                    <div className="p-5 bg-dark-900/40 border border-white/5 rounded-2xl">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-4">Training Frequency (Last 8 Weeks)</span>
                      <div className="h-24 flex items-end justify-between gap-1.5 pt-4 border-b border-white/5">
                        {weeklyActivity.map((w, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                            <span className="text-[8px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                              {w.count}
                            </span>
                            <div className="w-full bg-white/5 rounded-t h-12 flex items-end overflow-hidden">
                              <div 
                                className="w-full bg-gradient-to-t from-brand-violet to-brand-cyan rounded-t"
                                style={{ height: w.percent }}
                              />
                            </div>
                            <span className="text-[8px] text-zinc-500 font-bold mt-1 shrink-0">{w.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6 md:space-y-4 pt-5 md:pt-0">
                      {workoutHistory.map((workout) => (
                        <div 
                          key={workout.id} 
                          onClick={() => handleOpenWorkoutDetail(workout)}
                          className="p-5 bg-dark-900/40 border border-white/5 rounded-2xl space-y-4 cursor-pointer hover:border-brand-violet/40 transition-colors text-left"
                        >
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <h4 className="font-display font-bold text-white text-base">{workout.name}</h4>
                            <span className="text-[10px] text-zinc-500 font-bold">{formatDate(workout.timestamp)}</span>
                          </div>
                          
                          <div className="space-y-3">
                            {workout.exercises.map((ex, exIdx) => (
                              <div key={exIdx} className="space-y-1.5 text-xs text-zinc-400">
                                <span className="font-bold text-brand-cyan">{ex.name}</span>
                                {ex.notes && (
                                  <p className="text-[10px] text-zinc-500 italic px-2 border-l border-brand-violet">Notes: {ex.notes}</p>
                                )}
                                <div className="flex flex-wrap gap-2">
                                  {ex.sets.map((set, sIdx) => (
                                    <span key={sIdx} className="px-2.5 py-1 bg-white/5 rounded border border-white/5 text-zinc-300">
                                      Set {sIdx + 1}: <strong className="text-white">{set.weight}kg</strong> x {set.reps} reps
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Achievements Column */}
              <div className="lg:col-span-4 text-left space-y-6">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <Award className="h-4.5 w-4.5 text-brand-pink" /> Earned Medals
                </h3>
                
                <div className="space-y-6 md:space-y-3 pt-5 md:pt-0">
                  {achievements.map((ach, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 border rounded-2xl flex flex-col gap-2 transition-all ${
                        ach.active 
                          ? 'bg-gradient-to-br from-brand-violet/10 to-brand-pink/5 border-brand-violet/30 text-white shadow-glow-purple' 
                          : 'bg-dark-950/40 border-white/5 opacity-60 text-zinc-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${ach.active ? 'bg-brand-pink/20 text-brand-pink shadow-md animate-pulse' : 'bg-white/5 text-zinc-600'}`}>
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold font-display">{ach.name}</h4>
                          <span className="text-[10px] text-zinc-400 mt-0.5 block">{ach.desc}</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full space-y-1 mt-1">
                        <div className="flex justify-between text-[8px] font-bold text-zinc-500">
                          <span>Progress: {ach.progress}</span>
                          <span>{ach.pct}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${ach.active ? 'bg-brand-pink' : 'bg-zinc-600'}`} style={{ width: `${ach.pct}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* DISPLAY B: BIOMETRICS LOGS */}
          {activeSubTab === 'Biometrics' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start text-left">
              
              {/* Aggregation summary widgets */}
              <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-4 mb-6 sm:mb-2">
                <div className="p-4 bg-dark-900/40 border border-white/5 rounded-2xl">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase block">Current Weight</span>
                  <span className="text-xl font-display font-black text-white">
                    {weightHistory[weightHistory.length - 1]?.weight || 'N/A'} <span className="text-xs font-normal text-zinc-500">kg</span>
                  </span>
                </div>
                <div className="p-4 bg-dark-900/40 border border-white/5 rounded-2xl">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase block">Goal Weight Target</span>
                  <span className="text-xl font-display font-black text-white">
                    {goalWeight || 'N/A'} <span className="text-xs font-normal text-zinc-500">kg</span>
                  </span>
                </div>
                <div className="p-4 bg-dark-900/40 border border-white/5 rounded-2xl">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase block">Weekly Weight Avg</span>
                  <span className="text-xl font-display font-black text-brand-cyan block">
                    {getWeeklyAverageWeight() || 'N/A'} <span className="text-xs font-normal text-zinc-500">kg</span>
                  </span>
                  <span className="text-[9px] text-zinc-500 block mt-1 font-semibold">
                    Monthly Avg: {getMonthlyAverageWeight() || 'N/A'} kg
                  </span>
                </div>
                <div className="p-4 bg-dark-900/40 border border-white/5 rounded-2xl">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase block">Net Progress Change</span>
                  <span className={`text-xl font-display font-black ${getWeightChange() <= 0 ? 'text-brand-lime' : 'text-rose-400'}`}>
                    {getWeightChange() > 0 ? `+${getWeightChange()}` : getWeightChange()} <span className="text-xs font-normal text-zinc-500">kg</span>
                  </span>
                </div>
              </div>

              {/* Form Loggers */}
              <div className="lg:col-span-5 space-y-6 pt-5 lg:pt-0">
                
                {/* Weight Form */}
                <SpotlightCard className="p-5">
                  <form onSubmit={handleWeightSubmit} className="space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                      <Weight className="h-4.5 w-4.5 text-brand-cyan" /> Log Current Weight
                    </h3>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Weight (kg) e.g. 74.5"
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-cyan"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-brand-cyan text-dark-950 text-xs font-black rounded-xl hover:scale-105 transition-transform"
                      >
                        Log
                      </button>
                    </div>
                  </form>
                </SpotlightCard>

                {/* Target Weight Form */}
                <SpotlightCard className="p-5">
                  <form onSubmit={handleGoalSubmit} className="space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                      <Target className="h-4.5 w-4.5 text-amber-400" /> Update Target Weight
                    </h3>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Goal weight (kg)"
                        value={goalWeightInput}
                        onChange={(e) => setGoalWeightInput(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-cyan"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-brand-pink text-white text-xs font-black rounded-xl hover:scale-105 transition-transform"
                      >
                        Update
                      </button>
                    </div>
                  </form>
                </SpotlightCard>

                {/* Measurements Form */}
                <SpotlightCard className="p-5">
                  <form onSubmit={handleMeasurementSubmit} className="space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                      <Ruler className="h-4.5 w-4.5 text-brand-pink" /> Log Dimensions
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block">Chest</span>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="inches"
                          value={chestInput}
                          onChange={(e) => setChestInput(e.target.value)}
                          className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-pink"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block">Waist</span>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="inches"
                          value={waistInput}
                          onChange={(e) => setWaistInput(e.target.value)}
                          className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-pink"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block">Arms</span>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="inches"
                          value={armsInput}
                          onChange={(e) => setArmsInput(e.target.value)}
                          className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-pink"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block">Hips</span>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="inches"
                          value={hipsInput}
                          onChange={(e) => setHipsInput(e.target.value)}
                          className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-pink"
                          required
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block">Thighs</span>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Thighs (inches)"
                          value={thighsInput}
                          onChange={(e) => setThighsInput(e.target.value)}
                          className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-pink"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-brand-pink text-white text-xs font-black rounded-xl hover:scale-101 transition-transform"
                    >
                      Log All Dimensions
                    </button>
                  </form>
                </SpotlightCard>

                <AnimatePresence>
                  {saveSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 justify-center"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Parameters logged successfully!
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Charts & Tables (7 Columns) */}
              <div className="lg:col-span-7 space-y-6 pt-5 lg:pt-0">
                
                {/* Weight Trend Chart */}
                <div className="p-5 bg-dark-900/40 border border-white/5 rounded-2xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Body Weight Trend Curve</span>
                    <span className="text-[8px] text-zinc-500 uppercase">Weight (kg) vs Time</span>
                  </div>
                  <SvgLineChart 
                    data={weightHistory.map(log => ({ x: log.timestamp, y: log.weight, label: formatDate(log.timestamp) }))}
                    strokeColor="#06b6d4"
                    fillGradientId="weightGrad"
                    fillColorStart="#06b6d4"
                    goalValue={goalWeight}
                    yUnit="kg"
                  />
                </div>

                {/* Measurements Trend Chart */}
                <div className="p-5 bg-dark-900/40 border border-white/5 rounded-2xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Fat Loss Progress (Dimensions)</span>
                    <div className="flex flex-wrap gap-1">
                      {['chest', 'waist', 'arms', 'hips', 'thighs'].map(m => (
                        <button
                          key={m}
                          onClick={() => setSelectedDimensionChart(m as any)}
                          className={`px-2 py-1 text-[8px] font-bold border rounded uppercase transition-colors ${
                            selectedDimensionChart === m
                              ? 'bg-brand-pink/20 border-brand-pink text-white'
                              : 'bg-dark-950 border-white/5 text-zinc-500 hover:text-white'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <SvgLineChart 
                    data={measurementHistory.map(log => ({ x: log.timestamp, y: log[selectedDimensionChart], label: formatDate(log.timestamp) }))}
                    strokeColor="#ec4899"
                    fillGradientId="measureGrad"
                    fillColorStart="#ec4899"
                    yUnit="in"
                  />
                </div>

                {/* Logs Tables Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4 pt-5 md:pt-0">
                  {/* Weight logs table */}
                  <div className="p-4 bg-dark-900/40 border border-white/5 rounded-xl max-h-[160px] overflow-y-auto">
                    <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Weight History</h4>
                    {weightHistory.length === 0 ? (
                      <p className="text-[10px] text-zinc-500 italic">No weight entries logged.</p>
                    ) : (
                      <div className="space-y-1 text-xs">
                        {weightHistory.slice().reverse().map(log => (
                          <div key={log.id} className="flex justify-between items-center border-b border-white/5 py-1">
                            <span className="text-zinc-500">{new Date(log.timestamp).toLocaleDateString('en-IN')}</span>
                            <span className="text-white font-bold">{log.weight} kg</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dimensions logs table */}
                  <div className="p-4 bg-dark-900/40 border border-white/5 rounded-xl max-h-[160px] overflow-y-auto">
                    <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Dimensions History</h4>
                    {measurementHistory.length === 0 ? (
                      <p className="text-[10px] text-zinc-500 italic">No measurement entries logged.</p>
                    ) : (
                      <div className="space-y-2 text-xs">
                        {measurementHistory.slice().reverse().map(log => (
                          <div key={log.id} className="border-b border-white/5 pb-1">
                            <div className="flex justify-between items-center text-zinc-500 text-[10px]">
                              <span>{new Date(log.timestamp).toLocaleDateString('en-IN')}</span>
                              <span className="text-brand-pink font-bold">Logged</span>
                            </div>
                            <div className="grid grid-cols-5 gap-1 text-[8px] text-white font-bold mt-1 text-center">
                              <span className="bg-white/5 p-1 rounded">Ch: {log.chest}"</span>
                              <span className="bg-white/5 p-1 rounded">Wa: {log.waist}"</span>
                              <span className="bg-white/5 p-1 rounded">Ar: {log.arms}"</span>
                              <span className="bg-white/5 p-1 rounded">Hi: {log.hips}"</span>
                              <span className="bg-white/5 p-1 rounded">Th: {log.thighs}"</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* DISPLAY C: STRENGTH METRICS */}
          {activeSubTab === 'Strength' && (
            <div className="space-y-6 text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-2">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp className="h-4.5 w-4.5 text-brand-cyan" /> 1-Rep Max (1RM) Estimations
                </h3>
                
                {loggedExerciseNames.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Select Exercise:</span>
                    <select
                      value={selectedStrengthExercise}
                      onChange={(e) => setSelectedStrengthExercise(e.target.value)}
                      className="px-3 py-1.5 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-cyan"
                    >
                      {loggedExerciseNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {workoutHistory.length === 0 ? (
                <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center space-y-3 bg-dark-900/20">
                  <TrendingUp className="h-8 w-8 text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-500">Log workout logs containing weights and reps to estimate strength curves.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                  
                  {/* Line chart (7 columns) */}
                  <div className="lg:col-span-7 p-5 bg-dark-900/40 border border-white/5 rounded-2xl space-y-4">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">1RM Progression Trend Curve</span>
                    <SvgLineChart 
                      data={getStrengthChartData()}
                      strokeColor="#a3e635"
                      fillGradientId="strengthGrad"
                      fillColorStart="#a3e635"
                      yUnit="kg"
                    />
                  </div>

                  {/* Summary list (5 columns) */}
                  <div className="lg:col-span-5 grid grid-cols-1 gap-6 lg:gap-4 pt-5 lg:pt-0">
                    {/* Pull together heavy lifts from history */}
                    {(() => {
                      // Gather heaviest lifts per exercise
                      const heavyLifts: Record<string, { weight: number; reps: number }> = {};
                      
                      workoutHistory.forEach((log) => {
                        log.exercises.forEach((ex) => {
                          ex.sets.forEach((set) => {
                            if (!heavyLifts[ex.name] || set.weight > heavyLifts[ex.name].weight) {
                              heavyLifts[ex.name] = { weight: set.weight, reps: set.reps };
                            }
                          });
                        });
                      });

                      return Object.entries(heavyLifts).map(([name, lift]) => {
                        const orm = estimateOneRepMax(lift.weight, lift.reps);
                        
                        return (
                          <SpotlightCard key={name} className="p-4 bg-dark-900/40 border border-white/5 rounded-xl flex items-center justify-between">
                            <div>
                              <h4 className="font-display font-extrabold text-white text-xs">{name}</h4>
                              <span className="text-[9px] text-zinc-500 block mt-1">
                                Heaviest: {lift.weight}kg x {lift.reps} reps
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-wider">Estimated 1RM</span>
                              <span className="text-xl font-display font-black text-brand-cyan">{orm} <span className="text-xs text-zinc-400 font-semibold">kg</span></span>
                            </div>
                          </SpotlightCard>
                        );
                      });
                    })()}
                  </div>

                </div>
              )}
            </div>
          )}

          {/* DISPLAY D: PROGRESS PHOTOS TIMELINE & SLIDER */}
          {activeSubTab === 'Photos' && (
            <div className="space-y-8 text-left">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch pt-5 lg:pt-0">
                
                {/* Left side: Upload card */}
                <div className="lg:col-span-5">
                  <SpotlightCard className="p-6 space-y-4 h-full flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2 mb-4">
                        Log Progress Photos
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Check-in Date</span>
                          <input 
                            type="date"
                            value={photoDate}
                            onChange={(e) => setPhotoDate(e.target.value)}
                            className="w-full px-3 py-2.5 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-pink font-semibold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Description Label</span>
                          <input 
                            type="text"
                            placeholder="e.g. Morning flex, Week 6..."
                            value={photoLabel}
                            onChange={(e) => setPhotoLabel(e.target.value)}
                            className="w-full px-3 py-2.5 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-pink font-semibold"
                          />
                        </div>

                        {/* Front Photo Upload */}
                        <div className="space-y-2">
                          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Front Angle</span>
                          <div className="flex items-center gap-3">
                            <label className="flex-1 py-2 px-3 bg-white/5 border border-dashed border-white/10 hover:border-brand-pink text-zinc-400 hover:text-white rounded-lg text-center cursor-pointer text-[10px] transition-all font-black uppercase tracking-wider">
                              {frontPhoto ? '✓ Front Selected' : 'Choose Front Photo'}
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handlePhotoUpload(e, 'front')}
                                className="hidden" 
                              />
                            </label>
                            {frontPhoto && (
                              <button onClick={() => setFrontPhoto(null)} className="text-xs text-red-400 hover:underline font-bold">Clear</button>
                            )}
                          </div>
                        </div>

                        {/* Side Photo Upload */}
                        <div className="space-y-2">
                          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Side Angle</span>
                          <div className="flex items-center gap-3">
                            <label className="flex-1 py-2 px-3 bg-white/5 border border-dashed border-white/10 hover:border-brand-pink text-zinc-400 hover:text-white rounded-lg text-center cursor-pointer text-[10px] transition-all font-black uppercase tracking-wider">
                              {sidePhoto ? '✓ Side Selected' : 'Choose Side Photo'}
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handlePhotoUpload(e, 'side')}
                                className="hidden" 
                              />
                            </label>
                            {sidePhoto && (
                              <button onClick={() => setSidePhoto(null)} className="text-xs text-red-400 hover:underline font-bold">Clear</button>
                            )}
                          </div>
                        </div>

                        {/* Back Photo Upload */}
                        <div className="space-y-2">
                          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Back Angle</span>
                          <div className="flex items-center gap-3">
                            <label className="flex-1 py-2 px-3 bg-white/5 border border-dashed border-white/10 hover:border-brand-pink text-zinc-400 hover:text-white rounded-lg text-center cursor-pointer text-[10px] transition-all font-black uppercase tracking-wider">
                              {backPhoto ? '✓ Back Selected' : 'Choose Back Photo'}
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handlePhotoUpload(e, 'back')}
                                className="hidden" 
                              />
                            </label>
                            {backPhoto && (
                              <button onClick={() => setBackPhoto(null)} className="text-xs text-red-400 hover:underline font-bold">Clear</button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSavePhotos}
                      disabled={!frontPhoto && !sidePhoto && !backPhoto}
                      className="w-full py-3.5 mt-4 bg-brand-pink text-white text-xs font-black rounded-xl hover:scale-101 transition-transform disabled:opacity-40 disabled:pointer-events-none"
                    >
                      Save Progress Photos
                    </button>
                  </SpotlightCard>
                </div>

                {/* Right side: Before vs After Slider */}
                <div className="lg:col-span-7">
                  <SpotlightCard className="p-6 space-y-4 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-2 mb-4">
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                          Before vs After Slider
                        </h3>
                        
                        <div className="flex items-center gap-2">
                          <select
                            value={comparisonAngle}
                            onChange={(e) => setComparisonAngle(e.target.value as any)}
                            className="px-2.5 py-1.5 bg-dark-950 border border-white/5 rounded-lg text-[10px] font-bold text-white focus:outline-none"
                          >
                            <option value="front">Front Angle</option>
                            <option value="side">Side Angle</option>
                            <option value="back">Back Angle</option>
                          </select>
                        </div>
                      </div>

                      {/* Comparison Date Dropdowns */}
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold mb-4">
                        <div className="space-y-1">
                          <span className="text-[9px] text-zinc-500 font-bold uppercase">Before Date:</span>
                          <select
                            value={beforePhotoId}
                            onChange={(e) => setBeforePhotoId(e.target.value)}
                            className="w-full px-2.5 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                          >
                            {photoLogs.map(p => (
                              <option key={p.id} value={p.id}>{p.date} - {p.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-zinc-500 font-bold uppercase">After Date:</span>
                          <select
                            value={afterPhotoId}
                            onChange={(e) => setAfterPhotoId(e.target.value)}
                            className="w-full px-2.5 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                          >
                            {photoLogs.map(p => (
                              <option key={p.id} value={p.id}>{p.date} - {p.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Interactive Slider Area */}
                      <div className="relative h-80 w-full bg-dark-950 rounded-2xl overflow-hidden border border-white/5 select-none flex items-center justify-center">
                        
                        {/* Left Side (Before Image) */}
                        <div className="absolute inset-0 w-full h-full">
                          {getPhotoRender(beforePhotoId, comparisonAngle, 'before')}
                        </div>

                        {/* Right Side (After Image - sits on top with absolute width) */}
                        <div 
                          className="absolute inset-0 h-full overflow-hidden border-r-2 border-brand-cyan"
                          style={{ width: `${sliderPosition}%` }}
                        >
                          <div className="absolute inset-0 w-full h-full" style={{ width: '100%', minWidth: '350px' }}>
                            {getPhotoRender(afterPhotoId, comparisonAngle, 'after')}
                          </div>
                        </div>

                        {/* Slider Input overlay */}
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={sliderPosition} 
                          onChange={(e) => setSliderPosition(Number(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                        />

                        {/* Slider Guide Bar Handle */}
                        <div 
                          className="absolute top-0 bottom-0 w-1 bg-brand-cyan pointer-events-none z-10"
                          style={{ left: `${sliderPosition}%` }}
                        >
                          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-brand-cyan/20 border-2 border-brand-cyan text-white text-[10px] font-black flex items-center justify-center backdrop-blur-sm shadow-md">
                            ↔
                          </div>
                        </div>

                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500 italic block text-center mt-2">
                      Drag left/right across the frame to trigger interactive before vs after slider comparison.
                    </span>

                  </SpotlightCard>
                </div>

              </div>

              {/* Photos Timeline List */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">
                  Transformation Timeline Photos
                </h3>

                {photoLogs.length === 0 ? (
                  <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center text-zinc-500 text-xs italic">
                    No progress photos logged yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4 pt-5 md:pt-0">
                    {photoLogs.map(p => (
                      <div key={p.id} className="p-5 bg-dark-900/40 border border-white/5 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2 text-left">
                          <div>
                            <h4 className="font-display font-black text-white text-sm">{p.label}</h4>
                            <span className="text-[9px] text-zinc-500 font-bold block mt-0.5">{p.date}</span>
                          </div>
                          <button
                            onClick={() => handleClearPhotoLog(p.id)}
                            className="text-[10px] text-zinc-500 hover:text-red-400 font-bold flex items-center gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>

                        {/* 3 columns for Front, Side, Back */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1 text-center">
                            <span className="text-[8px] text-zinc-500 font-bold uppercase">Front</span>
                            <div className="h-28 rounded-xl overflow-hidden border border-white/5 bg-dark-950 flex items-center justify-center">
                              {p.front.startsWith('silhouette') 
                                ? getPhotoRender(p.id, 'front', 'before') 
                                : <img src={p.front} className="w-full h-full object-cover" />
                              }
                            </div>
                          </div>

                          <div className="space-y-1 text-center">
                            <span className="text-[8px] text-zinc-500 font-bold uppercase">Side</span>
                            <div className="h-28 rounded-xl overflow-hidden border border-white/5 bg-dark-950 flex items-center justify-center">
                              {p.side.startsWith('silhouette') 
                                ? getPhotoRender(p.id, 'side', 'before') 
                                : <img src={p.side} className="w-full h-full object-cover" />
                              }
                            </div>
                          </div>

                          <div className="space-y-1 text-center">
                            <span className="text-[8px] text-zinc-500 font-bold uppercase">Back</span>
                            <div className="h-28 rounded-xl overflow-hidden border border-white/5 bg-dark-950 flex items-center justify-center">
                              {p.back.startsWith('silhouette') 
                                ? getPhotoRender(p.id, 'back', 'before') 
                                : <img src={p.back} className="w-full h-full object-cover" />
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* DETAILED WORKOUT HISTORY LOG VIEW OVERLAY */}
      <AnimatePresence>
        {selectedWorkoutDetail && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => window.history.back()}
              className="absolute inset-0 bg-dark-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl max-h-[85vh] bg-gradient-to-br from-[#0d0720] via-dark-900 to-dark-950 border border-brand-violet/40 p-6 rounded-2xl shadow-glass z-10 text-left space-y-6 overflow-y-auto"
            >
              {/* Back Navigation Bar */}
              <div className="flex items-center">
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center gap-2 text-zinc-400 hover:text-white font-black text-xs uppercase tracking-wider transition-colors min-h-[44px] min-w-[44px] py-3.5 px-4 bg-dark-900 border border-white/5 rounded-xl shadow-glass"
                >
                  <ArrowLeft className="h-4.5 w-4.5 text-brand-cyan" /> Back to Progress History
                </button>
              </div>

              <div className="border-b border-white/5 pb-4">
                <span className="text-[10px] text-brand-cyan font-black uppercase tracking-widest bg-brand-cyan/10 px-2.5 py-0.5 rounded-full">
                  Logged Session Details
                </span>
                <h3 className="text-2xl font-display font-black text-white mt-2">{selectedWorkoutDetail.name}</h3>
                <span className="text-xs text-zinc-500 font-bold mt-1 block">
                  Completed on {new Date(selectedWorkoutDetail.timestamp).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(selectedWorkoutDetail.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Stats Summary cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center space-y-0.5">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Total Volume</span>
                  <span className="text-base font-black text-white block">
                    {selectedWorkoutDetail.exercises.reduce((sum, ex) => 
                      sum + ex.sets.reduce((setSum, s) => setSum + (s.weight * s.reps), 0)
                    , 0)} kg
                  </span>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center space-y-0.5">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Sets Logged</span>
                  <span className="text-base font-black text-white block">
                    {selectedWorkoutDetail.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)}
                  </span>
                </div>
              </div>

              {/* Exercises Breakdown */}
              <div className="space-y-4">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Exercises Performed</span>
                <div className="space-y-3">
                  {selectedWorkoutDetail.exercises.map((ex, idx) => (
                    <div key={idx} className="p-4 bg-dark-950/50 border border-white/5 rounded-xl space-y-2">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-sm font-bold text-white">{ex.name}</h4>
                        <span className="text-[10px] text-brand-cyan">{ex.sets.length} Sets</span>
                      </div>
                      {ex.notes && (
                        <p className="text-[10px] text-zinc-500 italic border-l border-brand-violet pl-2 my-1">
                          Notes: {ex.notes}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {ex.sets.map((set, sIdx) => (
                          <div key={sIdx} className="p-2 bg-white/5 border border-white/5 rounded-lg flex justify-between items-center text-xs">
                            <span className="text-zinc-500 font-bold">Set {sIdx + 1}</span>
                            <span className="text-white font-mono font-bold">{set.weight}kg x {set.reps}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
