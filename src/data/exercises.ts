// Exercise Database

export type MuscleGroup =
    | 'chest'
    | 'back'
    | 'shoulders'
    | 'biceps'
    | 'triceps'
    | 'quads'
    | 'hamstrings'
    | 'glutes'
    | 'calves'
    | 'core'
    | 'full_body';

export type ExerciseEquipment =
    | 'bodyweight'
    | 'dumbbells'
    | 'barbell'
    | 'cables'
    | 'machines'
    | 'bands'
    | 'kettlebell';

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
    id: string;
    name: string;
    muscleGroups: MuscleGroup[];
    primaryMuscle: MuscleGroup;
    equipment: ExerciseEquipment[];
    difficulty: ExerciseDifficulty;
    description: string;
    tips: string[];
    isCompound: boolean;
}

export const EXERCISES: Exercise[] = [
    // CHEST
    {
        id: 'push_up',
        name: 'Push-Up',
        muscleGroups: ['chest', 'triceps', 'shoulders', 'core'],
        primaryMuscle: 'chest',
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        description: 'Classic bodyweight chest exercise',
        tips: ['Keep core tight', 'Elbows at 45 degrees', 'Full range of motion'],
        isCompound: true,
    },
    {
        id: 'dumbbell_bench_press',
        name: 'Dumbbell Bench Press',
        muscleGroups: ['chest', 'triceps', 'shoulders'],
        primaryMuscle: 'chest',
        equipment: ['dumbbells'],
        difficulty: 'beginner',
        description: 'Press dumbbells from chest level to arm extension',
        tips: ['Squeeze at the top', 'Control the negative', 'Slight arch in back'],
        isCompound: true,
    },
    {
        id: 'barbell_bench_press',
        name: 'Barbell Bench Press',
        muscleGroups: ['chest', 'triceps', 'shoulders'],
        primaryMuscle: 'chest',
        equipment: ['barbell'],
        difficulty: 'intermediate',
        description: 'The king of chest exercises',
        tips: ['Retract shoulder blades', 'Leg drive', 'Touch chest lightly'],
        isCompound: true,
    },
    {
        id: 'incline_dumbbell_press',
        name: 'Incline Dumbbell Press',
        muscleGroups: ['chest', 'shoulders', 'triceps'],
        primaryMuscle: 'chest',
        equipment: ['dumbbells'],
        difficulty: 'beginner',
        description: 'Targets upper chest with inclined angle',
        tips: ['30-45 degree angle', 'Control the weight', 'Squeeze at top'],
        isCompound: true,
    },
    {
        id: 'dumbbell_fly',
        name: 'Dumbbell Fly',
        muscleGroups: ['chest'],
        primaryMuscle: 'chest',
        equipment: ['dumbbells'],
        difficulty: 'beginner',
        description: 'Isolation exercise for chest stretch and squeeze',
        tips: ['Slight bend in elbows', 'Stretch at bottom', 'Like hugging a tree'],
        isCompound: false,
    },
    {
        id: 'cable_fly',
        name: 'Cable Fly',
        muscleGroups: ['chest'],
        primaryMuscle: 'chest',
        equipment: ['cables'],
        difficulty: 'beginner',
        description: 'Constant tension chest isolation',
        tips: ['Cross hands at peak', 'Slow and controlled', 'Feel the squeeze'],
        isCompound: false,
    },

    // BACK
    {
        id: 'pull_up',
        name: 'Pull-Up',
        muscleGroups: ['back', 'biceps', 'core'],
        primaryMuscle: 'back',
        equipment: ['bodyweight'],
        difficulty: 'intermediate',
        description: 'Vertical pulling movement for lats',
        tips: ['Engage lats first', 'Chin over bar', 'Full extension at bottom'],
        isCompound: true,
    },
    {
        id: 'lat_pulldown',
        name: 'Lat Pulldown',
        muscleGroups: ['back', 'biceps'],
        primaryMuscle: 'back',
        equipment: ['cables', 'machines'],
        difficulty: 'beginner',
        description: 'Machine version of pull-up movement',
        tips: ['Slight lean back', 'Pull to upper chest', 'Squeeze lats'],
        isCompound: true,
    },
    {
        id: 'barbell_row',
        name: 'Barbell Row',
        muscleGroups: ['back', 'biceps', 'core'],
        primaryMuscle: 'back',
        equipment: ['barbell'],
        difficulty: 'intermediate',
        description: 'Horizontal pulling for thick back',
        tips: ['Hinge at hips', 'Pull to lower chest', 'Squeeze shoulder blades'],
        isCompound: true,
    },
    {
        id: 'dumbbell_row',
        name: 'Dumbbell Row',
        muscleGroups: ['back', 'biceps'],
        primaryMuscle: 'back',
        equipment: ['dumbbells'],
        difficulty: 'beginner',
        description: 'Single arm rowing movement',
        tips: ['Support with other hand', 'Pull towards hip', 'Full stretch at bottom'],
        isCompound: true,
    },
    {
        id: 'seated_cable_row',
        name: 'Seated Cable Row',
        muscleGroups: ['back', 'biceps'],
        primaryMuscle: 'back',
        equipment: ['cables'],
        difficulty: 'beginner',
        description: 'Seated horizontal pulling',
        tips: ['Keep torso upright', 'Squeeze shoulder blades', 'Control the weight'],
        isCompound: true,
    },
    {
        id: 'deadlift',
        name: 'Deadlift',
        muscleGroups: ['back', 'hamstrings', 'glutes', 'core'],
        primaryMuscle: 'back',
        equipment: ['barbell'],
        difficulty: 'intermediate',
        description: 'Full body pulling from the ground',
        tips: ['Neutral spine', 'Drive through heels', 'Lock out at top'],
        isCompound: true,
    },

    // SHOULDERS
    {
        id: 'overhead_press',
        name: 'Overhead Press',
        muscleGroups: ['shoulders', 'triceps', 'core'],
        primaryMuscle: 'shoulders',
        equipment: ['barbell'],
        difficulty: 'intermediate',
        description: 'Pressing weight overhead',
        tips: ['Brace core', 'Full lockout', 'Neutral head position'],
        isCompound: true,
    },
    {
        id: 'dumbbell_shoulder_press',
        name: 'Dumbbell Shoulder Press',
        muscleGroups: ['shoulders', 'triceps'],
        primaryMuscle: 'shoulders',
        equipment: ['dumbbells'],
        difficulty: 'beginner',
        description: 'Dumbbell pressing overhead',
        tips: ['Control the path', 'Slight forward lean', 'Full extension'],
        isCompound: true,
    },
    {
        id: 'lateral_raise',
        name: 'Lateral Raise',
        muscleGroups: ['shoulders'],
        primaryMuscle: 'shoulders',
        equipment: ['dumbbells'],
        difficulty: 'beginner',
        description: 'Isolation for lateral deltoid',
        tips: ['Slight bend in elbows', 'Raise to shoulder height', 'Control descent'],
        isCompound: false,
    },
    {
        id: 'face_pull',
        name: 'Face Pull',
        muscleGroups: ['shoulders', 'back'],
        primaryMuscle: 'shoulders',
        equipment: ['cables', 'bands'],
        difficulty: 'beginner',
        description: 'Rear delt and rotator cuff work',
        tips: ['Pull to forehead', 'External rotation', 'Squeeze at end'],
        isCompound: false,
    },
    {
        id: 'rear_delt_fly',
        name: 'Rear Delt Fly',
        muscleGroups: ['shoulders'],
        primaryMuscle: 'shoulders',
        equipment: ['dumbbells'],
        difficulty: 'beginner',
        description: 'Isolation for rear deltoid',
        tips: ['Bent over position', 'Lead with elbows', 'Squeeze at top'],
        isCompound: false,
    },

    // BICEPS
    {
        id: 'barbell_curl',
        name: 'Barbell Curl',
        muscleGroups: ['biceps'],
        primaryMuscle: 'biceps',
        equipment: ['barbell'],
        difficulty: 'beginner',
        description: 'Classic bicep builder',
        tips: ['No swinging', 'Full range of motion', 'Squeeze at top'],
        isCompound: false,
    },
    {
        id: 'dumbbell_curl',
        name: 'Dumbbell Curl',
        muscleGroups: ['biceps'],
        primaryMuscle: 'biceps',
        equipment: ['dumbbells'],
        difficulty: 'beginner',
        description: 'Unilateral bicep curl',
        tips: ['Supinate at top', 'Control the negative', 'Alternate or together'],
        isCompound: false,
    },
    {
        id: 'hammer_curl',
        name: 'Hammer Curl',
        muscleGroups: ['biceps'],
        primaryMuscle: 'biceps',
        equipment: ['dumbbells'],
        difficulty: 'beginner',
        description: 'Neutral grip curl for brachialis',
        tips: ['Palms facing each other', 'Keep elbows stationary', 'Full contraction'],
        isCompound: false,
    },

    // TRICEPS
    {
        id: 'tricep_pushdown',
        name: 'Tricep Pushdown',
        muscleGroups: ['triceps'],
        primaryMuscle: 'triceps',
        equipment: ['cables'],
        difficulty: 'beginner',
        description: 'Cable isolation for triceps',
        tips: ['Elbows pinned to sides', 'Full extension', 'Squeeze at bottom'],
        isCompound: false,
    },
    {
        id: 'overhead_tricep_extension',
        name: 'Overhead Tricep Extension',
        muscleGroups: ['triceps'],
        primaryMuscle: 'triceps',
        equipment: ['dumbbells', 'cables'],
        difficulty: 'beginner',
        description: 'Stretch-focused tricep movement',
        tips: ['Keep elbows close', 'Full stretch at bottom', 'Extend fully'],
        isCompound: false,
    },
    {
        id: 'dips',
        name: 'Dips',
        muscleGroups: ['triceps', 'chest', 'shoulders'],
        primaryMuscle: 'triceps',
        equipment: ['bodyweight'],
        difficulty: 'intermediate',
        description: 'Bodyweight pressing movement',
        tips: ['Lean forward for chest focus', 'Stay upright for triceps', '90 degree bend'],
        isCompound: true,
    },
    {
        id: 'close_grip_bench_press',
        name: 'Close Grip Bench Press',
        muscleGroups: ['triceps', 'chest'],
        primaryMuscle: 'triceps',
        equipment: ['barbell'],
        difficulty: 'intermediate',
        description: 'Compound tricep builder',
        tips: ['Hands shoulder width', 'Elbows close to body', 'Lower to chest'],
        isCompound: true,
    },

    // LEGS - QUADS
    {
        id: 'squat',
        name: 'Barbell Squat',
        muscleGroups: ['quads', 'glutes', 'hamstrings', 'core'],
        primaryMuscle: 'quads',
        equipment: ['barbell'],
        difficulty: 'intermediate',
        description: 'The king of leg exercises',
        tips: ['Chest up', 'Knees track toes', 'Depth at or below parallel'],
        isCompound: true,
    },
    {
        id: 'goblet_squat',
        name: 'Goblet Squat',
        muscleGroups: ['quads', 'glutes', 'core'],
        primaryMuscle: 'quads',
        equipment: ['dumbbells', 'kettlebell'],
        difficulty: 'beginner',
        description: 'Beginner-friendly squat variation',
        tips: ['Hold weight at chest', 'Elbows inside knees', 'Control descent'],
        isCompound: true,
    },
    {
        id: 'leg_press',
        name: 'Leg Press',
        muscleGroups: ['quads', 'glutes'],
        primaryMuscle: 'quads',
        equipment: ['machines'],
        difficulty: 'beginner',
        description: 'Machine quad builder',
        tips: ['Feet shoulder width', 'Full range of motion', 'Don\'t lock knees'],
        isCompound: true,
    },
    {
        id: 'lunges',
        name: 'Lunges',
        muscleGroups: ['quads', 'glutes', 'hamstrings'],
        primaryMuscle: 'quads',
        equipment: ['bodyweight', 'dumbbells'],
        difficulty: 'beginner',
        description: 'Unilateral leg movement',
        tips: ['Knee over ankle', '90 degree angles', 'Push through front heel'],
        isCompound: true,
    },
    {
        id: 'leg_extension',
        name: 'Leg Extension',
        muscleGroups: ['quads'],
        primaryMuscle: 'quads',
        equipment: ['machines'],
        difficulty: 'beginner',
        description: 'Quad isolation exercise',
        tips: ['Control the weight', 'Full extension', 'Slow negative'],
        isCompound: false,
    },

    // LEGS - HAMSTRINGS/GLUTES
    {
        id: 'romanian_deadlift',
        name: 'Romanian Deadlift',
        muscleGroups: ['hamstrings', 'glutes', 'back'],
        primaryMuscle: 'hamstrings',
        equipment: ['barbell', 'dumbbells'],
        difficulty: 'intermediate',
        description: 'Hip hinge for posterior chain',
        tips: ['Soft knees', 'Hinge at hips', 'Feel hamstring stretch'],
        isCompound: true,
    },
    {
        id: 'leg_curl',
        name: 'Leg Curl',
        muscleGroups: ['hamstrings'],
        primaryMuscle: 'hamstrings',
        equipment: ['machines'],
        difficulty: 'beginner',
        description: 'Hamstring isolation',
        tips: ['Control the weight', 'Full contraction', 'Slow negative'],
        isCompound: false,
    },
    {
        id: 'hip_thrust',
        name: 'Hip Thrust',
        muscleGroups: ['glutes', 'hamstrings'],
        primaryMuscle: 'glutes',
        equipment: ['barbell', 'bodyweight'],
        difficulty: 'beginner',
        description: 'Primary glute builder',
        tips: ['Drive through heels', 'Squeeze at top', 'Chin tucked'],
        isCompound: true,
    },
    {
        id: 'glute_bridge',
        name: 'Glute Bridge',
        muscleGroups: ['glutes'],
        primaryMuscle: 'glutes',
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        description: 'Bodyweight glute activation',
        tips: ['Squeeze glutes hard', 'Hold at top', 'Push through heels'],
        isCompound: false,
    },

    // CALVES
    {
        id: 'calf_raise',
        name: 'Calf Raise',
        muscleGroups: ['calves'],
        primaryMuscle: 'calves',
        equipment: ['bodyweight', 'machines', 'dumbbells'],
        difficulty: 'beginner',
        description: 'Standing calf raise',
        tips: ['Full stretch at bottom', 'Pause at top', 'Control the movement'],
        isCompound: false,
    },

    // CORE
    {
        id: 'plank',
        name: 'Plank',
        muscleGroups: ['core'],
        primaryMuscle: 'core',
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        description: 'Core stability exercise',
        tips: ['Straight line from head to heels', 'Brace core', 'Don\'t hold breath'],
        isCompound: false,
    },
    {
        id: 'dead_bug',
        name: 'Dead Bug',
        muscleGroups: ['core'],
        primaryMuscle: 'core',
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        description: 'Anti-extension core exercise',
        tips: ['Low back pressed to floor', 'Slow and controlled', 'Breathe throughout'],
        isCompound: false,
    },
    {
        id: 'hanging_leg_raise',
        name: 'Hanging Leg Raise',
        muscleGroups: ['core'],
        primaryMuscle: 'core',
        equipment: ['bodyweight'],
        difficulty: 'intermediate',
        description: 'Advanced ab exercise',
        tips: ['Control the swing', 'Raise legs to parallel', 'Slow descent'],
        isCompound: false,
    },
    {
        id: 'cable_crunch',
        name: 'Cable Crunch',
        muscleGroups: ['core'],
        primaryMuscle: 'core',
        equipment: ['cables'],
        difficulty: 'beginner',
        description: 'Weighted ab exercise',
        tips: ['Crunch with abs not hips', 'Exhale on contraction', 'Feel the squeeze'],
        isCompound: false,
    },
];

