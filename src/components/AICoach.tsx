import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, Send, Plus, Trash2, 
  Copy, Check, Sparkles, ShieldAlert, Clock, ArrowRight, User, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpotlightCard } from './SpotlightCard';
import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import type { WorkoutRoutine } from './WorkoutBuilder';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  
  // Phase 1 structured sections
  directAnswer?: string;
  actionPlanItems?: string[];
  recommendationItems?: string[];
  followUpSuggestions?: string[];
  
  // Action state flags
  showDietPrompt?: boolean;
  dietPromptAnswered?: boolean;
  selectedPreference?: string;
  
  hasWorkoutContent?: boolean;
  hasDietContent?: boolean;
  
  generatedRoutine?: WorkoutRoutine;
  suggestedDiet?: { calories: number; protein: number; goal: string };
  originalQuery?: string;
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
  userWeight: number;
  savedDietGoal: string;
  workoutHistory: any[];
  savedDietCalories: number;
  savedDietProtein: number;
  savedDietType: string;
  userName: string;
  onSaveDiet: (settings: any) => void;
  onNavigate: (view: 'home' | 'nutrition' | 'training' | 'coach' | 'body-fat' | 'store' | 'profile', subTab?: string) => void;
  onStartWorkout: (routine: WorkoutRoutine) => void;
  onChangeDietType: (type: string) => void;
}

// -------------------------------------------------------------
// DYNAMIC RESPONSE BUILDERS & STAT ANALYZERS
// -------------------------------------------------------------

const getStrengthProgress = (history: any[]) => {
  let benchPR = 0;
  let squatPR = 0;
  let deadliftPR = 0;

  if (history && Array.isArray(history)) {
    history.forEach(workout => {
      if (workout.exercises && Array.isArray(workout.exercises)) {
        workout.exercises.forEach((ex: any) => {
          const nameLower = (ex.name || '').toLowerCase();
          const idLower = (ex.id || '').toLowerCase();
          
          const isBench = nameLower.includes('bench') || idLower.includes('bench') || idLower.includes('press');
          const isSquat = nameLower.includes('squat') || idLower.includes('squat');
          const isDeadlift = nameLower.includes('deadlift') || idLower.includes('deadlift');

          if (ex.sets && Array.isArray(ex.sets)) {
            ex.sets.forEach((set: any) => {
              const w = Number(set.weight) || 0;
              if (isBench && w > benchPR) benchPR = w;
              if (isSquat && w > squatPR) squatPR = w;
              if (isDeadlift && w > deadliftPR) deadliftPR = w;
            });
          }
        });
      }
    });
  }

  return { benchPR, squatPR, deadliftPR };
};

const buildDirectAnswer = (
  intents: string[],
  userStats: {
    name: string;
    weight: number;
    goal: string;
    activity: string;
    calories: number;
    protein: number;
    historyCount: number;
    benchPR: number;
    squatPR: number;
    deadliftPR: number;
    dietType: string;
  }
) => {
  let intro = `Hey ${userStats.name || 'Champion'}! Let's coach you through this. Based on your current stats—weighing **${userStats.weight} kg** with a goal of **${userStats.goal || 'Muscle Gain'}** and maintaining a **${userStats.activity || 'Moderately Active'}** lifestyle—here is my expert coach strategy for you. `;

  if (userStats.historyCount > 0) {
    intro += `I see you have already logged **${userStats.historyCount} workouts** in your training history. `;
  } else {
    intro += `Let's get your first workout logged in the tracker soon so we can track your consistency! `;
  }

  if (userStats.benchPR > 0 || userStats.squatPR > 0 || userStats.deadliftPR > 0) {
    const prDetails = [
      userStats.benchPR > 0 ? `Bench Press: ${userStats.benchPR}kg` : null,
      userStats.squatPR > 0 ? `Squats: ${userStats.squatPR}kg` : null,
      userStats.deadliftPR > 0 ? `Deadlifts: ${userStats.deadliftPR}kg` : null
    ].filter(Boolean).join(', ');
    intro += `Your current personal records stand at: **${prDetails}**. Let's aim to push these numbers up safely! `;
  } else {
    intro += `For your strength progress, we'll establish your baseline Bench Press, Squat, and Deadlift PRs as you log workouts. `;
  }

  let body = "";
  if (intents.includes('workout')) {
    body += `To maximize your training efficiency, I've outlined a tailored training split. Since your goal is **${userStats.goal || 'Muscle Gain'}**, focusing on compound movements with progressive overload will yield the best hypertrophy adaptation. `;
  }
  if (intents.includes('diet') || intents.includes('snacks')) {
    if (userStats.dietType) {
      body += `On the nutrition side, you're targeting **${userStats.calories || 2000} kcal** and **${userStats.protein || 120}g of protein** as a **${userStats.dietType}**. I have laid out a balanced meal structure to hit these macros. `;
    } else {
      body += `To customize your diet, let's select your preference first (Vegetarian, Non-Vegetarian, Eggetarian, or Both) so I can build your customized meal logs. `;
    }
  }
  if (intents.includes('troubleshooting')) {
    body += `Regarding the physical discomfort or plateau you mentioned, it's very common but easily solved. We need to prioritize joint stability, tweak your elbow tuck, or incorporate a deload week to let your tendons recover. `;
  }
  
  if (!body) {
    body = `I'm ready to help you with workout routine builders, diet macro allocations, snack hacks, and troubleshooting plateaus. Just tell me what you need!`;
  }

  return intro + body;
};

