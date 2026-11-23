export interface Doc { $id: string; $createdAt: string; $updatedAt: string }

export interface Category extends Doc {
  name: string; slug: string; kind: 'news' | 'product'; icon?: string; sortOrder?: number; isTrending?: boolean;
}
export interface News extends Doc {
  title: string; slug: string; summary: string; body: string; imageUrl?: string;
  categoryName: string; categorySlug: string; publisher: string; sourceUrl: string; author?: string;
  publishedAt: string; readTime: number; status: string;
  isSponsored?: boolean; isBreaking?: boolean; isFeatured?: boolean; views?: number; relatedProductIds?: string[];
}
export interface Product extends Doc {
  name: string; slug: string; type: string; category: string; subcategory: string;
  bankName: string; bankLogo?: string; summary?: string;
  /** "Label|Value" pairs, e.g. "Annual fee|₹0". Shown on cards and in comparison. */
  facts: string[];
  benefits?: string[]; exclusions?: string[]; pros?: string[]; cons?: string[]; features?: string[];
  eligibility?: string; customerTypes?: string[];
  feeValue?: number; rewardRate?: number; cashbackRate?: number; editorialRank?: number;
  minIncome?: number; minAge?: number; maxAge?: number;
  applyUrl: string; verifiedAt: string; status: string; review?: string; applySteps?: string[];
}
export interface Offer extends Doc {
  title: string; brandId: string; brandName: string; brandLogo?: string; imageUrl?: string;
  description: string; discount: string; couponCode?: string; validTill: string; terms?: string[];
  externalUrl: string; category: string; isExclusive?: boolean; isTrending?: boolean; status: string;
}
export interface Brand extends Doc { name: string; logoUrl?: string; description?: string; status: string }
export interface Favorite extends Doc {
  userId: string; itemType: FavType; itemId: string; title: string; subtitle?: string; imageUrl?: string; href: string;
}
export type FavType = 'news' | 'product' | 'offer' | 'calculator' | 'guide';
export interface AppNotification extends Doc { userId?: string; title: string; body?: string; kind: 'news' | 'offer' | 'reward' | 'system'; href?: string }
export interface HistoryItem extends Doc { userId: string; newsId: string; title: string; slug: string; imageUrl?: string; categoryName?: string }
export interface RewardEvent extends Doc { userId: string; kind: string; label: string; coins: number }
export interface Withdrawal extends Doc { userId: string; amount: number; upiId: string; status: string }
export interface Wallet extends Doc { coins: number; balance: number; streak: number; lastCheckIn?: string; referralCode?: string }