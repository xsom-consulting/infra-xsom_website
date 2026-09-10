# xSOM Signal — design specification

## Direction
An engineering practice that takes responsibility through production. Precise, grounded, calm. Oversized left-aligned Saira headings meet instrument-like JetBrains Mono labels; body text remains the existing locally hosted Inter. The warm charcoal canvas, copper routing line and interlocking arrow mark connect corporate storytelling with dense operational screens.

## Decisions
- Keep static HTML/GitHub Pages and Next.js 14. Share a dependency-free, versioned design-system directory, not a new framework.
- Preserve #e2603a as the brand accent. Warm charcoal replaces navy; ivory light mode has independently defined accessible colors.
- Retain original logo geometry. Recolor its three existing arrows copper, bronze and ivory; do not introduce a shield as a new company logo.
- Two signatures: AuthorizationFlow and the Guarded/Unguarded control. Motion describes a transition and then stops.
- Self-host existing Saira (600–800), Inter (400) and JetBrains Mono (500) WOFF2. No remote fonts, tracking, invented customers, portraits or production measurements.

## Source of truth
`design-system/design/tokens.json` generates `design-system/tokens.css`. This placement adapts the frontend-quality token convention to the explicitly requested portable package. Both repositories consume the exact same package; its build/check command detects drift. Product layout styles may add semantic layout variables to the package, never redefine brand colors.

## Components
Shared: Button, Toggle, VerdictBadge, Card/Bento, Table, Tabs, Toast, Modal, Input, Nav/Footer primitives; AuthorizationFlow, AuditChain, RiskMeter, SovereigntyMap, PolesLockin, MissionTimeline, VideoHover/SignalVideo, ThemeToggle/SignalPreferences, ApprovalCountdown. Functional diagrams are authored SVG/HTML as explicitly requested, not decorative illustrations. Existing logo and existing interface glyphs are the declared asset sources.

Corporate: editorial hero, asymmetric expertise bento, evidence strip, contact form. Console: topbar + sidebar + canvas, Inspector narrative strip, approval queue, filtered audit, policy YAML + readable decisions, tenant administration, risk and settings.

## Motion and accessibility
OS reduced-motion always wins; an explicit visible control may reduce further. No perpetual resting animation. Pointer motion has keyboard equivalents. Focus and 44px targets, text labels for every verdict, no color-only meaning. Sound starts off and is synthesized locally only after consent. All illustrative data is visibly labeled demonstration. No UI claims cryptographic verification without server evidence.

## Delivery checks
Capture 390/768/1440 widths in dark/light, critique then correct and recapture. Check keyboard, loading, empty, error and dense states; essential live-action contracts; FR/EN; local assets; SEO and contact; existing test suite. Preserve API auth, tenant/role and server authority. Merge only after proportionate checks and review.