// Helper to filter exercises by equipment availability
export function getExercisesForEquipment(
    equipmentAccess: 'none' | 'home_basic' | 'home_full' | 'gym'
): Exercise[] {
    const availableEquipment: ExerciseEquipment[] = ['bodyweight'];

    if (equipmentAccess === 'home_basic') {
        availableEquipment.push('dumbbells', 'bands');
    } else if (equipmentAccess === 'home_full') {
        availableEquipment.push('dumbbells', 'bands', 'barbell', 'kettlebell');
    } else if (equipmentAccess === 'gym') {
        availableEquipment.push('dumbbells', 'bands', 'barbell', 'kettlebell', 'cables', 'machines');
    }

    return EXERCISES.filter(exercise =>
        exercise.equipment.some(eq => availableEquipment.includes(eq))
    );
}

// Helper to filter by difficulty
export function getExercisesForLevel(
    exercises: Exercise[],
    level: 'beginner' | 'intermediate' | 'advanced'
): Exercise[] {
    const allowedDifficulties: ExerciseDifficulty[] = ['beginner'];

    if (level === 'intermediate') {
        allowedDifficulties.push('intermediate');
    } else if (level === 'advanced') {
        allowedDifficulties.push('intermediate', 'advanced');
    }

    return exercises.filter(ex => allowedDifficulties.includes(ex.difficulty));
}

// Get exercises for a specific muscle group
export function getExercisesForMuscle(
    exercises: Exercise[],
    muscle: MuscleGroup
): Exercise[] {
    return exercises.filter(ex => ex.muscleGroups.includes(muscle));
}