const buildActionPlan = (
  intents: string[],
  userStats: {
    weight: number;
    goal: string;
    calories: number;
    protein: number;
    dietType: string;
  },
  daysCount: number,
  isDumbbell: boolean
) => {
  let plans: string[] = [];

  if (intents.includes('workout')) {
    plans.push(`**Workout Routine:** Custom ${daysCount}-Day ${isDumbbell ? 'Dumbbells-Only' : 'Gym'} Routine:`);
    if (daysCount === 3) {
      plans.push(`• Day 1: **Push Day** (Bench Press, Overhead Press, Incline DB Press) - 3 sets x 8-12 reps (2 min rest)`);
      plans.push(`• Day 2: **Pull Day** (Deadlifts, Dumbbell Rows, Bicep Curls) - 3 sets x 8-12 reps (2 min rest)`);
      plans.push(`• Day 3: **Leg Day & Core** (Squats, Lunges, Plank holds) - 3 sets x 10-15 reps (90s rest)`);
    } else {
      plans.push(`• Day 1: **Upper Body Focus** (Barbell Bench Press, DB Rows, Overhead Press) - 3-4 sets x 8-10 reps`);
      plans.push(`• Day 2: **Lower Body Focus** (Barbell Squats, Lunges, Calf Raises) - 3-4 sets x 10-12 reps`);
      plans.push(`• Day 3: **Active Recovery / Core** (Plank holds, cardio, mobility stretches) - 3 sets x 45s`);
      plans.push(`• Day 4: **Full Body Hypertrophy** (Dumbbell Floor Press, DB Rows, Goblet Squats) - 3 sets x 10-12 reps`);
    }
  }

  if (intents.includes('diet')) {
    if (userStats.dietType) {
      plans.push(`**Meal Schedule:** Tailored for a **${userStats.dietType}** diet at **${userStats.calories} kcal** / **${userStats.protein}g Protein**:`);
      if (userStats.dietType === 'Veg') {
        plans.push(`• **Breakfast (08:00)**: Soya cheela or Paneer toast + 1 glass double-toned milk (450 kcal, 28g protein)`);
        plans.push(`• **Lunch (13:00)**: 150g Low-fat Paneer Bhurji cooked in 1 tsp olive oil + 2 multigrain rotis + raw cucumber salad (650 kcal, 38g protein)`);
        plans.push(`• **Evening Snack (17:00)**: 1 scoop Whey Protein in water + 15 almonds (220 kcal, 28g protein)`);
        plans.push(`• **Dinner (20:00)**: 150g Stir-fried Tofu with broccoli and capsicum over 1 cup cooked brown rice (680 kcal, 36g protein)`);
      } else if (userStats.dietType === 'Non-Veg') {
        plans.push(`• **Breakfast (08:00)**: 3 egg whites + 2 whole eggs scrambled with spinach + 2 slices whole wheat toast (480 kcal, 32g protein)`);
        plans.push(`• **Lunch (13:00)**: 150g juicy grilled Chicken breast + 1.5 cups cooked Basmati rice + mixed dal tadka (720 kcal, 54g protein)`);
        plans.push(`• **Evening Snack (17:00)**: 1 cup low-fat Greek yogurt with chia seeds + 1 apple (200 kcal, 15g protein)`);
        plans.push(`• **Dinner (20:00)**: 150g pan-seared Salmon or Basa fish fillet + roasted sweet potato mash + steamed green beans (600 kcal, 44g protein)`);
      } else if (userStats.dietType === 'Eggetarian') {
        plans.push(`• **Breakfast (08:00)**: 3 scrambled eggs seasoned with black pepper + 2 slices wheat toast (450 kcal, 24g protein)`);
        plans.push(`• **Lunch (13:00)**: 100g low-fat Paneer stir-fry + mixed sprouts salad + 2 multigrain flatbreads (620 kcal, 30g protein)`);
        plans.push(`• **Evening Snack (17:00)**: 1 scoop Whey Protein shake + 1 medium banana (250 kcal, 26g protein)`);
        plans.push(`• **Dinner (20:00)**: Egg bhurji curry (3 eggs) cooked with onions/tomatoes + 1 cup brown rice or quinoa (650 kcal, 32g protein)`);
      } else if (userStats.dietType === 'Both') {
        plans.push(`• **Breakfast (08:00)**: 3 egg whites scrambled with spinach + 1 scoop whey protein shake (380 kcal, 38g protein)`);
        plans.push(`• **Lunch (13:00)**: 150g grilled chicken breast or 150g Paneer bhurji + 2 multigrain rotis + mixed dal (680 kcal, 48g protein)`);
        plans.push(`• **Evening Snack (17:00)**: 1 handful roasted foxnuts (makhana) + 1 glass masala buttermilk (150 kcal, 6g protein)`);
        plans.push(`• **Dinner (20:00)**: 150g baked fish fillet or grilled tofu + 1 cup cooked brown rice + stir-fried veggies (590 kcal, 38g protein)`);
      }
    } else {
      plans.push(`**Diet Setup Stopped**: Please select your dietary preference below so I can output your custom daily meals.`);
    }
  }

  if (intents.includes('snacks')) {
    if (userStats.dietType) {
      plans.push(`**Satiety Snacks:** High-protein snacks to prevent cravings:`);
      if (userStats.dietType === 'Veg') {
        plans.push(`• Roasted foxnuts (Makhana) - 50g (180 kcal, 4g protein)`);
        plans.push(`• Sprouted moong salad with lime and chaat masala (150 kcal, 9g protein)`);
        plans.push(`• Low-fat paneer slices with cucumber (180 kcal, 18g protein)`);
      } else if (userStats.dietType === 'Non-Veg') {
        plans.push(`• Hard-boiled egg whites (3 pcs) seasoned with salt/pepper (50 kcal, 12g protein)`);
        plans.push(`• Shredded chicken salad with light yogurt dressing (120 kcal, 22g protein)`);
        plans.push(`• Low-fat turkey breast roll-ups (90 kcal, 15g protein)`);
      } else if (userStats.dietType === 'Eggetarian') {
        plans.push(`• Boiled eggs (2 whole) (140 kcal, 12g protein)`);
        plans.push(`• Sprouts salad with boiled egg white dressing (160 kcal, 15g protein)`);
      } else {
        plans.push(`• Roasted black chickpeas (Chana) - 50g (180 kcal, 10g protein)`);
        plans.push(`• Hard-boiled egg whites (3 pcs) (50 kcal, 12g protein)`);
        plans.push(`• Low-fat paneer bhurji - 80g (140 kcal, 15g protein)`);
      }
    } else {
      plans.push(`**Snack Plan:** Choose your dietary preference below to get clean snacking recommendations.`);
    }
  }

  if (intents.includes('troubleshooting')) {
    plans.push(`**Form & Joint Corrections:**`);
    plans.push(`• **Retract the Scapula**: Squeeze your shoulder blades together and tuck them down before lying on the bench.`);
    plans.push(`• **Tuck Your Elbows**: Keep your elbows at a 45-degree angle to your body. Flaring them to 90 degrees causes impingement.`);
    plans.push(`• **Incorporate Accessory Exercises**: Work on facepulls, rotator cuff external rotations, and dumbbell floor presses to build joint stability.`);
  }

  if (plans.length === 0) {
    plans.push(`• Define a goal in your profile to initialize custom workout and diet plans.`);
    plans.push(`• Start tracking daily weight entries in the progress dashboard.`);
    plans.push(`• Check your nutrition logs to ensure you meet protein requirements.`);
  }

  return plans;
};

