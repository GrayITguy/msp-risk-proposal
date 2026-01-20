'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { VulnerabilityScan } from '@/types/RiskModels';
import { validateScanData } from '@/lib/utils/validation';

export default function UploadPage() {
  const router = useRouter();
  const [scanData, setScanData] = useState<VulnerabilityScan | undefined>();
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const validation = validateScanData(json);

        if (!validation.valid) {
          setErrors(validation.errors || ['Invalid scan data format']);
          setScanData(undefined);
        } else {
          setErrors([]);
          setScanData(json);
        }
      } catch {
        setErrors(['Failed to parse JSON file. Please check the file format.']);
        setScanData(undefined);
      }
    };
    reader.readAsText(file);
  };

  const loadSampleData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sample-data');
      const json = await response.json();
      const validation = validateScanData(json);

      if (!validation.valid) {
        setErrors(validation.errors || ['Invalid sample data']);
        setScanData(undefined);
      } else {
        setErrors([]);
        setScanData(json);
      }
    } catch {
      setErrors(['Failed to load sample data']);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!scanData) return;

    setLoading(true);
    try {
      // Store scan data securely on server
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: scanData }),
      });

      if (!response.ok) {
        throw new Error('Failed to store scan data');
      }

      const { sessionId } = await response.json();

      // Store only the session ID in localStorage (not the sensitive data)
      localStorage.setItem('scanSessionId', sessionId);

      router.push('/context');
    } catch (error) {
      setErrors(['Failed to save scan data. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
              <span>&larr;</span> Back to Home
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Step 1: Upload Vulnerability Scan
            </h1>
            <p className="text-gray-600 mb-8">
              Upload your vulnerability scan data in JSON format or try with sample data
            </p>

            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg inline-block transition-colors"
                >
                  Upload JSON File
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Accepts JSON files from Nessus, Qualys, or custom format
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <button
                onClick={loadSampleData}
                disabled={loading}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load Sample Data (Demo)'}
              </button>

              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-red-800 font-semibold mb-2">Validation Errors:</h3>
                  <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {scanData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <svg
                      className="h-6 w-6 text-green-600 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-green-800 font-semibold mb-2">
                        Scan Data Loaded Successfully
                      </h3>
                      <div className="text-sm text-green-700 space-y-1">
                        <p>Scan ID: {scanData.scanId}</p>
                        <p>Scan Date: {scanData.scanDate}</p>
                        <p>Source: {scanData.source}</p>
                        <p className="font-semibold">
                          Total Vulnerabilities: {scanData.vulnerabilities.length}
                        </p>
                        <div className="mt-2 flex gap-4">
                          <span className="text-red-600">
                            Critical: {scanData.vulnerabilities.filter(v => v.severity === 'critical').length}
                          </span>
                          <span className="text-orange-600">
                            High: {scanData.vulnerabilities.filter(v => v.severity === 'high').length}
                          </span>
                          <span className="text-yellow-600">
                            Medium: {scanData.vulnerabilities.filter(v => v.severity === 'medium').length}
                          </span>
                          <span className="text-blue-600">
                            Low: {scanData.vulnerabilities.filter(v => v.severity === 'low').length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleContinue}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Continue to Client Context &rarr;
                  </button>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-blue-800 font-semibold mb-2">Expected JSON Format:</h3>
                <pre className="text-xs text-blue-700 overflow-x-auto">
{`{
  "scanId": "scan-001",
  "scanDate": "2026-01-15",
  "source": "nessus",
  "vulnerabilities": [
    {
      "id": "vuln-001",
      "name": "Vulnerability Name",
      "description": "Description",
      "cvssScore": 9.8,
      "severity": "critical",
      "affectedAssets": ["server-01"],
      "cve": "CVE-2023-1234",
      "recommendation": "Fix recommendation"
    }
  ]
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
