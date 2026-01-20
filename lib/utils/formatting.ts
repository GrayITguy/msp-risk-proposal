// Utility functions for formatting data

/**
 * Format number as currency (USD)
 * Rounds to nearest dollar to avoid false precision
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/**
 * Format number as percentage with one decimal place
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Format date as human-readable string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(num));
}

/**
 * Convert industry type to display name
 */
export function formatIndustryName(industry: string): string {
  const industryMap: Record<string, string> = {
    healthcare: 'Healthcare',
    financial: 'Financial Services',
    retail: 'Retail',
    manufacturing: 'Manufacturing',
    professional_services: 'Professional Services',
    education: 'Education',
    government: 'Government',
    technology: 'Technology',
    other: 'Other',
  };
  return industryMap[industry] || industry;
}

/**
 * Convert severity to display color class
 */
export function getSeverityColor(severity: string): string {
  const colorMap: Record<string, string> = {
    critical: 'text-red-600 bg-red-50',
    high: 'text-orange-600 bg-orange-50',
    medium: 'text-yellow-600 bg-yellow-50',
    low: 'text-blue-600 bg-blue-50',
  };
  return colorMap[severity] || 'text-gray-600 bg-gray-50';
}

/**
 * Convert confidence level to display text
 */
export function formatConfidenceLevel(level: string): string {
  const levelMap: Record<string, string> = {
    high: 'High Confidence',
    medium: 'Medium Confidence',
    low: 'Low Confidence',
  };
  return levelMap[level] || level;
}

/**
 * Generate a unique ID for proposals
 */
export function generateProposalId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `PROP-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generate a unique ID for clients
 */
export function generateClientId(companyName: string): string {
  const sanitized = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .substring(0, 20);
  const random = Math.random().toString(36).substring(2, 7);
  return `${sanitized}-${random}`;
}
