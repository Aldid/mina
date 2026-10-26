import { SkinMetrics, SkincareRoutine, SkincareStep, SkinType, ZoneAnalysis } from '../types';

/**
 * Mina Dermatological Skincare Protocol Generator
 * Generates clinical AM & PM routines, active ingredient matches,
 * contraindications, and lifestyle tips tailored strictly to biometric skin metrics.
 */
export function generateSkincareProtocol(metrics: SkinMetrics): SkincareRoutine {
  const { skinType, hydration, sebumControl, rednessSensitivity, poreClarity, eyeAreaFatigue } = metrics;

  const amSteps: SkincareStep[] = [];
  const pmSteps: SkincareStep[] = [];
  const keyIngredients: { ingredient: string; benefit: string }[] = [];
  const ingredientsToAvoid: { ingredient: string; reason: string }[] = [];
  const weeklyRituals: string[] = [];
  const lifestyleTips: string[] = [];

  // ==========================================
  // AM ROUTINE (Morning Protection & Balance)
  // ==========================================

  // Step 1: AM Cleanser
  if (skinType === 'Dry' || skinType === 'Sensitive') {
    amSteps.push({
      order: 1,
      phase: 'Cleanse',
      productName: 'Hydra-Soothe Milk Cleanser',
      productType: 'Non-foaming cream cleanser with amino acids',
      targetConcerns: ['Preserving lipid barrier', 'Preventing morning tightness'],
      keyActives: ['Colloidal Oatmeal', 'Glycerin', 'Panthenol (B5)'],
      usageAdvice: 'Wash gently with lukewarm water. Do not scrub; pat dry with a soft clean towel.',
    });
  } else if (skinType === 'Oily') {
    amSteps.push({
      order: 1,
      phase: 'Cleanse',
      productName: 'Purifying Sebum-Control Foaming Gel',
      productType: 'Low-pH BHA foaming cleanser',
      targetConcerns: ['Dissolving overnight sebum', 'Unclogging pores'],
      keyActives: ['0.5% Salicylic Acid', 'Zinc PCA', 'Tea Tree Leaf Extract'],
      usageAdvice: 'Lather for 45 seconds focusing gently on the T-zone, then rinse thoroughly.',
    });
  } else {
    amSteps.push({
      order: 1,
      phase: 'Cleanse',
      productName: 'Gentle Botanical Balancing Gel',
      productType: 'pH 5.5 daily gentle cleanser',
      targetConcerns: ['Daily freshness', 'pH balance'],
      keyActives: ['Green Tea Extract', 'Allantoin', 'Centella Asiatica'],
      usageAdvice: 'Apply a dime-sized amount to wet hands, massage gently, and rinse clean.',
    });
  }

  // Step 2: AM Toner / Essence
  if (hydration < 50 || skinType === 'Dry') {
    amSteps.push({
      order: 2,
      phase: 'Tone & Prep',
      productName: 'Multi-Depth Hyaluronic Essence Toner',
      productType: 'Viscous plumping hydrating toner',
      targetConcerns: ['Dehydration lines', 'Deep moisture saturation'],
      keyActives: ['5 Molecular Weights of Hyaluronic Acid', 'Beta-Glucan'],
      usageAdvice: 'Press 2–3 layers gently into the skin using palms until completely absorbed.',
    });
  } else if (rednessSensitivity < 55 || skinType === 'Sensitive') {
    amSteps.push({
      order: 2,
      phase: 'Tone & Prep',
      productName: 'Cica Calm Calming Mist Toner',
      productType: 'Soothing barrier-relief toner',
      targetConcerns: ['Erythema reduction', 'Cooling reactive skin'],
      keyActives: ['80% Centella Asiatica Water', 'Madecassoside', 'Artemisia'],
      usageAdvice: 'Mist evenly across face and neck or press gently with fingers.',
    });
  } else {
    amSteps.push({
      order: 2,
      phase: 'Tone & Prep',
      productName: 'Pore Clarifying Refreshing Toner',
      productType: 'Balancing botanical toner',
      targetConcerns: ['Refining skin texture', 'Antioxidant prep'],
      keyActives: ['Heartleaf Extract', 'Niacinamide 2%', 'Witch Hazel Leaf'],
      usageAdvice: 'Sweep lightly with a cotton pad or pat in with hands.',
    });
  }

  // Step 3: AM Targeted Treatment / Serum
  if (poreClarity < 60 || sebumControl < 50) {
    amSteps.push({
      order: 3,
      phase: 'Target & Treat',
      productName: 'Niacinamide 5% + Zinc Barrier Serum',
      productType: 'Oil-regulation & pore-refining serum',
      targetConcerns: ['Excess sebum', 'Pore enlargement', 'Uneven texture'],
      keyActives: ['5% Pure Niacinamide', '1% Zinc PCA', 'Hyaluronic Acid'],
      usageAdvice: 'Dispense 3–4 drops onto forehead and cheeks; smooth evenly without tugging.',
    });
  } else if (eyeAreaFatigue < 55) {
    amSteps.push({
      order: 3,
      phase: 'Target & Treat',
      productName: 'Vitamin C 10% Radiance + Eye Peptide Serum',
      productType: 'Brightening antioxidant concentrate',
      targetConcerns: ['Dullness', 'Dark circles', 'Environmental protection'],
      keyActives: ['10% Stabilized Vitamin C (3-O-Ethyl Ascorbic Acid)', 'Caffeine', 'Ferulic Acid'],
      usageAdvice: 'Apply around orbital bone and face before heavier creams.',
    });
  } else {
    amSteps.push({
      order: 3,
      phase: 'Target & Treat',
      productName: 'Copper Peptide Firming Elixir',
      productType: 'Rejuvenating collagen support serum',
      targetConcerns: ['Skin firmness', 'Cellular recovery'],
      keyActives: ['Copper Tripeptide-1', 'Adenosine', 'Niacinamide'],
      usageAdvice: 'Pat 3 drops into face and neck using upward strokes.',
    });
  }

  // Step 4: AM Moisturizer
  if (skinType === 'Oily') {
    amSteps.push({
      order: 4,
      phase: 'Hydrate & Seal',
      productName: 'Aqua Gel Water-Burst Hydrator',
      productType: 'Oil-free weightless gel moisturizer',
      targetConcerns: ['Weightless hydration', 'Shine-free finish'],
      keyActives: ['Polyglutamic Acid', 'Birch Sap Extract', 'Squalane'],
      usageAdvice: 'Apply a pea-sized amount evenly. Absorbs instantly with a natural matte finish.',
    });
  } else {
    amSteps.push({
      order: 4,
      phase: 'Hydrate & Seal',
      productName: 'Ceramide Barrier Recovery Emulsion',
      productType: 'Lightweight lipid-restoring fluid',
      targetConcerns: ['Trans-epidermal water loss', 'Strengthening lipid matrix'],
      keyActives: ['Ceramides NP/AP/EOP', 'Cholesterol', 'Fatty Acids (3:1:1 Ratio)'],
      usageAdvice: 'Smooth over face and neck until a soft protective moisture veil forms.',
    });
  }

  // Step 5: AM Sun Protection (Non-Negotiable)
  amSteps.push({
    order: 5,
    phase: 'Sun Defense',
    productName: 'Broad-Spectrum Invisible Shield Fluid SPF 50+ PA++++',
    productType: 'Hybrid photostable UV fluid',
    targetConcerns: ['Photo-aging prevention', 'UV damage', 'Pigmentation defense'],
    keyActives: ['Uvinul A Plus', 'Tinosorb S', 'Centella Extract'],
    usageAdvice: 'Apply two full finger-lengths as the final morning step 15 minutes before sun exposure.',
  });

  // ==========================================
  // PM ROUTINE (Night Restoration & Repair)
  // ==========================================

  // Step 1: PM Double Cleanse (Oil / Balm)
  pmSteps.push({
    order: 1,
    phase: 'Cleanse',
    productName: 'Melt-Away Botanical Cleansing Oil',
    productType: 'Emulsifying evening first cleanse',
    targetConcerns: ['Dissolving SPF and airborne particulate pollution', 'Sebum breakdown'],
    keyActives: ['Jojoba Seed Oil', 'Sunflower Seed Oil', 'Vitamin E'],
    usageAdvice: 'Massage onto dry skin for 60 seconds. Add warm water to emulsify into milky wash, then rinse.',
  });

  // Step 2: PM Second Cleanse
  pmSteps.push({
    order: 2,
    phase: 'Cleanse',
    productName: 'Ultra-Mild Rebalancing Gel Wash',
    productType: 'Sulfate-free micro-bubble cleanser',
    targetConcerns: ['Gentle residue removal without stripping'],
    keyActives: ['Sodium Cocoyl Isethionate', 'Allantoin', 'Chamomile Extract'],
    usageAdvice: 'Follow immediately after oil cleanser on damp skin, rinse thoroughly.',
  });

  // Step 3: PM Actives / Overnight Cell Renewal
  if (skinType === 'Oily' || poreClarity < 55) {
    pmSteps.push({
      order: 3,
      phase: 'Target & Treat',
      productName: '2% BHA Pore Decongesting Liquid',
      productType: 'Leave-on chemical exfoliant',
      targetConcerns: ['Blackheads', 'Excess keratin buildup', 'Sebaceous filaments'],
      keyActives: ['2% Salicylic Acid', 'Green Tea Extract'],
      usageAdvice: 'Use 2–3 evenings per week. Apply with fingers; do not rinse off.',
    });
  } else if (metrics.firmnessElasticity < 65 || metrics.overallHealthScore < 70) {
    pmSteps.push({
      order: 3,
      phase: 'Target & Treat',
      productName: 'Encapsulated Retinol 0.3% Repair Serum',
      productType: 'Slow-release cellular turnover treatment',
      targetConcerns: ['Texture smoothing', 'Collagen density', 'Cellular turnover'],
      keyActives: ['0.3% Micro-encapsulated Retinol', 'Bakuchiol', 'Peptides'],
      usageAdvice: 'Apply a pea-sized amount to completely dry skin at night. Start 2 nights per week.',
    });
  } else {
    pmSteps.push({
      order: 3,
      phase: 'Target & Treat',
      productName: 'Bifida Ferment Night Recovery Ampoule',
      productType: 'Microbiome restoration concentrate',
      targetConcerns: ['Overnight barrier regeneration', 'Microbiome diversity'],
      keyActives: ['Bifida Ferment Lysate', 'Lactobacillus', 'Hyaluronic Acid'],
      usageAdvice: 'Pat 1 full dropper gently into face and neck.',
    });
  }

  // Step 4: PM Nourishing Barrier Cream
  pmSteps.push({
    order: 4,
    phase: 'Hydrate & Seal',
    productName: 'Overnight Intensive Barrier Balm',
    productType: 'Rich occlusive night recovery cream',
    targetConcerns: ['Locking in nighttime actives', 'Preventing overnight moisture evaporation'],
    keyActives: ['5 Ceramides Complex', 'Shea Butter', 'Madecassoside', 'Squalane'],
    usageAdvice: 'Warm between fingertips and gently press into skin as the final nighttime step.',
  });

  // ==========================================
  // INGREDIENTS TO SEEK & AVOID
  // ==========================================

  if (hydration < 60) {
    keyIngredients.push({
      ingredient: 'Hyaluronic Acid (Multi-weight)',
      benefit: 'Draws moisture 1000x its weight into deeper epidermal layers.',
    });
    keyIngredients.push({
      ingredient: 'Beta-Glucan',
      benefit: '20% more hydrating than hyaluronic acid with deep soothing properties.',
    });
  }

  if (rednessSensitivity < 60) {
    keyIngredients.push({
      ingredient: 'Centella Asiatica (Cica / Madecassoside)',
      benefit: 'Rapidly calms micro-inflammation and reinforces vascular capillary walls.',
    });
    keyIngredients.push({
      ingredient: 'Panthenol (Pro-Vitamin B5)',
      benefit: 'Accelerates epidermal wound healing and reinforces stratum corneum.',
    });
  }

  if (sebumControl < 60) {
    keyIngredients.push({
      ingredient: 'Niacinamide (Vitamin B3)',
      benefit: 'Normalizes sebaceous gland excretion and tightens lax pore walls.',
    });
    keyIngredients.push({
      ingredient: 'Zinc PCA',
      benefit: 'Inhibits 5-alpha reductase to control shine and soothe blemishes.',
    });
  }

  keyIngredients.push({
    ingredient: 'Ceramides (NP, AP, EOP)',
    benefit: 'The essential building blocks of your natural intercellular lipid glue.',
  });

  // Contraindications / Ingredients to Avoid
  if (skinType === 'Sensitive' || rednessSensitivity < 55) {
    ingredientsToAvoid.push({
      ingredient: 'Denatured Alcohol (Alcohol Denat / SD Alcohol)',
      reason: 'Strips lipid barrier causing rebound oiliness, burning, and severe redness.',
    });
    ingredientsToAvoid.push({
      ingredient: 'Synthetic Fragrances & Essential Oils (Linalool, Limonene)',
      reason: 'Top causes of contact dermatitis and sensitization in compromised barriers.',
    });
  }

  if (skinType === 'Oily' || poreClarity < 60) {
    ingredientsToAvoid.push({
      ingredient: 'Isopropyl Myristate & Heavy Coconut Oil',
      reason: 'High comedogenic rating (4–5); traps sebum and leads to congestion.',
    });
  }

  ingredientsToAvoid.push({
    ingredient: 'Physical Walnut / Apricot Shell Scrubs',
    reason: 'Causes microscopic epidermal tears; replace with gentle enzymatic or BHA exfoliants.',
  });

  // ==========================================
  // WEEKLY RITUALS & LIFESTYLE ADVICE
  // ==========================================

  if (skinType === 'Oily' || poreClarity < 60) {
    weeklyRituals.push('Kaolin & Bentonite Clay Clarifying Mask — once a week for 10 minutes.');
  }
  if (skinType === 'Dry' || hydration < 55) {
    weeklyRituals.push('Overnight Sheet Mask with Panthenol & Squalane — 2 times weekly.');
  }
  weeklyRituals.push('Gentle enzymatic exfoliation (Papain/Bromelain) — every Sunday evening.');
  weeklyRituals.push('Silk or satin pillowcase rotation — wash every 3–4 days to prevent bacterial transfer.');

  lifestyleTips.push('Target 2.2L–2.5L daily water intake to maintain cellular turgor from within.');
  lifestyleTips.push('Maintain bedroom humidity between 45%–55%, especially in air-conditioned environments.');
  lifestyleTips.push('Minimize touching your face or resting your smartphone directly against your cheek.');
  lifestyleTips.push('Ensure 7.5–8 hours of uninterrupted sleep for nighttime growth hormone peak repair.');

  return {
    am: amSteps,
    pm: pmSteps,
    weeklyRituals,
    keyIngredientsToSeek: keyIngredients,
    ingredientsToAvoid,
    lifestyleAndDietTips: lifestyleTips,
  };
}

