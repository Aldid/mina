import assert from 'assert';
import { generateSkincareProtocol, MINA_PRESETS } from '../src/lib/skinEngine';

console.log('Testing Mina demonstration profiles and cosmetic routine rules...\n');

// Test 1: Verify all 4 Presets
console.log('Test 1: Verifying Curated Presets...');
assert.strictEqual(MINA_PRESETS.length, 4, 'Should contain 4 curated presets');
MINA_PRESETS.forEach((preset) => {
  assert(preset.id, 'Preset must have an id');
  assert(preset.title, 'Preset must have a title');
  const m = preset.sampleMetrics;
  assert(m.overallHealthScore >= 0 && m.overallHealthScore <= 100, 'Score must be between 0 and 100');
  assert(m.hydration >= 0 && m.hydration <= 100, 'Hydration must be between 0 and 100');
  assert(m.zones.length === 5, 'Demo profile must contain 5 illustrative zones');
});
console.log('✅ Presets verified successfully.');

// Test 2: Protocol Generation for Oily / Acne-Prone Skin
console.log('\nTest 2: Verifying Protocol for Oily Skin...');
const oilyPreset = MINA_PRESETS.find((p) => p.sampleMetrics.skinType === 'Oily')!;
const oilyRoutine = generateSkincareProtocol(oilyPreset.sampleMetrics);

assert(oilyRoutine.am.length >= 4, 'AM routine must have at least 4 steps');
assert(oilyRoutine.pm.length >= 3, 'PM routine must have at least 3 steps');

// Must include Sun Defense in AM
const amSunscreen = oilyRoutine.am.find((s) => s.phase === 'Sun Defense');
assert(amSunscreen, 'AM routine must always include SPF 50+ Sun Defense');

// Optional BHA example stays clearly identified; it is not a treatment prescription.
const pmBHA = oilyRoutine.pm.find((s) => s.keyActives.some((a) => a.includes('салицилат') || a.includes('Салициловая')));
assert(pmBHA, 'Oily demo can describe an optional BHA example');
assert(pmBHA.productName.includes('бетаином салицилатом'), 'Example name must match its actual active');
assert(!pmBHA.productName.includes('салициловой кислотой'), 'Do not label betaine salicylate as salicylic acid');
assert(pmBHA.usageAdvice.includes('не является основанием'), 'Image score must not prescribe starting acid care');

assert(
  !oilyRoutine.ingredientsToAvoid.some((i) => i.ingredient.includes('минеральные масла')),
  'Routine must not make a blanket mineral-oil contraindication'
);
assert(amSunscreen.usageAdvice.includes('каждые 2 часа'), 'Outdoor sunscreen advice must include two-hour reapplication');
assert(amSunscreen.usageAdvice.includes('плавания или потоотделения'), 'Sunscreen advice must cover water and sweat');
console.log('Oily demo keeps optional actives separate from basic care.');

// Test 3: Protocol Generation for Sensitive Skin
console.log('\nTest 3: Verifying Protocol for Sensitive Skin...');
const sensitivePreset = MINA_PRESETS.find((p) => p.sampleMetrics.skinType === 'Sensitive')!;
const sensitiveRoutine = generateSkincareProtocol(sensitivePreset.sampleMetrics);

// Sensitive routine should recommend Centella / Cica
const hasCica = sensitiveRoutine.keyIngredientsToSeek.some((k) => k.ingredient.includes('Центелла') || k.ingredient.includes('Cica'));
assert(hasCica, 'Sensitive skin must recommend Centella Asiatica / Cica');

// Sensitive contraindications should strictly avoid denatured alcohol and synthetic fragrances
const avoidAlcohol = sensitiveRoutine.ingredientsToAvoid.find((i) => i.ingredient.includes('спирт') || i.ingredient.includes('Alcohol'));
assert(avoidAlcohol, 'Sensitive skin must warn against drying alcohol');
console.log('Sensitive demo includes tolerance-aware advice.');

// Regression: a sensitive person can also have shine or visible pores. These must
// not override the gentle-care priority in either morning or evening suggestions.
console.log('\nTest 4: Gentle Care Takes Priority Over Pore / Shine Scores...');
const gentleProfiles = [
  { ...oilyPreset.sampleMetrics, skinType: 'Sensitive' as const, poreClarity: 20, sebumControl: 20, rednessSensitivity: 90, barrierHealth: 90 },
  { ...oilyPreset.sampleMetrics, poreClarity: 20, sebumControl: 20, rednessSensitivity: 40, barrierHealth: 90 },
  { ...oilyPreset.sampleMetrics, poreClarity: 20, sebumControl: 20, rednessSensitivity: 90, barrierHealth: 40 },
];

for (const profile of gentleProfiles) {
  const original = JSON.stringify(profile);
  const routine = generateSkincareProtocol(profile);
  const allSteps = [...routine.am, ...routine.pm];
  assert(
    !allSteps.some((step) => step.keyActives.some((active) => /салицил|BHA/i.test(active))),
    'Sensitivity, redness or low barrier must prevent acid suggestions even with low pore / sebum scores'
  );
  assert(
    routine.pm.some((step) => step.usageAdvice.includes('не вводи кислоты и новые активы')),
    'Gentle routine must explain the decision to avoid adding new actives'
  );
  assert.strictEqual(JSON.stringify(profile), original, 'Generating a routine must not mutate the selected profile');
}
console.log('Sensitivity, redness and low barrier each override acid suggestions.');

console.log('\nAll Mina profile and routine rule checks passed. These tests do not establish clinical validity.\n');
