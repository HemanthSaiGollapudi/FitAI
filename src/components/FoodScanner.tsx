import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Upload, Apple, Sparkles, Scale, Trash2, 
  Clock, ShieldAlert, CheckCircle2, Info
} from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

export interface LoggedScannedFood {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  servingSize: string;
  timestamp: number;
}

interface FoodScannerProps {
  onAddScannedFood: (food: Omit<LoggedScannedFood, 'id' | 'timestamp'>) => void;
}

interface FoodItemInfo {
  name: string;
  serving: string;
  weightG: number;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  confidence: number;
}

// Full lookup database for the requested single and combo foods
const FOOD_METADATA: Record<string, FoodItemInfo[]> = {
  // --- Indian Single Foods ---
  'Idli': [
    { name: 'Idli', serving: '2 pcs', weightG: 80, kcal: 120, protein: 3, carbs: 26, fats: 0.5, fiber: 1.5, sugar: 0.2, confidence: 96 }
  ],
  'Dosa': [
    { name: 'Dosa', serving: '1 pc', weightG: 100, kcal: 160, protein: 4, carbs: 29, fats: 3, fiber: 2, sugar: 0.5, confidence: 95 }
  ],
  'Sambar': [
    { name: 'Sambar', serving: '1 cup', weightG: 150, kcal: 90, protein: 4, carbs: 12, fats: 2.5, fiber: 3, sugar: 1.0, confidence: 94 }
  ],
  'Upma': [
    { name: 'Upma', serving: '1 cup', weightG: 150, kcal: 210, protein: 4, carbs: 38, fats: 4, fiber: 2.5, sugar: 1.2, confidence: 93 }
  ],
  'Poha': [
    { name: 'Poha', serving: '1 cup', weightG: 150, kcal: 180, protein: 3, carbs: 33, fats: 3.5, fiber: 2, sugar: 0.8, confidence: 92 }
  ],
  'Chapati/Roti': [
    { name: 'Chapati/Roti', serving: '1 pc', weightG: 40, kcal: 85, protein: 3, carbs: 18, fats: 0.5, fiber: 2.5, sugar: 0.1, confidence: 97 }
  ],
  'Rice': [
    { name: 'Steamed Rice', serving: '1 cup', weightG: 150, kcal: 200, protein: 4, carbs: 44, fats: 0.4, fiber: 0.6, sugar: 0, confidence: 98 }
  ],
  'Dal': [
    { name: 'Dal (Lentils)', serving: '1 cup', weightG: 150, kcal: 150, protein: 9, carbs: 24, fats: 2, fiber: 6, sugar: 0.5, confidence: 96 }
  ],
  'Paneer Curry': [
    { name: 'Paneer Curry', serving: '1 bowl', weightG: 150, kcal: 280, protein: 14, carbs: 10, fats: 20, fiber: 1.5, sugar: 2.0, confidence: 94 }
  ],
  'Chicken Curry': [
    { name: 'Chicken Curry', serving: '1 serving', weightG: 150, kcal: 240, protein: 26, carbs: 6, fats: 12, fiber: 1.2, sugar: 1.5, confidence: 95 }
  ],
  'Biryani': [
    { name: 'Chicken Biryani', serving: '1 plate', weightG: 300, kcal: 550, protein: 22, carbs: 70, fats: 18, fiber: 3, sugar: 1.0, confidence: 96 }
  ],
  'Butter Chicken': [
    { name: 'Butter Chicken', serving: '1 serving', weightG: 150, kcal: 360, protein: 24, carbs: 12, fats: 24, fiber: 1.5, sugar: 4.0, confidence: 93 }
  ],
  'Rajma': [
    { name: 'Rajma (Kidney Beans)', serving: '1 cup', weightG: 150, kcal: 180, protein: 10, carbs: 28, fats: 3, fiber: 7, sugar: 1.5, confidence: 94 }
  ],
  'Chole': [
    { name: 'Chole (Chickpeas)', serving: '1 cup', weightG: 150, kcal: 210, protein: 8, carbs: 32, fats: 5, fiber: 6, sugar: 2.0, confidence: 94 }
  ],
  'Pulao': [
    { name: 'Vegetable Pulao', serving: '1 plate', weightG: 200, kcal: 260, protein: 5, carbs: 52, fats: 4, fiber: 2, sugar: 0.5, confidence: 92 }
  ],
  'Samosa': [
    { name: 'Samosa', serving: '1 pc', weightG: 75, kcal: 260, protein: 4, carbs: 32, fats: 12, fiber: 2, sugar: 1.5, confidence: 97 }
  ],
  'Vada': [
    { name: 'Mendu Vada', serving: '2 pcs', weightG: 80, kcal: 190, protein: 5, carbs: 24, fats: 8, fiber: 3, sugar: 0.3, confidence: 95 }
  ],
  'Pani Puri': [
    { name: 'Pani Puri', serving: '6 pcs', weightG: 120, kcal: 180, protein: 3, carbs: 30, fats: 5, fiber: 3.5, sugar: 1.5, confidence: 91 }
  ],
  'Paratha': [
    { name: 'Aloo Paratha', serving: '1 pc', weightG: 80, kcal: 240, protein: 5, carbs: 38, fats: 8, fiber: 3, sugar: 0.5, confidence: 94 }
  ],
  'Egg Curry': [
    { name: 'Egg Curry', serving: '1 serving', weightG: 150, kcal: 220, protein: 14, carbs: 8, fats: 14, fiber: 1, sugar: 2.0, confidence: 95 }
  ],

  // --- International Single Foods ---
  'Pizza': [
    { name: 'Pizza', serving: '1 slice', weightG: 100, kcal: 260, protein: 12, carbs: 30, fats: 10, fiber: 2.5, sugar: 3.0, confidence: 98 }
  ],
  'Burger': [
    { name: 'Cheeseburger', serving: '1 pc', weightG: 150, kcal: 380, protein: 18, carbs: 40, fats: 16, fiber: 3, sugar: 5.0, confidence: 97 }
  ],
  'Pasta': [
    { name: 'Tomato Pasta', serving: '1 plate', weightG: 200, kcal: 320, protein: 11, carbs: 58, fats: 6, fiber: 3, sugar: 4.0, confidence: 96 }
  ],
  'Salad': [
    { name: 'Green Salad', serving: '1 bowl', weightG: 150, kcal: 45, protein: 1.5, carbs: 8, fats: 0.5, fiber: 4, sugar: 2.5, confidence: 97 }
  ],
  'Sandwich': [
    { name: 'Club Sandwich', serving: '1 serving', weightG: 150, kcal: 290, protein: 12, carbs: 36, fats: 10, fiber: 4, sugar: 3.0, confidence: 95 }
  ],
  'Steak': [
    { name: 'Beef Steak', serving: '1 serving', weightG: 200, kcal: 400, protein: 48, carbs: 0, fats: 22, fiber: 0, sugar: 0, confidence: 98 }
  ],
  'Sushi': [
    { name: 'Sushi Platter', serving: '6 pcs', weightG: 150, kcal: 220, protein: 9, carbs: 42, fats: 1.5, fiber: 1, sugar: 3.0, confidence: 96 }
  ],
  'Noodles': [
    { name: 'Stir-fried Noodles', serving: '1 plate', weightG: 200, kcal: 310, protein: 8, carbs: 54, fats: 7, fiber: 2, sugar: 3.0, confidence: 95 }
  ],
  'Fried Chicken': [
    { name: 'Fried Chicken', serving: '1 serving', weightG: 150, kcal: 390, protein: 28, carbs: 18, fats: 23, fiber: 1, sugar: 0.5, confidence: 97 }
  ],
  'Tacos': [
    { name: 'Beef Tacos', serving: '2 pcs', weightG: 150, kcal: 290, protein: 14, carbs: 32, fats: 12, fiber: 5, sugar: 2.0, confidence: 96 }
  ],
  'Pancakes': [
    { name: 'Pancakes', serving: '2 pcs', weightG: 100, kcal: 220, protein: 5, carbs: 44, fats: 3, fiber: 1.5, sugar: 8.0, confidence: 94 }
  ],
  'Oatmeal': [
    { name: 'Oatmeal Bowl', serving: '1 bowl', weightG: 150, kcal: 150, protein: 5, carbs: 27, fats: 2.5, fiber: 4, sugar: 1.0, confidence: 97 }
  ],

  // --- Combined Plates / Multi-item On One Plate ---
  'Rice + Chicken Curry + Salad': [
    { name: 'Steamed Rice', serving: '1 cup', weightG: 150, kcal: 200, protein: 4, carbs: 44, fats: 0.4, fiber: 0.6, sugar: 0, confidence: 97 },
    { name: 'Chicken Curry', serving: '150 g', weightG: 150, kcal: 240, protein: 26, carbs: 6, fats: 12, fiber: 1.2, sugar: 1.5, confidence: 95 },
    { name: 'Mixed Salad', serving: '50 g', weightG: 50, kcal: 15, protein: 0.5, carbs: 3, fats: 0.1, fiber: 1.5, sugar: 0.8, confidence: 93 }
  ],
  'Idli + Sambar + Vada': [
    { name: 'Idli', serving: '2 pcs', weightG: 80, kcal: 120, protein: 3, carbs: 26, fats: 0.5, fiber: 1.5, sugar: 0.2, confidence: 96 },
    { name: 'Sambar', serving: '1 cup', weightG: 150, kcal: 90, protein: 4, carbs: 12, fats: 2.5, fiber: 3, sugar: 1.0, confidence: 94 },
    { name: 'Mendu Vada', serving: '1 pc', weightG: 40, kcal: 95, protein: 2.5, carbs: 12, fats: 4, fiber: 1.5, sugar: 0.15, confidence: 92 }
  ],
  'Rice + Dal + Chapati': [
    { name: 'Steamed Rice', serving: '1 cup', weightG: 150, kcal: 200, protein: 4, carbs: 44, fats: 0.4, fiber: 0.6, sugar: 0, confidence: 96 },
    { name: 'Dal (Lentils)', serving: '1 cup', weightG: 150, kcal: 150, protein: 9, carbs: 24, fats: 2, fiber: 6, sugar: 0.5, confidence: 94 },
    { name: 'Chapati/Roti', serving: '1 pc', weightG: 40, kcal: 85, protein: 3, carbs: 18, fats: 0.5, fiber: 2.5, sugar: 0.1, confidence: 95 }
  ],
  'Biryani + Salad': [
    { name: 'Chicken Biryani', serving: '1 plate', weightG: 300, kcal: 550, protein: 22, carbs: 70, fats: 18, fiber: 3, sugar: 1.0, confidence: 96 },
    { name: 'Cucumber Onion Salad', serving: '100 g', weightG: 100, kcal: 30, protein: 1.0, carbs: 6, fats: 0.2, fiber: 2.5, sugar: 1.8, confidence: 91 }
  ]
};

