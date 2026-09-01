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
