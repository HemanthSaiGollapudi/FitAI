import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, Send, Plus, Trash2, 
  Copy, Check, Sparkles, ShieldAlert, Clock, ArrowRight, User
} from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';
import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import type { WorkoutRoutine } from './WorkoutBuilder';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  // Structured elements to render separately
  directAnswer?: string;
  reasoning?: string;
  actionSteps?: string[];
  warnings?: string[];
  recommendations?: { name: string; type: 'exercise' | 'meal'; id?: string }[];
}

export interface ChatConversation {
  id: string;
  title: string;
  timestamp: number;
  messages: Message[];
}

interface AICoachProps {
  onSaveRoutine: (routine: WorkoutRoutine) => void;
  savedExercises: string[];
}

// Complete mock response library for preset queries
const PRESET_ANSWERS: Record<string, Omit<Message, 'id' | 'sender' | 'timestamp'>> = {
  "Create a 4-day fat-loss split.": {
    text: "Here is an optimized 4-day Upper/Lower hypertrophy split to preserve muscle mass while creating a metabolic deficit.",
    directAnswer: "Preserving muscle through heavy compound lifting is key for fat loss. This 4-day Upper/Lower split maximizes energy expenditure while offering 72 hours of recovery per muscle group.",
    reasoning: "Hypertrophy training (8-12 reps) signals to the body that muscle tissue is essential, preventing muscle catabolism during a caloric deficit. Higher frequency (2x/week) maintains a higher metabolic rate.",
    actionSteps: [
      "Day 1: Upper Body Power (Bench Press, Rows, Overhead Press)",
      "Day 2: Lower Body Power (Squats, RDLs, Leg Press, Calves)",
      "Day 3: Active Rest / LISS Cardio (30-45 mins walk/cycle)",
      "Day 4: Upper Body Hypertrophy (DB Press, Pullups, Lateral Raises)",
      "Day 5: Lower Body Hypertrophy (Leg Extensions, Curls, Lunges)"
    ],
    warnings: [
      "Do not cut your calories by more than 500 kcal below TDEE, or you risk significant strength loss.",
      "Avoid excessive steady-state cardio on lift days to protect recovery reserves."
    ],
    recommendations: [
      { name: "Flat Bench Press", type: "exercise", id: "flat-bb-press" },
      { name: "Flat Dumbbell Press", type: "exercise", id: "flat-db-press" },
      { name: "Pull-Ups", type: "exercise", id: "pullups" },
      { name: "High-Protein Soya Chunk Salad", type: "meal" }
    ]
  },
  "I only have dumbbells.": {
    text: "You can build an excellent physique with just dumbbells. Here is a high-volume dumbbell-only routing.",
    directAnswer: "A full-body dumbbell split utilizing mechanical tension and high volume will stimulate hypertrophy effectively without gym machines.",
    reasoning: "Dumbbells allow for unilateral training, which fixes muscle imbalances, and offers a greater range of motion at the shoulders and hips than barbells.",
    actionSteps: [
      "Focus on progressive overload by slowly increasing reps (e.g. from 8 to 12) before adding weight.",
      "Perform Bulgarian Split Squats and Dumbbell Romanian Deadlifts for lower body mechanical tension.",
      "Utilize Dumbbell Floor Presses or DB Incline Presses to target chest fibers."
    ],
    warnings: [
      "Dumbbells place higher demands on stabilizing muscles; ensure strict form to avoid shoulder strain."
    ],
    recommendations: [
      { name: "Flat Dumbbell Press", type: "exercise", id: "flat-db-press" },
      { name: "Dumbbell Rows", type: "exercise", id: "db-rows" },
      { name: "Lunges", type: "exercise", id: "lunge" }
    ]
  },
  "Give me a beginner calisthenics routine.": {
    text: "Welcome to bodyweight training! Here is a simple, highly effective calisthenics routine.",
    directAnswer: "A full-body calisthenics structure focusing on pushups, pullups (or assisted variations), squats, and planks is the ideal foundation.",
    reasoning: "Calisthenics builds relative body strength, improves joint stability, and enhances core connectivity through closed-kinetic chain movements.",
    actionSteps: [
      "Perform Push-Ups: 3 sets x 8-12 reps (modify to incline pushups if needed).",
      "Perform Pull-Ups or Chin-Ups: 3 sets x 5-8 reps (use resistance bands or negatives if beginner).",
      "Perform Bodyweight Squats: 3 sets x 15-20 reps.",
      "Hold Planks: 3 sets x 30-45 seconds."
    ],
    warnings: [
      "Rotator cuffs and elbows take a beating in calisthenics. Ensure a thorough warm-up before pulling exercises."
    ],
    recommendations: [
      { name: "Push-Ups", type: "exercise", id: "push-ups" },
      { name: "Pull-Ups", type: "exercise", id: "pullups" },
      { name: "Plank", type: "exercise", id: "plank" }
    ]
  },
  "Suggest chest exercises without machines.": {
    text: "Here are the top chest builders using free weights and bodyweight.",
    directAnswer: "The flat bench press, dumbbell floor press, parallel dips, and pushups are superior chest builders that do not require specialized gym machines.",
    reasoning: "Free weight and bodyweight movements allow your joints to travel through natural paths, recruiting stabilizing muscles that machines isolate out.",
    actionSteps: [
      "Barbell Bench Press: Keep shoulder blades retracted and elbows tucked at 45 degrees.",
      "Chest Dips: Lean slightly forward to emphasize chest fibers rather than triceps.",
      "Deficit Pushups: Place hands on blocks/dumbbells to increase the stretch at the bottom."
    ],
    warnings: [
      "Do not flare elbows to 90 degrees on bench or dips, as it heavily loads the rotator cuffs."
    ],
    recommendations: [
      { name: "Flat Bench Press", type: "exercise", id: "flat-bb-press" },
      { name: "Chest Dips", type: "exercise", id: "chest-dips" },
      { name: "Push-Ups", type: "exercise", id: "push-ups" }
    ]
  },
  "Build a Push Pull Legs routine.": {
    text: "Push-Pull-Legs (PPL) is one of the most effective training routines. Here is a high-level breakdown.",
    directAnswer: "A 3-day or 6-day PPL routine structures workouts by movement patterns: pushing (chest/shoulders/triceps), pulling (back/biceps), and legs/abs.",
    reasoning: "PPL organizes training so that muscles worked in one session (e.g. pushing muscles) get complete rest during the next sessions (pulling and leg days).",
    actionSteps: [
      "Push Day: Flat Bench Press, Overhead Press, Incline DB Press, Tricep Pushdowns.",
      "Pull Day: Deadlifts, Dumbbell Rows, Lat Pulldowns, Bicep Curls.",
      "Leg Day: Squats, Romanian Deadlifts, Leg Press, Calf Raises."
    ],
    warnings: [
      "If running PPL 6 days a week, keep volume moderate (4-5 exercises per workout) to avoid central nervous system fatigue."
    ],
    recommendations: [
      { name: "Flat Bench Press", type: "exercise", id: "flat-bb-press" },
      { name: "Dumbbell Rows", type: "exercise", id: "db-rows" },
      { name: "Barbell Squats", type: "exercise", id: "barbell-squats" },
      { name: "Deadlift", type: "exercise", id: "deadlift" }
    ]
  },
  "Give me a 2,300-calorie Indian diet.": {
    text: "Here is a balanced 2,300-calorie Indian meal plan with a focus on high protein.",
    directAnswer: "This plan integrates complex carbs (oats, roti) and high-quality protein (paneer, egg whites, soya) to hit 2,300 kcal with ~135g of protein.",
    reasoning: "Indian diets can easily become carb-dominant. Partitioning protein across five meals ensures continuous muscle protein synthesis.",
    actionSteps: [
      "Breakfast: oats oatmeal, banana, scoop of whey protein (450 kcal, 30g protein)",
      "Mid-Snack: 3 boiled egg whites + 1 cup sprouts salad (200 kcal, 18g protein)",
      "Lunch: 2 multigrain rotis, paneer bhurji (150g paneer), dal (650 kcal, 38g protein)",
      "Evening: Masala buttermilk, roasted makhana & almonds (220 kcal, 8g protein)",
      "Dinner: Steamed brown rice (1.5 cups), chicken breast curry or tofu stir-fry (150g), salad (780 kcal, 41g protein)"
    ],
    warnings: [
      "Watch cooking oil usage (limit to 2 tbsp daily). Indian curries often carry hidden fats that increase calories quickly."
    ],
    recommendations: [
      { name: "Paneer Curry", type: "meal" },
      { name: "Whey Protein Shake & Almonds", type: "meal" },
      { name: "Chicken Breast Curry & Basmati Rice", type: "meal" }
    ]
  },
  "High-protein vegetarian meals.": {
    text: "Vegetarians can easily hit their protein targets with these high-yield food selections.",
    directAnswer: "Top Indian vegetarian protein sources include Paneer, Soya Chunks, Greek Yogurt, Tempeh, Tofu, lentils, and Whey protein.",
    reasoning: "Vegetarian plant-proteins are often incomplete (lacking certain amino acids). Combining grains and legumes (like rice and dal) creates complete protein profiles.",
    actionSteps: [
      "Soya chunks carry 52g of protein per 100g. Boil and add to salads or rice curries.",
      "Low-fat paneer gives 18-20g protein per 100g. Excellent for quick scrambles (bhurji).",
      "Supplement with one scoop of high-quality Whey protein to easily add 25g of clean protein."
    ],
    warnings: [
      "Soya chunks contain phytoestrogens, which are completely safe in moderate amounts, but limit intake to under 75g daily."
    ],
    recommendations: [
      { name: "Paneer Bhurji & 1 Missi Roti", type: "meal" },
      { name: "Soya Chunks Curry & Quinoa", type: "meal" },
      { name: "Dal Tadka, Paneer Bhurji & 2 Rotis", type: "meal" }
    ]
  },
  "Fat-loss meal plans.": {
    text: "Here is a meal planning strategy designed for sustainable fat loss.",
    directAnswer: "A fat-loss plan must operate in a caloric deficit. Focus on high-volume, low-density foods (fiber-rich salads, clear soups, sprouts).",
    reasoning: "Fiber and protein trigger satiety hormones (leptin, peptide YY) which help control hunger cravings during a deficit.",
    actionSteps: [
      "Keep calories at a 300-500 kcal deficit relative to your TDEE.",
      "Drink 1 glass of masala buttermilk or water before meals to promote pre-satiety.",
      "Cut down on visible sugars, sweet beverages, and heavy cream curries."
    ],
    warnings: [
      "Do not skip meals completely as it usually leads to overeating later in the day."
    ],
    recommendations: [
      { name: "Sprouts & Pomegranate Salad", type: "meal" },
      { name: "Spinach & Egg White Scramble", type: "meal" },
      { name: "High-Protein Soya Chunk Salad", type: "meal" }
    ]
  },
  "Muscle gain diets.": {
    text: "Here is a dietary setup to maximize muscle building (hypertrophy).",
    directAnswer: "A muscle gain plan requires a mild caloric surplus (TDEE + 300-500 kcal) and high protein intake (~1.6 to 2.2g per kg of body weight).",
    reasoning: "The body needs extra energy (calories) to build new muscle tissue. A clean surplus ensures muscle synthesis without excessive fat gains.",
    actionSteps: [
      "Aim for a steady weight gain rate of 1 to 1.5 kg per month.",
      "Base meals around protein (chicken, paneer, fish, eggs) and complex carbohydrates (rice, oats, sweet potatoes) for gym energy.",
      "Eat a protein-rich snack before bed (like casein/milk or paneer) to prevent overnight catabolism."
    ],
    warnings: [
      "Avoid 'dirty bulking' (junk food calories) as it mostly gains body fat and causes sluggish workouts."
    ],
    recommendations: [
      { name: "Paneer Parathas & Greek Yogurt", type: "meal" },
      { name: "Chicken Breast Curry & Basmati Rice", type: "meal" },
      { name: "Egg Omelette & Banana Oatmeal", type: "meal" }
    ]
  },
  "Healthy snack suggestions.": {
    text: "Snacking can make or break a diet. Here are nutrient-dense options.",
    directAnswer: "Healthy snacks include roasted Foxnuts (Makhana), boiled egg whites, roasted chickpeas (Chana), mixed nuts, Greek yogurt, or buttermilk.",
    reasoning: "Snacks should curb hunger without overloading calories. High-protein, high-fiber snacks digest slowly and keep insulin levels stable.",
    actionSteps: [
      "Roasted Makhana: Low in calories, satisfying crunch, source of antioxidants.",
      "3 Boiled Egg Whites: Just 50 kcal and 12g of pure protein.",
      "Sprouts Salad: Rich in enzymes, fiber, and B-vitamins."
    ],
    warnings: [
      "Watch nut portions (almonds/walnuts). They are healthy but highly caloric; limit to 1 handful."
    ],
    recommendations: [
      { name: "Roasted Spicy Chickpeas (Chana)", type: "meal" },
      { name: "Roasted Foxnuts (Makhana)", type: "meal" },
      { name: "Masala Buttermilk & Flax Seeds", type: "meal" }
    ]
  },
  "My shoulders hurt during bench press.": {
    text: "Shoulder discomfort is common but completely fixable with form tweaks.",
    directAnswer: "Bench press shoulder pain usually stems from flaring elbows to 90 degrees, failing to retract shoulder blades, or poor rotator cuff stability.",
    reasoning: "Retracting the scapula creates a stable arch, protecting the anterior deltoids and allowing the pectoral fibers to take the load.",
    actionSteps: [
      "Retract and depress your scapula (imagine tucking your shoulder blades into your back pockets).",
      "Tuck elbows at a 45-degree angle relative to your torso as you lower the bar.",
      "Perform warm-up rotator cuff rotations (y-t-w raises) before benching."
    ],
    warnings: [
      "If pain is sharp, stop bench press immediately. Substitute with Dumbbell Floor Press or pushups."
    ],
    recommendations: [
      { name: "Flat Dumbbell Press", type: "exercise", id: "flat-db-press" },
      { name: "Push-Ups", type: "exercise", id: "push-ups" }
    ]
  },
  "How many rest days do I need?": {
    text: "Rest is when growth happens. Let's optimize your recovery schedule.",
    directAnswer: "An active lifter needs 1 to 2 rest days per week. Calisthenics or beginner lifters might benefit from 2 to 3 rest days.",
    reasoning: "Weightlifting creates micro-tears in muscle fibers. Sleep and rest days allow muscle protein synthesis to rebuild them stronger.",
    actionSteps: [
      "Never train the same muscle group on consecutive days (allow 48 hours recovery).",
      "Utilize active rest days: take a 45-minute light walk or perform dynamic flexibility stretches.",
      "Monitor resting heart rate: a sudden elevation can indicate systemic overtraining."
    ],
    warnings: [
      "Overtraining decreases immune response and stops hypertrophy progress. More is not always better."
    ],
    recommendations: [
      { name: "Plank", type: "exercise", id: "plank" }
    ]
  },
  "I have DOMS.": {
    text: "Delayed Onset Muscle Soreness (DOMS) is normal. Here is how to speed up relief.",
    directAnswer: "Relieve DOMS through light active recovery (walking), hot/cold showers, foam rolling, proper hydration, and meeting your protein targets.",
    reasoning: "DOMS is caused by microscopic muscle tearing and localized inflammatory responses, not lactic acid buildup.",
    actionSteps: [
      "Do not remain completely sedentary; light walking increases blood flow and carries nutrients to sore tissues.",
      "Stay hydrated: drink at least 3-4 liters of water daily.",
      "Get 8 hours of deep sleep to trigger growth hormone release."
    ],
    warnings: [
      "Do not stretch sore muscles aggressively as it can worsen micro-tears."
    ],
    recommendations: [
      { name: "Plank", type: "exercise", id: "plank" }
    ]
  },
  "How much sleep should I get?": {
    text: "Sleep is the ultimate anabolic steroid. Let's discuss rest requirements.",
    directAnswer: "Aim for 7 to 9 hours of quality sleep per night. Hard-training athletes may require closer to 9 or 10 hours.",
    reasoning: "Deep sleep (Stage 3 & 4) is when the pituitary gland releases the majority of Human Growth Hormone (HGH) to repair tissues.",
    actionSteps: [
      "Maintain a consistent sleep-wake schedule, even on weekends.",
      "Avoid caffeine within 6 hours of bedtime.",
      "Turn off screens/blue light 45 minutes before attempting sleep."
    ],
    warnings: [
      "Sleeping under 6 hours decreases testosterone levels and increases cortisol, which breaks down muscle tissue."
    ],
    recommendations: []
  },
  "Why has my weight stalled?": {
    text: "Weight plateaus are standard. Let's analyze the potential causes.",
    directAnswer: "Weight stalls are caused by metabolic adaptation, inaccurate food logging (undercounting calories), or temporary water retention.",
    reasoning: "As you lose weight, your body burns fewer calories because there is less tissue to support. This decreases your baseline TDEE.",
    actionSteps: [
      "Re-calculate your BMR and TDEE based on your new lower weight.",
      "Weigh all raw food ingredients on a digital scale to identify hidden calorie leaks.",
      "Ensure you are getting 7-8 hours of sleep, as high stress increases cortisol and holds water."
    ],
    warnings: [
      "Do not drop your calories extremely low (under 1,200 for women, 1,500 for men) to break a plateau."
    ],
    recommendations: []
  },
  "Should I increase calories?": {
    text: "Let's check if a caloric bump is appropriate for your fitness goal.",
    directAnswer: "Increase calories by 150-250 kcal if your weight has stalled during a bulk, or if you feel consistently weak during heavy gym lifts.",
    reasoning: "If you are trying to gain muscle but your weight is unchanged for 3+ weeks, your body has adapted and matched your current intake as maintenance.",
    actionSteps: [
      "Add calories via healthy carbs (oats, rice, sweet potato) or fats (almonds, peanut butter).",
      "Ensure you are lifting with progressive overload; otherwise, extra calories will just store as body fat.",
      "If cutting, do not increase calories unless you are planning a strategic 1-week diet break."
    ],
    warnings: [
      "Increasing calories too fast leads to rapid fat gain. Keep adjustments to 15% of total intake."
    ],
    recommendations: []
  },
  "Why is my bench press stuck?": {
    text: "Bench press plateaus are frustrating but common. Let's break it down.",
    directAnswer: "A stuck bench press is usually due to weak triceps/shoulders, stagnant training volume, or failing to overload progressively.",
    reasoning: "Muscles adapt to stress quickly. If you bench the same weight and reps every week, there is no adaptive signal for strength gains.",
    actionSteps: [
      "Incorporate accessory movements: Close Grip Bench Press (for triceps) and Overhead Press (for front delts).",
      "Try a volume deload: drop weight by 10% for a week, then return to progress.",
      "Bench twice a week (one heavy day, one high-volume speed day)."
    ],
    warnings: [
      "Do not attempt dangerous heavy sets without a spotter or safety bars in place."
    ],
    recommendations: [
      { name: "Flat Bench Press", type: "exercise", id: "flat-bb-press" },
      { name: "Overhead Press", type: "exercise", id: "overhead-press" }
    ]
  }
};