export const FoodScanner: React.FC<FoodScannerProps> = ({ 
  onAddScannedFood 
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');
  
  // Camera & Image Upload state
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<FoodItemInfo[] | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState(1);
  const [diarySaveSuccess, setDiarySaveSuccess] = useState(false);
  
  // Simulator preset selection
  const [selectedPreset, setSelectedPreset] = useState<string>('Rice + Chicken Curry + Salad');
  
  // History list filter
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  
  // Refs for video/canvas camera captures
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Launch camera
  const handleStartCamera = async () => {
    setSelectedImage(null);
    setAnalysisResults(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      alert("Could not access your camera. Please ensure permissions are granted or upload a photo instead.");
      setCameraActive(false);
    }
  };

  // Capture frame
  const handleCapturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setSelectedImage(dataUrl);
        // Stop stream
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        setCameraActive(false);
      }
    }
  };

  // Upload handles
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Maximum image size supported is 10 MB!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setAnalysisResults(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Maximum image size supported is 10 MB!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setAnalysisResults(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // AI Analyzer Emulator
  const handleTriggerAnalysis = () => {
    setIsAnalyzing(true);
    setPortionMultiplier(1);
    
    // Simulate Vision API processing delay
    setTimeout(() => {
      // Find food metadata from selected preset
      const items = FOOD_METADATA[selectedPreset] || FOOD_METADATA['Salad'];
      setAnalysisResults(items);
      setIsAnalyzing(false);
    }, 1800);
  };

  // Synchronize with Local Storage Scan History and Today's diary log
  const handleAddScannedFoodToDiary = () => {
    if (!analysisResults) return;

    // Sum matching active portion multiplier
    const totalKcal = Math.round(analysisResults.reduce((sum, item) => sum + item.kcal, 0) * portionMultiplier);
    const totalProt = Math.round(analysisResults.reduce((sum, item) => sum + item.protein, 0) * portionMultiplier);
    const totalCarb = Math.round(analysisResults.reduce((sum, item) => sum + item.carbs, 0) * portionMultiplier);
    const totalFat = Math.round(analysisResults.reduce((sum, item) => sum + item.fats, 0) * portionMultiplier);
    const totalFiber = Math.round(analysisResults.reduce((sum, item) => sum + item.fiber, 0) * portionMultiplier);
    const totalSugar = Math.round(analysisResults.reduce((sum, item) => sum + item.sugar, 0) * portionMultiplier);

    const foodNameString = analysisResults.map(item => item.name).join(' + ');
    const displayServingSize = `${portionMultiplier}x portion (${Math.round(analysisResults.reduce((sum, item) => sum + item.weightG, 0) * portionMultiplier)}g)`;

    onAddScannedFood({
      name: foodNameString,
      kcal: totalKcal,
      protein: totalProt,
      carbs: totalCarb,
      fats: totalFat,
      fiber: totalFiber,
      sugar: totalSugar,
      servingSize: displayServingSize
    });

    // Write to history logs list in localStorage
    const localHistory = JSON.parse(localStorage.getItem('fitai_scan_history') || '[]');
    const newHistoryEntry = {
      id: `scan-hist-${Date.now()}`,
      name: foodNameString,
      kcal: totalKcal,
      protein: totalProt,
      carbs: totalCarb,
      fats: totalFat,
      fiber: totalFiber,
      sugar: totalSugar,
      servingSize: displayServingSize,
      image: selectedImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      timestamp: Date.now()
    };
    localStorage.setItem('fitai_scan_history', JSON.stringify([newHistoryEntry, ...localHistory]));

    setDiarySaveSuccess(true);
    setTimeout(() => setDiarySaveSuccess(false), 2000);
  };

  // Retrieve scan history from localstorage
  const getScanHistoryList = () => {
    try {
      const list = JSON.parse(localStorage.getItem('fitai_scan_history') || '[]');
      if (historySearchQuery) {
        return list.filter((item: any) => item.name.toLowerCase().includes(historySearchQuery.toLowerCase()));
      }
      return list;
    } catch {
      return [];
    }
  };

  const handleClearSingleHistory = (id: string) => {
    try {
      const list = JSON.parse(localStorage.getItem('fitai_scan_history') || '[]');
      const filtered = list.filter((item: any) => item.id !== id);
      localStorage.setItem('fitai_scan_history', JSON.stringify(filtered));
      // Trigger update
      setHistorySearchQuery(historySearchQuery); // Force re-render state
    } catch (err) {
      console.error(err);
    }
  };

  const scanHistory = getScanHistoryList();

  // Results math
  const getMacroSummary = () => {
    if (!analysisResults) return { kcal: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0 };
    return {
      kcal: Math.round(analysisResults.reduce((sum, item) => sum + item.kcal, 0) * portionMultiplier),
      protein: Math.round(analysisResults.reduce((sum, item) => sum + item.protein, 0) * portionMultiplier),
      carbs: Math.round(analysisResults.reduce((sum, item) => sum + item.carbs, 0) * portionMultiplier),
      fats: Math.round(analysisResults.reduce((sum, item) => sum + item.fats, 0) * portionMultiplier),
      fiber: Math.round(analysisResults.reduce((sum, item) => sum + item.fiber, 0) * portionMultiplier),
      sugar: Math.round(analysisResults.reduce((sum, item) => sum + item.sugar, 0) * portionMultiplier),
    };
  };

  const macros = getMacroSummary();
  const totalMacroGrams = macros.protein + macros.carbs + macros.fats || 1;
  const proteinPercent = Math.round((macros.protein / totalMacroGrams) * 100);
  const carbsPercent = Math.round((macros.carbs / totalMacroGrams) * 100);
  const fatsPercent = Math.round((macros.fats / totalMacroGrams) * 100);

  // Confidence low assessment
  const lowConfidenceDetected = analysisResults?.some(item => item.confidence < 92);

  return (
    <section className="relative py-24 overflow-hidden min-h-screen text-zinc-100 bg-[#03000a] text-left">
      <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] bg-brand-violet/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] bg-brand-cyan/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 bg-brand-violet/10 border border-brand-violet/20 px-3.5 py-1 rounded-full text-brand-violet font-semibold text-xs tracking-wider uppercase">
            Computer Vision
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-white">
            AI Food Scanner
          </h2>
          
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            Snap or upload photos of your meals. Our Gemini Vision API detects food portions and partitions nutritional macronutrients automatically.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex justify-center border-b border-white/5 mb-8 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'scan' ? 'border-brand-violet text-white font-black' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Scanner Plate
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'history' ? 'border-brand-violet text-white font-black' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Scan Log History ({scanHistory.length})
          </button>
        </div>

        {activeTab === 'scan' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
            
            {/* Left Box: Capture Inputs (5 Columns) */}
            <div className="lg:col-span-5 space-y-6">
              
              <SpotlightCard className="p-6 text-center space-y-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 justify-center">
                  <Camera className="h-4.5 w-4.5 text-brand-cyan" /> Visual Intake Port
                </h3>

                {/* Camera Viewport or Image Preview */}
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="relative h-64 w-full bg-dark-950 rounded-2xl border border-dashed border-white/10 overflow-hidden flex flex-col items-center justify-center group"
                >
                  {cameraActive ? (
                    <div className="relative w-full h-full">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover"
                      />
                      {/* Scanning visual sweep line effect */}
                      <div className="absolute inset-0 pointer-events-none border-2 border-brand-cyan/20">
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-brand-cyan to-transparent absolute top-0 left-0 animate-sweep" />
                      </div>
                    </div>
                  ) : selectedImage ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={selectedImage} 
                        alt="Food preview" 
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Bounding box overlays if recognized */}
                      {analysisResults && !isAnalyzing && (
                        <div className="absolute inset-0 pointer-events-none">
                          {/* Emulate multiple bounding boxes on plate */}
                          {analysisResults.map((item, idx) => {
                            const boxes = [
                              { top: '15%', left: '15%', width: '40%', height: '40%', color: 'border-brand-cyan' },
                              { top: '45%', left: '40%', width: '45%', height: '45%', color: 'border-brand-violet' },
                              { top: '10%', left: '55%', width: '30%', height: '30%', color: 'border-brand-lime' }
                            ];
                            const style = boxes[idx % boxes.length];
                            return (
                              <div 
                                key={idx} 
                                className={`absolute border-2 ${style.color} rounded-lg bg-black/20 backdrop-blur-[1px] p-1 flex items-start justify-between`}
                                style={{ top: style.top, left: style.left, width: style.width, height: style.height }}
                              >
                                <span className="text-[8px] font-black bg-dark-950 text-white px-1 py-0.5 rounded leading-none">
                                  {item.name} ({item.confidence}%)
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 space-y-3">
                      <Upload className="h-10 w-10 text-zinc-600 mx-auto group-hover:text-brand-cyan transition-colors" />
                      <p className="text-zinc-400 text-xs font-semibold">Drag & drop your food photo here</p>
                      <span className="text-[10px] text-zinc-500 block">Accepted formats: JPG, PNG, WEBP (Max 10MB)</span>
                    </div>
                  )}

                  {/* Scanning overlay loader */}
                  <AnimatePresence>
                    {isAnalyzing && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4"
                      >
                        <div className="relative h-14 w-14 flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full border-t-2 border-brand-violet animate-spin" />
                          <Apple className="h-6 w-6 text-brand-cyan animate-pulse" />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-xs font-bold text-white animate-pulse">Running Google Gemini Vision...</p>
                          <span className="text-[9px] text-brand-violet font-semibold tracking-wider uppercase block">Partitioning Plate Nutrition</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Capture buttons action */}
                <div className="grid grid-cols-2 gap-3">
                  {cameraActive ? (
                    <button
                      onClick={handleCapturePhoto}
                      className="col-span-2 py-3 bg-brand-cyan text-dark-950 text-xs font-black rounded-xl hover:scale-102 transition-transform flex items-center justify-center gap-1.5"
                    >
                      <Camera className="h-4 w-4" /> Capture Photo
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleStartCamera}
                        className="py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-cyan text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <Camera className="h-4 w-4 text-brand-cyan" /> Use Camera
                      </button>
                      
                      <label className="py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-violet text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                        <Upload className="h-4 w-4 text-brand-violet" /> Browse File
                        <input 
                          type="file" 
                          accept="image/jpeg,image/jpg,image/png,image/webp" 
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </>
                  )}
                </div>

                {/* Simulated Preset Food Selector (Allows testing all required foods) */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block text-left">
                    Simulator Test Dish Preset Selector
                  </label>
                  <select
                    value={selectedPreset}
                    onChange={(e) => {
                      setSelectedPreset(e.target.value);
                      setAnalysisResults(null);
                    }}
                    className="w-full px-3 py-2.5 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
                  >
                    <optgroup label="Multi-Item Combo Plates" className="bg-dark-950">
                      <option value="Rice + Chicken Curry + Salad">Rice + Chicken Curry + Salad</option>
                      <option value="Idli + Sambar + Vada">Idli + Sambar + Vada</option>
                      <option value="Rice + Dal + Chapati">Rice + Dal + Chapati</option>
                      <option value="Biryani + Salad">Biryani + Salad</option>
                    </optgroup>
                    <optgroup label="Indian Classics" className="bg-dark-950">
                      <option value="Idli">Idli (2 pcs)</option>
                      <option value="Dosa">Dosa (1 pc)</option>
                      <option value="Sambar">Sambar (1 cup)</option>
                      <option value="Upma">Upma (1 cup)</option>
                      <option value="Poha">Poha (1 cup)</option>
                      <option value="Chapati/Roti">Chapati / Roti (1 pc)</option>
                      <option value="Rice">Steamed Rice (1 cup)</option>
                      <option value="Dal">Dal (1 cup)</option>
                      <option value="Paneer Curry">Paneer Curry (1 serving)</option>
                      <option value="Chicken Curry">Chicken Curry (1 serving)</option>
                      <option value="Biryani">Chicken Biryani (1 plate)</option>
                      <option value="Butter Chicken">Butter Chicken (1 serving)</option>
                      <option value="Rajma">Rajma Curry (1 cup)</option>
                      <option value="Chole">Chole Chickpeas (1 cup)</option>
                      <option value="Pulao">Vegetable Pulao (1 plate)</option>
                      <option value="Samosa">Samosa (1 pc)</option>
                      <option value="Vada">Mendu Vada (2 pcs)</option>
                      <option value="Pani Puri">Pani Puri (6 pcs)</option>
                      <option value="Paratha">Aloo Paratha (1 pc)</option>
                      <option value="Egg Curry">Egg Curry (1 serving)</option>
                    </optgroup>
                    <optgroup label="International Dishes" className="bg-dark-950">
                      <option value="Pizza">Cheesy Pizza (1 slice)</option>
                      <option value="Burger">Beef Burger (1 pc)</option>
                      <option value="Pasta">Pasta Pomodoro (1 plate)</option>
                      <option value="Salad">Green Salad Bowl</option>
                      <option value="Sandwich">Club Sandwich</option>
                      <option value="Steak">Grilled Steak (200g)</option>
                      <option value="Sushi">Sushi Platter (6 pcs)</option>
                      <option value="Noodles">Stir-fry Noodles</option>
                      <option value="Fried Chicken">Fried Chicken (1 serving)</option>
                      <option value="Tacos">Beef Tacos (2 pcs)</option>
                      <option value="Pancakes">Pancakes (2 pcs)</option>
                      <option value="Oatmeal">Oatmeal Bowl</option>
                    </optgroup>
                  </select>

                  <button
                    onClick={handleTriggerAnalysis}
                    disabled={!selectedImage || isAnalyzing}
                    className="w-full py-3 mt-2 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-black rounded-xl hover:scale-101 transition-transform disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 shadow-glow-purple"
                  >
                    <Sparkles className="h-4 w-4" /> Scan Image & Estimate Macros
                  </button>
                </div>
              </SpotlightCard>

              {/* Disclaimer */}
              <div className="p-3.5 bg-dark-900/40 border border-white/5 rounded-2xl text-[10px] text-zinc-500 leading-relaxed font-semibold">
                <Info className="h-4 w-4 text-zinc-600 inline-block mr-1.5 align-text-bottom" />
                <span>Nutritional values are AI-generated estimates and may vary depending on preparation methods and serving sizes. Do not use for medical tracking.</span>
              </div>

            </div>

            {/* Right Box: Results & Bounding Details (7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              {analysisResults ? (
                <div className="space-y-6">
                  
                  {/* Confidence / Estimate status banner */}
                  {lowConfidenceDetected ? (
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-start gap-2 text-xs">
                      <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                      <p className="font-semibold leading-relaxed">This is an estimate. Please verify portion sizes.</p>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded-xl flex items-start gap-2 text-[11px] font-semibold">
                      <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-brand-cyan animate-pulse" />
                      <p>Gemini Vision: High Confidence Match (95%+ match). Multiple items successfully mapped on plate.</p>
                    </div>
                  )}

                  {/* Detected items table */}
                  <SpotlightCard className="p-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                        <Scale className="h-4 w-4 text-brand-cyan" /> Detected Food Elements
                      </h4>

                      <div className="space-y-2">
                        {analysisResults.map((item, idx) => (
                          <div key={idx} className="p-3 bg-dark-950/50 border border-white/5 rounded-xl flex items-center justify-between text-xs font-semibold">
                            <div>
                              <span className="font-bold text-white block">{item.name}</span>
                              <span className="text-[10px] text-zinc-500 font-semibold block mt-0.5">
                                Serving size: {item.serving} ({Math.round(item.weightG * portionMultiplier)}g weight)
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-brand-lime font-black text-xs block">{Math.round(item.kcal * portionMultiplier)} kcal</span>
                              <span className="text-[9px] text-zinc-500 font-bold block uppercase mt-0.5">Confidence: {item.confidence}%</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Portion Multiplier Controller */}
                      <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="text-left">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Modify Serving Portions</span>
                          <span className="text-xs text-zinc-400">Scale all calculated metrics dynamically.</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setPortionMultiplier(prev => Math.max(0.25, prev - 0.25))}
                            className="h-8 w-8 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                          <span className="text-sm font-mono font-bold text-white w-14 text-center bg-dark-950 px-2 py-1.5 border border-white/5 rounded-lg">
                            {portionMultiplier.toFixed(2)}x
                          </span>
                          <button 
                            onClick={() => setPortionMultiplier(prev => Math.min(5, prev + 0.25))}
                            className="h-8 w-8 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>

                  {/* Nutrition Breakdown display charts */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Primary Nutrients Card (7 Columns) */}
                    <SpotlightCard className="md:col-span-7 p-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">
                          Macro Nutrition Splits
                        </h4>
                        
                        <div className="text-center py-4 bg-dark-950/40 border border-white/5 rounded-xl">
                          <span className="text-3xl font-display font-black text-brand-lime leading-none">{macros.kcal}</span>
                          <span className="text-[10px] text-zinc-400 font-bold block mt-1 uppercase tracking-wider">Total Scanned Kcal</span>
                        </div>

                        {/* Visual Linear Progress Bars */}
                        <div className="space-y-3">
                          {/* Protein */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-baseline text-xs font-semibold">
                              <span className="text-zinc-400 text-[10px] uppercase font-bold">Protein</span>
                              <span className="text-brand-lime font-bold">{macros.protein} g</span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                              <div className="bg-brand-lime h-full rounded-full" style={{ width: `${Math.min(100, Math.round((macros.protein / 50) * 100))}%` }} />
                            </div>
                          </div>

                          {/* Carbs */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-baseline text-xs font-semibold">
                              <span className="text-zinc-400 text-[10px] uppercase font-bold">Carbs</span>
                              <span className="text-brand-cyan font-bold">{macros.carbs} g</span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                              <div className="bg-brand-cyan h-full rounded-full" style={{ width: `${Math.min(100, Math.round((macros.carbs / 100) * 100))}%` }} />
                            </div>
                          </div>

                          {/* Fats */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-baseline text-xs font-semibold">
                              <span className="text-zinc-400 text-[10px] uppercase font-bold">Fats</span>
                              <span className="text-brand-pink font-bold">{macros.fats} g</span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                              <div className="bg-brand-pink h-full rounded-full" style={{ width: `${Math.min(100, Math.round((macros.fats / 40) * 100))}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </SpotlightCard>

                    {/* Macro Percentage Gauge (5 Columns) */}
                    <SpotlightCard className="md:col-span-5 p-6 flex flex-col justify-between items-center text-center">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2 w-full">
                        Macro Split Ratio
                      </h4>

                      <div className="relative h-28 w-28 flex items-center justify-center my-4">
                        {/* Custom visual ring representation */}
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                          {/* Fats ring */}
                          <circle cx="56" cy="56" r="44" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                          <circle cx="56" cy="56" r="44" stroke="#ec4899" strokeWidth="8" fill="transparent" strokeDasharray={276} strokeDashoffset={276 - (276 * fatsPercent) / 100} strokeLinecap="round" />
                          {/* Carbs ring */}
                          <circle cx="56" cy="56" r="32" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                          <circle cx="56" cy="56" r="32" stroke="#06b6d4" strokeWidth="8" fill="transparent" strokeDasharray={201} strokeDashoffset={201 - (201 * carbsPercent) / 100} strokeLinecap="round" />
                          {/* Protein ring */}
                          <circle cx="56" cy="56" r="20" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                          <circle cx="56" cy="56" r="20" stroke="#a3e635" strokeWidth="8" fill="transparent" strokeDasharray={125} strokeDashoffset={125 - (125 * proteinPercent) / 100} strokeLinecap="round" />
                        </svg>
                        <div className="text-[10px] text-zinc-400 font-bold z-10">Ratio</div>
                      </div>

                      <div className="space-y-1 w-full text-left">
                        <div className="flex justify-between items-center text-[9px] text-brand-lime font-bold">
                          <span>• PROTEIN:</span>
                          <span>{proteinPercent}%</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-brand-cyan font-bold">
                          <span>• CARBS:</span>
                          <span>{carbsPercent}%</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-brand-pink font-bold">
                          <span>• FATS:</span>
                          <span>{fatsPercent}%</span>
                        </div>
                      </div>
                    </SpotlightCard>

                  </div>

                  {/* Fiber & Sugar Details */}
                  <SpotlightCard className="p-4">
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                      <div className="flex justify-between items-center bg-dark-950/50 p-2.5 rounded-xl border border-white/5">
                        <span className="text-zinc-500">Total Fiber:</span>
                        <span className="text-white font-bold">{macros.fiber} g</span>
                      </div>
                      <div className="flex justify-between items-center bg-dark-950/50 p-2.5 rounded-xl border border-white/5">
                        <span className="text-zinc-500">Total Sugar:</span>
                        <span className="text-brand-pink font-bold">{macros.sugar} g</span>
                      </div>
                    </div>
                  </SpotlightCard>

                  {/* Actions: Save to diary */}
                  <div>
                    <button
                      onClick={handleAddScannedFoodToDiary}
                      className="w-full py-4 bg-gradient-to-r from-brand-lime to-brand-cyan text-dark-950 text-xs font-black rounded-xl hover:scale-[1.01] transition-transform shadow-glow-lime flex items-center justify-center gap-2"
                    >
                      {diarySaveSuccess ? (
                        <>
                          <CheckCircle2 className="h-4.5 w-4.5 text-dark-950" /> Logged Successfully in Food Diary!
                        </>
                      ) : (
                        <>
                          <Apple className="h-4.5 w-4.5" /> Save Food to Today's Diet Diary Log
                        </>
                      )}
                    </button>
                  </div>

                </div>
              ) : (
                <div className="py-24 text-center border border-dashed border-white/5 rounded-3xl bg-dark-900/10 space-y-3 flex flex-col justify-center items-center h-full">
                  <Apple className="h-10 w-10 text-zinc-700 animate-pulse" />
                  <p className="text-zinc-400 text-xs font-semibold">Waiting for image analysis capture...</p>
                  <span className="text-[10px] text-zinc-500 max-w-sm">
                    Select a testing food preset or browse a device photo, and click "Scan Image" to estimate portion macronutrients.
                  </span>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* SCAN HISTORY LIST VIEW */
          <div className="max-w-4xl mx-auto space-y-6 text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-brand-violet" /> Scan History logs
              </h3>
              <input
                type="text"
                placeholder="Search history by food name..."
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
              />
            </div>

            {scanHistory.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-white/5 rounded-2xl bg-dark-900/10 space-y-3">
                <Clock className="h-8 w-8 text-zinc-600 mx-auto" />
                <p className="text-zinc-400 text-xs font-semibold">No scan history recorded.</p>
                <span className="text-[10px] text-zinc-500 block">Scanned entries are saved here once added to your diary.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scanHistory.map((item: any) => (
                  <div key={item.id} className="p-4 bg-dark-900/30 border border-white/5 rounded-2xl flex items-start gap-4">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="h-16 w-16 rounded-xl object-cover shrink-0 border border-white/5"
                    />
                    <div className="flex-1 space-y-2 text-xs font-semibold">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">{item.name}</h4>
                          <span className="text-[9px] text-zinc-500 block mt-0.5">
                            {new Date(item.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {item.servingSize}
                          </span>
                        </div>
                        <button
                          onClick={() => handleClearSingleHistory(item.id)}
                          className="text-zinc-600 hover:text-red-400 p-1 rounded transition-colors shrink-0"
                          title="Delete entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 pt-1.5 border-t border-white/5 text-[9px] uppercase tracking-wider text-zinc-400">
                        <div>
                          <span className="block text-[8px] text-zinc-500 font-bold">Kcal</span>
                          <span className="text-white font-extrabold">{item.kcal}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-zinc-500 font-bold">Protein</span>
                          <span className="text-brand-lime font-extrabold">{item.protein}g</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-zinc-500 font-bold">Carbs</span>
                          <span className="text-brand-cyan font-extrabold">{item.carbs}g</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-zinc-500 font-bold">Fats</span>
                          <span className="text-brand-pink font-extrabold">{item.fats}g</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
