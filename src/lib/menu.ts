export type ProductType = 'credit_card' | 'bank_account' | 'loan' | 'insurance' | 'investment' | 'scheme';
export type SubMode = 'products' | 'guides' | 'eligibility' | 'compare';
export interface Sub { slug: string; label: string; mode?: SubMode }
export interface Cat { slug: string; label: string; icon: string; desc: string; type?: ProductType; mode: 'products' | 'guides'; subs: Sub[] }

const s = (slug: string, label: string, mode?: SubMode): Sub => ({ slug, label, mode });

export const CATEGORIES: Cat[] = [
  { slug: 'credit-cards', label: 'Credit Cards', icon: 'card', type: 'credit_card', mode: 'products', desc: 'Compare fees, rewards and eligibility.', subs: [
    s('best-credit-cards', 'Best Credit Cards'), s('best-credit-cards-for-beginners', 'For Beginners'), s('best-credit-cards-for-students', 'For Students'),
    s('lifetime-free-credit-cards', 'Lifetime Free'), s('cashback-credit-cards', 'Cashback'), s('travel-credit-cards', 'Travel'), s('fuel-credit-cards', 'Fuel'),
    s('shopping-credit-cards', 'Shopping'), s('rewards-credit-cards', 'Rewards'), s('business-credit-cards', 'Business'), s('premium-credit-cards', 'Premium'),
    s('rupay-credit-cards', 'RuPay'), s('credit-card-eligibility', 'Eligibility', 'eligibility'), s('credit-card-comparison', 'Comparison', 'compare')] },
  { slug: 'banking', label: 'Banking', icon: 'bank', type: 'bank_account', mode: 'products', desc: 'Savings, deposits and accounts.', subs: [
    s('best-savings-accounts', 'Best Savings Accounts'), s('zero-balance-accounts', 'Zero Balance'), s('salary-accounts', 'Salary Accounts'), s('senior-citizen-accounts', 'Senior Citizen'),
    s('digital-savings-accounts', 'Digital Savings'), s('fixed-deposits', 'Fixed Deposits'), s('recurring-deposits', 'Recurring Deposits'), s('small-finance-banks', 'Small Finance Banks'), s('current-accounts', 'Current Accounts')] },
  { slug: 'loans', label: 'Loans', icon: 'coin', type: 'loan', mode: 'products', desc: 'Compare rates, tenure and fees.', subs: [
    s('personal-loans', 'Personal Loans'), s('home-loans', 'Home Loans'), s('business-loans', 'Business Loans'), s('education-loans', 'Education Loans'), s('gold-loans', 'Gold Loans'),
    s('car-loans', 'Car Loans'), s('two-wheeler-loans', 'Two-Wheeler Loans'), s('loan-against-property', 'Loan Against Property'), s('loan-eligibility', 'Loan Eligibility', 'eligibility'), s('emi-comparison', 'EMI Comparison', 'compare')] },
  { slug: 'insurance', label: 'Insurance', icon: 'shield', type: 'insurance', mode: 'products', desc: 'Health, term, motor and travel cover.', subs: [
    s('health-insurance', 'Health Insurance'), s('term-life-insurance', 'Term Life'), s('life-insurance', 'Life Insurance'), s('car-insurance', 'Car Insurance'), s('bike-insurance', 'Bike Insurance'),
    s('travel-insurance', 'Travel Insurance'), s('family-health-insurance', 'Family Health'), s('senior-citizen-insurance', 'Senior Citizen'), s('insurance-comparison', 'Insurance Comparison', 'compare')] },
  { slug: 'investments', label: 'Investments', icon: 'trend', type: 'investment', mode: 'products', desc: 'Funds, stocks, bonds and savings schemes.', subs: [
    s('mutual-funds', 'Mutual Funds'), s('sip', 'SIP'), s('index-funds', 'Index Funds'), s('etfs', 'ETFs'), s('stocks', 'Stocks'), s('bonds', 'Bonds'), s('government-securities', 'Government Securities'),
    s('nps', 'NPS'), s('ppf', 'PPF'), s('epf', 'EPF'), s('fixed-deposits', 'Fixed Deposits'), s('gold-investments', 'Gold Investments')] },
  { slug: 'tax-savings', label: 'Tax & Savings', icon: 'file', mode: 'guides', desc: 'Guides, regimes and planning.', subs: [
    s('income-tax', 'Income Tax'), s('tax-saving-investments', 'Tax Saving Investments'), s('tax-regime-comparison', 'Tax Regime Comparison'), s('tax-calculators', 'Tax Calculators'), s('itr-guides', 'ITR Guides'), s('budget-planning', 'Budget Planning')] },
  { slug: 'government-schemes', label: 'Government Schemes', icon: 'users', type: 'scheme', mode: 'products', desc: 'Official savings and protection schemes.', subs: [
    s('pm-jan-dhan-yojana', 'PM Jan Dhan Yojana'), s('pmjjby', 'PMJJBY'), s('pmsby', 'PMSBY'), s('atal-pension-yojana', 'Atal Pension Yojana'), s('sukanya-samriddhi-yojana', 'Sukanya Samriddhi Yojana'),
    s('ppf', 'PPF'), s('national-savings-certificate', 'National Savings Certificate'), s('other-eligible-schemes', 'Other Eligible Schemes')] },
];

export const findCat = (slug?: string) => CATEGORIES.find((c) => c.slug === slug);
export const findSub = (cat?: Cat, slug?: string) => cat?.subs.find((x) => x.slug === slug);

export const OFFER_CATEGORIES: { slug: string; label: string }[] = [
  { slug: 'all', label: 'All' }, { slug: 'bank', label: 'Bank' }, { slug: 'credit-card', label: 'Credit Card' }, { slug: 'shopping', label: 'Shopping' },
  { slug: 'cashback', label: 'Cashback' }, { slug: 'travel', label: 'Travel' }, { slug: 'food', label: 'Food & Dining' }, { slug: 'recharge', label: 'Recharge' },
  { slug: 'insurance', label: 'Insurance' }, { slug: 'loan', label: 'Loan' }, { slug: 'investment', label: 'Investment' }, { slug: 'exclusive', label: 'Exclusive' }, { slug: 'trending', label: 'Trending' },
];

export const NEWS_CATEGORIES: { slug: string; name: string }[] = [
  ['business-news', 'Business News'], ['personal-finance', 'Personal Finance'], ['banking-news', 'Banking News'], ['stock-market-news', 'Stock Market News'], ['economy-news', 'Economy News'],
  ['tax-news', 'Tax News'], ['cryptocurrency-news', 'Cryptocurrency News'], ['mutual-fund-news', 'Mutual Fund News'], ['insurance-news', 'Insurance News'], ['credit-card-news', 'Credit Card News'],
  ['loan-news', 'Loan News'], ['investment-news', 'Investment News'], ['government-schemes-news', 'Government Schemes'], ['startup-news', 'Startup News'], ['technology-fintech-news', 'Technology & Fintech News'],
  ['real-estate-news', 'Real Estate News'], ['gold-silver-news', 'Gold & Silver News'], ['global-finance-news', 'Global Finance News'],
].map(([slug, name]) => ({ slug, name }));

