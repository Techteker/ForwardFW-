/**
 * One-time backend setup for FORWORD (database "newsfeed_main").
 * Creates missing collections, attributes and indexes, and seeds the news category list.
 * It never deletes anything and skips what already exists.
 *
 * Usage (run on your machine, the API key stays out of the frontend):
 *   APPWRITE_ENDPOINT=... APPWRITE_PROJECT_ID=... APPWRITE_API_KEY=... npm run setup:appwrite
 * The API key needs: databases.read/write, collections.read/write, attributes.read/write, indexes.read/write, documents.read/write.
 */
import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

const { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_DATABASE_ID = 'newsfeed_main' } = process.env;
if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) { console.error('Set APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID and APPWRITE_API_KEY.'); process.exit(1); }

const db = new Databases(new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID).setKey(APPWRITE_API_KEY));
const DB = APPWRITE_DATABASE_ID;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const safe = async (label, fn) => { try { await fn(); console.log('  +', label); } catch (e) { if (e.code === 409) console.log('  =', label, '(exists)'); else console.log('  !', label, e.message); } };

const READ_PUBLIC = [Permission.read(Role.any())];
const OWNER = [Permission.create(Role.users())];
const ANY_CREATE = [Permission.create(Role.any())];
const ADMIN = [];

const SCHEMA = {
  categories: { perms: READ_PUBLIC, doc: false, attrs: { name: 's*', slug: 's*', kind: 's*', icon: 's', sortOrder: 'i', isTrending: 'b' }, idx: [['slug', ['slug']], ['kind', ['kind']]] },
  news: { perms: READ_PUBLIC, doc: false, attrs: { title: 's*:300', slug: 's*', summary: 't', body: 't', imageUrl: 'u', categoryName: 's', categorySlug: 's', publisher: 's*', sourceUrl: 'u', author: 's', publishedAt: 'd', readTime: 'i', status: 's*', isSponsored: 'b', isBreaking: 'b', isFeatured: 'b', views: 'i', relatedProductIds: 's[]' }, idx: [['slug', ['slug']], ['status', ['status']], ['cat', ['categorySlug']], ['pub', ['publishedAt'], 'key', ['DESC']], ['views', ['views'], 'key', ['DESC']], ['title_ft', ['title'], 'fulltext']] },
  news_pending: { perms: ADMIN, doc: false, attrs: { title: 's:300', sourceUrl: 'u', payload: 't', status: 's' }, idx: [] },
  brands: { perms: READ_PUBLIC, doc: false, attrs: { name: 's*', logoUrl: 'u', description: 's:500', status: 's*' }, idx: [['status', ['status']]] },
  offers: { perms: READ_PUBLIC, doc: false, attrs: { title: 's*:300', brandId: 's*', brandName: 's', brandLogo: 'u', imageUrl: 'u', description: 't', discount: 's', couponCode: 's', validTill: 'd', terms: 's[]:500', externalUrl: 'u', category: 's', isExclusive: 'b', isTrending: 'b', status: 's*' }, idx: [['status', ['status']], ['cat', ['category']], ['brand', ['brandId']], ['title_ft', ['title'], 'fulltext']] },
  products: { perms: READ_PUBLIC, doc: false, attrs: { name: 's*:200', slug: 's*', type: 's', category: 's*', subcategory: 's*', bankName: 's', bankLogo: 'u', summary: 't', facts: 's[]:200', benefits: 's[]:300', exclusions: 's[]:300', pros: 's[]:200', cons: 's[]:200', features: 's[]:300', eligibility: 't', customerTypes: 's[]', feeValue: 'f', rewardRate: 'f', cashbackRate: 'f', editorialRank: 'i', minIncome: 'f', minAge: 'i', maxAge: 'i', applyUrl: 'u', verifiedAt: 'd', status: 's*', review: 't', applySteps: 's[]:200' }, idx: [['slug', ['slug']], ['cat_sub', ['category', 'subcategory']], ['status', ['status']], ['rank', ['editorialRank']], ['name_ft', ['name'], 'fulltext']] },
  product_reviews: { perms: READ_PUBLIC, doc: false, attrs: { productId: 's*', body: 't', verdict: 's', status: 's' }, idx: [['product', ['productId']]] },
  product_comparisons: { perms: READ_PUBLIC, doc: false, attrs: { title: 's', productIds: 's[]', status: 's' }, idx: [] },
  favorites: { perms: OWNER, doc: true, attrs: { userId: 's*', itemType: 's*', itemId: 's*', title: 's:300', subtitle: 's:300', imageUrl: 'u', href: 's:500' }, idx: [['user', ['userId']]] },
  reading_history: { perms: OWNER, doc: true, attrs: { userId: 's*', newsId: 's', title: 's:300', slug: 's', imageUrl: 'u', categoryName: 's' }, idx: [['user', ['userId']]] },
  calculators_history: { perms: OWNER, doc: true, attrs: { userId: 's*', slug: 's', inputs: 't', result: 't' }, idx: [['user', ['userId']]] },
  notifications: { perms: READ_PUBLIC, doc: false, attrs: { userId: 's', title: 's*:300', body: 's:500', kind: 's', href: 's:300' }, idx: [['user', ['userId']]] },
  users: { perms: ADMIN, doc: true, attrs: { name: 's', email: 's', coins: 'i', balance: 'f', streak: 'i', lastCheckIn: 'd', referralCode: 's' }, idx: [] },
  reward_events: { perms: ADMIN, doc: true, attrs: { userId: 's*', kind: 's', label: 's', coins: 'i' }, idx: [['user', ['userId']]] },
  withdrawals: { perms: ADMIN, doc: true, attrs: { userId: 's*', amount: 'f', upiId: 's', status: 's' }, idx: [['user', ['userId']]] },
  reports: { perms: ANY_CREATE, doc: false, attrs: { newsId: 's', reason: 's', userId: 's' }, idx: [] },
  contact_messages: { perms: ANY_CREATE, doc: false, attrs: { name: 's', email: 's', message: 't' }, idx: [] },
  rss_sources: { perms: ADMIN, doc: false, attrs: { name: 's', url: 'u', enabled: 'b' }, idx: [] },
  rss_logs: { perms: ADMIN, doc: false, attrs: { sourceId: 's', message: 's:500', level: 's' }, idx: [] },
  admin_users: { perms: ADMIN, doc: false, attrs: { userId: 's*', role: 's' }, idx: [['user', ['userId']]] },
};

