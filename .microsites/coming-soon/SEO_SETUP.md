# KOR8 search setup

## Deployment and indexing

1. Deploy the contents of `out/` at `https://kor8.in/`. Confirm the homepage, `/robots.txt`, `/sitemap.xml`, `/og-image.png`, and `/icon-512.png` return HTTP 200. Confirm HTTPS and redirect alternative hostnames to the canonical domain.
2. In Google Search Console, add `kor8.in` as a **Domain property**.
3. Copy Google's DNS TXT verification record into the domain's authoritative DNS provider. Add it as a separate record. Preserve all existing Hostinger email MX, SPF, DKIM, and DMARC records; do not replace them with the verification record.
4. Verify ownership and submit `https://kor8.in/sitemap.xml` in Sitemaps.
5. Use URL Inspection for `https://kor8.in/`, including the live test and rendered HTML.
6. Request indexing if appropriate. Submission is not a guarantee of indexing or a particular search title/snippet.
7. Monitor indexing, search performance, and Core Web Vitals. Check the deployed page with PageSpeed Insights and Google's Rich Results Test.

No deployment, DNS verification, Search Console submission, or indexing has been performed by this code update.

## Current implementation

- Next.js App Router static export, one canonical homepage. `app/layout.tsx` owns metadata; `app/page.tsx` emits Organization JSON-LD in the initial HTML.
- `app/sitemap.ts` and `app/robots.ts` use typed native metadata routes with `force-static`. The build generates root-level XML and text files. There are no public development routes to block, and CSS, JavaScript, and images remain crawlable.
- `lastModified` is fixed to **2026-11-23**, the date of this editorial update. Change it only after a meaningful homepage content update, never merely because a build ran.
- Social artwork is `public/og-image.png` (1200 × 630). Icons preserve the official symbol. Recreate artwork with `node scripts/social-assets.cjs`.
- One H1, existing scene H2s, meaningful image alternatives, and visible service copy. All page text is prerendered even though the interactive component hydrates on the client. The default layout is readable document flow; the sticky cinematic layout activates only after its timeline is initialized. Reduced motion and disabled JavaScript retain readable content.
- Local fonts use `next/font` with swap. Existing optimized WebP studies total roughly 415 KB. Below-the-fold images use lazy loading and async decoding. No new runtime animation or analytics dependencies were added.
- Organization data includes only the confirmed name, website, official logo, description, and email. No addresses, legal status, reviews, awards, or unverified social accounts are asserted.

## Validation and performance

The audit found a static App Router homepage with prerendered client-component text, basic metadata, static public SEO files, and no structured data. Existing image optimization and local font delivery were retained. Copy previously repeated cinematic slogans, and CSS hid desktop scenes before successful animation setup. This update replaces the SEO files with native routes, clarifies services and closing copy, and gates cinematic positioning on successful initialization.

Validation on 2026-11-23: production build and TypeScript passed; exported sitemap parsed as valid XML with exactly one canonical URL; robots, metadata, icons, social image dimensions, Organization JSON-LD fields, headings, internal links, initial HTML and no-JavaScript readability passed. No user-facing em dashes were found. Desktop, laptop, tablet, mobile, reduced motion, reverse scrolling, exposure cooldown, keyboard skip and CTA checks passed without browser runtime errors. Desktop and mobile screenshots were reviewed. JSON-LD was parsed and checked locally; Google's live Rich Results Test remains a post-deployment step.

Changed files: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `components/CinematicTeaser.tsx`; new `app/sitemap.ts` and `app/robots.ts` replace their `public` counterparts. Updated `public/og-image.png`; added `public/apple-touch-icon.png`, `public/icon-192.png`, `public/icon-512.png`, `scripts/social-assets.cjs`, `scripts/verify-seo.cjs`, and this guide. `README.md` links to this guide. The static export and deployment ZIP are regenerated outputs. The main KOR8 application is untouched.

Run `npm run build`, then `npm run preview`. The browser checks in `scripts/verify.cjs` and `scripts/verify-seo.cjs` use Playwright (set `PLAYWRIGHT_MODULE` and `BROWSER_PATH` if installed separately). They test the static export at `http://127.0.0.1:3001`.

Targets remain LCP ≤ 2.5 seconds, INP ≤ 200 milliseconds, CLS ≤ 0.1. Local checks cannot certify field Core Web Vitals. Measure real production traffic after deployment, particularly mobile devices and slower networks. No field performance or indexing result is claimed here.

## Full portfolio launch

Keep `https://kor8.in/` canonical and preserve existing URLs where possible. Add only published, useful portfolio or service pages to the sitemap, with their own genuine modification dates. Never add empty service pages or preview routes. Update the metadata and Organization description to reflect actual content and verified business details. Add descriptive project pages and permanent redirects if URLs change. Retain the domain verification record and resubmit the expanded sitemap.

References: [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization).
