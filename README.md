# xSOM Consulting — xSOM Signal

Bilingual corporate site, served as checked-in HTML by GitHub Pages at `www.xsom.fr`.
**No production build step.** Merging `main` publishes the site.

## Preview

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173`. French is at the root; English mirrors live in `en/`.
The visual component catalogue is at `/design-system/preview.html`.

To regenerate signature clips and the logo/social kit, keep that server running.
With the console's frontend dependencies installed, run from this repository:

```sh
node tools/render-signal-media.mjs . /absolute/path/to/poc-AI_guard/frontend
node tools/render-signal-kit.mjs . /absolute/path/to/poc-AI_guard/frontend
```

These optional maintenance tools require Playwright Chromium, FFmpeg and `cwebp`
(`CWEBP_BIN` may name the encoder). No runtime service is required. The kit script
also updates the explicitly supplied console's favicon and public mark.

## One identity, two products

This repository and `jt33120/poc-AI_guard` consume the same versioned
`design-system/` directory. Its source of truth is
`design-system/design/tokens.json`; generated CSS, verdict states, diagrams and
preferences are shared byte for byte.

- Self-hosted Saira, Inter and JetBrains Mono WOFF2 files; no font CDN.
- Original interlocking-arrow mark, mechanically recolored in copper, bronze and ivory.
- Warm charcoal default, independently defined light theme.
- AuthorizationFlow and Guarded/Unguarded are the two signature mechanisms.
- All diagram samples are explicitly illustrative; none reports client telemetry.
- Theme and reduced-motion preferences are stored only in the browser. Sound is off on arrival.
- Functional controls remain keyboard accessible; OS reduced motion always wins.

See `design/design-spec.md` for the direction and `design-system/README.md`
for the component contract. Change brand values in the shared source, regenerate
with `node design-system/build.mjs`, then sync the same package into the other repo.
Do not patch generated tokens or introduce page-specific brand colors.

## Authoring

The static pages are the production artifact. The optional
`tools/render-signal-pages.mjs` maintenance script keeps the 20 canonical pages
and sitemap aligned. It generates complete HTML, never a client-side page shell.

```sh
node tools/render-signal-pages.mjs
node tools/sync-partials.js --check
```

Copy and page composition live in that script. The existing legal body and contact
form are deliberately preserved from their checked-in HTML: edit those in
`mentions-legales.html`, `en/legal-notice.html`, `contact.html` and
`en/contact.html` before rerendering. Contact IDs, Web3Forms fields and messages
remain compatible with `assets/js/contact-form.js`.

`tools/sync-partials.js` can separately propagate a nav/footer change from the
French and English homepages. If authoring templates are used afterward, make
the same change in the template.

Key files:

- `assets/css/signal-compat.css`: small compatibility layer for the retained
  brand/button, contact and legal HTML; replaces the retired 41 KB component
  sheet on all Signal pages. Above-the-fold fonts are preloaded locally.
- `assets/css/signal-site.css`: corporate layout, consumes shared tokens.
- `assets/js/signal-site.js`: accessible mobile nav, one-time reveals, reading
  progress and restrained marketing CTA attraction.
- `assets/js/signal-preferences-init.js`: saved preferences before first paint.
- `design-system/signal.js`: shared interactive mechanisms and preferences.
- `404.html`, `en/404.html`: error pages, absolute assets for deep missing paths.
- `vision.html`, `en/vision.html`: restored canonical perspective page.
- `expertise.html`, `IA.html`, `about.html`, `join.html`: preserved redirects.

The original network canvas and decorative motion scripts remain in repository
history/source but are no longer mounted. The functional three-practice mechanism
replaces the old home canvas; shared components explain actual state changes and
rest when idle.

## Contact and evidence

The form uses the existing Web3Forms public access key and email fallback.
A failed request preserves the message. Repeated submissions are disabled during
sending. **Do not submit real messages during tests.**

Already-published client logos are retained. No clients, metrics, team portraits
or case studies were fabricated. Team and engagement evidence can be added when
approved material exists; the templates contain honest unpublished slots.
The existing 48-business-hour response statement is retained.

## Verification

```sh
node --test tests/signal-contract.test.cjs
node tools/sync-partials.js --check
node --check assets/js/signal-site.js
node --check assets/js/contact-form.js
```

Browser QA uses an optional installed Playwright package and local Chrome:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/node_modules/@playwright/test \
  SITE_URL=http://127.0.0.1:4173 \
  node tools/verify-browser.cjs
```

It checks 22 pages at 390 / 768 / 1440 in both themes, captures French layouts,
verifies mobile keyboard navigation, mocks contact success/failure, and rejects
unexpected external runtime requests. Reports go to `/tmp/xsom-site-qa` by default
(`SITE_QA_OUTPUT` overrides). The browser can be selected with `BROWSER_CHANNEL`.

The site makes no analytics, tracking or remote-font request. Web3Forms is called
only on explicit form submission; ordinary links such as LinkedIn do not load
remote scripts.
