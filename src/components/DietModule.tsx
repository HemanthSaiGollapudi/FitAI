import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, Flame, Check, Leaf, Bone, Save, Compass, Activity, ShieldAlert, Sparkles, Scale, ArrowLeft } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

export type DietGoal = 'Fat Loss' | 'Muscle Gain' | 'Maintenance' | 'Body Recomposition';
export type DietType = 'Veg' | 'Non-Veg' | 'Eggetarian';

interface DietMeal {
  title: string;
  name: string;
  desc: string;
  kcal: number;
  protein: number;
}

export interface SavedDietPlan {
  goal: DietGoal;
  type: DietType;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  age: number;
  weight: number;
  height: number;
  goalWeight: number;
  gender: 'Male' | 'Female';
  activity: string;
  subGoalName: string;
  expectedChange: string;
}

interface DietModuleProps {
  onSaveDiet: (settings: SavedDietPlan) => void;
  savedGoal: string;
  savedType: string;
  savedCalories?: number;
}

export const DietModule: React.FC<DietModuleProps> = ({ 
  onSaveDiet, 
  savedGoal, 
  savedType,
  savedCalories = 0
}) => {
  // Input fields
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [height, setHeight] = useState<number>(175);
  const [weight, setWeight] = useState<number>(70);
  const [goalWeight, setGoalWeight] = useState<number>(65);
  const [activity, setActivity] = useState<string>('Moderately Active');
  const [goal, setGoal] = useState<DietGoal>('Fat Loss');
  const [type, setType] = useState<DietType>('Veg');

  // Educational guide state
  const [estGender, setEstGender] = useState<'Male' | 'Female'>('Male');
  const [estWeight, setEstWeight] = useState<number>(70);
  const [estActivity, setEstActivity] = useState<string>('Moderately Active');

  // Subgoal option selection state
  const [selectedSubGoal, setSelectedSubGoal] = useState<string>('Moderate Deficit');

  // Outputs
  const [bmr, setBmr] = useState<number>(0);
  const [tdee, setTdee] = useState<number>(0);
  const [targetCalories, setTargetCalories] = useState<number>(0);
  const [targetProtein, setTargetProtein] = useState<number>(0);
  const [targetCarbs, setTargetCarbs] = useState<number>(0);
  const [targetFats, setTargetFats] = useState<number>(0);
  const [safetyWarning, setSafetyWarning] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isEditingBiomarkers, setIsEditingBiomarkers] = useState(false);

  // Initialize editing biomarkers based on whether a diet plan is already saved
  useEffect(() => {
    setIsEditingBiomarkers(savedCalories === 0);
  }, [savedCalories]);

  // Intercept back button gestures inside Diet Module
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.app === 'fitai' && e.state.view === 'diet') {
        setIsEditingBiomarkers(e.state.isEditing);
      } else {
        setIsEditingBiomarkers(savedCalories === 0);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initial push state for diet module
    if (!window.history.state || window.history.state.view !== 'diet') {
      window.history.pushState({ app: 'fitai', view: 'diet', isEditing: isEditingBiomarkers }, '');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [savedCalories, isEditingBiomarkers]);

  const handleToggleEditBiomarkers = (edit: boolean) => {
    setIsEditingBiomarkers(edit);
    window.history.pushState({ app: 'fitai', view: 'diet', isEditing: edit }, '');
  };

  const goals: DietGoal[] = ['Fat Loss', 'Muscle Gain', 'Maintenance', 'Body Recomposition'];
  const activities = ['Sedentary', 'Moderately Active', 'Very Active', 'Athlete/Highly Active'];

  // Sync inputs from saved settings on mount
  useEffect(() => {
    if (savedGoal) setGoal(savedGoal as DietGoal);
    if (savedType) setType(savedType as DietType);
    
    const savedAge = localStorage.getItem('fitai_user_age');
    const savedGender = localStorage.getItem('fitai_user_gender');
    const savedHeight = localStorage.getItem('fitai_user_height');
    const savedWeight = localStorage.getItem('fitai_user_weight');
    const savedGoalWeight = localStorage.getItem('fitai_user_goal_weight');
    const savedActivity = localStorage.getItem('fitai_user_activity');
    const savedSubGoal = localStorage.getItem('fitai_diet_subgoal');
    
    if (savedAge) setAge(Number(savedAge));
    if (savedGender) setGender(savedGender as 'Male' | 'Female');
    if (savedHeight) setHeight(Number(savedHeight));
    if (savedWeight) {
      setWeight(Number(savedWeight));
      setEstWeight(Number(savedWeight));
    }
    if (savedGoalWeight) setGoalWeight(Number(savedGoalWeight));
    if (savedActivity) setActivity(savedActivity);
    if (savedSubGoal) setSelectedSubGoal(savedSubGoal);
  }, [savedGoal, savedType]);

  // Recalculate BMR, TDEE, Calories and Macros
  useEffect(() => {
    // Mifflin-St Jeor Equation
    let calculatedBmr = 0;
    if (gender === 'Male') {
      calculatedBmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      calculatedBmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    setBmr(Math.round(calculatedBmr));

    // Activity multiplier
    let multiplier = 1.2;
    if (activity === 'Sedentary') multiplier = 1.2;
    else if (activity === 'Moderately Active') multiplier = 1.55;
    else if (activity === 'Very Active') multiplier = 1.725;
    else if (activity === 'Athlete/Highly Active') multiplier = 1.9;

    const calculatedTdee = calculatedBmr * multiplier;
    setTdee(Math.round(calculatedTdee));

    // Sub-goal specific calorie calculation
    let dailyCal = calculatedTdee;
    let warning = null;

    if (goal === 'Fat Loss') {
      if (selectedSubGoal === 'Mild Deficit') {
        dailyCal = calculatedTdee - 250;
      } else if (selectedSubGoal === 'Moderate Deficit') {
        dailyCal = calculatedTdee - 500;
      } else if (selectedSubGoal === 'Aggressive Deficit') {
        dailyCal = calculatedTdee - 750;
        warning = 'WARNING: Caloric deficit is highly aggressive. Ensure you do not drop below basic thresholds.';
      } else {
        // Fallback or override
        dailyCal = calculatedTdee - 500;
      }
    } else if (goal === 'Muscle Gain') {
      if (selectedSubGoal === 'Lean Bulk') {
        dailyCal = calculatedTdee + 250;
      } else {
        dailyCal = calculatedTdee + 500;
      }
    } else if (goal === 'Body Recomposition') {
      dailyCal = calculatedTdee - 150;
    } else {
      dailyCal = calculatedTdee;
    }

    // Safety checks
    const minCalories = gender === 'Male' ? 1500 : 1200;
    if (dailyCal < minCalories) {
      dailyCal = minCalories;
      warning = `SAFETY WARNING: Calories adjusted to safe absolute minimum limit of ${minCalories} kcal/day to prevent metabolic shut-down. Do not starve yourself!`;
    }

    setTargetCalories(Math.round(dailyCal));
    setSafetyWarning(warning);

    // Protein splits
    let protPerKg = 1.8;
    if (goal === 'Fat Loss') {
      // 1.6 - 2.2 g per kg
      protPerKg = 2.0; 
    } else if (goal === 'Muscle Gain') {
      // 1.8 - 2.4 g per kg
      protPerKg = 2.2;
    } else if (goal === 'Body Recomposition') {
      protPerKg = 2.3;
    } else {
      protPerKg = 1.6;
    }

    const dailyProt = weight * protPerKg;
    setTargetProtein(Math.round(dailyProt));

    const dailyFats = (dailyCal * 0.25) / 9; // 25% of calories from fat
    setTargetFats(Math.round(dailyFats));

    const dailyCarbs = (dailyCal - (dailyProt * 4) - (dailyFats * 9)) / 4;
    setTargetCarbs(Math.round(dailyCarbs));

  }, [age, gender, height, weight, activity, goal, selectedSubGoal]);

  // Adjust selectedSubGoal automatically if Goal Tab changes
  const handleGoalTabChange = (newGoal: DietGoal) => {
    setGoal(newGoal);
    if (newGoal === 'Fat Loss') {
      setSelectedSubGoal('Moderate Deficit');
    } else if (newGoal === 'Muscle Gain') {
      setSelectedSubGoal('Lean Bulk');
    } else if (newGoal === 'Body Recomposition') {
      setSelectedSubGoal('Body Recomposition');
    } else {
      setSelectedSubGoal('Maintenance');
    }
  };

  // Educational body weight calorie calculation
  const getEducationalCalRange = () => {
    let baseMin = 2000;
    let baseMax = 2300;

    if (estGender === 'Male') {
      if (estWeight < 60) { baseMin = 2000; baseMax = 2300; }
      else if (estWeight < 70) { baseMin = 2300; baseMax = 2500; }
      else if (estWeight < 80) { baseMin = 2500; baseMax = 2700; }
      else if (estWeight < 90) { baseMin = 2700; baseMax = 2900; }
      else if (estWeight < 100) { baseMin = 2900; baseMax = 3100; }
      else if (estWeight < 110) { baseMin = 3100; baseMax = 3300; }
      else if (estWeight < 120) { baseMin = 3300; baseMax = 3500; }
      else { baseMin = 3500; baseMax = 3700; }
    } else {
      if (estWeight < 50) { baseMin = 1600; baseMax = 1800; }
      else if (estWeight < 60) { baseMin = 1800; baseMax = 2000; }
      else if (estWeight < 70) { baseMin = 2000; baseMax = 2200; }
      else if (estWeight < 80) { baseMin = 2200; baseMax = 2400; }
      else if (estWeight < 90) { baseMin = 2400; baseMax = 2600; }
      else if (estWeight < 100) { baseMin = 2600; baseMax = 2800; }
      else { baseMin = 2800; baseMax = 3000; }
    }

    // Activity multiplier adjustments
    let multiplier = 1.0;
    if (estActivity === 'Sedentary') multiplier = 0.875; // -12.5%
    else if (estActivity === 'Very Active') multiplier = 1.15; // +15%
    else if (estActivity === 'Athlete/Highly Active') multiplier = 1.25; // +25%

    return {
      min: Math.round(baseMin * multiplier),
      max: Math.round(baseMax * multiplier)
    };
  };

  const estRange = getEducationalCalRange();

  // Diet meal database structures (Goal-based lookup)
  const dietData: Record<DietGoal, Record<DietType, DietMeal[]>> = {
    'Fat Loss': {
      'Veg': [
        { title: 'Breakfast', name: 'Savoury Besan Cheela & Chutney', desc: 'Chickpea flour pancakes seasoned with onion and spices. Served with mint chutney.', kcal: 260, protein: 10 },
        { title: 'Mid-Morning Snack', name: 'Masala Buttermilk & Flax Seeds', desc: 'A tall glass of chilled churned low-fat curd. Paired with 1 tsp flax seeds.', kcal: 110, protein: 4 },
        { title: 'Lunch', name: 'Sautéed Tofu & Quinoa Bowl', desc: '150g tofu cubes stir-fried with broccoli and mushrooms over a small cup of quinoa.', kcal: 380, protein: 24 },
        { title: 'Evening Snack', name: 'Roasted Foxnuts (Makhana)', desc: 'Dry-roasted popped lotus seeds seasoned with dry mango powder.', kcal: 120, protein: 2 },
        { title: 'Dinner', name: 'High-Protein Soya Chunk Salad', desc: 'Boiled soya chunks tossed with raw cucumber, tomato, and fresh lemon juice.', kcal: 240, protein: 18 }
      ],
      'Non-Veg': [
        { title: 'Breakfast', name: 'Egg White Omelette with Mushrooms', desc: '3 egg whites cooked with sliced button mushrooms, garlic, and fresh herbs.', kcal: 180, protein: 18 },
        { title: 'Mid-Morning Snack', name: 'Clear Chicken & Veg Broth', desc: 'Light chicken broth boiled with ginger, pepper, carrots, and shredded breast.', kcal: 130, protein: 12 },
        { title: 'Lunch', name: 'Big Grilled Chicken Salad (180g)', desc: 'Shredded grilled chicken breast tossed with green lettuce, cucumbers, and lemon dressing.', kcal: 360, protein: 36 },
        { title: 'Evening Snack', name: 'Boiled Egg Whites (3 pcs)', desc: 'Hard-boiled egg whites sliced and sprinkled with freshly ground black pepper.', kcal: 75, protein: 12 },
        { title: 'Dinner', name: 'Lemon-Herb Steamed Fish & Asparagus', desc: 'White fish fillet steamed with lime leaves. Served with wilted asparagus.', kcal: 250, protein: 28 }
      ],
      'Eggetarian': [
        { title: 'Breakfast', name: '3 Egg White Omelette with Spinach', desc: 'Whisked egg whites cooked with mushrooms and spinach in a non-stick pan.', kcal: 160, protein: 17 },
        { title: 'Mid-Morning Snack', name: 'Masala Buttermilk & Chia Seeds', desc: 'Churned curd drink with black salt and a teaspoon of pre-soaked chia seeds.', kcal: 115, protein: 4 },
        { title: 'Lunch', name: 'Sautéed Paneer & Broccoli Bowl', desc: '100g low-fat cottage cheese sautéed with garlic, black pepper, and broccoli.', kcal: 310, protein: 20 },
        { title: 'Evening Snack', name: 'Boiled Egg Whites (3 pcs) with Pepper', desc: 'Hard-boiled egg whites sprinkled with black pepper and roasted cumin.', kcal: 75, protein: 12 },
        { title: 'Dinner', name: 'High-Protein Soya & Egg Salad', desc: 'Boiled soya chunks and 2 scrambled egg whites tossed with onion and lemon.', kcal: 260, protein: 23 }
      ]
    },
    'Muscle Gain': {
      'Veg': [
        { title: 'Breakfast', name: 'Paneer Parathas & Greek Yogurt', desc: '2 whole wheat flatbreads stuffed with cottage cheese. Served with Greek yogurt.', kcal: 550, protein: 24 },
        { title: 'Mid-Morning Snack', name: 'Peanut Butter Oatmeal Shake', desc: 'Rolled oats blended with skimmed milk, banana, and 2 tbsp of peanut butter.', kcal: 420, protein: 15 },
        { title: 'Lunch', name: 'Soya Chunks Curry & Quinoa', desc: 'High-protein soya chunks simmered in thick gravy. Served with quinoa and raita.', kcal: 610, protein: 38 },
        { title: 'Evening Snack', name: 'Roasted Paneer Cubes & Almonds', desc: 'Cubes of cottage cheese pan-seared with turmeric. Paired with raw almonds.', kcal: 320, protein: 18 },
        { title: 'Dinner', name: 'Kabuli Chana (Chole) & 2 Rotis', desc: 'Boiled chickpea curry served with 2 multigrain flatbreads and steamed broccoli.', kcal: 480, protein: 22 }
      ],
      'Non-Veg': [
        { title: 'Breakfast', name: 'Egg Omelette & Banana Oatmeal', desc: '3 whole eggs + 2 egg whites scrambled. Served with a bowl of warm milk oats.', kcal: 520, protein: 32 },
        { title: 'Mid-Morning Snack', name: 'Chicken Breast Sandwich', desc: 'Shredded tandoori chicken and mint chutney layered between multigrain bread.', kcal: 380, protein: 30 },
        { title: 'Lunch', name: 'Chicken Breast Curry & Basmati Rice', desc: 'Juicy chicken breast cubes in onion-tomato gravy. Served with white rice and dal.', kcal: 680, protein: 52 },
        { title: 'Evening Snack', name: 'Whey Protein Shake & Almonds', desc: '1 scoop of whey protein mixed with water, paired with raw almonds and banana.', kcal: 350, protein: 30 },
        { title: 'Dinner', name: 'Grilled Fish & Steamed Sweet Potato', desc: 'Salmon or Basa fillet pan-grilled. Served with sweet potato mash.', kcal: 510, protein: 42 }
      ],
      'Eggetarian': [
        { title: 'Breakfast', name: 'Egg Omelette (3 Eggs) & Oats Bowl', desc: 'Omelette made with 3 whole eggs. Paired with a hot bowl of rolled oats in milk.', kcal: 525, protein: 30 },
        { title: 'Mid-Morning Snack', name: 'Egg Salad Sandwich', desc: '2 hard boiled eggs chopped and mixed with low-fat yogurt in multigrain bread.', kcal: 360, protein: 18 },
        { title: 'Lunch', name: 'Soya Chunks Curry & Quinoa', desc: 'High-protein soya chunks cooked in Indian gravy, served with quinoa and curd.', kcal: 610, protein: 38 },
        { title: 'Evening Snack', name: 'Whey Protein Shake & Almonds', desc: '1 scoop of whey protein, a medium banana, and 12 raw almonds.', kcal: 350, protein: 30 },
        { title: 'Dinner', name: 'Paneer Bhurji & 2 Multigrain Rotis', desc: 'Cottage cheese scrambled with onions, capsicum, and spices. Served with 2 rotis.', kcal: 540, protein: 26 }
      ]
    },
    'Body Recomposition': {
      'Veg': [
        { title: 'Breakfast', name: 'Soya Flour Cheela & Low-fat Paneer', desc: 'Pancakes made of high-protein soya flour, served with 100g paneer side.', kcal: 380, protein: 25 },
        { title: 'Mid-Morning Snack', name: 'Sprouts & Roasted Peanut Salad', desc: 'Seasoned green gram sprouts tossed with 20g of roasted peanuts, cucumber, onions.', kcal: 200, protein: 10 },
        { title: 'Lunch', name: 'Paneer Bhurji, Soya Chunks & 1 Roti', desc: 'Scrambled paneer and soya chunks cooked together. Served with 1 multigrain roti.', kcal: 480, protein: 35 },
        { title: 'Evening Snack', name: 'Roasted Paneer Cubes & Almonds', desc: 'Low-fat cottage cheese seasoned with black pepper and dry roasted. Paired with 10 almonds.', kcal: 320, protein: 18 },
        { title: 'Dinner', name: 'Dal Soup, Tofu Stir-fry & Quinoa', desc: 'Thick yellow dal soup, alongside 100g tofu sautéed in garlic, and a small cup of quinoa.', kcal: 350, protein: 24 }
      ],
      'Non-Veg': [
        { title: 'Breakfast', name: 'Egg White (3) + 1 Whole Egg Omelette', desc: 'Omelette cooked with minimal olive oil, served with 1 slice of toasted wheat bread.', kcal: 320, protein: 24 },
        { title: 'Mid-Morning Snack', name: 'Shredded Chicken Breast Salad', desc: '100g shredded boiled chicken breast mixed with salt, pepper, and fresh lime juice.', kcal: 220, protein: 25 },
        { title: 'Lunch', name: 'Grilled Chicken (150g) & Brown Rice', desc: 'Grilled chicken breast served with steamed brown rice and a side of sautéed broccoli.', kcal: 450, protein: 38 },
        { title: 'Evening Snack', name: 'Whey Protein Shake & Almonds', desc: '1 scoop of whey protein isolate in water, paired with a small handful of raw almonds.', kcal: 350, protein: 30 },
        { title: 'Dinner', name: 'Baked Fish Fillet & Lentil Broth', desc: '180g of baked white fish fillet served with a hot cup of tempered yellow split lentils.', kcal: 360, protein: 36 }
      ],
      'Eggetarian': [
        { title: 'Breakfast', name: '4 Egg Whites Scramble & 1 Toast', desc: 'Scrambled egg whites cooked with green chillies and carbon. Served with 1 slice of wheat toast.', kcal: 280, protein: 22 },
        { title: 'Mid-Morning Snack', name: 'Sprouts & Pomegranate Salad', desc: 'Seasoned green gram sprouts tossed with fresh pomegranate seeds, cucumber, and mint.', kcal: 120, protein: 6 },
        { title: 'Lunch', name: 'Egg Bhurji (3 eggs) & 1 Roti', desc: 'Scrambled eggs cooked in a standard onion-tomato masala. Served with 1 flatbread.', kcal: 410, protein: 24 },
        { title: 'Evening Snack', name: 'Whey Protein Shake & Roasted Paneer', desc: '1 scoop of whey protein in water, paired with 50g pan-seared paneer cubes.', kcal: 320, protein: 34 },
        { title: 'Dinner', name: 'Soya Chunks Salad & Lentil Soup', desc: 'Boiled soya chunks tossed with raw veggies, paired with a warm bowl of split pea dal.', kcal: 300, protein: 22 }
      ]
    },
    'Maintenance': {
      'Veg': [
        { title: 'Breakfast', name: 'Vegetable Oats Idli & Chutney', desc: '3 steamed idlis made of semolina, oats, and shredded vegetables. Served with coconut chutney.', kcal: 350, protein: 12 },
        { title: 'Mid-Morning Snack', name: 'Mixed Nuts & Fresh Apple', desc: 'A handful of raw walnuts and almonds paired with a crisp local green apple.', kcal: 210, protein: 5 },
        { title: 'Lunch', name: 'Dal Tadka, Paneer Bhurji & 2 Rotis', desc: 'Split pigeon pea (Toor dal) tempered with ghee and cumin, paneer scramble, and 2 thin rotis.', kcal: 520, protein: 20 },
        { title: 'Evening Snack', name: 'Hummus with Carrot & Cucumber Sticks', desc: 'Fresh chickpea paste mixed with tahini, olive oil, and garlic. Served with raw vegetable finger foods.', kcal: 180, protein: 6 },
        { title: 'Dinner', name: 'Moong Dal Khichdi & Curd', desc: 'One-pot comfort meal of rice and yellow lentils cooked with ghee and spices. Served with fresh curd.', kcal: 380, protein: 14 }
      ],
      'Non-Veg': [
        { title: 'Breakfast', name: 'Boiled Eggs & Avocado Wheat Toast', desc: '2 whole boiled eggs seasoned with salt and pepper, served over mashed avocado on wheat toast.', kcal: 380, protein: 16 },
        { title: 'Mid-Morning Snack', name: 'Greek Yogurt with Berries & Honey', desc: 'Thick, creamy plain yogurt topped with fresh strawberries, blueberries, and a drizzle of organic honey.', kcal: 190, protein: 12 },
        { title: 'Lunch', name: 'Fish Curry, Rice & Salad', desc: 'Fish cooked in a light mustard and coconut milk gravy. Served with white rice and green garden salad.', kcal: 540, protein: 34 },
        { title: 'Evening Snack', name: 'Grilled Chicken Skewers (100g)', desc: 'Skewers of chicken breast cubes marinated in curd, grilled on a pan. Seasoned with chaat masala.', kcal: 180, protein: 22 },
        { title: 'Dinner', name: 'Egg Bhurji (3 Eggs) & 1 Roti', desc: 'Indian-style scrambled eggs cooked with tomatoes, green chillies, and coriander. Served with 1 hot roti.', kcal: 410, protein: 24 }
      ],
      'Eggetarian': [
        { title: 'Breakfast', name: '2 Boiled Eggs & Whole Wheat Toast', desc: 'Two hard boiled eggs with a pinch of black pepper, served on 1 slice of toasted whole wheat bread.', kcal: 280, protein: 14 },
        { title: 'Mid-Morning Snack', name: 'Greek Yogurt with Banana & Honey', desc: '150g thick curd blended with sliced banana, topped with raw honey and chia seeds.', kcal: 210, protein: 11 },
        { title: 'Lunch', name: 'Paneer Bhurji, Dal & 2 Rotis', desc: 'Cottage cheese scramble, hot bowl of yellow split lentil dal, and 2 rotis.', kcal: 520, protein: 20 },
        { title: 'Evening Snack', name: 'Roasted Foxnuts (Makhana) & 1 Egg', desc: 'Dry-roasted popped lotus seeds, paired with one hard-boiled egg.', kcal: 180, protein: 8 },
        { title: 'Dinner', name: 'Moong Dal Khichdi & Curd', desc: 'Metabolic comfort bowl of lentils and rice, served with fresh low-fat curd.', kcal: 380, protein: 14 }
      ]
    }
  };

  const currentPlanMeals = dietData[goal]?.[type] || dietData['Maintenance']['Veg'];

  // Calculate meal total macros
  const mealCalories = currentPlanMeals.reduce((acc, m) => acc + m.kcal, 0);
  const mealProtein = currentPlanMeals.reduce((acc, m) => acc + m.protein, 0);

  const handleSaveClick = () => {
    localStorage.setItem('fitai_user_age', String(age));
    localStorage.setItem('fitai_user_gender', gender);
    localStorage.setItem('fitai_user_height', String(height));
    localStorage.setItem('fitai_user_weight', String(weight));
    localStorage.setItem('fitai_user_goal_weight', String(goalWeight));
    localStorage.setItem('fitai_user_activity', activity);
    localStorage.setItem('fitai_diet_subgoal', selectedSubGoal);

    let expectedChangeText = '0.00 kg / week';
    if (goal === 'Fat Loss') {
      if (selectedSubGoal === 'Mild Deficit') expectedChangeText = '-0.25 kg / week';
      else if (selectedSubGoal === 'Moderate Deficit') expectedChangeText = '-0.50 kg / week';
      else if (selectedSubGoal === 'Aggressive Deficit') expectedChangeText = '-0.75 kg / week';
    } else if (goal === 'Muscle Gain') {
      if (selectedSubGoal === 'Lean Bulk') expectedChangeText = '+0.25 kg / week';
      else expectedChangeText = '+0.50 kg / week';
    } else if (goal === 'Body Recomposition') {
      expectedChangeText = 'Gradual Recomposition';
    }

    onSaveDiet({
      goal,
      type,
      calories: targetCalories,
      protein: targetProtein,
      carbs: targetCarbs,
      fats: targetFats,
      age,
      weight,
      height,
      goalWeight,
      gender,
      activity,
      subGoalName: selectedSubGoal,
      expectedChange: expectedChangeText
    });
    
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    handleToggleEditBiomarkers(false);
  };

  const isSavedPlan = savedGoal === goal && savedType === type && savedCalories === targetCalories;

  return (
    <section id="nutrition" className="relative py-24 overflow-hidden border-t border-white/5 bg-[#05020c]">
      <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] bg-brand-lime/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] bg-brand-cyan/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-brand-lime/10 border border-brand-lime/20 px-3.5 py-1 rounded-full text-brand-lime font-semibold text-xs tracking-wider uppercase"
          >
            Nutrition Engine
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-white"
          >
            AI Caloric Calculator & Indian Diet Planner
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Establish safety-checked caloric guidelines based on BMR, TDEE, and activity levels.
          </motion.p>
        </div>

        {/* 1. EDUCATIONAL GUIDE BY BODY WEIGHT CARD (Added requirement) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto mb-12">
          <div className="lg:col-span-12 bg-dark-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-xl text-left space-y-6">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Scale className="h-4.5 w-4.5 text-brand-lime" /> Calorie Guide by Body Weight (Educational Estimates)
            </h3>
            
            <p className="text-xs text-zinc-400 font-normal leading-relaxed">
              "Most adults generally require between 1,600 and 3,000 calories per day depending on age, gender, body weight, height, and activity level." Use this calculator to see moderately active averages.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Est Gender Selector */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Select Gender</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEstGender('Male')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      estGender === 'Male'
                        ? 'bg-brand-lime/20 border-brand-lime text-brand-lime'
                        : 'bg-dark-950 border-white/5 text-zinc-500'
                    }`}
                  >
                    Adult Men
                  </button>
                  <button
                    onClick={() => setEstGender('Female')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      estGender === 'Female'
                        ? 'bg-brand-lime/20 border-brand-lime text-brand-lime'
                        : 'bg-dark-950 border-white/5 text-zinc-500'
                    }`}
                  >
                    Adult Women
                  </button>
                </div>
              </div>

              {/* Est Weight Input */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Estimated Body Weight (kg)</span>
                <input
                  type="number"
                  min="40"
                  max="130"
                  value={estWeight}
                  onChange={(e) => setEstWeight(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-lime"
                />
              </div>

              {/* Est Activity level */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Activity Level Adjustment</span>
                <select
                  value={estActivity}
                  onChange={(e) => setEstActivity(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-lime"
                >
                  <option value="Sedentary">Sedentary (Decrease by 10-15%)</option>
                  <option value="Moderately Active">Moderately Active (Standard)</option>
                  <option value="Very Active">Very Active (Increase by 10-20%)</option>
                  <option value="Athlete/Highly Active">Athlete / Highly Active (Increase by 20-30%)</option>
                </select>
              </div>
            </div>

            {/* Results cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-dark-950/60 p-4 rounded-xl border border-white/5">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Estimated Maintenance Energy Range:</span>
                <span className="text-lg font-display font-black text-brand-lime mt-1 block">
                  {estRange.min} – {estRange.max} <span className="text-xs text-zinc-400 font-semibold">kcal/day</span>
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed self-center">
                *Note: These ranges are general educational guidelines only. Final training calories must always be calculated using personalized metabolic diagnostics below.
              </p>
            </div>
          </div>
        </div>

        {/* 2. PERSONALIZED CALORIC CALCULATOR PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto mb-12">
          
          {/* LEFT: Biomarker Form Inputs (5 Columns) */}
          <div className={`lg:col-span-5 bg-dark-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-xl flex flex-col justify-between space-y-5 text-left shadow-glass ${isEditingBiomarkers ? 'block' : 'hidden lg:flex'}`}>
            {/* Mobile Prominent Back Button */}
            <div className="lg:hidden flex items-center mb-2">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-white font-black text-xs uppercase tracking-wider transition-colors min-h-[44px] min-w-[44px] py-3 px-4 bg-dark-950 border border-white/5 rounded-xl shadow-glass"
              >
                <ArrowLeft className="h-4.5 w-4.5 text-brand-cyan" /> Back to Diet Plan
              </button>
            </div>
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Compass className="h-4.5 w-4.5 text-brand-lime" /> Personalized Biomarkers
            </h3>

            {/* Form row: Age & Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Age (Years)</label>
                <input
                  type="number"
                  min="12"
                  max="90"
                  value={age}
                  onChange={(e) => setAge(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-lime"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setGender('Male')}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                      gender === 'Male'
                        ? 'bg-brand-lime/20 border-brand-lime text-brand-lime'
                        : 'bg-dark-950 border-white/5 text-zinc-500'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    onClick={() => setGender('Female')}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                      gender === 'Female'
                        ? 'bg-brand-lime/20 border-brand-lime text-brand-lime'
                        : 'bg-dark-950 border-white/5 text-zinc-500'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>
            </div>

            {/* Form row: Height & Current Weight */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Height (cm)</label>
                <input
                  type="number"
                  min="100"
                  max="250"
                  value={height}
                  onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-lime"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Current Weight (kg)</label>
                <input
                  type="number"
                  min="30"
                  max="200"
                  value={weight}
                  onChange={(e) => setWeight(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-lime"
                />
              </div>
            </div>

            {/* Form row: Goal Weight */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Goal Target Weight (kg)</label>
              <input
                type="number"
                min="30"
                max="200"
                value={goalWeight}
                onChange={(e) => setGoalWeight(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-lime"
              />
            </div>

            {/* Form row: Activity Level */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Activity Level</label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-lime"
              >
                {activities.map((act) => (
                  <option key={act} value={act} className="bg-dark-950">
                    {act}
                  </option>
                ))}
              </select>
            </div>

            {/* Form row: Food preference */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Dietary Preference</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setType('Veg')}
                  className={`py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all border flex items-center justify-center gap-1 ${
                    type === 'Veg'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-dark-950 border-white/5 text-zinc-500'
                  }`}
                >
                  <Leaf className="h-3.5 w-3.5" /> Veg
                </button>
                <button
                  onClick={() => setType('Non-Veg')}
                  className={`py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all border flex items-center justify-center gap-1 ${
                    type === 'Non-Veg'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                      : 'bg-dark-950 border-white/5 text-zinc-500'
                  }`}
                >
                  <Bone className="h-3.5 w-3.5" /> Non-Veg
                </button>
                <button
                  onClick={() => setType('Eggetarian')}
                  className={`py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all border flex items-center justify-center gap-1 ${
                    type === 'Eggetarian'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : 'bg-dark-950 border-white/5 text-zinc-500'
                  }`}
                >
                  <Apple className="h-3.5 w-3.5" /> Egg-only
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Output Calorie splits & Macro gauges (7 Columns) */}
          <div className={`lg:col-span-7 bg-dark-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-xl flex flex-col justify-between space-y-6 text-left shadow-glass ${isEditingBiomarkers ? 'hidden lg:flex' : 'block'}`}>
            {/* Mobile Edit Button */}
            <div className="lg:hidden mb-4">
              <button
                type="button"
                onClick={() => handleToggleEditBiomarkers(true)}
                className="w-full py-3.5 bg-gradient-to-r from-brand-lime to-brand-cyan text-dark-950 text-xs font-black rounded-xl shadow-glow-lime uppercase tracking-wider text-center block min-h-[44px]"
              >
                Edit Biomarkers / Recalculate Plan
              </button>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-brand-cyan" /> Metabolic Diagnostics
              </h3>
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Mifflin-St Jeor</span>
            </div>

            {/* Target Goals grid */}
            <div className="space-y-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">1. Select Target Goal</span>
              <div className="flex flex-wrap gap-2">
                {goals.map((g) => (
                  <button
                    key={g}
                    onClick={() => handleGoalTabChange(g)}
                    className={`px-3.5 py-2 rounded-xl text-[10px] sm:text-xs font-bold border transition-all ${
                      goal === g
                        ? 'bg-brand-lime/20 border-brand-lime text-brand-lime shadow-inner'
                        : 'bg-dark-950 border-white/5 text-zinc-500 hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Subgoal Specific Target Card selectors */}
            <div className="space-y-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">2. Select Recommended Intakes</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {goal === 'Fat Loss' && (
                  <>
                    <button
                      onClick={() => setSelectedSubGoal('Mild Deficit')}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between ${
                        selectedSubGoal === 'Mild Deficit'
                          ? 'bg-brand-lime/10 border-brand-lime text-white'
                          : 'bg-dark-950 border-white/5 text-zinc-400'
                      }`}
                    >
                      <span className="text-xs font-bold">Mild Deficit</span>
                      <span className="text-[10px] text-zinc-500 mt-1 block">TDEE - 250 kcal</span>
                      <span className="text-[9px] text-brand-lime font-bold mt-0.5 block">-0.25 kg / week</span>
                    </button>
                    <button
                      onClick={() => setSelectedSubGoal('Moderate Deficit')}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between ${
                        selectedSubGoal === 'Moderate Deficit'
                          ? 'bg-brand-lime/10 border-brand-lime text-white'
                          : 'bg-dark-950 border-white/5 text-zinc-400'
                      }`}
                    >
                      <span className="text-xs font-bold">Moderate Deficit</span>
                      <span className="text-[10px] text-zinc-500 mt-1 block">TDEE - 500 kcal</span>
                      <span className="text-[9px] text-brand-lime font-bold mt-0.5 block">-0.50 kg / week</span>
                    </button>
                    <button
                      onClick={() => setSelectedSubGoal('Aggressive Deficit')}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between ${
                        selectedSubGoal === 'Aggressive Deficit'
                          ? 'bg-brand-lime/10 border-brand-lime text-white'
                          : 'bg-dark-950 border-white/5 text-zinc-400'
                      }`}
                    >
                      <span className="text-xs font-bold text-rose-400">Aggressive Deficit</span>
                      <span className="text-[10px] text-zinc-500 mt-1 block">TDEE - 750 kcal</span>
                      <span className="text-[9px] text-rose-400 font-bold mt-0.5 block">-0.75 kg / week</span>
                    </button>
                  </>
                )}

                {goal === 'Muscle Gain' && (
                  <>
                    <button
                      onClick={() => setSelectedSubGoal('Lean Bulk')}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between ${
                        selectedSubGoal === 'Lean Bulk'
                          ? 'bg-brand-lime/10 border-brand-lime text-white'
                          : 'bg-dark-950 border-white/5 text-zinc-400'
                      }`}
                    >
                      <span className="text-xs font-bold">Lean Bulk</span>
                      <span className="text-[10px] text-zinc-500 mt-1 block">TDEE + 250 kcal</span>
                      <span className="text-[9px] text-brand-lime font-bold mt-0.5 block">+0.25 kg / week</span>
                    </button>
                    <button
                      onClick={() => setSelectedSubGoal('Moderate Bulk')}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between ${
                        selectedSubGoal === 'Moderate Bulk'
                          ? 'bg-brand-lime/10 border-brand-lime text-white'
                          : 'bg-dark-950 border-white/5 text-zinc-400'
                      }`}
                    >
                      <span className="text-xs font-bold">Moderate Bulk</span>
                      <span className="text-[10px] text-zinc-500 mt-1 block">TDEE + 500 kcal</span>
                      <span className="text-[9px] text-brand-lime font-bold mt-0.5 block">+0.50 kg / week</span>
                    </button>
                  </>
                )}

                {goal === 'Maintenance' && (
                  <button
                    className="p-3 rounded-xl border text-left flex flex-col justify-between bg-brand-lime/10 border-brand-lime text-white col-span-3"
                    disabled
                  >
                    <span className="text-xs font-bold">Standard Maintenance</span>
                    <span className="text-[10px] text-zinc-400 mt-1">Required calories to maintain current weight.</span>
                    <span className="text-[9px] text-brand-lime font-bold mt-0.5">TDEE calories</span>
                  </button>
                )}

                {goal === 'Body Recomposition' && (
                  <button
                    className="p-3 rounded-xl border text-left flex flex-col justify-between bg-brand-lime/10 border-brand-lime text-white col-span-3"
                    disabled
                  >
                    <span className="text-xs font-bold">Body Recomposition</span>
                    <span className="text-[10px] text-zinc-400 mt-1">Slight deficit of -150 kcal. Focus on fat loss with concurrent muscle building.</span>
                    <span className="text-[9px] text-brand-lime font-bold mt-0.5">TDEE - 150 kcal</span>
                  </button>
                )}
              </div>
            </div>

            {/* BMR / TDEE baseline outputs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-dark-950/60 border border-white/5 rounded-xl">
                <span className="text-[9px] text-zinc-500 font-bold uppercase block">BMR Baseline</span>
                <span className="text-xl font-display font-black text-white">{bmr} <span className="text-[10px] text-zinc-400 font-semibold">kcal</span></span>
              </div>
              <div className="p-4 bg-dark-950/60 border border-white/5 rounded-xl">
                <span className="text-[9px] text-zinc-500 font-bold uppercase block">TDEE (Maintenance)</span>
                <span className="text-xl font-display font-black text-white">{tdee} <span className="text-[10px] text-zinc-400 font-semibold">kcal</span></span>
              </div>
              <div className="p-4 bg-gradient-to-br from-brand-lime/10 to-brand-cyan/5 border border-brand-lime/30 rounded-xl col-span-2 sm:col-span-1">
                <span className="text-[9px] text-brand-lime font-black uppercase block">Target Intake</span>
                <span className="text-xl font-display font-black text-white flex items-center gap-1">
                  <Flame className="h-4 w-4 text-orange-400 animate-pulse" /> {targetCalories} <span className="text-[10px] text-zinc-400 font-semibold">kcal</span>
                </span>
              </div>
            </div>

            {/* SAFETY WARNING BANNER */}
            {safetyWarning && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl flex items-start gap-2 text-xs">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Safety Rule Triggered:</span>
                  <p className="mt-0.5 text-[11px] font-normal leading-relaxed">{safetyWarning}</p>
                </div>
              </div>
            )}

            {!safetyWarning && (
              <div className="p-3.5 bg-brand-lime/10 border border-brand-lime/20 text-brand-lime rounded-xl flex items-start gap-2 text-[10px] font-semibold">
                <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                <p>For healthy and sustainable progress, aim for a gradual weight change of approximately 0.25–0.75 kg per week.</p>
              </div>
            )}

            {/* Macros chart progress */}
            <div className="space-y-3">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Daily Personal Macro Targets</span>
              
              <div className="grid grid-cols-3 gap-4">
                {/* Protein */}
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs font-semibold">
                    <span className="text-zinc-500">Protein</span>
                    <span className="text-brand-lime font-bold">{targetProtein}g</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-lime h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                  <span className="text-[9px] text-zinc-500 block">{(targetProtein * 4)} kcal ({Math.round(((targetProtein * 4) / targetCalories) * 100)}%)</span>
                </div>

                {/* Carbs */}
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs font-semibold">
                    <span className="text-zinc-500">Carbs</span>
                    <span className="text-brand-cyan font-bold">{targetCarbs}g</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-cyan h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                  <span className="text-[9px] text-zinc-500 block">{(targetCarbs * 4)} kcal ({Math.round(((targetCarbs * 4) / targetCalories) * 100)}%)</span>
                </div>

                {/* Fats */}
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs font-semibold">
                    <span className="text-zinc-500">Fats</span>
                    <span className="text-brand-pink font-bold">{targetFats}g</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-pink h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                  <span className="text-[9px] text-zinc-500 block">{(targetFats * 9)} kcal ({Math.round(((targetFats * 9) / targetCalories) * 100)}%)</span>
                </div>
              </div>
            </div>

            {/* Sync Save Button */}
            <div>
              <button
                onClick={handleSaveClick}
                className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                  isSavedPlan
                    ? 'bg-brand-lime/20 border-brand-lime text-brand-lime'
                    : 'bg-gradient-to-r from-brand-lime to-brand-cyan text-dark-950 border-transparent font-black shadow-md hover:scale-[1.01]'
                }`}
              >
                {savedSuccess ? (
                  <>
                    <Check className="h-4 w-4" /> Save Success! Synced with dashboard
                  </>
                ) : isSavedPlan ? (
                  <>
                    <Check className="h-4 w-4" /> Personal Plan Synced
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save & Sync Customized Plan
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

        {/* Meal cards container */}
        <div className="text-left max-w-6xl mx-auto mb-8 flex justify-between items-center border-b border-white/5 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Apple className="h-5 w-5 text-brand-lime" /> Localized Indian Meal Guide ({type})
          </h3>
          <span className="text-xs text-zinc-500 font-bold">Total Meal Plan: {mealCalories} kcal • {mealProtein}g protein</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${goal}-${type}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-7xl mx-auto text-left"
          >
            {currentPlanMeals.map((meal, idx) => (
              <SpotlightCard key={idx} className="flex flex-col justify-between p-5 border-white/5 hover:border-brand-lime/20 h-full">
                <div className="space-y-4">
                  {/* Meal Tag */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-widest text-brand-lime uppercase bg-brand-lime/10 px-2.5 py-0.5 rounded-full">
                      {meal.title}
                    </span>
                    <Apple className="h-4 w-4 text-zinc-600 group-hover:text-brand-lime transition-colors" />
                  </div>

                  {/* Meal Info */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-display font-extrabold text-white leading-tight min-h-[40px] group-hover:text-brand-lime transition-colors">
                      {meal.name}
                    </h3>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-normal min-h-[72px]">
                      {meal.desc}
                    </p>
                  </div>
                </div>

                {/* Macros details */}
                <div className="pt-4 border-t border-white/5 mt-4 space-y-2 text-xs font-semibold text-zinc-400">
                  <div className="flex justify-between items-center">
                    <span>Calories:</span>
                    <span className="text-white font-bold">{meal.kcal} kcal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Protein:</span>
                    <span className="text-brand-lime font-bold">{meal.protein}g</span>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
};
