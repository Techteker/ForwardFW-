import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Clock3, Flag, Link2, Newspaper, Search, Share2, TrendingUp } from 'lucide-react';
import { addHistory, getNews, getNewsBySlug, getNewsCategories, getNotifications, getProductsByIds, reportArticle, type FeedKind } from '../lib/api';
import { shortDate, timeAgo } from '../lib/format';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../hooks/auth';
import { useToast } from '../hooks/app';
import { Page } from '../components/layout';
import { Async, Btn, Chips, EmptyState, ErrorState, ListRow, Segmented, Sheet, SectionHeader, Skeleton } from '../components/ui';
import { FeaturedCard, NewsCard, ProductCard, SaveButton, Thumb } from '../components/cards';
import { Prose, headings, slugify } from '../components/Prose';

function FeedList({state,emptyText}:{state:any;emptyText:string}) {
 return <Async state={state} empty={<EmptyState title="No news yet" text={emptyText} action={<Btn onClick={state.reload}>Refresh</Btn>}/>}>{(items:any[])=><div className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">{items.map(n=><NewsCard key={n.$id} n={n}/>)}</div>}</Async>;
}
export function Home(){const cats=useAsync(getNewsCategories,[]);const[i,setI]=useState(0);const list=cats.data??[];const slug=i>0?list[i-1]?.slug:undefined;const feed=useAsync(()=>getNews({category:slug}),[slug]);const first=!slug?feed.data?.[0]:undefined;return <Page title="Home" logo tab wide><Chips items={['All',...list.map(c=>c.name)]} value={i} onChange={setI}/>{first&&<FeaturedCard n={first}/>}<FeedList state={{...feed,data:first?feed.data?.slice(1):feed.data}} emptyText="Approved stories for this category will appear here."/></Page>;}
const FEEDS:Record<string,string>={latest:'Latest News',trending:'Trending News',breaking:'Breaking News',featured:'Featured News',recommended:'Recommended News','top-stories':'Top Stories'};
export function NewsFeed(){const{kind='latest'}=useParams();const k=(kind in FEEDS?kind:'latest') as FeedKind;const state=useAsync(()=>getNews({kind:k,limit:k==='top-stories'?10:30}),[k]);return <Page title={FEEDS[k]} back><FeedList state={state} emptyText="Check back soon for new stories."/></Page>;}
const SUBS=['Latest','Popular','Explainers','Guides'];
export function NewsCategory(){const{slug=''}=useParams();const cats=useAsync(getNewsCategories,[]);const name=cats.data?.find(c=>c.slug===slug)?.name??'News';const[t,setT]=useState(0);const state=useAsync(()=>getNews({category:slug,kind:t===1?'trending':'latest'}),[slug,t]);return <Page title={name} back><Chips items={SUBS} value={t} onChange={setT}/><FeedList state={state} emptyText="Approved stories for this category will appear here."/></Page>;}
export function Article(){
 const{slug=''}=useParams();const{user}=useAuth();const toast=useToast();const state=useAsync(()=>getNewsBySlug(slug),[slug]);const n=state.data;const related=useAsync(()=>n?getNews({category:n.categorySlug,limit:5}):Promise.resolve([]),[n?.$id]);const products=useAsync(()=>getProductsByIds(n?.relatedProductIds??[]),[n?.$id]);const[report,setReport]=useState(false);
 useEffect(()=>{if(!n||!user)return;const key='forword:read:'+n.$id;if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');addHistory(user.$id,n).catch(()=>{});},[n?.$id,user?.$id]);
 if(state.loading)return <Page title="Article" back><Skeleton rows={3}/></Page>;if(state.error)return <Page title="Article" back><ErrorState text={state.error} onRetry={state.reload}/></Page>;if(!n)return <Page title="Not found" back><EmptyState icon="news" title="Story not found" text="It may have been removed or is not published yet." action={<Btn to="/">Go to Home</Btn>}/></Page>;
 const toc=headings(n.body);const share=async()=>{const url=window.location.href;if(navigator.share){try{await navigator.share({title:n.title,url});}catch{}}else{await navigator.clipboard.writeText(url);toast.show('Link copied');}};const more=(related.data??[]).filter(x=>x.$id!==n.$id).slice(0,4);
 return <Page title={n.title} back narrow right={<><button onClick={share} aria-label="Share article" className="rounded-full bg-surface p-2"><Share2 size={20}/></button><SaveButton type="news" id={n.$id} title={n.title} subtitle={n.publisher} imageUrl={n.imageUrl} href={'/news/'+n.slug} className="rounded-full bg-surface !p-2"/></>}><article className="space-y-4"><nav aria-label="Breadcrumb" className="text-xs text-slate"><Link to="/">Home</Link> / <Link to={'/news/category/'+n.categorySlug}>{n.categoryName}</Link></nav>{n.isSponsored&&<p className="rounded-[10px] bg-gold/20 px-3 py-2.5 text-xs font-medium text-[#8A5A00]">Sponsored content. Clearly separate from our news reporting.</p>}<div className="flex items-center gap-2 text-[11px]"><span className="rounded-[10px] bg-mint px-2.5 py-1 font-semibold text-pri-dark">{n.categoryName}</span><span className="text-slate">{n.isSponsored?'Sponsored':'News report · Not sponsored'}</span></div><h2 className="text-[26px] font-bold leading-tight">{n.title}</h2><p className="text-base text-slate">{n.summary}</p><Thumb src={n.imageUrl} alt="" className="h-52 w-full rounded-2xl md:h-80"/><p className="text-xs text-slate">{n.publisher}{n.author?' · '+n.author:''} · Published {shortDate(n.publishedAt)} · {n.readTime} min read</p>{toc.length>=3&&<nav aria-label="Table of contents" className="rounded-2xl bg-surface p-4"><h3 className="mb-2 text-sm font-bold">In this article</h3><ul className="space-y-1.5">{toc.map(h=><li key={h}><a href={'#'+slugify(h)} className="text-sm text-pri-dark underline">{h}</a></li>)}</ul></nav>}<Prose body={n.body}/><p className="text-xs text-slate">Source: <a href={n.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 underline"><Link2 size={12}/>{n.publisher}</a></p><button onClick={()=>setReport(true)} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate"><Flag size={14}/>Report this article</button></article>{(products.data?.length??0)>0&&<><SectionHeader title="Related products"/><p className="text-[11px] text-slate">Partner links may earn FORWORD a commission and never affect our reporting.</p>{products.data!.map(p=><ProductCard key={p.$id} p={p}/>)}</>}{more.length>0&&<><SectionHeader title="Related news"/>{more.map(x=><NewsCard key={x.$id} n={x}/>)}</>}<ReportSheet open={report} onClose={()=>setReport(false)} newsId={n.$id}/></Page>;
}
function ReportSheet({open,onClose,newsId}:{open:boolean;onClose:()=>void;newsId:string}){const{user}=useAuth();const toast=useToast();const send=async(reason:string)=>{try{await reportArticle(newsId,reason,user?.$id);toast.show('Thanks. We will review this article.');}catch{toast.show('Could not send the report. Try again.');}onClose();};return <Sheet open={open} onClose={onClose} title="Report this article">{['Inaccurate information','Duplicate story','Looks like an advertisement','Other'].map(r=><ListRow key={r} icon="help" title={r} onClick={()=>send(r)}/>)}</Sheet>;}
export function Notifications(){const{user}=useAuth();const nav=useNavigate();const[tab,setTab]=useState(0);const state=useAsync(()=>getNotifications(user?.$id),[user?.$id]);const kinds=[null,'news','offer','reward'];const iconOf={news:'news',offer:'tag',reward:'coin',system:'bell'} as const;return <Page title="Notifications" back right={<Link to="/settings/notifications" className="rounded-full bg-surface p-2 text-sm font-semibold">Settings</Link>}><Segmented items={['All','News','Offers','Rewards']} value={tab} onChange={setTab}/><Async state={{...state,data:state.data?.filter(x=>!kinds[tab]||x.kind===kinds[tab])}} empty={<EmptyState icon="bell" title="You are all caught up" text="New alerts will show up here."/>}>{items=><div>{items.map(x=><ListRow key={x.$id} icon={iconOf[x.kind]} title={x.title} sub={(x.body??'')+' '+timeAgo(x.$createdAt)} onClick={x.href?()=>nav(x.href!):undefined} right="none"/>)}</div>}</Async></Page>;}
export function NewsHub({mode='news'}:{mode?:'news'|'articles'}){
 const cats=useAsync(getNewsCategories,[]);
 const [categoryIndex,setCategoryIndex]=useState(0);
 const [kind,setKind]=useState<'latest'|'trending'|'breaking'|'top-stories'>('latest');
 const [query,setQuery]=useState('');
 const list=cats.data??[];
 const slug=categoryIndex>0?list[categoryIndex-1]?.slug:undefined;
 const feed=useAsync(()=>getNews({category:slug,kind:mode==='articles'?'recommended':kind,limit:30}),[slug,mode,kind]);
 const trending=useAsync(()=>getNews({kind:'trending',limit:5}),[mode]);
 const first=!slug&&kind==='latest'?feed.data?.[0]:undefined;
 const title=mode==='articles'?'Articles & Guides':'Money & Markets';
 const filtered=(feed.data??[]).filter(n=>!query.trim()||[n.title,n.summary,n.categoryName,n.publisher].some(v=>(v??'').toLowerCase().includes(query.trim().toLowerCase())));
 const tabs=[{id:'latest' as const,label:'Latest'},{id:'trending' as const,label:'Trending'},{id:'breaking' as const,label:'Breaking'},{id:'top-stories' as const,label:'Top stories'}];
 return <Page title={mode==='articles'?'Articles & Guides':'Financial News'} bare hero={<section className="mx-auto max-w-6xl px-4 pt-8 md:px-6 md:pt-14">
  <div className="overflow-hidden rounded-[32px] bg-[#102b25] p-6 text-white shadow-[0_24px_70px_rgba(16,43,37,.18)] md:p-10">
   <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-emerald-200"><Newspaper size={15}/> FORWORD • Money desk</div>
   <div className="mt-5 grid gap-6 md:grid-cols-[1.2fr_.8fr] md:items-end">
    <div><h1 className="max-w-3xl text-4xl font-extrabold leading-[1.04] md:text-6xl">{mode==='articles'?'Understand money. Make informed moves.':'The stories moving your money.'}</h1>
     <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 md:text-base">{mode==='articles'?'Clear explainers, practical guides and expert-led financial education.':'Business, markets, economy, banking and personal finance news — curated for India.'}</p>
    </div>
    <form onSubmit={e=>e.preventDefault()} role="search" className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-2">
     <Search size={18} className="ml-2 shrink-0 text-white/65"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search financial news…" aria-label="Search financial news" className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-white outline-none placeholder:text-white/50"/>
    </form>
   </div>
   <div className="mt-7 flex flex-wrap gap-2">
    <Link to="/feed/top-stories" className="inline-flex items-center gap-2 rounded-full bg-[#c9f36a] px-4 py-2.5 text-xs font-extrabold text-[#173b2b]">Top stories <ArrowRight size={14}/></Link>
    <Link to="/feed/trending" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-xs font-bold text-white">Trending now <TrendingUp size={14}/></Link>
    <Link to="/articles" className="rounded-full border border-white/20 px-4 py-2.5 text-xs font-bold text-white">Guides & explainers</Link>
   </div>
  </div>
 </section>}>
  <div className="space-y-8 pb-8">
   {mode==='news'&&<section className="space-y-3">
    <div className="flex items-center justify-between gap-3"><div><p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-pri-dark">Your daily briefing</p><h2 className="text-xl font-extrabold md:text-2xl">Explore the money beat</h2></div><span className="text-xs text-slate">India-focused coverage</span></div>
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
     {[['Stock markets','stock-market-news'],['Business','business-news'],['Personal finance','personal-finance'],['Economy','economy-news']].map(([label,cat])=><Link key={cat} to={'/news/category/'+cat} className="group flex items-center justify-between rounded-2xl border border-white/80 bg-white/70 p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:bg-white md:p-4"><span className="text-sm font-bold">{label}</span><ArrowRight size={15} className="text-pri-dark transition group-hover:translate-x-1"/></Link>)}
    </div>
   </section>}
   {mode==='news'&&<section className="rounded-3xl border border-white/80 bg-white/65 p-3 md:p-4">
    <div className="mb-3 flex items-center gap-2"><TrendingUp size={17} className="text-pri-dark"/><h2 className="text-sm font-extrabold">News desk</h2></div>
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">{tabs.map(t=><button key={t.id} onClick={()=>{setKind(t.id);setCategoryIndex(0);}} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${kind===t.id?'bg-[#173b2b] text-white':'bg-white text-slate hover:bg-mint'}`}>{t.label}</button>)}</div>
   </section>}
   <section className="space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-pri-dark">{mode==='articles'?'Learn':'Latest coverage'}</p><h2 className="text-2xl font-extrabold">{mode==='articles'?'Guides & explainers':tabs.find(t=>t.id===kind)?.label+' financial news'}</h2></div><div className="flex items-center gap-1.5 text-xs text-slate"><Clock3 size={14}/> Updated from approved newsroom stories</div></div>
    <Chips items={['All',...list.map(c=>c.name)]} value={categoryIndex} onChange={setCategoryIndex}/>
    {first&&!query.trim()&&<FeaturedCard n={first}/>}
    {feed.loading?<Skeleton rows={4}/>:feed.error?<ErrorState text={feed.error} onRetry={feed.reload}/>:filtered.length===0?<EmptyState title="No matching stories" text="Try another search or choose a different category." action={<Btn onClick={()=>{setQuery('');setCategoryIndex(0);setKind('latest');}}>Reset filters</Btn>}/>:<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{(first&&!query.trim()?filtered.filter(n=>n.$id!==first.$id):filtered).map(n=><NewsCard key={n.$id} n={n}/>)}</div>}
   </section>
   {mode==='news'&&(trending.data?.length??0)>0&&<section className="space-y-3"><div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">Trending in finance</h2><Link to="/feed/trending" className="inline-flex items-center gap-1 text-xs font-bold text-pri-dark">See all <ArrowRight size={14}/></Link></div><div className="grid gap-3 md:grid-cols-5">{trending.data!.slice(0,5).map((n,index)=><Link key={n.$id} to={'/news/'+n.slug} className="group rounded-2xl border border-white/80 bg-white/65 p-4 transition hover:-translate-y-0.5 hover:bg-white"><span className="text-[11px] font-extrabold text-pri-dark">0{index+1} • {n.categoryName}</span><h3 className="mt-2 line-clamp-3 text-sm font-bold leading-snug group-hover:text-pri-dark">{n.title}</h3><p className="mt-3 text-[11px] text-slate">{n.publisher}</p></Link>)}</div></section>}
   {mode==='news'&&<section className="rounded-3xl bg-[#edf4e8] p-5 md:flex md:items-center md:justify-between md:p-6"><div><p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-pri-dark">More than headlines</p><h2 className="mt-1 text-xl font-extrabold">Make sense of your money</h2><p className="mt-1 text-sm text-slate">Use free calculators and compare financial products with clear disclosures.</p></div><div className="mt-4 flex flex-wrap gap-2 md:mt-0"><Link to="/calculators" className="rounded-full bg-[#173b2b] px-4 py-2.5 text-xs font-bold text-white">Explore calculators</Link><Link to="/product-comparisons" className="rounded-full border border-[#173b2b]/20 bg-white px-4 py-2.5 text-xs font-bold text-[#173b2b]">Compare products</Link></div></section>}
  </div>
 </Page>;
}