export const AICoach: React.FC<AICoachProps> = ({ onSaveRoutine, savedExercises: _savedExercises }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'generator'>('chat');
  
  // ====================================================
  // CHAT STATE & FUNCTIONS
  // ====================================================
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try {
      const saved = localStorage.getItem('fitai_chat_conversations');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    
    // Default pre-populated chat conversations for premium feel
    const initialChats: ChatConversation[] = [
      {
        id: 'chat-1',
        title: 'Fat Loss Split Advice',
        timestamp: Date.now() - 3600000 * 2,
        messages: [
          {
            id: 'msg-1',
            sender: 'user',
            text: 'Create a 4-day fat-loss split.',
            timestamp: Date.now() - 3600000 * 2
          },
          {
            id: 'msg-2',
            sender: 'ai',
            timestamp: Date.now() - 3590000 * 2,
            ...PRESET_ANSWERS['Create a 4-day fat-loss split.']
          }
        ]
      },
      {
        id: 'chat-2',
        title: 'High Protein Vegetarian Meal Planning',
        timestamp: Date.now() - 3600000 * 24,
        messages: [
          {
            id: 'msg-3',
            sender: 'user',
            text: 'High-protein vegetarian meals.',
            timestamp: Date.now() - 3600000 * 24
          },
          {
            id: 'msg-4',
            sender: 'ai',
            timestamp: Date.now() - 3590000 * 24,
            ...PRESET_ANSWERS['High-protein vegetarian meals.']
          }
        ]
      }
    ];
    localStorage.setItem('fitai_chat_conversations', JSON.stringify(initialChats));
    return initialChats;
  });

  const [activeChatId, setActiveChatId] = useState<string>(conversations[0]?.id || '');
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    localStorage.setItem('fitai_chat_conversations', JSON.stringify(conversations));
  }, [conversations]);

  const activeChat = conversations.find(c => c.id === activeChatId) || conversations[0];

  const handleStartNewChat = () => {
    const newChat: ChatConversation = {
      id: `chat-${Date.now()}`,
      title: 'New Coaching Session',
      timestamp: Date.now(),
      messages: [
        {
          id: `welcome-${Date.now()}`,
          sender: 'ai',
          text: "Hello! I am your personal AI Fitness & Nutrition Coach. I can help design custom training routines, coordinate macro targets, troubleshoot shoulder pain, or explain weight plateaus. Choose a question below or write your own!",
          timestamp: Date.now()
        }
      ]
    };
    setConversations(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (activeChatId === id && filtered.length > 0) {
        setActiveChatId(filtered[0].id);
      }
      return filtered;
    });
  };

  const triggerAIResponse = (userText: string, chatId: string) => {
    setIsTyping(true);
    
    // Simulate AI thinking and typing delay
    setTimeout(() => {
      // Look up preset answers, or build a fuzzy match response
      let match = PRESET_ANSWERS[userText];
      
      if (!match) {
        const textLower = userText.toLowerCase();
        // Fuzzy search keywords
        if (textLower.includes('chest') || textLower.includes('pushup')) {
          match = PRESET_ANSWERS['Suggest chest exercises without machines.'];
        } else if (textLower.includes('veg') || textLower.includes('protein')) {
          match = PRESET_ANSWERS['High-protein vegetarian meals.'];
        } else if (textLower.includes('calorie') || textLower.includes('diet') || textLower.includes('indian')) {
          match = PRESET_ANSWERS['Give me a 2,300-calorie Indian diet.'];
        } else if (textLower.includes('bench') || textLower.includes('shoulder') || textLower.includes('hurt')) {
          match = PRESET_ANSWERS['My shoulders hurt during bench press.'];
        } else if (textLower.includes('sleep') || textLower.includes('rest')) {
          match = PRESET_ANSWERS['How much sleep should I get.'] || PRESET_ANSWERS['How much sleep should I get?'];
        } else if (textLower.includes('stall') || textLower.includes('plateau') || textLower.includes('weight')) {
          match = PRESET_ANSWERS['Why has my weight stalled?'];
        } else if (textLower.includes('dumbbell') || textLower.includes('db')) {
          match = PRESET_ANSWERS['I only have dumbbells.'];
        } else if (textLower.includes('calisthenic') || textLower.includes('bodyweight')) {
          match = PRESET_ANSWERS['Give me a beginner calisthenics routine.'];
        } else {
          // Fallback detailed template
          match = {
            text: "That is a great coaching question. Let's analyze it from a biomechanical and metabolic standpoint.",
            directAnswer: `To address "${userText}", we must prioritize progressive overload in your exercises and ensure your nutrition matches your active metabolic requirements.`,
            reasoning: "Hypertrophy and biological adaptations are directly triggered by progressive tension and mechanical loads. Nutrition fuels this recovery loop.",
            actionSteps: [
              "Track your compound sets carefully, ensuring you stop 1-2 reps before failure (RPE 8-9).",
              "Maintain a steady protein distribution of 1.6 to 2.2g per kg of bodyweight.",
              "Track metrics and weight averages on a weekly basis to isolate trendlines."
            ],
            warnings: [
              "Avoid rapid spikes in volume or extreme caloric deficits, which can damage joint and hormone health."
            ],
            recommendations: [
              { name: "Flat Bench Press", type: "exercise", id: "flat-bb-press" },
              { name: "Pull-Ups", type: "exercise", id: "pullups" }
            ]
          };
        }
      }

      const newAIMessage: Message = {
        id: `ai-msg-${Date.now()}`,
        sender: 'ai',
        timestamp: Date.now(),
        ...match
      };

      setConversations(prev => prev.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            timestamp: Date.now(),
            messages: [...c.messages, newAIMessage]
          };
        }
        return c;
      }));
      setIsTyping(false);
    }, 1500);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text) return;

    if (!textToSend) setChatInput('');

    // If chat list is empty, start a new one
    let targetChatId = activeChatId;
    if (conversations.length === 0 || !activeChat) {
      const generatedId = `chat-${Date.now()}`;
      const newChat: ChatConversation = {
        id: generatedId,
        title: text.length > 28 ? `${text.substring(0, 25)}...` : text,
        timestamp: Date.now(),
        messages: []
      };
      setConversations([newChat]);
      setActiveChatId(generatedId);
      targetChatId = generatedId;
    } else {
      // Update chat title if it was default
      if (activeChat.title === 'New Coaching Session') {
        setConversations(prev => prev.map(c => {
          if (c.id === targetChatId) {
            return { ...c, title: text.length > 28 ? `${text.substring(0, 25)}...` : text };
          }
          return c;
        }));
      }
    }

    const newUserMessage: Message = {
      id: `user-msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now()
    };

    setConversations(prev => prev.map(c => {
      if (c.id === targetChatId) {
        return {
          ...c,
          timestamp: Date.now(),
          messages: [...c.messages, newUserMessage]
        };
      }
      return c;
    }));

    triggerAIResponse(text, targetChatId);
  };

  // ====================================================
  // WORKOUT SPLIT GENERATOR STATE & FUNCTIONS
  // ====================================================
  const [genGoal, setGenGoal] = useState<'Fat Loss' | 'Muscle Gain' | 'Strength' | 'General Fitness'>('Muscle Gain');
  const [genLevel, setGenLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [genDays, setGenDays] = useState<number>(4);
  const [genEquipment, setGenEquipment] = useState<'Full Gym' | 'Dumbbells Only' | 'Home Equipment' | 'Calisthenics'>('Full Gym');

  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generated Split State
  interface GeneratedExercise {
    name: string;
    sets: number;
    reps: number;
    restSecs: number;
    dbId?: string; // ID mapping to database
  }
  interface GeneratedDay {
    dayName: string;
    warmup: string[];
    exercises: GeneratedExercise[];
    cooldown: string[];
  }
  interface GeneratedSplit {
    id: string;
    title: string;
    desc: string;
    days: GeneratedDay[];
  }

  const [activeSplit, setActiveSplit] = useState<GeneratedSplit | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState<number>(0);
  const [saveSplitSuccess, setSaveSplitSuccess] = useState(false);

  const handleGenerateSplit = () => {
    setIsGenerating(true);
    setActiveSplit(null);

    setTimeout(() => {
      // Simple custom builder engine
      let splitTitle = `${genLevel} ${genDays}-Day ${genGoal} Program`;
      let splitDesc = `AI generated ${genGoal} split using ${genEquipment} tailored for ${genLevel} experience.`;
      let daysList: GeneratedDay[] = [];

      // Determine exercise sets & reps based on goal
      let defaultSets = 3;
      let defaultReps = 10;
      let defaultRest = 90;
      if (genGoal === 'Strength') {
        defaultSets = 4;
        defaultReps = 5;
        defaultRest = 180;
      } else if (genGoal === 'Fat Loss') {
        defaultSets = 3;
        defaultReps = 12;
        defaultRest = 60;
      }

      if (genEquipment === 'Calisthenics') {
        // Bodyweight Program
        const caliPool = [
          { name: 'Push-Ups', id: 'push-ups' },
          { name: 'Pull-Ups', id: 'pullups' },
          { name: 'Bar Muscle-Ups', id: 'muscle-ups' },
          { name: 'Chest Dips', id: 'chest-dips' },
          { name: 'Plank', id: 'plank' },
          { name: 'Hanging Leg Raises', id: 'hanging-leg-raises' }
        ];
        
        for (let i = 1; i <= genDays; i++) {
          daysList.push({
            dayName: `Day ${i}: Bodyweight Circuit`,
            warmup: ['Arm circles (20s)', 'Leg swings (20s)', 'Jumping Jacks (30s)'],
            exercises: [
              { name: caliPool[(i - 1) % caliPool.length].name, sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: caliPool[(i - 1) % caliPool.length].id },
              { name: caliPool[i % caliPool.length].name, sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: caliPool[i % caliPool.length].id },
              { name: caliPool[(i + 1) % caliPool.length].name, sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: caliPool[(i + 1) % caliPool.length].id },
              { name: 'Bodyweight Squats', sets: defaultSets, reps: 20, restSecs: 60, dbId: 'barbell-squats' } // Map to closest
            ],
            cooldown: ['Forward Fold stretch (30s)', 'Child\'s pose (45s)']
          });
        }
      } else if (genEquipment === 'Dumbbells Only') {
        // Dumbbell Program
        const dbPool = [
          { name: 'Flat Dumbbell Press', id: 'flat-db-press' },
          { name: 'Dumbbell Rows', id: 'db-rows' },
          { name: 'Lunges', id: 'lunge' },
          { name: 'Plank', id: 'plank' }
        ];

        for (let i = 1; i <= genDays; i++) {
          daysList.push({
            dayName: `Day ${i}: Full Body DB`,
            warmup: ['Light DB rotations (10 reps)', 'Cat-cow stretches (30s)'],
            exercises: dbPool.map(item => ({
              name: item.name,
              sets: defaultSets,
              reps: defaultReps,
              restSecs: defaultRest,
              dbId: item.id
            })),
            cooldown: ['Shoulder cross-body stretch (30s)', 'Quad stretches (30s)']
          });
        }
      } else {
        // Full Gym/Home Equipment: Bro Splits, PPL, or Upper Lower
        if (genDays === 3) {
          // Push Pull Legs
          daysList = [
            {
              dayName: 'Day 1: Push (Chest/Shoulders/Triceps)',
              warmup: ['Shoulder rolls (20s)', 'Rotator cuff band rotations (15 reps)', 'Light pushups (10 reps)'],
              exercises: [
                { name: 'Flat Bench Press', sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: 'flat-bb-press' },
                { name: 'Overhead Press', sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: 'overhead-press' },
                { name: 'Incline Bench Press', sets: 3, reps: 10, restSecs: 90, dbId: 'inc-bb-press' }
              ],
              cooldown: ['Pec doorway stretch (45s)', 'Tricep overhead stretch (30s)']
            },
            {
              dayName: 'Day 2: Pull (Back/Biceps)',
              warmup: ['Scapular shrugs (15 reps)', 'Light lat pulldowns (12 reps)'],
              exercises: [
                { name: 'Deadlift', sets: 3, reps: 5, restSecs: 150, dbId: 'deadlift' },
                { name: 'Dumbbell Rows', sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: 'db-rows' },
                { name: 'Pull-Ups', sets: 3, reps: 8, restSecs: 90, dbId: 'pullups' }
              ],
              cooldown: ['Lat stretch on doorframe (45s)', 'Upper back stretch (30s)']
            },
            {
              dayName: 'Day 3: Legs & Abs',
              warmup: ['Bodyweight Squats (15 reps)', 'Leg swings (15 reps)', 'Hip opener stretches (30s)'],
              exercises: [
                { name: 'Barbell Squats', sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: 'barbell-squats' },
                { name: 'Lunges', sets: 3, reps: 10, restSecs: 90, dbId: 'lunge' },
                { name: 'Plank', sets: 3, reps: 60, restSecs: 45, dbId: 'plank' }
              ],
              cooldown: ['Glute pigeon pose (45s)', 'Hamstring forward bend (45s)']
            }
          ];
        } else {
          // 4-Day Upper / Lower or Bro Split
          daysList = [
            {
              dayName: 'Day 1: Upper Body Focus',
              warmup: ['Arm circles (20s)', 'Band pull-aparts (15 reps)'],
              exercises: [
                { name: 'Flat Bench Press', sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: 'flat-bb-press' },
                { name: 'Dumbbell Rows', sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: 'db-rows' },
                { name: 'Overhead Press', sets: 3, reps: 8, restSecs: 90, dbId: 'overhead-press' },
                { name: 'Pull-Ups', sets: 3, reps: 8, restSecs: 90, dbId: 'pullups' }
              ],
              cooldown: ['Shoulder cross-body stretch (30s)', 'Chest stretch (30s)']
            },
            {
              dayName: 'Day 2: Lower Body Focus',
              warmup: ['Squats (15 reps)', 'Dynamic hamstring stretches (20s)'],
              exercises: [
                { name: 'Barbell Squats', sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: 'barbell-squats' },
                { name: 'Lunges', sets: 3, reps: 12, restSecs: 90, dbId: 'lunge' },
                { name: 'Plank', sets: 3, reps: 60, restSecs: 60, dbId: 'plank' }
              ],
              cooldown: ['Hamstring seated stretch (45s)', 'Pigeon pose (30s)']
            },
            {
              dayName: 'Day 3: Upper Body Hypertrophy',
              warmup: ['Rotator cuff band warmups (15 reps)'],
              exercises: [
                { name: 'Flat Dumbbell Press', sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: 'flat-db-press' },
                { name: 'Pull-Ups', sets: 3, reps: 8, restSecs: 90, dbId: 'pullups' },
                { name: 'Dumbbell Rows', sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: 'db-rows' }
              ],
              cooldown: ['Doorway chest stretch (45s)']
            },
            {
              dayName: 'Day 4: Lower Body Volume',
              warmup: ['Glute bridges (15 reps)', 'Bodyweight lunges (10 reps)'],
              exercises: [
                { name: 'Barbell Squats', sets: defaultSets, reps: defaultReps, restSecs: defaultRest, dbId: 'barbell-squats' },
                { name: 'Lunges', sets: 3, reps: 12, restSecs: 90, dbId: 'lunge' },
                { name: 'Plank', sets: 3, reps: 60, restSecs: 45, dbId: 'plank' }
              ],
              cooldown: ['Seated quad stretch (30s)']
            }
          ];
        }
      }

      // Truncate days to requested amount
      daysList = daysList.slice(0, genDays);

      setActiveSplit({
        id: `split-${Date.now()}`,
        title: splitTitle,
        desc: splitDesc,
        days: daysList
      });
      setActiveDayIdx(0);
      setIsGenerating(false);
    }, 1500);
  };

  const handleUpdateGenExercise = (dayIdx: number, exIdx: number, fields: Partial<GeneratedExercise>) => {
    if (!activeSplit) return;
    const updatedDays = [...activeSplit.days];
    updatedDays[dayIdx].exercises[exIdx] = {
      ...updatedDays[dayIdx].exercises[exIdx],
      ...fields
    };
    setActiveSplit({
      ...activeSplit,
      days: updatedDays
    });
  };

  const handleAddGenRoutineToDashboard = (dayIdx: number) => {
    if (!activeSplit) return;
    const day = activeSplit.days[dayIdx];
    
    // Map generated exercises to database exercises
    const exerciseIds = day.exercises
      .map(ex => {
        if (ex.dbId) return ex.dbId;
        // Fallback fuzzy matcher
        const found = EXERCISE_DATABASE.find(e => e.name.toLowerCase().includes(ex.name.toLowerCase()));
        return found ? found.id : 'push-ups';
      });

    const newRoutine: WorkoutRoutine = {
      id: `ai-routine-${Date.now()}`,
      name: `AI: ${activeSplit.title} (${day.dayName.split(':')[0]})`,
      desc: `AI-generated template from your Coach. Target: ${genGoal}`,
      exercises: exerciseIds
    };

    onSaveRoutine(newRoutine);
    setSaveSplitSuccess(true);
    setTimeout(() => setSaveSplitSuccess(false), 2000);
  };

  return (
    <section className="relative py-24 overflow-hidden min-h-screen text-zinc-100 bg-[#03000a] text-left">
      <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] bg-brand-violet/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] bg-brand-cyan/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 bg-brand-violet/10 border border-brand-violet/20 px-3.5 py-1 rounded-full text-brand-violet font-semibold text-xs tracking-wider uppercase">
            AI Assistant Center
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-white">
            AI Coach & Routines
          </h2>
          
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            Get personalized training advice, ask custom nutrition questions, or let the split builder construct custom templates.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex justify-center border-b border-white/5 mb-8 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'chat' ? 'border-brand-violet text-white font-black' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Ask AI Coach
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'generator' ? 'border-brand-violet text-white font-black' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            AI Split Generator
          </button>
        </div>

        {/* TAB 1: COACH CHAT */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
            
            {/* Sidebar (4 Columns) */}
            <div className="lg:col-span-4 flex flex-col space-y-4 h-[600px]">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-brand-violet" /> Chat Sessions
                </h3>
                <button
                  onClick={handleStartNewChat}
                  className="px-2.5 py-1.5 rounded-lg bg-brand-violet/20 hover:bg-brand-violet/35 border border-brand-violet/30 text-brand-violet hover:text-white text-[10px] font-bold flex items-center gap-1 transition-all"
                >
                  <Plus className="h-3 w-3" /> New Chat
                </button>
              </div>

              {/* Chat list */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {conversations.length === 0 ? (
                  <div className="text-center py-12 text-zinc-600 text-xs italic">
                    No active coaching history.
                  </div>
                ) : (
                  conversations.map((c) => {
                    const isActive = c.id === activeChatId;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setActiveChatId(c.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center group text-left ${
                          isActive
                            ? 'bg-brand-violet/10 border-brand-violet/30 text-white'
                            : 'bg-dark-950/40 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <span className="text-xs font-bold block truncate">{c.title}</span>
                          <span className="text-[9px] text-zinc-500 font-semibold block mt-0.5">
                            {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteChat(c.id, e)}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1 text-zinc-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Timeline (8 Columns) */}
            <div className="lg:col-span-8 flex flex-col border border-white/5 rounded-2xl bg-dark-900/10 backdrop-blur-md overflow-hidden h-[600px] justify-between">
              
              {/* Active Conversation Title */}
              <div className="p-4 bg-dark-950/60 border-b border-white/5 flex items-center justify-between text-left">
                <div className="flex items-center space-x-2">
                  <div className="h-7 w-7 rounded-full bg-brand-violet/20 border border-brand-violet/30 flex items-center justify-center text-brand-violet text-xs font-bold animate-pulse">
                    C
                  </div>
                  <div>
                    <span className="text-xs font-black text-white">{activeChat?.title || 'Coach Chat'}</span>
                    <span className="text-[9px] text-brand-cyan font-bold block uppercase tracking-wider mt-0.5">Certified Trainer Assistant Active</span>
                  </div>
                </div>
              </div>

              {/* Message History window */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-left">
                {activeChat?.messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                        isUser 
                          ? 'bg-dark-950 border border-white/10 text-zinc-200' 
                          : 'bg-dark-900/50 border border-brand-violet/20 text-zinc-300'
                      }`}>
                        
                        {/* Header Sender Info */}
                        <div className="flex items-center gap-1.5 border-b border-white/5 pb-1.5 mb-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                          {isUser ? <User className="h-3 w-3" /> : <Sparkles className="h-3 w-3 text-brand-violet" />}
                          <span>{isUser ? 'Client' : 'Coach Response'}</span>
                        </div>

                        {/* Direct text response */}
                        <p className="font-semibold text-white">{msg.text}</p>

                        {/* Structured details (Only on Coach Responses if exist) */}
                        {!isUser && msg.directAnswer && (
                          <div className="space-y-3 pt-2 border-t border-white/5">
                            {/* Direct Answer */}
                            <div className="space-y-0.5">
                              <span className="text-[9px] text-brand-cyan font-black uppercase tracking-wider block">Direct Answer</span>
                              <p className="text-zinc-300 font-medium">{msg.directAnswer}</p>
                            </div>

                            {/* Reasoning */}
                            {msg.reasoning && (
                              <div className="space-y-0.5 bg-dark-950/40 p-2.5 rounded-xl border border-white/5">
                                <span className="text-[9px] text-brand-violet font-black uppercase tracking-wider block">Physiological Reasoning</span>
                                <p className="text-zinc-400 italic font-normal">{msg.reasoning}</p>
                              </div>
                            )}

                            {/* Action Steps */}
                            {msg.actionSteps && msg.actionSteps.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[9px] text-brand-lime font-black uppercase tracking-wider block">Coaching Actions Checklist</span>
                                <ul className="space-y-1 pl-3.5 list-disc text-zinc-300">
                                  {msg.actionSteps.map((step, sidx) => (
                                    <li key={sidx} className="font-semibold">{step}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Warnings */}
                            {msg.warnings && msg.warnings.length > 0 && (
                              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl space-y-1">
                                <span className="text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                  <ShieldAlert className="h-3 w-3" /> Metabolic Safety Advisory
                                </span>
                                <ul className="space-y-0.5 list-disc pl-3.5">
                                  {msg.warnings.map((warn, widx) => (
                                    <li key={widx} className="font-bold text-[10px] leading-relaxed">{warn}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Recommendations links */}
                            {msg.recommendations && msg.recommendations.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-[9px] text-amber-400 font-black uppercase tracking-wider block">Suggested Elements</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {msg.recommendations.map((rec, ridx) => (
                                    <span 
                                      key={ridx}
                                      className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider border ${
                                        rec.type === 'exercise'
                                          ? 'bg-brand-cyan/15 border-brand-cyan/20 text-brand-cyan'
                                          : 'bg-brand-lime/15 border-brand-lime/20 text-brand-lime'
                                      }`}
                                    >
                                      {rec.type === 'exercise' ? '🏋️ ' : '🥗 '} {rec.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <span className="text-[8px] text-zinc-600 block text-right mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Typing skeleton loading bar */}
                {isTyping && (
                  <div className="flex justify-start w-full">
                    <div className="max-w-[70%] rounded-2xl p-4 bg-dark-900/50 border border-brand-violet/20 text-zinc-400 flex items-center gap-3">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-brand-violet rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="h-2 w-2 bg-brand-violet rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="h-2 w-2 bg-brand-violet rounded-full animate-bounce" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-violet">AI Coach is thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Preset queries container */}
              <div className="p-3.5 bg-dark-950/60 border-t border-white/5 space-y-2">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block text-left">Suggested Quick Prompts</span>
                <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto pr-1">
                  {Object.keys(PRESET_ANSWERS).map((query) => (
                    <button
                      key={query}
                      onClick={() => handleSendMessage(query)}
                      disabled={isTyping}
                      className="px-2.5 py-1 bg-white/5 hover:bg-brand-violet/15 border border-white/5 hover:border-brand-violet/30 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white transition-all whitespace-nowrap"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input form */}
              <div className="p-4 bg-dark-950 border-t border-white/5">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Ask about routines, protein targets, shoulder pinch..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 px-4 py-3 bg-dark-900 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet/40"
                    disabled={isTyping}
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isTyping}
                    className="p-3 bg-brand-violet text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: AI WORKOUT SPLIT GENERATOR */}
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
            
            {/* Input parameters card (5 Columns) */}
            <div className="lg:col-span-5 space-y-6">
              <SpotlightCard className="p-6 text-left space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-brand-cyan" /> Split Generator Inputs
                </h3>

                {/* Goal */}
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Training Goal</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Fat Loss', 'Muscle Gain', 'Strength', 'General Fitness'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGenGoal(g as any)}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          genGoal === g
                            ? 'bg-brand-violet/20 border-brand-violet text-white font-black'
                            : 'bg-dark-950 border-white/5 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level */}
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Experience Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setGenLevel(lvl as any)}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          genLevel === lvl
                            ? 'bg-brand-cyan/20 border-brand-cyan text-white font-black'
                            : 'bg-dark-950 border-white/5 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frequency Days per week */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Days per week</label>
                    <span className="font-bold text-white font-mono">{genDays} Training Days</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="7"
                    value={genDays}
                    onChange={(e) => setGenDays(Number(e.target.value))}
                    className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-brand-violet"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-600 font-bold font-mono">
                    <span>2 Days</span>
                    <span>4 Days</span>
                    <span>7 Days</span>
                  </div>
                </div>

                {/* Equipment Available */}
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Equipment Access</label>
                  <select
                    value={genEquipment}
                    onChange={(e) => setGenEquipment(e.target.value as any)}
                    className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet font-semibold"
                  >
                    <option value="Full Gym">Full Gym Equipment (Barbell/Cables/Machines)</option>
                    <option value="Dumbbells Only">Dumbbells Only Focus</option>
                    <option value="Home Equipment">Home Equipment (Bodyweight/Bands)</option>
                    <option value="Calisthenics">Bodyweight Calisthenics Routine</option>
                  </select>
                </div>

                {/* Submit button */}
                <button
                  onClick={handleGenerateSplit}
                  disabled={isGenerating}
                  className="w-full py-4 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-black rounded-xl hover:scale-101 transition-transform disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 shadow-glow-purple"
                >
                  {isGenerating ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Constructing Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Generate AI Workout Split
                    </>
                  )}
                </button>
              </SpotlightCard>
            </div>

            {/* Results Routine Panel (7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              {isGenerating ? (
                /* Generating Skeleton Screen */
                <SpotlightCard className="p-6 space-y-6 text-left animate-pulse">
                  <div className="h-4 w-1/3 bg-white/5 rounded" />
                  <div className="h-8 w-2/3 bg-white/5 rounded" />
                  <div className="h-2 w-full bg-white/5 rounded" />

                  <div className="flex gap-2 border-b border-white/5 pb-2">
                    <div className="h-8 w-16 bg-white/5 rounded" />
                    <div className="h-8 w-16 bg-white/5 rounded" />
                    <div className="h-8 w-16 bg-white/5 rounded" />
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="p-3 bg-white/5 rounded-xl h-12" />
                    <div className="p-3 bg-white/5 rounded-xl h-12" />
                    <div className="p-3 bg-white/5 rounded-xl h-12" />
                  </div>
                </SpotlightCard>
              ) : activeSplit ? (
                <div className="space-y-6">
                  
                  {/* Split Overview Card */}
                  <SpotlightCard className="p-6 text-left space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[9px] text-brand-cyan font-bold uppercase tracking-wider block">AI Generated Routine Split</span>
                        <h3 className="text-xl font-display font-black text-white">{activeSplit.title}</h3>
                        <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{activeSplit.desc}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-brand-violet/10 border border-brand-violet/20 text-brand-violet text-[9px] font-black uppercase tracking-wider">
                        {genGoal}
                      </span>
                    </div>

                    {/* Day Tabs */}
                    <div className="flex flex-wrap gap-1.5 border-t border-b border-white/5 py-3">
                      {activeSplit.days.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveDayIdx(idx)}
                          className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border ${
                            activeDayIdx === idx
                              ? 'bg-brand-violet/20 border-brand-violet text-white font-black'
                              : 'bg-dark-950 border-white/5 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Day {idx + 1}
                        </button>
                      ))}
                    </div>

                    {/* Active Day details */}
                    <div className="space-y-5 pt-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Dumbbell className="h-4.5 w-4.5 text-brand-cyan" /> {activeSplit.days[activeDayIdx].dayName}
                        </h4>
                      </div>

                      {/* Warm-Up block */}
                      {activeSplit.days[activeDayIdx].warmup.length > 0 && (
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                          <span className="text-[9px] text-brand-violet font-black uppercase tracking-wider block">Warm-Up Activation Routine</span>
                          <ul className="text-[10px] text-zinc-400 list-disc pl-4 space-y-0.5 font-medium">
                            {activeSplit.days[activeDayIdx].warmup.map((w, widx) => (
                              <li key={widx}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Exercises List (With Inline Edit options) */}
                      <div className="space-y-3">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Main Hypertrophy / Strength Sets</span>
                        {activeSplit.days[activeDayIdx].exercises.map((ex, exidx) => (
                          <div 
                            key={exidx} 
                            className="p-4 bg-dark-950/60 border border-white/5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-semibold"
                          >
                            <div className="space-y-1 text-left min-w-[150px]">
                              <input 
                                type="text"
                                value={ex.name}
                                onChange={(e) => handleUpdateGenExercise(activeDayIdx, exidx, { name: e.target.value })}
                                className="font-bold text-xs text-white bg-transparent border-b border-transparent focus:border-brand-cyan focus:outline-none w-full"
                              />
                              <span className="text-[9px] text-zinc-500 block uppercase">Equipment: {genEquipment}</span>
                            </div>

                            {/* Sets / Reps / Rest inputs */}
                            <div className="flex items-center gap-3 text-xs font-semibold">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] text-zinc-500 font-bold">Sets:</span>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={ex.sets}
                                  onChange={(e) => handleUpdateGenExercise(activeDayIdx, exidx, { sets: Number(e.target.value) })}
                                  className="w-10 px-1.5 py-1 bg-white/5 border border-white/5 text-center text-white rounded font-mono"
                                />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] text-zinc-500 font-bold">Reps:</span>
                                <input
                                  type="number"
                                  min="1"
                                  max="50"
                                  value={ex.reps}
                                  onChange={(e) => handleUpdateGenExercise(activeDayIdx, exidx, { reps: Number(e.target.value) })}
                                  className="w-10 px-1.5 py-1 bg-white/5 border border-white/5 text-center text-white rounded font-mono"
                                />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] text-zinc-500 font-bold">Rest:</span>
                                <input
                                  type="number"
                                  min="15"
                                  max="300"
                                  step="15"
                                  value={ex.restSecs}
                                  onChange={(e) => handleUpdateGenExercise(activeDayIdx, exidx, { restSecs: Number(e.target.value) })}
                                  className="w-14 px-1.5 py-1 bg-white/5 border border-white/5 text-center text-white rounded font-mono"
                                />
                                <span className="text-[10px] text-zinc-500 font-bold">s</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Cool-Down block */}
                      {activeSplit.days[activeDayIdx].cooldown.length > 0 && (
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                          <span className="text-[9px] text-brand-cyan font-black uppercase tracking-wider block">Cool-Down Recovery Routine</span>
                          <ul className="text-[10px] text-zinc-400 list-disc pl-4 space-y-0.5 font-medium">
                            {activeSplit.days[activeDayIdx].cooldown.map((c, cidx) => (
                              <li key={cidx}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Actions Footer */}
                      <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => handleAddGenRoutineToDashboard(activeDayIdx)}
                          className="flex-1 py-3.5 bg-gradient-to-r from-brand-lime to-brand-cyan text-dark-950 text-xs font-black rounded-xl hover:scale-[1.01] transition-transform flex items-center justify-center gap-1.5 shadow-glow-lime"
                        >
                          {saveSplitSuccess ? (
                            <>
                              <Check className="h-4.5 w-4.5" /> Added Successfully!
                            </>
                          ) : (
                            <>
                              <ArrowRight className="h-4.5 w-4.5" /> Add Day {activeDayIdx + 1} Routine to Dashboard
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            // Clone active split
                            const clone = JSON.parse(JSON.stringify(activeSplit));
                            clone.id = `split-clone-${Date.now()}`;
                            clone.title = `${clone.title} (Copy)`;
                            setActiveSplit(clone);
                          }}
                          className="px-5 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <Copy className="h-4 w-4 text-zinc-500" /> Duplicate
                        </button>
                      </div>

                    </div>
                  </SpotlightCard>

                </div>
              ) : (
                /* Empty state */
                <div className="py-24 text-center border border-dashed border-white/5 rounded-3xl bg-dark-900/10 space-y-3 flex flex-col justify-center items-center h-full">
                  <Sparkles className="h-10 w-10 text-zinc-700 animate-pulse" />
                  <p className="text-zinc-400 text-xs font-semibold">Waiting for routine split parameters...</p>
                  <span className="text-[10px] text-zinc-500 max-w-sm">
                    Select your training goal, experience, days, and equipment access to construct an AI-powered fitness program.
                  </span>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