const buildAdditionalRecommendations = (intents: string[], dietType: string) => {
  let recs: string[] = [];

  if (intents.includes('workout') || intents.includes('equipment')) {
    recs.push(`**Active Recovery**: Do 30-45 minutes of low-intensity steady-state cardio (LISS) like brisk walking on rest days to speed up recovery.`);
    recs.push(`**Time Under Tension**: Slow down the lowering (eccentric) phase of your exercises to 3 seconds to trigger greater muscle hypertrophy.`);
  }

  if (intents.includes('diet') || intents.includes('snacks')) {
    recs.push(`**Hydration Target**: Drink at least 3-4 liters of water daily to maintain metabolic performance and muscle fullness.`);
    recs.push(`**Prep Your Meals**: Cook your protein sources in bulk on Sundays to ensure you never fall short of your daily macros.`);
    if (dietType === 'Veg') {
      recs.push(`**Protein Complementarity**: Combine grains and legumes (like rice and dal) to create complete amino acid profiles.`);
    }
  }

  if (intents.includes('troubleshooting')) {
    recs.push(`**Deload Cycles**: Every 6-8 weeks of heavy training, reduce your working weights by 15-20% for 1 week to let joints and ligaments repair.`);
    recs.push(`**Quality Sleep**: Sleep is the ultimate recovery tool. Get 7-9 hours of deep sleep to optimize growth hormone production.`);
  }

  if (recs.length === 0) {
    recs.push(`Ensure you sleep 8 hours per night to maximize central nervous system recovery.`);
    recs.push(`Keep records of your weight entries on a weekly basis to track trends.`);
  }

  return recs;
};

const buildFollowUpSuggestions = (intents: string[]) => {
  let suggestions: string[] = [];

  if (intents.includes('workout')) {
    suggestions.push("How do I calculate my 1-Rep Max (1RM)?");
    suggestions.push("Should I train to failure on every set?");
    suggestions.push("What exercises build wider shoulders?");
  }
  if (intents.includes('diet')) {
    suggestions.push("How can I hit my protein goal without whey?");
    suggestions.push("Is creatine safe to take daily?");
    suggestions.push("Should I eat carbs before my workout?");
  }
  if (intents.includes('troubleshooting')) {
    suggestions.push("How do I fix a strength plateau?");
    suggestions.push("What is the best way to deal with DOMS?");
    suggestions.push("How do I test my shoulder mobility?");
  }
  
  if (suggestions.length < 3) {
    suggestions.push("Suggest healthy snacks.");
    suggestions.push("Give me a 3-day split.");
    suggestions.push("Explain weight stalls.");
  }

  return [...new Set(suggestions)].slice(0, 4);
};

const PRESET_QUERIES = [
  "Create a 4-day fat-loss split.",
  "I only have dumbbells.",
  "Give me a beginner calisthenics routine.",
  "Suggest chest exercises without machines.",
  "Build a Push Pull Legs routine.",
  "Give me a 2,300-calorie Indian diet.",
  "High-protein vegetarian meals.",
  "Fat-loss meal plans.",
  "Muscle gain diets.",
  "Healthy snack suggestions.",
  "My shoulders hurt during bench press.",
  "How many rest days do I need?",
  "I have DOMS.",
  "How much sleep should I get?",
  "Why has my weight stalled?",
  "Should I increase calories?",
  "Why is my bench press stuck?"
];

