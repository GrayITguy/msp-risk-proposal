'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { VulnerabilityScan, ClientContext, TotalRiskProfile } from '@/types/RiskModels';
import { calculateTotalRisk } from '@/lib/risk/calculator';
import { formatCurrency, formatPercentage, getSeverityColor, formatConfidenceLevel } from '@/lib/utils/formatting';

export default function CalculatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [riskProfile, setRiskProfile] = useState<TotalRiskProfile | undefined>();
  const [clientContext, setClientContext] = useState<ClientContext | undefined>();

  useEffect(() => {
    const loadDataAndCalculate = async () => {
      try {
        const scanSessionId = localStorage.getItem('scanSessionId');
        const clientSessionId = localStorage.getItem('clientContextSessionId');

        if (!scanSessionId || !clientSessionId) {
          router.push('/upload');
          return;
        }

        // Fetch scan data from server
        const scanResponse = await fetch(`/api/session?sessionId=${scanSessionId}`);
        if (!scanResponse.ok) {
          throw new Error('Session expired. Please upload scan data again.');
        }
        const { data: scanData } = await scanResponse.json() as { data: VulnerabilityScan };

        // Fetch client context from server
        const clientResponse = await fetch(`/api/session?sessionId=${clientSessionId}`);
        if (!clientResponse.ok) {
          throw new Error('Session expired. Please enter client context again.');
        }
        const { data: clientData } = await clientResponse.json() as { data: ClientContext };

        setClientContext(clientData);

        // Calculate risk
        const profile = calculateTotalRisk(scanData.vulnerabilities, clientData);
        setRiskProfile(profile);

        // Store risk profile in server-side session
        const riskResponse = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: profile }),
        });

        if (riskResponse.ok) {
          const { sessionId } = await riskResponse.json();
          localStorage.setItem('riskProfileSessionId', sessionId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to calculate risk');
      } finally {
        setLoading(false);
      }
    };

    loadDataAndCalculate();
  }, [router]);

  const handleContinue = () => {
    router.push('/proposal');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Calculating risk exposure...</p>
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
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Calculation Error</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <Link
            href="/upload"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
          >
            Start Over
          </Link>
        </div>
      </div>
    );
  }

  if (!riskProfile || !clientContext) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <Link href="/context" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
              <span>&larr;</span> Back to Client Context
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Step 3: Risk Calculation Results
            </h1>
            <p className="text-gray-600 mb-8">
              Financial risk assessment for {clientContext.companyName}
            </p>

            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl">
                <div className="text-sm font-semibold mb-2 opacity-90">Total Annual Risk</div>
                <div className="text-3xl font-bold">{formatCurrency(riskProfile.totalALE)}</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                <div className="text-sm font-semibold mb-2 opacity-90">Total Vulnerabilities</div>
                <div className="text-3xl font-bold">{riskProfile.individualRisks.length}</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl">
                <div className="text-sm font-semibold mb-2 opacity-90">High Priority</div>
                <div className="text-3xl font-bold">{riskProfile.topRisks.length}</div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                <div className="text-sm font-semibold mb-2 opacity-90">Calculation Date</div>
                <div className="text-lg font-bold">{new Date(riskProfile.calculationDate).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk by Severity</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="border-2 border-red-200 bg-red-50 p-4 rounded-lg">
                  <div className="text-sm font-semibold text-red-800 mb-1">Critical</div>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(riskProfile.riskByCategory.critical)}
                  </div>
                </div>
                <div className="border-2 border-orange-200 bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm font-semibold text-orange-800 mb-1">High</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(riskProfile.riskByCategory.high)}
                  </div>
                </div>
                <div className="border-2 border-yellow-200 bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm font-semibold text-yellow-800 mb-1">Medium</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(riskProfile.riskByCategory.medium)}
                  </div>
                </div>
                <div className="border-2 border-blue-200 bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-semibold text-blue-800 mb-1">Low</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(riskProfile.riskByCategory.low)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Top 5 Highest-Risk Vulnerabilities</h2>
              <div className="space-y-4">
                {riskProfile.topRisks.map((risk, index) => (
                  <div key={risk.vulnerabilityId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="flex items-center justify-center w-8 h-8 bg-gray-900 text-white rounded-full font-bold text-sm">
                            {index + 1}
                          </span>
                          <h3 className="font-semibold text-gray-900">{risk.vulnerabilityName}</h3>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(risk.annualizedLossExpectancy)}
                        </div>
                        <div className="text-sm text-gray-500">Annual Loss Expectancy</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm mt-4">
                      <div>
                        <span className="text-gray-600">Single Loss:</span>{' '}
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(risk.singleLossExpectancy)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Probability:</span>{' '}
                        <span className="font-semibold text-gray-900">
                          {formatPercentage(risk.annualRateOccurrence)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Confidence:</span>{' '}
                        <span className={`font-semibold ${
                          risk.confidenceLevel === 'high' ? 'text-green-600' :
                          risk.confidenceLevel === 'medium' ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {formatConfidenceLevel(risk.confidenceLevel)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">How These Numbers Were Calculated</h3>
              <p className="text-blue-800 text-sm mb-3">
                Risk calculations use the Annualized Loss Expectancy (ALE) formula: <strong>ALE = SLE × ARO</strong>
              </p>
              <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
                <li>
                  <strong>SLE (Single Loss Expectancy)</strong>: Asset value × Exposure factor based on CVSS scores
                </li>
                <li>
                  <strong>ARO (Annual Rate of Occurrence)</strong>: Probability of breach per year
                </li>
                <li>
                  <strong>Breach Costs</strong>: IBM 2024 Cost of Breach data for {clientContext.industry} industry
                </li>
                <li>
                  <strong>Asset Value</strong>: Estimated records at risk × industry cost per record
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={handleContinue}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
              >
                Generate Proposal &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
