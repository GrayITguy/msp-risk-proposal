// Core ALE (Annualized Loss Expectancy) calculation logic

import type {
  Vulnerability,
  ClientContext,
  RiskCalculation,
  TotalRiskProfile,
  VulnerabilitySeverity,
  ConfidenceLevel,
} from '@/types/RiskModels';
import {
  getCostPerRecord,
  estimateRecordsAtRisk,
} from './breachData';
import { generateClientId } from '../utils/formatting';
import {
  getExposureFactor,
  getARO,
  CONFIDENCE_SCORING,
  CVSS_THRESHOLDS,
} from './config';

/**
 * Custom error class for risk calculation errors
 */
export class RiskCalculationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'RiskCalculationError';
  }
}

/**
 * Determine confidence level for the calculation
 * Based on data quality and vulnerability characteristics
 * Uses configuration from config.ts for scoring thresholds
 */
function determineConfidenceLevel(
  vulnerability: Vulnerability,
  clientContext: ClientContext
): ConfidenceLevel {
  let confidenceScore = 0;

  // Has CVE identifier = more reliable data
  if (vulnerability.cve) {
    confidenceScore += CONFIDENCE_SCORING.HAS_CVE;
  }

  // CVSS score in valid range
  if (vulnerability.cvssScore >= CVSS_THRESHOLDS.MIN &&
      vulnerability.cvssScore <= CVSS_THRESHOLDS.MAX) {
    confidenceScore += CONFIDENCE_SCORING.VALID_CVSS;
  }

  // Industry has specific breach cost data
  if (clientContext.industry !== 'other') {
    confidenceScore += CONFIDENCE_SCORING.INDUSTRY_SPECIFIC;
  }

  // High severity with clear asset impact
  if (vulnerability.severity === 'critical' || vulnerability.severity === 'high') {
    if (vulnerability.affectedAssets.length > 0) {
      confidenceScore += CONFIDENCE_SCORING.HIGH_SEVERITY_WITH_ASSETS;
    }
  }

  // Determine confidence level using configured thresholds
  if (confidenceScore >= CONFIDENCE_SCORING.HIGH_THRESHOLD) return 'high';
  if (confidenceScore >= CONFIDENCE_SCORING.MEDIUM_THRESHOLD) return 'medium';
  return 'low';
}

/**
 * Calculate ALE for a single vulnerability
 * ALE = SLE × ARO where SLE = Asset Value × Exposure Factor
 */
export function calculateALE(
  vulnerability: Vulnerability,
  clientContext: ClientContext
): RiskCalculation {
  // Validate required fields
  if (!vulnerability.cvssScore) {
    throw new RiskCalculationError(
      'CVSS score required for risk calculation',
      'MISSING_CVSS',
      { vulnerabilityId: vulnerability.id }
    );
  }

  if (vulnerability.cvssScore < CVSS_THRESHOLDS.MIN ||
      vulnerability.cvssScore > CVSS_THRESHOLDS.MAX) {
    throw new RiskCalculationError(
      `CVSS score must be between ${CVSS_THRESHOLDS.MIN} and ${CVSS_THRESHOLDS.MAX}`,
      'INVALID_CVSS',
      { vulnerabilityId: vulnerability.id, cvssScore: vulnerability.cvssScore }
    );
  }

  // Get industry-specific breach cost per record
  const industryBreachCost = getCostPerRecord(clientContext.industry);

  // Estimate records at risk based on company size
  const estimatedRecords = estimateRecordsAtRisk(
    clientContext.employeeCount,
    clientContext.industry
  );

  // Calculate exposure factor from CVSS score (using config)
  const exposureFactor = getExposureFactor(vulnerability.cvssScore);

  // Calculate asset value (total potential breach cost)
  const assetValue = estimatedRecords * industryBreachCost;

  // Calculate Single Loss Expectancy (SLE)
  const singleLossExpectancy = assetValue * exposureFactor;

  // Calculate Annual Rate of Occurrence (ARO) using config
  const annualRateOccurrence = getARO(vulnerability.cvssScore);

  // Calculate Annualized Loss Expectancy (ALE = SLE × ARO)
  const annualizedLossExpectancy = singleLossExpectancy * annualRateOccurrence;

  // Determine confidence level
  const confidenceLevel = determineConfidenceLevel(vulnerability, clientContext);

  return {
    vulnerabilityId: vulnerability.id,
    vulnerabilityName: vulnerability.name,
    singleLossExpectancy,
    annualRateOccurrence,
    annualizedLossExpectancy,
    confidenceLevel,
    calculation: {
      assetValue,
      exposureFactor,
      breachProbability: annualRateOccurrence,
      industryBreachCost,
    },
  };
}

/**
 * Calculate total risk profile for all vulnerabilities
 */
export function calculateTotalRisk(
  vulnerabilities: Vulnerability[],
  clientContext: ClientContext
): TotalRiskProfile {
  if (!vulnerabilities || vulnerabilities.length === 0) {
    throw new RiskCalculationError(
      'No vulnerabilities provided for risk calculation',
      'NO_VULNERABILITIES'
    );
  }

  // Calculate individual risks
  const individualRisks: RiskCalculation[] = [];
  const errors: Array<{ vulnerabilityId: string; error: string }> = [];

  for (const vulnerability of vulnerabilities) {
    try {
      const risk = calculateALE(vulnerability, clientContext);
      individualRisks.push(risk);
    } catch (error) {
      if (error instanceof RiskCalculationError) {
        errors.push({
          vulnerabilityId: vulnerability.id,
          error: error.message,
        });
      } else {
        errors.push({
          vulnerabilityId: vulnerability.id,
          error: 'Unknown calculation error',
        });
      }
    }
  }

  // If all calculations failed, throw error
  if (individualRisks.length === 0) {
    throw new RiskCalculationError(
      'Failed to calculate risk for any vulnerabilities',
      'ALL_CALCULATIONS_FAILED',
      { errors }
    );
  }

  // Calculate total ALE
  const totalALE = individualRisks.reduce(
    (sum, risk) => sum + risk.annualizedLossExpectancy,
    0
  );

  // Group by severity
  const riskByCategory = vulnerabilities.reduce(
    (acc, vuln) => {
      const risk = individualRisks.find(r => r.vulnerabilityId === vuln.id);
      if (risk) {
        acc[vuln.severity] += risk.annualizedLossExpectancy;
      }
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );

  // Get top 5 risks by ALE
  const topRisks = [...individualRisks]
    .sort((a, b) => b.annualizedLossExpectancy - a.annualizedLossExpectancy)
    .slice(0, 5);

  return {
    clientId: generateClientId(clientContext.companyName),
    calculationDate: new Date().toISOString(),
    individualRisks,
    totalALE,
    riskByCategory,
    topRisks,
  };
}
