import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, Info } from 'lucide-react';

export const BMICalculator: React.FC = () => {
  const [weight, setWeight] = useState(70); // in kg
  const [height, setHeight] = useState(175); // in cm

  // Calculate BMI
  const heightInMeters = height / 100;
  const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));

  // Determine Category details
  const getBmiDetails = () => {
    if (bmi < 18.5) {
      return {
        category: "Underweight",
        color: "text-brand-cyan",
        border: "border-brand-cyan/20",
        bg: "bg-brand-cyan/5",
        barColor: "bg-brand-cyan",
        needlePos: "left-[12%]",
        tip: "We recommend a structured caloric surplus focus. Focus on compound progressive resistance training and nutrient-dense foods to build lean muscular mass safely."
      };
    } else if (bmi >= 18.5 && bmi < 25) {
      return {
        category: "Healthy Weight",
        color: "text-brand-lime",
        border: "border-brand-lime/20",
        bg: "bg-brand-lime/5",
        barColor: "bg-brand-lime",
        needlePos: "left-[37%]",
        tip: "Superb! Your weight is in the optimal range. Keep doing resistance splits and focus on training intensity, clean protein intake, and consistent sleep cycles."
      };
    } else if (bmi >= 25 && bmi < 30) {
      return {
        category: "Overweight",
        color: "text-amber-400",
        border: "border-amber-400/20",
        bg: "bg-amber-400/5",
        barColor: "bg-amber-400",
        needlePos: "left-[62%]",
        tip: "A mild caloric deficit (250-500 kcal) combined with high-protein intake and hypertrophic lifting will optimize body recomposition: shedding fat while preserving muscle."
      };
    } else {
      return {
        category: "Obese",
        color: "text-red-400",
        border: "border-red-400/20",
        bg: "bg-red-400/5",
        barColor: "bg-red-400",
        needlePos: "left-[87%]",
        tip: "Consulting a physician is smart, but starting structured physical cycles helps immensely. We suggest low-impact resistance work combined with walking to protect joints."
      };
    }
  };

  const details = getBmiDetails();

  return (
    <section id="bmi-calculator" className="relative py-24 overflow-hidden border-t border-white/5">
      <div className="absolute top-[40%] left-[5%] w-[350px] h-[350px] rounded-full radial-glow opacity-30 pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-[350px] h-[350px] rounded-full radial-glow-cyan opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-brand-pink/10 border border-brand-pink/20 px-3.5 py-1 rounded-full text-brand-pink font-semibold text-xs tracking-wider uppercase"
          >
            Diagnostics
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight"
          >
            Compute Your Biometrics
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Get a quick physiological diagnostic index instantly and check your target weight range.
          </motion.p>
        </div>

        {/* Form panel container */}
        <div className="max-w-4xl mx-auto bg-dark-900/60 border border-white/5 rounded-2xl backdrop-blur-xl p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-glass">
          
          {/* Sliders Input (Left) */}
          <div className="md:col-span-6 space-y-8 text-left">
            <h3 className="text-xl font-display font-extrabold text-white flex items-center gap-2">
              <Scale className="h-5 w-5 text-brand-violet" /> Input Parameters
            </h3>

            {/* Height Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400 font-medium">Height</span>
                <span className="text-white font-bold font-display">{height} cm</span>
              </div>
              <input
                type="range"
                min="120"
                max="220"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-violet"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-bold">
                <span>120 cm</span>
                <span>170 cm</span>
                <span>220 cm</span>
              </div>
            </div>

            {/* Weight Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400 font-medium">Weight</span>
                <span className="text-white font-bold font-display">{weight} kg</span>
              </div>
              <input
                type="range"
                min="40"
                max="150"
                value={weight}
                onChange={(e) => setWeight(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-violet"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-bold">
                <span>40 kg</span>
                <span>95 kg</span>
                <span>150 kg</span>
              </div>
            </div>
          </div>

          {/* Results Gauge and Diagnostics (Right) */}
          <div className="md:col-span-6 flex flex-col justify-center space-y-6 p-6 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md">
            
            <div className="text-center space-y-1">
              <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Calculated Index</span>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-violet to-brand-cyan">
                  {bmi}
                </span>
                <span className="text-zinc-500 text-sm font-bold">kg/m²</span>
              </div>
              <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold border ${details.border} ${details.color} ${details.bg}`}>
                {details.category}
              </span>
            </div>

            {/* Visual Category Needle Gauge */}
            <div className="space-y-2 relative">
              <div className="w-full h-2.5 rounded-full bg-gradient-to-r from-brand-cyan via-brand-lime via-amber-400 to-red-400 relative overflow-hidden">
                {/* Visual marker divisions */}
                <div className="absolute left-[25%] top-0 bottom-0 w-px bg-dark-900/50" />
                <div className="absolute left-[50%] top-0 bottom-0 w-px bg-dark-900/50" />
                <div className="absolute left-[75%] top-0 bottom-0 w-px bg-dark-900/50" />
              </div>

              {/* Slider marker label positions */}
              <div className="flex justify-between text-[9px] text-zinc-500 font-bold px-1">
                <span>18.5</span>
                <span>25.0</span>
                <span>30.0</span>
              </div>

              {/* Dynamic needle element */}
              <div className={`absolute top-0 bottom-3 w-3 h-3 bg-white border-2 border-dark-950 rounded-full shadow-md -translate-x-1.5 -translate-y-0.5 transition-all duration-300 ${details.needlePos}`} />
            </div>

            {/* Diagnostics recommendation box */}
            <div className="p-4 bg-dark-950/80 border border-white/5 rounded-xl text-left space-y-2">
              <div className="flex items-center space-x-1.5 text-zinc-300 font-bold text-xs uppercase tracking-wider">
                <Info className="h-4 w-4 text-brand-cyan" />
                <span>Diagnostic Recommendation</span>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed font-normal">
                {details.tip}
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
