const nf = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export const inr = (n: number) => '₹ ' + nf.format(Math.round(Number.isFinite(n) ? n : 0));
export const num = (n: number) => nf.format(Math.round(n));

export function timeAgo(iso?: string): string {
  if (!iso) return '';
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return shortDate(iso);
}
export function shortDate(iso?: string): string {
  if (!iso) return 'Not available';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
export function parseFacts(facts?: string[]): [string, string][] {
  return (facts ?? []).map((f) => {
    const i = f.indexOf('|');
    return i < 0 ? [f, ''] : [f.slice(0, i).trim(), f.slice(i + 1).trim()];
  });
}
/** Only allow http(s) links for outbound navigation. */
export function safeUrl(u?: string): string | undefined {
  if (!u) return undefined;
  try {
    const p = new URL(u);
    return p.protocol === 'https:' || p.protocol === 'http:' ? p.toString() : undefined;
  } catch {
    return undefined;
  }
}