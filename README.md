# Virtual Space Lotto prototype

Static functional prototype containing landing page, ₱99,000 package, franchise application demo, login UI, seller page, browser camera preview, live/offline controls, social sharing, and the single LottoMatik number-picker URL.

## Run
Use a local HTTP server (camera access requires localhost or HTTPS):

python -m http.server 8080

Then open http://localhost:8080

## Production work still required
- Real auth/database/storage: connect Supabase or Firebase.
- Application admin review and representative workflow.
- Real one-to-many broadcasting: integrate Jitsi or self-hosted LiveKit. Browser getUserMedia in this prototype is a local camera preview only.
- Confirm LottoMatik permits iframe embedding and your intended commercial/lottery use. The fallback button opens the same URL directly.
- Do not implement real-money wagering, wallet movement, or official ticket issuance without the required operator authorization/licensing and approved APIs.
## Save updates to GitHub
After every working change, save a recovery point:

```bash
git status
git add .
git commit -m "Describe the update"
git push
```

GitHub repository:
https://github.com/gibprecones/virtualspacelotto

To recover if a layout breaks:

```bash
git log --oneline
git restore .
```

For a specific older version, copy the commit ID from `git log --oneline`, then run:

```bash
git checkout <commit-id>
```

## Deploy to Cloudflare Pages
This is a static HTML/CSS/JS site, so Cloudflare Pages can deploy it directly from GitHub.

Cloudflare Pages settings:

- Repository: `gibprecones/virtualspacelotto`
- Production branch: `main`
- Framework preset: `None` or `Static HTML`
- Build command: `exit 0`
- Build output directory: `/`
- Root directory: leave blank

Cloudflare dashboard steps:

1. Go to Cloudflare Dashboard.
2. Open `Workers & Pages`.
3. Select `Create application`.
4. Choose `Pages`.
5. Select `Import an existing Git repository`.
6. Pick `gibprecones/virtualspacelotto`.
7. Use the settings above.
8. Deploy.

After setup, every `git push` to `main` will trigger a new Cloudflare Pages deployment.

## Cloudflare D1 backend setup

This project is prepared for Cloudflare Pages Functions with a D1 database binding.

Current D1 binding:
- Binding name: `DB`
- Database name: `kaya-store-340531a0930748758021`
- Database id: `34417909-f2eb-49d6-aac5-2b738d29a7dc`

Core files:
- `wrangler.jsonc` contains the Pages + D1 binding config.
- `migrations/0001_virtualspacelotto_core.sql` creates shared backend tables.
- `functions/api/health.js` checks if the API can reach D1.
- `functions/api/accounts/check.js` checks if an email already exists.
- `functions/api/accounts/register.js` creates buyer/seller records with unique email protection.

Useful commands:
```bash
npx wrangler d1 migrations apply kaya-store-340531a0930748758021 --remote
npx wrangler d1 execute kaya-store-340531a0930748758021 --remote --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
```

Deploy flow:
1. Commit changes to `main`.
2. Push to GitHub: `git push origin main`.
3. Cloudflare Pages auto-deploys the latest GitHub version.
4. After deployment, test `/api/health` on the Pages URL.
