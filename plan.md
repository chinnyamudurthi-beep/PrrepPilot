# PrepPilot — Implementation Plan

## Product approach
PrepPilot is a responsive, client-side placement-preparation dashboard. It ships as a static single-page application served by a tiny Node HTTP server, so the initial demo has no paid APIs, backend, account system, or secret keys. The browser owns the demo data through `localStorage`, while the interface makes every simulated capability explicit.

The page shell keeps navigation persistent while the active view changes in place. Feature modules share a small state model: profile preferences, skill levels, interview attempts, coding submissions, resume analysis, weekly goals, and activity history. This keeps dashboard summaries, progress history, and feedback consistent after refresh.

## Design direction
- **Design movement:** Editorial SaaS dashboard with a bright “sunlit workspace” mood: white cards, warm cream accents, sunflower-yellow instrumentation, and generous editorial spacing.
- **Core principles:** Focus over noise; progress made tangible; guided action; confident but kind feedback.
- **Color philosophy:** White and cream surfaces keep the workspace open and approachable; sunflower yellow is PrepPilot’s ownable action color for momentum; warm brown text and green completion accents maintain readable hierarchy without using black.
- **Layout paradigm:** A persistent rail anchors the product like a cockpit, while the main canvas uses asymmetric hero areas, split cards, and flowing activity panels instead of a generic centered grid.
- **Signature elements:** A golden “PP” mark with a target/radar cue, score rings with orbital tick marks, and tiny uppercase section labels paired with bright metric numerals.
- **Interaction philosophy:** Every action gives immediate, human-readable feedback. Empty states explain the next move, saves are acknowledged with a toast, and demo intelligence is labeled rather than implied.
- **Animation:** Use short 180–260ms ease-out transitions for cards, nav state, progress bars, and toasts. Keep motion functional: score rings reveal on load, feedback slides into view, and hover states lift surfaces by 2px. Respect reduced-motion preferences.
- **Typography system:** Inter/system UI for body copy and controls, with a slightly heavier display weight for metrics and page titles. Uppercase 11px labels provide the editorial rhythm; body copy stays at 14–16px for scanability.
- **Brand essence:** A focused AI-style placement coach for students who want every practice session to move their readiness forward. Personality: practical, encouraging, sharp.
- **Brand voice:** Headlines are direct and motivating; CTAs are specific. Examples: “Turn practice into proof.” and “Run one more rep.”
- **Wordmark & logo:** A compact rounded-square PP monogram with two concentric target arcs; the text lockup uses bold geometric letterforms, not a default logo font.
- **Signature brand color:** PrepPilot Sunflower `#EFBD22`.

## Project structure
- `index.html` — accessible application shell, navigation, page templates, and modal/toast mount points.
- `styles.css` — responsive white-and-yellow visual system, card primitives, charts, forms, and mobile layout.
- `app.js` — route state, localStorage persistence, demo datasets, render functions, event delegation, feedback rules, resume scoring, and validation.
- `server.mjs` — dependency-free development/production static server honoring `PORT`.
- `manus-routes.json` — complete page route manifest for the SPA.
- `app.config.ts` — durable platform logo metadata.
- `package.json` — reproducible scripts and pinned package-manager declaration.

## Functional decisions
1. Interview feedback is rule-based demo feedback. It checks answer length, presence of a concrete example, and action/impact language, then presents strengths and suggestions. The UI labels it “Rule-based demo feedback — no AI API connected.”
2. Coding answer checking is a lightweight educational check: users submit a textual solution, and the checker looks for language-appropriate concepts plus the sample output or expected construct. It is not a compiler and says so.
3. Resume analysis is a simulated ATS-style score based on section coverage, action verbs, skill keywords, and concise length. Upload controls accept text files directly; other file types are acknowledged and ask the user to paste text for the demo analyzer.
4. Browser storage is versioned under `preppilot-state-v1`, with a resilient fallback to defaults if stored data is malformed.
5. Navigation is in-place and route-aware; direct page paths still serve the SPA through the server fallback.

## Serving and delivery
Development uses `node server.mjs` on `0.0.0.0:3000`. The static build copies the app shell to `dist/` so the managed static deployment contract can serve it. The requested GitHub transfer should use the managed repository connection flow after a checkpoint exists; it must remain owner-confirmed and should target a new public repository named `PrepPilot`.
