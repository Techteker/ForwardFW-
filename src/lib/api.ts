import { COL, DB, ID, Permission, Query, Role, databases, functions, REWARDS_FN } from './appwrite';
import type { AppNotification, Brand, Category, FavType, Favorite, HistoryItem, News, Offer, Product, RewardEvent, Wallet, Withdrawal } from '../types';

async function list<T>(col: string, q: string[] = []): Promise<T[]> {
  const r = await databases.listDocuments(DB, col, q);
  return r.documents as unknown as T[];
}
async function one<T>(col: string, q: string[]): Promise<T | null> {
  const r = await list<T>(col, [...q, Query.limit(1)]);
  return r[0] ?? null;
}

const cache = new Map<string, { t: number; v: unknown }>();
async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < ttlMs) return hit.v as T;
  const v = await fn();
  cache.set(key, { t: Date.now(), v });
  return v;
}

const APPROVED = Query.equal('status', 'approved');
export type FeedKind = 'latest' | 'trending' | 'breaking' | 'featured' | 'recommended' | 'top-stories';
export function getNews(opts: { category?: string; kind?: FeedKind; limit?: number } = {}) {
  const q = [APPROVED, Query.limit(opts.limit ?? 20)];
  if (opts.category) q.push(Query.equal('categorySlug', opts.category));
  switch (opts.kind) {
    case 'trending': case 'top-stories': q.push(Query.orderDesc('views')); break;
    case 'breaking': q.push(Query.equal('isBreaking', true), Query.orderDesc('publishedAt')); break;
    case 'featured': q.push(Query.equal('isFeatured', true), Query.orderDesc('publishedAt')); break;
    case 'recommended': q.push(Query.orderDesc('$updatedAt')); break;
    default: q.push(Query.orderDesc('publishedAt'));
  }
  return list<News>(COL.news, q);
}
export const getNewsBySlug = (slug: string) => one<News>(COL.news, [APPROVED, Query.equal('slug', slug)]);
export const getNewsCategories = () => cached('news-cats', 10 * 60_000, () => list<Category>(COL.categories, [Query.equal('kind', 'news'), Query.orderAsc('sortOrder'), Query.limit(40)]));
export const getTrendingTerms = () => cached('trend-terms', 10 * 60_000, () => list<Category>(COL.categories, [Query.equal('isTrending', true), Query.limit(8)]));

export const getProducts = (o: { category: string; subcategory?: string }) => {
  const q = [APPROVED, Query.equal('category', o.category), Query.orderAsc('editorialRank'), Query.limit(100)];
  if (o.subcategory) q.push(Query.equal('subcategory', o.subcategory));
  return list<Product>(COL.products, q);
};
export const getProductBySlug = (slug: string) => one<Product>(COL.products, [APPROVED, Query.equal('slug', slug)]);
export const getProductsByIds = (ids: string[]) => ids.length ? list<Product>(COL.products, [APPROVED, Query.equal('$id', ids), Query.limit(ids.length)]) : Promise.resolve([]);

export function getOffers(o: { category?: string; brandId?: string } = {}) {
  const q = [APPROVED, Query.orderDesc('$createdAt'), Query.limit(50)];
  if (o.brandId) q.push(Query.equal('brandId', o.brandId));
  if (o.category === 'exclusive') q.push(Query.equal('isExclusive', true));
  else if (o.category === 'trending') q.push(Query.equal('isTrending', true));
  else if (o.category && o.category !== 'all') q.push(Query.equal('category', o.category));
  return list<Offer>(COL.offers, q).then((r) => r.filter((x) => !x.validTill || new Date(x.validTill).getTime() >= Date.now()));
}
export const getOffer = (id: string) => databases.getDocument(DB, COL.offers, id) as unknown as Promise<Offer>;
export const getBrand = (id: string) => databases.getDocument(DB, COL.brands, id) as unknown as Promise<Brand>;

