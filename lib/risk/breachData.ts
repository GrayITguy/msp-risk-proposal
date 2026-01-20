// Industry breach cost lookups using IBM 2024 data

import type { IndustryType, IndustryBreachData } from '@/types/RiskModels';
import breachCostsData from '@/data/breachCosts.json';

/**
 * Get breach cost data for a specific industry
 * Returns industry-specific costs from IBM 2024 Cost of Breach Report
 */
export function getIndustryBreachData(industry: IndustryType): IndustryBreachData | undefined {
  const data = breachCostsData.industries.find(
    (item) => item.industry === industry
  ) as IndustryBreachData | undefined;

  return data;
}

/**
 * Get cost per record for an industry
 * Falls back to 'other' industry if specific industry not found
 */
export function getCostPerRecord(industry: IndustryType): number {
  const data = getIndustryBreachData(industry);
  if (data) {
    return data.costPerRecord;
  }

  // Fallback to 'other' industry average
  const fallback = getIndustryBreachData('other');
  return fallback?.costPerRecord || 180;
}

/**
 * Get average total cost of breach for an industry
 */
export function getAverageTotalCost(industry: IndustryType): number {
  const data = getIndustryBreachData(industry);
  if (data) {
    return data.averageTotalCost;
  }

  // Fallback to 'other' industry average
  const fallback = getIndustryBreachData('other');
  return fallback?.averageTotalCost || 4350000;
}

/**
 * Get all available industry breach data
 */
export function getAllIndustryData(): IndustryBreachData[] {
  return breachCostsData.industries as IndustryBreachData[];
}

/**
 * Estimate number of records at risk based on company size
 * Uses employee count as a proxy for data volume
 * Now uses centralized configuration from config.ts
 */
export function estimateRecordsAtRisk(
  employeeCount: number,
  industry: IndustryType
): number {
  // Import from config to maintain single source of truth
  const { getRecordsMultiplier } = require('./config');
  const multiplier = getRecordsMultiplier(industry);
  return employeeCount * multiplier;
}
