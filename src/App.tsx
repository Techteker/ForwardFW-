import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './hooks/auth';
import { CompareProvider, FavoritesProvider, ToastProvider } from './hooks/app';
import { isConfigured } from './lib/appwrite';
import { AccountCreated, LanguageSelect, NotificationPermission, Onboarding } from './pages/onboarding';
import { ChangePassword, ForgotPassword, Login, MobileLogin, Register, ResetPassword, VerifyOtp } from './pages/auth';
import { Article, NewsCategory, NewsFeed, NewsHub, Notifications } from './pages/news';
import { AllCategories, CalculatorsHub, CategoryHub, CategoryLanding, MenuDrawer, NewsCategoriesGrid } from './pages/category';
import { ApplicationGuide, ComparePage, Disclosure, PartnerRedirect, ProductDetail, SubcategoryPage } from './pages/products';
import { BrandDetail, OfferDetail, Offers } from './pages/offers';
import { Favorites } from './pages/favorites';
import { Activity, EditProfile, MyReviews, PrefSettings, Profile, ReadingHistory, RecentlyViewed, Settings } from './pages/profile';
import { CoinsPage, DailyCheckIn, DailyTasks, EarningsHistory, ReadEarn, Referral, ReferralRewards, RewardHistory, RewardsDashboard, Transactions, WalletPage, Withdraw, WithdrawalHistory } from './pages/rewards';
import { CalculatorPage } from './pages/calculators';
import { AdvancedSearch, SearchPage } from './pages/search';
import { Contact, CookieBanner, CookieSettings, Faq, Maintenance, NotFound, Offline, Privacy, SetupScreen, Terms } from './pages/utility';
import { HomePage } from './pages/home';
import { FinancialProducts, LandingPage, ProductComparisons } from './pages/landing';
import { AppDownload, AppFeatures, AppLanding } from './pages/app';
import { Dashboard } from './pages/dashboard';
import { About, HelpCenter } from './pages/info';

export default function App() {
  if (!isConfigured) return <SetupScreen />;
  return (
    <BrowserRouter>
      <ToastProvider><AuthProvider><FavoritesProvider><CompareProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/credit-cards" element={<LandingPage id="credit-cards" />} />
          <Route path="/personal-loans" element={<LandingPage id="personal-loans" />} />
          <Route path="/business-loans" element={<LandingPage id="business-loans" />} />
          <Route path="/insurance" element={<LandingPage id="insurance" />} />
          <Route path="/investments" element={<LandingPage id="investments" />} />
          <Route path="/banking" element={<LandingPage id="banking" />} />
          <Route path="/financial-products" element={<FinancialProducts />} />
          <Route path="/product-comparisons" element={<ProductComparisons />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/product/:slug/guide" element={<ApplicationGuide />} />
          <Route path="/go/:slug" element={<PartnerRedirect />} />
          <Route path="/disclosure" element={<Disclosure />} />
          <Route path="/category" element={<CategoryHub />} />
          <Route path="/category/all" element={<AllCategories />} />
          <Route path="/category/news" element={<NewsCategoriesGrid />} />
          <Route path="/category/:slug" element={<CategoryLanding />} />
          <Route path="/menu" element={<MenuDrawer />} />
          <Route path="/calculators" element={<CalculatorsHub />} />
          <Route path="/calculators/:slug" element={<CalculatorPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/search/advanced" element={<AdvancedSearch />} />
          <Route path="/news" element={<NewsHub />} />
          <Route path="/articles" element={<NewsHub mode="articles" />} />
          <Route path="/feed/:kind" element={<NewsFeed />} />
          <Route path="/news/category/:slug" element={<NewsCategory />} />
          <Route path="/news/:slug" element={<Article />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/brand-offers" element={<Navigate to="/offers" replace />} />
          <Route path="/offers/category/:cat" element={<Offers />} />
          <Route path="/offers/:id" element={<OfferDetail />} />
          <Route path="/brands/:id" element={<BrandDetail />} />
          <Route path="/rewards" element={<RewardsDashboard />} />
          <Route path="/rewards/read-earn" element={<ReadEarn />} />
          <Route path="/rewards/tasks" element={<DailyTasks />} />
          <Route path="/rewards/check-in" element={<DailyCheckIn />} />
          <Route path="/rewards/history" element={<RewardHistory />} />
          <Route path="/rewards/earnings" element={<EarningsHistory />} />
          <Route path="/rewards/coins" element={<CoinsPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/wallet/withdraw" element={<Withdraw />} />
          <Route path="/wallet/withdrawals" element={<WithdrawalHistory />} />
          <Route path="/wallet/transactions" element={<Transactions />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/referral/rewards" element={<ReferralRewards />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/mobile" element={<MobileLogin />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Navigate to="/register" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/account-created" element={<AccountCreated />} />
          <Route path="/welcome" element={<Navigate to="/onboarding" replace />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/language" element={<LanguageSelect />} />
          <Route path="/notification-permission" element={<NotificationPermission />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/activity" element={<Activity />} />
          <Route path="/profile/history" element={<ReadingHistory />} />
          <Route path="/profile/recent" element={<RecentlyViewed />} />
          <Route path="/profile/reviews" element={<MyReviews />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/language" element={<LanguageSelect settings />} />
          <Route path="/settings/notifications" element={<PrefSettings kind="notifications" />} />
          <Route path="/settings/privacy" element={<PrefSettings kind="privacy" />} />
          <Route path="/settings/password" element={<ChangePassword />} />
          <Route path="/settings/cookies" element={<CookieSettings />} />
          <Route path="/app" element={<AppLanding />} />
          <Route path="/app/features" element={<AppFeatures />} />
          <Route path="/app/download" element={<AppDownload />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/offline" element={<Offline />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/:cat/:sub" element={<SubcategoryPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CookieBanner />
      </CompareProvider></FavoritesProvider></AuthProvider></ToastProvider>
    </BrowserRouter>
  );
}
