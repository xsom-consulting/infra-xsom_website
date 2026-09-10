# Corporate visual verification

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
