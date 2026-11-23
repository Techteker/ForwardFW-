import { Account, Client, Databases, Functions, ID, Permission, Query, Role, Storage } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT as string | undefined;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID as string | undefined;

export const isConfigured = Boolean(endpoint && projectId);
export const DB = (import.meta.env.VITE_APPWRITE_DATABASE_ID as string | undefined) || 'newsfeed_main';
export const REWARDS_FN = import.meta.env.VITE_APPWRITE_REWARDS_FUNCTION_ID as string | undefined;

export const client = new Client().setEndpoint(endpoint || 'https://cloud.appwrite.io/v1').setProject(projectId || 'unset');
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export { ID, Permission, Query, Role };

export const COL = {
  users: 'users', news: 'news', categories: 'categories', brands: 'brands', offers: 'offers', products: 'products',
  reviews: 'product_reviews', comparisons: 'product_comparisons', favorites: 'favorites', notifications: 'notifications',
  history: 'reading_history', calcHistory: 'calculators_history', rewardEvents: 'reward_events', withdrawals: 'withdrawals',
  reports: 'reports', messages: 'contact_messages',
} as const;
