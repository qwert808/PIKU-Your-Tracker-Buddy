import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDefaultDaySlots,
  calculateCategoryStats,
  formatHourRange,
} from './timeframeCalculations';

test('createDefaultDaySlots creates 24 unrecorded slots', () => {
  const slots = createDefaultDaySlots();
  assert.equal(Object.keys(slots).length, 24);
  assert.equal(slots[0].hour, 0);
  assert.equal(slots[23].hour, 23);
  assert.equal(slots[12].category, 'Unrecorded');
});

test('calculateCategoryStats aggregates hours correctly', () => {
  const slots = createDefaultDaySlots();
  slots[9] = { hour: 9, category: 'Productive', activity: 'Coding' };
  slots[10] = { hour: 10, category: 'Productive', activity: 'Review' };
  slots[12] = { hour: 12, category: 'Necessary', activity: 'Lunch' };
  slots[20] = { hour: 20, category: 'Leisure / Rest', activity: 'Reading' };
  slots[23] = { hour: 23, category: 'Unproductive', activity: 'Doomscrolling' };

  const stats = calculateCategoryStats(slots);
  assert.equal(stats.hoursByCategory['Productive'], 2);
  assert.equal(stats.hoursByCategory['Necessary'], 1);
  assert.equal(stats.hoursByCategory['Leisure / Rest'], 1);
  assert.equal(stats.hoursByCategory['Unproductive'], 1);
  assert.equal(stats.hoursByCategory['Unrecorded'], 19);
  assert.equal(stats.recordedHours, 5);
  // Productive ratio = 2 / 5 = 40%
  assert.equal(stats.productiveRatio, 40);
});

test('formatHourRange formats cleanly', () => {
  assert.equal(formatHourRange(9), '09:00 – 10:00');
  assert.equal(formatHourRange(23), '23:00 – 00:00');
});
