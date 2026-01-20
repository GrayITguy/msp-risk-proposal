// Risk calculation configuration and constants
// Source: IBM Cost of Breach Report 2024, NIST CVSS Guidelines, Industry Analysis

/**
 * Exposure Factor Configuration
 * Maps CVSS score ranges to exposure factors (percentage of asset value at risk)
 *
 * Source: Based on CVSS severity ratings and breach impact analysis
 * - Critical (9.0-10.0): Full system compromise, complete data exposure
 * - High (7.0-8.9): Significant compromise, major data exposure
 * - Medium (4.0-6.9): Partial compromise, moderate data exposure
 * - Low (0.1-3.9): Limited compromise, minimal data exposure
 */
export interface ExposureFactorConfig {
  critical: number;  // CVSS >= 9.0
  high: number;      // CVSS >= 7.0
  medium: number;    // CVSS >= 4.0
  low: number;       // CVSS < 4.0
}

export const EXPOSURE_FACTORS: ExposureFactorConfig = {
  critical: 1.0,   // 100% exposure - complete compromise
  high: 0.75,      // 75% exposure - significant compromise
  medium: 0.40,    // 40% exposure - moderate compromise
  low: 0.15,       // 15% exposure - limited compromise
};

/**
 * Annual Rate of Occurrence (ARO) Configuration
 * Probability of exploitation within a year based on CVSS severity
 *
 * Source: Based on Verizon DBIR, Ponemon Institute research, and CVSS temporal metrics
 * - Critical vulnerabilities are actively exploited in the wild
 * - High severity vulnerabilities have exploit code readily available
 * - Medium severity require more sophisticated attackers
 * - Low severity rarely exploited in practice
 */
export interface AROConfig {
  critical: number;  // CVSS >= 9.0
  high: number;      // CVSS >= 7.0
  medium: number;    // CVSS >= 4.0
  low: number;       // CVSS < 4.0
}

export const ANNUAL_RATE_OCCURRENCE: AROConfig = {
  critical: 0.40,  // 40% annual probability - high likelihood
  high: 0.25,      // 25% annual probability - moderate-high likelihood
  medium: 0.10,    // 10% annual probability - moderate likelihood
  low: 0.03,       // 3% annual probability - low likelihood
};

/**
 * CVSS Score Thresholds
 * Defines boundaries between severity levels
 *
 * Source: NIST CVSS v3.1 Specification Guide
 */
export const CVSS_THRESHOLDS = {
  CRITICAL: 9.0,
  HIGH: 7.0,
  MEDIUM: 4.0,
  LOW: 0.1,
  MAX: 10.0,
  MIN: 0.0,
};

/**
 * Records at Risk Multipliers by Industry
 * Estimates average records per employee by industry vertical
 *
 * Source: Industry benchmarks, IBM Breach Report 2024, analyst estimates
 * These multipliers help estimate total records at risk based on employee count
 */
export interface RecordsMultiplierConfig {
  healthcare: number;
  financial: number;
  retail: number;
  manufacturing: number;
  professional_services: number;
  education: number;
  government: number;
  technology: number;
  other: number;
}

export const RECORDS_PER_EMPLOYEE: RecordsMultiplierConfig = {
  healthcare: 2000,           // Extensive patient records, medical history
  financial: 1500,            // Customer accounts, transaction history
  retail: 1000,               // Customer purchase data, loyalty programs
  manufacturing: 500,         // Supplier and customer data, less consumer PII
  professional_services: 800, // Client data, project information
  education: 1200,            // Student records, academic data
  government: 1000,           // Citizen data, public records
  technology: 900,            // User accounts, usage data
  other: 800,                 // Generic business data
};

/**
 * Confidence Level Scoring
 * Determines confidence in risk calculation based on data quality
 */
export const CONFIDENCE_SCORING = {
  HAS_CVE: 2,                    // Vulnerability has CVE identifier
  VALID_CVSS: 2,                 // CVSS score in valid range
  INDUSTRY_SPECIFIC: 1,          // Industry-specific breach cost data available
  HIGH_SEVERITY_WITH_ASSETS: 1,  // Critical/High with identified affected assets
  HIGH_THRESHOLD: 5,             // Score >= 5 = high confidence
  MEDIUM_THRESHOLD: 3,           // Score >= 3 = medium confidence
};

/**
 * Financial Risk Thresholds
 * Used for categorizing risks by financial impact
 */
export const RISK_THRESHOLDS = {
  CRITICAL_ALE: 100000,  // $100k+ annual risk = critical
  HIGH_ALE: 50000,       // $50k-$100k annual risk = high
  MEDIUM_ALE: 10000,     // $10k-$50k annual risk = medium
  LOW_ALE: 0,            // <$10k annual risk = low
};

/**
 * Get exposure factor for a given CVSS score
 */
export function getExposureFactor(cvssScore: number): number {
  if (cvssScore >= CVSS_THRESHOLDS.CRITICAL) return EXPOSURE_FACTORS.critical;
  if (cvssScore >= CVSS_THRESHOLDS.HIGH) return EXPOSURE_FACTORS.high;
  if (cvssScore >= CVSS_THRESHOLDS.MEDIUM) return EXPOSURE_FACTORS.medium;
  return EXPOSURE_FACTORS.low;
}

/**
 * Get Annual Rate of Occurrence for a given CVSS score
 */
export function getARO(cvssScore: number): number {
  if (cvssScore >= CVSS_THRESHOLDS.CRITICAL) return ANNUAL_RATE_OCCURRENCE.critical;
  if (cvssScore >= CVSS_THRESHOLDS.HIGH) return ANNUAL_RATE_OCCURRENCE.high;
  if (cvssScore >= CVSS_THRESHOLDS.MEDIUM) return ANNUAL_RATE_OCCURRENCE.medium;
  return ANNUAL_RATE_OCCURRENCE.low;
}

/**
 * Get records multiplier for an industry
 */
export function getRecordsMultiplier(industry: string): number {
  return RECORDS_PER_EMPLOYEE[industry as keyof RecordsMultiplierConfig] || RECORDS_PER_EMPLOYEE.other;
}
