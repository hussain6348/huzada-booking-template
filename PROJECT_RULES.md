# SYSTEM ARCHITECTURE & AI CONSTRAINTS
This repository is a Website-as-a-Service (WaaS) template. It is strictly configured as a Cloudflare Pages Serverless application. 

**CRITICAL RULES FOR ALL AI AGENTS:**
1. **Runtime:** Pure Cloudflare Pages Static SPA (Vite + React + Tailwind).
2. **Backend Engine:** Cloudflare Pages Serverless Functions located exclusively in the `/functions/api/` directory.
3. **DO NOT MIGRATE:** Under no circumstances should this project be converted to Node.js, Express, or Next.js. Do not generate a `server.ts` file. Do not remove the `@cloudflare/workers-types` dependencies.
4. **Dev Server:** The development server must strictly run `vite`.
5. **Database (Turso):** The project uses `@libsql/client/web` to connect to Turso. If `TURSO_DATABASE_URL` is missing during local preview, APIs must gracefully fallback to mock JSON data rather than throwing an initialization error.
