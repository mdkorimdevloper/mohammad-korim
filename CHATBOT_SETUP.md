# Korim AI Assistant — setup

This portfolio widget uses a static JavaScript UI and a Vercel serverless function at `/api/chat`. The AI provider key is read only by the server.

## Free demo mode

The chatbot can answer common preset questions about services, portfolio projects, SEO, skills, pricing requests, and contact information without an AI API key. Unrecognized questions receive a fallback answer explaining the demo limitation. No provider API charges occur in this mode.

## 1. Add the AI API key in Vercel

1. Open the Vercel dashboard and select the `mohammad-korim` project.
2. Open **Settings → Environment Variables**.
3. Add `OPENAI_API_KEY` with your secret key from the OpenAI API dashboard.
4. Optionally add `OPENAI_MODEL` to choose a model enabled for your API account. The default is `gpt-4.1-mini`.
5. Select the **Production** environment (and Preview if you want to test preview deployments), save, then redeploy.

Never put the key in `index.html`, `chat-widget.js`, any `NEXT_PUBLIC_*` variable, or a committed file. Do not send the key in chat or share it in screenshots.

## 2. Allowed website origin

The endpoint currently accepts browser requests from:
- `https://mohammad-korim.vercel.app`
- `https://mohammad-korim-mohammad-korim.vercel.app`

If the canonical domain changes, update `ALLOWED_ORIGINS` in `api/chat.js` before deploying.

## 3. Protections and limitations

- The provider key remains server-side.
- Only POST requests from the allowlisted browser origins are accepted.
- Input size and message length are capped; output length is limited.
- The endpoint applies a best-effort in-memory limit of 8 requests per 10 minutes per IP per warm function instance.
- In-memory limits are not a durable distributed rate limiter. Before advertising the widget to large audiences, use a shared rate-limit store (for example, Redis/Upstash) and consider Vercel BotID/WAF protection.
- Chat history stays in the visitor's current browser memory only; this implementation does not save chats to a database.
