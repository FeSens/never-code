Take a screenshot of a page and visually inspect it.

Usage: /screenshot [path]
- If $ARGUMENTS is provided, screenshot that path (e.g., `/screenshot /dashboard`)
- If no arguments, screenshot the home page (`/`)

## Steps

1. Ensure the dev server is running. If not: `pnpm --filter @never-code/web dev &` and wait for it.

2. Take the screenshot:
```bash
cd apps/web && npx playwright screenshot --wait-for-timeout=2000 "http://localhost:3000$ARGUMENTS" /tmp/page-screenshot.png
```

3. Read the screenshot with the Read tool to visually analyze it.

4. Report findings:
   - **Layout**: Is spacing, alignment, and structure correct?
   - **Content**: Is all text readable? Any missing or cut-off content?
   - **Styling**: Do colors, fonts, and visual elements look right?
   - **Responsiveness**: Any overflow or broken layout?
   - **Issues**: List anything that looks wrong or could be improved.

## For semantic analysis (cheaper, no vision tokens)
If you only need to verify content structure (not visual appearance):
```bash
cd apps/web && npx playwright screenshot --wait-for-timeout=2000 "http://localhost:3000$ARGUMENTS" /tmp/page-screenshot.png 2>&1
```
Then read the file to inspect visually.
