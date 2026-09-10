# xSOM Consulting — heritage blue

Bilingual corporate site served as checked-in HTML by GitHub Pages at
`www.xsom.fr`. No production build step. The original corporate copy is retained
from commit `a9dfd3c`: the correction changes the design, not the firm's message.

## Content boundary

Headings, paragraphs, services, references and the French/English tone remain
intact. The experimental product is intentionally absent from the corporate
offer, navigation, metadata and sitemap; its former URLs redirect to the
appropriate homepage with `noindex`. The old perspective URLs again redirect
to the sovereignty pages.

Only two narrowly scoped non-design exceptions are applied:

- The obsolete remote-font statement on the French cookie page is corrected,
  and both languages accurately disclose local reading preferences.
- The contact form retains secure POST/native-validation fallback, per-field
  feedback, double-submission protection and input preservation on failure.

`tests/heritage-copy.test.cjs` compares all 16 main-page texts and heading
hierarchies with the immutable original snapshot. It names and bounds every
exception; a changed or removed service paragraph fails the test.

## Design and authoring

- Original blue/grey logo assets, unchanged. `gradient.svg` on light backgrounds,
  `moderne-dark.svg` on dark backgrounds.
- Shared self-hosted Manrope and Source Sans 3; small technical labels use
  JetBrains Mono. Licences accompany the font files.
- Light default, deliberate navy diagram surfaces, and a full
  dark theme. Existing saved preferences remain respected.
- The hero uses the unchanged original three-arrow logo. Each arrow connects
  to an existing practice label and its real destination, with keyboard focus.
  The mark stays beside the headline from 700 CSS pixels, including the user's
  736px window, and follows the headline on phones. No JavaScript is required
  to see the logo or follow a practice link.
- Existing practice descriptions and sovereignty diagrams gain selectable
  paths. User-triggered movement stops at rest; reduced motion is respected.

See `design/design-spec.md` for the current authority. Brand tokens, fonts and
the preference runtime live in the shared `design-system/` package; do not
recolour logos or patch generated tokens.

The checked-in HTML is the copy source. Edit it directly. The optional command
below reapplies the design contracts without rewriting editorial content:

```sh
node tools/render-signal-pages.mjs
node tools/sync-partials.js --check
```

Rerun the renderer after changing any page CSS or JavaScript. It versions every
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
- `tools/render-signal-pages.mjs`: idempotent design application, hero markup,
  language metadata, old-route redirects and sitemap.

## Preview and verification

```sh
python3 -m http.server 4173 --bind 127.0.0.1
node --test tests/heritage-copy.test.cjs tests/signal-contract.test.cjs tests/hero-mark.test.cjs
node tools/sync-partials.js --check
node --check assets/js/heritage-site.js
node --check assets/js/contact-form.js
```

With Playwright already installed in the sibling console project:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/poc-AI_guard/frontend/node_modules/@playwright/test \
  node tools/verify-browser.cjs
PLAYWRIGHT_MODULE=/absolute/path/to/poc-AI_guard/frontend/node_modules/@playwright/test \
  node tools/verify-hero-mark.cjs
```

The browser suite exercises 18 pages at 390/768/1440 in both themes, native
fallback, keyboard navigation, preferences, and mocked contact success/failure.
The scoped hero guard checks both homepages at 390/736/768/1440 in both themes,
logo loading and placement in the first viewport, the exact original variants,
six real keyboard destinations, reduced motion and JavaScript-free navigation.
Never submit real contact messages during tests. Visual critique and the latest
evidence location are recorded in `design/visual-qa.md`.
