Deploy the application to production.

## Steps

1. [DETERMINISTIC] Validate environment:
   - Read `.env.example` and compare to `.env` — all required vars must be set
   - Run `pnpm build` — must succeed
   - Run `pnpm check` — all gates must pass

2. [AGENT] Determine deployment target:
   - Ask the user: Vercel, Fly.io, Docker, or other?
   - If not configured yet, help set up the deployment config

3. [DETERMINISTIC] Deploy:
   - Vercel: `npx vercel --prod`
   - Fly.io: `fly deploy`
   - Docker: `docker build -t app . && docker push`

4. [DETERMINISTIC] Post-deploy verification:
   - Hit the health endpoint on the deployed URL
   - Verify it returns `{ status: "ok" }`

5. Report: deployment URL, status, any warnings.

## Note
This is a template command. Customize the deploy target for your project.
