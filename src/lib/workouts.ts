// Workout Plan Generator

import { UserProfile, ExperienceLevel, EquipmentAccess } from '@/types/user';
import {
    Exercise,
    MuscleGroup,
    getExercisesForEquipment,
    getExercisesForLevel,
    getExercisesForMuscle
} from '@/data/exercises';

export type WorkoutSplit = 'full_body' | 'upper_lower' | 'push_pull_legs';

export interface WorkoutExercise {
    exercise: Exercise;
    sets: number;
    repsMin: number;
    repsMax: number;
    restSeconds: number;
    notes?: string;
}

export interface WorkoutDay {
    name: string;
    focus: string;
    muscleGroups: MuscleGroup[];
    exercises: WorkoutExercise[];
    estimatedDuration: number; // minutes
}

export interface WorkoutPlan {
    split: WorkoutSplit;
    daysPerWeek: number;
    days: WorkoutDay[];
    progressionNotes: string[];
    warmupGuidance: string[];
}

/**
 * Determine the best workout split based on days per week
 */
export function determineSplit(daysPerWeek: number): WorkoutSplit {
    if (daysPerWeek <= 3) {
        return 'full_body';
    } else if (daysPerWeek === 4) {
        return 'upper_lower';
    } else {
        return 'push_pull_legs';
    }
}

/**
 * Get rep ranges based on experience level
 */
function getRepRanges(level: ExperienceLevel): { min: number; max: number } {
    switch (level) {
        case 'beginner':
            return { min: 10, max: 15 };
        case 'intermediate':
            return { min: 8, max: 12 };
        case 'advanced':
            return { min: 6, max: 10 };
    }
}

/**
 * Get number of sets based on experience
 */
function getSets(level: ExperienceLevel, isCompound: boolean): number {
    if (level === 'beginner') {
        return isCompound ? 3 : 2;
    } else if (level === 'intermediate') {
        return isCompound ? 4 : 3;
    } else {
        return isCompound ? 4 : 3;
    }
}

/**
 * Get rest time based on exercise type
 */
function getRestTime(isCompound: boolean, level: ExperienceLevel): number {
    if (isCompound) {
        return level === 'advanced' ? 180 : 120;
    } else {
        return level === 'advanced' ? 90 : 60;
    }
}

/**
 * Select best exercises for a muscle group
 */
function selectExercises(
    availableExercises: Exercise[],
    muscles: MuscleGroup[],
    level: ExperienceLevel,
    count: number
): Exercise[] {
    const selected: Exercise[] = [];
    const usedIds = new Set<string>();

    // Prioritize compound exercises first
    for (const muscle of muscles) {
        const muscleExercises = getExercisesForMuscle(availableExercises, muscle);
        const compounds = muscleExercises.filter(e => e.isCompound && !usedIds.has(e.id));

        if (compounds.length > 0 && selected.length < count) {
            const exercise = compounds[0];
            selected.push(exercise);
            usedIds.add(exercise.id);
        }
    }

    // Fill remaining with isolation exercises
    for (const muscle of muscles) {
        const muscleExercises = getExercisesForMuscle(availableExercises, muscle);
        const isolations = muscleExercises.filter(e => !e.isCompound && !usedIds.has(e.id));

        for (const exercise of isolations) {
            if (selected.length >= count) break;
            selected.push(exercise);
            usedIds.add(exercise.id);
        }
    }

    return selected;
}

/**
 * Generate Full Body workout days
 */
