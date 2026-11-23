import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CALCS, findCalc, fmtField, type CalcDef, type Field as CField } from '../lib/calc';
import { TAX_YEARS, computeTax } from '../lib/taxConfig';
import { inr } from '../lib/format';
import { saveCalc } from '../lib/api';
import { useAuth } from '../hooks/auth';
import { Page } from '../components/layout';
import { Segmented } from '../components/ui';
import { SaveButton } from '../components/cards';
import { NotFound } from './utility';
const clamp=(v:number,f:CField)=>Math.min(f.max,Math.max(f.min,Number.isFinite(v)?v:f.min));
function SliderField({f,value,onChange}:{f:CField;value:number;onChange:(v:number)=>void}){
 const[text,setText]=useState(String(value));useEffect(()=>setText(String(value)),[value]);const pct=((value-f.min)/(f.max-f.min))*100;
 return <div className="space-y-2"><div className="flex items-center justify-between gap-3"><label htmlFor={`n-${f.key}`} className="text-[13px] font-medium text-slate">{f.label}</label><input id={`n-${f.key}`} inputMode="decimal" value={text} aria-describedby={`h-${f.key}`} onChange={e=>{setText(e.target.value);const v=Number(e.target.value.replace(/,/g,''));if(e.target.value!==''&&Number.isFinite(v))onChange(clamp(v,f));}} onBlur={()=>setText(String(value))} className="w-32 rounded-[10px] bg-mint px-3 py-1.5 text-right text-sm font-bold text-pri-dark outline-none focus:ring-2 focus:ring-pri"/><input type="range" min={f.min} max={f.max} step={f.step} value={value} aria-label={f.label} onChange={e=>onChange(Number(e.target.value))} className="hidden" /></div><input type="range" min={f.min} max={f.max} step={f.step} value={value} aria-label={f.label} onChange={e=>onChange(Number(e.target.value))} className="h-1.5 w-full cursor-pointer appearance-none rounded-full accent-pri" style={{background:`linear-gradient(to right, #75A815 ${pct}%, #E8EAEE ${pct}%)`}}/><p id={`h-${f.key}`} className="text-[11px] text-slate">{fmtField(f,f.min)} to {fmtField(f,f.max)}</p></div>;
}
function ResultCard({label,value,rows,split}:{label:string;value:string;rows:[string,string][];split?:{a:number;b:number}}){
 const total=split?split.a+split.b:0;return <div className="space-y-3 rounded-[18px] bg-pri p-4 text-white" aria-live="polite"><p className="text-xs font-medium text-white/90">{label}</p><p className="text-3xl font-bold">{value}</p>{split&&total>0&&<div className="flex h-2 overflow-hidden rounded bg-white/20" aria-hidden><span className="bg-white" style={{width:`${split.a/total*100}%`}}/><span className="bg-gold" style={{width:`${split.b/total*100}%`}}/></div>}<dl className="space-y-1.5">{rows.map(([k,v])=><div key={k} className="flex justify-between text-[13px]"><dt className="text-white/85">{k}</dt><dd className="font-semibold">{v}</dd></div>)}</dl></div>;
}
function Disclaimer({items}:{items:string[]}){return <div className="space-y-1.5 rounded-xl bg-surface p-3.5 text-[11px] text-slate"><p className="font-semibold text-ink">Assumptions</p><ul className="list-disc space-y-0.5 pl-4">{items.map(a=><li key={a}>{a}</li>)}</ul><p>Illustrative estimate only, not financial advice.</p></div>;}
function StandardCalc({def}:{def:CalcDef}){
 const{user}=useAuth();const[v,setV]=useState<Record<string,number>>(()=>Object.fromEntries(def.fields.map(f=>[f.key,f.def])));const r=useMemo(()=>def.compute!(v),[def,v]);
 useEffect(()=>{if(!user)return;const t=setTimeout(()=>{saveCalc(user.$id,def.slug,v,r).catch(()=>{});},4000);return()=>clearTimeout(t);},[user,def.slug,v,r]);
 const invalid=def.slug==='retirement-calculator'&&v.retire<=v.age;
 return <div className="grid gap-6 md:grid-cols-2 md:items-start"><div className="glass space-y-5 rounded-[28px] p-5 md:p-6">{def.fields.map(f=><SliderField key={f.key} f={f} value={v[f.key]} onChange={x=>setV({...v,[f.key]:x})}/>)}</div><div className="space-y-4 md:sticky md:top-24">{invalid?<p role="alert" className="rounded-xl bg-danger/10 p-3 text-sm font-medium text-danger">Retirement age must be higher than your current age.</p>:<ResultCard {...r}/>}<Disclaimer items={def.assumptions}/></div></div>;
}
function TaxCalc({def}:{def:CalcDef}){
 const[fy,setFy]=useState(0);const[regime,setRegime]=useState(0);const[v,setV]=useState<Record<string,number>>({income:def.fields[0].def,deductions:def.fields[1].def});const year=TAX_YEARS[fy];const key=regime===0?'new':'old';const a=computeTax(year,'new',v.income,v.deductions);const b=computeTax(year,'old',v.income,v.deductions);const cur=regime===0?a:b;const better=a.total<=b.total?'new':'old';
 return <div className="grid gap-6 md:grid-cols-2 md:items-start"><div className="glass space-y-5 rounded-[28px] p-5 md:p-6"><label className="block text-xs font-medium text-slate">Financial year<select value={fy} onChange={e=>setFy(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-3 text-sm">{TAX_YEARS.map((y,i)=><option key={y.fy} value={i}>{y.fy}</option>)}</select></label><Segmented items={['New regime','Old regime']} value={regime} onChange={setRegime}/><SliderField f={def.fields[0]} value={v.income} onChange={x=>setV({...v,income:x})}/>{key==='old'&&<SliderField f={def.fields[1]} value={v.deductions} onChange={x=>setV({...v,deductions:x})}/>}</div><div className="space-y-4 md:sticky md:top-24"><ResultCard label={`Estimated tax (${key} regime)`} value={inr(cur.total)} rows={ [['Taxable income',inr(cur.taxable)],['Tax before cess',inr(cur.tax)],['Health & education cess (4%)',inr(cur.cess)],['Other regime',inr(regime===0?b.total:a.total)]] }/><p className="rounded-xl bg-mint p-3 text-xs font-medium text-pri-dark">At these inputs the {better} regime gives the lower estimate.</p><Disclaimer items={def.assumptions}/></div></div>;
}
export function CalculatorPage(){const{slug}=useParams();const def=findCalc(slug);if(!def)return <NotFound/>;return <Page title={def.title} back wide right={<SaveButton type="calculator" id={def.slug} title={def.title} subtitle="Calculator" href={`/calculators/${def.slug}`} className="rounded-full bg-surface !p-2"/>}><div className="space-y-5"><p className="text-sm text-slate">{def.desc}</p>{def.special==='tax'?<TaxCalc key={def.slug} def={def}/>:<StandardCalc key={def.slug} def={def}/>}</div></Page>;}
export { CALCS };
