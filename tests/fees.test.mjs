// =============================================================================
// BRUH TESFA - Fee Calculation & Placement Economics Tests
// =============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import { calculatePlacementFee } from '../src/lib/fees.ts';

test('Fees Engine: Correct 60% placement commission on first-month recurring lessons', () => {
  // Scenario: 400 ETB/hr, 3 sessions/wk, 1.5 hrs each, for 4 weeks (18 hours total)
  // Total contract value: 18 * 400 = 7,200 ETB
  // 60% commission: 4,320 ETB
  // Tutor net earnings in month 1: 2,880 ETB
  const result = calculatePlacementFee({
    contractType: 'first_month_recurring',
    agreedHourlyRateETB: 400,
    lessonsPerWeek: 3,
    hoursPerLesson: 1.5,
    customCommissionPercentage: 60,
  });

  assert.equal(result.totalContractValueETB, 7200);
  assert.equal(result.commissionPercentage, 60);
  assert.equal(result.commissionAmountETB, 4320);
  assert.equal(result.tutorNetFirstMonthETB, 2880);
  assert.equal(result.replacementGuaranteeDays, 14);
  assert.ok(result.basisExplanation.includes('18 total hours @ 400 ETB/hr'));
});

test('Fees Engine: Package hours agreement calculation', () => {
  // Scenario: 20-hour package @ 500 ETB/hr = 10,000 ETB
  // 60% commission = 6,000 ETB
  // Tutor net = 4,000 ETB
  const result = calculatePlacementFee({
    contractType: 'package_hours',
    agreedHourlyRateETB: 500,
    totalPackageHours: 20,
    customCommissionPercentage: 60,
  });

  assert.equal(result.totalContractValueETB, 10000);
  assert.equal(result.commissionAmountETB, 6000);
  assert.equal(result.tutorNetFirstMonthETB, 4000);
});

test('Fees Engine: Custom configured commission rate override', () => {
  // If platform sets custom rate e.g. 50%
  const result = calculatePlacementFee({
    contractType: 'first_month_recurring',
    agreedHourlyRateETB: 450,
    lessonsPerWeek: 2,
    hoursPerLesson: 2, // 16 hours/month @ 450 = 7,200 ETB
    customCommissionPercentage: 50,
  });

  assert.equal(result.totalContractValueETB, 7200);
  assert.equal(result.commissionPercentage, 50);
  assert.equal(result.commissionAmountETB, 3600);
  assert.equal(result.tutorNetFirstMonthETB, 3600);
});
