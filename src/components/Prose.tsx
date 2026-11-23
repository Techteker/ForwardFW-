import { ReactNode } from 'react';

const inline = (s: string): ReactNode[] =>
  s.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p));

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const headings = (body: string) => body.split('\n').filter((l) => l.startsWith('## ')).map((l) => l.slice(3).trim());

/** Minimal, safe renderer: ## / ### headings, "- " lists, **bold**, paragraphs. No raw HTML. */
export function Prose({ body }: { body: string }) {
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => { if (list.length) { out.push(<ul key={out.length} className="list-disc space-y-1.5 pl-5">{list.map((l, i) => <li key={i}>{inline(l)}</li>)}</ul>); list = []; } };
  body.split(/\n{1,}/).forEach((raw) => {
    const l = raw.trim();
    if (!l) return;
    if (l.startsWith('- ')) { list.push(l.slice(2)); return; }
    flush();
    if (l.startsWith('### ')) out.push(<h3 key={out.length} className="pt-2 text-base font-bold">{l.slice(4)}</h3>);
    else if (l.startsWith('## ')) out.push(<h2 id={slugify(l.slice(3))} key={out.length} className="scroll-mt-20 pt-3 text-xl font-bold">{l.slice(3)}</h2>);
    else out.push(<p key={out.length}>{inline(l)}</p>);
  });
  flush();
  return <div className="max-w-[65ch] space-y-3.5 text-[15px] leading-relaxed text-[#33383D]">{out}</div>;
}