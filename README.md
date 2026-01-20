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

## Security Features

This application implements comprehensive security measures:

### Server-Side Session Storage
- Sensitive vulnerability data stored server-side only
- Session IDs stored client-side (no sensitive data in browser)
- 1-hour session expiration with automatic cleanup
- Protection against XSS attacks

### Rate Limiting
- API endpoints protected with per-IP rate limiting
- Proposal generation: 3 requests/minute
- General API: 30 requests/minute
- Sample data: 10 requests/minute

### Input Validation
- All inputs validated with Zod schemas
- Type-safe data handling throughout application
- Detailed validation error messages

### Security Headers
- Content Security Policy (CSP)
- XSS Protection
- HSTS (HTTP Strict Transport Security)
- Frame protection (X-Frame-Options: DENY)
- MIME type sniffing prevention

### Best Practices
- No hardcoded secrets
- API key validation at runtime
- Sanitized error messages (no stack trace exposure)
- Secure environment variable handling

## API Documentation

### Session Management API

#### Create Session
```http
POST /api/session
Content-Type: application/json

{
  "data": { ... }
}
```

Response:
```json
{
  "sessionId": "uuid-v4",
  "expiresAt": 1234567890
}
```

#### Get Session Data
```http
GET /api/session?sessionId=uuid-v4
```

Response:
```json
{
  "data": { ... },
  "expiresAt": 1234567890
}
```

#### Delete Session
```http
DELETE /api/session?sessionId=uuid-v4
```

### Proposal Generation API

```http
POST /api/generate-proposal
Content-Type: application/json

{
  "riskProfile": { ... },
  "clientContext": { ... },
  "vulnerabilities": [ ... ]
}
```

Response:
```json
{
  "executiveSummary": "...",
  "riskOverview": "...",
  "detailedFindings": [ ... ],
  "recommendations": [ ... ],
  "investmentJustification": "..."
}
```

### Sample Data API

```http
GET /api/sample-data
```

Returns sample vulnerability scan data for testing.

## Deployment

### Vercel (Recommended)

1. Push your repository to GitHub
2. Import project in Vercel
3. Add environment variable:
   - `ANTHROPIC_API_KEY`: Your Claude API key
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t msp-risk-proposal .
docker run -p 3000:3000 -e ANTHROPIC_API_KEY=sk-ant-... msp-risk-proposal
```

### Environment Variables

Required:
- `ANTHROPIC_API_KEY`: Your Anthropic Claude API key

Optional:
- `NEXT_PUBLIC_APP_URL`: Base URL (default: http://localhost:3000)
- `DATABASE_URL`: PostgreSQL connection (for future persistence)
- `REDIS_URL`: Redis connection (for session storage at scale)

See [.env.example](./.env.example) for full configuration.

## Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `npm test`
5. Build: `npm run build`
6. Commit: `git commit -m "Add your feature"`
7. Push: `git push origin feature/your-feature`
8. Open a Pull Request

### Coding Standards

- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Follow existing patterns in codebase
- Add tests for new features
- Update documentation as needed

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### Code Organization

- `app/`: Next.js pages and API routes
- `lib/`: Core business logic (risk calculations, AI integration)
- `components/`: Reusable React components
- `types/`: TypeScript type definitions
- `data/`: Static data files

## Troubleshooting

### API Key Issues

If you see "Failed to generate proposal":
- Verify your `ANTHROPIC_API_KEY` in `.env.local`
- Ensure the API key starts with `sk-ant-`
- Check your Anthropic account has API access

### Session Expired Errors

If you see "Session expired or not found":
- Sessions expire after 1 hour of inactivity
- Click "Start New Proposal" to begin again
- Consider saving proposal content before closing browser

### Rate Limit Errors

If you hit rate limits:
- Wait 60 seconds before retrying
- Check the `Retry-After` header in response
- Consider upgrading API tier for production use

### Build Errors

If you encounter build errors:
```bash
rm -rf .next node_modules
npm install
npm run build
```

## Roadmap

### Current Features (MVP)
- ✅ Vulnerability scan data upload
- ✅ Client business context collection
- ✅ Risk calculation with ALE methodology
- ✅ AI-powered proposal generation
- ✅ Server-side session storage
- ✅ Rate limiting and security headers
- ✅ Sample data for testing

### Planned Features
- 📋 Save/load client profiles
- 📋 Export to PDF with MSP branding
- 📋 Multiple proposal templates
- 📋 Integration with scan tools (Nessus, Qualys)
- 📋 Historical risk tracking
- 📋 Proposal comparison
- 📋 Email delivery
- 📋 Database persistence (PostgreSQL)
- 📋 Multi-tenant support

### Future Enhancements
- 🔮 Custom risk calculation formulas
- 🔮 Remediation cost estimation
- 🔮 Timeline generation
- 🔮 Compliance mapping (HIPAA, PCI-DSS, SOC 2)
- 🔮 Analytics dashboard
- 🔮 API for integration with RMM/PSA tools

## FAQ

### What vulnerability scanners are supported?

Currently, you can upload JSON files in the specified format. We're working on direct integrations with:
- Nessus
- Qualys
- OpenVAS
- Rapid7

### Can I customize the risk calculations?

Risk calculations are based on validated industry data. Future versions will support custom formulas for specialized scenarios.

### Is my client data secure?

Yes. All sensitive data is stored server-side with 1-hour expiration. Only session IDs are stored in the browser. See [Security Features](#security-features) for details.

### How accurate are the financial risk calculations?

Risk calculations use IBM's 2024 Cost of Breach data and CVSS scoring. While estimates are based on industry averages, actual breach costs vary. Always disclose that these are estimates.

### Can I white-label this for my MSP?

Future versions will support custom branding. Current version includes basic customization options.

### What's the cost?

The application is open source. You only pay for:
- Claude API usage (pay-as-you-go)
- Hosting costs (free tier available on Vercel)

Typical costs: ~$0.10-0.50 per proposal depending on length and complexity.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Support

- 📖 [Full Documentation](./CLAUDE.md)
- 🐛 [Report Issues](https://github.com/yourusername/msp-risk-proposal/issues)
- 💬 Discussions and questions welcome

## Acknowledgments

- **IBM Security** for Cost of Breach research data
- **Anthropic** for Claude AI capabilities
- **NIST** for CVSS scoring methodology
- **MSP Community** for feedback and validation

## Resources

- [CLAUDE.md](./CLAUDE.md) - Complete project documentation
- [SECURITY_FIXES_SUMMARY.md](./SECURITY_FIXES_SUMMARY.md) - Security audit details
- [SESSION_STORAGE_FIX.md](./SESSION_STORAGE_FIX.md) - Session migration documentation
- [Claude API Documentation](https://docs.anthropic.com/)
- [IBM Cost of Breach Report](https://www.ibm.com/security/data-breach)
- [CVSS Scoring System](https://www.first.org/cvss/)

## Built With

- **Next.js 14** - React framework with App Router
- **TypeScript 5** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Claude AI** (Anthropic) - Natural language generation
- **Zod** - Runtime type validation
- **IBM 2024 Breach Cost Data** - Industry-specific risk data

---

**Project Status:** MVP Complete | **Last Updated:** January 2026 | **Maintained By:** Solo Founder

Made with ☕ to help MSPs sell more security services
