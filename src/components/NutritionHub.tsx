import React from 'react';
import { motion } from 'framer-motion';
import { Apple, Camera } from 'lucide-react';
import { DietModule } from './DietModule';
import { FoodScanner } from './FoodScanner';
import type { SavedDietPlan } from './DietModule';
import type { LoggedScannedFood } from './FoodScanner';

interface NutritionHubProps {
  activeTab: 'diet' | 'scanner';
  onTabChange: (tab: 'diet' | 'scanner') => void;
  // DietModule props
  onSaveDiet: (settings: SavedDietPlan) => void;
  savedGoal: string;
  savedType: string;
  savedCalories?: number;
  // FoodScanner props
  onAddScannedFood: (food: Omit<LoggedScannedFood, 'id' | 'timestamp'>) => void;
}

export const NutritionHub: React.FC<NutritionHubProps> = ({
  activeTab,
  onTabChange,
  onSaveDiet,
  savedGoal,
  savedType,
  savedCalories,
  onAddScannedFood,
}) => {
  const tabs = [
    { id: 'diet', label: 'Diet Planner', icon: Apple },
    { id: 'scanner', label: 'AI Food Scanner', icon: Camera },
  ] as const;

  return (
    <div className="bg-[#03000a] min-h-screen pt-28 text-zinc-100 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-violet/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
        {/* Navigation Selector Tabs */}
        <div className="w-full max-w-md mb-8">
          <div className="bg-dark-900/60 p-1 rounded-2xl border border-white/5 backdrop-blur-xl flex relative shadow-glass">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs uppercase tracking-wider font-black relative z-10 transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNutritionTab"
                      className="absolute inset-0 bg-gradient-to-r from-brand-violet via-brand-indigo to-brand-cyan rounded-xl -z-10 shadow-glow-purple"
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-component Views with layout animations */}
        <div className="w-full">
          {activeTab === 'diet' && (
            <motion.div
              key="diet-planner"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <DietModule
                onSaveDiet={onSaveDiet}
                savedGoal={savedGoal}
                savedType={savedType}
                savedCalories={savedCalories}
              />
            </motion.div>
          )}

          {activeTab === 'scanner' && (
            <motion.div
              key="food-scanner"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <FoodScanner onAddScannedFood={onAddScannedFood} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
