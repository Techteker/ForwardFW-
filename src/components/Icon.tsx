import { BarChart3, Bell, Calculator, Clock, Coins, CreditCard, FileText, Gift, Globe, Heart, Home, Landmark, LayoutGrid, Newspaper, ShieldCheck, ShoppingBag, Star, Tag, TrendingUp, User, Users, Wallet, Plane, Utensils, Briefcase, Smartphone, HelpCircle, type LucideIcon } from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
  card: CreditCard, bank: Landmark, coin: Coins, shield: ShieldCheck, trend: TrendingUp, file: FileText, users: Users, calc: Calculator, home: Home,
  bars: BarChart3, star: Star, clock: Clock, news: Newspaper, wallet: Wallet, gift: Gift, tag: Tag, globe: Globe, bell: Bell, heart: Heart, user: User,
  grid: LayoutGrid, bag: ShoppingBag, plane: Plane, food: Utensils, brief: Briefcase, phone: Smartphone, help: HelpCircle,
};
export function Icon({ name, size = 20, className = '' }: { name: string; size?: number; className?: string }) {
  const C = MAP[name] ?? Star;
  return <C size={size} strokeWidth={2} className={className} aria-hidden />;
}
export function IconBadge({ name, size = 40, round = true }: { name: string; size?: number; round?: boolean }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center bg-mint text-pri-dark ${round ? 'rounded-full' : 'rounded-xl'}`} style={{ width: size, height: size }}>
      <Icon name={name} size={Math.round(size / 2)} />
    </span>
  );
}