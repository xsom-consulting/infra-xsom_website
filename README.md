# xSOM Consulting — corporate website

Bilingual static HTML served by GitHub Pages at `www.xsom.fr`. No production
build step. The corporate site introduces consulting services; `ai.xsom.fr`
presents AI services and products; `fleet.xsom.fr` presents the Fleet pilot.

## Editing and shared identity

Edit the checked-in HTML. Pages use the same `design-system/web.css`, tokens,
self-hosted Manrope and Source Sans 3 fonts as the AI and Fleet sites. Original
logos remain unchanged. The decorative architectural illustration is documented
in `design-system/ASSETS.md`. Both light and dark preferences remain supported.

The public pages are readable immediately, without timed titles or video
playback. The mobile menu works with a keyboard, closes with Escape, and exposes
its links without JavaScript. The contact form retains its native POST fallback,
validation, double-submission protection and input preservation after failure.

Marketing copy describes concrete services. Product availability must stay
qualified; no invented metrics, clients, certifications or savings. Legal copy
is preserved by snapshot checks. See `design-system/VOICE.md`. Product planning
and design decisions are maintained in the private product-planning repository.

After editing navigation or CSS/JS assets:

```sh
node tools/sync-partials.js
node tools/hash-runtime-assets.cjs
node tools/sync-partials.js --check
node --test tests/*.test.cjs
npm --prefix design-system run check
```

Runtime CSS/JS URLs contain the first 12 hex characters of their SHA-256. The
legacy `render-signal-pages.mjs` renderer belongs to the previous film layout;
do not run it over the current pages. Film sources and media remain available
for separate editorial use. Tests specific to the removed film-first interface
have been retired; browser acceptance covers the current visitor journeys.

## Browser acceptance

Serve this directory over localhost, then run `tools/verify-browser.cjs` with
`SITE_URL` pointing at that server. `PLAYWRIGHT_MODULE` may identify an installed
Playwright package. The script checks 18 pages at 390, 768 and 1440 pixels, in
both themes, including language links, images, anchors, no-script navigation,
keyboard menu behaviour and contact success/failure. Contact requests are mocked.
Set `SITE_QA_OUTPUT` to keep the screenshots and JSON report outside the repository.

## Films

Every video of the site is rendered by the Remotion project in `film/`, from stock
footage under the [Pexels License](https://www.pexels.com/license/) (free commercial use,
no attribution required; each clip is credited anyway in `film/footage.json`). Footage
is never committed; `npm run footage` downloads the exact 1080p clips again.

```sh
cd film
npm ci
npm run footage
npm run render            # or by film: npm run render -- xsom-film xsom-studio
node ../tools/render-signal-pages.mjs   # new content hashes in the pages
```

- `film/src/films.tsx`: each page-top film, shot by shot (clip, in-point, level and the
  focal point the 9:16 phone crop keeps), and the AI Studio loop.
- `film/src/kit.tsx`: 0.3 s dissolves, a slow push-in per shot, and the house grade (navy
  tone, darker edges under the header and the bar, vignette, fine grain).
- `film/scripts/render.mjs`: levels each film's music (`tools/film-score.mjs`), renders the
  desktop and phone exports with their first-frame posters, the studio loop and the three
  homepage offer stills.

Shots stay exactly six seconds long: the pages' live titles are timed to them. Remotion
is free for individuals and companies of up to three people; larger companies need a
[company licence](https://www.remotion.dev/license) to render commercially.

## Preview and verification

```sh
python3 -m http.server 4173 --bind 127.0.0.1
node --test tests/*.test.cjs
node tools/sync-partials.js --check
node --check assets/js/heritage-site.js
node --check assets/js/contact-form.js
```

With Playwright already installed in the sibling console project:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/poc-AI_guard/frontend/node_modules/@playwright/test \
  node tools/verify-browser.cjs
PLAYWRIGHT_MODULE=/absolute/path/to/poc-AI_guard/frontend/node_modules/@playwright/test \
  SITE_URL=http://127.0.0.1:4173 node tools/verify-home-film.cjs
```

The browser suite exercises 18 pages at 390/768/1440 in both themes, native
fallback, keyboard navigation, preferences, and mocked contact success/failure.
The film check covers both homepages at 390/736/768/1440 in both themes,
viewport fit, real video playback, keyboard pause/resume, reduced motion and
poster fallbacks when JavaScript, media or autoplay are unavailable.
Never submit real contact messages during tests. Visual critique and the latest
evidence location are recorded in `design/visual-qa.md` and `design/home-film-qa.md`.
The film check additionally exercises actual muted playback, pause/resume,
sound on/off, responsive source selection, title placement above the bottom bar,
reduced motion, no-JS and media/autoplay failures.
