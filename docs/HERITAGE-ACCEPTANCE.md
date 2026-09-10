# Heritage redesign acceptance

The editorial reference is commit `a9dfd3ca33875f1b0e68a13dd9c15e4ff00ec7c3`.
The user requested a visual redesign, not rewritten corporate positioning.

Run `node --test tests/*.test.cjs`. The copy guard compares the complete main
text and heading hierarchy of all 16 original French/English pages with that
immutable Git reference. Whitespace, HTML entities and decorative SVG/canvas are
normalized; wording, service lists, content order and heading levels are not.
The reference commit must be available locally. Never update it to the current
branch merely to make a failing comparison pass.

The only named content exceptions are:

- Removal of the `guard-title` product-promotion section on both sovereignty pages.
- Visual exploration controls inside `.heritage-explorer`, separate from the original copy.
- Technical cookie-policy rows `.heritage-privacy-update`: locally hosted fonts
  and local display preferences. These exceptions cannot apply to other pages.

The former product URLs redirect to their language's homepage, with `noindex`.
The old vision URLs redirect to the existing sovereignty pages. None are
promoted in the sitemap. Public HTML must contain no AI Guard promotion or
console link. Canonical URLs, reciprocal language links and self-hosted fonts
remain checked independently.

The browser review still covers 390, 768 and 1440 pixels, both themes, menu
keyboard interaction, motion preferences, no-JavaScript content, and contact
form validation. Contact success/failure requests must always be mocked;
never submit synthetic email through the production service.
