import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/auth';
import { useFavorites, useToast } from '../hooks/app';
import { Page } from '../components/layout';
import { Btn, Chips, EmptyState, Skeleton } from '../components/ui';
import { Thumb } from '../components/cards';
import type { FavType } from '../types';
const FILTERS:{label:string;type?:FavType}[]=[{label:'All'},{label:'News',type:'news'},{label:'Products',type:'product'},{label:'Offers',type:'offer'},{label:'Calculators',type:'calculator'},{label:'Guides',type:'guide'}];
export function Favorites(){
 const {user,loading:authLoading}=useAuth();const {items,loading,remove,restore}=useFavorites();const toast=useToast();const[f,setF]=useState(0);const[q,setQ]=useState('');
 const shown=items.filter(i=>(!FILTERS[f].type||i.itemType===FILTERS[f].type)&&(!q||(i.title+(i.subtitle??'')).toLowerCase().includes(q.toLowerCase())));
 if(authLoading)return <Page title="Favorite" big tab><Skeleton rows={3}/></Page>;
 if(!user)return <Page title="Favorite" big tab><EmptyState icon="heart" title="Login to see your favorites" text="Save stories, products and offers across devices." action={<Btn to="/login">Login</Btn>}/></Page>;
 return <Page title="Favorite" big tab wide><label className="flex items-center gap-2.5 rounded-[14px] border border-line bg-surface px-3.5 py-3"><Search size={20} className="text-slate"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search saved items" aria-label="Search saved items" className="flex-1 bg-transparent text-sm outline-none"/></label><Chips items={FILTERS.map(x=>x.label)} value={f} onChange={setF}/>{loading?<Skeleton rows={3}/>:shown.length===0?<EmptyState icon="heart" title={items.length?'No matches':'Nothing saved yet'} text={items.length?'Try another filter or search.':'Tap the bookmark on any story, product or offer to keep it here.'} action={!items.length?<Btn to="/">Explore news</Btn>:undefined}/>:<ul className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">{shown.map(i=><li key={i.$id} className="flex items-center gap-3 rounded-card border border-line bg-white p-3"><Thumb src={i.imageUrl} className="h-16 w-16 shrink-0 rounded-xl"/><Link to={i.href} className="min-w-0 flex-1"><span className="block text-[11px] font-semibold capitalize text-pri-dark">{i.itemType}</span><span className="line-clamp-2 text-sm font-semibold">{i.title}</span>{i.subtitle&&<span className="block truncate text-xs text-slate">{i.subtitle}</span>}</Link><button aria-label="Remove from Favorites" className="p-2 text-slate" onClick={async()=>{await remove(i);toast.show('Removed from Favorites',{label:'Undo',run:()=>{restore(i).catch(()=>{});}});}}><Trash2 size={18}/></button></li>)}</ul>}</Page>;
}
