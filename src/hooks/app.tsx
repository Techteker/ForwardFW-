import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addFavorite, getFavorites, removeFavorite } from '../lib/api';
import type { FavType, Favorite } from '../types';
import { useAuth } from './auth';

interface ToastCtx { show: (msg: string, action?: { label: string; run: () => void }) => void }
const T = createContext<ToastCtx>({ show: () => {} });
export const useToast = () => useContext(T);
export function ToastProvider({ children }: { children: ReactNode }) {
 const [t,setT]=useState<{msg:string;action?:{label:string;run:()=>void}}|null>(null);
 const show=useCallback<ToastCtx['show']>((msg,action)=>{setT({msg,action});window.setTimeout(()=>setT(null),4000);},[]);
 return <T.Provider value={{show}}>{children}{t&&<div role="status" className="fixed inset-x-4 bottom-24 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-xl bg-ink px-4 py-3 text-sm text-white shadow-card md:bottom-8"><span className="flex-1">{t.msg}</span>{t.action&&<button className="font-bold text-gold" onClick={()=>{t.action!.run();setT(null);}}>{t.action.label}</button>}</div>}</T.Provider>;
}
interface Snap { title:string;subtitle?:string;imageUrl?:string;href:string }
interface FavCtx { items:Favorite[];loading:boolean;isSaved:(type:FavType,id:string)=>boolean;toggle:(type:FavType,id:string,snap:Snap)=>Promise<void>;remove:(fav:Favorite)=>Promise<void>;restore:(fav:Favorite)=>Promise<void> }
const F=createContext<FavCtx>(null as unknown as FavCtx);
export const useFavorites=()=>useContext(F);
export function FavoritesProvider({children}:{children:ReactNode}) {
 const {user}=useAuth();const nav=useNavigate();const loc=useLocation();const toast=useToast();const [items,setItems]=useState<Favorite[]>([]);const [loading,setLoading]=useState(false);
 useEffect(()=>{if(!user){setItems([]);return;}setLoading(true);getFavorites(user.$id).then(setItems).catch(()=>setItems([])).finally(()=>setLoading(false));},[user]);
 const value=useMemo<FavCtx>(()=>({items,loading,isSaved:(type,id)=>items.some(i=>i.itemType===type&&i.itemId===id),
 toggle:async(type,id,snap)=>{if(!user){nav('/login',{state:{from:loc.pathname}});return;}const existing=items.find(i=>i.itemType===type&&i.itemId===id);try{if(existing){await removeFavorite(existing.$id);setItems(p=>p.filter(i=>i.$id!==existing.$id));toast.show('Removed from Favorites');}else{const f=await addFavorite(user.$id,{itemType:type,itemId:id,...snap});setItems(p=>[f,...p]);toast.show('Saved to Favorites',{label:'View',run:()=>nav('/favorites')});}}catch{toast.show('Could not update Favorites. Try again.');}},
 remove:async(fav)=>{await removeFavorite(fav.$id);setItems(p=>p.filter(i=>i.$id!==fav.$id));},
 restore:async(fav)=>{if(!user)return;const f=await addFavorite(user.$id,{itemType:fav.itemType,itemId:fav.itemId,title:fav.title,subtitle:fav.subtitle,imageUrl:fav.imageUrl,href:fav.href});setItems(p=>[f,...p]);}
 }),[items,loading,user,nav,loc.pathname,toast]);
 return <F.Provider value={value}>{children}</F.Provider>;
}
interface CmpCtx {ids:string[];has:(id:string)=>boolean;toggle:(id:string)=>void;clear:()=>void}
const C=createContext<CmpCtx>(null as unknown as CmpCtx);
export const useCompare=()=>useContext(C);
export function CompareProvider({children}:{children:ReactNode}) {
 const toast=useToast();const [ids,setIds]=useState<string[]>(()=>{try{return JSON.parse(sessionStorage.getItem('forword:compare')||'[]');}catch{return[];}});
 useEffect(()=>{sessionStorage.setItem('forword:compare',JSON.stringify(ids));},[ids]);
 const value=useMemo<CmpCtx>(()=>({ids,has:id=>ids.includes(id),clear:()=>setIds([]),toggle:id=>setIds(p=>{if(p.includes(id))return p.filter(x=>x!==id);if(p.length>=2){toast.show('You can compare up to 2 products.');return p;}return[...p,id];})}),[ids,toast]);
 return <C.Provider value={value}>{children}</C.Provider>;
}
export function useOnline() {
 const [on,setOn]=useState(navigator.onLine);
 useEffect(()=>{const a=()=>setOn(true),b=()=>setOn(false);window.addEventListener('online',a);window.addEventListener('offline',b);return()=>{window.removeEventListener('online',a);window.removeEventListener('offline',b);};},[]);
 return on;
}