export async function searchAll(term: string) {
  const t = term.trim();
  if (t.length < 2) return { news: [], products: [], offers: [] };
  return cached('search:' + t.toLowerCase(), 2 * 60_000, async () => {
    const [news, products, offers] = await Promise.all([
      list<News>(COL.news, [APPROVED, Query.search('title', t), Query.limit(8)]),
      list<Product>(COL.products, [APPROVED, Query.search('name', t), Query.limit(8)]),
      list<Offer>(COL.offers, [APPROVED, Query.search('title', t), Query.limit(8)]),
    ]);
    return { news, products, offers };
  });
}

export const getFavorites = (userId: string) => list<Favorite>(COL.favorites, [Query.equal('userId', userId), Query.orderDesc('$createdAt'), Query.limit(200)]);
export const addFavorite = (userId: string, f: { itemType: FavType; itemId: string; title: string; subtitle?: string; imageUrl?: string; href: string }) =>
  databases.createDocument(DB, COL.favorites, ID.unique(), { userId, ...f }, [Permission.read(Role.user(userId)), Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))]) as unknown as Promise<Favorite>;
export const removeFavorite = (docId: string) => databases.deleteDocument(DB, COL.favorites, docId);

export const getHistory = (userId: string) => list<HistoryItem>(COL.history, [Query.equal('userId', userId), Query.orderDesc('$createdAt'), Query.limit(50)]);
export const addHistory = (userId: string, n: News) =>
  databases.createDocument(DB, COL.history, ID.unique(), { userId, newsId: n.$id, title: n.title, slug: n.slug, imageUrl: n.imageUrl, categoryName: n.categoryName }, [Permission.read(Role.user(userId)), Permission.delete(Role.user(userId))]);
export const clearHistory = async (userId: string) => { const items = await getHistory(userId); await Promise.all(items.map((i) => databases.deleteDocument(DB, COL.history, i.$id))); };
export const getNotifications = (userId?: string) => list<AppNotification>(COL.notifications, [userId ? Query.or([Query.equal('userId', userId), Query.isNull('userId')]) : Query.isNull('userId'), Query.orderDesc('$createdAt'), Query.limit(40)]);
export const reportArticle = (newsId: string, reason: string, userId?: string) =>
  databases.createDocument(DB, COL.reports, ID.unique(), { newsId, reason, userId: userId ?? '' }, [Permission.create(Role.any())]);
export const sendMessage = (m: { name: string; email: string; message: string }) => databases.createDocument(DB, COL.messages, ID.unique(), m, [Permission.create(Role.any())]);
export const saveCalc = (userId: string, slug: string, inputs: unknown, result: unknown) =>
  databases.createDocument(DB, COL.calcHistory, ID.unique(), { userId, slug, inputs: JSON.stringify(inputs), result: JSON.stringify(result) }, [Permission.read(Role.user(userId)), Permission.delete(Role.user(userId))]);

export const getWallet = (userId: string) => databases.getDocument(DB, COL.users, userId) as unknown as Promise<Wallet>;
export const getRewardEvents = (userId: string) => list<RewardEvent>(COL.rewardEvents, [Query.equal('userId', userId), Query.orderDesc('$createdAt'), Query.limit(50)]);
export const getWithdrawals = (userId: string) => list<Withdrawal>(COL.withdrawals, [Query.equal('userId', userId), Query.orderDesc('$createdAt'), Query.limit(50)]);
export async function rewardsAction(action: 'check-in' | 'read' | 'withdraw', payload: Record<string, unknown> = {}) {
  if (!REWARDS_FN) throw new Error('Rewards service is not configured yet.');
  const ex = await functions.createExecution(REWARDS_FN, JSON.stringify({ action, ...payload }), false);
  const body = ex.responseBody ? JSON.parse(ex.responseBody) : {};
  if (ex.responseStatusCode >= 400) throw new Error(body.error || 'Could not complete this action.');
  return body as Record<string, unknown>;
}
