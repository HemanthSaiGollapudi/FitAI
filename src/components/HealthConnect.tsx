import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Watch, Activity, Flame, Shield, 
  Sparkles, Moon, Footprints, Droplet, Scale, Timer, 
  Milestone, Info, Smartphone, AlertCircle,
  Bell, X, RefreshCw
} from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

interface Device {
  id: string;
  name: string;
  brand: string;
  compatibility: string;
  icon: React.ComponentType<any>;
  color: string;
}

export const HealthConnect: React.FC = () => {
  const [activeDeviceModal, setActiveDeviceModal] = useState<Device | null>(null);
  const [isNotified, setIsNotified] = useState<Record<string, boolean>>({});

  const devices: Device[] = [
    { id: 'apple', name: 'Apple Watch', brand: 'Apple', compatibility: 'Future Support (iOS)', icon: Watch, color: 'from-zinc-400 to-zinc-600' },
    { id: 'samsung', name: 'Samsung Galaxy Watch', brand: 'Samsung', compatibility: 'Future Support (WearOS)', icon: Watch, color: 'from-blue-400 to-indigo-500' },
    { id: 'google', name: 'Google Wear OS', brand: 'Google', compatibility: 'Future Support (WearOS 3.0+)', icon: Watch, color: 'from-red-400 via-green-400 to-blue-400' },
    { id: 'fitbit', name: 'Fitbit', brand: 'Fitbit', compatibility: 'Future Support (Cloud Sync)', icon: Activity, color: 'from-teal-400 to-emerald-500' },
    { id: 'garmin', name: 'Garmin', brand: 'Garmin', compatibility: 'Future Support (ANT+ Sync)', icon: Watch, color: 'from-amber-500 to-orange-600' },
    { id: 'amazfit', name: 'Amazfit', brand: 'Zepp', compatibility: 'Future Support (Zepp Cloud)', icon: Watch, color: 'from-rose-500 to-red-600' },
    { id: 'xiaomi', name: 'Xiaomi Smart Band', brand: 'Xiaomi', compatibility: 'Future Support (Mi Fitness)', icon: Smartphone, color: 'from-orange-400 to-red-500' },
  ];

  const handleNotifyMe = (deviceId: string) => {
    setIsNotified(prev => ({ ...prev, [deviceId]: true }));
    setTimeout(() => {
      // Auto close modal after successful mock subscription
      setActiveDeviceModal(null);
    }, 1500);
  };

  const benefits = [
    { title: 'Automatic Workout Sync', desc: 'Directly import workouts, heart rate zones, and session durations.', icon: Activity, color: 'text-brand-violet' },
    { title: 'Real-Time Step Tracking', desc: 'Log daily step counts and activity targets automatically.', icon: Footprints, color: 'text-brand-cyan' },
    { title: 'Heart Rate Monitoring', desc: 'Continuous heart rate analysis and resting pulse data.', icon: Heart, color: 'text-brand-pink' },
    { title: 'Sleep Analysis', desc: 'Import sleep duration, quality score, and sleep phases.', icon: Moon, color: 'text-brand-indigo' },
    { title: 'Smart Activity Tracking', desc: 'Log exercises, active calorie burn, and movements.', icon: Timer, color: 'text-brand-lime' },
    { title: 'AI Coach Personalization', desc: 'Enhance your trainer recommendations based on recovery and fatigue metrics.', icon: Sparkles, color: 'text-brand-violet' },
    { title: 'Dashboard Auto Updates', desc: 'Your home screens and progress stats sync in the background.', icon: RefreshCw, color: 'text-brand-cyan' },
    { title: 'Smart Notifications', desc: 'Get prompts for activity targets, dynamic recovery, and hydration.', icon: Shield, color: 'text-brand-pink' },
  ];

  const dataPreview = [
    { title: 'Daily Steps', icon: Footprints, color: 'text-brand-cyan' },
    { title: 'Heart Rate', icon: Heart, color: 'text-brand-pink' },
    { title: 'Calories Burned', icon: Flame, color: 'text-brand-violet' },
    { title: 'Active Minutes', icon: Timer, color: 'text-brand-lime' },
    { title: 'Sleep Tracking', icon: Moon, color: 'text-brand-indigo' },
    { title: 'Distance Walked', icon: Milestone, color: 'text-brand-cyan' },
    { title: 'Weight Sync', icon: Scale, color: 'text-brand-lime' },
    { title: 'Hydration Reminders', icon: Droplet, color: 'text-brand-pink' },
  ];

  return (
    <div className="bg-[#03000a] pt-[120px] pb-12 text-zinc-100 relative overflow-hidden grid-bg">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-violet/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-brand-pink/3 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* 1. HEALTH PREPARATION HERO SECTION */}
        <div className="mb-10">
          <SpotlightCard className="p-6 md:p-8 relative overflow-hidden bg-dark-900/40 border border-white/5 backdrop-blur-xl rounded-3xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-cyan/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
              {/* Centered Brand Tag */}
              <div className="flex items-center gap-2 mb-4 px-3 py-1 bg-brand-violet/10 border border-brand-violet/20 rounded-full text-brand-pink text-xs font-black uppercase tracking-wider">
                <Heart className="h-3.5 w-3.5" />
                <span>Health Connect</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">
                Wearable Integration
              </h2>
              <p className="text-zinc-300 text-sm leading-relaxed max-w-xl mb-6">
                Health Connect is currently preparing support for wearable devices. Future updates will allow secure synchronization of fitness and health data from supported smartwatches and fitness bands.
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" /> Auto Sync
                </span>
                <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-violet animate-pulse" /> Live Telemetry
                </span>
                <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-pink animate-pulse" /> Secure Connection
                </span>
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* 2. SUPPORTED DEVICES GRID */}
        <div className="mb-10">
          <div className="mb-6">
            <h2 className="text-xl font-black text-white flex items-center gap-2.5">
              <Watch className="h-5.5 w-5.5 text-brand-cyan" />
              Supported Devices
            </h2>
            <p className="text-zinc-400 text-xs md:text-sm">
              Tap any wearable brand below to view upcoming telemetry parameters and compatibility details.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-5">
            {devices.map((device) => {
              const Icon = device.icon;
              return (
                <button 
                  key={device.id}
                  onClick={() => setActiveDeviceModal(device)}
                  className="bg-dark-900/30 border border-white/5 hover:border-brand-violet/30 rounded-2xl p-5 flex flex-col items-center justify-between text-center transition-all duration-300 relative group shadow-glass cursor-pointer active:scale-98"
                >
                  <div className="w-12 h-12 rounded-full bg-zinc-800/40 group-hover:bg-brand-violet/10 flex items-center justify-center mb-4 transition-all duration-300 text-zinc-400 group-hover:text-brand-violet">
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider mb-1 line-clamp-1 group-hover:text-brand-cyan transition-colors">{device.name}</h3>
                    <span className="text-[9px] text-zinc-500 block mb-2">{device.compatibility}</span>
                    <span className="inline-block text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 rounded-full">
                      Coming Soon
                    </span>
                  </div>

                  <span className="w-full py-1.5 px-3 bg-white/5 group-hover:bg-brand-violet/20 text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white border border-white/5 rounded-lg transition-all duration-200">
                    View Details
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. HEALTH DATA PREVIEW (COMING SOON) */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                <Activity className="h-5.5 w-5.5 text-brand-pink" />
                Supported Features
              </h2>
              <p className="text-zinc-400 text-xs md:text-sm">
                A preview of health parameters that will synchronize automatically upon wearable integration.
              </p>
            </div>
            <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 bg-zinc-800/80 border border-zinc-700 text-zinc-400 rounded-full">
              Future Sync
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dataPreview.map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.title}
                  className="bg-dark-900/50 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-all duration-300 shadow-glass"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/2 rounded-full blur-[30px] pointer-events-none" />
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-zinc-400 text-xs uppercase tracking-wider font-extrabold">{item.title}</span>
                    <Icon className={`h-5.5 w-5.5 ${item.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  
                  <div className="relative mt-2">
                    <p className="text-base font-semibold text-zinc-500 tracking-wide">
                      Available after device pairing.
                    </p>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-1.5 text-[9px] text-zinc-600 font-extrabold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" /> Pending Integration
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. BENEFITS SECTION */}
        <div className="mb-10">
          <div className="mb-6 text-center max-w-2xl mx-auto border-t border-white/5 pt-8">
            <h2 className="text-2xl font-black text-white mb-2">
              Connected FitAI Integration
            </h2>
            <p className="text-zinc-400 text-sm">
              Unlock powerful automatic tracking parameters that keep your training progress seamless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={benefit.title}
                  className="bg-dark-900/40 border border-white/5 hover:border-white/10 p-6 rounded-2xl transition-all duration-300 relative shadow-glass"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 text-zinc-300">
                    <Icon className={`h-5 w-5 ${benefit.color}`} />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">{benefit.title}</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">{benefit.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. AI COACH INTEGRATION & FUTURE ROADMAP SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* AI COACH INTEGRATION */}
          <div className="relative overflow-hidden bg-gradient-to-br from-brand-violet/10 via-dark-900/40 to-dark-900/80 border border-brand-violet/20 rounded-3xl p-8 shadow-glow-purple">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-violet/10 rounded-full blur-[40px] pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-brand-violet/20 border border-brand-violet/30 rounded-xl text-brand-violet">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">AI Coach Personalization</h3>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                FitAI AI Coach will analyze your workouts, heart rate, recovery, activity, and sleep to provide smarter daily recommendations.
              </p>
              <div className="p-3 bg-dark-950/60 border border-white/5 rounded-xl flex items-start gap-3">
                <Info className="h-4 w-4 text-brand-cyan mt-0.5 shrink-0" />
                <span className="text-[11px] text-zinc-400 leading-relaxed">
                  Connected live data gives AI algorithms the metrics necessary to calibrate rest limits, fatigue levels, and diet caloric outputs in real time.
                </span>
              </div>
            </div>
          </div>

          {/* FUTURE ROADMAP */}
          <div className="relative overflow-hidden bg-dark-900/40 border border-white/5 rounded-3xl p-8 shadow-glass">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/5 rounded-full blur-[40px] pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-zinc-800 border border-zinc-700 rounded-xl text-brand-cyan">
                  <Watch className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">Future Roadmap</h3>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                Health Connect is the foundation for future wearable integration. Upcoming updates will support automatic synchronization of activity, workouts, heart rate, sleep, and health metrics from supported wearable devices.
              </p>
              <div className="p-3 bg-dark-950/60 border border-white/5 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-brand-violet mt-0.5 shrink-0" />
                <span className="text-[11px] text-zinc-400 leading-relaxed">
                  FitAI v2.0 will introduce Apple HealthKit, Google Health Connect, and direct Garmin/Fitbit Cloud OAuth 2.0 endpoints for instant data imports.
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* DEVICE DETAILS MODAL */}
      <AnimatePresence>
        {activeDeviceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDeviceModal(null)}
              className="absolute inset-0 bg-dark-950/80 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-dark-900 border border-white/10 rounded-3xl p-8 max-w-md w-full relative z-10 shadow-glass overflow-hidden"
            >
              {/* Top border highlight color based on device styling */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${activeDeviceModal.color}`} />

              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-800 rounded-xl text-zinc-300">
                    <Watch className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider">
                      {activeDeviceModal.name}
                    </h3>
                    <span className="text-[10px] text-zinc-500 block">
                      {activeDeviceModal.compatibility}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setActiveDeviceModal(null)}
                  className="p-1.5 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-lg transition-all text-zinc-400 hover:text-white"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="mb-6 flex">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-zinc-800 border border-zinc-700/60 text-zinc-400 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse" />
                  Coming Soon
                </span>
              </div>

              {/* Description */}
              <div className="space-y-4 mb-8">
                <p className="text-zinc-300 text-xs leading-relaxed">
                  {activeDeviceModal.name} integration will be available in a future FitAI update. Once supported, FitAI will automatically synchronize:
                </p>

                <div className="bg-dark-950/60 border border-white/5 p-4 rounded-2xl grid grid-cols-2 gap-x-4 gap-y-2.5">
                  {[
                    'Steps', 'Heart Rate', 'Calories Burned',
                    'Sleep', 'Workout Sessions', 'Active Minutes', 'Distance'
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-zinc-300 text-xs font-semibold">
                      <span className="text-brand-violet text-sm">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleNotifyMe(activeDeviceModal.id)}
                  className="w-full py-3.5 rounded-xl font-black uppercase tracking-wider text-xs bg-gradient-to-r from-brand-violet via-brand-indigo to-brand-cyan text-white hover:scale-102 hover:shadow-glow-purple transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Bell className="h-4 w-4" />
                  <span>
                    {isNotified[activeDeviceModal.id] 
                      ? 'Subscription Saved! ✓' 
                      : 'Notify Me When Available'}
                  </span>
                </button>
                
                <button
                  onClick={() => setActiveDeviceModal(null)}
                  className="w-full py-3.5 rounded-xl font-black uppercase tracking-wider text-xs border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-all bg-white/5 cursor-pointer active:scale-98"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
