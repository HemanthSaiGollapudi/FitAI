export interface ExerciseDetails {
  id: string;
  name: string;
  group: 'Chest' | 'Triceps' | 'Back' | 'Shoulders' | 'Biceps' | 'Legs' | 'Abs' | 'Calisthenics' | 'Flexibility';
  equipment: 'Barbell' | 'Dumbbells' | 'Cables' | 'Machine' | 'Bodyweight' | 'Bands' | 'None';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  compound: boolean;
  target: string;
  desc: string;
  form: string[];
  mistakes: string[];
  setsReps: string;
  alternative: string;
  videoUrl: string;
  backupVideoUrl: string;
}

export const EXERCISE_DATABASE: ExerciseDetails[] = [
  // ==================== CHEST ====================
  {
    id: 'flat-bb-press',
    name: 'Flat Bench Press',
    group: 'Chest',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    compound: true,
    target: 'Lower & Mid Pectorals',
    desc: 'The gold standard chest developer using a barbell on a flat bench.',
    form: [
      'Lie flat on the bench, feet pinned flat on the floor.',
      'Grip the bar slightly wider than shoulder-width.',
      'Lower the bar to your mid-chest, keeping elbows at 45 degrees.',
      'Press the bar back up dynamically, squeezing the chest.'
    ],
    mistakes: [
      'Flaring elbows out to 90 degrees, overloading the rotator cuffs.',
      'Bouncing the bar off the chest at the bottom.',
      'Lifting hips off the bench during the press.'
    ],
    setsReps: '4 Sets x 8 Reps',
    alternative: 'Flat Dumbbell Press',
    videoUrl: 'https://www.youtube.com/embed/gRVjAtPip0Y',
    backupVideoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg'
  },
  {
    id: 'inc-bb-press',
    name: 'Incline Bench Press',
    group: 'Chest',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    compound: true,
    target: 'Clavicular (Upper) Pectorals',
    desc: 'Barbell press performed on a 30 to 45 degree incline bench.',
    form: [
      'Set bench to 30-45 degrees. Arch slightly and retract scapula.',
      'Lower bar to upper chest / collarbone with control.',
      'Drive the bar straight up until arms are fully locked.'
    ],
    mistakes: [
      'Using too steep of an incline, shifting load to front deltoids.',
      'Half-repping or failing to touch the chest.'
    ],
    setsReps: '4 Sets x 8 Reps',
    alternative: 'Incline Dumbbell Press',
    videoUrl: 'https://www.youtube.com/embed/8iPOrhGxqqs',
    backupVideoUrl: 'https://www.youtube.com/embed/SrqOu55lrYU'
  },
  {
    id: 'dec-bb-press',
    name: 'Decline Bench Press',
    group: 'Chest',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    compound: true,
    target: 'Sternal (Lower) Pectorals',
    desc: 'Barbell press on a decline bench to target the lower chest fibers.',
    form: [
      'Secure feet in foot rollers and lie back on decline bench.',
      'Lower bar slowly to the lower chest line.',
      'Press up while keeping wrists aligned with forearms.'
    ],
    mistakes: [
      'Bouncing the bar or losing control at the bottom.',
      'Using a dangerous grip without wrapping thumbs.'
    ],
    setsReps: '3 Sets x 10 Reps',
    alternative: 'Decline Dumbbell Press',
    videoUrl: 'https://www.youtube.com/embed/LfyQBUKR8SE',
    backupVideoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg'
  },
  {
    id: 'flat-db-press',
    name: 'Flat Dumbbell Press',
    group: 'Chest',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    compound: true,
    target: 'Overall Pectorals',
    desc: 'Pressing dumbbells on a flat bench for a deeper stretch and unilateral chest tracking.',
    form: [
      'Sit on flat bench, dumbbells resting on knees.',
      'Lie back, kicking dumbbells up to chest level.',
      'Lower weights to chest sides, maintaining a neutral hand position.',
      'Press up and inward without clashing the weights.'
    ],
    mistakes: [
      'Touching the dumbbells at the top, removing tension.',
      'Dropping dumbbells to the sides abruptly, risking shoulder strains.'
    ],
    setsReps: '4 Sets x 10 Reps',
    alternative: 'Flat Bench Press',
    videoUrl: 'https://www.youtube.com/embed/VmB1G1K7v94',
    backupVideoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg'
  },
  {
    id: 'inc-db-press',
    name: 'Incline Dumbbell Press',
    group: 'Chest',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    compound: true,
    target: 'Upper Pectorals',
    desc: 'Unilateral incline dumbbell press to develop upper chest density.',
    form: [
      'Set bench to 30 degrees, lie back holding dumbbells at shoulder height.',
      'Press dumbbells up until arms are straight, keeping wrists straight.',
      'Lower slowly, feeling a deep stretch in the upper pectorals.'
    ],
    mistakes: [
      'Allowing dumbbells to drift too far forward.',
      'Arching back excessively to make it a flat press.'
    ],
    setsReps: '4 Sets x 10 Reps',
    alternative: 'Incline Bench Press',
    videoUrl: 'https://www.youtube.com/embed/8iPOrhGxqqs',
    backupVideoUrl: 'https://www.youtube.com/embed/SrqOu55lrYU'
  },
  {
    id: 'dec-db-press',
    name: 'Decline Dumbbell Press',
    group: 'Chest',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    compound: true,
    target: 'Lower Pectorals',
    desc: 'Lower chest pressing movements using dumbbells on a decline bench.',
    form: [
      'Lie back on decline, lower weights down slow.',
      'Keep shoulders packed, press up and squeeze lower chest.'
    ],
    mistakes: [
      'Short range of motion.',
      'Failing to control the descent.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Decline Bench Press',
    videoUrl: 'https://www.youtube.com/embed/LfyQBUKR8SE',
    backupVideoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg'
  },
  {
    id: 'seated-press-mach',
    name: 'Seated Chest Press Machine',
    group: 'Chest',
    equipment: 'Machine',
    difficulty: 'Beginner',
    compound: true,
    target: 'Mid Chest & Front Delts',
    desc: 'Fixed path machine chest press, great for high volume isolation safely.',
    form: [
      'Adjust seat height so handles align with mid-chest.',
      'Press handles forward fully without locking elbows.',
      'Return to starting point under control, feeling chest stretch.'
    ],
    mistakes: [
      'Letting weight stack slam down between reps.',
      'Hunching shoulders forward off back pad.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Flat Dumbbell Press',
    videoUrl: 'https://www.youtube.com/embed/nwpg40V9m_E',
    backupVideoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg'
  },
  {
    id: 'supported-press-mach',
    name: 'Chest Supported Press Machine',
    group: 'Chest',
    equipment: 'Machine',
    difficulty: 'Beginner',
    compound: true,
    target: 'Inner & Mid Chest',
    desc: 'Machine chest press with pad supporting your chest, removing back strain.',
    form: [
      'Sit facing chest pad, press handles away.',
      'Contract pectorals at full extension.'
    ],
    mistakes: [
      'Shrugging shoulders up.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Seated Chest Press Machine',
    videoUrl: 'https://www.youtube.com/embed/nwpg40V9m_E',
    backupVideoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg'
  },
  {
    id: 'pec-deck',
    name: 'Pec Deck Fly',
    group: 'Chest',
    equipment: 'Machine',
    difficulty: 'Beginner',
    compound: false,
    target: 'Inner Pectoral Squeeze',
    desc: 'Excellent machine isolation exercise to pump blood and contract inner chest.',
    form: [
      'Adjust seat so handles are at chest height, sit with back flush.',
      'Squeeze pads or handles together, keeping a slight elbow bend.',
      'Hold contraction for 1 second, then release slowly.'
    ],
    mistakes: [
      'Letting shoulders take over the movement.',
      'Over-extending shoulders at the bottom.'
    ],
    setsReps: '3 Sets x 15 Reps',
    alternative: 'Cable Fly',
    videoUrl: 'https://www.youtube.com/embed/Fyyda58-pOM',
    backupVideoUrl: 'https://www.youtube.com/embed/nwpg40V9m_E'
  },
  {
    id: 'db-fly',
    name: 'Dumbbell Fly',
    group: 'Chest',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    compound: false,
    target: 'Outer Chest & Squeeze',
    desc: 'Isolation flat dumbbell fly to stretch and develop chest width.',
    form: [
      'Lie on flat bench holding dumbbells above chest.',
      'Lower dumbbells in wide arc keeping elbow angle locked.',
      'Bring weights back up in hugging motion.'
    ],
    mistakes: [
      'Turning it into a press by bending elbows.',
      'Over-stretching too low, causing shoulder tears.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Cable Fly',
    videoUrl: 'https://www.youtube.com/embed/eGjt4lk6g34',
    backupVideoUrl: 'https://www.youtube.com/embed/VmB1G1K7v94'
  },
  {
    id: 'cable-fly-high-low',
    name: 'Cable Fly (High to Low)',
    group: 'Chest',
    equipment: 'Cables',
    difficulty: 'Intermediate',
    compound: false,
    target: 'Lower Chest Fibers',
    desc: 'Cable crossover pressing downward from top pulley position.',
    form: [
      'Set pulleys to highest slots. Grab attachments.',
      'Step forward, bend slightly, press hands down and forward.'
    ],
    mistakes: [
      'Letting cables pull shoulder joints back aggressively.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Decline Bench Press',
    videoUrl: 'https://www.youtube.com/embed/taI4XduLpKQ',
    backupVideoUrl: 'https://www.youtube.com/embed/gRVjAtPip0Y'
  },
  {
    id: 'cable-fly-mid',
    name: 'Cable Fly (Mid)',
    group: 'Chest',
    equipment: 'Cables',
    difficulty: 'Intermediate',
    compound: false,
    target: 'Inner & Sternal Chest',
    desc: 'Pulley crossover set at shoulder height for mid-chest isolation.',
    form: [
      'Set cables at chest height, step out, hug hands in front.'
    ],
    mistakes: [
      'Using momentum or swinging torso.'
    ],
    setsReps: '3 Sets x 15 Reps',
    alternative: 'Pec Deck Fly',
    videoUrl: 'https://www.youtube.com/embed/taI4XduLpKQ',
    backupVideoUrl: 'https://www.youtube.com/embed/gRVjAtPip0Y'
  },
  {
    id: 'cable-fly-low-high',
    name: 'Cable Fly (Low to High)',
    group: 'Chest',
    equipment: 'Cables',
    difficulty: 'Intermediate',
    compound: false,
    target: 'Upper Chest Fibers',
    desc: 'Cable crossover drawing from bottom pulley up to chin level.',
    form: [
      'Set pulleys at lowest point, raise hands up and inward.'
    ],
    mistakes: [
      'Using too much weight, overloading front delts.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Incline Bench Press',
    videoUrl: 'https://www.youtube.com/embed/taI4XduLpKQ',
    backupVideoUrl: 'https://www.youtube.com/embed/gRVjAtPip0Y'
  },

  // ==================== TRICEPS ====================
  {
    id: 'rope-pushdown',
    name: 'Rope Pushdown',
    group: 'Triceps',
    equipment: 'Cables',
    difficulty: 'Beginner',
    compound: false,
    target: 'Triceps (Lateral & Medial Head)',
    desc: 'High pulley cable extension using a rope attachment to flare triceps.',
    form: [
      'Set high pulley, lock elbows close to ribs.',
      'Extend arms downward, splitting the rope apart at the bottom.'
    ],
    mistakes: [
      'Allowing elbows to flare or travel forward.',
      'Using back swing momentum to push weight.'
    ],
    setsReps: '3 Sets x 15 Reps',
    alternative: 'Straight Bar Pushdown',
    videoUrl: 'https://www.youtube.com/embed/vB5OHsJ3EME',
    backupVideoUrl: 'https://www.youtube.com/embed/2-LAMgA91LU'
  },
  {
    id: 'straight-bar-pushdown',
    name: 'Straight Bar Pushdown',
    group: 'Triceps',
    equipment: 'Cables',
    difficulty: 'Beginner',
    compound: false,
    target: 'Triceps Long & Lateral Head',
    desc: 'Tricep pushdowns using a straight or angled metal bar.',
    form: [
      'Grip bar overhand, elbows locked by side, press down.'
    ],
    mistakes: [
      'Letting shoulders roll forward over the bar.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Rope Pushdown',
    videoUrl: 'https://www.youtube.com/embed/vB5OHsJ3EME',
    backupVideoUrl: 'https://www.youtube.com/embed/2-LAMgA91LU'
  },
  {
    id: 'rev-grip-pushdown',
    name: 'Reverse Grip Pushdown',
    group: 'Triceps',
    equipment: 'Cables',
    difficulty: 'Intermediate',
    compound: false,
    target: 'Triceps Medial Head',
    desc: 'Underhand grip pushdowns to isolate medial triceps fibers.',
    form: [
      'Grip bar with palms facing up, extend downward fully.'
    ],
    mistakes: [
      'Wrist bending under load.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Rope Pushdown',
    videoUrl: 'https://www.youtube.com/embed/vB5OHsJ3EME',
    backupVideoUrl: 'https://www.youtube.com/embed/2-LAMgA91LU'
  },
  {
    id: 'bench-dips',
    name: 'Bench Dips',
    group: 'Triceps',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    compound: true,
    target: 'Triceps & Shoulders',
    desc: 'Tricep dip performed with hands on bench behind body.',
    form: [
      'Place hands on bench, extend legs forward.',
      'Lower body by bending elbows to 90, push back up.'
    ],
    mistakes: [
      'Dropping too low, stressing front shoulder ligaments.'
    ],
    setsReps: '3 Sets x 15 Reps',
    alternative: 'Parallel Bar Dips',
    videoUrl: 'https://www.youtube.com/embed/0326dy_-CzM',
    backupVideoUrl: 'https://www.youtube.com/embed/2z8JmcrW-As'
  },
  {
    id: 'parallel-dips',
    name: 'Parallel Bar Dips',
    group: 'Triceps',
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    compound: true,
    target: 'Triceps & Lower Chest',
    desc: 'Hanging bodyweight dips on parallel bars focusing on tricep lock.',
    form: [
      'Keep torso upright (don\'t lean forward), lower body down, press up.'
    ],
    mistakes: [
      'Leaning forward too much (shifts to chest).'
    ],
    setsReps: '3 Sets x 10 Reps',
    alternative: 'Bench Dips',
    videoUrl: 'https://www.youtube.com/embed/2z8JmcrW-As',
    backupVideoUrl: 'https://www.youtube.com/embed/0326dy_-CzM'
  },
  {
    id: 'oh-db-ext',
    name: 'Overhead Dumbbell Extension',
    group: 'Triceps',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    compound: false,
    target: 'Triceps (Long Head)',
    desc: 'Overhead extensions to fully stretch and isolate the long head of the triceps.',
    form: [
      'Hold dumbbell overhead with both hands, lower behind head.',
      'Extend straight up overhead, keeping elbows packed inward.'
    ],
    mistakes: [
      'Elbows flaring too far outward, reducing target strain.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Overhead Cable Extension',
    videoUrl: 'https://www.youtube.com/embed/X-iV-CGGBt4',
    backupVideoUrl: 'https://www.youtube.com/embed/vB5OHsJ3EME'
  },
  {
    id: 'oh-cable-ext',
    name: 'Overhead Cable Extension',
    group: 'Triceps',
    equipment: 'Cables',
    difficulty: 'Intermediate',
    compound: false,
    target: 'Triceps Long Head',
    desc: 'Cable extensions pulling from a low pulley or high pulley overhead.',
    form: [
      'Face away from cable stack, extend rope forward overhead.'
    ],
    mistakes: [
      'Arching lower back excessively.'
    ],
    setsReps: '3 Sets x 15 Reps',
    alternative: 'Overhead Dumbbell Extension',
    videoUrl: 'https://www.youtube.com/embed/X-iV-CGGBt4',
    backupVideoUrl: 'https://www.youtube.com/embed/vB5OHsJ3EME'
  },
  {
    id: 'skull-crushers',
    name: 'Skull Crushers',
    group: 'Triceps',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    compound: false,
    target: 'Triceps Long Head',
    desc: 'Lying tricep extension using an EZ bar lowering to the forehead.',
    form: [
      'Lie on bench, hold bar over chest, lower to forehead by bending elbows.',
      'Extend elbows back to straight arm lockout.'
    ],
    mistakes: [
      'Dropping bar too fast (safety risk).',
      'Moving upper arms forward and back.'
    ],
    setsReps: '3 Sets x 10 Reps',
    alternative: 'Overhead Dumbbell Extension',
    videoUrl: 'https://www.youtube.com/embed/d_KZxkY_0cM',
    backupVideoUrl: 'https://www.youtube.com/embed/vB5OHsJ3EME'
  },
  {
    id: 'tricep-kickbacks',
    name: 'Tricep Kickbacks',
    group: 'Triceps',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    compound: false,
    target: 'Triceps Peak Contraction',
    desc: 'Leaning over a bench, extending a dumbbell backward to isolate triceps.',
    form: [
      'Lean over bench, elbow locked parallel to body, extend forearm back.'
    ],
    mistakes: [
      'Swinging upper arm to throw weight.'
    ],
    setsReps: '3 Sets x 15 Reps',
    alternative: 'Rope Pushdown',
    videoUrl: 'https://www.youtube.com/embed/6SS6K3lAwWI',
    backupVideoUrl: 'https://www.youtube.com/embed/vB5OHsJ3EME'
  },
  {
    id: 'close-grip-bench',
    name: 'Close Grip Bench Press',
    group: 'Triceps',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    compound: true,
    target: 'Triceps & Inner Chest',
    desc: 'Barbell press with narrow grip to overload tricep extension strength.',
    form: [
      'Grip bar shoulder-width, lower to lower chest, press up.'
    ],
    mistakes: [
      'Gripping too narrow (hurts wrists). Keep it shoulder-width.'
    ],
    setsReps: '4 Sets x 8 Reps',
    alternative: 'Flat Bench Press',
    videoUrl: 'https://www.youtube.com/embed/nEF0buYFsPs',
    backupVideoUrl: 'https://www.youtube.com/embed/gRVjAtPip0Y'
  },

  // ==================== BACK ====================
  {
    id: 'pullups-back',
    name: 'Pull-Ups',
    group: 'Back',
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    compound: true,
    target: 'Latissimus Dorsi (Lats)',
    desc: 'The benchmark back developer using a wide overhand grip.',
    form: [
      'Hang from bar with wide overhand grip.',
      'Pull chest up to the bar by driving elbows down.',
      'Control descent to dead hang position.'
    ],
    mistakes: [
      'Half-reps or using excessive leg kicking.',
      'Letting shoulders shrug at the bottom.'
    ],
    setsReps: '4 Sets x 8 Reps',
    alternative: 'Wide Grip Lat Pulldown',
    videoUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g',
    backupVideoUrl: 'https://www.youtube.com/embed/y2cO5S620r8'
  },
  {
    id: 'chinups-back',
    name: 'Chin-Ups',
    group: 'Back',
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    compound: true,
    target: 'Lats & Biceps',
    desc: 'Pull-up variation using an underhand (supinated) grip.',
    form: [
      'Underhand grip, pull chest to bar, lower slowly.'
    ],
    mistakes: [
      'Using momentum or swinging.'
    ],
    setsReps: '3 Sets x 8 Reps',
    alternative: 'Close Grip Lat Pulldown',
    videoUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g',
    backupVideoUrl: 'https://www.youtube.com/embed/y2cO5S620r8'
  },
  {
    id: 'wide-lat-pulldown',
    name: 'Wide Grip Lat Pulldown',
    group: 'Back',
    equipment: 'Machine',
    difficulty: 'Beginner',
    compound: true,
    target: 'Outer Latissimus Dorsi',
    desc: 'Machine pull targeting the back width using a wide bar.',
    form: [
      'Adjust knee pads, pull bar to upper chest, squeeze lats, return.'
    ],
    mistakes: [
      'Leaning back too far and using bodyweight to drag weight.'
    ],
    setsReps: '4 Sets x 10 Reps',
    alternative: 'Pull-Ups',
    videoUrl: 'https://www.youtube.com/embed/CAwf7n6Luuc',
    backupVideoUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g'
  },
  {
    id: 'close-lat-pulldown',
    name: 'Close Grip Lat Pulldown',
    group: 'Back',
    equipment: 'Machine',
    difficulty: 'Beginner',
    compound: true,
    target: 'Lower Lats & Mid Back',
    desc: 'Lat pulldowns using a V-bar or close neutral grip.',
    form: [
      'Attach V-bar, pull to chest, lean back slightly.'
    ],
    mistakes: [
      'Pulling bar down with arms rather than back muscles.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Wide Grip Lat Pulldown',
    videoUrl: 'https://www.youtube.com/embed/CAwf7n6Luuc',
    backupVideoUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g'
  },
  {
    id: 'tbar-row',
    name: 'T-Bar Row',
    group: 'Back',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    compound: true,
    target: 'Rhomboids & Traps',
    desc: 'Heavy rows using a landmine barbell loaded with weight plates.',
    form: [
      'Straddle bar, hinge at hips, pull bar to chest keeping elbows tucked.'
    ],
    mistakes: [
      'Rounding lower back (dangerous).',
      'Standing too upright.'
    ],
    setsReps: '4 Sets x 8 Reps',
    alternative: 'Bent Over Barbell Row',
    videoUrl: 'https://www.youtube.com/embed/KDbP2mH4w3g',
    backupVideoUrl: 'https://www.youtube.com/embed/vT2GjYhNO2w'
  },
  {
    id: 'bb-row',
    name: 'Bent Over Barbell Row',
    group: 'Back',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    compound: true,
    target: 'Overall Back Thickness',
    desc: 'Classic barbell pulling movement hinges at 45 degrees.',
    form: [
      'Hinge forward, pull bar to stomach, squeeze back, lower.'
    ],
    mistakes: [
      'Using lower back to swing weight.',
      'Rounding the thoracic spine.'
    ],
    setsReps: '4 Sets x 8 Reps',
    alternative: 'T-Bar Row',
    videoUrl: 'https://www.youtube.com/embed/vT2GjYhNO2w',
    backupVideoUrl: 'https://www.youtube.com/embed/KDbP2mH4w3g'
  },
  {
    id: 'pendlay-row',
    name: 'Pendlay Row',
    group: 'Back',
    equipment: 'Barbell',
    difficulty: 'Advanced',
    compound: true,
    target: 'Mid & Upper Back Power',
    desc: 'Strict barbell row where the weight settles on the floor on each rep.',
    form: [
      'Back parallel to floor, pull bar explosively to upper abs, return to floor.'
    ],
    mistakes: [
      'Lifting torso upright during row.'
    ],
    setsReps: '3 Sets x 6 Reps',
    alternative: 'Bent Over Barbell Row',
    videoUrl: 'https://www.youtube.com/embed/vT2GjYhNO2w',
    backupVideoUrl: 'https://www.youtube.com/embed/KDbP2mH4w3g'
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    group: 'Back',
    equipment: 'Cables',
    difficulty: 'Beginner',
    compound: true,
    target: 'Mid Back & Rhomboids',
    desc: 'Horizontal cable row using close grip attachment.',
    form: [
      'Sit, hinge back, pull attachment to abs, contract scapula.'
    ],
    mistakes: [
      'Leaning back and forth excessively.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Chest Supported Row',
    videoUrl: 'https://www.youtube.com/embed/GZbfZ033f64',
    backupVideoUrl: 'https://www.youtube.com/embed/vT2GjYhNO2w'
  },
  {
    id: 'supported-row-mach',
    name: 'Chest Supported Row',
    group: 'Back',
    equipment: 'Machine',
    difficulty: 'Beginner',
    compound: true,
    target: 'Rhomboids & Lower Traps',
    desc: 'Machine row chest pressed to pad, removing lower back stress completely.',
    form: [
      'Sit facing pads, pull handles back fully.'
    ],
    mistakes: [
      'Lifting chest off pad.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Seated Cable Row',
    videoUrl: 'https://www.youtube.com/embed/GZbfZ033f64',
    backupVideoUrl: 'https://www.youtube.com/embed/vT2GjYhNO2w'
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    group: 'Back',
    equipment: 'Barbell',
    difficulty: 'Advanced',
    compound: true,
    target: 'Posterior Chain (Glutes, Hamstrings, Spinal Erectors)',
    desc: 'The king of posterior chain developers. Pulling dead weight from floor.',
    form: [
      'Feet hip-width, bar close to shins, flat back.',
      'Drive legs into floor, stand tall, lock hips.'
    ],
    mistakes: [
      'Rounding the lower back (herniation danger).',
      'Shrugging wrists at the top.'
    ],
    setsReps: '3 Sets x 5 Reps',
    alternative: 'Romanian Deadlift',
    videoUrl: 'https://www.youtube.com/embed/XxWcirHIwVo',
    backupVideoUrl: 'https://www.youtube.com/embed/op9kuPf8Yf8'
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    group: 'Back',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    compound: true,
    target: 'Hamstrings & Glutes',
    desc: 'Hinging at hips, keeping legs semi-straight to overload hamstring stretch.',
    form: [
      'Bar close, push hips back, lower bar below knees, squeeze glutes to stand.'
    ],
    mistakes: [
      'Bending knees too much (turns into a squat).',
      'Letting bar drift forward away from shins.'
    ],
    setsReps: '4 Sets x 10 Reps',
    alternative: 'Deadlift',
    videoUrl: 'https://www.youtube.com/embed/op9kuPf8Yf8',
    backupVideoUrl: 'https://www.youtube.com/embed/XxWcirHIwVo'
  },
  {
    id: 'hyperextensions',
    name: 'Hyperextensions',
    group: 'Back',
    equipment: 'None',
    difficulty: 'Beginner',
    compound: true,
    target: 'Lower Back & Glutes',
    desc: 'Lower back extension using a 45 degree bench.',
    form: [
      'Hinge forward, raise chest up aligning spine, squeeze glutes.'
    ],
    mistakes: [
      'Over-extending and arching spine past flat line.'
    ],
    setsReps: '3 Sets x 15 Reps',
    alternative: 'Romanian Deadlift',
    videoUrl: 'https://www.youtube.com/embed/op9kuPf8Yf8',
    backupVideoUrl: 'https://www.youtube.com/embed/XxWcirHIwVo'
  },

  // ==================== SHOULDERS ====================
  {
    id: 'military-press',
    name: 'Military Press',
    group: 'Shoulders',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    compound: true,
    target: 'Anterior (Front) Deltoid',
    desc: 'Strict standing barbell overhead press.',
    form: [
      'Feet shoulder-width, rack bar on chest, press up overhead, lock out.'
    ],
    mistakes: [
      'Leaning back too far, using chest to push.',
      'Flaring elbows out to side.'
    ],
    setsReps: '4 Sets x 6 Reps',
    alternative: 'Seated Dumbbell Press',
    videoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI',
    backupVideoUrl: 'https://www.youtube.com/embed/qEwKCR5JCog'
  },
  {
    id: 'seated-db-press',
    name: 'Seated Dumbbell Press',
    group: 'Shoulders',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    compound: true,
    target: 'Front & Side Deltoid',
    desc: 'Overhead dumbbell press performed on a vertical bench.',
    form: [
      'Sit, hold weights at shoulders, press up until arms straight.'
    ],
    mistakes: [
      'Letting weights collide at the top.',
      'Failing to control the descent.'
    ],
    setsReps: '4 Sets x 10 Reps',
    alternative: 'Military Press',
    videoUrl: 'https://www.youtube.com/embed/qEwKCR5JCog',
    backupVideoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI'
  },
  {
    id: 'front-raises',
    name: 'Front Raises',
    group: 'Shoulders',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    compound: false,
    target: 'Anterior Delts',
    desc: 'Lifting dumbbells forward to isolate the front of the shoulders.',
    form: [
      'Hold weights at thighs, raise straight arms forward to eye level.'
    ],
    mistakes: [
      'Using leg swing to launch weights.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Seated Dumbbell Press',
    videoUrl: 'https://www.youtube.com/embed/qEwKCR5JCog',
    backupVideoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI'
  },
  {
    id: 'db-lat-raise',
    name: 'Dumbbell Lateral Raises',
    group: 'Shoulders',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    compound: false,
    target: 'Lateral (Side) Deltoid',
    desc: 'Lifting dumbbells out to sides to build shoulder width.',
    form: [
      'Slight forward lean, raise arms to sides, lead with elbows, pinky up.'
    ],
    mistakes: [
      'Lifting weights above shoulder level.',
      'Using heavy weights and swinging body.'
    ],
    setsReps: '4 Sets x 15 Reps',
    alternative: 'Cable Lateral Raises',
    videoUrl: 'https://www.youtube.com/embed/3VcKaXvh3u8',
    backupVideoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI'
  },
  {
    id: 'cable-lat-raise',
    name: 'Cable Lateral Raises',
    group: 'Shoulders',
    equipment: 'Cables',
    difficulty: 'Intermediate',
    compound: false,
    target: 'Side Delts',
    desc: 'Lateral raises using a low pulley for constant muscle tension.',
    form: [
      'Pull cable across body sideways to shoulder height.'
    ],
    mistakes: [
      'Shrugging trap muscles up.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Dumbbell Lateral Raises',
    videoUrl: 'https://www.youtube.com/embed/3VcKaXvh3u8',
    backupVideoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI'
  },
  {
    id: 'mach-lat-raise',
    name: 'Machine Lateral Raises',
    group: 'Shoulders',
    equipment: 'Machine',
    difficulty: 'Beginner',
    compound: false,
    target: 'Side Delts',
    desc: 'Lateral raises using a specialized shoulder machine.',
    form: [
      'Sit, press pads outward, raise to horizontal level.'
    ],
    mistakes: [
      'Letting weights drop too fast.'
    ],
    setsReps: '3 Sets x 15 Reps',
    alternative: 'Dumbbell Lateral Raises',
    videoUrl: 'https://www.youtube.com/embed/3VcKaXvh3u8',
    backupVideoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI'
  },
  {
    id: 'rev-pec-deck',
    name: 'Reverse Pec Deck',
    group: 'Shoulders',
    equipment: 'Machine',
    difficulty: 'Beginner',
    compound: false,
    target: 'Posterior (Rear) Deltoid',
    desc: 'Seated rear delt fly using the pec deck machine reversed.',
    form: [
      'Sit facing machine pad, pull handles back in wide arc, squeeze rear delts.'
    ],
    mistakes: [
      'Bending elbows too much, transferring load to arms.'
    ],
    setsReps: '3 Sets x 15 Reps',
    alternative: 'Rear Delt Fly',
    videoUrl: 'https://www.youtube.com/embed/3VcKaXvh3u8',
    backupVideoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI'
  },
  {
    id: 'rear-delt-fly',
    name: 'Rear Delt Fly',
    group: 'Shoulders',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    compound: false,
    target: 'Rear Delts',
    desc: 'Bent-over rear delt flyes with dumbbells.',
    form: [
      'Hinge forward, lift weights out to sides with soft elbow bend.'
    ],
    mistakes: [
      'Throwing weights with lower back swing.'
    ],
    setsReps: '3 Sets x 15 Reps',
    alternative: 'Reverse Pec Deck',
    videoUrl: 'https://www.youtube.com/embed/3VcKaXvh3u8',
    backupVideoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI'
  },
  {
    id: 'face-pulls',
    name: 'Face Pulls',
    group: 'Shoulders',
    equipment: 'Cables',
    difficulty: 'Beginner',
    compound: true,
    target: 'Rear Delts & Rotator Cuff',
    desc: 'High cable rope pull to the face with external shoulder rotation.',
    form: [
      'Pull rope to ears, separate rope end, squeeze rear delts, hold.'
    ],
    mistakes: [
      'Pulling too fast without control.'
    ],
    setsReps: '3 Sets x 15 Reps',
    alternative: 'Reverse Pec Deck',
    videoUrl: 'https://www.youtube.com/embed/3VcKaXvh3u8',
    backupVideoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI'
  },
  {
    id: 'db-shrugs',
    name: 'Dumbbell Shrugs',
    group: 'Shoulders',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    compound: false,
    target: 'Upper Trapezius (Traps)',
    desc: 'Shrugging shoulders upward holding heavy dumbbells.',
    form: [
      'Stand, hold weights at sides, pull shoulders up to ears, squeeze.'
    ],
    mistakes: [
      'Rolling shoulders in circles (hurts joints). Only go straight up.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Barbell Shrugs',
    videoUrl: 'https://www.youtube.com/embed/g6qGBK796v8',
    backupVideoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI'
  },
  {
    id: 'bb-shrugs',
    name: 'Barbell Shrugs',
    group: 'Shoulders',
    equipment: 'Barbell',
    difficulty: 'Beginner',
    compound: false,
    target: 'Upper Traps',
    desc: 'Shrugging shoulders holding barbell in front of hips.',
    form: [
      'Hold bar overhand, shrug straight up, squeeze, lower.'
    ],
    mistakes: [
      'Bending elbows to pull bar.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Dumbbell Shrugs',
    videoUrl: 'https://www.youtube.com/embed/g6qGBK796v8',
    backupVideoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI'
  },

  // ==================== BICEPS ====================
  {
    id: 'ez-bar-curl',
    name: 'EZ Bar Curl',
    group: 'Biceps',
    equipment: 'Barbell',
    difficulty: 'Beginner',
    compound: false,
    target: 'Biceps Brachii',
    desc: 'Curling an EZ curl bar to develop biceps size with less wrist strain.',
    form: [
      'Stand, grip EZ bar on angled handles, curl up, squeeze, lower.'
    ],
    mistakes: [
      'Swinging torso or letting elbows drift forward.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Straight Bar Curl',
    videoUrl: 'https://www.youtube.com/embed/y2O7s-m11P4',
    backupVideoUrl: 'https://www.youtube.com/embed/i1YgFZmeilc'
  },
  {
    id: 'straight-bar-curl',
    name: 'Straight Bar Curl',
    group: 'Biceps',
    equipment: 'Barbell',
    difficulty: 'Beginner',
    compound: false,
    target: 'Biceps Brachii',
    desc: 'Standard straight bar biceps curl.',
    form: [
      'Hold bar underhand, curl up strictly without moving elbows.'
    ],
    mistakes: [
      'Using leg drive to throw weight.'
    ],
    setsReps: '3 Sets x 10 Reps',
    alternative: 'EZ Bar Curl',
    videoUrl: 'https://www.youtube.com/embed/i1YgFZmeilc',
    backupVideoUrl: 'https://www.youtube.com/embed/y2O7s-m11P4'
  },
  {
    id: 'alt-db-curl',
    name: 'Alternating Dumbbell Curl',
    group: 'Biceps',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    compound: false,
    target: 'Biceps Brachii',
    desc: 'Standing curls alternating arms and rotating wrists.',
    form: [
      'Start neutral grip, rotate palms up as you curl weight.'
    ],
    mistakes: [
      'Failing to supinate (rotate palm up).'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Incline Dumbbell Curl',
    videoUrl: 'https://www.youtube.com/embed/y2O7s-m11P4',
    backupVideoUrl: 'https://www.youtube.com/embed/i1YgFZmeilc'
  },
  {
    id: 'hammer-curl',
    name: 'Hammer Curl',
    group: 'Biceps',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    compound: false,
    target: 'Brachialis & Brachioradialis (Forearm)',
    desc: 'Curl using a neutral grip (palms facing each other) to build thickness.',
    form: [
      'Hold dumbbells at sides like hammers, curl up keeping palms facing.'
    ],
    mistakes: [
      'Swinging weights.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'EZ Bar Curl',
    videoUrl: 'https://www.youtube.com/embed/zC3nLlEvin4',
    backupVideoUrl: 'https://www.youtube.com/embed/y2O7s-m11P4'
  },
  {
    id: 'inc-db-curl',
    name: 'Incline Dumbbell Curl',
    group: 'Biceps',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    compound: false,
    target: 'Biceps Long Head (Outer)',
    desc: 'Seated curls on an incline bench to stretch the biceps long head.',
    form: [
      'Sit on 45-degree incline, let arms hang, curl up strictly.'
    ],
    mistakes: [
      'Letting elbows travel forward off vertical alignment.'
    ],
    setsReps: '3 Sets x 10 Reps',
    alternative: 'Alternating Dumbbell Curl',
    videoUrl: 'https://www.youtube.com/embed/y2O7s-m11P4',
    backupVideoUrl: 'https://www.youtube.com/embed/i1YgFZmeilc'
  },
  {
    id: 'conc-curl',
    name: 'Concentration Curl',
    group: 'Biceps',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    compound: false,
    target: 'Biceps Short Head Peak',
    desc: 'Seated bicep isolation leaning over with elbow pressed to inner thigh.',
    form: [
      'Sit, press elbow to thigh, curl weight up to face, squeeze peak.'
    ],
    mistakes: [
      'Using shoulders to pull.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Preacher Curl',
    videoUrl: 'https://www.youtube.com/embed/y2O7s-m11P4',
    backupVideoUrl: 'https://www.youtube.com/embed/i1YgFZmeilc'
  },
  {
    id: 'preacher-curl',
    name: 'Preacher Curl',
    group: 'Biceps',
    equipment: 'Machine',
    difficulty: 'Beginner',
    compound: false,
    target: 'Lower Biceps & Thickness',
    desc: 'Curls performed over a preacher bench to prevent shoulder assistance.',
    form: [
      'Place arms flat on preacher pad, curl bar or handles up.'
    ],
    mistakes: [
      'Fully locking out straight at bottom under heavy load (risks bicep tear).'
    ],
    setsReps: '3 Sets x 10 Reps',
    alternative: 'Spider Curl',
    videoUrl: 'https://www.youtube.com/embed/y2O7s-m11P4',
    backupVideoUrl: 'https://www.youtube.com/embed/i1YgFZmeilc'
  },
  {
    id: 'spider-curl',
    name: 'Spider Curl',
    group: 'Biceps',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    compound: false,
    target: 'Biceps Short Head',
    desc: 'Lying chest down on an incline bench, curling bar straight down.',
    form: [
      'Lie chest-down on incline bench, hang arms vertically, curl bar up.'
    ],
    mistakes: [
      'Swinging arms.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Preacher Curl',
    videoUrl: 'https://www.youtube.com/embed/y2O7s-m11P4',
    backupVideoUrl: 'https://www.youtube.com/embed/i1YgFZmeilc'
  },
  {
    id: 'cable-curl',
    name: 'Cable Curl',
    group: 'Biceps',
    equipment: 'Cables',
    difficulty: 'Beginner',
    compound: false,
    target: 'Biceps Constant Tension',
    desc: 'Standing curls using a low pulley cable bar.',
    form: [
      'Grip cable bar, curl up keeping elbows locked.'
    ],
    mistakes: [
      'Allowing weight stack to slam.'
    ],
    setsReps: '3 Sets x 15 Reps',
    alternative: 'Straight Bar Curl',
    videoUrl: 'https://www.youtube.com/embed/y2O7s-m11P4',
    backupVideoUrl: 'https://www.youtube.com/embed/i1YgFZmeilc'
  },

  // ==================== LEGS ====================
  {
    id: 'leg-ext',
    name: 'Leg Extensions',
    group: 'Legs',
    equipment: 'Machine',
    difficulty: 'Beginner',
    compound: false,
    target: 'Quadriceps (Quads)',
    desc: 'Machine leg extension isolating the quadriceps.',
    form: [
      'Sit in machine, extend legs straight, hold peak contraction, lower slowly.'
    ],
    mistakes: [
      'Letting the weights slam.',
      'Lifting hips off the seat.'
    ],
    setsReps: '3 Sets x 15 Reps',
    alternative: 'Hack Squat',
    videoUrl: 'https://www.youtube.com/embed/m0OdBUSJmEY',
    backupVideoUrl: 'https://www.youtube.com/embed/YyvSfV9dP30'
  },
  {
    id: 'hack-squat',
    name: 'Hack Squat',
    group: 'Legs',
    equipment: 'Machine',
    difficulty: 'Intermediate',
    compound: true,
    target: 'Quads & Glutes',
    desc: 'Machine squat sliding down a 45 degree track to isolate legs.',
    form: [
      'Shoulders against pads, squat down until thighs are parallel, press up.'
    ],
    mistakes: [
      'Lifting heels off foot plate.',
      'Locking out knees aggressively.'
    ],
    setsReps: '4 Sets x 10 Reps',
    alternative: 'Leg Press',
    videoUrl: 'https://www.youtube.com/embed/YyvSfV9dP30',
    backupVideoUrl: 'https://www.youtube.com/embed/m0OdBUSJmEY'
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    group: 'Legs',
    equipment: 'Machine',
    difficulty: 'Beginner',
    compound: true,
    target: 'Quads, Hamstrings & Glutes',
    desc: 'Pressing a heavy platform upward on a machine sled.',
    form: [
      'Place feet shoulder-width, lower platform down to 90 degrees, press up.'
    ],
    mistakes: [
      'Bringing knees too deep, rounding lower back off pad.',
      'Locking out knees fully.'
    ],
    setsReps: '4 Sets x 10 Reps',
    alternative: 'Hack Squat',
    videoUrl: 'https://www.youtube.com/embed/YyvSfV9dP30',
    backupVideoUrl: 'https://www.youtube.com/embed/m0OdBUSJmEY'
  },
  {
    id: 'front-squat',
    name: 'Front Squat',
    group: 'Legs',
    equipment: 'Barbell',
    difficulty: 'Advanced',
    compound: true,
    target: 'Quads & Core',
    desc: 'Barbell squat holding the bar on the front shoulders (rack position).',
    form: [
      'Rest bar on front delts, lift elbows, squat deep, stand tall.'
    ],
    mistakes: [
      'Dropping elbows, causing upper back rounding.'
    ],
    setsReps: '4 Sets x 6 Reps',
    alternative: 'Hack Squat',
    videoUrl: 'https://www.youtube.com/embed/YyvSfV9dP30',
    backupVideoUrl: 'https://www.youtube.com/embed/m0OdBUSJmEY'
  },
  {
    id: 'bulg-split-squat-legs',
    name: 'Bulgarian Split Squat',
    group: 'Legs',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    compound: true,
    target: 'Quads & Glutes',
    desc: 'Single leg squat with rear foot elevated on a bench.',
    form: [
      'Place back foot on bench, hold weights, lunge down deep, drive up.'
    ],
    mistakes: [
      'Letting front knee collapse inwards.'
    ],
    setsReps: '3 Sets x 12 Reps / leg',
    alternative: 'Walking Lunges',
    videoUrl: 'https://www.youtube.com/embed/2C-uNgKw12A',
    backupVideoUrl: 'https://www.youtube.com/embed/m0OdBUSJmEY'
  },
  {
    id: 'lying-leg-curl',
    name: 'Lying Leg Curl',
    group: 'Legs',
    equipment: 'Machine',
    difficulty: 'Beginner',
    compound: false,
    target: 'Hamstrings',
    desc: 'Lying leg curls on a bench to isolate hamstrings.',
    form: [
      'Lie flat, curl pads to glutes, squeeze, lower slowly.'
    ],
    mistakes: [
      'Arching lower back off pad.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Seated Leg Curl',
    videoUrl: 'https://www.youtube.com/embed/m0OdBUSJmEY',
    backupVideoUrl: 'https://www.youtube.com/embed/YyvSfV9dP30'
  },
  {
    id: 'seated-leg-curl',
    name: 'Seated Leg Curl',
    group: 'Legs',
    equipment: 'Machine',
    difficulty: 'Beginner',
    compound: false,
    target: 'Hamstrings',
    desc: 'Seated machine leg curls to isolate hamstrings.',
    form: [
      'Sit, press pad down behind ankles, squeeze hamstrings.'
    ],
    mistakes: [
      'Slouching forward.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Lying Leg Curl',
    videoUrl: 'https://www.youtube.com/embed/m0OdBUSJmEY',
    backupVideoUrl: 'https://www.youtube.com/embed/YyvSfV9dP30'
  },
  {
    id: 'sumo-squat',
    name: 'Sumo Squat',
    group: 'Legs',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    compound: true,
    target: 'Adductors, Inner Thighs & Glutes',
    desc: 'Squatting with a very wide stance and toes flared outward.',
    form: [
      'Wide stance, toes out, hold weight, squat down keeping knees out.'
    ],
    mistakes: [
      'Letting knees cave in.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Leg Press',
    videoUrl: 'https://www.youtube.com/embed/YyvSfV9dP30',
    backupVideoUrl: 'https://www.youtube.com/embed/m0OdBUSJmEY'
  },
  {
    id: 'hip-thrust',
    name: 'Hip Thrust',
    group: 'Legs',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    compound: true,
    target: 'Glutes (Maximus)',
    desc: 'Glute bridge with upper back elevated on bench and barbell over hips.',
    form: [
      'Back on bench, bar on hips, drive hips up to full lockout, squeeze glutes.'
    ],
    mistakes: [
      'Arching lower back rather than posterior pelvic tilting hips.',
      'Short range of motion.'
    ],
    setsReps: '4 Sets x 10 Reps',
    alternative: 'Sumo Squat',
    videoUrl: 'https://www.youtube.com/embed/SEdqeVa7-bs',
    backupVideoUrl: 'https://www.youtube.com/embed/YyvSfV9dP30'
  },
  {
    id: 'standing-calf-raise',
    name: 'Standing Calf Raise',
    group: 'Legs',
    equipment: 'Machine',
    difficulty: 'Beginner',
    compound: false,
    target: 'Gastrocnemius (Calves)',
    desc: 'Standing heel raises to stretch and contract the calf muscles.',
    form: [
      'Balls of feet on platform, drop heels low, push up fully onto toes.'
    ],
    mistakes: [
      'Bouncing or half-repping without pausing.'
    ],
    setsReps: '4 Sets x 15 Reps',
    alternative: 'Seated Calf Raise',
    videoUrl: 'https://www.youtube.com/embed/gW715v10N-M',
    backupVideoUrl: 'https://www.youtube.com/embed/m0OdBUSJmEY'
  },
  {
    id: 'seated-calf-raise',
    name: 'Seated Calf Raise',
    group: 'Legs',
    equipment: 'Machine',
    difficulty: 'Beginner',
    compound: false,
    target: 'Soleus (Calves)',
    desc: 'Calf raises performed seated, targeting the deeper soleus calf muscle.',
    form: [
      'Sit, place knees under pad, raise heels fully, hold.'
    ],
    mistakes: [
      'Rushing reps.'
    ],
    setsReps: '3 Sets x 15 Reps',
    alternative: 'Standing Calf Raise',
    videoUrl: 'https://www.youtube.com/embed/gW715v10N-M',
    backupVideoUrl: 'https://www.youtube.com/embed/m0OdBUSJmEY'
  },
  {
    id: 'leg-press-calf-raise',
    name: 'Leg Press Calf Raise',
    group: 'Legs',
    equipment: 'Machine',
    difficulty: 'Beginner',
    compound: false,
    target: 'Calves',
    desc: 'Calf press performed on the leg press sled.',
    form: [
      'Heels off bottom edge of platform, press platform using toes.'
    ],
    mistakes: [
      'Bending knees (takes stress off calves).'
    ],
    setsReps: '3 Sets x 15 Reps',
    alternative: 'Standing Calf Raise',
    videoUrl: 'https://www.youtube.com/embed/gW715v10N-M',
    backupVideoUrl: 'https://www.youtube.com/embed/m0OdBUSJmEY'
  },
  {
    id: 'abductor-mach',
    name: 'Hip Abductor Machine',
    group: 'Legs',
    equipment: 'Machine',
    difficulty: 'Beginner',
    compound: false,
    target: 'Outer Thighs & Glute Medius',
    desc: 'Seated machine pushes targeting the outer hips.',
    form: [
      'Sit, push pads outward, return under control.'
    ],
    mistakes: [
      'Slouching back.'
    ],
    setsReps: '3 Sets x 15 Reps',
    alternative: 'Walking Lunges',
    videoUrl: 'https://www.youtube.com/embed/m0OdBUSJmEY',
    backupVideoUrl: 'https://www.youtube.com/embed/YyvSfV9dP30'
  },
  {
    id: 'adductor-mach',
    name: 'Hip Adductor Machine',
    group: 'Legs',
    equipment: 'Machine',
    difficulty: 'Beginner',
    compound: false,
    target: 'Inner Thighs (Adductors)',
    desc: 'Seated machine squeezing pads together to target inner thighs.',
    form: [
      'Sit, squeeze pads inward to collide, return slow.'
    ],
    mistakes: [
      'Letting stacks collide aggressively.'
    ],
    setsReps: '3 Sets x 15 Reps',
    alternative: 'Sumo Squat',
    videoUrl: 'https://www.youtube.com/embed/m0OdBUSJmEY',
    backupVideoUrl: 'https://www.youtube.com/embed/YyvSfV9dP30'
  },
  {
    id: 'walking-lunges',
    name: 'Walking Lunges',
    group: 'Legs',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    compound: true,
    target: 'Quads, Glutes & Hamstrings',
    desc: 'Step-by-step walking lunges carrying dumbbells.',
    form: [
      'Step forward, lower hip down until back knee rests off floor, push up, step forward with other leg.'
    ],
    mistakes: [
      'Leaning forward excessively.',
      'Shuffling feet.'
    ],
    setsReps: '3 Sets x 12 Steps / leg',
    alternative: 'Bulgarian Split Squat',
    videoUrl: 'https://www.youtube.com/embed/m0OdBUSJmEY',
    backupVideoUrl: 'https://www.youtube.com/embed/YyvSfV9dP30'
  },
  {
    id: 'rev-lunges',
    name: 'Reverse Lunges',
    group: 'Legs',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    compound: true,
    target: 'Glutes & Quads',
    desc: 'Step backward into a lunge, easier on knees than forward lunges.',
    form: [
      'Step back, lower body down, push off front heel to return.'
    ],
    mistakes: [
      'Letting front knee wobble.'
    ],
    setsReps: '3 Sets x 10 Reps / leg',
    alternative: 'Walking Lunges',
    videoUrl: 'https://www.youtube.com/embed/m0OdBUSJmEY',
    backupVideoUrl: 'https://www.youtube.com/embed/YyvSfV9dP30'
  },
  {
    id: 'step-ups',
    name: 'Step-Ups',
    group: 'Legs',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    compound: true,
    target: 'Glutes & Quads',
    desc: 'Stepping up onto an elevated box or bench.',
    form: [
      'Place one foot on box, drive through heel to stand tall, step down.'
    ],
    mistakes: [
      'Pushing off the trailing foot instead of using leading leg.'
    ],
    setsReps: '3 Sets x 10 Reps / leg',
    alternative: 'Bulgarian Split Squat',
    videoUrl: 'https://www.youtube.com/embed/m0OdBUSJmEY',
    backupVideoUrl: 'https://www.youtube.com/embed/YyvSfV9dP30'
  },

  // ==================== ABS ====================
  {
    id: 'bicycle-crunches',
    name: 'Bicycle Crunches',
    group: 'Abs',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    compound: false,
    target: 'Rectus Abdominis & Obliques',
    desc: 'Lying rotation crunch targeting general abs and side obliques.',
    form: [
      'Lie flat, hands behind head, alternate elbow to opposite knee while cycling legs.'
    ],
    mistakes: [
      'Pulling on the neck with hands.',
      'Moving too fast without contracting abs.'
    ],
    setsReps: '3 Sets x 20 Reps',
    alternative: 'Russian Twists',
    videoUrl: 'https://www.youtube.com/embed/Iwyvoc-gbbM',
    backupVideoUrl: 'https://www.youtube.com/embed/ASdvN_XEl_c'
  },
  {
    id: 'leg-raises-abs',
    name: 'Leg Raises',
    group: 'Abs',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    compound: false,
    target: 'Lower Abs',
    desc: 'Lying leg raises to isolate the lower abdominal wall.',
    form: [
      'Lie on back, hands under glutes, raise straight legs to 90, lower slowly.'
    ],
    mistakes: [
      'Arching lower back off the floor. Keep it pressed down.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Hanging Leg Raises',
    videoUrl: 'https://www.youtube.com/embed/e1A5Ew6W9Y4',
    backupVideoUrl: 'https://www.youtube.com/embed/Iwyvoc-gbbM'
  },
  {
    id: 'hanging-leg-raises-abs',
    name: 'Hanging Leg Raises',
    group: 'Abs',
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    compound: false,
    target: 'Lower Abs & Deep Core',
    desc: 'Leg raises hanging from a bar to build core strength.',
    form: [
      'Hang, raise straight legs horizontally, lower under strict control.'
    ],
    mistakes: [
      'Swinging or utilizing momentum to throw legs up.'
    ],
    setsReps: '3 Sets x 8 Reps',
    alternative: 'Leg Raises',
    videoUrl: 'https://www.youtube.com/embed/e1A5Ew6W9Y4',
    backupVideoUrl: 'https://www.youtube.com/embed/Iwyvoc-gbbM'
  },
  {
    id: 'crunches',
    name: 'Crunches',
    group: 'Abs',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    compound: false,
    target: 'Upper Abs',
    desc: 'Standard ab crunch contraction.',
    form: [
      'Lie back, knees bent, peel shoulder blades off floor, squeeze ribs.'
    ],
    mistakes: [
      'Lifting lower back (turns it into a sit-up).'
    ],
    setsReps: '3 Sets x 15 Reps',
    alternative: 'Bicycle Crunches',
    videoUrl: 'https://www.youtube.com/embed/Iwyvoc-gbbM',
    backupVideoUrl: 'https://www.youtube.com/embed/ASdvN_XEl_c'
  },
  {
    id: 'flutter-kicks',
    name: 'Flutter Kicks',
    group: 'Abs',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    compound: false,
    target: 'Lower Abs',
    desc: 'Lying alternate low kicks to challenge lower abs endurance.',
    form: [
      'Lie back, lift legs 6 inches off ground, alternate low kicks.'
    ],
    mistakes: [
      'Allowing lower back to peel off floor.'
    ],
    setsReps: '3 Sets x 40s Hold',
    alternative: 'Leg Raises',
    videoUrl: 'https://www.youtube.com/embed/Iwyvoc-gbbM',
    backupVideoUrl: 'https://www.youtube.com/embed/ASdvN_XEl_c'
  },
  {
    id: 'russian-twists',
    name: 'Russian Twists',
    group: 'Abs',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    compound: false,
    target: 'Obliques',
    desc: 'Seated torso rotations to target rotational core fibers.',
    form: [
      'Sit, lean back 45, lift feet off floor, rotate torso side to side.'
    ],
    mistakes: [
      'Only moving hands. Make sure to rotate entire shoulders.'
    ],
    setsReps: '3 Sets x 20 Reps',
    alternative: 'Bicycle Crunches',
    videoUrl: 'https://www.youtube.com/embed/Iwyvoc-gbbM',
    backupVideoUrl: 'https://www.youtube.com/embed/ASdvN_XEl_c'
  },
  {
    id: 'ankle-taps',
    name: 'Ankle Taps',
    group: 'Abs',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    compound: false,
    target: 'Obliques & Upper Abs',
    desc: 'Lying side-to-side crunch reaching hands to touch heels.',
    form: [
      'Lie back, knees bent, shoulder blades up, flex laterally to touch heels.'
    ],
    mistakes: [
      'Resting head down (removes tension).'
    ],
    setsReps: '3 Sets x 20 Reps',
    alternative: 'Russian Twists',
    videoUrl: 'https://www.youtube.com/embed/Iwyvoc-gbbM',
    backupVideoUrl: 'https://www.youtube.com/embed/ASdvN_XEl_c'
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    group: 'Abs',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    compound: true,
    target: 'Core & Cardiovascular',
    desc: 'Pushup position running legs in to chest.',
    form: [
      'Pushup plank, drive knees forward to chest alternately and fast.'
    ],
    mistakes: [
      'Pouncing hips up high in the air.'
    ],
    setsReps: '3 Sets x 30s Hold',
    alternative: 'Plank',
    videoUrl: 'https://www.youtube.com/embed/ASdvN_XEl_c',
    backupVideoUrl: 'https://www.youtube.com/embed/Iwyvoc-gbbM'
  },
  {
    id: 'plank-abs',
    name: 'Plank',
    group: 'Abs',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    compound: false,
    target: 'Transverse Abdominis (Core)',
    desc: 'Forearm hold to build core endurance.',
    form: [
      'Forearms and toes, keep body flat, squeeze glutes.'
    ],
    mistakes: [
      'Letting hips sag or rise.'
    ],
    setsReps: '3 Sets x 60s Hold',
    alternative: 'Side Plank',
    videoUrl: 'https://www.youtube.com/embed/ASdvN_XEl_c',
    backupVideoUrl: 'https://www.youtube.com/embed/Iwyvoc-gbbM'
  },
  {
    id: 'side-plank',
    name: 'Side Plank',
    group: 'Abs',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    compound: false,
    target: 'Obliques & Lateral Core',
    desc: 'Sideways forearm plank to isolate lateral stability.',
    form: [
      'Support weight on one forearm and foot side, lift hips high.'
    ],
    mistakes: [
      'Allowing hips to sag down.'
    ],
    setsReps: '3 Sets x 30s / side',
    alternative: 'Plank',
    videoUrl: 'https://www.youtube.com/embed/ASdvN_XEl_c',
    backupVideoUrl: 'https://www.youtube.com/embed/Iwyvoc-gbbM'
  },
  {
    id: 'rev-crunches',
    name: 'Reverse Crunches',
    group: 'Abs',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    compound: false,
    target: 'Lower Abs',
    desc: 'Crunch pulling knees and hips up and off the floor.',
    form: [
      'Lie back, lift hips and draw knees towards chin, contract lower abs.'
    ],
    mistakes: [
      'Throwing legs using swing.'
    ],
    setsReps: '3 Sets x 15 Reps',
    alternative: 'Leg Raises',
    videoUrl: 'https://www.youtube.com/embed/Iwyvoc-gbbM',
    backupVideoUrl: 'https://www.youtube.com/embed/ASdvN_XEl_c'
  },
  // ==================== CALISTHENICS ====================
  {
    id: 'inc-pushups',
    name: 'Incline Push-Ups',
    group: 'Calisthenics',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    compound: true,
    target: 'Chest & Triceps',
    desc: 'Place hands on an elevated surface like a bench. Keep body straight and descend until chest touches, then push back up.',
    form: [
      'Place hands on an elevated bench slightly wider than shoulders.',
      'Maintain a straight line from head to heels, squeezing your core.',
      'Lower chest towards bench, elbows tucked at 45 degrees.',
      'Push back up to full extension.'
    ],
    mistakes: [
      'Sagging hips or arching back.',
      'Flaring elbows out sideways.'
    ],
    setsReps: '3 Sets x 12 Reps',
    alternative: 'Standard Push-Ups',
    videoUrl: 'https://www.youtube.com/embed/5U0aK9Q_rFA',
    backupVideoUrl: 'https://www.youtube.com/embed/IODxDxX7oi4'
  },
  {
    id: 'std-pushups',
    name: 'Standard Push-Ups',
    group: 'Calisthenics',
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    compound: true,
    target: 'Chest, Shoulders & Triceps',
    desc: 'From a plank position, lower your chest to the floor keeping elbows tucked at 45 degrees. Squeeze chest to push up.',
    form: [
      'Hands flat on floor slightly wider than shoulder-width.',
      'Keep your core braced and lower your body until chest almost touches floor.',
      'Keep elbows tucked at 45 degrees, do not flare them.',
      'Push through chest and triceps to starting position.'
    ],
    mistakes: [
      'Flaring elbows out to 90 degrees.',
      'Letting hips sag.'
    ],
    setsReps: '3 Sets x 15-20 Reps',
    alternative: 'Incline Push-Ups',
    videoUrl: 'https://www.youtube.com/embed/IODxDxX7oi4',
    backupVideoUrl: 'https://www.youtube.com/embed/5U0aK9Q_rFA'
  },
  {
    id: 'pullups',
    name: 'Standard Pull-Ups',
    group: 'Calisthenics',
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    compound: true,
    target: 'Back & Biceps',
    desc: 'Hang from pull-up bar with overhand grip. Pull shoulder blades down, pull chest to bar, lower slowly with control.',
    form: [
      'Grip bar overhand wider than shoulder-width.',
      'Retract shoulder blades and pull chest up to the bar.',
      'Drive elbows down and back.',
      'Lower under control to a full stretch.'
    ],
    mistakes: [
      'Kicking legs or using momentum (kipping).',
      'Failing to reach full extension at bottom.'
    ],
    setsReps: '4 Sets x 8 Reps',
    alternative: 'Assisted Pull-Ups',
    videoUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g',
    backupVideoUrl: 'https://www.youtube.com/embed/y2cO5S620r8'
  },
  {
    id: 'dips',
    name: 'Parallel Bar Dips',
    group: 'Calisthenics',
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    compound: true,
    target: 'Chest & Triceps',
    desc: 'Support weight on parallel bars. Lower body by bending elbows to 90 degrees, leaning slightly forward. Push up.',
    form: [
      'Support body weight on parallel bars, arms locked.',
      'Bend elbows and lower body to a 90-degree arm angle.',
      'Lean slightly forward to target chest, keep upright for triceps.',
      'Push back up to lock out.'
    ],
    mistakes: [
      'Dropping too deep, overloading shoulder joint.',
      'Shrugging shoulders.'
    ],
    setsReps: '3 Sets x 10 Reps',
    alternative: 'Bench Dips',
    videoUrl: 'https://www.youtube.com/embed/2z8JmcrW-As',
    backupVideoUrl: 'https://www.youtube.com/embed/0326dy_-CzM'
  },
  {
    id: 'muscle-ups',
    name: 'Bar Muscle-Ups',
    group: 'Calisthenics',
    equipment: 'Bodyweight',
    difficulty: 'Advanced',
    compound: true,
    target: 'Lats, Chest & Triceps',
    desc: 'Pull up dynamically with a hollow-body arc. Transition your chest over the bar rapidly, then press out into dip lock.',
    form: [
      'Hang from bar with false grip or standard overhand grip.',
      'Pull up explosively in an arc around the bar.',
      'Transition chest rapidly over the bar, elbows high.',
      'Press out into the top support position.'
    ],
    mistakes: [
      'Slow pull, preventing chest transition.',
      'Chicken winging (one elbow over before the other).'
    ],
    setsReps: '3 Sets x 4 Reps',
    alternative: 'Standard Pull-Ups',
    videoUrl: 'https://www.youtube.com/embed/9G6kXoK5Wz4',
    backupVideoUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g'
  },
  {
    id: 'hspu',
    name: 'Handstand Push-Ups',
    group: 'Calisthenics',
    equipment: 'Bodyweight',
    difficulty: 'Advanced',
    compound: true,
    target: 'Shoulders & Triceps',
    desc: 'Kick up against a wall in a handstand. Lower body until head lightly touches ground, push up extending arms fully.',
    form: [
      'Kick up to handstand against wall, fingers spread.',
      'Lower head slowly in a tripod position ahead of hands.',
      'Lightly touch head, push back up dynamically.',
      'Maintain tight core and body alignment.'
    ],
    mistakes: [
      'Lowering head straight down between hands instead of forward.',
      'Arched banana back.'
    ],
    setsReps: '3 Sets x 5 Reps',
    alternative: 'Military Press',
    videoUrl: 'https://www.youtube.com/embed/7V2VlYpG_a0',
    backupVideoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI'
  },
  {
    id: 'front-lever',
    name: 'Front Lever Progressions',
    group: 'Calisthenics',
    equipment: 'Bodyweight',
    difficulty: 'Advanced',
    compound: true,
    target: 'Core, Lats & Scapula',
    desc: 'Hang from bar. Pull straight arms down, lifting entire torso and legs horizontally. Keep body flat like a table.',
    form: [
      'Hang from bar, depress and retract scapula.',
      'Pull down with straight arms, elevating hips.',
      'Extend legs horizontal, core locked.',
      'Hold position horizontally parallel to floor.'
    ],
    mistakes: [
      'Bent elbows during the hold.',
      'Sagging hips or arched lower back.'
    ],
    setsReps: '4 Sets x 10s Hold',
    alternative: 'Pull-Ups',
    videoUrl: 'https://www.youtube.com/embed/mG97_S1pLkw',
    backupVideoUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g'
  },
  {
    id: 'dragon-flags',
    name: 'Dragon Flags',
    group: 'Calisthenics',
    equipment: 'Bodyweight',
    difficulty: 'Advanced',
    compound: true,
    target: 'Entire Core & Lats',
    desc: 'Lie on bench, grip bar behind head. Lift entire body on shoulders, keep body rigid. Lower slowly as a single unit.',
    form: [
      'Lie back on bench, grab bench handles behind head.',
      'Swing legs and hips up, weight resting on shoulders.',
      'Keep body rigid in a straight line from shoulders to toes.',
      'Lower slowly as a single unit, keep hips off bench.'
    ],
    mistakes: [
      'Bending at the hips (creasing hips).',
      'Dropping legs too quickly.'
    ],
    setsReps: '3 Sets x 6 Reps',
    alternative: 'Plank',
    videoUrl: 'https://www.youtube.com/embed/Mh1v59yV-h0',
    backupVideoUrl: 'https://www.youtube.com/embed/ASdvN_XEl_c'
  },
  {
    id: 'pistol-squats',
    name: 'Pistol Squats',
    group: 'Calisthenics',
    equipment: 'Bodyweight',
    difficulty: 'Advanced',
    compound: true,
    target: 'Legs & Balance',
    desc: 'Stand on one leg, extending other leg straight out. Squat deep on standing leg until glute reaches calf. Stand up.',
    form: [
      'Stand on one leg, lift the other leg straight in front.',
      'Hinge hips and squat down deep on the standing leg.',
      'Keep heel flat, back upright.',
      'Drive up through heel back to start.'
    ],
    mistakes: [
      'Allowing heel to lift off the floor.',
      'Knee collapsing inward.'
    ],
    setsReps: '3 Sets x 8 Reps / leg',
    alternative: 'Bulgarian Split Squats',
    videoUrl: 'https://www.youtube.com/embed/q0_J3sKpxw4',
    backupVideoUrl: 'https://www.youtube.com/embed/2C-uNgKw12A'
  },

  // ==================== FLEXIBILITY ====================
  {
    id: 'hamstring-stretch',
    name: 'Hamstring Stretch',
    group: 'Flexibility',
    equipment: 'None',
    difficulty: 'Beginner',
    compound: false,
    target: 'Hamstrings & Lower Back',
    desc: 'Sit with legs extended straight. Fold forward from the hips, reaching hands towards toes while keeping spine long.',
    form: [
      'Sit on floor with legs extended straight forward.',
      'Hinge forward from hips, keeping spine neutral.',
      'Reach hands towards ankles or toes.',
      'Hold stretch, breathing deeply, relaxing into it.'
    ],
    mistakes: [
      'Rounding upper back aggressively.',
      'Forcing the stretch beyond pain threshold.'
    ],
    setsReps: '3 Sets x 30s Hold',
    alternative: 'Hip Flexor Stretch',
    videoUrl: 'https://www.youtube.com/embed/yC2y99Vz5b8',
    backupVideoUrl: 'https://www.youtube.com/embed/ZqD3T95Ylq0'
  },
  {
    id: 'hip-flexor-stretch',
    name: 'Hip Flexor Stretch',
    group: 'Flexibility',
    equipment: 'None',
    difficulty: 'Beginner',
    compound: false,
    target: 'Psoas & Quads',
    desc: 'Kneel on one knee, step other foot forward in a lunge. Tuck pelvis and lean forward slightly to stretch hip front.',
    form: [
      'Kneel on one knee, front foot flat in a lunge.',
      'Tuck pelvis and squeeze glute of kneeling leg.',
      'Shift weight forward slightly.',
      'Raise arm on kneeling side overhead for a deeper stretch.'
    ],
    mistakes: [
      'Arching lower back.',
      'Leaning too far forward without pelvic tuck.'
    ],
    setsReps: '3 Sets x 30s / leg',
    alternative: 'Hamstring Stretch',
    videoUrl: 'https://www.youtube.com/embed/ZqD3T95Ylq0',
    backupVideoUrl: 'https://www.youtube.com/embed/yC2y99Vz5b8'
  },
  {
    id: 'butterfly-stretch',
    name: 'Butterfly Stretch',
    group: 'Flexibility',
    equipment: 'None',
    difficulty: 'Beginner',
    compound: false,
    target: 'Inner Thighs & Adductors',
    desc: 'Sit with knees bent, soles of feet pressed together. Hold feet, gently pull heels in, and press knees towards ground.',
    form: [
      'Sit tall on floor, bring soles of feet together.',
      'Pull heels gently towards groin.',
      'Hold feet, keep back straight.',
      'Gently guide knees downwards towards floor.'
    ],
    mistakes: [
      'Slouching or rounding the lower back.',
      'Bouncing knees aggressively.'
    ],
    setsReps: '3 Sets x 40s Hold',
    alternative: 'Cobra Stretch',
    videoUrl: 'https://www.youtube.com/embed/v9C2K8u4W0E',
    backupVideoUrl: 'https://www.youtube.com/embed/JDdCc7jK6pU'
  },
  {
    id: 'cat-cow',
    name: 'Cat-Cow Stretch',
    group: 'Flexibility',
    equipment: 'None',
    difficulty: 'Beginner',
    compound: false,
    target: 'Spinal Mobility',
    desc: 'On hands and knees. Alternate between arching spine up (cat) and dropping belly low while lifting head (cow).',
    form: [
      'All fours, wrists under shoulders, knees under hips.',
      'Inhale: drop belly, lift head, arch spine (cow).',
      'Exhale: tuck chin, arch spine upwards, pull belly in (cat).',
      'Alternate fluidly with your breath.'
    ],
    mistakes: [
      'Moving too quickly without body awareness.',
      'Hyperextending neck.'
    ],
    setsReps: '3 Sets x 10 Cycles',
    alternative: 'Child\'s Pose',
    videoUrl: 'https://www.youtube.com/embed/w_Z20bV5Bw0',
    backupVideoUrl: 'https://www.youtube.com/embed/2ATEo0Y4YFw'
  },
  {
    id: 'childs-pose',
    name: 'Child\'s Pose',
    group: 'Flexibility',
    equipment: 'None',
    difficulty: 'Beginner',
    compound: false,
    target: 'Shoulders & Spine Decompression',
    desc: 'Kneel, sit back on heels. Fold chest forward over thighs, reaching arms out in front on floor, forehead resting down.',
    form: [
      'Kneel on floor, toes touch, knees spread wide.',
      'Sit hips back on heels, stretch torso forward.',
      'Rest forehead on floor, reach arms long in front.',
      'Breathe deeply, relaxing back and shoulders.'
    ],
    mistakes: [
      'Lifting hips off heels if tight (use cushion).'
    ],
    setsReps: '2 Sets x 60s Hold',
    alternative: 'Cat-Cow Stretch',
    videoUrl: 'https://www.youtube.com/embed/2ATEo0Y4YFw',
    backupVideoUrl: 'https://www.youtube.com/embed/w_Z20bV5Bw0'
  },
  {
    id: 'cobra-stretch',
    name: 'Cobra Stretch',
    group: 'Flexibility',
    equipment: 'None',
    difficulty: 'Beginner',
    compound: false,
    target: 'Abdominals & Lower Back',
    desc: 'Lie flat on stomach. Place hands under shoulders, press down to arch spine up, keeping thighs in contact with floor.',
    form: [
      'Lie prone on stomach, feet flat, hands under shoulders.',
      'Press through hands, lift chest off floor.',
      'Keep elbows slightly bent, shoulders down away from ears.',
      'Maintain hip contact with floor.'
    ],
    mistakes: [
      'Shrugging shoulders near ears.',
      'Lifting hips off the floor, pinching lower back.'
    ],
    setsReps: '3 Sets x 30s Hold',
    alternative: 'Butterfly Stretch',
    videoUrl: 'https://www.youtube.com/embed/JDdCc7jK6pU',
    backupVideoUrl: 'https://www.youtube.com/embed/v9C2K8u4W0E'
  },
  {
    id: 'shoulder-mobility-stretch',
    name: 'Shoulder Mobility Stretch',
    group: 'Flexibility',
    equipment: 'None',
    difficulty: 'Beginner',
    compound: false,
    target: 'Rotator Cuffs & Scapula',
    desc: 'Perform slow arm circles, shoulder dislocations using a resistance band or wall slides.',
    form: [
      'Stand tall, feet shoulder-width apart.',
      'Raise arms straight to sides, perform slow outward circles.',
      'Maintain control, gradually increasing circle size.',
      'Reverse direction and repeat.'
    ],
    mistakes: [
      'Moving hands too fast.',
      'Hunching neck.'
    ],
    setsReps: '2 Sets x 12 Cycles',
    alternative: 'Thoracic Rotation',
    videoUrl: 'https://www.youtube.com/embed/ZqD3T95Ylq0',
    backupVideoUrl: 'https://www.youtube.com/embed/yC2y99Vz5b8'
  },
  {
    id: 'thoracic-rotation',
    name: 'Thoracic Rotation',
    group: 'Flexibility',
    equipment: 'None',
    difficulty: 'Beginner',
    compound: false,
    target: 'Upper Back Mobility',
    desc: 'On hands and knees, place one hand behind head, rotate elbow up to sky, return under control.',
    form: [
      'All fours, place one hand behind your head.',
      'Rotate elbow up towards sky, opening your chest.',
      'Follow elbow with eyes, rotate thoracic spine.',
      'Lower elbow to touch opposite wrist, repeat.'
    ],
    mistakes: [
      'Moving hips sideways. Keep hips square.'
    ],
    setsReps: '2 Sets x 8 / side',
    alternative: 'Shoulder Mobility Stretch',
    videoUrl: 'https://www.youtube.com/embed/w_Z20bV5Bw0',
    backupVideoUrl: 'https://www.youtube.com/embed/2ATEo0Y4YFw'
  },
  {
    id: 'quad-stretch',
    name: 'Quad Stretch',
    group: 'Flexibility',
    equipment: 'None',
    difficulty: 'Beginner',
    compound: false,
    target: 'Quadriceps',
    desc: 'Stand on one leg, pull ankle behind body close to glute, keeping thighs aligned.',
    form: [
      'Stand straight, pull one foot up behind you.',
      'Hold ankle, press hips forward slightly.',
      'Keep knees together and aligned.',
      'Stand tall, hold balance (use support if needed).'
    ],
    mistakes: [
      'Letting knee flare out sideways.',
      'Arching lower back.'
    ],
    setsReps: '2 Sets x 30s / leg',
    alternative: 'Calf Stretch',
    videoUrl: 'https://www.youtube.com/embed/yC2y99Vz5b8',
    backupVideoUrl: 'https://www.youtube.com/embed/ZqD3T95Ylq0'
  },
  {
    id: 'calf-stretch',
    name: 'Calf Stretch',
    group: 'Flexibility',
    equipment: 'None',
    difficulty: 'Beginner',
    compound: false,
    target: 'Gastrocnemius & Achilles',
    desc: 'Press foot up against a wall, leaning body forward to feel stretch in the calf fibers.',
    form: [
      'Stand facing wall, step one foot forward, other back.',
      'Keep back leg straight, heel flat on floor.',
      'Lean body forward towards wall, stretching calf.',
      'Keep back foot pointing straight forward.'
    ],
    mistakes: [
      'Allowing back heel to lift.',
      'Turning foot out.'
    ],
    setsReps: '2 Sets x 30s / leg',
    alternative: 'Quad Stretch',
    videoUrl: 'https://www.youtube.com/embed/2ATEo0Y4YFw',
    backupVideoUrl: 'https://www.youtube.com/embed/w_Z20bV5Bw0'
  }
];
