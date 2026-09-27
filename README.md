# xSOM Consulting — heritage blue

Bilingual corporate site served as checked-in HTML by GitHub Pages at
`www.xsom.fr`. No production build step. The original corporate copy is retained
from commit `a9dfd3c` on the remaining internal pages. The homepages and
expertise pages were redesigned at the user’s request.

## Content boundary

Other internal-page headings, paragraphs, services, references and tone remain
intact. The experimental product is intentionally absent from the corporate
offer, navigation, metadata and sitemap; its former URLs redirect to the
appropriate homepage with `noindex`. The old perspective URLs again redirect
to the sovereignty pages.

The following approved exceptions are applied:

- The homepages use a single full-screen film. Its words are live HTML titles,
  one short idea per shot, closing on the original three-arrow logo: “xSOM
  Consulting — cabinet de conseil SI, cybersécurité et IA”, the governance,
  cybersecurity and AI infrastructure statement, “Depuis 2007” and the CIO
  introduction (user brief, 2026-09-27). The former slogan, metrics, CTAs and
  lower homepage sections were removed at the user’s request on 2026-09-26;
  “Depuis 2007” returned in the film on 2026-09-27, and the offer section
  returned below the film the same day, reduced to a title, the drawn logo map
  and three illustrated cards (one line and four keywords each). Two closing
  sections follow (2026-09-27): a dotted map of missions (Bordeaux largest,
  Paris, Toulouse, Dakar, Mayotte; sizes as briefed, no figures) and a call to
  action (contact, LinkedIn).
- The expertise pages open with an 18-second edit of the approved xSOM film,
  one shot per practice (cyber, AI infrastructure, production), with live titles
  in the page's own words, a practice index that fills with each shot, and the
  homepage bar (Discover, play, sound) (2026-09-27). Three visual practice chapters, an operating path and six sector
  images replace the long-form copy. Diagram labels describe capabilities,
  without invented performance figures.
- The AI & sovereignty and careers pages were cut down around schemas on
  2026-09-27 at the user's request: every word comes from their original copy
  (tests/story-pages.test.cjs), one line per block, keywords as tags. Each opens
  on an 18-second film from three Grok clips (Sérénité / Sécurité / Souveraineté
  with a French flag; missions, decision-makers, transmission), with the same
  titles, bar and sound as the homepage (tests/page-films.test.cjs).
- The obsolete remote-font statement on the French cookie page is corrected,
  and both languages accurately disclose local reading preferences.
- The contact form retains secure POST/native-validation fallback, per-field
  feedback, double-submission protection and input preservation on failure.

`tests/heritage-copy.test.cjs` compares the 12 remaining internal-page texts and heading
hierarchies with the immutable original snapshot. It names and bounds every
exception; a changed or removed service paragraph fails the test.

## Design and authoring

- Original blue/grey logo assets, unchanged. `gradient.svg` on light backgrounds,
  `moderne-dark.svg` on dark backgrounds.
- Shared self-hosted Manrope and Source Sans 3; small technical labels use
  JetBrains Mono. Licences accompany the font files.
- Light default, deliberate navy diagram surfaces, and a full
  dark theme. Existing saved preferences remain respected.
- The homepage is the user's 30-second film, filling the viewport, with the
  five source clips' own sound (off on every visit). Timed titles follow the
  shots; the same words stay as static HTML for search engines, screen readers,
  reduced motion, no JavaScript and failed or slow playback. The bottom bar
  offers Discover (to the expertise page), play/pause and sound, as on the AI
  Guard film. Navigation and legal links remain available on the film. A
  portrait export serves phones. No video downloads without JS or with reduced
  motion.
- The expertise pages combine a film, a connected diagram, three technical
  visuals and a four-step delivery path. The film uses the same titles engine,
  bar, sound, playback and reduced-motion behavior as the homepage.
- Sovereignty diagrams retain their keyboard-readable controls.

See `design/design-spec.md` for the current authority. Brand tokens, fonts and
the preference runtime live in the shared `design-system/` package; do not
recolour logos or patch generated tokens.

The checked-in HTML is the copy source. Edit it directly. The optional command
below reapplies the design contracts without rewriting editorial content:

```sh
node tools/render-signal-pages.mjs
node tools/sync-partials.js --check
```

Rerun the renderer after changing any page CSS, JavaScript or homepage media. It versions every
generated runtime URL with the first 12 hex characters of that file's SHA-256,
so existing visitors receive matching HTML and assets without clearing their
browser cache. Unchanged assets retain the same URL.

The recovery option `--restore-original-copy` is deliberately explicit: it
restores the approved `a9dfd3c` text before applying the design, replacing later
copy edits. Normal maintenance must not use that option.

Site-specific implementation:

- `assets/css/heritage-site.css`: layout over the retained original HTML.
- `assets/js/heritage-site.js`: navigation, original-logo theme selection,
  practice connector focus and interactive existing diagrams.
- `assets/js/contact-form.js`: the preserved secure contact contract.
- `assets/css/story.css`, `assets/js/story.js`: schemas that draw themselves on arrival (AI &
  sovereignty, careers, homepage marks and closing call to action).
- `assets/css/film-titles.css`: live titles and film bar shared by the homepage and expertise films.
- `assets/css/home-film.css`: homepage composition.
- `assets/css/expertise-story.css`: expertise composition and diagrams.
- `assets/js/home-film.js`: shared playback and sound control for home and expertise films.
- `assets/js/film-titles.js`: homepage titles, a pure function of the film's current time.
- `assets/js/home-page.js`: homepage header scroll states, Discover glide, offer map and card reveal.
- `design/home-film.tokens.json`: corporate-only film layout tokens, emitted to
  `assets/css/home-film-tokens.css` by the page renderer; shared branding is unchanged.
- `tools/build-page-film.mjs xsom-<page> clip-1.mp4 clip-2.mp4 clip-3.mp4`: a page film from
  three generated clips (first 6 s each, own sound levelled, brighter shots matched to the
  site's footage). Both builders share `tools/film-edit.mjs`.
- `tools/build-home-film.mjs /path/to/approved-edit.mp4 /path/to/source-clips/`: local
  FFmpeg exports with the clips' levelled sound, and matching posters. Source provenance and editorial decisions are recorded
  in `design/home-film-qa.md`. Keep the original masters outside Git.
- `tools/build-presence-map.mjs /path/to/land-50m.json`: the map's dotted land mask from
  Natural Earth (world-atlas, ISC); `tools/presence-projection.mjs` holds the missions.
- `tools/render-signal-pages.mjs`: idempotent design application, hero markup,
  language metadata, old-route redirects and sitemap.

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
