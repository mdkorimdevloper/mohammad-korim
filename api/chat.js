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
  if (buckets.size > 1000) {
    for (const [key, value] of buckets) if (now >= value.resetAt) buckets.delete(key);
  }
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

const SYSTEM_INSTRUCTIONS = [
  "You are Korim AI Assistant, the public portfolio chatbot for Mohammad Korim (MD Korim), a developer based in Bangladesh.",
  "Help website visitors understand Korim's services, projects, and how to contact him.",
  "Services include full-stack website development, e-commerce websites, custom software and API integration, and SEO services (on-page, off-page, technical, and local SEO). Digital marketing may also be discussed.",
  "Portfolio website: https://mohammad-korim.vercel.app/",
  "Other portfolio project: https://clippingpath.live/",
  "Contact email: mdkorimdeveloper@gmail.com",
  "When relevant, invite visitors to email Korim with project requirements for a quote. Do not invent prices, availability, credentials, client results, or technical details not provided here.",
  "Answer in the language the visitor uses. Keep replies friendly, clear, and concise. If you do not know an answer, say so honestly and point them to the contact email.",
  "Do not claim you can send emails, book meetings, access private systems, or perform actions outside this chat."
].join("\n");

function demoAnswer(question) {
  if (/(hi|hello|hey|assalamu|সালাম|হ্যালো|হাই)/i.test(question)) {
    return "Hello! I'm Korim AI Assistant. I can help you explore Korim's development services, portfolio, and contact details.";
  } else if (/(service|services|সার্ভিস|সেবা|কি কাজ|কী কাজ)/i.test(question)) {
    return "Korim offers full-stack website development, e-commerce websites, custom software and API integration, and SEO services such as on-page, off-page, technical, and local SEO. For a project quote, email mdkorimdeveloper@gmail.com.";
  } else if (/(portfolio|project|projects|কাজ|প্রজেক্ট|ওয়েবসাইট|website)/i.test(question)) {
    return "You can explore Korim's portfolio at https://mohammad-korim.vercel.app/ and another project at https://clippingpath.live/. Ask me about services or how to contact Korim.";
  } else if (/(contact|email|hire|যোগাযোগ|ইমেইল|নিয়োগ|কাজ দিতে)/i.test(question)) {
    return "You can contact Korim at mdkorimdeveloper@gmail.com. Please include your project goals, required features, and expected timeline so he can understand your requirements.";
  } else if (/(seo|search engine|এসইও)/i.test(question)) {
    return "Korim can help with on-page SEO, off-page SEO, technical SEO, and local SEO. Share your website URL and your main goal by email: mdkorimdeveloper@gmail.com.";
  } else if (/(price|pricing|cost|quote|দাম|খরচ|মূল্য|কত টাকা)/i.test(question)) {
    return "Project pricing depends on the scope and features, so I don't want to guess a price. Email mdkorimdeveloper@gmail.com with your requirements to request a quote.";
  } else if (/(skill|skills|technology|tech stack|দক্ষতা|টেকনোলজি)/i.test(question)) {
    return "Korim works across full-stack web development, frontend and backend development, Flutter, Python, JavaScript, Supabase, REST APIs, and SEO-related services. Contact him for details about a specific project.";
  }
  return "Thanks for your question! This is the free demo mode, so I can answer common questions about services, portfolio, SEO, and contact details. For a specific request, email mdkorimdeveloper@gmail.com. A live AI API can be connected later.";
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

  // Free FAQ demo mode works without any provider key.
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    return sendJson(res, 200, { answer: demoAnswer(messages[messages.length - 1].content), mode: "demo" });
  }

  try {
    // Prefer Gemini when GEMINI_API_KEY is configured. Keep the key on the server only.
    if (process.env.GEMINI_API_KEY) {
      const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
      const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: {
          "x-goog-api-key": process.env.GEMINI_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTIONS }] },
          contents: messages.map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content }]
          })),
          generationConfig: { maxOutputTokens: 350, temperature: 0.5 }
        }),
        signal: AbortSignal.timeout(20000)
      });

      if (!upstream.ok) {
        return sendJson(res, 502, { error: "Sorry, I couldn't generate a reply right now. Please check the Gemini API configuration and try again." });
      }
      const result = await upstream.json();
      const answer = (result.candidates?.[0]?.content?.parts || [])
        .map((part) => typeof part.text === "string" ? part.text : "")
        .join("\n")
        .trim();
      if (!answer) return sendJson(res, 502, { error: "I couldn't generate a reply. Please try again." });
      return sendJson(res, 200, { answer, provider: "gemini" });
    }

    // Optional OpenAI fallback for existing deployments.
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
        instructions: SYSTEM_INSTRUCTIONS,
        input: messages
      }),
      signal: AbortSignal.timeout(20000)
    });

    if (!upstream.ok) return sendJson(res, 502, { error: "Sorry, I couldn't generate a reply right now. Please try again shortly." });
    const result = await upstream.json();
    const answer = (result.output || [])
      .flatMap((item) => Array.isArray(item.content) ? item.content : [])
      .filter((part) => part.type === "output_text" && typeof part.text === "string")
      .map((part) => part.text)
      .join("\n")
      .trim();

    if (!answer) return sendJson(res, 502, { error: "I couldn't generate a reply. Please try again." });
    return sendJson(res, 200, { answer, provider: "openai" });
  } catch {
    return sendJson(res, 502, { error: "The chat service is temporarily unavailable. Please try again shortly." });
  }
};

module.exports.config = { api: { bodyParser: { sizeLimit: "8kb" } } };
