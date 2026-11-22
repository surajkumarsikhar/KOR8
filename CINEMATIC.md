# KOR8 cinematic homepage

The homepage uses the existing GSAP registration, intro readiness signal and one Lenis instance. The eight scenes share a CSS sticky stage and one scrubbed timeline in `CinematicExperience.tsx`. No GSAP pin spacers, text splitting or DOM reparenting are used in the homepage.

## Timeline

Film time runs from 0 to 14.4. Desktop uses 1550svh of document height; mobile uses 1100svh. The timeline maps the available scroll distance to those units.

| Transition | Film time | Behavior |
| --- | --- | --- |
| A | 0–2.8 | Light Swallow isolates IN; extracted Inter Tight contours morph to NI; UNIVERSE settles behind the gallery |
| B | 3.1–5.3 | Gallery frames travel upward while the quote emerges underneath |
| C | 5.7–8.5 | Portrait travels from below to above the viewport over the quote |
| D | 10–11.5 | The bone-white collage surface wipes across collaboration |
| Finale | 12.7–14.4 | Obsidian closing composition covers the collage |

The navigation resolves homepage anchors to timeline labels. In reduced-motion mode, all scenes return to normal document flow, all content is readable, and Lenis is disabled. Breakpoint and motion-preference changes revert and rebuild the GSAP context. Offstage scenes are inert so hidden links do not enter keyboard navigation.

The existing services, process, enquiry form and footer remain on `/studio`. The existing contact API had no delivery provider; it now returns 503 rather than acknowledging an undelivered enquiry. A direct email link remains available.

## Assets

Edit `src/content/cinematic.ts` to replace illustrative stock with approved KOR8 images. Set `placeholder: false` for approved work. Source URLs are recorded in `public/images/film/README.md`. Failed images fall back to labeled tonal studies. The existing SVG brand mark is used throughout.

## Verification

Run `node node_modules/typescript/bin/tsc --noEmit` and `npm run build`.

For browser checks, start the development server, then run `node scripts/verify-cinema.cjs` with Playwright available. Optional environment variables:

- `PLAYWRIGHT_MODULE`: path to an installed Playwright module.
- `BROWSER_PATH`: installed Chromium/Edge executable.
- `BASE_URL`: defaults to `http://localhost:3000`.

The browser script exercises actual scrolling through all four transitions, reversal, rapid scrolling, menu navigation and focus trapping, responsive resize, emulated touch input, missing-image fallbacks and reduced motion. Screenshots are written to the ignored `artifacts/cinema/` directory.

Run `node scripts/verify-refresh.cjs` against the development server to check Fast Refresh. This temporarily adds a harmless attribute to Hero, verifies the browser update, restores the exact original source and checks for reconciliation errors or duplicate stages.


Typography contours are extracted at weight 900 from the existing Inter Tight font. MorphSVGPlugin interpolates paths on the shared timeline. The later VISION → CREATE → BEYOND sequence uses the reusable MorphType component. Skip Intro records completion for the current tab session.

