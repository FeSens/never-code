Deploy the application to production.

## Steps

1. [DETERMINISTIC] Validate:
   - Read `.env.example`, compare to `.env` — all required vars set?
   - `pnpm build` — must succeed
   - `pnpm check` — all gates pass

2. [AGENT] Determine target:
   - Ask: Vercel, Fly.io, Docker, or other?
   - If not configured: help set up deployment config

3. [DETERMINISTIC] Deploy:
   - Vercel: `npx vercel --prod`
   - Fly.io: `fly deploy`
   - Docker: `docker build -t app . && docker push`

4. [DETERMINISTIC] Verify:
   - Hit health endpoint on deployed URL
   - Confirm `{ status: "ok" }`

5. Report: URL, status, warnings.

Note: This is a template command. Customize the target for your project.
