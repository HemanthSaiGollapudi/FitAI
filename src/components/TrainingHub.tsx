import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, BookOpen, TrendingUp } from 'lucide-react';
import { ExerciseLibrary } from './ExerciseLibrary';
import { WorkoutBuilder } from './WorkoutBuilder';
import { ProgressTracker } from './ProgressTracker';
import type { WorkoutRoutine } from './WorkoutBuilder';
import type { LoggedWorkout, WeightLog, MeasurementLog } from './ProgressTracker';

interface TrainingHubProps {
  activeTab: 'library' | 'logger' | 'progress';
  onTabChange: (tab: 'library' | 'logger' | 'progress') => void;
  // ExerciseLibrary props
  onSaveExercise: (id: string) => void;
  onCompleteExercise: (id: string) => void;
  savedExercises: string[];
  completedExercises: string[];
  // WorkoutBuilder props
  customRoutines: WorkoutRoutine[];
  onSaveRoutine: (routine: WorkoutRoutine) => void;
  onDeleteRoutine: (id: string) => void;
  onDuplicateRoutine: (routine: WorkoutRoutine) => void;
  onStartWorkout: (routine: WorkoutRoutine) => void;
  // ProgressTracker props
  workoutHistory: LoggedWorkout[];
  weightHistory: WeightLog[];
  measurementHistory: MeasurementLog[];
  onAddWeightLog: (weight: number) => void;
  onAddMeasurementLog: (chest: number, waist: number, arms: number, hips: number, thighs: number) => void;
  onClearHistory: () => void;
  goalWeight: number;
  onSaveGoalWeight: (w: number) => void;
}

export const TrainingHub: React.FC<TrainingHubProps> = ({
  activeTab,
  onTabChange,
  // Exercise Library
  onSaveExercise,
  onCompleteExercise,
  savedExercises,
  completedExercises,
  // Workout Builder
  customRoutines,
  onSaveRoutine,
  onDeleteRoutine,
  onDuplicateRoutine,
  onStartWorkout,
  // Progress Tracker
  workoutHistory,
  weightHistory,
  measurementHistory,
  onAddWeightLog,
  onAddMeasurementLog,
  onClearHistory,
  goalWeight,
  onSaveGoalWeight,
}) => {
  const tabs = [
    { id: 'library', label: 'Exercise Library', icon: BookOpen },
    { id: 'logger', label: 'Workout Logger', icon: Dumbbell },
    { id: 'progress', label: 'Progress Tracker', icon: TrendingUp },
  ] as const;

  return (
    <div className="bg-[#03000a] min-h-screen pt-28 text-zinc-100 relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-violet/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
        {/* Responsive Segmented Tab Control */}
        <div className="w-full max-w-xl mb-8">
          <div className="bg-dark-900/60 p-1.5 md:p-1 rounded-2xl border border-white/5 backdrop-blur-xl flex gap-3 md:gap-0 relative shadow-glass overflow-x-auto scrollbar-none w-full">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex-none md:flex-1 min-w-max md:min-w-0 flex items-center justify-center gap-2 py-3 md:py-3.5 px-5 md:px-0 rounded-xl text-sm md:text-xs uppercase tracking-wider font-black relative z-10 transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTrainingTab"
                      className="absolute inset-0 bg-gradient-to-r from-brand-violet via-brand-indigo to-brand-cyan rounded-xl -z-10 shadow-glow-purple"
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Panel Renderer */}
        <div className="w-full">
          {activeTab === 'library' && (
            <motion.div
              key="exercise-library"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <ExerciseLibrary
                onSaveExercise={onSaveExercise}
                onCompleteExercise={onCompleteExercise}
                savedExercises={savedExercises}
                completedExercises={completedExercises}
              />
            </motion.div>
          )}

          {activeTab === 'logger' && (
            <motion.div
              key="workout-logger"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <WorkoutBuilder
                customRoutines={customRoutines}
                onSaveRoutine={onSaveRoutine}
                onDeleteRoutine={onDeleteRoutine}
                onDuplicateRoutine={onDuplicateRoutine}
                onStartWorkout={onStartWorkout}
              />
            </motion.div>
          )}

          {activeTab === 'progress' && (
            <motion.div
              key="progress-tracker"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <ProgressTracker
                workoutHistory={workoutHistory}
                weightHistory={weightHistory}
                measurementHistory={measurementHistory}
                onAddWeightLog={onAddWeightLog}
                onAddMeasurementLog={onAddMeasurementLog}
                onClearHistory={onClearHistory}
                goalWeight={goalWeight}
                onSaveGoalWeight={onSaveGoalWeight}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
