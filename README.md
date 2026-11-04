# Paswig English

A deploy-ready web app for English learning. Frontend is `index.html`; AI requests are handled by private Vercel serverless functions in `api/`. The Anthropic API key stays on the server and is never embedded in browser code.

## Deploy publicly with Vercel

1. Create a private GitHub repository and upload all files in this folder, or import this folder using Vercel's supported deployment flow.
2. In Vercel, create a new project from the repository.
3. In **Project Settings → Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
   - `ANTHROPIC_MODEL` = `claude-haiku-4-5-20251001` (optional; default is this value)
4. Redeploy the project after adding the environment variables.
5. Open the Vercel-provided URL to test the website. Share that URL for public access.

## Important notes

- AI usage requires an Anthropic API account/key and may incur usage charges. Set billing limits/alerts with the provider before sharing widely.
- Do not put the API key in `index.html`, GitHub, or any public file. Only store it as a server environment variable.
- User progress is currently saved in each browser's local storage. It is not synced between devices and there are no shared accounts yet.
- Add stronger rate limiting, abuse protection, and a privacy policy before promoting the site widely. The API key is server-side, but public visitors can still trigger API calls.
- Browser speech recognition depends on browser/device support and microphone permission. Text-to-speech support also varies.