export const AICoach: React.FC<AICoachProps> = ({ 
  onSaveRoutine, 
  savedExercises: _savedExercises,
  userWeight,
  savedDietGoal,
  workoutHistory,
  savedDietCalories,
  savedDietProtein,
  savedDietType,
  userName,
  onSaveDiet,
  onNavigate,
  onStartWorkout,
  onChangeDietType
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'generator'>('chat');
  
  // Shopping list modal state
  const [shoppingListModalOpen, setShoppingListModalOpen] = useState(false);
  const [shoppingListItems, setShoppingListItems] = useState<{ category: string; items: { name: string; qty: string }[] }[]>([]);
  const [shoppingListType, setShoppingListType] = useState<string>('Veg');
  const [shoppingListCopied, setShoppingListCopied] = useState(false);

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
            text: 'Hey Champ! Let\'s coach you through this.',
            timestamp: Date.now() - 3590000 * 2,
            directAnswer: 'Preserving muscle through heavy compound lifting is key for fat loss. This 4-day Upper/Lower split maximizes energy expenditure while offering 72 hours of recovery per muscle group.',
            actionPlanItems: [
              'Day 1: Upper Body Power (Bench Press, Rows, Overhead Press) - 3 sets x 8 reps',
              'Day 2: Lower Body Power (Squats, RDLs, Leg Press) - 3 sets x 10 reps',
              'Day 3: Active Rest / LISS Cardio (30-45 mins walk/cycle)',
              'Day 4: Upper Body Hypertrophy (DB Press, Pullups, Lateral Raises) - 3 sets x 10 reps',
              'Day 5: Lower Body Hypertrophy (Leg Extensions, Curls, Lunges) - 3 sets x 12 reps'
            ],
            recommendationItems: [
              'Flat Bench Press - 3 sets of 8 reps',
              'Dumbbell Rows - 3 sets of 10 reps',
              'Quality Sleep: 7-9 hours to rebuild muscle fibers',
              'Hydration: 3-4L water daily'
            ],
            followUpSuggestions: [
              'Should I do cardio on rest days?',
              'How many calories should I eat to lose fat?',
              'What exercises build chest width?'
            ],
            hasWorkoutContent: true,
            generatedRoutine: {
              id: 'ai-routine-preset-1',
              name: 'AI: 4-Day Upper/Lower Split',
              desc: 'Custom 4-day fat-loss program built for your profile.',
              exercises: ['flat-bb-press', 'db-rows', 'barbell-squats', 'deadlift']
            }
          }
        ]
      },
      {
        id: 'chat-2',
        title: 'High Protein Vegetarian Meals',
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
            text: 'Hey Champ! Let\'s coach you through this.',
            timestamp: Date.now() - 3590000 * 24,
            directAnswer: 'Vegetarians can easily hit their protein targets. We focus on low-fat paneer, Greek yogurt, tofu, lentils, and high-protein soya chunks to target 120-140g of protein daily.',
            actionPlanItems: [
              'Meal 1: High-protein Soya cheela (2 pcs) with low-fat curd (450 kcal, 28g protein)',
              'Meal 2: Low-fat paneer (150g) bhurji + 2 multigrain rotis (650 kcal, 38g protein)',
              'Meal 3: Stir-fried Tofu (150g) with green broccoli and brown rice (680 kcal, 36g protein)'
            ],
            recommendationItems: [
              'Whey Protein: Supplement 1 scoop to hit clean target',
              'Protein Complementarity: Rice and Dal combine for complete amino profiles',
              'Prep meals in bulk on Sundays'
            ],
            followUpSuggestions: [
              'Give me a shopping list for these vegetarian meals.',
              'What vegetarian snacks have the most protein?',
              'Should I take creatine?'
            ],
            hasDietContent: true,
            suggestedDiet: { calories: 2200, protein: 120, goal: 'Muscle Gain' }
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

  const handleSetDietPreference = (pref: string, msgId: string) => {
    onChangeDietType(pref);
    
    setConversations(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === msgId) {
              const updatedFields = generateResponseFields(m.originalQuery || m.text, pref);
              return {
                ...m,
                dietPromptAnswered: true,
                selectedPreference: pref,
                showDietPrompt: false,
                ...updatedFields
              };
            }
            return m;
          })
        };
      }
      return c;
    }));
  };

  const handleSaveRoutineFromChat = (msg: Message) => {
    if (msg.generatedRoutine) {
      onSaveRoutine(msg.generatedRoutine);
      alert("Routine saved successfully to your dashboard!");
    }
  };

  const handleStartWorkoutFromChat = (msg: Message) => {
    if (msg.generatedRoutine) {
      onStartWorkout(msg.generatedRoutine);
      document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSaveDietFromChat = (msg: Message) => {
    if (msg.suggestedDiet) {
      onSaveDiet({
        goal: msg.suggestedDiet.goal,
        type: savedDietType || msg.selectedPreference || 'Veg',
        calories: msg.suggestedDiet.calories,
        protein: msg.suggestedDiet.protein,
        carbs: Math.round((msg.suggestedDiet.calories * 0.45) / 4),
        fats: Math.round((msg.suggestedDiet.calories * 0.25) / 9),
        age: Number(localStorage.getItem('fitai_user_age') || '25'),
        weight: userWeight,
        height: Number(localStorage.getItem('fitai_user_height') || '175'),
        goalWeight: Number(localStorage.getItem('fitai_user_goal_weight') || '65'),
        gender: (localStorage.getItem('fitai_user_gender') || 'Male') as 'Male' | 'Female',
        activity: localStorage.getItem('fitai_user_activity') || 'Moderately Active',
        subGoalName: 'AI Coach Recommendation',
        expectedChange: msg.suggestedDiet.goal === 'Fat Loss' ? '-0.50 kg / week' : '+0.25 kg / week'
      });
      alert("Diet targets updated on your dashboard!");
    }
  };

  const handleAddToNutritionHub = (msg: Message) => {
    if (msg.suggestedDiet) {
      handleSaveDietFromChat(msg);
      onNavigate('nutrition', 'diet');
    }
  };

  const handleGenerateShoppingList = (dietType: string) => {
    let items: { category: string; items: { name: string; qty: string }[] }[] = [];
    const type = dietType || savedDietType || 'Veg';

    if (type === 'Veg') {
      items = [
        {
          category: 'Protein Sources 🥦',
          items: [
            { name: 'Low-fat Paneer', qty: '1.5 kg' },
            { name: 'Tofu (Extra Firm)', qty: '1.0 kg' },
            { name: 'Whey Protein Isolate', qty: '1 tub (approx. 30 servings)' },
            { name: 'Soya Chunks / Granules', qty: '500 g' },
            { name: 'Greek Yogurt (Unsweetened)', qty: '1.5 kg' },
            { name: 'Mixed Lentils (Moong/Masoor Dal)', qty: '1.0 kg' }
          ]
        },
        {
          category: 'Complex Carbs 🌾',
          items: [
            { name: 'Rolled Oats', qty: '1.0 kg' },
            { name: 'Brown Rice / Quinoa', qty: '1.5 kg' },
            { name: 'Multigrain Atta (Flour)', qty: '2.0 kg' },
            { name: 'Sweet Potatoes', qty: '1.0 kg' }
          ]
        },
        {
          category: 'Vitamins & Fiber 🥗',
          items: [
            { name: 'Fresh Broccoli', qty: '1.0 kg' },
            { name: 'Baby Spinach leaves', qty: '500 g' },
            { name: 'English Cucumbers', qty: '1.5 kg' },
            { name: 'Lemon, Ginger, & Garlic', qty: 'As needed' }
          ]
        }
      ];
    } else if (type === 'Non-Veg') {
      items = [
        {
          category: 'Protein Sources 🍗',
          items: [
            { name: 'Boneless Chicken Breast', qty: '2.0 kg' },
            { name: 'Salmon or Basa fish fillets', qty: '1.2 kg' },
            { name: 'Fresh Eggs (Large)', qty: '3 dozen' },
            { name: 'Whey Protein Isolate', qty: '1 tub' },
            { name: 'Lean Ground Turkey / Beef', qty: '800 g' }
          ]
        },
        {
          category: 'Complex Carbs 🌾',
          items: [
            { name: 'Rolled Oats', qty: '1.0 kg' },
            { name: 'Basmati Rice', qty: '2.0 kg' },
            { name: 'Sweet Potatoes', qty: '1.5 kg' },
            { name: 'Whole Wheat Toast Bread', qty: '2 loaves' }
          ]
        },
        {
          category: 'Vitamins & Fiber 🥗',
          items: [
            { name: 'Fresh Broccoli & Asparagus', qty: '1.5 kg' },
            { name: 'Spinach / Mixed salad greens', qty: '750 g' },
            { name: 'English Cucumbers & Tomatoes', qty: '2.0 kg' },
            { name: 'Avocados', qty: '4 pcs' }
          ]
        }
      ];
    } else if (type === 'Eggetarian') {
      items = [
        {
          category: 'Protein Sources 🍳',
          items: [
            { name: 'Fresh Eggs (Large)', qty: '4 dozen' },
            { name: 'Low-fat Paneer', qty: '1.0 kg' },
            { name: 'Whey Protein Isolate', qty: '1 tub' },
            { name: 'Greek Yogurt (Unsweetened)', qty: '1.5 kg' },
            { name: 'Black Chickpeas (Kala Chana)', qty: '1.0 kg' }
          ]
        },
        {
          category: 'Complex Carbs 🌾',
          items: [
            { name: 'Rolled Oats', qty: '1.0 kg' },
            { name: 'Brown Rice', qty: '1.5 kg' },
            { name: 'Multigrain Atta (Flour)', qty: '2.0 kg' }
          ]
        },
        {
          category: 'Vitamins & Fiber 🥗',
          items: [
            { name: 'Spinach & Kale', qty: '600 g' },
            { name: 'English Cucumbers', qty: '1.5 kg' },
            { name: 'Fresh Broccoli', qty: '1.0 kg' }
          ]
        }
      ];
    } else {
      items = [
        {
          category: 'Protein Sources 🥚🥩',
          items: [
            { name: 'Chicken Breast / Fish Fillets', qty: '1.5 kg' },
            { name: 'Fresh Eggs (Large)', qty: '2 dozen' },
            { name: 'Low-fat Paneer or Tofu', qty: '1.0 kg' },
            { name: 'Whey Protein Isolate', qty: '1 tub' }
          ]
        },
        {
          category: 'Complex Carbs 🌾',
          items: [
            { name: 'Rolled Oats / Muesli', qty: '1.0 kg' },
            { name: 'Basmati / Brown Rice', qty: '2.0 kg' },
            { name: 'Whole Wheat Flatbread Flour', qty: '1.5 kg' }
          ]
        },
        {
          category: 'Vitamins & Fiber 🥗',
          items: [
            { name: 'Fresh Broccoli & Peppers', qty: '1.5 kg' },
            { name: 'English Cucumbers & Spinach', qty: '1.5 kg' }
          ]
        }
      ];
    }

    setShoppingListItems(items);
    setShoppingListType(type);
    setShoppingListModalOpen(true);
  };

  const handleCopyShoppingList = () => {
    let text = `🛒 FitAI Coach Custom Shopping List (${shoppingListType})\n\n`;
    shoppingListItems.forEach(cat => {
      text += `--- ${cat.category} ---\n`;
      cat.items.forEach(item => {
        text += `- ${item.name}: ${item.qty}\n`;
      });
      text += `\n`;
    });
    text += `Generated by FitAI Coach. Stay disciplined! 💪`;
    
    navigator.clipboard.writeText(text).then(() => {
      setShoppingListCopied(true);
      setTimeout(() => setShoppingListCopied(false), 2000);
    });
  };

  const triggerAIResponse = (userText: string, chatId: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const textLower = userText.toLowerCase();
      
      const detectedIntents: string[] = [];
      if (textLower.includes('split') || textLower.includes('routine') || textLower.includes('program') || textLower.includes('workout') || textLower.includes('day')) {
        detectedIntents.push('workout');
      }
      if (textLower.includes('dumbbell') || textLower.includes('db') || textLower.includes('equipment') || textLower.includes('calisthenic') || textLower.includes('bodyweight') || textLower.includes('home') || textLower.includes('only')) {
        detectedIntents.push('equipment');
      }
      if (textLower.includes('diet') || textLower.includes('calorie') || textLower.includes('kcal') || textLower.includes('meal') || textLower.includes('nutrition') || textLower.includes('food') || textLower.includes('protein') || textLower.includes('veg')) {
        detectedIntents.push('diet');
      }
      if (textLower.includes('bench') || textLower.includes('shoulder') || textLower.includes('hurt') || textLower.includes('pain') || textLower.includes('stuck') || textLower.includes('plateau') || textLower.includes('press')) {
        detectedIntents.push('troubleshooting');
      }
      if (textLower.includes('snack') || textLower.includes('snacks') || textLower.includes('snacking')) {
        detectedIntents.push('snacks');
      }

      let match = PRESET_ANSWERS[userText];
      let sections: Section[] = [];
      let showDietPrompt = false;
      let generatedRoutine: WorkoutRoutine | undefined = undefined;
      let suggestedDiet: { calories: number; protein: number; goal: string } | undefined = undefined;
      let coachIntroduction = `Hey ${userName || 'Champion'}! Let's break down your goals. I've analyzed your profile and query to design this tailored strategy.`;

      if (!match && detectedIntents.length > 0) {
        if (detectedIntents.includes('workout')) {
          const daysMatch = userText.match(/(\d+)\s*-?\s*day/i);
          const daysCount = daysMatch ? parseInt(daysMatch[1]) : 4;
          const hasDumbbells = textLower.includes('dumbbell') || textLower.includes('db');
          
          let splitExercises = hasDumbbells 
            ? [
                { name: 'Flat Dumbbell Press', id: 'flat-db-press' },
                { name: 'Dumbbell Rows', id: 'db-rows' },
                { name: 'Lunges', id: 'lunge' },
                { name: 'Plank', id: 'plank' }
              ]
            : [
                { name: 'Flat Bench Press', id: 'flat-bb-press' },
                { name: 'Dumbbell Rows', id: 'db-rows' },
                { name: 'Barbell Squats', id: 'barbell-squats' },
                { name: 'Deadlift', id: 'deadlift' }
              ];

          let dayDetails = "";
          if (daysCount === 4) {
            dayDetails = `- **Day 1**: Upper Body Focus (Dumbbell Bench Press, Dumbbell Rows, Lateral Raises)
- **Day 2**: Lower Body Focus (Goblet Squats, Dumbbell Romanian Deadlifts, Lunges)
- **Day 3**: Active Recovery / Core (Plank holds, mobility stretches)
- **Day 4**: Full Body Hypertrophy (Dumbbell Floor Press, Lunges, Dumbbell Rows)`;
          } else {
            dayDetails = `- **Day 1**: Push Day (Bench Press variations, overhead press, tricep extensions)
- **Day 2**: Pull Day (Deadlifts, dumbbell rows, curls)
- **Day 3**: Legs & Core (Squats, lunges, plank circuits)`;
          }

          generatedRoutine = {
            id: `ai-routine-${Date.now()}`,
            name: `Coach's ${daysCount}d ${hasDumbbells ? 'DB' : 'Gym'} Split`,
            desc: `Custom ${daysCount}-day program built for ${savedDietGoal || 'Muscle Gain'} targeting your weight of ${userWeight || 70} kg.`,
            exercises: splitExercises.map(ex => ex.id)
          };

          sections.push({
            id: 'sect-workout',
            title: `🏋️ Custom ${daysCount}-Day ${savedDietGoal || 'Muscle Gain'} Split`,
            content: `Since your goal is **${savedDietGoal || 'Muscle Gain'}** and you weigh **${userWeight || 70} kg**, I've designed a specialized hypertrophy program tailored to your stats. 
            
            **Weekly Structure:**
            ${dayDetails}
            
            *Progression strategy: Keep the intensity high (RPE 8-9) and aim to add 1 rep or slightly increase the load weekly.*`,
            type: 'workout',
            actionButtons: ['save_routine', 'start_workout'],
            exercises: splitExercises
          });
        }

        if (detectedIntents.includes('equipment')) {
          const isDumbbell = textLower.includes('dumbbell') || textLower.includes('db');
          const isCali = textLower.includes('calisthenic') || textLower.includes('bodyweight');
          
          let eqName = "limited equipment";
          let tips = "";
          
          if (isDumbbell) {
            eqName = "Dumbbells Only";
            tips = `- **Time Under Tension**: Slow down the negative (eccentric) phase to 3 seconds to increase muscle recruitment.
- **Unilateral Focus**: Exercise variations like Bulgarian Split Squats and Single-Arm DB Rows help correct asymmetries and demand high stabilization.
- **Mechanical Drop Sets**: Move from a harder variation (e.g. Incline DB Press) directly to a flatter angle to exhaust fibers.`;
          } else if (isCali) {
            eqName = "Bodyweight Calisthenics";
            tips = `- **Leverage Adjustments**: Make pushups harder by elevating your feet or doing decline pushups.
- **Volume & Rest**: Keep rest times shorter (45-60s) to maintain a higher metabolic stress.
- **Core Stability**: Focus on active hollow-body positions during pull-ups and planks.`;
          } else {
            eqName = "Home Equipment";
            tips = `- Utilize resistance bands to add tension at the peak contraction of lifts.
- Focus on high velocity concentric movements to recruit fast-twitch fibers.`;
          }

          sections.push({
            id: 'sect-equipment',
            title: `⚙️ Training Adaptation: ${eqName}`,
            content: `Training with ${eqName} is highly effective. Here's how to maximize your biological adaptation:
            
            ${tips}`,
            type: 'equipment'
          });
        }

        if (detectedIntents.includes('diet')) {
          const calMatch = userText.match(/(\d{3,4})\s*-?\s*(calorie|kcal)/i);
          const caloriesTarget = calMatch ? parseInt(calMatch[1]) : (savedDietCalories || 2300);
          const proteinTarget = Math.round(userWeight * 2) || savedDietProtein || 140;

          suggestedDiet = {
            calories: caloriesTarget,
            protein: proteinTarget,
            goal: savedDietGoal || 'Muscle Gain'
          };

          let dietContent = `To support your target of **${caloriesTarget} kcal** and **${proteinTarget}g protein**, here is a nutrient-dense Indian meal template. `;
          
          if (savedDietType === 'Veg') {
            dietContent += `I've personalized this to your **Vegetarian** preferences:
            
- **Meal 1 (Breakfast)**: High-protein Soya flour cheela (2 pcs) with low-fat curd (450 kcal, 28g protein)
- **Meal 2 (Lunch)**: Paneer Bhurji (150g low-fat paneer) with 2 multigrain rotis and cucumber raita (650 kcal, 36g protein)
- **Meal 3 (Dinner)**: Stir-fried Tofu (150g) and broccoli over 1 cup cooked brown rice or quinoa (680 kcal, 34g protein)
- **Daily Totals**: ~2300 kcal, ~138g protein. Fits your goal perfectly!`;
          } else if (savedDietType === 'Non-Veg') {
            dietContent += `I've personalized this to your **Non-Vegetarian** preferences:
            
- **Meal 1 (Breakfast)**: Egg Omelette (3 whole eggs + 2 whites) with sliced whole wheat toast (480 kcal, 32g protein)
- **Meal 2 (Lunch)**: Juicy Chicken Breast Curry (150g breast) served with basmati rice (1.5 cups) and dal (720 kcal, 54g protein)
- **Meal 3 (Dinner)**: Pan-grilled Salmon or Basa fish fillet with sautéed green beans and sweet potato mash (600 kcal, 44g protein)
- **Daily Totals**: ~2300 kcal, ~145g protein. Built for muscle repair!`;
          } else if (savedDietType === 'Eggetarian') {
            dietContent += `I've personalized this to your **Eggetarian** preferences:
            
- **Meal 1 (Breakfast)**: Scrambled eggs (3 whole) with sliced wheat toast (450 kcal, 24g protein)
- **Meal 2 (Lunch)**: Low-fat paneer (100g) stir-fry with mixed lentils and multigrain flatbread (620 kcal, 30g protein)
- **Meal 3 (Dinner)**: Egg bhurji curry (3 eggs) served with cooked quinoa or brown rice (650 kcal, 32g protein)
- **Daily Totals**: ~2300 kcal, ~135g protein. High bioavailability!`;
          } else {
            showDietPrompt = true;
            dietContent += `Since your diet type is not selected in your profile, here are both options:
            
#### 🥦 Option A: Vegetarian meal plan (~2300 kcal, ~130g protein)
- **Breakfast**: Rolled oats blended with skimmed milk, banana, and a scoop of whey protein (480 kcal, 32g protein)
- **Lunch**: Paneer Bhurji (150g paneer) cooked with minimal oil, served with 2 multigrain rotis and green salad (650 kcal, 36g protein)
- **Dinner**: High-protein soya chunk curry (75g soya) with steamed brown rice and mixed lentil dal (700 kcal, 42g protein)

#### 🍗 Option B: Non-Vegetarian meal plan (~2300 kcal, ~140g protein)
- **Breakfast**: 3 egg whites + 2 whole eggs scrambled with spinach, served with 2 slices of whole wheat toast (490 kcal, 30g protein)
- **Lunch**: Tandoori Grilled Chicken breast (150g) with basmati rice (1 cup) and a hot bowl of Toor dal (680 kcal, 52g protein)
- **Dinner**: Baked herb-crusted fish fillet (180g white fish) served with mashed sweet potatoes and steam-sautéed broccoli (620 kcal, 40g protein)`;
          }

          sections.push({
            id: 'sect-diet',
            title: `🍽️ Nutrition Plan: ${caloriesTarget} kcal / ${proteinTarget}g Protein`,
            content: dietContent,
            type: 'diet',
            actionButtons: ['add_diet']
          });
        }

        if (detectedIntents.includes('troubleshooting')) {
          let problem = "bench press sticking";
          let advice = "";
          
          if (textLower.includes('bench') || textLower.includes('press')) {
            problem = "Bench Press Plateau";
            advice = `- **Retract the Scapula**: Squeeze your shoulder blades together and pull them down (as if putting them in back pockets) before lying down. This stabilizes the shoulder capsule and places load on the pecs.
- **Elbow Angle**: Tuck your elbows at 45 degrees relative to your torso. Never flare them to 90 degrees, which causes rotator cuff impingement.
- **Triceps Support**: Incorporate Close Grip Bench Press or Dumbbell Floor Presses. Stronger triceps help drive through the midpoint lockout.`;
          } else if (textLower.includes('shoulder') || textLower.includes('pain') || textLower.includes('hurt')) {
            problem = "Shoulder Impingement / Pain";
            advice = `- **Form Check**: Pain during press movements usually means the front deltoids are overloaded. Reduce the weight by 20% and focus on a slow, controlled trajectory.
- **Warm-Up**: Allocate 5 minutes to dynamic joint circles and rotator cuff band face-pulls.
- **Alternative Exercises**: Switch to Dumbbell Floor Presses or Chest Dips where elbow angle is naturally constrained.`;
          } else {
            problem = "Strength Plateaus";
            advice = `- **Progressive Overload**: Ensure you are aiming for one extra rep or a tiny increment in load rather than using the same weight every week.
- **Deload Week**: Drop working weights by 15% for one week to allow neurological and tendon structures to fully repair.
- **Sleep & Protein**: Ensure you hit 8 hours of sleep. Soreness and stagnation are usually recovery-based.`;
          }

          let historyNotes = workoutHistory && workoutHistory.length > 0 
            ? `Your workout history shows **${workoutHistory.length}** logged workouts. You're building solid consistency! Keep executing, let's break this barrier.`
            : `I see you haven't logged workouts in your history yet. Let's get started on the tracker to log your baseline weights.`;

          sections.push({
            id: 'sect-troubleshoot',
            title: `🔍 Biomechanical Troubleshooter: ${problem}`,
            content: `${advice}
            
            ${historyNotes}`,
            type: 'troubleshooting',
            actionButtons: ['open_library']
          });
        }

        if (detectedIntents.includes('snacks')) {
          let snackContent = "Here are high-protein, satiating snack ideas. ";
          
          if (savedDietType === 'Veg') {
            snackContent += `Optimized for your **Vegetarian** lifestyle:
            
- **Roasted Makhana (Foxnuts)**: Seasoned with turmeric and black pepper. Low calorie, great crunch. (100 kcal, 2g protein)
- **Roasted Chana (Chickpeas)**: A handful provides complex carbs and fiber. (180 kcal, 10g protein)
- **Low-Fat Paneer Bhurji / Cubes**: 100g pan-seared with salt and pepper. (180 kcal, 18g protein)
- **Greek Yogurt / Sprouts**: Mixed with cucumber and pomegranate. (150 kcal, 12g protein)`;
          } else if (savedDietType === 'Non-Veg') {
            snackContent += `Optimized for your **Non-Vegetarian** lifestyle:
            
- **Hard-Boiled Egg Whites**: 3 egg whites seasoned with chaat masala and black pepper. (50 kcal, 12g protein)
- **Shredded Chicken Breast Salad**: 100g breast tossed with cucumbers and fresh lime. (120 kcal, 22g protein)
- **Chicken Skewers / Kebabs**: 3 small cubes of low-fat grilled chicken. (160 kcal, 18g protein)
- **Whey Protein Shake**: Mixed with water. (120 kcal, 25g protein)`;
          } else {
            showDietPrompt = true;
            snackContent += `Here are options for both preferences:
            
#### 🥦 Vegetarian Snacks
- **Roasted Foxnuts (Makhana)**: Tossed in 1 tsp olive oil and pepper (120 kcal, 2g protein)
- **Roasted Black Chana (Chickpeas)**: Excellent source of fiber and energy (150 kcal, 8g protein)
- **Low-fat Paneer Cubes (100g)**: Seasoned with roasted cumin powder (180 kcal, 18g protein)

#### 🍗 Non-Vegetarian / Egg Snacks
- **Boiled Egg Whites (3 pcs)**: Quick, clean, and zero carb (50 kcal, 12g protein)
- **Tandoori Chicken Skewers (100g)**: Baked or pan-seared chicken breast (140 kcal, 22g protein)
- **Whey Isolate Shake**: 1 scoop mixed with water (120 kcal, 25g protein)`;
          }

          sections.push({
            id: 'sect-snacks',
            title: `🥜 High-Protein Coach Snacks`,
            content: snackContent,
            type: 'snacks'
          });
        }

        match = {
          text: coachIntroduction,
          sections,
          showDietPrompt,
          generatedRoutine,
          suggestedDiet
        };

      } else {
        const baseMatch = match || PRESET_ANSWERS['Suggest chest exercises without machines.'];
        
        let sectionsList: Section[] = [
          {
            id: 'sect-general',
            title: '🏋️ Coach Strategy Notes',
            content: baseMatch.directAnswer || baseMatch.text,
            type: 'workout'
          }
        ];
        
        if (baseMatch.reasoning) {
          sectionsList.push({
            id: 'sect-reasoning',
            title: '🧠 Physiological Breakdown',
            content: baseMatch.reasoning,
            type: 'troubleshooting'
          });
        }

        if (baseMatch.actionSteps && baseMatch.actionSteps.length > 0) {
          sectionsList.push({
            id: 'sect-actions',
            title: '📋 Recommended Action Plan',
            content: baseMatch.actionSteps.map(step => `- ${step}`).join('\n'),
            type: 'workout'
          });
        }

        if (baseMatch.warnings && baseMatch.warnings.length > 0) {
          sectionsList.push({
            id: 'sect-safety',
            title: '⚠️ Coach Safety Guidelines',
            content: baseMatch.warnings.join('\n'),
            type: 'troubleshooting'
          });
        }

        let actionButtons: ('save_routine' | 'add_diet' | 'open_library' | 'start_workout')[] = [];
        let exercises: { id: string; name: string }[] = [];

        if (baseMatch.recommendations && baseMatch.recommendations.length > 0) {
          exercises = baseMatch.recommendations
            .filter(r => r.type === 'exercise')
            .map(r => ({ id: r.id || 'push-ups', name: r.name }));
          
          if (exercises.length > 0) {
            actionButtons.push('save_routine', 'start_workout', 'open_library');
            generatedRoutine = {
              id: `ai-routine-${Date.now()}`,
              name: `Coach's Recommended Split`,
              desc: `AI recommended exercises for your fitness progression.`,
              exercises: exercises.map(ex => ex.id)
            };
          }
          
          if (baseMatch.recommendations.some(r => r.type === 'meal')) {
            actionButtons.push('add_diet');
            suggestedDiet = {
              calories: savedDietCalories || 2200,
              protein: savedDietProtein || 120,
              goal: savedDietGoal || 'Muscle Gain'
            };
          }
        }

        sectionsList[0].actionButtons = actionButtons;
        sectionsList[0].exercises = exercises;

        match = {
          text: baseMatch.text,
          sections: sectionsList,
          generatedRoutine,
          suggestedDiet,
          showDietPrompt: (userText.toLowerCase().includes('diet') || userText.toLowerCase().includes('snack')) && !savedDietType
        };
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
                        {!isUser && (
                          <div className="space-y-4 pt-2 border-t border-white/5">
                            {msg.directAnswer && (
                              <div className="space-y-0.5">
                                <span className="text-[9px] text-brand-cyan font-black uppercase tracking-wider block">Direct Answer</span>
                                <p className="text-zinc-300 font-medium">{msg.directAnswer}</p>
                              </div>
                            )}

                            {msg.reasoning && (
                              <div className="space-y-0.5 bg-dark-950/40 p-2.5 rounded-xl border border-white/5">
                                <span className="text-[9px] text-brand-violet font-black uppercase tracking-wider block">Physiological Reasoning</span>
                                <p className="text-zinc-400 italic font-normal">{msg.reasoning}</p>
                              </div>
                            )}

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

                            {/* Upgraded Multi-Intent Sections Layout */}
                            {msg.sections && msg.sections.length > 0 && (
                              <div className="space-y-5">
                                {msg.sections.map((section) => (
                                  <div key={section.id} className="p-3.5 bg-dark-950/40 border border-white/5 rounded-xl space-y-2 text-left">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-cyan border-b border-white/5 pb-1.5 flex items-center gap-1.5">
                                      {section.title}
                                    </h4>
                                    <p className="text-zinc-300 font-normal whitespace-pre-line leading-relaxed text-xs">{section.content}</p>
                                    
                                    {section.exercises && section.exercises.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                                        {section.exercises.map((ex, eidx) => (
                                          <span key={eidx} className="px-2 py-0.5 bg-brand-cyan/15 border border-brand-cyan/20 text-brand-cyan rounded text-[9px] font-bold">
                                            🏋️ {ex.name}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    {section.actionButtons && section.actionButtons.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-white/5">
                                        {section.actionButtons.includes('save_routine') && msg.generatedRoutine && (
                                          <button
                                            type="button"
                                            onClick={() => handleSaveRoutineFromChat(msg)}
                                            className="px-2.5 py-1.5 rounded-lg bg-brand-violet/20 hover:bg-brand-violet/30 border border-brand-violet/30 hover:border-brand-violet text-brand-violet hover:text-white text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                                          >
                                            <Plus className="h-3 w-3" /> Save Routine
                                          </button>
                                        )}
                                        {section.actionButtons.includes('start_workout') && msg.generatedRoutine && (
                                          <button
                                            type="button"
                                            onClick={() => handleStartWorkoutFromChat(msg)}
                                            className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-violet to-brand-cyan hover:opacity-90 text-white text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                                          >
                                            <ArrowRight className="h-3 w-3" /> Start Workout
                                          </button>
                                        )}
                                        {section.actionButtons.includes('add_diet') && msg.suggestedDiet && (
                                          <button
                                            type="button"
                                            onClick={() => handleSaveDietFromChat(msg)}
                                            className="px-2.5 py-1.5 rounded-lg bg-brand-lime/20 hover:bg-brand-lime/30 border border-brand-lime/30 hover:border-brand-lime text-brand-lime hover:text-white text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                                          >
                                            <Check className="h-3 w-3" /> Save to Diet
                                          </button>
                                        )}
                                        {section.actionButtons.includes('open_library') && (
                                          <button
                                            type="button"
                                            onClick={() => onNavigate('training', 'library')}
                                            className="px-2.5 py-1.5 rounded-lg bg-brand-cyan/20 hover:bg-brand-cyan/30 border border-brand-cyan/30 hover:border-brand-cyan text-brand-cyan hover:text-white text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                                          >
                                            <Dumbbell className="h-3 w-3" /> Open Exercises
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Dietary preference interactive prompt check */}
                            {msg.showDietPrompt && (
                              <div className="p-3.5 bg-brand-violet/10 border border-brand-violet/20 rounded-xl space-y-2 text-left animate-fadeIn">
                                <span className="text-[9px] text-brand-violet font-black uppercase tracking-widest block">Dietary Preference Required</span>
                                <p className="text-white text-xs font-semibold">
                                  {msg.dietPromptAnswered 
                                    ? `Preference saved: ${msg.selectedPreference}` 
                                    : "Before providing food recommendations, do you prefer Vegetarian, Non-Vegetarian, or Both?"
                                  }
                                </p>
                                {!msg.dietPromptAnswered && (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    <button 
                                      type="button"
                                      onClick={() => handleSetDietPreference('Veg', msg.id)}
                                      className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-lg transition-all"
                                    >
                                      Vegetarian
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => handleSetDietPreference('Non-Veg', msg.id)}
                                      className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/30 text-rose-400 text-[10px] font-bold rounded-lg transition-all"
                                    >
                                      Non-Vegetarian
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => handleSetDietPreference('Both', msg.id)}
                                      className="px-3 py-1.5 bg-brand-cyan/20 hover:bg-brand-cyan/35 border border-brand-cyan/30 text-brand-cyan text-[10px] font-bold rounded-lg transition-all"
                                    >
                                      Both
                                    </button>
                                  </div>
                                )}
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
