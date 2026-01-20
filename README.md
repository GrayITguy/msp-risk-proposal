# MSP Risk-to-Proposal Tool

Transform technical vulnerability scans into compelling business proposals that CFOs understand and approve.

## Overview

This tool helps Managed Service Providers (MSPs) translate technical vulnerability scan data into business-focused security proposals by:

- Converting CVSS scores to Annualized Loss Expectancy (ALE) using IBM breach cost data
- Generating AI-powered executive summaries and business-focused findings
- Creating professional proposals ready to present to clients
- Providing industry-specific risk calculations

**Problem Solved:** 61% of MSPs struggle to get clients to invest in security services. This tool bridges the communication gap between technical findings and business decision-makers.

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Anthropic API key (for Claude AI integration)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Add your Anthropic API key to `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Running the Application

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Step 1: Upload Vulnerability Scan

- Click "Start New Proposal" on the home page
- Upload a JSON file with vulnerability scan data, or
- Click "Load Sample Data" to try with pre-loaded vulnerabilities

**Expected JSON Format:**
```json
{
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
}
```

### Step 2: Provide Client Context

Fill in business information about your client:
- Company name
- Industry (healthcare, financial, retail, etc.)
- Annual revenue
- Employee count
- Critical systems
- Compliance requirements (optional)
- Contact information

### Step 3: Review Risk Calculation

The tool automatically calculates:
- Total Annual Risk Exposure (ALE)
- Risk breakdown by severity
- Top 5 highest-risk vulnerabilities
- Confidence levels for each calculation

### Step 4: Generate Proposal

AI generates a complete proposal including:
- Executive Summary (business-focused language)
- Risk Overview with financial impact
- Detailed Findings (top 5 vulnerabilities)
- Investment Justification
- Next Steps

You can print or save as PDF directly from the browser.

## Risk Calculation Methodology

The tool uses the **Annualized Loss Expectancy (ALE)** formula:

```
ALE = SLE × ARO

Where:
- SLE (Single Loss Expectancy) = Asset Value × Exposure Factor
- ARO (Annual Rate of Occurrence) = Probability of breach per year
```

### Data Sources

- **IBM Cost of Breach Report 2024**: Industry-specific breach costs per record
- **CVSS Scores**: Mapped to exposure factors and breach probability
- **Client Business Data**: Used for asset valuation

### Example Calculation

For a healthcare client with 50 employees and a critical RDP vulnerability (CVSS 9.8):

- Industry breach cost: $408 per record
- Estimated records at risk: 100,000 patient records
- Exposure factor: 100% (critical system)
- Annual Rate of Occurrence: 40%

**Result:** ALE = $16,320,000 annually

## Supported Industries

- Healthcare
- Financial Services
- Retail
- Manufacturing
- Professional Services
- Education
- Government
- Technology
- Other

Each industry has specific breach cost data from IBM research.

## Project Structure

```
msp-risk-proposal/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page
│   ├── upload/            # Vulnerability upload
│   ├── context/           # Client context form
│   ├── calculate/         # Risk calculation display
│   ├── proposal/          # Proposal generation
│   └── api/               # API routes
├── lib/                   # Core business logic
│   ├── risk/             # Risk calculation engine
│   ├── ai/               # Claude API integration
│   └── utils/            # Utility functions
├── types/                 # TypeScript type definitions
└── data/                  # Static data files
    ├── breachCosts.json  # Industry breach costs
    └── sampleScan.json   # Sample vulnerability data
```

## Key Features

### Risk Quantification
- Converts technical CVSS scores to dollar amounts
- Uses validated industry breach cost data
- Provides confidence levels for calculations

### AI-Powered Content
- Claude generates executive summaries
- Business-focused finding descriptions
- Investment justification with ROI context

### Professional Output
- Print-ready proposals
- Clean, professional formatting
- Customizable for your MSP branding

## Troubleshooting

### API Key Issues

If you see "Failed to generate proposal":
- Verify your `ANTHROPIC_API_KEY` in `.env.local`
- Ensure the API key starts with `sk-ant-`
- Check your Anthropic account has API access

### Build Errors

If you encounter build errors:
```bash
rm -rf .next node_modules
npm install
npm run dev
```

## Resources

- [CLAUDE.md](./CLAUDE.md) - Full project documentation
- [Claude API Documentation](https://docs.anthropic.com/)
- [IBM Cost of Breach Report](https://www.ibm.com/security/data-breach)
- [CVSS Scoring System](https://www.first.org/cvss/)

## Built With

- Next.js 14 + TypeScript
- Tailwind CSS
- Claude AI (Anthropic)
- IBM 2024 Breach Cost Data

---

**Last Updated:** January 2026
