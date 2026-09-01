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
