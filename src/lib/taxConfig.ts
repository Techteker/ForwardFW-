/**
 * Income-tax slab data. Edit this file when the Finance Act changes.
 * Verify every value against the Income Tax Department before publishing.
 */
export interface Slab { upTo: number; rate: number }
export interface Regime { slabs: Slab[]; stdDeduction: number; rebateLimit: number; rebateMax: number }
export interface TaxYear { fy: string; new: Regime; old: Regime }

export const TAX_YEARS: TaxYear[] = [
  {
    fy: 'FY 2025-26',
    new: {
      slabs: [{ upTo: 400000, rate: 0 }, { upTo: 800000, rate: 5 }, { upTo: 1200000, rate: 10 }, { upTo: 1600000, rate: 15 }, { upTo: 2000000, rate: 20 }, { upTo: 2400000, rate: 25 }, { upTo: Infinity, rate: 30 }],
      stdDeduction: 75000, rebateLimit: 1200000, rebateMax: 60000,
    },
    old: {
      slabs: [{ upTo: 250000, rate: 0 }, { upTo: 500000, rate: 5 }, { upTo: 1000000, rate: 20 }, { upTo: Infinity, rate: 30 }],
      stdDeduction: 50000, rebateLimit: 500000, rebateMax: 12500,
    },
  },
];

export function computeTax(year: TaxYear, regime: 'new' | 'old', income: number, deductions: number) {
  const r = year[regime];
  const taxable = Math.max(0, income - r.stdDeduction - (regime === 'old' ? deductions : 0));
  let tax = 0;
  let prev = 0;
  for (const s of r.slabs) {
    if (taxable > prev) tax += (Math.min(taxable, s.upTo) - prev) * (s.rate / 100);
    prev = s.upTo;
  }
  if (taxable <= r.rebateLimit) tax = Math.max(0, tax - r.rebateMax);
  const cess = tax * 0.04;
  return { taxable, tax, cess, total: tax + cess };
}