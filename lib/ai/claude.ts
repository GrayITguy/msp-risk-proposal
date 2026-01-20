// Claude API client for AI-powered proposal generation

import Anthropic from '@anthropic-ai/sdk';
import type {
  TotalRiskProfile,
  ClientContext,
  Vulnerability,
  RiskCalculation,
  ProposalFinding,
} from '@/types/RiskModels';

// Initialize the Anthropic client
// Note: API key validation happens at runtime when functions are called
// This allows the build to succeed even without the API key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * Validate API key is present before making API calls
 * Throws error at runtime if key is missing
 */
function validateAPIKey(): void {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY environment variable is required. Please set it in your .env.local file.'
    );
  }
}

/**
 * Error types for API operations
 */
export interface APIError {
  type: 'rate_limit' | 'invalid_request' | 'api_error' | 'network_error';
  message: string;
  retryable: boolean;
  retryAfter?: number;
}

/**
 * Check if an error is retryable
 */
function isRetryable(error: unknown): boolean {
  if (error instanceof Anthropic.APIError) {
    return error.status === 429 || error.status === 500 || error.status === 503;
  }
  return false;
}

/**
 * Sleep utility for retry logic
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1 || !isRetryable(error)) {
        throw error;
      }
      await sleep(Math.pow(2, i) * 1000);  // Exponential backoff
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Generate executive summary from risk profile
 * Uses business-focused language appropriate for CFOs
 */
export async function generateExecutiveSummary(
  riskProfile: TotalRiskProfile,
  clientContext: ClientContext
): Promise<string> {
  // Validate API key at runtime
  validateAPIKey();

  const prompt = `You are a cybersecurity consultant preparing an executive summary for a business owner.

Client Profile:
- Company: ${clientContext.companyName}
- Industry: ${clientContext.industry}
- Revenue: $${clientContext.revenue.toLocaleString()}
- Employees: ${clientContext.employeeCount}

Risk Analysis:
- Total Annual Risk Exposure: $${Math.round(riskProfile.totalALE).toLocaleString()}
- Critical Risks: ${riskProfile.individualRisks.filter(r => r.annualizedLossExpectancy >= 100000).length}
- High Risks: ${riskProfile.individualRisks.filter(r => r.annualizedLossExpectancy >= 50000 && r.annualizedLossExpectancy < 100000).length}
- Total Vulnerabilities Assessed: ${riskProfile.individualRisks.length}

Write a compelling 3-paragraph executive summary that:
1. Explains the current security posture in business terms (avoid technical jargon)
2. Quantifies the financial risk exposure clearly
3. Emphasizes the urgency and ROI of addressing these issues

Tone: Professional but accessible. Speak to a CFO, not a CISO. Focus on business impact, not technical details.`;

  const response = await withRetry(async () => {
    return await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
  });

  if (response.content[0].type === 'text') {
    return response.content[0].text;
  }

  throw new Error('Unexpected response format from Claude API');
}

/**
 * Generate business-focused finding from technical vulnerability
 */
export async function generateFindingDescription(
  vulnerability: Vulnerability,
  riskCalc: RiskCalculation,
  clientContext: ClientContext
): Promise<ProposalFinding> {
  // Validate API key at runtime
  validateAPIKey();

  const prompt = `Convert this technical vulnerability into a business-focused finding:

Technical Details:
- Vulnerability: ${vulnerability.name}
- CVSS Score: ${vulnerability.cvssScore}
- Description: ${vulnerability.description}

Financial Impact:
- Potential Annual Loss: $${Math.round(riskCalc.annualizedLossExpectancy).toLocaleString()}

Client Context: ${clientContext.industry} company

Generate a JSON object with these keys:
- title: A business-friendly title (no technical jargon, 5-8 words)
- businessImpact: Business impact explanation (2-3 sentences explaining what could happen to the business)
- technicalDetail: Brief technical detail (1 sentence for IT stakeholders)

Format: Return ONLY valid JSON, no additional text.`;

  const response = await withRetry(async () => {
    return await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
  });

  if (response.content[0].type === 'text') {
    try {
      const parsed = JSON.parse(response.content[0].text);
      return {
        title: parsed.title,
        businessImpact: parsed.businessImpact,
        technicalDetail: parsed.technicalDetail,
        financialRisk: riskCalc.annualizedLossExpectancy,
        priority: vulnerability.severity === 'critical' ? 1 : vulnerability.severity === 'high' ? 2 : 3,
      };
    } catch {
      // Fallback if JSON parsing fails
      return {
        title: vulnerability.name,
        businessImpact: vulnerability.description,
        technicalDetail: `CVSS Score: ${vulnerability.cvssScore}`,
        financialRisk: riskCalc.annualizedLossExpectancy,
        priority: vulnerability.severity === 'critical' ? 1 : vulnerability.severity === 'high' ? 2 : 3,
      };
    }
  }

  throw new Error('Unexpected response format from Claude API');
}

/**
 * Generate investment justification section
 */
export async function generateInvestmentJustification(
  riskProfile: TotalRiskProfile,
  clientContext: ClientContext
): Promise<string> {
  // Validate API key at runtime
  validateAPIKey();

  const prompt = `You are a cybersecurity consultant explaining ROI to a business owner.

Client: ${clientContext.companyName} (${clientContext.industry}, $${clientContext.revenue.toLocaleString()} revenue)
Total Annual Risk: $${Math.round(riskProfile.totalALE).toLocaleString()}

Write 2-3 paragraphs explaining why investing in security improvements makes business sense. Include:
1. Cost-benefit comparison (typical remediation costs vs. potential losses)
2. Indirect costs of breaches (reputation, downtime, regulatory fines)
3. Competitive advantage and customer trust benefits

Tone: Persuasive but not alarmist. Use concrete numbers and business logic.`;

  const response = await withRetry(async () => {
    return await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
  });

  if (response.content[0].type === 'text') {
    return response.content[0].text;
  }

  throw new Error('Unexpected response format from Claude API');
}
