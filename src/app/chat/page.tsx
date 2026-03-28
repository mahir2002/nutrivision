'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import Navigation from '@/components/Navigation';
import { EXERCISE_ANIMATIONS } from '@/data/exerciseAnimations';
import { getUserProfile, saveUserProfile } from '@/lib/storage';
import { calculateMacros } from '@/lib/calculations';
import { generateWorkoutPlan, getSplitName, WorkoutPlan, WorkoutExercise as WorkoutExerciseType } from '@/lib/workouts';
import { UserProfile, NutritionTargets, GOAL_LABELS } from '@/types/user';

interface Message {
    id: string;
    role: 'ai' | 'user';
    content: string;
    timestamp: Date;
    quickReplies?: string[];
    workoutPlan?: ChatWorkoutExercise[];
    nutritionPlan?: NutritionTargets;
    isGenerating?: boolean;
}

interface ChatWorkoutExercise {
    id: string;
    name: string;
    sets: number;
    reps: string;
    rest: number;
    muscleGroup: string;
}

type ConversationState =
    | 'greeting'
    | 'ask_goal'
    | 'ask_days'
    | 'ask_equipment'
    | 'ask_experience'
    | 'generating_workout'
    | 'show_workout'
    | 'ask_nutrition'
    | 'generating_nutrition'
    | 'show_nutrition'
    | 'complete';

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [conversationState, setConversationState] = useState<ConversationState>('greeting');
    const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
    const [tempPreferences, setTempPreferences] = useState<{
        goal?: string;
        days?: number;
        equipment?: string;
        experience?: string;
    }>({});

    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load user profile on mount
    useEffect(() => {
        const profile = getUserProfile();
        if (profile) {
            setUserProfile(profile);
        }

        // Start conversation with greeting
        setTimeout(() => {
            addAIMessage(getGreetingMessage(profile), ['Create workout plan 💪', 'Create nutrition plan 🥗', 'Update my goals 🎯']);
        }, 500);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    function getGreetingMessage(profile: UserProfile | null): string {
        if (profile) {
            return `Hey ${profile.name}! 👋 I'm your AI fitness coach. I can help you create personalized workout plans with exercise demonstrations, and nutrition plans tailored to your ${GOAL_LABELS[profile.fitnessGoal]} goal. What would you like to work on today?`;
        }
        return `Hey there! 👋 I'm your AI fitness coach. I can create personalized workout and nutrition plans just for you, complete with animated exercise demonstrations. What would you like to start with?`;
    }

    function addAIMessage(content: string, quickReplies?: string[], extras?: Partial<Message>) {
        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'ai',
            content,
            timestamp: new Date(),
            quickReplies,
            ...extras,
        };
        setMessages(prev => [...prev, newMessage]);
    }

    function addUserMessage(content: string) {
        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, newMessage]);
    }

    async function handleSend(message: string) {
        if (!message.trim()) return;

        addUserMessage(message);
        setInputValue('');
        setIsTyping(true);

        // Process based on conversation state
        await processMessage(message.toLowerCase());

        setIsTyping(false);
    }

    async function processMessage(message: string) {
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

        // IMPORTANT: Check conversation state FIRST before trigger keywords
        // This prevents quick reply emojis from re-triggering initial questions
        if (conversationState === 'ask_goal') {
            handleGoalSelection(message);
        } else if (conversationState === 'ask_days') {
            handleDaysSelection(message);
        } else if (conversationState === 'ask_equipment') {
            handleEquipmentSelection(message);
        } else if (conversationState === 'ask_experience') {
            handleExperienceSelection(message);
        } else if (conversationState === 'show_workout' || conversationState === 'show_nutrition') {
            if (message.includes('apply') || message.includes('✅')) {
                handleApplyPlan();
            } else if (message.includes('adjust')) {
                addAIMessage(
                    "No problem! What would you like to adjust?",
                    ['More exercises', 'Less exercises', 'Different split', 'More rest days']
                );
            } else if (message.includes('nutrition') || message.includes('🥗')) {
                // Allow switching to nutrition plan
                handleNutritionRequest();
            } else if (message.includes('workout') || message.includes('view')) {
                addAIMessage(
                    "You can view your full workout plan in the Workout tab! 💪",
                    ['Create nutrition plan', 'Done for now']
                );
            } else {
                addAIMessage(
                    "Is there anything else you'd like me to help with?",
                    ['Create nutrition plan', 'View exercises', 'Done for now']
                );
            }
        } else if (conversationState === 'complete') {
            // Reset for new conversation
            if (message.includes('workout') || message.includes('💪')) {
                setConversationState('ask_goal');
                addAIMessage(
                    "Let's create another workout plan! 🏋️ What's your fitness goal this time?",
                    ['Fat Loss 🔥', 'Muscle Gain 💪', 'General Fitness 🎯', 'Body Recomposition']
                );
            } else if (message.includes('nutrition') || message.includes('🥗')) {
                handleNutritionRequest();
            } else if (message.includes('done') || message.includes('exit')) {
                addAIMessage(
                    "Great chatting with you! Come back anytime you need help with your fitness journey. 💪🔥",
                    ['Start new chat']
                );
                setConversationState('greeting');
            } else {
                addAIMessage(
                    "What else can I help you with?",
                    ['Create workout plan 💪', 'Create nutrition plan 🥗', 'Done for now']
                );
            }
        } else {
            // Greeting state or unknown - check for trigger keywords
            if (message.includes('workout') || message.includes('💪') || message.includes('exercise')) {
                setConversationState('ask_goal');
                addAIMessage(
                    "Great choice! Let's build you a killer workout plan. 🏋️ First, what's your primary fitness goal?",
                    ['Fat Loss 🔥', 'Muscle Gain 💪', 'General Fitness 🎯', 'Body Recomposition']
                );
            } else if (message.includes('nutrition') || message.includes('🥗') || message.includes('diet') || message.includes('food')) {
                handleNutritionRequest();
            } else if (message.includes('update') || message.includes('goals') || message.includes('🎯')) {
                setConversationState('ask_goal');
                addAIMessage(
                    "Let's update your fitness goals! What would you like to focus on?",
                    ['Fat Loss 🔥', 'Muscle Gain 💪', 'Body Recomposition', 'General Fitness 🎯']
                );
            } else if (message.includes('start') || message.includes('new') || message.includes('hello') || message.includes('hi')) {
                addAIMessage(
                    "Hey! Ready to crush your fitness goals? What would you like to work on?",
                    ['Create workout plan 💪', 'Create nutrition plan 🥗', 'Update my goals 🎯']
                );
            } else {
                // Default response
                addAIMessage(
                    "I'm here to help you crush your fitness goals! What would you like to work on?",
                    ['Create workout plan 💪', 'Create nutrition plan 🥗', 'Update my goals 🎯']
                );
            }
        }
    }

    function handleNutritionRequest() {
        if (userProfile) {
            setConversationState('generating_nutrition');
            addAIMessage("Perfect! Let me calculate your personalized nutrition plan based on your profile... 🧮", undefined, { isGenerating: true });

            setTimeout(() => {
                const targets = calculateMacros(userProfile);
                setMessages(prev => prev.map(m =>
                    m.isGenerating ? { ...m, isGenerating: false } : m
                ));
                addAIMessage(
                    `Here's your personalized nutrition plan for ${GOAL_LABELS[userProfile.fitnessGoal]}! 🎯`,
                    ['Apply this plan ✅', 'Adjust calories', 'Create workout instead'],
                    { nutritionPlan: targets }
                );
                setConversationState('show_nutrition');
            }, 2000);
        } else {
            addAIMessage(
                "I'd love to create a nutrition plan for you! But first, I need a few details. What's your primary fitness goal?",
                ['Fat Loss 🔥', 'Muscle Gain 💪', 'General Fitness 🎯']
            );
            setConversationState('ask_goal');
        }
    }

    function handleGoalSelection(message: string) {
        let goal = 'general_fitness';
        if (message.includes('fat') || message.includes('loss') || message.includes('🔥')) {
            goal = 'fat_loss';
        } else if (message.includes('muscle') || message.includes('gain') || message.includes('💪')) {
            goal = 'muscle_gain';
        } else if (message.includes('recomp')) {
            goal = 'recomposition';
        }

        setTempPreferences(prev => ({ ...prev, goal }));
        setConversationState('ask_days');
        addAIMessage(
            `${goal === 'muscle_gain' ? '💪 Building muscle' : goal === 'fat_loss' ? '🔥 Burning fat' : '🎯 Getting fit'} - excellent choice! How many days per week can you commit to training?`,
            ['3 days/week', '4 days/week', '5 days/week', '6 days/week']
        );
    }

    function handleDaysSelection(message: string) {
        let days = 4;
        if (message.includes('3')) days = 3;
        else if (message.includes('4')) days = 4;
        else if (message.includes('5')) days = 5;
        else if (message.includes('6')) days = 6;

        setTempPreferences(prev => ({ ...prev, days }));
        setConversationState('ask_equipment');
        addAIMessage(
            `${days} days - that's a solid commitment! 📅 What equipment do you have access to?`,
            ['Full gym access 🏋️', 'Home with dumbbells', 'Bodyweight only', 'Home gym setup']
        );
    }

    function handleEquipmentSelection(message: string) {
        let equipment = 'gym';
        if (message.includes('body') || message.includes('only')) {
            equipment = 'none';
        } else if (message.includes('dumbbell') || message.includes('home with')) {
            equipment = 'home_basic';
        } else if (message.includes('home gym')) {
            equipment = 'home_full';
        }

        setTempPreferences(prev => ({ ...prev, equipment }));
        setConversationState('ask_experience');
        addAIMessage(
            `Great! And what's your experience level with weight training?`,
            ['Beginner (< 1 year)', 'Intermediate (1-3 years)', 'Advanced (3+ years)']
        );
    }

    function handleExperienceSelection(message: string) {
        let experience = 'intermediate';
        if (message.includes('beginner') || message.includes('< 1')) {
            experience = 'beginner';
        } else if (message.includes('advanced') || message.includes('3+')) {
            experience = 'advanced';
        }

        setTempPreferences(prev => ({ ...prev, experience }));
        generateWorkoutPlanFromChat(experience);
    }

    async function generateWorkoutPlanFromChat(experience: string) {
        setConversationState('generating_workout');
        addAIMessage(
            "🔥 Perfect! I'm creating your personalized workout plan now. This will include exercise animations so you can see proper form...",
            undefined,
            { isGenerating: true }
        );

        // Simulate AI generation time
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Build or use profile
        const profile: UserProfile = userProfile || {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            name: 'User',
            age: 25,
            heightCm: 175,
            weightKg: 75,
            fitnessGoal: (tempPreferences.goal as 'fat_loss' | 'muscle_gain' | 'recomposition' | 'general_fitness') || 'muscle_gain',
            gymDaysPerWeek: tempPreferences.days || 4,
            activityLevel: 'moderately_active',
            experienceLevel: (experience as 'beginner' | 'intermediate' | 'advanced') || 'intermediate',
            equipmentAccess: (tempPreferences.equipment as 'none' | 'home_basic' | 'home_full' | 'gym') || 'gym',
            dietaryPreferences: [],
            allergies: [],
            mealsPerDay: 3,
        };

        // Generate the workout plan
        const workoutPlan = generateWorkoutPlan(profile);
        setGeneratedPlan(workoutPlan);
        const firstDay = workoutPlan.days[0];

        // Convert to our chat exercise format
        const exercises: ChatWorkoutExercise[] = firstDay.exercises.map((ex: WorkoutExerciseType) => ({
            id: ex.exercise.id,
            name: ex.exercise.name,
            sets: ex.sets,
            reps: `${ex.repsMin}-${ex.repsMax}`,
            rest: ex.restSeconds,
            muscleGroup: ex.exercise.muscleGroups.join(', ')
        }));

        // Remove generating message and add result
        setMessages(prev => prev.filter(m => !m.isGenerating));

        addAIMessage(
            `🎉 Here's your ${tempPreferences.days}-day ${getSplitName(workoutPlan.split)} workout plan! Tap any exercise to see the animated demonstration.`,
            ['Apply this plan ✅', 'Show me other days', 'Regenerate plan'],
            { workoutPlan: exercises }
        );

        setConversationState('show_workout');

        // Save the profile if new
        if (!userProfile) {
            saveUserProfile(profile);
            setUserProfile(profile);
        }
    }

    function handleApplyPlan() {
        addAIMessage(
            "✅ Your plan has been saved! You can access it anytime from the Workout tab. Ready to crush it! 💪",
            ['View my workout', 'Create nutrition plan', 'Done for now']
        );
        setConversationState('complete');
    }

    function handleQuickReply(reply: string) {
        handleSend(reply);
    }

    function openExerciseAnimation(exerciseId: string) {
        setSelectedExercise(exerciseId);
    }

    function closeExerciseAnimation() {
        setSelectedExercise(null);
    }

    function getAnimationClass(exerciseId: string): string {
        if (exerciseId.includes('push') || exerciseId.includes('bench')) return styles.pushupAnimation;
        if (exerciseId.includes('squat') || exerciseId.includes('lunge') || exerciseId.includes('leg_press')) return styles.squatAnimation;
        if (exerciseId.includes('curl')) return styles.curlAnimation;
        if (exerciseId.includes('pull')) return styles.pullupAnimation;
        return '';
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.aiAvatar}>🤖</div>
                    <div className={styles.headerText}>
                        <h1>AI Fitness Coach</h1>
                        <p>Personalized workout & nutrition plans</p>
                    </div>
                </div>
                <div className={styles.statusIndicator}>
                    <div className={styles.statusDot}></div>
                    <span>Online</span>
                </div>
            </div>

            {/* Chat Area */}
            <div className={styles.chatArea}>
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`${styles.message} ${message.role === 'ai' ? styles.aiMessage : styles.userMessage}`}
                    >
                        <div className={styles.messageBubble}>
                            {message.content}

                            {/* Generating Indicator */}
                            {message.isGenerating && (
                                <div className={styles.generatingCard}>
                                    <div className={styles.loader}></div>
                                    <span className={styles.generatingText}>Generating your personalized plan...</span>
                                </div>
                            )}

                            {/* Workout Plan Card */}
                            {message.workoutPlan && (
                                <div className={styles.workoutPlanCard}>
                                    <div className={styles.planHeader}>
                                        <span className={styles.planTitle}>🏋️ Day 1 Workout</span>
                                        <span className={styles.planDays}>{tempPreferences.days} days/week</span>
                                    </div>
                                    <div className={styles.exerciseList}>
                                        {message.workoutPlan.map((exercise, idx) => (
                                            <div
                                                key={exercise.id}
                                                className={styles.exerciseItem}
                                                onClick={() => openExerciseAnimation(exercise.id)}
                                            >
                                                <div className={styles.exerciseItemHeader}>
                                                    <span className={styles.exerciseNumber}>{idx + 1}</span>
                                                    <span className={styles.exerciseName}>{exercise.name}</span>
                                                    <button className={styles.viewAnimationBtn}>▶ Demo</button>
                                                </div>
                                                <div className={styles.exerciseDetails}>
                                                    <span className={styles.exerciseDetail}>
                                                        Sets: <span>{exercise.sets}</span>
                                                    </span>
                                                    <span className={styles.exerciseDetail}>
                                                        Reps: <span>{exercise.reps}</span>
                                                    </span>
                                                    <span className={styles.exerciseDetail}>
                                                        Rest: <span>{exercise.rest}s</span>
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className={styles.applyButton} onClick={handleApplyPlan}>
                                        Apply This Plan ✅
                                    </button>
                                </div>
                            )}

                            {/* Nutrition Plan Card */}
                            {message.nutritionPlan && (
                                <div className={styles.nutritionPlanCard}>
                                    <div className={styles.caloriesDisplay}>
                                        <div className={styles.caloriesValue}>{message.nutritionPlan.calories}</div>
                                        <div className={styles.caloriesLabel}>calories / day</div>
                                    </div>
                                    <div className={styles.macroGrid}>
                                        <div className={styles.macroItem}>
                                            <div className={styles.macroIcon}>🥩</div>
                                            <div className={styles.macroValue}>{message.nutritionPlan.protein}g</div>
                                            <div className={styles.macroLabel}>Protein</div>
                                        </div>
                                        <div className={styles.macroItem}>
                                            <div className={styles.macroIcon}>🍚</div>
                                            <div className={styles.macroValue}>{message.nutritionPlan.carbs}g</div>
                                            <div className={styles.macroLabel}>Carbs</div>
                                        </div>
                                        <div className={styles.macroItem}>
                                            <div className={styles.macroIcon}>🥑</div>
                                            <div className={styles.macroValue}>{message.nutritionPlan.fat}g</div>
                                            <div className={styles.macroLabel}>Fat</div>
                                        </div>
                                    </div>
                                    <button className={styles.applyButton} onClick={handleApplyPlan}>
                                        Apply This Plan ✅
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Quick Replies */}
                        {message.role === 'ai' && message.quickReplies && !message.isGenerating && (
                            <div className={styles.quickReplies}>
                                {message.quickReplies.map((reply, idx) => (
                                    <button
                                        key={idx}
                                        className={styles.quickReply}
                                        onClick={() => handleQuickReply(reply)}
                                    >
                                        {reply}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className={styles.messageTime}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className={styles.typingIndicator}>
                        <div className={styles.typingDot}></div>
                        <div className={styles.typingDot}></div>
                        <div className={styles.typingDot}></div>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className={styles.inputArea}>
                <div className={styles.inputContainer}>
                    <input
                        ref={inputRef}
                        type="text"
                        className={styles.chatInput}
                        placeholder="Type a message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
                    />
                    <button
                        className={styles.sendButton}
                        onClick={() => handleSend(inputValue)}
                        disabled={!inputValue.trim() || isTyping}
                    >
                        ➤
                    </button>
                </div>
            </div>

            {/* Exercise Animation Modal */}
            {selectedExercise && (
                <div className={styles.animationModal} onClick={closeExerciseAnimation}>
                    <div className={styles.animationContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {selectedExercise.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h3>
                            <button className={styles.closeButton} onClick={closeExerciseAnimation}>×</button>
                        </div>

                        <div className={styles.animationArea}>
                            <div className={`${styles.exerciseAnimation} ${styles.animating} ${getAnimationClass(selectedExercise)}`}>
                                <div className={styles.stickFigure}>
                                    <div className={styles.head}></div>
                                    <div className={styles.body}></div>
                                    <div className={styles.leftArm}></div>
                                    <div className={styles.rightArm}></div>
                                    <div className={styles.leftLeg}></div>
                                    <div className={styles.rightLeg}></div>
                                </div>
                            </div>

                            <p className={styles.animationDescription}>
                                {EXERCISE_ANIMATIONS[selectedExercise]?.description || 'Follow proper form for best results'}
                            </p>
                        </div>

                        <div className={styles.stepsSection}>
                            <h4 className={styles.stepsTitle}>How to perform:</h4>
                            <ol className={styles.stepsList}>
                                {(EXERCISE_ANIMATIONS[selectedExercise]?.steps || [
                                    'Start in the starting position',
                                    'Perform the movement with control',
                                    'Focus on the target muscle',
                                    'Return to starting position',
                                    'Repeat for desired reps'
                                ]).map((step, idx) => (
                                    <li key={idx} className={styles.step}>
                                        <span className={styles.stepNumber}>{idx + 1}</span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            )}

            <Navigation />
        </div>
    );
}
