import { inr } from './format';

export interface Field { key: string; label: string; min: number; max: number; step: number; def: number; unit: 'inr' | 'pct' | 'yr' | 'num' }
export interface Result { label: string; value: string; rows: [string, string][]; split?: { a: number; b: number } }
export interface CalcDef {
  slug: string; title: string; desc: string; icon: string; fields: Field[]; assumptions: string[];
  compute?: (v: Record<string, number>) => Result;
  special?: 'tax';
}

const f = (key: string, label: string, min: number, max: number, step: number, def: number, unit: Field['unit']): Field => ({ key, label, min, max, step, def, unit });

export function emi(p: number, annualRate: number, years: number) {
  const n = Math.round(years * 12);
  const r = annualRate / 12 / 100;
  if (n <= 0) return 0;
  if (r === 0) return p / n;
  const g = Math.pow(1 + r, n);
  return (p * r * g) / (g - 1);
}
const emiResult = (v: Record<string, number>): Result => {
  const e = emi(v.amount, v.rate, v.years);
  const total = e * Math.round(v.years * 12);
  return { label: 'Monthly EMI', value: inr(e), rows: [['Principal', inr(v.amount)], ['Total interest', inr(total - v.amount)], ['Total repayment', inr(total)]], split: { a: v.amount, b: Math.max(0, total - v.amount) } };
};
const loanFields = (amt: Field) => [amt, f('rate', 'Interest rate (p.a.)', 1, 30, 0.1, 10, 'pct'), f('years', 'Tenure', 1, 30, 1, 5, 'yr')];

