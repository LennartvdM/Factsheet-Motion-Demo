https://factsheetdemo.netlify.app/

# Factsheet Motion Demo

A Vite + React dashboard that showcases motion design patterns for live KPI monitoring. The app streams mock data over Server-Sent Events (SSE), highlights refreshed metrics, and layers View Transition API effects with Framer Motion timelines that respect accessibility preferences.

## Project overview

- **Live data simulation:** The `/server` mock emits SSE updates every few seconds so you can demonstrate continuous metric changes.
- **Responsive dashboard shell:** Tabbed navigation (`Overview`, `Breakdown`, `Notes`) and a segmented timeframe control animate with view transitions when supported.
- **Detail drill-downs:** Selecting a KPI opens a slide-in detail panel with contextual charts and notes.
- **Accessibility-first motion:** Animations automatically disable when the user prefers reduced motion or when the browser lacks View Transition support.

## Screenshots

> Capture fresh screenshots and drop them in `public/screenshots/` (see the README in that folder for guidance). Binary placeholder images are not versioned in this environment.

- Overview screen placeholder: `public/screenshots/overview.png`
- KPI detail placeholder: `public/screenshots/detail.png`

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Choose how you want to run the app:
   - **Development (recommended):**
     ```bash
     npm run dev
     ```
     The Vite dev server proxies `/sse` requests to the built-in mock SSE server, so you only need this one process.
   - **Production preview with external SSE server:**
     ```bash
     npm run server
     npm run build
     npm run preview
     ```
     Run `npm run server` in a separate terminal to expose `/facts` and `/sse` while `npm run preview` serves the built client.

## Demo script checklist

Use this checklist to guide a live walkthrough of the motion patterns:

- [ ] **Landing:** Open the dashboard and point out the live update ticker beneath the header.
- [ ] **Timeframe transitions:** Toggle between `Today`, `7d`, and `30d` on the segmented control and highlight how tiles morph using view transitions.
- [ ] **Tab choreography:** Switch between `Overview`, `Breakdown`, and `Notes` to show the crossfade/slide patterns powered by Framer Motion.
- [ ] **Live updates:** Wait for an SSE push (every 3–5 seconds) and note the temporary highlight halo around changed KPI tiles and the screen reader announcement.
- [ ] **Detail drill-down:** Click a KPI to open the detail drawer, then close it to show the shared element animation.
- [ ] **Reduced motion toggle:** Demonstrate turning on a reduced motion preference (see Accessibility below) and repeat a few interactions to show instant state changes.

## View Transition API support

- Native support is currently available in Chromium-based browsers (Chrome 111+, Edge 111+, Arc, etc.).
- Safari 18+ exposes the API behind the `ViewTransitionOnNavigationEnabled` feature flag; Firefox is experimenting behind `layout.css.view-transitions.enabled`.
- The helper in [`src/lib/viewTransition.ts`](src/lib/viewTransition.ts) falls back to synchronous state updates when `document.startViewTransition` is unavailable or when the user prefers reduced motion, so the experience remains functional everywhere.

## Accessibility notes

- The interface provides a visible skip link, semantic landmarks, focus outlines, and ARIA labels for custom controls.
- Screen reader users receive live update announcements via an ARIA live region.
- The design adapts to `(prefers-reduced-motion: reduce)` and `(prefers-contrast: more)` media queries.
- **Testing reduced motion:**
  1. Enable “Reduce Motion” in your operating system preferences (e.g., macOS: System Settings → Accessibility → Display; Windows: Settings → Accessibility → Visual effects).
  2. Alternatively, simulate the preference in Chrome DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion`.
  3. Reload the app and verify that transitions snap without animation and SSE highlights no longer animate.

## License

MIT License © 2024 Factsheet Motion Demo contributors. Feel free to adapt for internal demos and credit this repository when you do.

## What changed & how to verify