function generateFullBodyDays(
    exercises: Exercise[],
    level: ExperienceLevel,
    daysPerWeek: number
): WorkoutDay[] {
    const repRanges = getRepRanges(level);
    const days: WorkoutDay[] = [];

    const dayConfigs = [
        { name: 'Full Body A', focus: 'Compound Focus', priority: ['chest', 'back', 'quads'] as MuscleGroup[] },
        { name: 'Full Body B', focus: 'Strength Focus', priority: ['shoulders', 'hamstrings', 'core'] as MuscleGroup[] },
        { name: 'Full Body C', focus: 'Volume Focus', priority: ['back', 'glutes', 'biceps'] as MuscleGroup[] },
    ];

    for (let i = 0; i < daysPerWeek; i++) {
        const config = dayConfigs[i % dayConfigs.length];
        const allMuscles: MuscleGroup[] = ['chest', 'back', 'shoulders', 'quads', 'hamstrings', 'core'];

        const dayExercises = selectExercises(exercises, allMuscles, level, 6);

        days.push({
            name: config.name,
            focus: config.focus,
            muscleGroups: allMuscles,
            exercises: dayExercises.map(ex => ({
                exercise: ex,
                sets: getSets(level, ex.isCompound),
                repsMin: repRanges.min,
                repsMax: repRanges.max,
                restSeconds: getRestTime(ex.isCompound, level),
            })),
            estimatedDuration: 45 + (level === 'beginner' ? 0 : 15),
        });
    }

    return days;
}

/**
 * Generate Upper/Lower split workout days
 */
function generateUpperLowerDays(
    exercises: Exercise[],
    level: ExperienceLevel
): WorkoutDay[] {
    const repRanges = getRepRanges(level);

    const upperMuscles: MuscleGroup[] = ['chest', 'back', 'shoulders', 'biceps', 'triceps'];
    const lowerMuscles: MuscleGroup[] = ['quads', 'hamstrings', 'glutes', 'calves', 'core'];

    const upperExercises = selectExercises(exercises, upperMuscles, level, 6);
    const lowerExercises = selectExercises(exercises, lowerMuscles, level, 6);

    return [
        {
            name: 'Upper Body A',
            focus: 'Push Emphasis',
            muscleGroups: upperMuscles,
            exercises: upperExercises.map(ex => ({
                exercise: ex,
                sets: getSets(level, ex.isCompound),
                repsMin: repRanges.min,
                repsMax: repRanges.max,
                restSeconds: getRestTime(ex.isCompound, level),
            })),
            estimatedDuration: 50,
        },
        {
            name: 'Lower Body A',
            focus: 'Quad Emphasis',
            muscleGroups: lowerMuscles,
            exercises: lowerExercises.map(ex => ({
                exercise: ex,
                sets: getSets(level, ex.isCompound),
                repsMin: repRanges.min,
                repsMax: repRanges.max,
                restSeconds: getRestTime(ex.isCompound, level),
            })),
            estimatedDuration: 50,
        },
        {
            name: 'Upper Body B',
            focus: 'Pull Emphasis',
            muscleGroups: upperMuscles,
            exercises: upperExercises.map(ex => ({
                exercise: ex,
                sets: getSets(level, ex.isCompound),
                repsMin: repRanges.min,
                repsMax: repRanges.max,
                restSeconds: getRestTime(ex.isCompound, level),
            })),
            estimatedDuration: 50,
        },
        {
            name: 'Lower Body B',
            focus: 'Posterior Emphasis',
            muscleGroups: lowerMuscles,
            exercises: lowerExercises.map(ex => ({
                exercise: ex,
                sets: getSets(level, ex.isCompound),
                repsMin: repRanges.min,
                repsMax: repRanges.max,
                restSeconds: getRestTime(ex.isCompound, level),
            })),
            estimatedDuration: 50,
        },
    ];
}

/**
 * Generate Push/Pull/Legs split workout days
 */
