// Core data models for the MSP Risk-to-Proposal tool

export type IndustryType =
  | 'healthcare'
  | 'financial'
  | 'retail'
  | 'manufacturing'
  | 'professional_services'
  | 'education'
  | 'government'
  | 'technology'
  | 'other';

export type VulnerabilitySeverity = 'critical' | 'high' | 'medium' | 'low';

export type ScanSource = 'nessus' | 'qualys' | 'openvas' | 'manual';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type RecommendationPriority = 'immediate' | 'short-term' | 'long-term';

export type ProposalTemplate = 'standard' | 'executive' | 'technical';

export type BreachDataSource = 'ibm_2024' | 'verizon_dbir' | 'ponemon';

// Vulnerability Scan Data Input
export interface Vulnerability {
  id: string;
  name: string;
  description: string;
  cvssScore: number;
  severity: VulnerabilitySeverity;
  affectedAssets: string[];
  cve?: string;
  recommendation: string;
}

export interface VulnerabilityScan {
  scanId: string;
  scanDate: string;
  source: ScanSource;
  vulnerabilities: Vulnerability[];
}

// Client Business Context
export interface ContactInfo {
  primaryContact: string;
  email: string;
  phone?: string;
}

export interface ClientContext {
  companyName: string;
  industry: IndustryType;
  revenue: number;
  employeeCount: number;
  criticalSystems: string[];
  complianceRequirements?: string[];
  contactInfo: ContactInfo;
}

// Risk Calculation Output
export interface RiskCalculationDetails {
  assetValue: number;
  exposureFactor: number;
  breachProbability: number;
  industryBreachCost: number;
}

export interface RiskCalculation {
  vulnerabilityId: string;
  vulnerabilityName: string;
  singleLossExpectancy: number;  // SLE in dollars
  annualRateOccurrence: number;  // ARO (0-1 probability)
  annualizedLossExpectancy: number;  // ALE = SLE × ARO
  confidenceLevel: ConfidenceLevel;
  calculation: RiskCalculationDetails;
}

export interface RiskByCategory {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface TotalRiskProfile {
  clientId: string;
  calculationDate: string;
  individualRisks: RiskCalculation[];
  totalALE: number;
  riskByCategory: RiskByCategory;
  topRisks: RiskCalculation[];  // Top 5 by ALE
}

// Proposal Output
export interface ProposalFinding {
  title: string;
  businessImpact: string;
  technicalDetail: string;
  financialRisk: number;
  priority: number;
}

export interface Recommendation {
  title: string;
  description: string;
  estimatedCost: number;
  riskReduction: number;
  timeline: string;
  priority: RecommendationPriority;
}

export interface MSPBranding {
  companyName: string;
  logo?: string;
  primaryColor: string;
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
}

export interface ProposalSections {
  executiveSummary: string;
  riskOverview: string;
  detailedFindings: ProposalFinding[];
  recommendations: Recommendation[];
  investmentJustification: string;
}

export interface ProposalFormatting {
  mspBranding?: MSPBranding;
  template: ProposalTemplate;
}

export interface SecurityProposal {
  proposalId: string;
  clientContext: ClientContext;
  riskProfile: TotalRiskProfile;
  generatedDate: string;
  sections: ProposalSections;
  formatting: ProposalFormatting;
}

// Breach Cost Data Structure
export interface BreachDataPoints {
  detectTime: number;  // Days
  containTime: number;  // Days
  recordsCompromised: number;  // Average
}

export interface IndustryBreachData {
  industry: IndustryType;
  costPerRecord: number;
  averageTotalCost: number;
  source: BreachDataSource;
  year: number;
  dataPoints: BreachDataPoints;
}
