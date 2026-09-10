# Corporate visual verification

## Heritage blue correction — current

The approved original copy (`a9dfd3c`) is restored on all 16 corporate pages.
The only content exceptions are the removed experimental-product promotion and
the bounded technical privacy updates. The copy/heading comparison and static
contracts pass 23 tests; no marketing copy was newly authored.

First visual pass: the inherited hero illustration width limit left the new 3D
asset too small. Removed the limit, extended the navy image area to the right
edge, kept the complete 3:2 illustration, and connected visible, accessible
points to the network/cyber/data regions. A 390px practice-selector overflow was
then found and corrected with zero-minimum grid tracks and appropriately sized
node labels. Existing interior heading line breaks are retained.

Second full pass: 108/108 layouts pass (18 pages × 3 widths × 2 themes), without
document overflow or failed images. Inspected the home, expertise, sovereignty,
firm, careers, contact, privacy, legal and error layouts. Original text remains
readable; interior diagrams scroll inside their own region on narrow screens.
The independent behavior check also passed menu keyboard/focus, hero focus
selection, practice selection, SVG-layer controls, both language forms, theme
persistence and OS reduced-motion priority. Contact requests were mocked only.

Hero reference: `/tmp/xsom-heritage-hero-connected.png`.
Final captures and report: `/tmp/xsom-heritage-final/report.json`.
The maintenance generator was rerun and all output hashes remained identical.

## Earlier Signal verification — superseded

## First pass

Inspected actual Chrome rendering, not markup alone. The initial 1440px homepage revealed three issues: the hero's line-break fallback joined words; the three-practice diagram clipped inside its narrower parent; monochrome inversion turned opaque client logos into squares. Corrected headline spacing/scale, added a shared component container layout (by design-system owner), and displayed original logos on a restrained light reference band.

## Second pass

Inspected the full homepage at 390/768/1440 in charcoal, plus ivory at 1440; inspected AI Guard at 390 and contact at 390 light. Headline and diagram now remain inside their containers, reference assets are legible, no false telemetry appears, and form labels/fields retain contrast. The tablet hero still compressed long practice names; adjusted it to stack below 1000px. Corrected collapsed line-break whitespace in all generated headings and removed an internal content-policy phrase from the public firm page.

The reproducible browser check covers 22 pages in six width/theme combinations (132 layouts), all without document overflow or missing loaded images. Form success and transport-error cases use mocked Web3Forms responses, preserving user input after errors. No real message is sent. Final browser reports and captures: `/tmp/xsom-site-qa-final`.

The final pass also inspected expertise with all lazy images decoded, sovereignty, AI Guard, firm, perspective, careers, legal and privacy pages, and the 404 and contact error state. Six sector images now use optimized WebP with their original JPG fallback. Theme persistence, OS preference priority, menu keyboard focus and navigation without JavaScript were exercised. The contact form keeps native browser validation and a POST action without JavaScript, preventing personal form data from entering a GET URL.

The audit chain is an intentionally horizontally scrollable sequence; viewport overflow checks distinguish its scroll area from document overflow. No decorative animation runs continuously at rest. System and explicit reduced-motion settings keep static mechanisms readable.

## Critical-path optimization

Replaced the retired 41,784-byte legacy component stylesheet with a 3,729-byte
compatibility layer limited to the retained brand/buttons, form and legal HTML.
Shared tokens and mechanisms are unchanged. The three local fonts used above the
fold now preload; the brand link's accessible name derives from its visible text.
The complete 132-layout suite passed again, including mocked form success/error,
keyboard controls and no-script navigation. Inspected updated home, contact and
legal captures. Final optimized evidence: `/tmp/xsom-site-qa-optimized/report.json`.
# Measured performance and shared checks

Final local Lighthouse mobile simulation (12.8.2, static HTTP server): performance
97, accessibility 100, LCP 2.42 s, total blocking time 0 ms, CLS 0. This is a lab
measurement, not a field-performance claim. Label-in-name checks pass after fixing
brand and preference labels. The deployed site is checked separately after merge.

Shared component checks pass: generated-token freshness, both-theme AAA body/AA
semantic contrast, unchanged brand accent, no second component palette, and safe
normalization of held/unknown API verdicts. The generic frontend-quality linter
does not recognize the portable package's token path and reports historical CSS
and generated token literals; it is not reported as a clean project-wide lint.
The project-specific checks are runnable with the documented commands. The
existing Pages deployment pipeline is preserved; the available GitHub token does
not grant workflow-file changes. Console CI runs shared checks through its
existing npm test command.
