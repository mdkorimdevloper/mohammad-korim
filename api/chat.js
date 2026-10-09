// Public portfolio chat endpoint. Keep provider credentials in Vercel Environment Variables.
const ALLOWED_ORIGINS = new Set([
  "https://mohammad-korim.vercel.app",
  "https://mohammad-korim-mohammad-korim.vercel.app"
]);
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 8;
const MAX_MESSAGE_CHARS = 1200;
const MAX_HISTORY_MESSAGES = 8;

const buckets = globalThis.__korimChatRateLimit || (globalThis.__korimChatRateLimit = new Map());

function rateLimit(ip) {
  const now = Date.now();
  const current = buckets.get(ip);
  if (!current || now >= current.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, resetAt: now + WINDOW_MS };
  }
  current.count += 1;
  return { allowed: current.count <= MAX_REQUESTS, resetAt: current.resetAt };
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  const origin = req.headers.origin;
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return sendJson(res, 403, { error: "This website is not allowed to use the chat API." });
  }

  const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim().slice(0, 80);
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    res.setHeader("Retry-After", String(Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000))));
    return sendJson(res, 429, { error: "Too many messages. Please wait a few minutes and try again." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(res, 503, { error: "The chat assistant is not configured yet. Please contact Korim by email." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return sendJson(res, 400, { error: "Invalid request." }); }
  }
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return sendJson(res, 400, { error: "Please send a message." });
  }

  const messages = body.messages.slice(-MAX_HISTORY_MESSAGES).map((message) => {
    const role = message && (message.role === "assistant" ? "assistant" : message.role === "user" ? "user" : null);
    const content = typeof message?.content === "string" ? message.content.trim().slice(0, MAX_MESSAGE_CHARS) : "";
    return role && content ? { role, content } : null;
  }).filter(Boolean);

  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return sendJson(res, 400, { error: "Please enter a valid message." });
  }

  try {
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        store: false,
        max_output_tokens: 350,
        instructions: [
          "You are Korim AI Assistant, the public portfolio chatbot for Mohammad Korim (MD Korim), a developer based in Bangladesh.",
          "Help website visitors understand Korim's services, projects, and how to contact him.",
          "Services include full-stack website development, e-commerce websites, custom software and API integration, and SEO services (on-page, off-page, technical, and local SEO). Digital marketing may also be discussed.",
          "Portfolio website: https://mohammad-korim.vercel.app/",
          "Other portfolio project: https://clippingpath.live/",
          "Contact email: mdkorimdeveloper@gmail.com",
          "When relevant, invite visitors to email Korim with project requirements for a quote. Do not invent prices, availability, credentials, client results, or technical details not provided here.",
          "Answer in the language the visitor uses. Keep replies friendly, clear, and concise. If you do not know an answer, say so honestly and point them to the contact email.",
          "Do not claim you can send emails, book meetings, access private systems, or perform actions outside this chat."
        ].join("\n"),
        input: messages
      }),
      signal: AbortSignal.timeout(20000)
    });

    if (!upstream.ok) {
      // Do not expose provider response details or credentials to public visitors.
      return sendJson(res, 502, { error: "Sorry, I couldn't generate a reply right now. Please try again shortly." });
    }

    const result = await upstream.json();
    const answer = (result.output || [])
      .flatMap((item) => Array.isArray(item.content) ? item.content : [])
      .filter((part) => part.type === "output_text" && typeof part.text === "string")
      .map((part) => part.text)
      .join("\n")
      .trim();

    if (!answer) return sendJson(res, 502, { error: "I couldn't generate a reply. Please try again." });
    return sendJson(res, 200, { answer });
  } catch {
    return sendJson(res, 502, { error: "The chat service is temporarily unavailable. Please try again shortly." });
  }
};

// Vercel's built-in body parser rejects overly large JSON bodies before the handler.
module.exports.config = { api: { bodyParser: { sizeLimit: "8kb" } } };