export const CALCS: CalcDef[] = [
  { slug: 'emi-calculator', title: 'EMI Calculator', desc: 'Monthly instalment, interest and total repayment.', icon: 'calc', fields: loanFields(f('amount', 'Loan amount', 10000, 20000000, 10000, 500000, 'inr')),
    assumptions: ['Fixed interest rate for the full tenure.', 'EMI paid monthly at month end; no prepayment.', 'Processing fees and taxes are not included.'], compute: emiResult },
  { slug: 'personal-loan-calculator', title: 'Personal Loan Calculator', desc: 'EMI for an unsecured personal loan.', icon: 'coin', fields: loanFields(f('amount', 'Loan amount', 10000, 5000000, 5000, 200000, 'inr')),
    assumptions: ['Fixed rate, monthly reducing balance.', 'Fees and insurance charges are not included.'], compute: emiResult },
  { slug: 'home-loan-calculator', title: 'Home Loan Calculator', desc: 'EMI for a home loan.', icon: 'home', fields: loanFields(f('amount', 'Loan amount', 100000, 100000000, 50000, 4000000, 'inr')),
    assumptions: ['Fixed rate for the tenure; floating-rate loans can change.', 'Processing fees and taxes are not included.'], compute: emiResult },
  { slug: 'sip-calculator', title: 'SIP Calculator', desc: 'Future value of a monthly investment.', icon: 'trend',
    fields: [f('monthly', 'Monthly investment', 500, 500000, 500, 10000, 'inr'), f('rate', 'Expected return (p.a.)', 1, 30, 0.5, 12, 'pct'), f('years', 'Duration', 1, 40, 1, 10, 'yr')],
    assumptions: ['Constant annual return; real returns vary and are not guaranteed.', 'Investment at the start of each month.', 'Taxes and expense ratio are not included.'],
    compute: (v) => { const i = v.rate / 12 / 100; const n = v.years * 12; const fv = i === 0 ? v.monthly * n : v.monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i); const inv = v.monthly * n;
      return { label: 'Total value', value: inr(fv), rows: [['Invested amount', inr(inv)], ['Estimated returns', inr(fv - inv)]], split: { a: inv, b: Math.max(0, fv - inv) } }; } },
  { slug: 'fd-calculator', title: 'FD Calculator', desc: 'Maturity value of a fixed deposit.', icon: 'bank',
    fields: [f('amount', 'Deposit amount', 1000, 100000000, 1000, 100000, 'inr'), f('rate', 'Interest rate (p.a.)', 1, 12, 0.05, 7, 'pct'), f('years', 'Tenure', 1, 10, 1, 5, 'yr')],
    assumptions: ['Interest compounded quarterly.', 'Tax deducted at source (TDS) is not included.'],
    compute: (v) => { const m = v.amount * Math.pow(1 + v.rate / 400, 4 * v.years); return { label: 'Maturity value', value: inr(m), rows: [['Deposit', inr(v.amount)], ['Interest earned', inr(m - v.amount)]], split: { a: v.amount, b: Math.max(0, m - v.amount) } }; } },
  { slug: 'rd-calculator', title: 'RD Calculator', desc: 'Maturity value of a recurring deposit.', icon: 'coin',
    fields: [f('monthly', 'Monthly deposit', 100, 500000, 100, 5000, 'inr'), f('rate', 'Interest rate (p.a.)', 1, 12, 0.05, 7, 'pct'), f('years', 'Tenure', 1, 10, 1, 5, 'yr')],
    assumptions: ['Quarterly compounding on each monthly instalment.', 'TDS is not included.'],
    compute: (v) => { const n = Math.round(v.years * 12); const q = v.rate / 400; let m = 0; for (let k = 1; k <= n; k++) m += v.monthly * Math.pow(1 + q, (n - k + 1) / 3); const dep = v.monthly * n;
      return { label: 'Maturity value', value: inr(m), rows: [['Total deposited', inr(dep)], ['Interest earned', inr(m - dep)]], split: { a: dep, b: Math.max(0, m - dep) } }; } },
  { slug: 'income-tax-calculator', title: 'Income Tax Calculator', desc: 'Compare old and new regime tax.', icon: 'file', special: 'tax',
    fields: [f('income', 'Annual income', 0, 100000000, 10000, 1200000, 'inr'), f('deductions', 'Eligible deductions (old regime)', 0, 1000000, 5000, 150000, 'inr')],
    assumptions: ['Salaried individual under 60; standard deduction applied.', 'Surcharge and marginal relief are not included.', 'Slabs are configured in taxConfig.ts; verify them for the selected year.'] },
  { slug: 'compound-interest-calculator', title: 'Compound Interest Calculator', desc: 'Growth of a lump sum with annual compounding.', icon: 'trend',
    fields: [f('amount', 'Principal', 1000, 100000000, 1000, 100000, 'inr'), f('rate', 'Rate (p.a.)', 1, 30, 0.1, 8, 'pct'), f('years', 'Time', 1, 40, 1, 10, 'yr')],
    assumptions: ['Interest compounded annually.', 'Taxes are not included.'],
    compute: (v) => { const m = v.amount * Math.pow(1 + v.rate / 100, v.years); return { label: 'Future value', value: inr(m), rows: [['Principal', inr(v.amount)], ['Interest', inr(m - v.amount)]], split: { a: v.amount, b: Math.max(0, m - v.amount) } }; } },
  { slug: 'inflation-calculator', title: 'Inflation Calculator', desc: 'What today’s money will need to be in future.', icon: 'bars',
    fields: [f('amount', 'Amount today', 1000, 100000000, 1000, 100000, 'inr'), f('rate', 'Inflation (p.a.)', 1, 20, 0.1, 6, 'pct'), f('years', 'Years', 1, 40, 1, 10, 'yr')],
    assumptions: ['Constant inflation rate for the whole period.'],
    compute: (v) => { const m = v.amount * Math.pow(1 + v.rate / 100, v.years); return { label: 'Same buying power needs', value: inr(m), rows: [['Today', inr(v.amount)], [`In ${v.years} years`, inr(m)]], split: { a: v.amount, b: Math.max(0, m - v.amount) } }; } },
  { slug: 'savings-goal-calculator', title: 'Savings Goal Calculator', desc: 'Monthly saving needed to reach a goal.', icon: 'star',
    fields: [f('goal', 'Goal amount', 10000, 500000000, 10000, 1000000, 'inr'), f('rate', 'Expected return (p.a.)', 0, 20, 0.5, 7, 'pct'), f('years', 'Years', 1, 40, 1, 5, 'yr')],
    assumptions: ['Monthly investing at the start of each month.', 'Constant return; not guaranteed.'],
    compute: (v) => { const i = v.rate / 12 / 100; const n = v.years * 12; const m = i === 0 ? v.goal / n : (v.goal * i) / ((Math.pow(1 + i, n) - 1) * (1 + i));
      return { label: 'Monthly saving needed', value: inr(m), rows: [['Goal', inr(v.goal)], ['Total contributed', inr(m * n)]], split: { a: m * n, b: Math.max(0, v.goal - m * n) } }; } },
  { slug: 'retirement-calculator', title: 'Retirement Calculator', desc: 'Corpus needed to fund your expenses.', icon: 'clock',
    fields: [f('age', 'Current age', 18, 70, 1, 30, 'num'), f('retire', 'Retirement age', 40, 75, 1, 60, 'num'), f('expense', 'Monthly expense today', 5000, 1000000, 1000, 50000, 'inr'), f('inflation', 'Inflation (p.a.)', 1, 15, 0.5, 6, 'pct'), f('post', 'Return after retirement (p.a.)', 1, 15, 0.5, 8, 'pct'), f('span', 'Years in retirement', 10, 45, 1, 25, 'yr')],
    assumptions: ['Expenses grow with inflation, including after retirement.', 'Withdrawals at the start of each year.', 'Pensions and other income are not considered.'],
    compute: (v) => { const yrs = Math.max(0, v.retire - v.age); const first = v.expense * 12 * Math.pow(1 + v.inflation / 100, yrs); const real = (1 + v.post / 100) / (1 + v.inflation / 100) - 1;
      const corpus = Math.abs(real) < 1e-9 ? first * v.span : (first * (1 - Math.pow(1 + real, -v.span)) / real) * (1 + real);
      return { label: 'Estimated corpus needed', value: inr(corpus), rows: [['Years to retirement', String(yrs)], ['Yearly expense at retirement', inr(first)]] }; } },
  { slug: 'credit-card-rewards-calculator', title: 'Credit Card Rewards Calculator', desc: 'Estimate yearly rewards against the annual fee.', icon: 'card',
    fields: [f('spend', 'Monthly spend', 1000, 1000000, 1000, 30000, 'inr'), f('rate', 'Reward rate', 0, 15, 0.1, 2, 'pct'), f('fee', 'Annual fee', 0, 100000, 100, 500, 'inr')],
    assumptions: ['Reward rate applies to all spends; caps and exclusions are ignored.', 'Check the card’s terms for the value of one reward point.'],
    compute: (v) => { const r = v.spend * 12 * (v.rate / 100); return { label: 'Net yearly rewards', value: inr(r - v.fee), rows: [['Yearly spend', inr(v.spend * 12)], ['Rewards earned', inr(r)], ['Annual fee', inr(v.fee)]], split: { a: Math.max(0, r - v.fee), b: v.fee } }; } },
];
export const findCalc = (slug?: string) => CALCS.find((c) => c.slug === slug);
export const fmtField = (fd: Field, v: number) => (fd.unit === 'inr' ? inr(v) : fd.unit === 'pct' ? `${v}%` : fd.unit === 'yr' ? `${v} yr` : String(v));