async function addAttr(col, key, code) {
  const req = code.includes('*'); const arr = code.includes('[]');
  const t = code[0]; const sz = Number((code.split(':')[1]) || 255);
  if (t === 's') return db.createStringAttribute(DB, col, key, sz, req, undefined, arr);
  if (t === 't') return db.createStringAttribute(DB, col, key, 20000, req, undefined, arr);
  if (t === 'i') return db.createIntegerAttribute(DB, col, key, req, undefined, undefined, undefined, arr);
  if (t === 'f') return db.createFloatAttribute(DB, col, key, req, undefined, undefined, undefined, arr);
  if (t === 'b') return db.createBooleanAttribute(DB, col, key, req, undefined, arr);
  if (t === 'd') return db.createDatetimeAttribute(DB, col, key, req, undefined, arr);
  if (t === 'u') return db.createUrlAttribute(DB, col, key, req, undefined, arr);
}

console.log('Database', DB);
await safe('database', () => db.create(DB, DB));
for (const [id, c] of Object.entries(SCHEMA)) {
  console.log(id);
  await safe('collection', () => db.createCollection(DB, id, id, c.perms, c.doc));
  for (const [k, code] of Object.entries(c.attrs)) await safe('attr ' + k, () => addAttr(id, k.replace('[]', ''), code));
}
console.log('Waiting for attributes to become available…');
await sleep(8000);
for (const [id, c] of Object.entries(SCHEMA)) {
  for (const [name, attrs, type = 'key', orders] of c.idx) await safe(`index ${id}.${name}`, () => db.createIndex(DB, id, name, type, attrs, orders));
}

const NEWS_CATS = ['Business News', 'Personal Finance', 'Banking News', 'Stock Market News', 'Economy News', 'Tax News', 'Cryptocurrency News', 'Mutual Fund News', 'Insurance News', 'Credit Card News', 'Loan News', 'Investment News', 'Government Schemes', 'Startup News', 'Technology & Fintech News', 'Real Estate News', 'Gold & Silver News', 'Global Finance News'];
const slug = (s) => s.toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
let i = 0;
for (const name of NEWS_CATS) await safe('news category ' + name, () => db.createDocument(DB, 'categories', ID.unique(), { name, slug: slug(name), kind: 'news', sortOrder: i++ }));
console.log('Done. See README for permissions notes and the rewards function.');
