# Paul Varghese Shibu — 3D Portfolio

Next.js 15 · React Three Fiber · Framer Motion · Tailwind v4

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Editing content
All text, projects, links and media live in **`src/data/portfolio.ts`**.

### Adding photos
1. Drop the image into `public/projects/` (e.g. `public/projects/wind-tunnel.jpg`).
2. In `portfolio.ts`, add `image: "/projects/wind-tunnel.jpg"` to that project.

Profile photo: save as `public/profile.jpg` and set `photo: "/profile.jpg"` in `profile`.

### Adding a Google Drive video / report
Add `{ label: "Flight Video", kind: "video", drive: "<FILE_ID>" }` to the project's `media` array.
The file must be shared as **Anyone with the link → Viewer**. The card thumbnail is pulled
from Drive automatically when you set `thumbDrive: "<FILE_ID>"`.

## 3D scenes
- `src/components/three/parts.tsx`: procedural quadcopter, gears and rocket engine (no model files).
- `HeroScene.tsx`: the drone banks toward the cursor and climbs as you scroll.
- `EngineScene.tsx`: a bell nozzle with a hot-fire plume (drag to rotate).

## Deploy
Push the `website` folder to GitHub and import it into Vercel (zero config).
