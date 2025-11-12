# Factsheet Motion Demo

Factsheet Motion Demo is a Vite + React + TypeScript experience showcasing motion-rich climate fund factsheets. It blends Tailwind CSS, Framer Motion, shared element transitions via the View Transition API, Recharts for data storytelling, and a mock Server-Sent Events (SSE) server for live updates.

## Prerequisites

- Node.js 18+
- npm 9+

> **Note:** If your network restricts access to the npm registry, point npm to a mirror before installing dependencies, for example `npm config set registry https://registry.npmmirror.com`.

## Setup

```bash
npm install
```

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Starts Vite dev server on <http://localhost:5173> and the mock SSE server on port 7070 using `concurrently`. |
| `npm run build` | Runs TypeScript project references build then bundles with Vite. |
| `npm run preview` | Previews the production build. Requires `npm run build` first. |
| `npm run lint` | Runs ESLint across `.ts` and `.tsx` files. |
| `npm run format` | Formats the repository with Prettier. |
| `npm run typecheck` | Runs TypeScript in build mode. |
| `npm run start:sse` | Launches only the mock SSE server (helpful if you want to run Vite separately). |

## Demo script

1. `npm run dev` to start the development environment. Two processes launch: the SSE server (port 7070) and Vite (port 5173).
2. Visit <http://localhost:5173>. The overview page shows the featured fund, live chart, and an activity feed powered by SSE.
3. Click any fund card to see a shared element transition into the detailed factsheet view.
4. Toggle reduced motion in your OS accessibility settings. Hover transitions and animations will adjust automatically.
5. Navigate to the Insights tab to see computed highlights that react to live metric updates.
6. Open the “About” dialog from the header to experience focus-managed overlays with escape-to-close behavior.

## Tech highlights

- **View Transition API** powers shared navigation transitions across dashboard and details.
- **Framer Motion** enriches micro-interactions while respecting `prefers-reduced-motion`.
- **Tailwind CSS** accelerates styling with a dark theme tuned for data visualization.
- **Recharts** renders responsive, accessible performance charts.
- **Mock SSE server** streams metric changes to demonstrate live data.
- **Strict TypeScript, ESLint, and Prettier** ensure a maintainable codebase.

## Troubleshooting

- If dependencies fail to install due to registry restrictions, switch npm to a reachable mirror as noted above.
- The SSE server listens on port 7070. Adjust the `SSE_PORT` env var if the port is taken.
- For Windows users, use Git Bash or WSL for best compatibility with the provided npm scripts.