/**
 * 4 Curated Preset Profiles for 1-Click Instant Demo Testing
 */
export const MINA_PRESETS: {
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
}[] = [
  {
    id: 'preset-combination-vietnam',
    title: 'Combination & Urban Exposure',
    subtitle: 'Inspired by Hanoi / Saigon climate profile',
    tag: 'Popular',
    avatarColor: 'from-amber-400 to-rose-400',
    previewMetrics: {
      skinType: 'Combination',
      score: 74,
      primaryConcern: 'T-Zone shine & enlarged pores',
    },
    sampleMetrics: {
      overallHealthScore: 74,
      skinType: 'Combination',
      primaryConcern: 'T-Zone oiliness & cheek dehydration',
      secondaryConcern: 'Mild pore congestion',
      hydration: 62,
      sebumControl: 54,
      barrierHealth: 78,
      poreClarity: 58,
      rednessSensitivity: 72,
      firmnessElasticity: 82,
      eyeAreaFatigue: 68,
      zones: [
        {
          zone: 'Forehead',
          metric: 'Excess Sebum',
          score: 55,
          severity: 'Mild',
          observation: 'Noticeable sheen with minor texture irregularities.',
          recommendation: 'Incorporate 5% Niacinamide in morning routine.',
        },
        {
          zone: 'T-Zone',
          metric: 'Pore Congestion',
          score: 52,
          severity: 'Needs Attention',
          observation: 'Enlarged pores around nasal bridge with mild sebum buildup.',
          recommendation: 'Use gentle 2% BHA treatment twice weekly.',
        },
        {
          zone: 'Cheeks',
          metric: 'Moisture Level',
          score: 80,
          severity: 'Optimal',
          observation: 'Smooth texture, balanced lipid levels, minimal redness.',
          recommendation: 'Maintain lightweight ceramide protection.',
        },
        {
          zone: 'Under-Eye',
          metric: 'Micro-Circulation',
          score: 66,
          severity: 'Mild',
          observation: 'Mild vascular darkness from screen fatigue.',
          recommendation: 'Apply caffeine-infused eye gel morning and night.',
        },
        {
          zone: 'Chin',
          metric: 'Barrier Integrity',
          score: 75,
          severity: 'Optimal',
          observation: 'Calm skin with no active inflammatory lesions.',
          recommendation: 'Ensure thorough double-cleansing in the evening.',
        },
      ],
    },
  },
  {
    id: 'preset-sensitive-cica',
    title: 'Dehydrated & Reactive Barrier',
    subtitle: 'Sensitivity & capillary redness',
    tag: 'Sensitive',
    avatarColor: 'from-rose-400 to-pink-500',
    previewMetrics: {
      skinType: 'Sensitive',
      score: 61,
      primaryConcern: 'Erythema & compromised barrier',
    },
    sampleMetrics: {
      overallHealthScore: 61,
      skinType: 'Sensitive',
      primaryConcern: 'Capillary redness & tight moisture barrier',
      secondaryConcern: 'Reactivity to environmental triggers',
      hydration: 44,
      sebumControl: 68,
      barrierHealth: 51,
      poreClarity: 74,
      rednessSensitivity: 48,
      firmnessElasticity: 70,
      eyeAreaFatigue: 62,
      zones: [
        {
          zone: 'Forehead',
          metric: 'Dehydration Lines',
          score: 58,
          severity: 'Mild',
          observation: 'Superficial dryness lines when expressive.',
          recommendation: 'Layer multiple applications of hydrating essence.',
        },
        {
          zone: 'T-Zone',
          metric: 'Lipid Balance',
          score: 70,
          severity: 'Optimal',
          observation: 'No excessive sebum; slightly delicate.',
          recommendation: 'Avoid harsh foaming cleansers.',
        },
        {
          zone: 'Cheeks',
          metric: 'Capillary Reactivity',
          score: 42,
          severity: 'Needs Attention',
          observation: 'Flushed erythema with visible capillary sensitivity.',
          recommendation: 'High-concentration Centella Asiatica & Panthenol.',
        },
        {
          zone: 'Under-Eye',
          metric: 'Thinning Epidermis',
          score: 55,
          severity: 'Mild',
          observation: 'Skin is delicate and susceptible to dryness.',
          recommendation: 'Seal with fragrance-free squalane balm.',
        },
        {
          zone: 'Chin',
          metric: 'Micro-Peeling',
          score: 50,
          severity: 'Needs Attention',
          observation: 'Localized flaking around perimeter.',
          recommendation: 'Apply ceramide repair cream generously.',
        },
      ],
    },
  },
  {
    id: 'preset-oily-blemish',
    title: 'Oily & Blemish-Prone',
    subtitle: 'High sebum excretion & active congestion',
    tag: 'Clarifying',
    avatarColor: 'from-emerald-400 to-teal-500',
    previewMetrics: {
      skinType: 'Oily',
      score: 65,
      primaryConcern: 'Active sebum overproduction & blackheads',
    },
    sampleMetrics: {
      overallHealthScore: 65,
      skinType: 'Oily',
      primaryConcern: 'Excessive sebaceous excretion',
      secondaryConcern: 'Pore enlargement & oxidative blackheads',
      hydration: 55,
      sebumControl: 42,
      barrierHealth: 72,
      poreClarity: 46,
      rednessSensitivity: 64,
      firmnessElasticity: 86,
      eyeAreaFatigue: 75,
      zones: [
        {
          zone: 'Forehead',
          metric: 'Sebum Production',
          score: 45,
          severity: 'Needs Attention',
          observation: 'Persistent midday shine across entire frontal plane.',
          recommendation: 'Zinc PCA serum and oil-free hydrator.',
        },
        {
          zone: 'T-Zone',
          metric: 'Pore Congestion',
          score: 38,
          severity: 'Needs Attention',
          observation: 'Open comedones and pronounced pores on nose.',
          recommendation: 'Daily gentle 2% Salicylic Acid wash.',
        },
        {
          zone: 'Cheeks',
          metric: 'Texture Uniformity',
          score: 65,
          severity: 'Mild',
          observation: 'Occasional post-inflammatory spots.',
          recommendation: 'Niacinamide to fade discoloration.',
        },
        {
          zone: 'Under-Eye',
          metric: 'Restfulness',
          score: 78,
          severity: 'Optimal',
          observation: 'Good elasticity and minimal dark pigmentation.',
          recommendation: 'Maintain lightweight antioxidant eye hydration.',
        },
        {
          zone: 'Chin',
          metric: 'Hormonal Congestion',
          score: 48,
          severity: 'Needs Attention',
          observation: 'Sub-surface micro-cysts along jawline.',
          recommendation: 'Spot treatment with Azelaic Acid.',
        },
      ],
    },
  },
  {
    id: 'preset-radiant-balanced',
    title: 'Radiant & Balanced Glass Skin',
    subtitle: 'Healthy lipid barrier & high hydration',
    tag: 'Optimal',
    avatarColor: 'from-purple-400 to-indigo-500',
    previewMetrics: {
      skinType: 'Normal',
      score: 89,
      primaryConcern: 'Maintenance & antioxidant defense',
    },
    sampleMetrics: {
      overallHealthScore: 89,
      skinType: 'Normal',
      primaryConcern: 'Environmental defense & UV prevention',
      secondaryConcern: 'Maintaining natural moisture barrier',
      hydration: 88,
      sebumControl: 84,
      barrierHealth: 92,
      poreClarity: 85,
      rednessSensitivity: 89,
      firmnessElasticity: 91,
      eyeAreaFatigue: 82,
      zones: [
        {
          zone: 'Forehead',
          metric: 'Luminosity',
          score: 90,
          severity: 'Optimal',
          observation: 'Smooth, natural glow with balanced sebum production.',
          recommendation: 'Continue daily Vitamin C antioxidant shield.',
        },
        {
          zone: 'T-Zone',
          metric: 'Pore Refining',
          score: 84,
          severity: 'Optimal',
          observation: 'Refined pores with clean follicular openings.',
          recommendation: 'Weekly gentle enzyme exfoliation.',
        },
        {
          zone: 'Cheeks',
          metric: 'Elasticity & Moisture',
          score: 92,
          severity: 'Optimal',
          observation: 'Plump extracellular matrix with optimal turgor.',
          recommendation: 'Maintain hyaluronic acid and peptide serum.',
        },
        {
          zone: 'Under-Eye',
          metric: 'Smooth Contour',
          score: 82,
          severity: 'Optimal',
          observation: 'Minimal dark circles, healthy micro-circulation.',
          recommendation: 'Caffeine and peptide hydration.',
        },
        {
          zone: 'Chin',
          metric: 'Uniformity',
          score: 88,
          severity: 'Optimal',
          observation: 'Uniform skin tone with strong barrier resilience.',
          recommendation: 'Nightly ceramide barrier cream.',
        },
      ],
    },
  },
];

