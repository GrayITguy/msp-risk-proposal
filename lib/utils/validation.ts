// Input validation using Zod schemas

import { z } from 'zod';
import type {
  Vulnerability,
  ClientContext,
  VulnerabilityScan,
  RiskCalculation,
  TotalRiskProfile
} from '@/types/RiskModels';

// Basic schemas
export const VulnerabilitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  cvssScore: z.number().min(0).max(10),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  affectedAssets: z.array(z.string()).min(1),
  cve: z.string().optional(),
  recommendation: z.string().min(1)
});

export const VulnerabilityScanSchema = z.object({
  scanId: z.string().min(1),
  scanDate: z.string().min(1),
  source: z.enum(['nessus', 'qualys', 'openvas', 'manual']),
  vulnerabilities: z.array(VulnerabilitySchema).min(1)
});

export const ClientContextSchema = z.object({
  companyName: z.string().min(1),
  industry: z.enum([
    'healthcare',
    'financial',
    'retail',
    'manufacturing',
    'professional_services',
    'education',
    'government',
    'technology',
    'other'
  ]),
  revenue: z.number().positive(),
  employeeCount: z.number().int().positive(),
  criticalSystems: z.array(z.string()),
  complianceRequirements: z.array(z.string()).optional(),
  contactInfo: z.object({
    primaryContact: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional()
  })
});

// Risk calculation schemas
export const RiskCalculationDetailsSchema = z.object({
  assetValue: z.number().nonnegative(),
  exposureFactor: z.number().min(0).max(1),
  breachProbability: z.number().min(0).max(1),
  industryBreachCost: z.number().positive()
});

export const RiskCalculationSchema = z.object({
  vulnerabilityId: z.string().min(1),
  vulnerabilityName: z.string().min(1),
  singleLossExpectancy: z.number().nonnegative(),
  annualRateOccurrence: z.number().min(0).max(1),
  annualizedLossExpectancy: z.number().nonnegative(),
  confidenceLevel: z.enum(['high', 'medium', 'low']),
  calculation: RiskCalculationDetailsSchema
});

export const RiskByCategorySchema = z.object({
  critical: z.number().nonnegative(),
  high: z.number().nonnegative(),
  medium: z.number().nonnegative(),
  low: z.number().nonnegative()
});

export const TotalRiskProfileSchema = z.object({
  clientId: z.string().min(1),
  calculationDate: z.string().min(1),
  individualRisks: z.array(RiskCalculationSchema),
  totalALE: z.number().nonnegative(),
  riskByCategory: RiskByCategorySchema,
  topRisks: z.array(RiskCalculationSchema).max(5)
});

// Validation functions
export function validateVulnerability(data: unknown): Vulnerability {
  return VulnerabilitySchema.parse(data);
}

export function validateVulnerabilityScan(data: unknown): VulnerabilityScan {
  return VulnerabilityScanSchema.parse(data);
}

export function validateClientContext(data: unknown): ClientContext {
  return ClientContextSchema.parse(data);
}

export function validateRiskCalculation(data: unknown): RiskCalculation {
  return RiskCalculationSchema.parse(data);
}

export function validateTotalRiskProfile(data: unknown): TotalRiskProfile {
  return TotalRiskProfileSchema.parse(data);
}

// Safe parse functions (return success/error objects)
export function safeValidateRiskProfile(data: unknown) {
  return TotalRiskProfileSchema.safeParse(data);
}

export function safeValidateClientContext(data: unknown) {
  return ClientContextSchema.safeParse(data);
}

export function safeValidateVulnerabilities(data: unknown) {
  return z.array(VulnerabilitySchema).safeParse(data);
}

// Utility to check if CVSS score is valid
export function isValidCVSS(score: number): boolean {
  return score >= 0 && score <= 10;
}

// Validate scan data and return errors if any
export function validateScanData(data: unknown): { valid: boolean; errors?: string[] } {
  try {
    VulnerabilityScanSchema.parse(data);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return {
      valid: false,
      errors: ['Unknown validation error']
    };
  }
}
