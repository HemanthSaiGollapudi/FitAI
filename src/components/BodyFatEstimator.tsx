import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Upload, Trash2, Check, Scale, Award, 
  ShieldAlert, TrendingUp, Info, Activity, RefreshCw,
  X, BookOpen, Calendar, AlertTriangle, Sparkles, CheckCircle
} from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

interface BodyScanLog {
  id: string;
  date: string;
  weight: number;
  bodyFat: number;
  leanMass: number;
  fatMass: number;
  muscleMass: number;
  ffmi: number;
  bmi: number;
  maintenanceCalories: number;
  fatLossCalories: number;
  aggressiveCalories: number;
  muscleGainCalories: number;
  targetBodyFat: number;
  confidence: number;
  category: string;
  label: string;
  proteinMin?: number;
  proteinMax?: number;
  images?: { front: string; side: string; back: string };
}

const getEstimatedCategory = (gender: 'Male' | 'Female', bodyFat: number): string => {
  if (gender === 'Male') {
    if (bodyFat < 6) return 'Essential Fat';
    if (bodyFat < 14) return 'Athlete';
    if (bodyFat < 18) return 'Fitness';
    if (bodyFat < 25) return 'Average';
    if (bodyFat < 30) return 'Overweight';
    return 'Obese';
  } else {
    if (bodyFat < 14) return 'Essential Fat';
    if (bodyFat < 21) return 'Athlete';
    if (bodyFat < 25) return 'Fitness';
    if (bodyFat < 32) return 'Average';
    if (bodyFat < 38) return 'Overweight';
    return 'Obese';
  }
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Essential Fat': return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'Athlete': return 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20';
    case 'Fitness': return 'text-brand-lime bg-brand-lime/10 border-brand-lime/20';
    case 'Average': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'Overweight': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    case 'Obese': return 'text-red-500 bg-red-500/10 border-red-500/20';
    default: return 'text-zinc-400 bg-white/5 border-white/5';
  }
};

const getCategoryExplanation = (category: string) => {
  switch (category) {
    case 'Essential Fat':
      return {
        title: 'Essential Fat (Critical Range)',
        desc: 'This level of fat is necessary for basic physical and physiological health. Maintaining body fat below this level can lead to hormonal dysfunction, organ stress, and severe metabolic slowdown.',
        nutrition: 'Focus on high-quality dietary fats (avocado, nuts, olive oil) and maintain caloric balance or surplus to protect vital body systems.',
        training: 'Ensure adequate recovery time between sessions. Avoid excessive low-intensity steady-state cardio which can exacerbate energy deficits.'
      };
    case 'Athlete':
      return {
        title: 'Athlete (Elite Lean Range)',
        desc: 'Optimized for high athletic performance, strength-to-weight ratio, and vascular muscle definition. Often observed in sprinters, bodybuilders, and elite level athletes.',
        nutrition: 'High-protein diet to preserve lean muscle tissue. Calorie cycling or carbohydrate loading around intense training sessions.',
        training: 'Heavy resistance training combined with sport-specific conditioning. Focus on progressive overload to build or retain muscle.'
      };
    case 'Fitness':
      return {
        title: 'Fitness (Optimal Athletic Range)',
        desc: 'An excellent, highly sustainable range representing low body fat, strong cardiovascular health, and good insulin sensitivity. Highly recommended for general physical longevity.',
        nutrition: 'Balanced macronutrients with a focus on whole foods. Moderate carbohydrate levels to support active daily training routines.',
        training: 'A well-rounded program of resistance training 3-4 days a week and moderate aerobic conditioning.'
      };
    case 'Average':
      return {
        title: 'Average (Healthy Baseline)',
        desc: 'A healthy standard baseline for the general population. While not highly shredded, it offers strong protection against metabolic syndrome and represents balanced metabolic flexibility.',
        nutrition: 'Structured nutrition plan aiming for a slight deficit if leaning out, or maintenance to slowly swap fat for muscle mass (recomp).',
        training: 'Incorporate 3 strength training sessions per week and increase daily physical activity (NEAT, e.g., steps goal of 8k-10k).'
      };
    case 'Overweight':
      return {
        title: 'Overweight (Actionable Fat Range)',
        desc: 'Higher than optimal fat storage. This range may begin to elevate risks of insulin resistance, systemic inflammation, and joint stress during high-impact movement.',
        nutrition: 'Implement a structured moderate caloric deficit (TDEE - 500 kcal). Prioritize protein to maintain muscle mass and focus on high-fiber foods.',
        training: 'Prioritize low-impact joint-friendly conditioning (swimming, cycling, walking) alongside structured full-body resistance training.'
      };
    case 'Obese':
    default:
      return {
        title: 'Obese (High-Risk Metabolic Range)',
        desc: 'Significant excess fat accumulation. Strongly associated with increased risk of type 2 diabetes, high blood pressure, sleep apnea, and general metabolic dysfunction.',
        nutrition: 'Create a structured, consistent caloric deficit. Minimize refined sugars and ultra-processed foods. Focus on high satiety protein and vegetables.',
        training: 'Start with high-volume walking (e.g. 8k steps) and progressive resistance training. Avoid high-impact running or jumping to protect joints.'
      };
  }
};

