# FORWORD Website: Design Spec (rebuild in Figma)

**Grid:** 1440 desktop, 12 columns, max content 1152px (max-w-6xl), 24px gutters. Tablet 768, mobile 390 (16px margins).
**Radius:** cards 24-32, pills 999, hero panels 36. **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96.
**Background:** #F7F9F2 with three soft radial blobs (lime top-left, gold top-right, leaf bottom).

**Liquid glass layer (fill + effects):**
- Fill: linear 135deg, white 72% to white 42%
- Background blur 22, saturation 180%
- Stroke 1px white 70% (inside)
- Shadow 0 10 34, rgba(40,56,10,.10); inner top highlight white 90%
- Tint variant: Mint 85% to white 45%. Green variant: #75A815 92% to #4F7A0A 88%, white 35% stroke.

**Type:** Manrope ExtraBold for headings (Display 64/68, H1 48/52, H2 36/40, H3 18/24), Inter 14-16 body, 11-12 labels.

**Frames to build (desktop 1440 + mobile 390):**
1. Header: floating glass pill, logo, 6 mega-menu items, search (Ctrl K), App, Login, Sign up. Mega menu = glass panel with 2 groups x icon links.
2. Home: hero (headline + glass search + tabbed product switcher + trust trio) / 8 category tiles / featured cards / Quick EMI widget / why FORWORD / news grid / offers / app CTA (green glass + phone) / FAQ / footer.
3. Product landing (Credit Cards, Personal Loans, Business Loans, Insurance, Investments, Banking): tinted glass hero with sub-category pills, filters + product grid, 3 guide cards, calculators, related news, FAQ.
4. Financial Products hub, Compare picker, Compare table (highlighted differences), Product detail.
5. Calculators hub; calculator (inputs card left, sticky green result card right, assumptions).
6. News hub, Articles, Article (narrow 720px), Offers, Offer detail, Brand.
7. Auth: Login, Sign up, Mobile OTP, Forgot/Reset; Onboarding wizard (3 steps).
8. Dashboard, Rewards, Wallet, Profile, Favorites, Settings.
9. App landing, App features (table), App download.
10. About, Contact, Help Center, Privacy, Terms, 404.

**Components:** Button (primary gradient lime to leaf with inner highlight, outline glass, accent gold), Chips, Segmented control, Input, Slider, Toggle, News card, Product card, Offer card, Result card, FAQ accordion, Search modal, Toast, Sheet, Footer.