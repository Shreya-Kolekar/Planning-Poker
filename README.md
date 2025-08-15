# Planning Poker (Supabase Realtime, React, Vite, Tailwind) — $0 stack

A tiny Planning Poker clone with no server. Rooms use Supabase **Realtime channels + Presence**.
Host on **Cloudflare Pages** (free).

## Demo (local)
```bash
npm install
# Create .env with your Supabase keys:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
npm run dev
```

Open http://localhost:5173, click **Create Room**, share the URL with teammates.

## Deploy (Cloudflare Pages)
1. Push this repo to GitHub.
2. Cloudflare Pages → **Connect to Git** → build command: `npm run build`, output dir: `dist`.
3. Add environment variables on Pages:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. You get a free `*.pages.dev` domain.

## How it works
- Each room subscribes to `room:<id>` channel.
- Presence tracks each member `{ id, name, role, vote }`.
- The earliest `id` in presence becomes the **host** (client-side election).
- Actions use broadcast events: `REVEAL`, `RESET`, `SETTINGS`.
- No database needed for ephemeral sessions. (You can add persistence later.)

## Files
- `src/room/useRoom.js` — core realtime logic
- `src/pages/Room.jsx` — UI
- `src/pages/Landing.jsx` — create/join room
- `src/lib/supabase.js` — client
- `src/utils/id.js` — room code generator

## Customize
- Add avatars, timers, stories, or persistent history via Supabase tables.
- Gate actions so **only host** can Reveal/Reset (already enforced in UI).
- Swap deck to T‑Shirt; deck selection syncs via `SETTINGS` broadcast.

## License
MIT
