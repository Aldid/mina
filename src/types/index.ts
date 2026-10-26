export type SkinType = 'Normal' | 'Dry' | 'Oily' | 'Combination' | 'Sensitive';

export type ConcernSeverity = 'Optimal' | 'Mild' | 'Needs Attention';

export interface ZoneAnalysis {
  zone: 'Forehead' | 'T-Zone' | 'Cheeks' | 'Under-Eye' | 'Chin';
  metric: string;
  score: number; // 0 - 100
  severity: ConcernSeverity;
  observation: string;
  recommendation: string;
}

export interface SkinMetrics {
  overallHealthScore: number; // 0 - 100
  skinType: SkinType;
  primaryConcern: string;
  secondaryConcern: string;
  hydration: number; // 0 - 100
  sebumControl: number; // 0 - 100
  barrierHealth: number; // 0 - 100
  poreClarity: number; // 0 - 100
  rednessSensitivity: number; // 0 - 100
  firmnessElasticity: number; // 0 - 100
  eyeAreaFatigue: number; // 0 - 100
  zones: ZoneAnalysis[];
}

export interface SkincareStep {
  order: number;
  phase: 'Cleanse' | 'Tone & Prep' | 'Target & Treat' | 'Hydrate & Seal' | 'Sun Defense';
  productName: string;
  productType: string;
  targetConcerns: string[];
  keyActives: string[];
  usageAdvice: string;
}

export interface SkincareRoutine {
  am: SkincareStep[];
  pm: SkincareStep[];
  weeklyRituals: string[];
  keyIngredientsToSeek: {
    ingredient: string;
    benefit: string;
  }[];
  ingredientsToAvoid: {
    ingredient: string;
    reason: string;
  }[];
  lifestyleAndDietTips: string[];
}

export interface ScanResult {
  id: string;
  timestamp: string;
  imageSource: 'webcam' | 'upload' | 'preset';
  metrics: SkinMetrics;
  routine: SkincareRoutine;
}

export interface PresetProfile {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  avatarColor: string;
  previewMetrics: {
    skinType: SkinType;
    score: number;
    primaryConcern: string;
  };
  sampleMetrics: SkinMetrics;
}
