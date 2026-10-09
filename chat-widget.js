(() => {
  if (document.getElementById("korim-chat-launcher")) return;

  const style = document.createElement("style");
  style.textContent = `
    #korim-chat-launcher{position:fixed;right:22px;bottom:22px;z-index:10000;width:60px;height:60px;border:0;border-radius:50%;background:#1a7a3c;color:#fff;box-shadow:0 8px 28px rgba(0,0,0,.22);cursor:pointer;font-size:24px;display:grid;place-items:center}
    #korim-chat-launcher:focus-visible,#korim-chat-send:focus-visible,#korim-chat-close:focus-visible{outline:3px solid #f0c040;outline-offset:3px}
    #korim-chat-panel{position:fixed;right:22px;bottom:94px;z-index:10000;width:min(370px,calc(100vw - 28px));height:min(540px,calc(100dvh - 125px));background:#fff;border:1px solid #dfe7e0;border-radius:18px;box-shadow:0 16px 55px rgba(0,0,0,.2);display:none;overflow:hidden;font-family:Inter,Arial,sans-serif;color:#1a1a1a}
    #korim-chat-panel.kc-open{display:flex;flex-direction:column}
    .kc-head{background:linear-gradient(135deg,#145e2e,#23a355);color:#fff;padding:15px 16px;display:flex;align-items:center;gap:11px}
    .kc-avatar{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.18);display:grid;place-items:center;font-weight:800}
    .kc-title{font-size:15px;font-weight:800}.kc-subtitle{font-size:11px;opacity:.85;margin-top:3px}
    #korim-chat-close{margin-left:auto;background:transparent;border:0;color:#fff;font-size:22px;cursor:pointer;padding:4px 7px}
    #korim-chat-messages{flex:1;overflow-y:auto;padding:14px;background:#f7faf7;display:flex;flex-direction:column;gap:10px}
    .kc-msg{max-width:88%;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.5;font-size:13px;padding:10px 12px;border-radius:13px}
    .kc-msg.bot{align-self:flex-start;background:#fff;border:1px solid #e2e8e2;border-bottom-left-radius:4px}
    .kc-msg.user{align-self:flex-end;background:#1a7a3c;color:#fff;border-bottom-right-radius:4px}
    .kc-quick{display:flex;gap:6px;flex-wrap:wrap;padding:0 12px 10px;background:#f7faf7}
    .kc-quick button{border:1px solid #b7d8c1;border-radius:20px;padding:6px 9px;background:#fff;color:#145e2e;font-size:11px;cursor:pointer}
    .kc-form{padding:11px;display:flex;gap:8px;border-top:1px solid #e2e8e2;background:#fff}
    #korim-chat-input{min-width:0;flex:1;resize:none;max-height:90px;border:1px solid #d5ddd6;border-radius:12px;padding:10px;font:13px Inter,Arial,sans-serif;outline:none}
    #korim-chat-input:focus{border-color:#1a7a3c}
    #korim-chat-send{width:42px;flex-shrink:0;border:0;border-radius:12px;background:#1a7a3c;color:#fff;font-size:18px;cursor:pointer}
    #korim-chat-send:disabled{opacity:.55;cursor:wait}
    .kc-note{font-size:10px;color:#778078;text-align:center;padding:0 8px 8px;background:#fff}
    @media(max-width:480px){#korim-chat-launcher{right:15px;bottom:15px}#korim-chat-panel{right:8px;bottom:84px;width:calc(100vw - 16px);height:min(560px,calc(100dvh - 105px))}}
  `;
  document.head.appendChild(style);

  const launcher = document.createElement("button");
  launcher.id = "korim-chat-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Chat with Korim AI Assistant");
  launcher.setAttribute("aria-expanded", "false");
  launcher.textContent = "✦";

  const panel = document.createElement("section");
  panel.id = "korim-chat-panel";
  panel.setAttribute("aria-label", "Korim AI Assistant chat");
  panel.innerHTML = `
    <div class="kc-head">
      <div class="kc-avatar" aria-hidden="true">K</div>
      <div><div class="kc-title">Korim AI Assistant</div><div class="kc-subtitle">Ask about services & portfolio</div></div>
      <button id="korim-chat-close" type="button" aria-label="Close chat">×</button>
    </div>
    <div id="korim-chat-messages" role="log" aria-live="polite"></div>
    <div class="kc-quick">
      <button type="button" data-prompt="What services does Korim offer?">Services</button>
      <button type="button" data-prompt="Show me Korim's portfolio projects.">Portfolio</button>
      <button type="button" data-prompt="How can I contact Korim for a project?">Contact</button>
    </div>
    <form class="kc-form" id="korim-chat-form">
      <textarea id="korim-chat-input" rows="1" maxlength="1200" aria-label="Your message" placeholder="Ask me something..." required></textarea>
      <button id="korim-chat-send" type="submit" aria-label="Send message">➤</button>
    </form>
    <div class="kc-note">AI-generated answers may be inaccurate. Please verify project details.</div>
  `;
  document.body.append(launcher, panel);

  const messagesEl = panel.querySelector("#korim-chat-messages");
  const form = panel.querySelector("#korim-chat-form");
  const input = panel.querySelector("#korim-chat-input");
  const send = panel.querySelector("#korim-chat-send");
  const history = [];
  let busy = false;

  function addMessage(role, text) {
    const bubble = document.createElement("div");
    bubble.className = "kc-msg " + (role === "user" ? "user" : "bot");
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  }

  function openChat() {
    panel.classList.add("kc-open");
    launcher.setAttribute("aria-expanded", "true");
    if (!messagesEl.childElementCount) {
      addMessage("assistant", "Hi! I'm Korim AI Assistant. Ask me about Korim's services, portfolio projects, or how to get in touch.");
    }
    input.focus();
  }
  function closeChat() {
    panel.classList.remove("kc-open");
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
  }
  launcher.addEventListener("click", () => panel.classList.contains("kc-open") ? closeChat() : openChat());
  panel.querySelector("#korim-chat-close").addEventListener("click", closeChat);

  async function submitText(text) {
    const clean = String(text || "").trim().slice(0, 1200);
    if (!clean || busy) return;
    addMessage("user", clean);
    history.push({ role: "user", content: clean });
    input.value = "";
    busy = true;
    send.disabled = true;
    send.textContent = "…";
    const pending = addMessage("assistant", "Thinking…");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-8) })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "The assistant is unavailable right now.");
      const answer = String(data.answer || "").slice(0, 5000);
      pending.textContent = answer || "I couldn't generate a reply. Please try again.";
      history.push({ role: "assistant", content: pending.textContent });
    } catch (error) {
      pending.textContent = error.message || "Connection failed. Please try again.";
      // Keep failed user message visible, but don't add the error as conversation context.
      history.pop();
    } finally {
      busy = false;
      send.disabled = false;
      send.textContent = "➤";
      input.focus();
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitText(input.value);
  });
  panel.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => submitText(button.getAttribute("data-prompt")));
  });
})();
