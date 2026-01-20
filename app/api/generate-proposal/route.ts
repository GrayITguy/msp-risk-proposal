import { NextResponse } from 'next/server';
import type { TotalRiskProfile, ClientContext, VulnerabilityScan } from '@/types/RiskModels';
import {
  generateExecutiveSummary,
  generateFindingDescription,
  generateInvestmentJustification,
} from '@/lib/ai/claude';
import {
  safeValidateRiskProfile,
  safeValidateClientContext,
  safeValidateVulnerabilities,
} from '@/lib/utils/validation';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/middleware/rateLimit';

export async function POST(request: Request) {
  try {
    // Check rate limit
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP, RATE_LIMITS.PROPOSAL_GENERATION);

    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': RATE_LIMITS.PROPOSAL_GENERATION.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { riskProfile, clientContext, vulnerabilities }: {
      riskProfile: TotalRiskProfile;
      clientContext: ClientContext;
      vulnerabilities: VulnerabilityScan['vulnerabilities'];
    } = body;

    // Validate required fields are present
    if (!riskProfile || !clientContext || !vulnerabilities) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Validate risk profile structure
    const riskProfileValidation = safeValidateRiskProfile(riskProfile);
    if (!riskProfileValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid risk profile data',
          details: riskProfileValidation.error.issues.map(i => i.message)
        },
        { status: 400 }
      );
    }

    // Validate client context structure
    const clientContextValidation = safeValidateClientContext(clientContext);
    if (!clientContextValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid client context data',
          details: clientContextValidation.error.issues.map(i => i.message)
        },
        { status: 400 }
      );
    }

    // Validate vulnerabilities array
    const vulnerabilitiesValidation = safeValidateVulnerabilities(vulnerabilities);
    if (!vulnerabilitiesValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid vulnerabilities data',
          details: vulnerabilitiesValidation.error.issues.map(i => i.message)
        },
        { status: 400 }
      );
    }

    // Generate executive summary
    const executiveSummary = await generateExecutiveSummary(riskProfile, clientContext);

    // Generate findings for top 5 risks
    const findings = await Promise.all(
      riskProfile.topRisks.slice(0, 5).map(async (risk) => {
        const vulnerability = vulnerabilities.find(v => v.id === risk.vulnerabilityId);
        if (!vulnerability) {
          throw new Error(`Vulnerability not found: ${risk.vulnerabilityId}`);
        }
        return generateFindingDescription(vulnerability, risk, clientContext);
      })
    );

    // Generate investment justification
    const investmentJustification = await generateInvestmentJustification(
      riskProfile,
      clientContext
    );

    // Create risk overview text
    const riskOverview = `Our security assessment has identified ${riskProfile.individualRisks.length} vulnerabilities across ${clientContext.companyName}'s infrastructure. Based on industry-standard risk analysis methodology and ${clientContext.industry} sector breach cost data, the total annualized loss expectancy (ALE) is ${Math.round(riskProfile.totalALE).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}. This represents the potential financial impact if these security gaps remain unaddressed over the next 12 months.`;

    // Return success response with rate limit headers
    return NextResponse.json(
      {
        executiveSummary,
        riskOverview,
        findings,
        investmentJustification,
      },
      {
        headers: {
          'X-RateLimit-Limit': RATE_LIMITS.PROPOSAL_GENERATION.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        },
      }
    );
  } catch (error) {
    // Log detailed error server-side only
    console.error('[Proposal Generation Error]', {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      // Don't log full error object to avoid exposing sensitive data
    });

    // Return generic error message to client
    return NextResponse.json(
      {
        error: 'Failed to generate proposal. Please try again or contact support if the issue persists.'
      },
      { status: 500 }
    );
  }
}
