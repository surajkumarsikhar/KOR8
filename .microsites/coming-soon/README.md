# KOR8 — Not Yet In Frame

Independent Coming Soon microsite for `kor8.in`. This folder is a complete Next.js project; it does not import the main KOR8 application. It lives inside `.microsites` so the main project's TypeScript file discovery does not include it. It can be moved into a separate repository unchanged.

## Develop and build

Use Node.js 22 or later.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Development and the static preview use port 3001. `npm run build` creates `out/`; preview serves that exact directory, with no Next.js server or backend.

## Deploy to Cloudflare Pages

See [SEO_SETUP.md](SEO_SETUP.md) for the metadata routes, Search Console setup, DNS precautions, validation, and full-site migration plan.

Create a separate Pages project for this microsite. If using the existing repository, set the root directory to `.microsites/coming-soon`; if using a separate repository, use its root.

- Build command: `npm run build`
- Output directory: `out`
- Node version: `22`
- No database, API bindings, or secrets required.
- Custom domain: connect `kor8.in` to this Pages project when ready to launch.

Alternatively, upload the contents of `out/` using Pages Direct Upload. `_headers`, `robots.txt`, sitemap, local font files, favicon, and Open Graph image are included in the export. No deployment or DNS changes are performed by building the project.

## Experience

Desktop has one scroll-scrubbed timeline with a CSS-sticky stage. The real KOR8 symbol's alpha silhouette masks the photographic portal. Intro, pointer depth, gate weave, and scroll motion have separate transform owners. The exposure button is keyboard accessible, limited to one exposure per 1.4 seconds, and uses a soft local light wash rather than a full-screen white flash.

Mobile uses normal document scrolling with no pin or scroll interception. Reduced motion shows a static, fully readable sequence and disables animated light, grain, parallax, gate weave, and exposure flashes. Contact remains available in the fixed header. No audio or video loads automatically.

## Assets and attribution

The symbol geometry and wordmark are exact copies of the existing KOR8 brand assets. The two supplied transparent portraits and the existing production placeholder were optimized into WebP files. The photographic scenes are explicitly labeled visual/illustrative studies, not commissioned client work. Replace these files with approved final work before representing them as portfolio projects.

Image payload is approximately 415 KB in total, plus the small SVG brand assets and Open Graph image. The main site is not modified.

The existing production placeholder originated from https://images.unsplash.com/photo-1485846234645-a62644f84728 and is used here only as an illustrative study.

## Verification

Production export and TypeScript checks pass. Browser checks cover desktop (1440×900), laptop (1366×768), tablet (768×1024), mobile (390×844), and reduced motion: exposure cooldown, contact links, reverse scrolling, keyboard skip, normal mobile flow, horizontal overflow, and invitation spacing. No browser runtime errors were observed.

To rerun `scripts/verify.cjs`, install Playwright separately or set `PLAYWRIGHT_MODULE` to an existing Playwright installation and `BROWSER_PATH` to a Chromium-based browser executable. Start the static preview first; tests use `http://127.0.0.1:3001`.
