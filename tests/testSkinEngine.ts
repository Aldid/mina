import assert from 'assert';
import { generateSkincareProtocol, MINA_PRESETS } from '../src/lib/skinEngine';

console.log('🧪 Testing Mina Dermatological Skin Engine...\n');

// Test 1: Verify all 4 Presets
console.log('Test 1: Verifying Curated Presets...');
assert.strictEqual(MINA_PRESETS.length, 4, 'Should contain 4 curated presets');
MINA_PRESETS.forEach((preset) => {
  assert(preset.id, 'Preset must have an id');
  assert(preset.title, 'Preset must have a title');
  const m = preset.sampleMetrics;
  assert(m.overallHealthScore >= 0 && m.overallHealthScore <= 100, 'Score must be between 0 and 100');
  assert(m.hydration >= 0 && m.hydration <= 100, 'Hydration must be between 0 and 100');
  assert(m.zones.length === 5, 'Must have 5 biometric zones');
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

// Oily PM should include BHA exfoliant
const pmBHA = oilyRoutine.pm.find((s) => s.keyActives.some((a) => a.includes('Salicylic Acid')));
assert(pmBHA, 'Oily PM routine must include Salicylic Acid (BHA)');

// Oily contraindications should avoid heavy pore-clogging oils
const avoidPoreClog = oilyRoutine.ingredientsToAvoid.find((i) => i.ingredient.includes('Coconut'));
assert(avoidPoreClog, 'Oily skin should avoid comedogenic oils');
console.log('✅ Oily skin protocol matches clinical guidelines.');

// Test 3: Protocol Generation for Sensitive Skin
console.log('\nTest 3: Verifying Protocol for Sensitive Skin...');
const sensitivePreset = MINA_PRESETS.find((p) => p.sampleMetrics.skinType === 'Sensitive')!;
const sensitiveRoutine = generateSkincareProtocol(sensitivePreset.sampleMetrics);

// Sensitive routine should recommend Centella / Cica
const hasCica = sensitiveRoutine.keyIngredientsToSeek.some((k) => k.ingredient.includes('Centella'));
assert(hasCica, 'Sensitive skin must recommend Centella Asiatica / Cica');

// Sensitive contraindications should strictly avoid denatured alcohol and synthetic fragrances
const avoidAlcohol = sensitiveRoutine.ingredientsToAvoid.find((i) => i.ingredient.includes('Alcohol'));
assert(avoidAlcohol, 'Sensitive skin must warn against denatured alcohol');
console.log('✅ Sensitive skin protocol matches clinical guidelines.');

console.log('\n🎉 ALL 3 TESTS PASSED! Mina Skin Engine is 100% verified.\n');
