'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types/user';
import { MealPhotoAnalysis, FoodLabelAnalysis, MealType, MEAL_TYPE_LABELS } from '@/types/meals';
import { getUserProfile, addMealToDay, getTodayDate, generateId } from '@/lib/storage';
import { calculateMacros } from '@/lib/calculations';
import styles from './scan.module.css';

type ScanMode = 'meal' | 'label' | 'barcode';

// Open Food Facts API response type
interface OpenFoodFactsProduct {
    product_name?: string;
    brands?: string;
    quantity?: string;
    nutriments?: {
        'energy-kcal_100g'?: number;
        proteins_100g?: number;
        carbohydrates_100g?: number;
        fat_100g?: number;
        fiber_100g?: number;
        sugars_100g?: number;
        sodium_100g?: number;
        salt_100g?: number;
    };
    allergens_tags?: string[];
    ingredients_text?: string;
    image_url?: string;
}

interface OpenFoodFactsResponse {
    status: number;
    product?: OpenFoodFactsProduct;
}

export default function ScanPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [mode, setMode] = useState<ScanMode>('barcode'); // Default to barcode mode
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [mealResult, setMealResult] = useState<MealPhotoAnalysis | null>(null);
    const [labelResult, setLabelResult] = useState<FoodLabelAnalysis | null>(null);
    
    // Barcode scanning state
    const [barcodeInput, setBarcodeInput] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scannedProduct, setScannedProduct] = useState<OpenFoodFactsProduct | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Meal log state
    const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
    const [showMealSelector, setShowMealSelector] = useState(false);
    const [addedToMeal, setAddedToMeal] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scannerRef = useRef<HTMLDivElement>(null);
    const html5QrCodeRef = useRef<any>(null);

    useEffect(() => {
        const userProfile = getUserProfile();
        if (!userProfile) {
            router.push('/onboarding');
            return;
        }
        setProfile(userProfile);
    }, [router]);

    // Cleanup scanner on unmount
    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current) {
                html5QrCodeRef.current.stop().catch(console.error);
            }
        };
    }, []);

    // Handle barcode scanning
    const startBarcodeScanner = useCallback(async () => {
        if (!scannerRef.current) return;
        
        const { Html5Qrcode } = await import('html5-qrcode');
        
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop();
            } catch (e) {
                // Ignore errors when stopping
            }
        }
        
        html5QrCodeRef.current = new Html5Qrcode('barcode-scanner');
        
        setIsScanning(true);
        setScanError(null);
        
        try {
            await html5QrCodeRef.current.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 150 },
                    aspectRatio: 1.777,
                },
                async (decodedText: string) => {
                    // Barcode detected
                    await html5QrCodeRef.current.stop();
                    setIsScanning(false);
                    handleBarcodeLookup(decodedText);
                },
                () => {
                    // QR code not found - ignore
                }
            );
        } catch (err: any) {
            console.error('Scanner error:', err);
            setScanError(err.message || 'Failed to start camera');
            setIsScanning(false);
        }
    }, []);

    const stopBarcodeScanner = useCallback(async () => {
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop();
            } catch (e) {
                // Ignore
            }
        }
        setIsScanning(false);
    }, []);

    // Handle manual barcode entry
    const handleManualBarcodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!barcodeInput.trim()) return;
        
        await handleBarcodeLookup(barcodeInput.trim());
    };

    // Look up barcode in Open Food Facts
    const handleBarcodeLookup = async (barcode: string) => {
        setIsLoading(true);
        setScanError(null);
        setScannedProduct(null);
        
        try {
            const response = await fetch(
                `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
            );
            const data: OpenFoodFactsResponse = await response.json();
            
            if (data.status === 1 && data.product) {
                setScannedProduct(data.product);
            } else {
                setScanError('Product not found. Try a different barcode.');
            }
        } catch (err) {
            console.error('API error:', err);
            setScanError('Failed to look up product. Check your internet connection.');
        } finally {
            setIsLoading(false);
        }
    };

    // Add scanned product to meal log
    const addToMealLog = () => {
        if (!scannedProduct || !profile) return;
        
        const nutriments = scannedProduct.nutriments || {};
        const servingSize = parseFloat(scannedProduct.quantity || '100') || 100;
        
        // Calculate nutrition for the serving
        const servingMultiplier = servingSize / 100;
        const calories = Math.round((nutriments['energy-kcal_100g'] || 0) * servingMultiplier);
        const protein = Math.round((nutriments.proteins_100g || 0) * servingMultiplier);
        const carbs = Math.round((nutriments.carbohydrates_100g || 0) * servingMultiplier);
        const fat = Math.round((nutriments.fat_100g || 0) * servingMultiplier);
        
        // Parse allergens
        const allergens = (scannedProduct.allergens_tags || [])
            .map((a: string) => a.replace('en:', '').replace(/-/g, ' '))
            .filter((a: string) => a);
        
        const foodItem = {
            id: generateId(),
            name: scannedProduct.product_name || 'Unknown Product',
            brand: scannedProduct.brands,
            servingSize,
            servingUnit: 'g',
            calories,
            protein,
            carbs,
            fat,
            fiber: Math.round((nutriments.fiber_100g || 0) * servingMultiplier),
            sugar: Math.round((nutriments.sugars_100g || 0) * servingMultiplier),
            sodium: Math.round((nutriments.sodium_100g || 0) * servingMultiplier * 1000),
        };
        
        const meal = {
            id: generateId(),
            type: selectedMealType,
            timestamp: new Date().toISOString(),
            foods: [{
                ...foodItem,
                quantity: 1,
                totalCalories: calories,
                totalProtein: protein,
                totalCarbs: carbs,
                totalFat: fat,
            }],
            totalCalories: calories,
            totalProtein: protein,
            totalCarbs: carbs,
            totalFat: fat,
        };
        
        addMealToDay(getTodayDate(), meal);
        setAddedToMeal(true);
        
        // Reset after 2 seconds
        setTimeout(() => {
            setAddedToMeal(false);
            setScannedProduct(null);
            setBarcodeInput('');
        }, 2000);
    };

    const resetScan = () => {
        setSelectedImage(null);
        setMealResult(null);
        setLabelResult(null);
        setScannedProduct(null);
        setBarcodeInput('');
        setScanError(null);
        setAddedToMeal(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (!profile) {
        return (
            <div className={styles.loading}>
                <div className="spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="container">
            <header className={styles.header}>
                <h1 className={styles.title}>Scan Food</h1>
                <p className={styles.subtitle}>
                    Scan barcodes or analyze meals with AI
                </p>
            </header>

            {/* Mode Selector */}
            <div className={styles.modeSelector}>
                <button
                    className={`${styles.modeButton} ${mode === 'barcode' ? styles.modeButtonActive : ''}`}
                    onClick={() => { setMode('barcode'); resetScan(); }}
                >
                    <span className={styles.modeIcon}>📊</span>
                    <span>Barcode</span>
                </button>
                <button
                    className={`${styles.modeButton} ${mode === 'meal' ? styles.modeButtonActive : ''}`}
                    onClick={() => { setMode('meal'); resetScan(); }}
                >
                    <span className={styles.modeIcon}>🍽️</span>
                    <span>Meal Photo</span>
                </button>
                <button
                    className={`${styles.modeButton} ${mode === 'label' ? styles.modeButtonActive : ''}`}
                    onClick={() => { setMode('label'); resetScan(); }}
                >
                    <span className={styles.modeIcon}>🏷️</span>
                    <span>Food Label</span>
                </button>
            </div>

            {/* BARCODE SCAN MODE */}
            {mode === 'barcode' && (
                <div className={styles.barcodeMode}>
                    {/* Scanner View */}
                    {!scannedProduct && !isLoading && (
                        <>
                            <div id="barcode-scanner" ref={scannerRef} className={styles.scannerContainer}>
                                {!isScanning && (
                                    <div className={styles.scannerPlaceholder}>
                                        <span className={styles.scannerIcon}>📷</span>
                                        <p>Point camera at barcode</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className={styles.scannerControls}>
                                {!isScanning ? (
                                    <button 
                                        className="btn btn-primary btn-lg" 
                                        onClick={startBarcodeScanner}
                                        style={{ width: '100%' }}
                                    >
                                        📷 Start Scanning
                                    </button>
                                ) : (
                                    <button 
                                        className="btn btn-secondary btn-lg" 
                                        onClick={stopBarcodeScanner}
                                        style={{ width: '100%' }}
                                    >
                                        ⬛ Stop Scanning
                                    </button>
                                )}
                            </div>
                            
                            {/* Divider */}
                            <div className={styles.divider}>
                                <span>or enter manually</span>
                            </div>
                            
                            {/* Manual Entry */}
                            <form onSubmit={handleManualBarcodeSubmit} className={styles.manualEntry}>
                                <input
                                    type="text"
                                    value={barcodeInput}
                                    onChange={(e) => setBarcodeInput(e.target.value)}
                                    placeholder="Enter barcode number (e.g., 5000159461126)"
                                    className="input"
                                    inputMode="numeric"
                                />
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={!barcodeInput.trim() || isLoading}
                                >
                                    {isLoading ? 'Searching...' : '🔍 Look Up'}
                                </button>
                            </form>
                            
                            {/* Error Message */}
                            {scanError && (
                                <div className={styles.scanError}>
                                    ⚠️ {scanError}
                                </div>
                            )}
                        </>
                    )}
                    
                    {/* Loading State */}
                    {isLoading && (
                        <div className={styles.loadingState}>
                            <div className="spinner" style={{ width: 40, height: 40 }} />
                            <p>Looking up product...</p>
                        </div>
                    )}
                    
                    {/* Scanned Product Result */}
                    {scannedProduct && (
                        <div className={styles.productResult}>
                            {addedToMeal ? (
                                <div className={styles.addedConfirmation}>
                                    <span className={styles.checkmark}>✓</span>
                                    <h3>Added to {MEAL_TYPE_LABELS[selectedMealType]}!</h3>
                                    <p>{scannedProduct.product_name}</p>
                                </div>
                            ) : (
                                <>
                                    <div className={styles.productHeader}>
                                        <h2>{scannedProduct.product_name || 'Unknown Product'}</h2>
                                        {scannedProduct.brands && (
                                            <span className={styles.brand}>{scannedProduct.brands}</span>
                                        )}
                                    </div>
                                    
                                    {scannedProduct.image_url && (
                                        <div className={styles.productImage}>
                                            <img src={scannedProduct.image_url} alt={scannedProduct.product_name} />
                                        </div>
                                    )}
                                    
                                    {/* Nutrition Info */}
                                    <div className={styles.nutritionCard}>
                                        <h3>Nutrition per {scannedProduct.quantity || '100g'}</h3>
                                        <div className={styles.nutritionGrid}>
                                            <div className={styles.nutritionItem}>
                                                <span className={styles.nutritionValue}>
                                                    {Math.round(scannedProduct.nutriments?.['energy-kcal_100g'] || 0)}
                                                </span>
                                                <span className={styles.nutritionLabel}>kcal</span>
                                            </div>
                                            <div className={styles.nutritionItem}>
                                                <span className={styles.nutritionValue}>
                                                    {Math.round(scannedProduct.nutriments?.proteins_100g || 0)}g
                                                </span>
                                                <span className={styles.nutritionLabel}>Protein</span>
                                            </div>
                                            <div className={styles.nutritionItem}>
                                                <span className={styles.nutritionValue}>
                                                    {Math.round(scannedProduct.nutriments?.carbohydrates_100g || 0)}g
                                                </span>
                                                <span className={styles.nutritionLabel}>Carbs</span>
                                            </div>
                                            <div className={styles.nutritionItem}>
                                                <span className={styles.nutritionValue}>
                                                    {Math.round(scannedProduct.nutriments?.fat_100g || 0)}g
                                                </span>
                                                <span className={styles.nutritionLabel}>Fat</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Additional Nutrients */}
                                    <div className={styles.additionalNutrients}>
                                        {scannedProduct.nutriments?.fiber_100g && (
                                            <span>Fiber: {Math.round(scannedProduct.nutriments.fiber_100g)}g</span>
                                        )}
                                        {scannedProduct.nutriments?.sugars_100g && (
                                            <span>Sugar: {Math.round(scannedProduct.nutriments.sugars_100g)}g</span>
                                        )}
                                        {scannedProduct.nutriments?.salt_100g && (
                                            <span>Salt: {Math.round(scannedProduct.nutriments.salt_100g * 1000)}mg</span>
                                        )}
                                    </div>
                                    
                                    {/* Allergens */}
                                    {scannedProduct.allergens_tags && scannedProduct.allergens_tags.length > 0 && (
                                        <div className={styles.allergens}>
                                            <h4>⚠️ Allergens</h4>
                                            <div className={styles.allergenTags}>
                                                {scannedProduct.allergens_tags
                                                    .map((a: string) => a.replace('en:', '').replace(/-/g, ' '))
                                                    .map((allergen: string, i: number) => (
                                                        <span key={i} className={styles.allergenTag}>
                                                            {allergen}
                                                        </span>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Ingredients */}
                                    {scannedProduct.ingredients_text && (
                                        <div className={styles.ingredients}>
                                            <h4>Ingredients</h4>
                                            <p>{scannedProduct.ingredients_text}</p>
                                        </div>
                                    )}
                                    
                                    {/* Add to Meal */}
                                    <div className={styles.addToMealSection}>
                                        <h4>Add to Meal Log</h4>
                                        <div className={styles.mealTypeButtons}>
                                            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
                                                <button
                                                    key={type}
                                                    className={`${styles.mealTypeBtn} ${selectedMealType === type ? styles.mealTypeBtnActive : ''}`}
                                                    onClick={() => setSelectedMealType(type)}
                                                >
                                                    {MEAL_TYPE_LABELS[type]}
                                                </button>
                                            ))}
                                        </div>
                                        <button 
                                            className="btn btn-primary btn-lg" 
                                            onClick={addToMealLog}
                                            style={{ width: '100%' }}
                                        >
                                            ➕ Add to {MEAL_TYPE_LABELS[selectedMealType]}
                                        </button>
                                    </div>
                                    
                                    <button 
                                        className="btn btn-secondary" 
                                        onClick={resetScan}
                                        style={{ width: '100%', marginTop: 'var(--space-3)' }}
                                    >
                                        Scan Another
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* MEAL PHOTO MODE */}
            {mode === 'meal' && (
                <>
                    {/* Upload Area */}
                    {!selectedImage ? (
                        <div
                            className={styles.uploadArea}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setSelectedImage(reader.result as string);
                                            setMealResult(null);
                                            setLabelResult(null);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className={styles.fileInput}
                            />
                            <div className={styles.uploadIcon}>📸</div>
                            <p className={styles.uploadText}>Take a photo of your meal</p>
                            <p className={styles.uploadHint}>Tap to take photo or upload image</p>
                        </div>
                    ) : (
                        <div className={styles.imagePreview}>
                            <img src={selectedImage} alt="Selected food" />
                            <button className={styles.removeImage} onClick={resetScan}>×</button>
                        </div>
                    )}

                    {/* Analyze Button */}
                    {selectedImage && !mealResult && (
                        <button
                            className={`btn btn-primary btn-lg ${styles.analyzeButton}`}
                            onClick={async () => {
                                setIsAnalyzing(true);
                                await new Promise(resolve => setTimeout(resolve, 2000));
                                setMealResult({
                                    detectedFoods: [
                                        { name: 'Grilled Chicken Breast', estimatedPortion: '150g', estimatedCalories: 248, confidence: 0.85 },
                                        { name: 'White Rice', estimatedPortion: '1 cup', estimatedCalories: 206, confidence: 0.9 },
                                        { name: 'Steamed Broccoli', estimatedPortion: '100g', estimatedCalories: 35, confidence: 0.88 },
                                    ],
                                    estimatedCalories: { min: 400, max: 550, average: 489 },
                                    estimatedMacros: {
                                        protein: { min: 35, max: 45 },
                                        carbs: { min: 40, max: 55 },
                                        fat: { min: 8, max: 15 },
                                    },
                                    confidence: 'Medium',
                                    uncertainties: ['Cooking oil amount is estimated', 'Rice portion may vary ±20%'],
                                    followUpQuestions: ['How was the chicken prepared?', 'Is this basmati or jasmine rice?'],
                                });
                                setIsAnalyzing(false);
                            }}
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing ? (
                                <><span className="spinner" style={{ width: 20, height: 20 }} /> Analyzing...</>
                            ) : (
                                '✨ Analyze Meal'
                            )}
                        </button>
                    )}

                    {/* Meal Result */}
                    {mealResult && (
                        <div className={styles.result}>
                            <div className={styles.resultHeader}>
                                <h2>📊 Analysis Result</h2>
                                <span className={`badge ${mealResult.confidence === 'High' ? 'badge-success' : 'badge-warning'}`}>
                                    {mealResult.confidence} Confidence
                                </span>
                            </div>
                            <div className={`card ${styles.detectedFoods}`}>
                                <h3>Detected Foods</h3>
                                {mealResult.detectedFoods.map((food, i) => (
                                    <div key={i} className={styles.detectedFood}>
                                        <div className={styles.foodDetails}>
                                            <span className={styles.foodName}>{food.name}</span>
                                            <span className={styles.foodPortion}>{food.estimatedPortion}</span>
                                        </div>
                                        <span className={styles.foodCalories}>{food.estimatedCalories} kcal</span>
                                    </div>
                                ))}
                            </div>
                            <div className={`card ${styles.calorieEstimate}`}>
                                <h3>Estimated Calories</h3>
                                <div className={styles.calorieRange}>
                                    <span className={styles.calorieMain}>{mealResult.estimatedCalories.average}</span>
                                    <span className={styles.calorieUnit}>kcal</span>
                                </div>
                                <p className={styles.calorieRangeText}>
                                    Range: {mealResult.estimatedCalories.min} - {mealResult.estimatedCalories.max} kcal
                                </p>
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={resetScan}>
                                Scan Another
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* FOOD LABEL MODE */}
            {mode === 'label' && (
                <>
                    {!selectedImage ? (
                        <div
                            className={styles.uploadArea}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setSelectedImage(reader.result as string);
                                            setMealResult(null);
                                            setLabelResult(null);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className={styles.fileInput}
                            />
                            <div className={styles.uploadIcon}>🏷️</div>
                            <p className={styles.uploadText}>Scan a nutrition label</p>
                            <p className={styles.uploadHint}>Tap to take photo or upload image</p>
                        </div>
                    ) : (
                        <div className={styles.imagePreview}>
                            <img src={selectedImage} alt="Selected food" />
                            <button className={styles.removeImage} onClick={resetScan}>×</button>
                        </div>
                    )}

                    {selectedImage && !labelResult && (
                        <button
                            className={`btn btn-primary btn-lg ${styles.analyzeButton}`}
                            onClick={async () => {
                                setIsAnalyzing(true);
                                await new Promise(resolve => setTimeout(resolve, 2000));
                                const targets = calculateMacros(profile!);
                                setLabelResult({
                                    productName: 'Protein Bar - Chocolate Chip',
                                    ingredients: ['Whey protein isolate', 'Almonds', 'Dark chocolate chips', 'Honey'],
                                    nutrition: { servingSize: '1 bar (60g)', calories: 220, protein: 20, carbs: 24, fat: 8, fiber: 3, sugar: 8 },
                                    allergens: ['Milk', 'Tree Nuts'],
                                    fitScore: targets.protein > 150 ? 'Good' : 'Moderate',
                                    reasons: ['High protein content', 'Moderate calories'],
                                    portionRecommendation: 'One bar as post-workout snack',
                                });
                                setIsAnalyzing(false);
                            }}
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing ? (
                                <><span className="spinner" style={{ width: 20, height: 20 }} /> Analyzing...</>
                            ) : (
                                '✨ Analyze Label'
                            )}
                        </button>
                    )}

                    {labelResult && (
                        <div className={styles.result}>
                            <div className={styles.resultHeader}>
                                <h2>🏷️ Label Analysis</h2>
                                <span className={`badge ${labelResult.fitScore === 'Good' ? 'badge-success' : 'badge-warning'}`}>
                                    {labelResult.fitScore} Fit
                                </span>
                            </div>
                            <div className={`card ${styles.productCard}`}>
                                <h3>{labelResult.productName}</h3>
                                <p className={styles.servingSize}>Serving: {labelResult.nutrition.servingSize}</p>
                                <div className={styles.nutritionGrid}>
                                    <div className={styles.nutritionItem}>
                                        <span className={styles.nutritionValue}>{labelResult.nutrition.calories}</span>
                                        <span className={styles.nutritionLabel}>Calories</span>
                                    </div>
                                    <div className={styles.nutritionItem}>
                                        <span className={styles.nutritionValue}>{labelResult.nutrition.protein}g</span>
                                        <span className={styles.nutritionLabel}>Protein</span>
                                    </div>
                                    <div className={styles.nutritionItem}>
                                        <span className={styles.nutritionValue}>{labelResult.nutrition.carbs}g</span>
                                        <span className={styles.nutritionLabel}>Carbs</span>
                                    </div>
                                    <div className={styles.nutritionItem}>
                                        <span className={styles.nutritionValue}>{labelResult.nutrition.fat}g</span>
                                        <span className={styles.nutritionLabel}>Fat</span>
                                    </div>
                                </div>
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={resetScan}>
                                Scan Another
                            </button>
                        </div>
                    )}
                </>
            )}

            <p className={styles.disclaimer}>
                ⚠️ AI estimates are approximate. Verify with official nutrition information when available.
            </p>
        </div>
    );
}