function generatePPLDays(
    exercises: Exercise[],
    level: ExperienceLevel,
    daysPerWeek: number
): WorkoutDay[] {
    const repRanges = getRepRanges(level);

    const pushMuscles: MuscleGroup[] = ['chest', 'shoulders', 'triceps'];
    const pullMuscles: MuscleGroup[] = ['back', 'biceps'];
    const legMuscles: MuscleGroup[] = ['quads', 'hamstrings', 'glutes', 'calves'];

    const pushExercises = selectExercises(exercises, pushMuscles, level, 5);
    const pullExercises = selectExercises(exercises, pullMuscles, level, 5);
    const legExercises = selectExercises(exercises, legMuscles, level, 5);

    const baseDays: WorkoutDay[] = [
        {
            name: 'Push Day',
            focus: 'Chest, Shoulders, Triceps',
            muscleGroups: pushMuscles,
            exercises: pushExercises.map(ex => ({
                exercise: ex,
                sets: getSets(level, ex.isCompound),
                repsMin: repRanges.min,
                repsMax: repRanges.max,
                restSeconds: getRestTime(ex.isCompound, level),
            })),
            estimatedDuration: 55,
        },
        {
            name: 'Pull Day',
            focus: 'Back, Biceps',
            muscleGroups: pullMuscles,
            exercises: pullExercises.map(ex => ({
                exercise: ex,
                sets: getSets(level, ex.isCompound),
                repsMin: repRanges.min,
                repsMax: repRanges.max,
                restSeconds: getRestTime(ex.isCompound, level),
            })),
            estimatedDuration: 55,
        },
        {
            name: 'Legs Day',
            focus: 'Quads, Hamstrings, Glutes',
            muscleGroups: legMuscles,
            exercises: legExercises.map(ex => ({
                exercise: ex,
                sets: getSets(level, ex.isCompound),
                repsMin: repRanges.min,
                repsMax: repRanges.max,
                restSeconds: getRestTime(ex.isCompound, level),
            })),
            estimatedDuration: 55,
        },
    ];

    // For 6 days, repeat the cycle
    if (daysPerWeek >= 6) {
        return [...baseDays, ...baseDays.map(d => ({ ...d, name: d.name + ' (2)' }))];
    }

    return baseDays.slice(0, daysPerWeek);
}

/**
 * Generate a complete workout plan based on user profile
 */
export function generateWorkoutPlan(profile: UserProfile): WorkoutPlan {
    const split = determineSplit(profile.gymDaysPerWeek);

    // Get exercises available for this user
    let availableExercises = getExercisesForEquipment(profile.equipmentAccess);
    availableExercises = getExercisesForLevel(availableExercises, profile.experienceLevel);

    let days: WorkoutDay[];

    switch (split) {
        case 'full_body':
            days = generateFullBodyDays(availableExercises, profile.experienceLevel, profile.gymDaysPerWeek);
            break;
        case 'upper_lower':
            days = generateUpperLowerDays(availableExercises, profile.experienceLevel);
            break;
        case 'push_pull_legs':
            days = generatePPLDays(availableExercises, profile.experienceLevel, profile.gymDaysPerWeek);
            break;
    }

    return {
        split,
        daysPerWeek: profile.gymDaysPerWeek,
        days,
        progressionNotes: getProgressionNotes(profile.experienceLevel),
        warmupGuidance: getWarmupGuidance(),
    };
}

/**
 * Get progression advice based on level
 */
function getProgressionNotes(level: ExperienceLevel): string[] {
    const baseNotes = [
        'Track your weights and reps each session',
        'Aim to increase reps or weight each week',
        'If you hit the top of the rep range for all sets, increase weight next session',
    ];

    if (level === 'beginner') {
        return [
            ...baseNotes,
            'Focus on learning proper form before adding weight',
            'Start lighter than you think - form is priority',
            'Rest at least 48 hours between training the same muscles',
        ];
    } else if (level === 'intermediate') {
        return [
            ...baseNotes,
            'Consider periodizing your training (deload every 4-6 weeks)',
            'Add 2.5-5kg to compound lifts when progressing',
            'Focus on mind-muscle connection for isolation exercises',
        ];
    } else {
        return [
            ...baseNotes,
            'Implement periodization cycles',
            'Consider RPE-based training for auto-regulation',
            'Track training volume and adjust based on recovery',
        ];
    }
}

/**
 * Get warmup guidance
 */
function getWarmupGuidance(): string[] {
    return [
        '5-10 minutes of light cardio to raise heart rate',
        'Dynamic stretching for the muscles you\'ll train',
        'For compound lifts: 2-3 warmup sets with lighter weight',
        'First warmup set: 40-50% of working weight for 10-15 reps',
        'Second warmup set: 60-70% of working weight for 6-8 reps',
        'Optional third warmup: 80-85% for 3-4 reps before working sets',
    ];
}

/**
 * Get split name for display
 */
export function getSplitName(split: WorkoutSplit): string {
    switch (split) {
        case 'full_body':
            return 'Full Body';
        case 'upper_lower':
            return 'Upper / Lower';
        case 'push_pull_legs':
            return 'Push / Pull / Legs';
    }
}
