# Korim AI Assistant — setup

This portfolio widget uses a static JavaScript UI and a Vercel serverless function at `/api/chat`. Provider API keys are read only by the server.

## Free demo mode

The chatbot answers common preset questions about services, portfolio projects, SEO, skills, pricing requests, and contact information without an API key. Unrecognized questions receive a fallback answer explaining the demo limitation. No provider API charges occur in this mode.

## 1. Configure Gemini in Vercel

1. If an API key was pasted into a chat, issue or revoke it in Google AI Studio and create a fresh key.
2. Open the Vercel dashboard and select the `mohammad-korim` project.
3. Open **Settings → Environment Variables**.
4. Add `GEMINI_API_KEY` with the fresh Gemini API key.
5. Optionally add `GEMINI_MODEL` to select an available Gemini model. The default is `gemini-2.5-flash`.
6. Select the **Production** environment (and Preview if you want to test preview deployments), save, then redeploy.

When `GEMINI_API_KEY` is configured, the backend uses Gemini. If it is absent, the free FAQ demo runs; an existing `OPENAI_API_KEY` can still be used as a fallback when Gemini is not configured.

Never put an API key in `index.html`, `chat-widget.js`, any `NEXT_PUBLIC_*` variable, or a committed file. Do not send the key in chat or share it in screenshots.

## 2. Allowed website origin

The endpoint currently accepts browser requests from:
- `https://mohammad-korim.vercel.app`
- `https://mohammad-korim-mohammad-korim.vercel.app`

If the canonical domain changes, update `ALLOWED_ORIGINS` in `api/chat.js` before deploying.

## 3. Protections and limitations

- Provider keys remain server-side.
- Only POST requests from the allowlisted browser origins are accepted.
- Input size and message length are capped; output length is limited.
- The endpoint applies a best-effort in-memory limit of 8 requests per 10 minutes per IP per warm function instance.
- In-memory limits are not a durable distributed rate limiter. Before advertising the widget to large audiences, use a shared rate-limit store (for example, Redis/Upstash) and consider Vercel BotID/WAF protection.
- Chat history stays in the visitor's current browser memory only; this implementation does not save chats to a database.
