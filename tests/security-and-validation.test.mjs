// =============================================================================
// BRUH TESFA - Security, Malformed Inputs & Boundary Validation Tests
// =============================================================================

process.env.IS_TEST = 'true';

import test from 'node:test';
import assert from 'node:assert/strict';

import { validateAdminCredentials, verifyAdminSession } from '../src/lib/auth.ts';
import { calculatePlacementFee } from '../src/lib/fees.ts';

test('Security Auth: Rejects wrong password or empty admin key', () => {
  assert.equal(validateAdminCredentials('WrongPassword123'), false);
  assert.equal(validateAdminCredentials(''), false);
  assert.equal(validateAdminCredentials(undefined), false);
  assert.equal(validateAdminCredentials('BruhTesfaAdmin2026!'), true);
});

test('Fees Engine Boundary: Handles single lesson trial placement correctly', () => {
  const result = calculatePlacementFee({
    contractType: 'single_lesson',
    agreedHourlyRateETB: 400,
    hoursPerLesson: 2,
    customCommissionPercentage: 60,
  });

  assert.equal(result.totalContractValueETB, 800); // 2 hrs * 400
  assert.equal(result.commissionAmountETB, 480);   // 60% of 800
  assert.equal(result.tutorNetFirstMonthETB, 320); // 800 - 480
});

test('Fees Engine Boundary: Rejects negative or NaN commission percentages by using default 60%', () => {
  const result = calculatePlacementFee({
    contractType: 'package_hours',
    agreedHourlyRateETB: 350,
    totalPackageHours: 10,
    customCommissionPercentage: 'invalid_string',
  });

  assert.equal(result.totalContractValueETB, 3500);
  assert.equal(result.commissionPercentage, 60);
  assert.equal(result.commissionAmountETB, 2100);
});
