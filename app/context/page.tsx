'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ClientContext, IndustryType } from '@/types/RiskModels';
import { validateClientContext } from '@/lib/utils/validation';
import { formatIndustryName } from '@/lib/utils/formatting';

const industries: IndustryType[] = [
  'healthcare',
  'financial',
  'retail',
  'manufacturing',
  'professional_services',
  'education',
  'government',
  'technology',
  'other',
];

export default function ContextPage() {
  const router = useRouter();
  const [hasScanData, setHasScanData] = useState(false);
  const [formData, setFormData] = useState<Partial<ClientContext>>({
    companyName: '',
    industry: 'other',
    revenue: 0,
    employeeCount: 0,
    criticalSystems: [],
    complianceRequirements: [],
    contactInfo: {
      primaryContact: '',
      email: '',
      phone: '',
    },
  });
  const [criticalSystemInput, setCriticalSystemInput] = useState('');
  const [complianceInput, setComplianceInput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we have a session ID from the upload step
    const sessionId = localStorage.getItem('scanSessionId');
    if (!sessionId) {
      router.push('/upload');
    } else {
      setHasScanData(true);
    }
  }, [router]);

  const handleAddCriticalSystem = () => {
    if (criticalSystemInput.trim()) {
      setFormData({
        ...formData,
        criticalSystems: [...(formData.criticalSystems || []), criticalSystemInput.trim()],
      });
      setCriticalSystemInput('');
    }
  };

  const handleRemoveCriticalSystem = (index: number) => {
    setFormData({
      ...formData,
      criticalSystems: formData.criticalSystems?.filter((_, i) => i !== index),
    });
  };

  const handleAddCompliance = () => {
    if (complianceInput.trim()) {
      setFormData({
        ...formData,
        complianceRequirements: [
          ...(formData.complianceRequirements || []),
          complianceInput.trim(),
        ],
      });
      setComplianceInput('');
    }
  };

  const handleRemoveCompliance = (index: number) => {
    setFormData({
      ...formData,
      complianceRequirements: formData.complianceRequirements?.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      const validatedData = validateClientContext(formData);

      // Store client context in server-side session
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: validatedData }),
      });

      if (!response.ok) {
        throw new Error('Failed to store client context');
      }

      const { sessionId } = await response.json();

      // Store client context session ID
      localStorage.setItem('clientContextSessionId', sessionId);

      router.push('/calculate');
    } catch (error) {
      if (error instanceof Error) {
        setErrors([error.message]);
      } else {
        setErrors(['Please fill in all required fields correctly']);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!hasScanData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link href="/upload" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
              <span>&larr;</span> Back to Upload
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Step 2: Client Business Context
            </h1>
            <p className="text-gray-600 mb-8">
              Provide information about your client to calculate industry-specific risk
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Acme Corporation"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Industry <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value as IndustryType })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {formatIndustryName(industry)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Annual Revenue (USD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.revenue || ''}
                    onChange={(e) => setFormData({ ...formData, revenue: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Employee Count <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.employeeCount || ''}
                    onChange={(e) => setFormData({ ...formData, employeeCount: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Critical Systems
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={criticalSystemInput}
                    onChange={(e) => setCriticalSystemInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCriticalSystem())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="EHR system, Billing platform, etc."
                  />
                  <button
                    type="button"
                    onClick={handleAddCriticalSystem}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.criticalSystems && formData.criticalSystems.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.criticalSystems.map((system, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {system}
                        <button
                          type="button"
                          onClick={() => handleRemoveCriticalSystem(index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Compliance Requirements (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={complianceInput}
                    onChange={(e) => setComplianceInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCompliance())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="HIPAA, PCI-DSS, SOC 2, etc."
                  />
                  <button
                    type="button"
                    onClick={handleAddCompliance}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.complianceRequirements && formData.complianceRequirements.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.complianceRequirements.map((req, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {req}
                        <button
                          type="button"
                          onClick={() => handleRemoveCompliance(index)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Primary Contact <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactInfo?.primaryContact || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        contactInfo: { ...formData.contactInfo!, primaryContact: e.target.value },
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.contactInfo?.email || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        contactInfo: { ...formData.contactInfo!, email: e.target.value },
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.contactInfo?.phone || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        contactInfo: { ...formData.contactInfo!, phone: e.target.value },
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="555-0123"
                    />
                  </div>
                </div>
              </div>

              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-red-800 font-semibold mb-2">Please fix the following errors:</h3>
                  <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Calculate Risk →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
