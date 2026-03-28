// Exercise Animation Data - SVG-based animations for exercise demonstrations

export interface ExerciseAnimation {
    id: string;
    name: string;
    frames: string[]; // SVG paths for animation keyframes
    duration: number; // Animation duration in ms
    instructions: string[];
    muscleHighlight: string; // Primary muscle color
}

// Simple stick figure animation frames for exercises
export const EXERCISE_ANIMATIONS: Record<string, {
    keyframes: string;
    description: string;
    steps: string[];
}> = {
    // Push-Up Animation
    push_up: {
        keyframes: `
      @keyframes pushup {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(10px) rotate(-5deg); }
      }
    `,
        description: 'Keep your body straight and lower your chest to the ground',
        steps: [
            'Start in plank position with hands shoulder-width apart',
            'Lower your body until chest nearly touches the floor',
            'Keep elbows at 45-degree angle',
            'Push back up to starting position',
            'Repeat for desired reps'
        ]
    },

    // Pull-Up Animation
    pull_up: {
        keyframes: `
      @keyframes pullup {
        0%, 100% { transform: translateY(20px); }
        50% { transform: translateY(0); }
      }
    `,
        description: 'Hang from bar and pull yourself up until chin is over the bar',
        steps: [
            'Grip bar with hands slightly wider than shoulders',
            'Hang with arms fully extended',
            'Pull yourself up until chin clears the bar',
            'Lower back down with control',
            'Repeat for desired reps'
        ]
    },

    // Squat Animation
    squat: {
        keyframes: `
      @keyframes squat {
        0%, 100% { transform: scaleY(1) translateY(0); }
        50% { transform: scaleY(0.85) translateY(15px); }
      }
    `,
        description: 'Lower your hips until thighs are parallel to ground',
        steps: [
            'Stand with feet shoulder-width apart',
            'Keep chest up and core engaged',
            'Lower hips until thighs are parallel',
            'Push through heels to stand',
            'Repeat for desired reps'
        ]
    },

    // Barbell Squat Animation
    barbell_squat: {
        keyframes: `
      @keyframes squat {
        0%, 100% { transform: scaleY(1) translateY(0); }
        50% { transform: scaleY(0.85) translateY(15px); }
      }
    `,
        description: 'Lower your hips until thighs are parallel to ground',
        steps: [
            'Position barbell on upper back',
            'Stand with feet shoulder-width apart',
            'Lower hips until thighs are parallel',
            'Push through heels to stand',
            'Repeat for desired reps'
        ]
    },

    // Deadlift Animation
    deadlift: {
        keyframes: `
      @keyframes deadlift {
        0%, 100% { transform: rotate(0deg) translateY(0); }
        50% { transform: rotate(30deg) translateY(10px); }
      }
    `,
        description: 'Lift the barbell from ground to hip height with straight back',
        steps: [
            'Stand with feet hip-width apart, bar over mid-foot',
            'Hinge at hips, grip the bar',
            'Keep back flat and chest up',
            'Drive through legs and pull bar up',
            'Stand tall, then lower with control'
        ]
    },

    // Bench Press Animation
    dumbbell_bench_press: {
        keyframes: `
      @keyframes bench {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(15px); }
      }
    `,
        description: 'Press dumbbells from chest to full arm extension',
        steps: [
            'Lie on bench with dumbbells at chest level',
            'Plant feet firmly on ground',
            'Press dumbbells up until arms are extended',
            'Lower with control to chest',
            'Repeat for desired reps'
        ]
    },

    barbell_bench_press: {
        keyframes: `
      @keyframes bench {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(15px); }
      }
    `,
        description: 'Press barbell from chest to full arm extension',
        steps: [
            'Lie on bench, grip bar slightly wider than shoulders',
            'Unrack and position over chest',
            'Lower bar to chest with control',
            'Press back up to starting position',
            'Repeat for desired reps'
        ]
    },

    // Shoulder Press Animation
    dumbbell_shoulder_press: {
        keyframes: `
      @keyframes ohp {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
    `,
        description: 'Press dumbbells overhead from shoulder level',
        steps: [
            'Hold dumbbells at shoulder height',
            'Brace your core',
            'Press dumbbells overhead',
            'Lower back to shoulders with control',
            'Repeat for desired reps'
        ]
    },

    overhead_press: {
        keyframes: `
      @keyframes ohp {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
    `,
        description: 'Press barbell overhead from shoulder level',
        steps: [
            'Grip barbell at shoulder width',
            'Position bar at front of shoulders',
            'Brace core and press overhead',
            'Lock out at top',
            'Lower with control'
        ]
    },

    // Lunges Animation
    lunges: {
        keyframes: `
      @keyframes lunge {
        0%, 100% { transform: translateX(0) translateY(0); }
        50% { transform: translateX(10px) translateY(10px); }
      }
    `,
        description: 'Step forward and lower until both knees form 90-degree angles',
        steps: [
            'Stand with feet hip-width apart',
            'Step forward with one leg',
            'Lower until both knees at 90 degrees',
            'Push through front heel to return',
            'Alternate legs and repeat'
        ]
    },

    // Romanian Deadlift
    romanian_deadlift: {
        keyframes: `
      @keyframes rdl {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(35deg); }
      }
    `,
        description: 'Hinge at hips with slight knee bend to stretch hamstrings',
        steps: [
            'Hold weight in front of thighs',
            'Hinge at hips with soft knees',
            'Lower until you feel hamstring stretch',
            'Keep back flat throughout',
            'Drive hips forward to stand'
        ]
    },

    // Dumbbell Row
    dumbbell_row: {
        keyframes: `
      @keyframes row {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-15px) rotate(5deg); }
      }
    `,
        description: 'Pull dumbbell to hip while supporting on bench',
        steps: [
            'Support one hand and knee on bench',
            'Hold dumbbell with other hand',
            'Pull dumbbell toward hip',
            'Squeeze shoulder blade at top',
            'Lower with control and repeat'
        ]
    },

    // Bicep Curl
    dumbbell_curl: {
        keyframes: `
      @keyframes curl {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(-110deg); }
      }
    `,
        description: 'Curl dumbbells from thigh level to shoulders',
        steps: [
            'Stand with dumbbells at sides',
            'Keep elbows pinned to body',
            'Curl weight up to shoulder',
            'Squeeze biceps at top',
            'Lower with control'
        ]
    },

    barbell_curl: {
        keyframes: `
      @keyframes curl {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(-110deg); }
      }
    `,
        description: 'Curl barbell from thigh level to shoulders',
        steps: [
            'Stand with barbell grip shoulder-width',
            'Keep elbows pinned to sides',
            'Curl bar up to shoulders',
            'Squeeze biceps at top',
            'Lower with control'
        ]
    },

    // Tricep Pushdown
    tricep_pushdown: {
        keyframes: `
      @keyframes pushdown {
        0%, 100% { transform: rotate(-30deg); }
        50% { transform: rotate(0deg); }
      }
    `,
        description: 'Push cable attachment down while keeping elbows stationary',
        steps: [
            'Grip cable attachment with elbows at sides',
            'Keep upper arms stationary',
            'Push weight down until arms straight',
            'Squeeze triceps at bottom',
            'Return to starting position'
        ]
    },

    // Lateral Raise
    lateral_raise: {
        keyframes: `
      @keyframes lateral {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(-80deg); }
      }
    `,
        description: 'Raise dumbbells out to sides until shoulder height',
        steps: [
            'Hold dumbbells at sides',
            'Slight bend in elbows',
            'Raise arms out to sides',
            'Stop at shoulder height',
            'Lower with control'
        ]
    },

    // Plank
    plank: {
        keyframes: `
      @keyframes plank {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-2px); }
      }
    `,
        description: 'Hold body in straight line from head to heels',
        steps: [
            'Start in forearm plank position',
            'Keep body in straight line',
            'Engage core and squeeze glutes',
            'Look at floor to keep neck neutral',
            'Hold for prescribed time'
        ]
    },

    // Leg Press
    leg_press: {
        keyframes: `
      @keyframes legpress {
        0%, 100% { transform: scaleY(0.8); }
        50% { transform: scaleY(1); }
      }
    `,
        description: 'Push platform away by extending legs',
        steps: [
            'Sit in machine with feet on platform',
            'Release safety and lower weight',
            'Bring knees toward chest',
            'Push through heels to extend',
            'Dont lock knees at top'
        ]
    },

    // Lat Pulldown
    lat_pulldown: {
        keyframes: `
      @keyframes pulldown {
        0%, 100% { transform: translateY(-20px); }
        50% { transform: translateY(0); }
      }
    `,
        description: 'Pull bar down to upper chest while squeezing lats',
        steps: [
            'Sit with thighs under pad',
            'Grip bar wider than shoulders',
            'Lean back slightly',
            'Pull bar to upper chest',
            'Squeeze lats and return'
        ]
    },

    // Hip Thrust
    hip_thrust: {
        keyframes: `
      @keyframes hipthrust {
        0%, 100% { transform: translateY(10px) rotate(10deg); }
        50% { transform: translateY(0) rotate(0deg); }
      }
    `,
        description: 'Drive hips up while supporting upper back on bench',
        steps: [
            'Upper back against bench',
            'Barbell across hips',
            'Feet flat on floor',
            'Drive hips up, squeeze glutes',
            'Lower with control'
        ]
    },

    // Calf Raise
    calf_raise: {
        keyframes: `
      @keyframes calfraise {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-15px); }
      }
    `,
        description: 'Rise up on toes then lower heels below platform',
        steps: [
            'Stand on edge of platform',
            'Hold weight or use machine',
            'Rise up on toes',
            'Pause at top',
            'Lower heels below platform'
        ]
    },

    // Dips
    dips: {
        keyframes: `
      @keyframes dips {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(15px); }
      }
    `,
        description: 'Lower body between parallel bars then push back up',
        steps: [
            'Grip parallel bars and lift body',
            'Keep elbows close to body',
            'Lower until elbows at 90 degrees',
            'Push back up to starting position',
            'Repeat for desired reps'
        ]
    },

    // Goblet Squat
    goblet_squat: {
        keyframes: `
      @keyframes squat {
        0%, 100% { transform: scaleY(1) translateY(0); }
        50% { transform: scaleY(0.85) translateY(15px); }
      }
    `,
        description: 'Hold dumbbell at chest and squat down',
        steps: [
            'Hold dumbbell vertically at chest',
            'Stand with feet shoulder-width',
            'Squat down keeping chest up',
            'Elbows inside knees at bottom',
            'Push through heels to stand'
        ]
    },

    // Face Pull
    face_pull: {
        keyframes: `
      @keyframes facepull {
        0%, 100% { transform: translateX(20px); }
        50% { transform: translateX(0); }
      }
    `,
        description: 'Pull rope attachment toward face with external rotation',
        steps: [
            'Set cable at face height',
            'Grip rope with thumbs toward you',
            'Pull toward face',
            'Externally rotate at end',
            'Squeeze rear delts, return'
        ]
    },

    // Incline Press
    incline_dumbbell_press: {
        keyframes: `
      @keyframes incline {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(15px); }
      }
    `,
        description: 'Press dumbbells up on incline bench',
        steps: [
            'Set bench to 30-45 degrees',
            'Hold dumbbells at chest',
            'Press up until arms extended',
            'Lower with control',
            'Repeat for desired reps'
        ]
    },

    // Leg Curl
    leg_curl: {
        keyframes: `
      @keyframes legcurl {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(-90deg); }
      }
    `,
        description: 'Curl legs up toward glutes on machine',
        steps: [
            'Lie face down on machine',
            'Position pad above heels',
            'Curl legs toward glutes',
            'Squeeze hamstrings at top',
            'Lower with control'
        ]
    },

    // Leg Extension
    leg_extension: {
        keyframes: `
      @keyframes legext {
        0%, 100% { transform: rotate(-60deg); }
        50% { transform: rotate(0deg); }
      }
    `,
        description: 'Extend legs to straight position on machine',
        steps: [
            'Sit in machine with pad on shins',
            'Grip handles for stability',
            'Extend legs to straight',
            'Squeeze quads at top',
            'Lower with control'
        ]
    },
};

// Get animation data for a specific exercise
export function getExerciseAnimation(exerciseId: string) {
    return EXERCISE_ANIMATIONS[exerciseId] || EXERCISE_ANIMATIONS['push_up']; // Default to push-up
}

// Generate CSS for exercise animation
export function generateAnimationCSS(exerciseId: string): string {
    const animation = EXERCISE_ANIMATIONS[exerciseId];
    if (!animation) return '';
    return animation.keyframes;
}