/**
 * Deterministically simulates skin metric analysis from uploaded images
 * using pixel luminance, color distribution, and facial aspect heuristics.
 */
export function analyzeImageHeuristics(canvas: HTMLCanvasElement): SkinMetrics {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return MINA_PRESETS[0].sampleMetrics;
  }

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let totalBrightness = 0;
  const count = data.length / 4;

  // Sample every 4th pixel for speed
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    totalR += r;
    totalG += g;
    totalB += b;
    totalBrightness += (r * 0.299 + g * 0.587 + b * 0.114);
  }

  const sampledCount = count / 4;
  const avgR = totalR / sampledCount;
  const avgG = totalG / sampledCount;
  const avgB = totalB / sampledCount;
  const avgBrightness = totalBrightness / sampledCount;

  // Calculate redness ratio (R relative to G and B)
  const rednessRatio = avgR / (Math.max(1, (avgG + avgB) / 2));
  // Calculate contrast / variance as texture proxy
  const skinType: SkinType =
    rednessRatio > 1.25 ? 'Sensitive' :
    avgBrightness > 160 ? 'Combination' :
    avgBrightness < 100 ? 'Dry' : 'Oily';

  const hydration = Math.min(95, Math.max(35, Math.round(avgBrightness * 0.45 + (skinType === 'Dry' ? -15 : 10))));
  const rednessSensitivity = Math.min(95, Math.max(30, Math.round(100 - (rednessRatio - 1) * 120)));
  const sebumControl = Math.min(95, Math.max(35, Math.round(skinType === 'Oily' ? 45 : skinType === 'Dry' ? 85 : 65)));
  const poreClarity = Math.min(95, Math.max(40, Math.round(sebumControl * 0.8 + 15)));
  const barrierHealth = Math.min(98, Math.max(45, Math.round((hydration + rednessSensitivity) / 2)));
  const eyeAreaFatigue = Math.min(95, Math.max(45, Math.round(avgBrightness * 0.5 + 20)));
  const firmnessElasticity = Math.min(95, Math.max(55, Math.round((barrierHealth + hydration) / 2)));

  const overallHealthScore = Math.round(
    hydration * 0.25 +
    barrierHealth * 0.25 +
    sebumControl * 0.2 +
    poreClarity * 0.15 +
    rednessSensitivity * 0.15
  );

  const zones: ZoneAnalysis[] = [
    {
      zone: 'Forehead',
      metric: 'Sebum Balance',
      score: sebumControl,
      severity: sebumControl < 50 ? 'Needs Attention' : sebumControl < 70 ? 'Mild' : 'Optimal',
      observation: sebumControl < 50 ? 'Visible lipid sheen across frontal plane.' : 'Well-regulated epidermal barrier.',
      recommendation: sebumControl < 50 ? 'Use lightweight water-gel with Niacinamide.' : 'Maintain gentle antioxidant hydration.',
    },
    {
      zone: 'T-Zone',
      metric: 'Pore Clarity',
      score: poreClarity,
      severity: poreClarity < 50 ? 'Needs Attention' : poreClarity < 70 ? 'Mild' : 'Optimal',
      observation: poreClarity < 50 ? 'Localized micro-congestion and enlarged pores.' : 'Refined pore structure.',
      recommendation: 'Targeted BHA salicylic acid treatment.',
    },
    {
      zone: 'Cheeks',
      metric: 'Hydration & Capillaries',
      score: rednessSensitivity,
      severity: rednessSensitivity < 50 ? 'Needs Attention' : rednessSensitivity < 70 ? 'Mild' : 'Optimal',
      observation: rednessSensitivity < 50 ? 'Erythema and reactive flushing detected.' : 'Balanced lipid mantle.',
      recommendation: 'Centella Asiatica and Madecassoside barrier serum.',
    },
    {
      zone: 'Under-Eye',
      metric: 'Fatigue & Micro-Circulation',
      score: eyeAreaFatigue,
      severity: eyeAreaFatigue < 55 ? 'Needs Attention' : 'Optimal',
      observation: eyeAreaFatigue < 55 ? 'Mild vascular pooling and dryness.' : 'Smooth contour.',
      recommendation: 'Caffeine peptide eye concentrate.',
    },
    {
      zone: 'Chin',
      metric: 'Barrier Resilience',
      score: barrierHealth,
      severity: barrierHealth < 60 ? 'Needs Attention' : 'Optimal',
      observation: barrierHealth < 60 ? 'Delicate stratum corneum.' : 'Strong cellular adhesion.',
      recommendation: 'Ceramide-rich overnight recovery balm.',
    },
  ];

  return {
    overallHealthScore,
    skinType,
    primaryConcern:
      skinType === 'Sensitive' ? 'Capillary redness & sensitivity' :
      skinType === 'Oily' ? 'Sebum overproduction & pore congestion' :
      skinType === 'Dry' ? 'Moisture deficit & barrier tightness' : 'T-Zone balance & hydration',
    secondaryConcern: 'Daily UV & environmental defense',
    hydration,
    sebumControl,
    barrierHealth,
    poreClarity,
    rednessSensitivity,
    firmnessElasticity,
    eyeAreaFatigue,
    zones,
  };
}
