import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Watch, Activity, Flame, Shield, 
  Sparkles, Moon, Footprints, Droplet, Scale, Timer, 
  Milestone, Info, Smartphone, AlertCircle,
  X, RefreshCw, Calendar, WifiOff, Lock, Check, Zap, CheckCircle
} from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

interface DeviceIntegration {
  id: string;
  name: string;
  platform: string;
  features: string[];
  icon: React.ComponentType<any>;
}

const WearableGraphic = () => (
  <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto flex items-center justify-center">
    {/* Outer rotating/pulsing glow */}
    <div className="absolute inset-0 bg-gradient-to-tr from-brand-violet/20 via-brand-cyan/20 to-brand-pink/20 rounded-full blur-2xl animate-pulse-slow" />
    
    <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(139,92,246,0.25)]">
      {/* Watch Band */}
      <rect x="75" y="10" width="50" height="180" rx="12" fill="url(#band-grad)" opacity="0.85" />
      <rect x="78" y="10" width="44" height="180" rx="10" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      
      {/* Watch Body */}
      <rect x="55" y="45" width="90" height="110" rx="24" fill="url(#body-grad)" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" />
      <rect x="58" y="48" width="84" height="104" rx="21" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      
      {/* Screen Area */}
      <rect x="63" y="53" width="74" height="94" rx="16" fill="#03000a" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      
      {/* Inner Heart Rate Visualization or Pulse Wave */}
      <path 
        d="M 68,100 L 86,100 L 91,82 L 96,118 L 101,92 L 106,108 L 111,100 L 132,100" 
        fill="none" 
        stroke="url(#pulse-grad)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="animate-[dash_3s_linear_infinite]"
        style={{
          strokeDasharray: '120',
          strokeDashoffset: '120',
        }}
      />
      
      {/* Ring Progress Indicators */}
      <circle cx="100" cy="100" r="38" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2.5" />
      <circle 
        cx="100" 
        cy="100" 
        r="38" 
        fill="none" 
        stroke="url(#ring-grad)" 
        strokeWidth="2.5" 
        strokeDasharray="238" 
        strokeDashoffset="80" 
        strokeLinecap="round" 
        transform="rotate(-90 100 100)"
      />
      
      {/* Small design accents on screen */}
      <circle cx="100" cy="74" r="3" fill="#d946ef" className="animate-ping" style={{ animationDuration: '3s' }} />
      <text x="100" y="132" textAnchor="middle" fill="#a1a1aa" fontSize="9" fontWeight="900" letterSpacing="1" fontFamily="Outfit, sans-serif">FITAI</text>
      
      {/* Gradients */}
      <defs>
        <linearGradient id="band-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#110b24" />
          <stop offset="50%" stopColor="#2b1f54" />
          <stop offset="100%" stopColor="#110b24" />
        </linearGradient>
        <linearGradient id="body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1d143a" />
          <stop offset="100%" stopColor="#03000a" />
        </linearGradient>
        <linearGradient id="pulse-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
    
    {/* Subtle CSS animation for SVG */}
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes dash {
        to {
          strokeDashoffset: 0;
        }
      }
    `}} />
  </div>
);

export const HealthConnect: React.FC = () => {
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);

  const integrations: DeviceIntegration[] = [
    { id: 'apple', name: 'Apple Watch', platform: 'iOS / watchOS', icon: Watch, features: ['Steps', 'Heart Rate', 'Calories', 'Sleep', 'Distance', 'Workouts'] },
    { id: 'samsung', name: 'Samsung Galaxy Watch', platform: 'Wear OS', icon: Watch, features: ['Steps', 'Heart Rate', 'Calories', 'Sleep', 'Distance', 'Active Minutes', 'Hydration'] },
    { id: 'google', name: 'Google Wear OS', platform: 'Wear OS 3.0+', icon: Watch, features: ['Steps', 'Heart Rate', 'Calories', 'Sleep', 'Distance', 'Workouts', 'Active Minutes'] },
    { id: 'fitbit', name: 'Fitbit', platform: 'Fitbit OS / Cloud', icon: Activity, features: ['Steps', 'Heart Rate', 'Calories', 'Sleep', 'Distance', 'Active Minutes', 'Hydration'] },
    { id: 'garmin', name: 'Garmin', platform: 'Garmin Connect Cloud', icon: Watch, features: ['Steps', 'Heart Rate', 'Calories', 'Sleep', 'Distance', 'Workouts', 'Active Minutes'] },
    { id: 'amazfit', name: 'Amazfit', platform: 'Zepp OS / Zepp Cloud', icon: Watch, features: ['Steps', 'Heart Rate', 'Calories', 'Sleep', 'Distance', 'Workouts'] },
    { id: 'xiaomi', name: 'Xiaomi Smart Band', platform: 'Mi Fitness Cloud', icon: Smartphone, features: ['Steps', 'Heart Rate', 'Calories', 'Sleep', 'Workouts'] }
  ];

  const statCards = [
    { title: 'Daily Steps', icon: Footprints, color: 'text-brand-cyan', bg: 'rgba(6, 182, 212, 0.03)' },
    { title: 'Heart Rate', icon: Heart, color: 'text-brand-pink', bg: 'rgba(217, 70, 239, 0.03)' },
    { title: 'Calories Burned', icon: Flame, color: 'text-brand-violet', bg: 'rgba(139, 92, 246, 0.03)' },
    { title: 'Sleep Duration', icon: Moon, color: 'text-brand-indigo', bg: 'rgba(99, 102, 241, 0.03)' },
    { title: 'Active Minutes', icon: Timer, color: 'text-brand-lime', bg: 'rgba(132, 204, 22, 0.03)' },
    { title: 'Distance', icon: Milestone, color: 'text-brand-cyan', bg: 'rgba(6, 182, 212, 0.03)' },
    { title: 'Weight', icon: Scale, color: 'text-brand-lime', bg: 'rgba(132, 204, 22, 0.03)' },
    { title: 'Hydration', icon: Droplet, color: 'text-brand-pink', bg: 'rgba(217, 70, 239, 0.03)' }
  ];

  const permissionList = [
    { name: 'Steps', desc: 'Sync daily step count data' },
    { name: 'Heart Rate', desc: 'Continuous pulse metrics' },
    { name: 'Sleep', desc: 'Sleep cycle & duration metrics' },
    { name: 'Calories', desc: 'Active & metabolic energy burn' },
    { name: 'Distance', desc: 'Workout and tracking distance' },
    { name: 'Activity', desc: 'Active zones and metabolic hours' },
    { name: 'Workout Sessions', desc: 'Full custom exercise analytics' }
  ];

  const modalPlatforms = [
    { name: '🍎 Apple Health', icon: Heart, iconColor: 'text-rose-500', bg: 'rgba(244, 63, 94, 0.04)' },
    { name: '🤖 Android Health Connect', icon: Smartphone, iconColor: 'text-emerald-500', bg: 'rgba(16, 185, 129, 0.04)' },
    { name: '⌚ Wear OS', icon: Watch, iconColor: 'text-sky-500', bg: 'rgba(14, 165, 233, 0.04)' },
    { name: '❤️ Fitbit', icon: Activity, iconColor: 'text-teal-400', bg: 'rgba(45, 212, 191, 0.04)' },
    { name: '⌚ Garmin', icon: Watch, iconColor: 'text-amber-500', bg: 'rgba(245, 158, 11, 0.04)' },
    { name: '⌚ Amazfit', icon: Watch, iconColor: 'text-orange-500', bg: 'rgba(249, 115, 22, 0.04)' },
    { name: '📱 Xiaomi Smart Band', icon: Smartphone, iconColor: 'text-orange-400', bg: 'rgba(251, 146, 60, 0.04)' }
  ];

  const modalBenefits = [
    { title: 'Automatic Step Tracking', icon: Footprints, color: 'text-brand-cyan' },
    { title: 'Heart Rate Monitoring', icon: Heart, color: 'text-brand-pink' },
    { title: 'Calories Burned Sync', icon: Flame, color: 'text-brand-violet' },
    { title: 'Sleep Tracking', icon: Moon, color: 'text-brand-indigo' },
    { title: 'Workout Detection', icon: Activity, color: 'text-brand-lime' },
    { title: 'Personalized AI Coach Insights', icon: Sparkles, color: 'text-brand-violet' },
    { title: 'Dashboard Auto Updates', icon: RefreshCw, color: 'text-brand-cyan' }
  ];

  return (
    <div className="bg-[#03000a] pt-[120px] pb-16 text-zinc-100 relative overflow-hidden grid-bg min-h-screen">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-violet/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[20%] w-[600px] h-[600px] bg-brand-pink/3 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 1. HERO HEADER & DEVICE MANAGEMENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          <div className="lg:col-span-7 space-y-6">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-violet/10 border border-brand-violet/20 rounded-full text-brand-pink text-xs font-black uppercase tracking-wider">
              <Heart className="h-3.5 w-3.5" />
              <span>Health Connect</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              ❤️ Health Connect
            </h1>
            <p className="text-zinc-300 text-base md:text-lg leading-relaxed max-w-2xl font-medium">
              Connect your wearable devices to automatically synchronize your fitness and health data.
            </p>

            {/* 2. DEVICE MANAGEMENT */}
            <div className="mt-8 p-6 bg-dark-900/40 border border-white/5 backdrop-blur-xl rounded-3xl relative overflow-hidden shadow-glass max-w-xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-violet/5 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Connected Devices</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-zinc-800/40 border border-white/5 rounded-2xl text-zinc-400">
                    <WifiOff className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white uppercase tracking-wider">No wearable devices connected.</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Integrate your smartwatch to enable telemetry.</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsAddDeviceOpen(true)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl font-black uppercase tracking-wider text-xs bg-gradient-to-r from-brand-violet via-brand-indigo to-brand-cyan text-white hover:scale-102 hover:shadow-glow-purple transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Watch className="h-4 w-4" />
                  <span>Add Device</span>
                </button>
              </div>
            </div>
          </div>

          {/* SVG Smartwatch Illustration */}
          <div className="lg:col-span-5 flex justify-center">
            <WearableGraphic />
          </div>
        </div>

        {/* CORE CONTENT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDE: Health Data Overview & Integrations & Roadmap */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* 4. HEALTH DATA OVERVIEW */}
            <div>
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                    <Activity className="h-5.5 w-5.5 text-brand-cyan" />
                    Health Data Overview
                  </h2>
                  <p className="text-zinc-400 text-xs md:text-sm mt-1">
                    Real-time biometrics synchronized directly from your synced wristwear.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={item.title}
                      className="bg-dark-900/30 border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-brand-violet/20 hover:bg-dark-900/50 transition-all duration-300 shadow-glass"
                      style={{ background: item.bg }}
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 bg-white/2 rounded-full blur-[20px] pointer-events-none" />
                      
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">{item.title}</span>
                        <Icon className={`h-5 w-5 ${item.color} group-hover:scale-110 transition-transform duration-300`} />
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        <p className="text-[11px] font-semibold text-zinc-400 tracking-wide leading-relaxed">
                          Waiting for connected device.
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. SUPPORTED INTEGRATIONS */}
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                  <Watch className="h-5.5 w-5.5 text-brand-violet" />
                  Supported Integrations
                </h2>
                <p className="text-zinc-400 text-xs md:text-sm mt-1">
                  Wearable ecosystem options planned for future releases.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((device) => {
                  const Icon = device.icon;
                  return (
                    <SpotlightCard 
                      key={device.id}
                      className="p-5 flex flex-col justify-between transition-all duration-300 relative group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800/40 border border-white/5 flex items-center justify-center text-zinc-300 group-hover:text-brand-cyan transition-colors">
                              <Icon className="h-5.5 w-5.5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-white uppercase tracking-wider">{device.name}</h3>
                              <span className="text-[10px] text-zinc-500 block font-semibold">{device.platform}</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo rounded-full shrink-0">
                            Planned Integration
                          </span>
                        </div>

                        {/* Supported Features Checklist */}
                        <div className="mb-4">
                          <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider mb-2">Supported Features:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {device.features.map(f => (
                              <span key={f} className="text-[9px] font-bold px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-zinc-300">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </SpotlightCard>
                  );
                })}
              </div>
            </div>

            {/* 9. FUTURE FEATURES (ROADMAP) */}
            <div>
              <div className="mb-8 border-b border-white/5 pb-2">
                <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                  <Zap className="h-5.5 w-5.5 text-brand-pink" />
                  Roadmap & Future Features
                </h2>
                <p className="text-zinc-400 text-xs md:text-sm mt-1">
                  Our development schedule for expanding smartwatch and biometrics connectivity.
                </p>
              </div>

              {/* Roadmap Timeline */}
              <div className="relative border-l border-white/5 ml-3 pl-6 space-y-8">
                {/* V2.1 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-brand-cyan border-2 border-[#03000a] shadow-glow-cyan" />
                  <div className="bg-dark-900/20 border border-white/5 p-5 rounded-2xl hover:border-white/10 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                      <h4 className="text-sm font-black text-brand-cyan uppercase tracking-wider">FitAI v2.1</h4>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded">In Development</span>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-400 font-medium mt-3">
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-brand-cyan shrink-0" /> Android Health Connect</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-brand-cyan shrink-0" /> Wear OS</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-brand-cyan shrink-0" /> Smartwatch Pairing</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-brand-cyan shrink-0" /> Automatic Sync</li>
                    </ul>
                  </div>
                </div>

                {/* V2.2 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-brand-violet border-2 border-[#03000a] shadow-glow-purple" />
                  <div className="bg-dark-900/20 border border-white/5 p-5 rounded-2xl hover:border-white/10 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                      <h4 className="text-sm font-black text-brand-violet uppercase tracking-wider">FitAI v2.2</h4>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded">Planned</span>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-400 font-medium mt-3">
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-brand-violet shrink-0" /> Sleep Analytics</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-brand-violet shrink-0" /> Recovery Score</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-brand-violet shrink-0" /> HR Trends</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-brand-violet shrink-0" /> Activity Trends</li>
                    </ul>
                  </div>
                </div>

                {/* V3.0 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-brand-pink border-2 border-[#03000a] shadow-glow-pink" />
                  <div className="bg-dark-900/20 border border-white/5 p-5 rounded-2xl hover:border-white/10 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                      <h4 className="text-sm font-black text-brand-pink uppercase tracking-wider">FitAI v3.0</h4>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded">Planned</span>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-400 font-medium mt-3">
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-brand-pink shrink-0" /> AI Recovery Coach</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-brand-pink shrink-0" /> Smart Notifications</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-brand-pink shrink-0" /> Automatic Workout Detection</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-brand-pink shrink-0" /> Advanced Health Analytics</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE (SIDEBAR): Sync Center & Permissions & Coach / Dashboard Integrations */}
          <div className="lg:col-span-4 space-y-8">

            {/* 5. SYNC CENTER */}
            <div className="bg-dark-900/40 border border-white/5 p-6 rounded-3xl relative overflow-hidden shadow-glass">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/5 rounded-full blur-[30px] pointer-events-none" />
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 border-b border-white/5 pb-2 flex items-center justify-between">
                <span>Sync Center</span>
                <RefreshCw className="h-3.5 w-3.5" />
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-semibold">Connection Status:</span>
                  <span className="text-brand-pink font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-pink" />
                    Disconnected
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-semibold">Last Sync:</span>
                  <span className="text-zinc-500 font-bold uppercase tracking-wider">Never</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-semibold">Next Scheduled Sync:</span>
                  <span className="text-zinc-500 font-bold uppercase tracking-wider">Waiting for device</span>
                </div>
              </div>

              <div className="mt-6 border-t border-white/5 pt-4">
                <button 
                  disabled
                  className="w-full py-3.5 rounded-xl font-black uppercase tracking-wider text-xs border border-white/5 text-zinc-500 bg-white/2 cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4 shrink-0" />
                  <span>No connected device.</span>
                </button>
              </div>
            </div>

            {/* 6. PERMISSIONS */}
            <div className="bg-dark-900/40 border border-white/5 p-6 rounded-3xl relative overflow-hidden shadow-glass">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-violet/5 rounded-full blur-[30px] pointer-events-none" />
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 border-b border-white/5 pb-2 flex items-center justify-between">
                <span>Telemetry Permissions</span>
                <Lock className="h-3.5 w-3.5" />
              </h3>

              <div className="space-y-2 mb-6">
                {permissionList.map((p) => (
                  <div key={p.name} className="flex items-center justify-between p-2.5 bg-dark-950/60 border border-white/5 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-zinc-200">{p.name}</p>
                      <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">{p.desc}</p>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded shrink-0">
                      Locked
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-brand-violet/5 border border-brand-violet/20 rounded-2xl flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-brand-pink shrink-0 mt-0.5" />
                <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed">
                  Permissions will be requested after wearable integration becomes available.
                </p>
              </div>
            </div>

            {/* 7. AI COACH INTEGRATION */}
            <div className="bg-gradient-to-br from-brand-violet/10 via-dark-900/40 to-dark-900/60 border border-brand-violet/20 rounded-3xl p-6 relative overflow-hidden shadow-glow-purple">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-violet/15 rounded-full blur-[30px] pointer-events-none" />
              <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-violet" />
                AI Coach Integration
              </h3>
              <p className="text-zinc-300 text-xs leading-relaxed font-semibold">
                After wearable integration, AI Coach will automatically analyze:
              </p>
              <ul className="mt-3 space-y-2 text-xs text-zinc-400 font-medium border-l border-white/5 pl-4">
                <li>• Heart Rate</li>
                <li>• Activity</li>
                <li>• Recovery</li>
                <li>• Sleep</li>
                <li>• Daily Movement</li>
              </ul>
              <p className="text-zinc-400 text-[11px] leading-relaxed font-medium mt-4 pt-3 border-t border-white/5">
                to generate smarter recommendations and adjust exercise thresholds dynamically.
              </p>
            </div>

            {/* 8. DASHBOARD INTEGRATION */}
            <div className="bg-dark-900/40 border border-white/5 p-6 rounded-3xl relative overflow-hidden shadow-glass">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/5 rounded-full blur-[30px] pointer-events-none" />
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-brand-cyan" />
                Data Propagation
              </h3>
              <p className="text-zinc-300 text-xs leading-relaxed font-medium">
                Once paired, synced health data will automatically propagate to update the following sections across FitAI:
              </p>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {[
                  'Dashboard',
                  'Workout Progress',
                  'Nutrition Summary',
                  'Body Fat Reports',
                  'AI Coach'
                ].map((item) => (
                  <div key={item} className="p-2 bg-dark-950/40 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-wider text-zinc-400 text-center">
                    {item}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 2. DEVICE ADDITION PAIRING MODAL */}
      <AnimatePresence>
        {isAddDeviceOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddDeviceOpen(false)}
              className="absolute inset-0 bg-dark-950/80 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-dark-900 border border-white/10 rounded-3xl p-6 md:p-8 max-w-xl w-full relative z-10 shadow-glass flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden"
            >
              {/* Border decoration */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-violet via-brand-indigo to-brand-cyan" />

              {/* Close button in top-right */}
              <button 
                onClick={() => setIsAddDeviceOpen(false)}
                className="absolute top-6 right-6 p-1.5 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-lg transition-all text-zinc-400 hover:text-white z-20"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Scrollable Content Container */}
              <div className="overflow-y-auto pr-2 space-y-6 flex-1 custom-scrollbar pt-2">
                
                {/* Header */}
                <div className="text-center space-y-3">
                  <div className="inline-flex justify-center mx-auto mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3.5 py-1 bg-gradient-to-r from-brand-violet/20 to-brand-indigo/20 border border-brand-violet/30 text-brand-pink rounded-full flex items-center gap-1.5 shadow-glow-purple">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-pink animate-pulse" />
                      🚀 Coming Soon
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase flex items-center justify-center gap-2">
                    <span>⌚</span> Connect Your Wearable
                  </h3>
                  <p className="text-zinc-200 text-sm font-bold tracking-wide">
                    Wearable integration is coming soon.
                  </p>
                </div>

                {/* Description Paragraph */}
                <div className="bg-dark-950/40 border border-white/5 p-4 md:p-5 rounded-2xl text-center">
                  <p className="text-zinc-300 text-xs font-semibold leading-relaxed">
                    FitAI is actively developing secure integration with leading wearable platforms.
                  </p>
                </div>

                {/* 4. SUPPORTED PLATFORMS */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 pl-1">
                    Future support will include:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {modalPlatforms.map((platform) => {
                      const PlatformIcon = platform.icon;
                      return (
                        <div 
                          key={platform.name}
                          className="flex items-center justify-between p-3 bg-dark-950/60 border border-white/5 rounded-2xl group hover:border-brand-violet/20 transition-all duration-300"
                          style={{ background: platform.bg }}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 bg-zinc-900 rounded-lg ${platform.iconColor} border border-white/5 group-hover:scale-105 transition-transform`}>
                              <PlatformIcon className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-bold text-zinc-200">{platform.name}</span>
                          </div>
                          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-zinc-900 border border-zinc-800/80 text-zinc-500 rounded-md shrink-0">
                            Planned Support
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Closing Statement */}
                <div className="p-4 bg-brand-violet/5 border border-brand-violet/20 rounded-2xl text-center">
                  <p className="text-xs font-semibold text-zinc-300 leading-relaxed">
                    Once available, your steps, heart rate, sleep, calories, and workouts will automatically sync with FitAI.
                  </p>
                </div>

              </div>

              {/* Action & Footer Area */}
              <div className="mt-6 border-t border-white/5 pt-5 space-y-4 shrink-0">
                <button
                  onClick={() => setIsAddDeviceOpen(false)}
                  className="w-full py-4 rounded-xl font-black uppercase tracking-wider text-xs bg-gradient-to-r from-brand-violet via-brand-indigo to-brand-cyan text-white hover:scale-102 hover:shadow-glow-purple transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-98"
                >
                  Got It
                </button>
                
                {/* 7. FOOTER */}
                <p className="text-[9px] text-zinc-500 text-center leading-relaxed font-semibold max-w-md mx-auto">
                  Real wearable integration will be introduced in a future FitAI update. No personal health data is collected until you choose to connect a supported device.
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
