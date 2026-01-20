'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { VulnerabilityScan, ClientContext, TotalRiskProfile, ProposalFinding } from '@/types/RiskModels';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';

interface ProposalContent {
  executiveSummary: string;
  riskOverview: string;
  findings: ProposalFinding[];
  investmentJustification: string;
}

export default function ProposalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [proposalContent, setProposalContent] = useState<ProposalContent | undefined>();
  const [clientContext, setClientContext] = useState<ClientContext | undefined>();
  const [riskProfile, setRiskProfile] = useState<TotalRiskProfile | undefined>();

  useEffect(() => {
    const loadData = async () => {
      try {
        const scanSessionId = localStorage.getItem('scanSessionId');
        const clientSessionId = localStorage.getItem('clientContextSessionId');
        const riskSessionId = localStorage.getItem('riskProfileSessionId');

        if (!scanSessionId || !clientSessionId || !riskSessionId) {
          router.push('/upload');
          return;
        }

        // Fetch all data from server sessions
        const [scanResponse, clientResponse, riskResponse] = await Promise.all([
          fetch(`/api/session?sessionId=${scanSessionId}`),
          fetch(`/api/session?sessionId=${clientSessionId}`),
          fetch(`/api/session?sessionId=${riskSessionId}`),
        ]);

        if (!scanResponse.ok || !clientResponse.ok || !riskResponse.ok) {
          throw new Error('Session expired. Please start over.');
        }

        const { data: scanData } = await scanResponse.json() as { data: VulnerabilityScan };
        const { data: clientData } = await clientResponse.json() as { data: ClientContext };
        const { data: riskData } = await riskResponse.json() as { data: TotalRiskProfile };

        setClientContext(clientData);
        setRiskProfile(riskData);

        // Call API to generate proposal content
        const response = await fetch('/api/generate-proposal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            riskProfile: riskData,
            clientContext: clientData,
            vulnerabilities: scanData.vulnerabilities,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate proposal');
        }

        const content: ProposalContent = await response.json();
        setProposalContent(content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate proposal');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Generating proposal with AI...</p>
          <p className="text-gray-500 text-sm mt-2">This may take 30-60 seconds</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Generation Error</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <Link
            href="/calculate"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
          >
            Back to Results
          </Link>
        </div>
      </div>
    );
  }

  if (!proposalContent || !clientContext || !riskProfile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex items-center justify-between print:hidden">
            <Link href="/calculate" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
              <span>&larr;</span> Back to Risk Calculation
            </Link>
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Save as PDF
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-12 print:shadow-none print:rounded-none">
            <header className="mb-12 pb-8 border-b-2 border-gray-200">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Cybersecurity Risk Assessment & Proposal
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                {clientContext.companyName}
              </p>
              <div className="text-sm text-gray-500">
                <p>Date: {formatDate(riskProfile.calculationDate)}</p>
                <p>Prepared for: {clientContext.contactInfo.primaryContact}</p>
              </div>
            </header>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Executive Summary</h2>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                {proposalContent.executiveSummary.split('\n').map((paragraph, index) => (
                  paragraph.trim() && <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="mb-10 p-6 bg-red-50 border-l-4 border-red-600 rounded-r-lg">
              <h3 className="text-xl font-bold text-red-900 mb-2">Total Risk Exposure</h3>
              <div className="text-4xl font-bold text-red-600 mb-2">
                {formatCurrency(riskProfile.totalALE)}
              </div>
              <p className="text-red-800">Annualized Loss Expectancy (ALE)</p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Risk Overview</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {proposalContent.riskOverview}
              </p>

              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600 mb-1">
                    {riskProfile.individualRisks.filter(r => {
                      const vuln = riskProfile.individualRisks.find(ir => ir.vulnerabilityId === r.vulnerabilityId);
                      return vuln && r.annualizedLossExpectancy / riskProfile.totalALE > 0.15;
                    }).length + riskProfile.topRisks.filter(r => r.annualizedLossExpectancy > riskProfile.totalALE * 0.15).length / 2}
                  </div>
                  <div className="text-sm text-gray-700">Critical</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {riskProfile.individualRisks.filter(r => {
                      return r.annualizedLossExpectancy > riskProfile.totalALE * 0.05 && r.annualizedLossExpectancy <= riskProfile.totalALE * 0.15;
                    }).length}
                  </div>
                  <div className="text-sm text-gray-700">High</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600 mb-1">
                    {riskProfile.individualRisks.filter(r => {
                      return r.annualizedLossExpectancy > riskProfile.totalALE * 0.01 && r.annualizedLossExpectancy <= riskProfile.totalALE * 0.05;
                    }).length}
                  </div>
                  <div className="text-sm text-gray-700">Medium</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {riskProfile.individualRisks.filter(r => {
                      return r.annualizedLossExpectancy <= riskProfile.totalALE * 0.01;
                    }).length}
                  </div>
                  <div className="text-sm text-gray-700">Low</div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Findings</h2>
              <p className="text-gray-600 mb-6">
                The following vulnerabilities represent the highest financial risk to {clientContext.companyName}:
              </p>

              <div className="space-y-6">
                {proposalContent.findings.map((finding, index) => (
                  <div key={index} className="border-l-4 border-blue-600 bg-gray-50 p-6 rounded-r-lg">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 flex-1">
                        {index + 1}. {finding.title}
                      </h3>
                      <div className="text-right ml-4">
                        <div className="text-xl font-bold text-red-600">
                          {formatCurrency(finding.financialRisk)}
                        </div>
                        <div className="text-xs text-gray-500">Annual Risk</div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Business Impact:</h4>
                      <p className="text-gray-600 leading-relaxed">{finding.businessImpact}</p>
                    </div>
                    <div className="text-sm text-gray-500 italic">
                      Technical: {finding.technicalDetail}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Investment Justification</h2>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                {proposalContent.investmentJustification.split('\n').map((paragraph, index) => (
                  paragraph.trim() && <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="mb-10 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Next Steps</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Review this proposal with your leadership team</li>
                <li>Prioritize critical and high-risk vulnerabilities for immediate action</li>
                <li>Schedule a follow-up meeting to discuss remediation timeline</li>
                <li>Allocate budget for security improvements</li>
                <li>Implement recommended security controls</li>
              </ol>
            </section>

            <footer className="pt-8 border-t-2 border-gray-200">
              <p className="text-gray-600 text-sm mb-2">
                This risk assessment was generated using industry-standard ALE methodology and IBM 2024 Cost of Breach data.
              </p>
              <p className="text-gray-500 text-xs">
                For questions or clarification, please contact {clientContext.contactInfo.primaryContact} at {clientContext.contactInfo.email}
              </p>
            </footer>
          </div>

          <div className="mt-6 bg-white rounded-2xl shadow-xl p-6 print:hidden">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Proposal Complete</h3>
                <p className="text-gray-600 text-sm">Ready to present to your client</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Start New Proposal
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
