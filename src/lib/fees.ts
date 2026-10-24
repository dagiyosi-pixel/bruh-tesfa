// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Placement Fee & Commission Engine
// =============================================================================

import { DEFAULT_COMMISSION_PERCENTAGE } from './constants';
import { ContractType } from './types';

export interface FeeCalculationInput {
  contractType: ContractType;
  agreedHourlyRateETB: number;
  lessonsPerWeek?: number;
  hoursPerLesson?: number;
  totalPackageHours?: number;
  customCommissionPercentage?: number;
}

export interface FeeCalculationResult {
  contractType: ContractType;
  agreedHourlyRateETB: number;
  totalContractValueETB: number;
  commissionPercentage: number;
  commissionAmountETB: number;
  tutorNetFirstMonthETB: number;
  basisExplanation: string;
  replacementGuaranteeDays: number;
}

/**
 * Calculates transparent placement fees and tutor net proceeds for an agreed placement.
 */
export function calculatePlacementFee(input: FeeCalculationInput): FeeCalculationResult {
  const {
    contractType,
    agreedHourlyRateETB,
    lessonsPerWeek = 3,
    hoursPerLesson = 1.5,
    totalPackageHours = 18,
    customCommissionPercentage = DEFAULT_COMMISSION_PERCENTAGE,
  } = input;

  let totalContractValueETB = 0;
  let basisExplanation = '';

  if (contractType === 'first_month_recurring') {
    // 4 weeks of agreed weekly lessons
    const weeklyHours = lessonsPerWeek * hoursPerLesson;
    const monthlyHours = weeklyHours * 4;
    totalContractValueETB = Math.round(monthlyHours * agreedHourlyRateETB);
    basisExplanation = `First month recurring agreement: ${lessonsPerWeek} lessons/week × ${hoursPerLesson} hrs × 4 weeks = ${monthlyHours} total hours @ ${agreedHourlyRateETB} ETB/hr.`;
  } else if (contractType === 'package_hours') {
    totalContractValueETB = Math.round(totalPackageHours * agreedHourlyRateETB);
    basisExplanation = `Agreed learning package of ${totalPackageHours} hours @ ${agreedHourlyRateETB} ETB/hr.`;
  } else {
    // Single trial or one-off lesson
    totalContractValueETB = Math.round(hoursPerLesson * agreedHourlyRateETB);
    basisExplanation = `Single lesson of ${hoursPerLesson} hours @ ${agreedHourlyRateETB} ETB/hr.`;
  }

  const commissionPercentage = Number(customCommissionPercentage) || DEFAULT_COMMISSION_PERCENTAGE;
  const commissionAmountETB = Math.round((totalContractValueETB * commissionPercentage) / 100);
  const tutorNetFirstMonthETB = totalContractValueETB - commissionAmountETB;

  return {
    contractType,
    agreedHourlyRateETB,
    totalContractValueETB,
    commissionPercentage,
    commissionAmountETB,
    tutorNetFirstMonthETB,
    basisExplanation,
    replacementGuaranteeDays: 14, // 14-day replacement safeguard
  };
}

/**
 * Generates official placement terms text for a specific agreement.
 */
export function generatePlacementTermsSummary(result: FeeCalculationResult, tutorName: string, parentName: string): string {
  return [
    `BRUH TESFA PLACEMENT AGREEMENT SUMMARY`,
    `Tutor: ${tutorName} | Parent: ${parentName}`,
    `Contract Basis: ${result.basisExplanation}`,
    `Total First Month/Package Value: ${result.totalContractValueETB.toLocaleString()} ETB`,
    `One-Time Placement Fee (${result.commissionPercentage}%): ${result.commissionAmountETB.toLocaleString()} ETB`,
    `Tutor Net First Period Proceeds: ${result.tutorNetFirstMonthETB.toLocaleString()} ETB`,
    `Ongoing Policy: 0% commission on months 2+. All subsequent fees belong 100% to the tutor.`,
    `Safeguard: 14-day / 2-lesson replacement warranty if placement cannot proceed.`,
  ].join('\n');
}