const SvgLineChart: React.FC<{
  chartId: string;
  data: number[];
  dates: string[];
  strokeColor: string;
  fillColorStart: string;
  yUnit: string;
  hoveredPoint: any;
  setHoveredPoint: (val: any) => void;
}> = ({ chartId, data, dates, strokeColor, fillColorStart, yUnit, hoveredPoint, setHoveredPoint }) => {
  if (data.length === 0) return (
    <div className="h-32 flex items-center justify-center text-zinc-600 text-xs font-bold">
      No historical records available
    </div>
  );
  
  const width = 360;
  const height = 120;
  const padding = 30;
  const minVal = Math.min(...data) * 0.95;
  const maxVal = Math.max(...data) * 1.05;
  const range = maxVal - minVal || 1;
  
  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - ((val - minVal) / range) * (height - 2 * padding);
    return { x, y, val, date: dates[idx] };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
  }, '');

  const areaD = pathD + ` L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32 overflow-visible">
        <defs>
          <linearGradient id={`grad-${chartId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColorStart} stopOpacity="0.2" />
            <stop offset="100%" stopColor={fillColorStart} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        {/* Grid Lines */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
        
        {/* Shaded Area */}
        <path d={areaD} fill={`url(#grad-${chartId})`} />
        
        {/* Trend Line */}
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        
        {/* Data Points */}
        {points.map((p, idx) => {
          const isHovered = hoveredPoint && hoveredPoint.chartId === chartId && hoveredPoint.index === idx;
          return (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r={isHovered ? "5" : "3"} fill={isHovered ? "#ffffff" : strokeColor} stroke="#ffffff" strokeWidth="1.5" className="transition-all" />
              {/* Invisible interactive hover zone */}
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="12" 
                fill="transparent" 
                className="cursor-pointer"
                onMouseEnter={() => {
                  setHoveredPoint({
                    chartId,
                    index: idx,
                    x: p.x,
                    y: p.y,
                    val: p.val,
                    date: p.date
                  });
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              <text 
                x={p.x} 
                y={height - 12} 
                textAnchor="middle" 
                className="text-[7px] fill-zinc-500 font-bold pointer-events-none"
              >
                {p.date.substring(5)}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Tooltip Overlay */}
      {hoveredPoint && hoveredPoint.chartId === chartId && (
        <div 
          className="absolute z-30 px-2.5 py-1.5 bg-dark-950 border border-white/10 rounded-xl text-[9px] font-bold text-white shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{ 
            left: `${(hoveredPoint.x / width) * 100}%`, 
            top: `${(hoveredPoint.y / height) * 100 - 10}%` 
          }}
        >
          <div className="text-zinc-400 font-normal">{hoveredPoint.date}</div>
          <div className="text-brand-cyan mt-0.5">{hoveredPoint.val.toFixed(1)}{yUnit}</div>
        </div>
      )}
    </div>
  );
};

export const BodyFatEstimator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scanner' | 'compare' | 'trends'>('scanner');

  // Load biometrics from Profile/localStorage
  const [weight, setWeight] = useState<number>(() => {
    return Number(localStorage.getItem('fitai_user_weight') || '75');
  });
  const [gender, setGender] = useState<'Male' | 'Female'>(() => {
    return (localStorage.getItem('fitai_user_gender') as 'Male' | 'Female') || 'Male';
  });
  const [height, setHeight] = useState<number>(() => {
    return Number(localStorage.getItem('fitai_user_height') || '175');
  });
  const [age, setAge] = useState<number>(() => {
    return Number(localStorage.getItem('fitai_user_age') || '26');
  });

  const [targetBodyFat, setTargetBodyFat] = useState<number>(() => {
    const saved = localStorage.getItem('fitai_target_body_fat');
    if (saved) return parseFloat(saved);
    return gender === 'Female' ? 22 : 15;
  });

  const [targetWeight, setTargetWeight] = useState<number>(() => {
    return Number(localStorage.getItem('fitai_user_target_weight') || '70');
  });

  // State for uploads (Starts empty)
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [sideImage, setSideImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);

  // File names for metadata/validation checks
  const [frontFileName, setFrontFileName] = useState<string>('');
  const [sideFileName, setSideFileName] = useState<string>('');
  const [backFileName, setBackFileName] = useState<string>('');

  // Image quality validation scanner status
  const [validationState, setValidationState] = useState<'idle' | 'checking' | 'passed' | 'failed'>('idle');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [validationSteps, setValidationSteps] = useState<{ label: string; status: 'idle' | 'checking' | 'passed' | 'failed' }[]>([]);

  const [scanResult, setScanResult] = useState<BodyScanLog | null>(null);
  const [logs, setLogs] = useState<BodyScanLog[]>(() => {
    try {
      const saved = localStorage.getItem('fitai_body_fat_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SCANS;
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [scanLabel, setScanLabel] = useState('My AI Body Composition Scan');

  // Keep track of active interval and timeouts to prevent duplicates and memory leaks
  const activeIntervalRef = useRef<any>(null);
  const activeTimeoutRef = useRef<any>(null);

  // Clean up timers on component unmount
  useEffect(() => {
    return () => {
      if (activeIntervalRef.current) {
        clearInterval(activeIntervalRef.current);
      }
      if (activeTimeoutRef.current) {
        clearTimeout(activeTimeoutRef.current);
      }
    };
  }, []);

  // Webcam states
  const [activeCameraView, setActiveCameraView] = useState<'front' | 'side' | 'back' | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Macros tab selection
  const [selectedMacroGoal, setSelectedMacroGoal] = useState<'loss' | 'maintenance' | 'gain'>('loss');

  // Compare scan IDs
  const [compareScanAId, setCompareScanAId] = useState<string>('');
  const [compareScanBId, setCompareScanBId] = useState<string>('');

  // Svg hover points
  const [hoveredPoint, setHoveredPoint] = useState<{
    chartId: string;
    index: number;
    x: number;
    y: number;
    val: number;
    date: string;
  } | null>(null);

  // Keep target body fat synced to local storage
  useEffect(() => {
    localStorage.setItem('fitai_target_body_fat', String(targetBodyFat));
  }, [targetBodyFat]);

  // Keep target weight synced to local storage
  useEffect(() => {
    localStorage.setItem('fitai_user_target_weight', String(targetWeight));
  }, [targetWeight]);

  // Keep biometric parameters synced to local storage when changed
  useEffect(() => {
    localStorage.setItem('fitai_user_weight', String(weight));
    localStorage.setItem('fitai_user_gender', gender);
    localStorage.setItem('fitai_user_height', String(height));
    localStorage.setItem('fitai_user_age', String(age));
  }, [weight, gender, height, age]);

  // Set default comparison IDs based on scan logs
  useEffect(() => {
    if (logs.length >= 2) {
      if (!compareScanAId) setCompareScanAId(logs[1].id); // Previous Scan
      if (!compareScanBId) setCompareScanBId(logs[0].id); // Current Scan
    }
  }, [logs, compareScanAId, compareScanBId]);

  useEffect(() => {
    localStorage.setItem('fitai_body_fat_logs', JSON.stringify(logs));
  }, [logs]);

  // Webcam hooks
  useEffect(() => {
    if (activeCameraView) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeCameraView]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => console.error("Video play error:", err));
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Unable to access camera. Please check camera permissions or upload an image file instead.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      if (activeCameraView === 'front') {
        setFrontImage(dataUrl);
        setFrontFileName('camera_capture_front.jpg');
      }
      if (activeCameraView === 'side') {
        setSideImage(dataUrl);
        setSideFileName('camera_capture_side.jpg');
      }
      if (activeCameraView === 'back') {
        setBackImage(dataUrl);
        setBackFileName('camera_capture_back.jpg');
      }
      setActiveCameraView(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, position: 'front' | 'side' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File exceeds the 10 MB limit. Please select a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (position === 'front') {
        setFrontImage(reader.result as string);
        setFrontFileName(file.name);
      }
      if (position === 'side') {
        setSideImage(reader.result as string);
        setSideFileName(file.name);
      }
      if (position === 'back') {
        setBackImage(reader.result as string);
        setBackFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = (position: 'front' | 'side' | 'back') => {
    if (position === 'front') {
      setFrontImage(null);
      setFrontFileName('');
    }
    if (position === 'side') {
      setSideImage(null);
      setSideFileName('');
    }
    if (position === 'back') {
      setBackImage(null);
      setBackFileName('');
    }
  };

  const handleStartEstimation = () => {
    // 1. Prevent duplicate run triggers
    if (validationState === 'checking' || activeIntervalRef.current) {
      return;
    }

    // 2. Clear any existing timers
    if (activeIntervalRef.current) {
      clearInterval(activeIntervalRef.current);
      activeIntervalRef.current = null;
    }
    if (activeTimeoutRef.current) {
      clearTimeout(activeTimeoutRef.current);
      activeTimeoutRef.current = null;
    }

    // 3. Image validation check
    if (!frontImage || !sideImage || !backImage) {
      setValidationState('failed');
      setValidationMessage('Missing Photos: Please upload or capture all three photos (Front, Side, and Back) before starting AI estimation.');
      return;
    }

    setScanResult(null);
    setValidationMessage(null);
    setValidationState('checking');
    
    const initialSteps = [
      { label: 'Person detected', status: 'checking' as const },
      { label: 'Full body visible', status: 'idle' as const },
      { label: 'Proper lighting', status: 'idle' as const },
      { label: 'Standing posture', status: 'idle' as const },
      { label: 'Face not blocked', status: 'idle' as const }
    ];
    setValidationSteps(initialSteps);

    let currentStep = 0;
    
    activeIntervalRef.current = setInterval(() => {
      // Safety check: ensure images are still present
      if (!frontImage || !sideImage || !backImage) {
        if (activeIntervalRef.current) {
          clearInterval(activeIntervalRef.current);
          activeIntervalRef.current = null;
        }
        setValidationState('failed');
        setValidationMessage('Missing Photos: Verification interrupted. Please make sure all three photos remain uploaded.');
        return;
      }

      // Check if step fails
      let stepFailed = false;
      const imgToCheck = currentStep === 0 ? frontImage : (currentStep === 1 ? sideImage : backImage);
      const nameToCheck = currentStep === 0 ? frontFileName : (currentStep === 1 ? sideFileName : backFileName);
      
      if (imgToCheck && imgToCheck.length < 500) {
        stepFailed = true;
      }
      if (nameToCheck && nameToCheck.toLowerCase().includes('fail')) {
        stepFailed = true;
      }

      if (stepFailed) {
        if (activeIntervalRef.current) {
          clearInterval(activeIntervalRef.current);
          activeIntervalRef.current = null;
        }
        setValidationState('failed');
        
        setValidationSteps(prev => {
          const next = [...prev];
          if (next[currentStep]) {
            next[currentStep].status = 'failed';
          }
          return next;
        });

        if (currentStep === 0) {
          setValidationMessage("No person detected. Please upload a clear full-body image.");
        } else if (currentStep === 4) {
          setValidationMessage("Face is obstructed. For accurate biometric analysis, stand clear with your face visible.");
        } else {
          setValidationMessage("Image quality is insufficient for accurate estimation. Please retake the photo in better lighting with your full body visible.");
        }
        return;
      }

      // Mark step as passed
      setValidationSteps(prev => {
        const next = [...prev];
        if (next[currentStep]) {
          next[currentStep].status = 'passed';
        }
        if (currentStep + 1 < next.length) {
          next[currentStep + 1].status = 'checking';
        }
        return next;
      });

      currentStep++;

      if (currentStep >= initialSteps.length) {
        if (activeIntervalRef.current) {
          clearInterval(activeIntervalRef.current);
          activeIntervalRef.current = null;
        }
        setValidationState('passed');
        
        // Execute analysis after passing checks with Try/Catch error protection
        activeTimeoutRef.current = setTimeout(() => {
          try {
            const bmiVal = parseFloat((weight / ((height / 100) ** 2)).toFixed(1));
            
            // Standard YMCA/BIA approximation
            let bf = 0;
            if (gender === 'Male') {
              bf = 1.20 * bmiVal + 0.23 * age - 16.2;
            } else {
              bf = 1.20 * bmiVal + 0.23 * age - 5.4;
            }
            
            bf = Math.max(3, Math.min(50, parseFloat(bf.toFixed(1))));
            const fatMass = parseFloat((weight * (bf / 100)).toFixed(1));
            const leanMass = parseFloat((weight - fatMass).toFixed(1));
            const muscleMass = parseFloat((leanMass * 0.78).toFixed(1));
            const ffmiVal = parseFloat((leanMass / ((height / 100) ** 2)).toFixed(2));
            
            // BMR & TDEE
            const bmr = 10 * weight + 6.25 * height - 5 * age + (gender === 'Male' ? 5 : -161);
            const tdee = Math.round(bmr * 1.375); // active metabolism
            
            const maintenance = tdee;
            const fatLoss = tdee - 500;
            const aggressive = Math.max(gender === 'Male' ? 1500 : 1200, tdee - 750);
            const muscleGain = tdee + 350;
            
            const cat = getEstimatedCategory(gender, bf);
            const proteinMin = Math.round(leanMass * 1.6);
            const proteinMax = Math.round(leanMass * 2.2);

            const result: BodyScanLog = {
              id: `scan-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              weight,
              bodyFat: bf,
              leanMass,
              fatMass,
              muscleMass,
              ffmi: ffmiVal,
              bmi: bmiVal,
              maintenanceCalories: maintenance,
              fatLossCalories: fatLoss,
              aggressiveCalories: aggressive,
              muscleGainCalories: muscleGain,
              targetBodyFat,
              confidence: Math.round(92 + Math.random() * 5),
              category: cat,
              label: scanLabel,
              proteinMin,
              proteinMax,
              images: {
                front: frontImage,
                side: sideImage,
                back: backImage
              }
            };

            setScanResult(result);
            setValidationState('idle');

            localStorage.setItem('fitai_latest_body_composition', JSON.stringify({
              bodyFat: bf,
              weight: weight,
              targetBF: targetBodyFat,
              targetWeight: targetWeight,
              lastScanDate: result.date,
              progressPct: Math.max(0, Math.min(100, Math.round(((bf - targetBodyFat) / (bf || 1)) * 100)))
            }));
            window.dispatchEvent(new Event('fitai_logs_updated'));
          } catch (err) {
            console.error("AI estimation analysis failed:", err);
            setValidationState('failed');
            setValidationMessage("AI Analysis Failed: An unexpected error occurred while analyzing the biometric data. Please try again.");
          } finally {
            activeTimeoutRef.current = null;
          }
        }, 300);
      }
    }, 250);
  };

  const handleSaveResult = () => {
    if (!scanResult) return;
    setLogs(prev => [scanResult, ...prev]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDeleteLog = (id: string) => {
    setLogs(prev => prev.filter(item => item.id !== id));
  };

  // Silhouette outline guides for camera capture overlay
  const renderSilhouette = (position: 'front' | 'side' | 'back') => {
    const strokeColor = "rgba(6, 182, 212, 0.5)";
    return (
      <svg viewBox="0 0 100 200" className="w-20 h-40 opacity-70">
        {position === 'front' && (
          <path 
            d="M50 20 C42 20 40 28 50 35 C60 28 58 20 50 20 M50 35 L50 60 M50 40 L30 50 L25 75 M50 40 L70 50 L75 75 M50 60 L38 105 L35 170 M50 60 L62 105 L65 170" 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth="1.5" 
          />
        )}
        {position === 'side' && (
          <path 
            d="M53 20 C46 22 47 28 51 35 L47 60 L45 95 L50 135 L49 170 M51 35 C42 42 41 55 49 60 M50 40 L38 75" 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth="1.5" 
          />
        )}
        {position === 'back' && (
          <path 
            d="M50 20 C42 20 40 28 50 35 C60 28 58 20 50 20 M50 35 L50 60 M50 40 L32 48 L27 75 M50 40 L68 48 L73 75 M50 60 L38 105 L35 170 M50 60 L62 105 L65 170 M42 48 L48 70 M58 48 L52 70" 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth="1.5" 
          />
        )}
      </svg>
    );
  };

  // Dynamic Macro calculations
  const currentMacros = React.useMemo(() => {
    const baselineWeight = scanResult ? scanResult.weight : weight;
    const baselineLBM = scanResult ? scanResult.leanMass : (baselineWeight * 0.75);
    const baselineCals = scanResult ? scanResult.maintenanceCalories : 2000;
    
    let activeCals = baselineCals;
    let pMultiplier = 1.8;
    
    if (selectedMacroGoal === 'loss') {
      activeCals = scanResult ? scanResult.fatLossCalories : (baselineCals - 500);
      pMultiplier = 2.2;
    } else if (selectedMacroGoal === 'gain') {
      activeCals = scanResult ? scanResult.muscleGainCalories : (baselineCals + 350);
      pMultiplier = 2.0;
    }

    const protein = Math.round(baselineLBM * pMultiplier);
    const fats = Math.round((activeCals * 0.25) / 9);
    const carbs = Math.max(20, Math.round((activeCals - (protein * 4) - (fats * 9)) / 4));
    const fiber = Math.round((activeCals / 1000) * 14);
    const water = Math.round(baselineWeight * 35);

    return {
      calories: activeCals,
      protein,
      carbs,
      fats,
      fiber,
      water
    };
  }, [scanResult, weight, selectedMacroGoal]);

  // Goal Timeline calculations
  const goalTimeline = React.useMemo(() => {
    const currentWeight = scanResult ? scanResult.weight : weight;
    const currentBF = scanResult ? scanResult.bodyFat : 22;
    const diffWeight = currentWeight - targetWeight;
    const isWeightLoss = diffWeight > 0;
    const rate = isWeightLoss ? 0.5 : 0.25; 
    
    if (diffWeight === 0) {
      return {
        weeks: 0,
        rateText: '0 kg/week',
        dateText: 'Target Achieved',
        progressPct: 100
      };
    }
    
    const weeks = Math.ceil(Math.abs(diffWeight) / rate);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (weeks * 7));
    const dateText = targetDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

    // Progress percentage calculation
    const totalToLose = currentBF - targetBodyFat;
    const progressPct = totalToLose > 0 
      ? Math.max(0, Math.min(99, Math.round(((totalToLose - 0.5) / totalToLose) * 100)))
      : 100;

    return {
      weeks,
      rateText: `${rate} kg / week (${isWeightLoss ? 'Safe Deficit' : 'Lean Surplus'})`,
      dateText,
      progressPct
    };
  }, [scanResult, weight, targetWeight, targetBodyFat]);

  // AI recommendations
  const customRecommendations = React.useMemo(() => {
    const proteinText = `${currentMacros.protein}g (${selectedMacroGoal === 'loss' ? 'Preserve lean muscle' : selectedMacroGoal === 'gain' ? 'Build new muscle' : 'Maintain muscle mass'})`;
    const caloriesText = `${currentMacros.calories} kcal/day (${selectedMacroGoal === 'loss' ? 'Moderate deficit' : selectedMacroGoal === 'gain' ? 'Lean bulking surplus' : 'Maintenance baseline'})`;
    const carbsText = `${currentMacros.carbs}g`;
    const fatsText = `${currentMacros.fats}g`;
    const fiberText = `${currentMacros.fiber}g`;
    const waterText = `${(currentMacros.water / 1000).toFixed(1)}L`;

    if (selectedMacroGoal === 'loss') {
      return {
        calories: caloriesText,
        protein: proteinText,
        carbs: carbsText,
        fats: fatsText,
        fiber: fiberText,
        water: waterText,
        frequency: "3 - 4 Strength sessions / week (Focus on compound lifts)",
        cardio: "150-180 mins low-intensity steady-state (LISS) cardio / week",
        recovery: "7.5 - 8.5 hours sleep. Keep rest intervals at 90-120 seconds between working sets."
      };
    } else if (selectedMacroGoal === 'gain') {
      return {
        calories: caloriesText,
        protein: proteinText,
        carbs: carbsText,
        fats: fatsText,
        fiber: fiberText,
        water: waterText,
        frequency: "4 - 5 Weightlifting sessions / week (Focus on progressive overload)",
        cardio: "2x 20 mins High Intensity Interval Training (HIIT) / week",
        recovery: "8+ hours sleep. Schedule 1 deload week every 6-8 weeks of training."
      };
    } else {
      return {
        calories: caloriesText,
        protein: proteinText,
        carbs: carbsText,
        fats: fatsText,
        fiber: fiberText,
        water: waterText,
        frequency: "3 - 4 Strength sessions / week (Focus on core & progressive overload)",
        cardio: "60 - 90 mins active recovery walks / week",
        recovery: "8 hours sleep. Keep rest intervals at 90 seconds."
      };
    }
  }, [currentMacros, selectedMacroGoal]);

  // Before & After compare scans selection
  const scanA = logs[1] || null; // Previous scan
  const scanB = logs[0] || null; // Current scan

  const renderCompareDelta = (valA: number, valB: number, type: 'fat' | 'muscle' | 'weight' | 'other') => {
    const diff = valB - valA;
    if (diff === 0) return <span className="text-zinc-500 font-bold">No change</span>;
    
    let isGood = false;
    if (type === 'fat') {
      isGood = diff < 0; 
    } else if (type === 'muscle') {
      isGood = diff > 0;
    } else if (type === 'weight') {
      isGood = diff < 0; 
    } else {
      isGood = diff > 0;
    }
    
    const sign = diff > 0 ? '+' : '';
    return (
      <span className={`font-bold px-2 py-0.5 rounded-md ${isGood ? 'bg-brand-lime/10 text-brand-lime' : 'bg-red-400/10 text-red-400'}`}>
        {sign}{diff.toFixed(1)} {type === 'fat' ? '%' : (type === 'other' ? '' : 'kg')}
      </span>
    );
  };

  return (
    <section className="relative py-24 overflow-hidden min-h-screen text-zinc-100 bg-[#03000a] text-left">
      {/* Background Lighting glows */}
      <div className="absolute top-[15%] left-[10%] w-[380px] h-[380px] bg-brand-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[10%] w-[380px] h-[380px] bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 bg-brand-cyan/10 border border-brand-cyan/20 px-3.5 py-1 rounded-full text-brand-cyan font-bold text-xs tracking-wider uppercase">
            <Activity className="h-3.5 w-3.5 mr-1 inline-block text-brand-cyan animate-pulse" /> Advanced Biometrics
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-white">
            AI Body Composition Estimator
          </h2>
          
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            Extract muscle/fat ratios, metabolic limits, and macronutrient targets by scanning biological posture profiles.
          </p>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex border-b border-white/5 gap-6 mb-8 max-w-6xl mx-auto">
          {[
            { id: 'scanner', label: 'AI Composition Scanner', icon: Camera },
            { id: 'compare', label: 'Before & After Compare', icon: RefreshCw },
            { id: 'trends', label: 'Composition Trends & History', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-3.5 text-xs font-black uppercase tracking-wider transition-all relative ${
                  isActive ? 'text-brand-cyan' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {isActive && (
                  <motion.div 
                    layoutId="activeEstimatorTab"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-cyan shadow-glow-cyan" 
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: AI SCANNER PANEL */}
        {activeTab === 'scanner' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
            {/* Controls & Scans Panel (7 Columns) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <SpotlightCard className="p-6 space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                  <Camera className="h-4.5 w-4.5 text-brand-cyan" /> Body Scanning Inputs
                </h3>

                {/* Personal values selection */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase block">Weight (kg)</label>
                    <input
                      type="number"
                      min="35"
                      max="200"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-cyan font-bold"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase block">Height (cm)</label>
                    <input
                      type="number"
                      min="100"
                      max="250"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-cyan font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase block">Age</label>
                    <input
                      type="number"
                      min="12"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-cyan font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase block">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none font-bold"
                    >
                      <option value="Male" className="bg-dark-950">Male</option>
                      <option value="Female" className="bg-dark-950">Female</option>
                    </select>
                  </div>
                </div>

                {/* Target parameters selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase block">Target Weight (kg)</label>
                      <span className="text-xs font-black text-brand-lime">{targetWeight} kg</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="40"
                        max="120"
                        step="0.5"
                        value={targetWeight}
                        onChange={(e) => setTargetWeight(Number(e.target.value))}
                        className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-brand-lime"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase block">Target Body Fat (%)</label>
                      <span className="text-xs font-black text-brand-cyan">{targetBodyFat}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="5"
                        max="40"
                        step="0.5"
                        value={targetBodyFat}
                        onChange={(e) => setTargetBodyFat(Number(e.target.value))}
                        className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
                      />
                    </div>
                  </div>
                </div>

                {/* Scanner log description */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase block">Scan Label / Note</label>
                  <input
                    type="text"
                    value={scanLabel}
                    onChange={(e) => setScanLabel(e.target.value)}
                    className="w-full px-3.5 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-cyan"
                    placeholder="e.g. Morning scan, Post-workout check-in"
                  />
                </div>

                {/* File Capture Deck */}
                <div className="grid grid-cols-3 gap-4">
                  {(['front', 'side', 'back'] as const).map((pos) => {
                    const image = pos === 'front' ? frontImage : pos === 'side' ? sideImage : backImage;
                    const fileName = pos === 'front' ? frontFileName : pos === 'side' ? sideFileName : backFileName;
                    return (
                      <div key={pos} className="space-y-2">
                        <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block text-center">{pos} View</span>
                        <div className="relative h-48 rounded-2xl border border-white/5 bg-dark-950 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-white/10 group">
                          {image ? (
                            <>
                              <img src={image} className="w-full h-full object-cover" alt={`${pos} upload`} />
                              
                              <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-20">
                                <button
                                  type="button"
                                  onClick={() => handleClearImage(pos)}
                                  disabled={validationState === 'checking'}
                                  className={`p-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 transition-all shadow-md animate-fadeIn ${
                                    validationState === 'checking' ? 'opacity-40 cursor-not-allowed' : 'hover:bg-red-500 hover:text-white'
                                  }`}
                                  title="Remove Image"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveCameraView(pos)}
                                  disabled={validationState === 'checking'}
                                  className={`p-1.5 bg-brand-cyan/20 border border-brand-cyan/35 rounded-lg text-brand-cyan transition-all shadow-md ${
                                    validationState === 'checking' ? 'opacity-40 cursor-not-allowed' : 'hover:bg-brand-cyan hover:text-white'
                                  }`}
                                  title="Retake Photo"
                                >
                                  <Camera className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm p-1 text-center truncate">
                                <span className="text-[8px] text-zinc-400 font-semibold">{fileName}</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-3 w-full h-full text-center space-y-3">
                              <label className={`flex flex-col items-center justify-center text-center p-2 rounded-xl transition-all w-full ${
                                validationState === 'checking' ? 'pointer-events-none opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'
                              }`}>
                                <Upload className="h-5 w-5 text-zinc-500 mb-1 group-hover:text-brand-cyan transition-colors" />
                                <span className="text-[9px] text-zinc-400 font-bold block uppercase tracking-wider">Upload File</span>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  disabled={validationState === 'checking'}
                                  onChange={(e) => handleImageUpload(e, pos)}
                                  className="hidden" 
                                />
                              </label>
                              
                              <div className="text-[8px] text-zinc-650 font-bold uppercase tracking-widest">— OR —</div>
                              
                              <button
                                type="button"
                                onClick={() => setActiveCameraView(pos)}
                                disabled={validationState === 'checking'}
                                className={`px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-zinc-300 transition-all flex items-center gap-1 w-full justify-center ${
                                  validationState === 'checking' ? 'opacity-40 cursor-not-allowed' : 'hover:border-brand-cyan hover:bg-brand-cyan/15 hover:text-white'
                                }`}
                              >
                                <Camera className="h-3.5 w-3.5 text-brand-cyan" /> Take Photo
                              </button>
                            </div>
                          )}

                          {/* Scanner sweep line overlay */}
                          {validationState === 'checking' && (
                            <motion.div 
                               className="absolute inset-x-0 h-1 bg-brand-cyan shadow-[0_0_10px_rgba(6,182,212,0.8)] z-10"
                              animate={{ top: ['0%', '100%', '0%'] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartEstimation}
                    disabled={validationState === 'checking' || !frontImage || !sideImage || !backImage}
                    className={`w-full py-4 text-white text-xs font-black rounded-xl hover:scale-101 transition-all flex items-center justify-center gap-2 shadow-glow-cyan ${
                      !frontImage || !sideImage || !backImage || validationState === 'checking'
                        ? 'bg-zinc-800 text-zinc-505 cursor-not-allowed border border-white/5 shadow-none'
                        : 'bg-gradient-to-r from-brand-cyan to-brand-violet'
                    }`}
                  >
                    {validationState === 'checking' ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-brand-cyan" />
                        <span>Analyzing body composition...</span>
                      </>
                    ) : (
                      <>
                        <Scale className="h-4 w-4" />
                        <span>Run AI Estimation</span>
                      </>
                    )}
                  </button>
                </div>
              </SpotlightCard>

              {/* Validation Step indicators */}
              {validationState !== 'idle' && (
                <SpotlightCard className="p-5 space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-brand-cyan animate-pulse" /> Image Validation Diagnostic Heuristics
                  </h4>
                  <div className="space-y-2">
                    {validationSteps.map((step) => (
                      <div key={step.label} className="flex justify-between items-center text-xs">
                        <span className="text-zinc-300 font-semibold">{step.label}:</span>
                        <div className="flex items-center gap-2">
                          {step.status === 'idle' && <span className="text-[10px] text-zinc-605 font-bold uppercase">Waiting</span>}
                          {step.status === 'checking' && (
                            <span className="text-[10px] text-brand-cyan font-bold uppercase animate-pulse flex items-center gap-1">
                              <RefreshCw className="h-3 w-3 animate-spin" /> Verifying...
                            </span>
                          )}
                          {step.status === 'passed' && (
                            <span className="text-[10px] text-brand-lime font-black uppercase flex items-center gap-1">
                              <Check className="h-3.5 w-3.5 text-brand-lime stroke-[4]" /> Passed
                            </span>
                          )}
                          {step.status === 'failed' && (
                            <span className="text-[10px] text-brand-pink font-black uppercase flex items-center gap-1">
                              <X className="h-3.5 w-3.5 text-brand-pink stroke-[4]" /> Rejected
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {validationState === 'failed' && validationMessage && (
                    <div className="p-4 bg-brand-pink/10 border border-brand-pink/20 text-brand-pink rounded-xl flex items-start gap-2.5 text-xs text-left animate-fadeIn">
                      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-brand-pink" />
                      <div className="space-y-1">
                        <span className="font-extrabold uppercase text-[10px] tracking-wider block">Validation Instructions:</span>
                        <p className="text-zinc-350 text-[11px] leading-relaxed mb-2">{validationMessage}</p>
                        <div className="text-[10px] text-zinc-400 space-y-1 leading-normal list-disc pl-3">
                          <div>• Check that you are fully visible in the frame (8-10 feet away).</div>
                          <div>• Wear fitted gym/athletic wear to highlight body contour.</div>
                          <div>• Avoid overhead backlighting; stand in front of light sources.</div>
                          <div>• Keep a neutral standing posture with hands away from sides.</div>
                          <div>• Do not block your face with your smartphone during mirror capture.</div>
                        </div>
                      </div>
                    </div>
                  )}
                </SpotlightCard>
              )}
            </div>

            {/* Results Display Panel (5 Columns) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <SpotlightCard className="p-6 h-full flex flex-col justify-between items-center text-center space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2 w-full justify-center">
                  <Activity className="h-4.5 w-4.5 text-brand-cyan" /> Composition Report
                </h3>

                {validationState === 'checking' ? (
                  <div className="h-72 flex flex-col items-center justify-center text-center space-y-4 px-4 py-8 animate-pulse w-full">
                    <div className="relative h-16 w-16 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-brand-cyan/20 border-t-brand-cyan animate-spin" />
                      <Scale className="h-8 w-8 text-brand-cyan animate-bounce" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-wider mb-2">
                        Analyzing body composition...
                      </p>
                      <p className="text-[11px] text-zinc-400 max-w-[280px] leading-relaxed mx-auto">
                        Evaluating anatomical outlines, silhouette proportions, and adipose tissue contours across all angles...
                      </p>
                    </div>
                  </div>
                ) : scanResult ? (
                  <div className="space-y-6 w-full animate-fadeIn">
                    {/* Body Fat Percentage display */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative h-32 w-32 flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="54" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                          <circle 
                            cx="64" 
                            cy="64" 
                            r="54" 
                            stroke="#06b6d4" 
                            strokeWidth="8" 
                            fill="transparent" 
                            strokeDasharray={339}
                            strokeDashoffset={339 - (339 * Math.min(100, scanResult.bodyFat)) / 100}
                            strokeLinecap="round"
                            className="transition-all duration-700 ease-out"
                          />
                        </svg>
                        <div className="z-10 text-center">
                          <span className="text-3xl font-display font-black text-white">{scanResult.bodyFat}%</span>
                          <span className="text-[9px] text-zinc-550 font-bold block uppercase tracking-wider">Est. Body Fat</span>
                        </div>
                      </div>

                      <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 border rounded-full mt-1.5 ${getCategoryColor(scanResult.category)}`}>
                        {scanResult.category}
                      </div>

                      <div className="text-[10px] text-zinc-450 font-bold flex items-center gap-1.5 bg-white/5 border border-white/5 px-3 py-1 rounded-full mt-1">
                        <Check className="h-3.5 w-3.5 text-brand-lime" /> {scanResult.confidence}% AI Confidence Level
                      </div>
                    </div>

                    {/* Calculations breakdown details */}
                    <div className="grid grid-cols-2 gap-3 text-left">
                      <div className="p-3 bg-dark-950/60 border border-white/5 rounded-xl space-y-1">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block">Lean Body Mass</span>
                        <span className="text-sm font-black text-white">{scanResult.leanMass} kg</span>
                      </div>

                      <div className="p-3 bg-dark-950/60 border border-white/5 rounded-xl space-y-1">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block">Fat Mass</span>
                        <span className="text-sm font-black text-white">{scanResult.fatMass} kg</span>
                      </div>

                      <div className="p-3 bg-dark-950/60 border border-white/5 rounded-xl space-y-1">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block">Muscle Mass (Est)</span>
                        <span className="text-sm font-black text-white">{scanResult.muscleMass} kg</span>
                      </div>

                      <div className="p-3 bg-dark-950/60 border border-white/5 rounded-xl space-y-1">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block">FFMI Index</span>
                        <span className="text-sm font-black text-white">{scanResult.ffmi}</span>
                      </div>

                      <div className="p-3 bg-dark-950/60 border border-white/5 rounded-xl space-y-1 col-span-2">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block">BMI Index</span>
                        <span className="text-xs font-black text-white block">{scanResult.bmi} kg/m²</span>
                      </div>
                    </div>

                    {/* Goal Tracker Section */}
                    <div className="border-t border-white/5 pt-4 text-left space-y-3">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase block">Interactive Recomp Goal Tracker</span>
                      <div className="p-4 bg-dark-950/60 border border-white/5 rounded-2xl space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[8px] text-zinc-500 font-bold uppercase block">Current Weight</span>
                            <span className="text-xs font-extrabold text-white">{scanResult.weight} kg</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-500 font-bold uppercase block">Target Weight</span>
                            <span className="text-xs font-extrabold text-white">{targetWeight} kg</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-500 font-bold uppercase block">Current Body Fat</span>
                            <span className="text-xs font-extrabold text-brand-cyan">{scanResult.bodyFat}%</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-500 font-bold uppercase block">Target Body Fat</span>
                            <span className="text-xs font-extrabold text-brand-cyan">{targetBodyFat}%</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-white/5">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-zinc-500 font-bold uppercase">Progress %:</span>
                            <span className="text-brand-lime font-black">{goalTimeline.progressPct}%</span>
                          </div>
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-brand-lime h-full rounded-full" style={{ width: `${goalTimeline.progressPct}%` }} />
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-zinc-500 font-bold uppercase">Estimated Goal Date:</span>
                          <span className="text-brand-cyan font-black">{goalTimeline.dateText}</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Coach Personal Recommendations */}
                    <div className="border-t border-white/5 pt-4 text-left space-y-3 w-full">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-[10px] text-brand-violet font-black uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-brand-violet" /> AI Biometric Recommendations
                        </span>
                        
                        {/* Macro Goal Switcher */}
                        <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5">
                          {(['loss', 'maintenance', 'gain'] as const).map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setSelectedMacroGoal(g)}
                              className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-md transition-all ${
                                selectedMacroGoal === g 
                                  ? 'bg-brand-violet text-white shadow-sm' 
                                  : 'text-zinc-500 hover:text-white'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2 bg-dark-950/60 p-4 border border-white/5 rounded-2xl text-[11px] leading-relaxed">
                        <div>
                          <strong className="text-white uppercase text-[8px] text-brand-cyan block">Target Daily Calories</strong>
                          <span className="text-zinc-300">{customRecommendations.calories}</span>
                        </div>
                        <div className="border-t border-white/5 pt-1.5">
                          <strong className="text-white uppercase text-[8px] text-brand-cyan block">Target Daily Protein</strong>
                          <span className="text-zinc-300">{customRecommendations.protein}</span>
                        </div>
                        <div className="border-t border-white/5 pt-1.5 grid grid-cols-2 gap-2">
                          <div>
                            <strong className="text-white uppercase text-[8px] text-brand-cyan block">Target Carbs</strong>
                            <span className="text-zinc-300">{customRecommendations.carbs}</span>
                          </div>
                          <div>
                            <strong className="text-white uppercase text-[8px] text-brand-cyan block">Target Fats</strong>
                            <span className="text-zinc-300">{customRecommendations.fats}</span>
                          </div>
                        </div>
                        <div className="border-t border-white/5 pt-1.5 grid grid-cols-2 gap-2">
                          <div>
                            <strong className="text-white uppercase text-[8px] text-brand-cyan block">Target Fiber</strong>
                            <span className="text-zinc-300">{customRecommendations.fiber}</span>
                          </div>
                          <div>
                            <strong className="text-white uppercase text-[8px] text-brand-cyan block">Target Hydration</strong>
                            <span className="text-zinc-300">{customRecommendations.water}</span>
                          </div>
                        </div>
                        <div className="border-t border-white/5 pt-1.5">
                          <strong className="text-white uppercase text-[8px] text-brand-cyan block">Workout Frequency</strong>
                          <span className="text-zinc-300">{customRecommendations.frequency}</span>
                        </div>
                        <div className="border-t border-white/5 pt-1.5">
                          <strong className="text-white uppercase text-[8px] text-brand-cyan block">Cardio Recommendation</strong>
                          <span className="text-zinc-300">{customRecommendations.cardio}</span>
                        </div>
                        <div className="border-t border-white/5 pt-1.5">
                          <strong className="text-white uppercase text-[8px] text-brand-cyan block">Recovery Advice</strong>
                          <span className="text-zinc-300">{customRecommendations.recovery}</span>
                        </div>
                      </div>
                    </div>

                    {/* Save Log buttons */}
                    <div className="pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={handleSaveResult}
                        className="w-full py-3 bg-brand-violet text-white text-xs font-black rounded-xl hover:scale-101 transition-transform flex items-center justify-center gap-1.5 shadow-glow-purple"
                      >
                        <CheckCircle className="h-4 w-4" /> Save this Scan to History
                      </button>
                      <AnimatePresence>
                        {saveSuccess && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-2 text-[10px] text-emerald-400 font-bold"
                          >
                            Logged scan data committed to trackers!
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ) : (
                  <div className="h-72 flex flex-col items-center justify-center text-center space-y-3 px-4">
                    <Activity className="h-10 w-10 text-zinc-700 animate-pulse" />
                    <p className="text-xs text-zinc-500 italic leading-relaxed">
                      Upload front, side, and back body images and trigger scanner heuristics to synthesize composition report.
                    </p>
                  </div>
                )}
              </SpotlightCard>
            </div>
          </div>
        )}

        {/* TAB 2: BEFORE & AFTER PANEL */}
        {activeTab === 'compare' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <SpotlightCard className="p-6 space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                <RefreshCw className="h-4.5 w-4.5 text-brand-cyan" /> Scan Delta Comparison (Current vs Previous)
              </h3>

              {!scanA || !scanB ? (
                <div className="text-center py-12 space-y-3">
                  <Activity className="h-10 w-10 text-zinc-650 mx-auto animate-pulse" />
                  <p className="text-xs text-zinc-500 italic">
                    Log at least two scans in history to run comparative Before & After delta progress analyses.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Side by side display */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    {/* Photo previews */}
                    <div className="md:col-span-5 grid grid-cols-2 gap-4 bg-dark-950/40 p-4 rounded-2xl border border-white/5 text-center">
                      <div className="space-y-2">
                        <span className="text-[10px] text-zinc-500 font-black uppercase block">Previous Scan ({scanA.date})</span>
                        <div className="h-44 bg-dark-900 rounded-xl overflow-hidden flex items-center justify-center border border-white/5">
                          {scanA.images?.front && scanA.images.front !== 'silhouette-front-placeholder' ? (
                            <img src={scanA.images.front} className="w-full h-full object-cover" alt="Before Front" />
                          ) : (
                            renderSilhouette('front')
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 block">{scanA.weight} kg / {scanA.bodyFat}% BF</span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] text-brand-cyan font-black uppercase block">Current Scan ({scanB.date})</span>
                        <div className="h-44 bg-dark-900 rounded-xl overflow-hidden flex items-center justify-center border border-brand-cyan/20">
                          {scanB.images?.front && scanB.images.front !== 'silhouette-front-placeholder' ? (
                            <img src={scanB.images.front} className="w-full h-full object-cover" alt="After Front" />
                          ) : (
                            renderSilhouette('front')
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-white block">{scanB.weight} kg / {scanB.bodyFat}% BF</span>
                      </div>
                    </div>

                    {/* Comparison Metrics Grid */}
                    <div className="md:col-span-7 bg-dark-950/60 border border-white/5 p-4 rounded-2xl">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-3 border-b border-white/5 pb-1">Comparative Metrics Delta</span>
                      
                      <div className="space-y-3.5 text-xs text-left">
                        {[
                          { label: 'Weight Change', valA: scanA.weight, valB: scanB.weight, type: 'weight' as const },
                          { label: 'Body Fat Change', valA: scanA.bodyFat, valB: scanB.bodyFat, type: 'fat' as const },
                          { label: 'Fat Loss Estimate', valA: scanA.fatMass, valB: scanB.fatMass, type: 'fat' as const },
                          { label: 'Muscle Gain Estimate', valA: scanA.muscleMass, valB: scanB.muscleMass, type: 'muscle' as const }
                        ].map((item) => (
                          <div key={item.label} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <span className="text-zinc-400 font-bold">{item.label}:</span>
                            <div className="flex gap-4 items-center font-mono">
                              <span className="text-zinc-500">{item.valA.toFixed(1)}</span>
                              <span className="text-zinc-400">&rarr;</span>
                              <span className="text-white font-bold">{item.valB.toFixed(1)}</span>
                              {renderCompareDelta(item.valA, item.valB, item.type)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI Comparison Insight advisory */}
                  <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/15 rounded-2xl flex items-start gap-2.5 text-xs text-left">
                    <Info className="h-5 w-5 text-brand-cyan shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold uppercase text-[10px] tracking-wider block mb-0.5 text-brand-cyan">AI Comparison Progress Insights</span>
                      <p className="text-zinc-400 text-[11px] leading-relaxed">
                        {scanB.bodyFat - scanA.bodyFat <= 0 
                          ? `Between ${scanA.date} and ${scanB.date}, you decreased body fat by ${Math.abs(scanB.bodyFat - scanA.bodyFat).toFixed(1)}%. This shows successful metabolic adaptation and caloric deficit compliance. Continue with structured progressive overload to preserve muscle density.` 
                          : `Your body fat increased by ${(scanB.bodyFat - scanA.bodyFat).toFixed(1)}% between ${scanA.date} and ${scanB.date}. Examine carbohydrate loading periods and daily steps to improve insulin efficiency.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </SpotlightCard>
          </div>
        )}

        {/* TAB 3: COMPOSITION TRENDS PANEL */}
        {activeTab === 'trends' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Trends Charts Grid (7 Columns) */}
              <div className="lg:col-span-7">
                <SpotlightCard className="p-6 space-y-6 h-full text-left">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                    <TrendingUp className="h-4.5 w-4.5 text-brand-lime" /> Composition Trends Charts
                  </h3>

                  {logs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Chart 1: Weight */}
                      <div className="p-4 bg-dark-900/30 border border-white/5 rounded-2xl">
                        <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block mb-2">Total Weight (kg)</span>
                        <SvgLineChart 
                          chartId="weight"
                          data={logs.map(l => l.weight).reverse()} 
                          dates={logs.map(l => l.date).reverse()} 
                          strokeColor="#ec4899" 
                          fillColorStart="#ec4899" 
                          yUnit="kg"
                          hoveredPoint={hoveredPoint}
                          setHoveredPoint={setHoveredPoint}
                        />
                      </div>

                      {/* Chart 2: Body Fat % */}
                      <div className="p-4 bg-dark-900/30 border border-white/5 rounded-2xl">
                        <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block mb-2">Body Fat (%)</span>
                        <SvgLineChart 
                          chartId="bodyfat"
                          data={logs.map(l => l.bodyFat).reverse()} 
                          dates={logs.map(l => l.date).reverse()} 
                          strokeColor="#06b6d4" 
                          fillColorStart="#06b6d4" 
                          yUnit="%"
                          hoveredPoint={hoveredPoint}
                          setHoveredPoint={setHoveredPoint}
                        />
                      </div>

                      {/* Chart 3: Lean Mass */}
                      <div className="p-4 bg-dark-900/30 border border-white/5 rounded-2xl">
                        <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block mb-2">Lean Body Mass (kg)</span>
                        <SvgLineChart 
                          chartId="leanmass"
                          data={logs.map(l => l.leanMass).reverse()} 
                          dates={logs.map(l => l.date).reverse()} 
                          strokeColor="#a3e635" 
                          fillColorStart="#a3e635" 
                          yUnit="kg"
                          hoveredPoint={hoveredPoint}
                          setHoveredPoint={setHoveredPoint}
                        />
                      </div>

                      {/* Chart 4: Fat Mass */}
                      <div className="p-4 bg-dark-900/30 border border-white/5 rounded-2xl">
                        <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block mb-2">Fat Mass (kg)</span>
                        <SvgLineChart 
                          chartId="fatmass"
                          data={logs.map(l => l.fatMass).reverse()} 
                          dates={logs.map(l => l.date).reverse()} 
                          strokeColor="#f59e0b" 
                          fillColorStart="#f59e0b" 
                          yUnit="kg"
                          hoveredPoint={hoveredPoint}
                          setHoveredPoint={setHoveredPoint}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-zinc-505 text-xs italic">
                      Log scans to populate metric trendlines
                    </div>
                  )}
                </SpotlightCard>
              </div>

              {/* Historical Scans Logs (5 Columns) */}
              <div className="lg:col-span-5">
                <SpotlightCard className="p-6 space-y-6 h-full flex flex-col justify-between text-left">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2 mb-4">
                      <Info className="h-4.5 w-4.5 text-zinc-400" /> Historical Logs
                    </h3>

                    {logs.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic text-center py-12">No body scans logged. Start scanning above!</p>
                    ) : (
                      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                        {logs.map((log) => (
                          <div key={log.id} className="p-3 bg-dark-950/60 border border-white/5 rounded-xl space-y-2 text-xs">
                            <div className="flex justify-between items-center border-b border-white/5 pb-1">
                              <span className="font-extrabold text-white">{log.label || 'Biometric scan'}</span>
                              <button 
                                onClick={() => handleDeleteLog(log.id)}
                                className="p-1 rounded text-zinc-500 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-1 text-[10px] text-zinc-400">
                              <div>Date: <strong className="text-white">{log.date}</strong></div>
                              <div>Weight: <strong className="text-white">{log.weight} kg</strong></div>
                              <div>Body Fat: <strong className="text-brand-cyan">{log.bodyFat}%</strong></div>
                              <div>Lean Mass: <strong className="text-brand-lime">{log.leanMass} kg</strong></div>
                              <div>Fat Mass: <strong className="text-brand-pink">{log.fatMass} kg</strong></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] text-zinc-500 leading-relaxed">
                    FitAI matches skeletal images with lipid density algorithms to provide real-time estimates. Check back monthly to track recomposition averages.
                  </div>
                </SpotlightCard>
              </div>
            </div>

            {/* Visual Timeline Section */}
            <SpotlightCard className="p-6 space-y-4 text-left">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                <Calendar className="h-4.5 w-4.5 text-brand-pink" /> Visual Timeline History
              </h3>
              
              {logs.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No timeline entries found.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {logs.map((log) => (
                    <div key={log.id} className="p-4 bg-dark-900 border border-white/5 rounded-2xl space-y-3 flex flex-col justify-between hover:border-white/10 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-black text-white">{log.label}</h4>
                          <span className="text-[9px] text-zinc-500 font-semibold">{log.date}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase ${getCategoryColor(log.category)}`}>
                          {log.category}
                        </span>
                      </div>
                      
                      {/* Thumbnails */}
                      <div className="flex gap-2 justify-center bg-dark-950/60 p-2 rounded-xl border border-white/5">
                        {['front', 'side', 'back'].map((pos) => {
                          const img = log.images?.[pos as 'front' | 'side' | 'back'];
                          return (
                            <div key={pos} className="w-14 h-24 bg-dark-900 rounded-lg overflow-hidden flex items-center justify-center border border-white/5">
                              {img ? (
                                <img src={img} className="w-full h-full object-cover" alt={pos} />
                              ) : (
                                renderSilhouette(pos as any)
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Info */}
                      <div className="grid grid-cols-4 gap-2 text-center text-[9px] border-t border-white/5 pt-2">
                        <div>
                          <span className="text-zinc-505 block">Weight</span>
                          <span className="font-bold text-white">{log.weight} kg</span>
                        </div>
                        <div>
                          <span className="text-zinc-505 block">Body Fat</span>
                          <span className="font-bold text-brand-cyan">{log.bodyFat}%</span>
                        </div>
                        <div>
                          <span className="text-zinc-550 block">Lean Mass</span>
                          <span className="font-bold text-brand-lime">{log.leanMass} kg</span>
                        </div>
                        <div>
                          <span className="text-zinc-550 block">FFMI</span>
                          <span className="font-bold text-brand-pink">{log.ffmi}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SpotlightCard>
          </div>
        )}

        {/* Categorization Matrix Display */}
        <div className="max-w-6xl mx-auto mt-8">
          <SpotlightCard className="p-6 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
              <Award className="h-4.5 w-4.5 text-brand-pink" /> Body Fat Categorization Standards
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* Male standard */}
              <div className="space-y-3">
                <span className="text-xs font-black text-brand-cyan uppercase tracking-wider block">Men Reference Matrix</span>
                <div className="space-y-2">
                  {[
                    { name: 'Essential Fat', range: '2 – 5%' },
                    { name: 'Athlete', range: '6 – 13%' },
                    { name: 'Fitness', range: '14 – 17%' },
                    { name: 'Average', range: '18 – 24%' },
                    { name: 'Overweight', range: '25 – 29%' },
                    { name: 'Obese', range: '30%+' }
                  ].map((cat) => {
                    const isSelected = scanResult && gender === 'Male' && scanResult.category === cat.name;
                    return (
                      <div 
                        key={cat.name} 
                        className={`p-2.5 rounded-xl border flex justify-between items-center text-xs transition-all ${
                          isSelected 
                            ? 'bg-brand-cyan/20 border-brand-cyan text-white shadow-glow-cyan font-black scale-[1.01]' 
                            : 'bg-dark-950/40 border-white/5 text-zinc-400'
                        }`}
                      >
                        <span className="font-semibold">{cat.name}</span>
                        <span className="font-mono font-bold">{cat.range}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Female standard */}
              <div className="space-y-3">
                <span className="text-xs font-black text-brand-pink uppercase tracking-wider block">Women Reference Matrix</span>
                <div className="space-y-2">
                  {[
                    { name: 'Essential Fat', range: '10 – 13%' },
                    { name: 'Athlete', range: '14 – 20%' },
                    { name: 'Fitness', range: '21 – 24%' },
                    { name: 'Average', range: '25 – 31%' },
                    { name: 'Overweight', range: '32 – 37%' },
                    { name: 'Obese', range: '38%+' }
                  ].map((cat) => {
                    const isSelected = scanResult && gender === 'Female' && scanResult.category === cat.name;
                    return (
                      <div 
                        key={cat.name} 
                        className={`p-2.5 rounded-xl border flex justify-between items-center text-xs transition-all ${
                          isSelected 
                            ? 'bg-brand-pink/20 border-brand-pink text-white shadow-glow-pink font-black scale-[1.01]' 
                            : 'bg-dark-950/40 border-white/5 text-zinc-400'
                        }`}
                      >
                        <span className="font-semibold">{cat.name}</span>
                        <span className="font-mono font-bold">{cat.range}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Explanation details card for the current category */}
            {scanResult && (
              <div className="mt-4 p-4 bg-white/5 border border-white/5 rounded-2xl text-left text-xs space-y-3 animate-fadeIn">
                <h4 className="font-extrabold text-white text-[11px] uppercase tracking-wider flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-brand-cyan" /> Category Breakdown: {getCategoryExplanation(scanResult.category).title}
                </h4>
                <p className="text-zinc-300 leading-relaxed">{getCategoryExplanation(scanResult.category).desc}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                  <div>
                    <span className="text-[9px] text-zinc-550 font-bold uppercase block text-brand-lime">Recommended Nutrition Focus</span>
                    <p className="text-zinc-450 mt-0.5 leading-relaxed">{getCategoryExplanation(scanResult.category).nutrition}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-550 font-bold uppercase block text-brand-cyan">Recommended Training Focus</span>
                    <p className="text-zinc-400 mt-0.5 leading-relaxed">{getCategoryExplanation(scanResult.category).training}</p>
                  </div>
                </div>
              </div>
            )}
          </SpotlightCard>
        </div>

        {/* Global Footer: Safety Medical Disclaimer Box */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="p-5 bg-amber-500/5 border border-amber-500/20 text-amber-250/90 rounded-2xl flex items-start gap-3.5 text-xs text-left">
            <ShieldAlert className="h-6 w-6 shrink-0 text-amber-500" />
            <div>
              <span className="font-extrabold uppercase text-[10px] tracking-wider block mb-1">Safety Medical Notice</span>
              <p className="text-zinc-405 text-[11px] leading-relaxed">
                Body fat estimates are AI-generated approximations and should not be considered medical measurements.
              </p>
            </div>
          </div>
        </div>

        {/* Live Video Camera Capture Modal */}
        <AnimatePresence>
          {activeCameraView && (
            <div className="fixed inset-0 z-50 bg-[#03000a]/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-dark-900 border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative text-left">
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#070412]">
                  <h4 className="text-sm font-display font-black text-white flex items-center gap-2">
                    <Camera className="h-4.5 w-4.5 text-brand-cyan" /> Live Webcam Scanner - {activeCameraView.toUpperCase()} View
                  </h4>
                  <button 
                    onClick={() => setActiveCameraView(null)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Camera stream container */}
                  <div className="relative aspect-video rounded-2xl bg-black border border-white/5 overflow-hidden flex items-center justify-center">
                    {cameraError ? (
                      <div className="p-6 text-center space-y-3">
                        <ShieldAlert className="h-10 w-10 text-red-400 mx-auto" />
                        <p className="text-xs text-red-200 font-bold">{cameraError}</p>
                      </div>
                    ) : (
                      <>
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-full h-full object-cover transform scale-x-[-1]" 
                        />
                        
                        {/* Silhouette guide overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          {renderSilhouette(activeCameraView)}
                        </div>

                        {/* Grid overlay lines */}
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none">
                          <div className="border-r border-b border-white/40" />
                          <div className="border-r border-b border-white/40" />
                          <div className="border-b border-white/40" />
                          <div className="border-r border-b border-white/40" />
                          <div className="border-r border-b border-white/40" />
                          <div className="border-b border-white/40" />
                          <div className="border-r border-white/40" />
                          <div className="border-r border-white/40" />
                          <div className="transparent" />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Capture guidance instructions */}
                  <div className="p-3 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl flex items-start gap-2.5 text-xs text-left">
                    <Info className="h-4.5 w-4.5 text-brand-cyan mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-white block">Pose Guidelines:</span>
                      <p className="text-zinc-400 leading-relaxed text-[11px]">
                        {activeCameraView === 'front' && 'Stand straight facing the camera with your arms slightly away from your hips. Ensure your full torso is visible.'}
                        {activeCameraView === 'side' && 'Turn 90 degrees. Stand side-on to the camera showing your profile. Keep your posture natural and neutral.'}
                        {activeCameraView === 'back' && 'Turn completely away from the camera. Stand straight with arms slightly separated to allow back/shoulder posture assessment.'}
                      </p>
                    </div>
                  </div>

                  {/* Modal Buttons */}
                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      onClick={() => setActiveCameraView(null)}
                      className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold text-zinc-300 transition-colors"
                    >
                      Cancel
                    </button>
                    {!cameraError && (
                      <button
                        onClick={handleCapture}
                        className="px-5 py-2.5 bg-gradient-to-r from-brand-cyan to-brand-violet text-white text-xs font-black rounded-xl hover:scale-102 transition-all flex items-center gap-1.5 shadow-glow-cyan"
                      >
                        <Camera className="h-4 w-4" /> Capture Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};

const DEFAULT_SCANS: BodyScanLog[] = [
  {
    id: 'scan-mock-1',
    date: '2026-03-15',
    weight: 90,
    bodyFat: 26.5,
    leanMass: 66.2,
    fatMass: 23.8,
    muscleMass: 50.3,
    ffmi: 21.6,
    bmi: 29.4,
    maintenanceCalories: 2700,
    fatLossCalories: 2200,
    aggressiveCalories: 1950,
    muscleGainCalories: 3050,
    targetBodyFat: 18,
    confidence: 89,
    category: 'Overweight',
    label: 'Initial Scan',
    proteinMin: 106,
    proteinMax: 146,
    images: {
      front: 'silhouette-front-placeholder',
      side: 'silhouette-side-placeholder',
      back: 'silhouette-back-placeholder'
    }
  },
  {
    id: 'scan-mock-2',
    date: '2026-04-15',
    weight: 87.2,
    bodyFat: 24.0,
    leanMass: 66.3,
    fatMass: 20.9,
    muscleMass: 50.4,
    ffmi: 21.6,
    bmi: 28.5,
    maintenanceCalories: 2650,
    fatLossCalories: 2150,
    aggressiveCalories: 1900,
    muscleGainCalories: 3000,
    targetBodyFat: 18,
    confidence: 91,
    category: 'Average',
    label: 'Consistency Check',
    proteinMin: 106,
    proteinMax: 146,
    images: {
      front: 'silhouette-front-placeholder',
      side: 'silhouette-side-placeholder',
      back: 'silhouette-back-placeholder'
    }
  },
  {
    id: 'scan-mock-3',
    date: '2026-05-15',
    weight: 84.5,
    bodyFat: 21.0,
    leanMass: 66.8,
    fatMass: 17.7,
    muscleMass: 50.8,
    ffmi: 21.8,
    bmi: 27.6,
    maintenanceCalories: 2600,
    fatLossCalories: 2100,
    aggressiveCalories: 1850,
    muscleGainCalories: 2950,
    targetBodyFat: 18,
    confidence: 93,
    category: 'Average',
    label: 'Progress Review',
    proteinMin: 107,
    proteinMax: 147,
    images: {
      front: 'silhouette-front-placeholder',
      side: 'silhouette-side-placeholder',
      back: 'silhouette-back-placeholder'
    }
  }
];
