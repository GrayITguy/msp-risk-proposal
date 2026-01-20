import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            MSP Risk-to-Proposal Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform technical vulnerability scans into compelling business proposals that CFOs understand and approve
          </p>
        </header>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">61%</div>
              <p className="text-sm text-gray-700">of MSPs struggle to sell security services</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">&lt;15min</div>
              <p className="text-sm text-gray-700">to generate a complete proposal</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="text-4xl font-bold text-purple-600 mb-2">$$$</div>
              <p className="text-sm text-gray-700">quantified financial risk</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Upload Vulnerability Scan</h3>
                <p className="text-gray-600">Import scan results from Nessus, Qualys, or manual entry</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Provide Client Context</h3>
                <p className="text-gray-600">Enter business details: industry, revenue, employee count</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Calculate Financial Risk</h3>
                <p className="text-gray-600">AI converts CVSS scores to dollar amounts using industry breach data</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Generate Executive Proposal</h3>
                <p className="text-gray-600">Claude AI creates business-focused proposals that speak to CFOs</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link
              href="/upload"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg text-center transition-colors text-lg"
            >
              Start New Proposal
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Risk Quantification</h3>
              <p className="text-gray-600 text-sm">Converts CVSS scores to Annualized Loss Expectancy (ALE) using IBM breach cost data</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Writing</h3>
              <p className="text-gray-600 text-sm">Claude generates executive summaries and business-focused findings</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Industry-Specific</h3>
              <p className="text-gray-600 text-sm">Tailored risk calculations for healthcare, financial, retail, and more</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Export Ready</h3>
              <p className="text-gray-600 text-sm">Professional proposals ready to present to clients</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
