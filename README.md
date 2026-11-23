# FORWORD.in Website (Liquid Glass)

Premium finance marketplace website for FORWORD.in. React 18 + Vite + TypeScript + Tailwind. It uses the **same Appwrite project, database (newsfeed_main) and collections as the Android app**, so accounts, favorites, history, rewards and wallet are shared.

## Run
```bash
npm install
cp .env.example .env
npm run dev
npm run build
npm run typecheck
```
No env variables = a Backend not configured screen. The site never shows demo data.

## Pages
| Area | Routes |
|---|---|
| Home | / |
| Product landings | /credit-cards /personal-loans /business-loans /insurance /investments /banking /financial-products |
| Compare | /product-comparisons /compare?ids=a,b,c /product/:slug |
| Calculators | /calculators and /calculators/:slug |
| News and articles | /news /articles /news/:slug /news/category/:slug |
| Offers | /offers /brand-offers /offers/:id /brands/:id |
| Rewards and wallet | /rewards /wallet /wallet/withdraw /referral |
| Account | /login /register /login/mobile /onboarding /dashboard /profile /favorites /settings/* |
| Android app | /app /app/features /app/download |
| Company | /about /contact /help /faq /privacy /terms /disclosure |

Global search: press Ctrl/Cmd + K (or use the header search) for search across products, news, offers, calculators and pages.

## Backend
Reuse the app backend. If collections are missing, run once (the API key stays on your machine and never goes in the frontend):
```bash
APPWRITE_ENDPOINT=... APPWRITE_PROJECT_ID=... APPWRITE_API_KEY=... npm run setup:appwrite
```
Add your website domain as a Web platform in Appwrite Console (Settings > Platforms), otherwise login and API calls can be blocked by CORS.

Data conventions: facts as Label|Value, denormalised bankName/categoryName/brandName, and status = approved. Pending items belong in the admin-only news_pending collection.

## Android app pages
Set VITE_PLAY_STORE_URL and/or VITE_ANDROID_APK_URL to show download buttons on /app/download. While both are empty, the page shows a notify-me form saved to contact_messages.

## Design system (Liquid Glass)
Defined in src/index.css and tailwind.config.js:
- .glass, .glass-tint, .glass-green use translucent gradients, backdrop blur/saturation, bright edge and inner highlight.
- .glass-hover lifts cards on hover; Reveal fades sections in on scroll; motion respects prefers-reduced-motion.
- Palette: Leaf #75A815, Lime #89C124, Mint #F1F7E7, Surface #F5F6F8, Ink #1C1E21, Slate #6B7280, Gold #F3B94F.
- Type: Manrope headings + Inter body.
See DESIGN_SPEC.md for layouts to rebuild in Figma.

## Before going live
- Verify tax slabs in src/lib/taxConfig.ts and replace draft Terms/Privacy text in src/pages/utility.tsx.
- This is a client-rendered SPA. For SEO add prerendering/SSR and a sitemap. robots.txt and SPA rewrites are included.
- Rewards need the server-side Appwrite Function described in the app README.
- Test on iOS Safari and Android Chrome. Glass blur can be GPU-heavy on low-end phones.
- The admin panel is a separate app.
