(() => {
  if (document.getElementById("korim-chat-launcher")) return;

  const style = document.createElement("style");
  style.textContent = `
    #korim-chat-launcher{position:fixed;right:24px;bottom:24px;z-index:10000;width:64px;height:64px;border:1px solid rgba(255,255,255,.3);border-radius:22px;background:linear-gradient(145deg,#7c3aed,#4f46e5 58%,#2563eb);color:#fff;box-shadow:0 12px 34px rgba(79,70,229,.38);cursor:pointer;display:grid;place-items:center;transition:transform .2s,box-shadow .2s}
    #korim-chat-launcher:hover{transform:translateY(-3px);box-shadow:0 16px 38px rgba(79,70,229,.46)}
    #korim-chat-launcher svg{width:29px;height:29px}
    #korim-chat-launcher:focus-visible,#korim-chat-send:focus-visible,#korim-chat-close:focus-visible{outline:3px solid #a5b4fc;outline-offset:3px}
    #korim-chat-panel{position:fixed;right:24px;bottom:102px;z-index:10000;width:min(390px,calc(100vw - 28px));height:min(590px,calc(100dvh - 125px));background:#fff;border:1px solid rgba(148,163,184,.24);border-radius:25px;box-shadow:0 28px 90px rgba(15,23,42,.26);display:none;overflow:hidden;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#0f172a}
    #korim-chat-panel.kc-open{display:flex;flex-direction:column;animation:kc-pop .2s ease-out}
    @keyframes kc-pop{from{opacity:0;transform:translateY(9px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
    .kc-head{position:relative;overflow:hidden;background:linear-gradient(120deg,#312e81,#5b21b6 58%,#4338ca);color:#fff;padding:19px 18px 17px;display:flex;align-items:center;gap:12px}
    .kc-head:after{content:"";position:absolute;width:150px;height:150px;border:1px solid rgba(255,255,255,.12);border-radius:50%;right:-48px;top:-85px;box-shadow:0 0 0 22px rgba(255,255,255,.035),0 0 0 44px rgba(255,255,255,.025);pointer-events:none}
    .kc-avatar{position:relative;flex-shrink:0;width:45px;height:45px;border-radius:16px;background:linear-gradient(145deg,rgba(255,255,255,.26),rgba(255,255,255,.08));border:1px solid rgba(255,255,255,.3);display:grid;place-items:center;font-size:19px;font-weight:800;letter-spacing:-.5px}
    .kc-online{position:absolute;right:-3px;bottom:-3px;width:12px;height:12px;border-radius:50%;background:#4ade80;border:2px solid #4c1d95}
    .kc-title{font-size:15px;font-weight:750;letter-spacing:-.2px}.kc-subtitle{font-size:11px;color:rgba(255,255,255,.78);margin-top:4px;display:flex;align-items:center;gap:5px}
    .kc-subtitle:before{content:"";width:6px;height:6px;background:#4ade80;border-radius:50%;display:inline-block}
    #korim-chat-close{position:relative;z-index:1;margin-left:auto;width:34px;height:34px;border:1px solid rgba(255,255,255,.18);border-radius:11px;background:rgba(255,255,255,.1);color:#fff;font-size:22px;line-height:1;cursor:pointer}
    .kc-welcome{padding:15px 16px 5px;background:#f8faff}
    .kc-welcome-title{font-size:13px;font-weight:750;color:#1e1b4b;margin-bottom:4px}
    .kc-welcome-copy{font-size:12px;color:#64748b;line-height:1.55}
    #korim-chat-messages{flex:1;min-height:80px;overflow-y:auto;padding:13px 15px 16px;background:#f8faff;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
    #korim-chat-messages::-webkit-scrollbar{width:5px}#korim-chat-messages::-webkit-scrollbar-thumb{background:#dbe3f2;border-radius:9px}
    .kc-msg{max-width:88%;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.58;font-size:12.5px;padding:11px 13px;border-radius:16px}
    .kc-msg.bot{align-self:flex-start;background:#fff;border:1px solid #e8eaf5;border-bottom-left-radius:5px;color:#334155;box-shadow:0 2px 7px rgba(15,23,42,.025)}
    .kc-msg.user{align-self:flex-end;background:linear-gradient(135deg,#5b21b6,#4f46e5);color:#fff;border-bottom-right-radius:5px;box-shadow:0 4px 12px rgba(79,70,229,.16)}
    .kc-quick-label{padding:5px 15px 8px;background:#f8faff;color:#94a3b8;font-size:10px;font-weight:750;letter-spacing:.8px;text-transform:uppercase}
    .kc-quick{display:flex;gap:7px;flex-wrap:wrap;padding:0 15px 13px;background:#f8faff}
    .kc-quick button{border:1px solid #e0e7ff;border-radius:12px;padding:8px 10px;background:#fff;color:#4f46e5;font-size:11px;font-weight:650;cursor:pointer;transition:background .15s,border-color .15s}
    .kc-quick button:hover{background:#eef2ff;border-color:#c7d2fe}
    .kc-composer{padding:12px 13px 10px;border-top:1px solid #edf0f7;background:#fff}
    .kc-form{display:flex;align-items:flex-end;gap:8px;padding:6px 6px 6px 10px;border:1px solid #e2e8f0;border-radius:17px;background:#f8fafc;transition:border-color .15s,box-shadow .15s}
    .kc-form:focus-within{border-color:#a5b4fc;box-shadow:0 0 0 3px rgba(99,102,241,.08)}
    #korim-chat-input{min-width:0;flex:1;resize:none;max-height:92px;min-height:28px;border:0;background:transparent;padding:6px 1px;font:12.5px/1.5 inherit;color:#0f172a;outline:none}
    #korim-chat-input::placeholder{color:#94a3b8}
    #korim-chat-send{width:36px;height:36px;flex-shrink:0;border:0;border-radius:12px;background:linear-gradient(145deg,#7c3aed,#4f46e5);color:#fff;display:grid;place-items:center;cursor:pointer;transition:opacity .15s}
    #korim-chat-send svg{width:17px;height:17px}#korim-chat-send:disabled{opacity:.45;cursor:wait}
    .kc-note{font-size:10px;color:#94a3b8;text-align:center;padding:8px 2px 0}
    .kc-note a{color:#6366f1;text-decoration:none}.kc-note a:hover{text-decoration:underline}
    @media(max-width:480px){#korim-chat-launcher{right:16px;bottom:16px;width:59px;height:59px;border-radius:20px}#korim-chat-panel{right:8px;bottom:84px;width:calc(100vw - 16px);height:min(620px,calc(100dvh - 100px));border-radius:22px}}
    @media(prefers-reduced-motion:reduce){#korim-chat-panel.kc-open{animation:none}#korim-chat-launcher{transition:none}}
  `;
  document.head.appendChild(style);

  const launcher = document.createElement("button");
  launcher.id = "korim-chat-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Open chat with Korim AI Assistant");
  launcher.setAttribute("aria-expanded", "false");
  launcher.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6.5A7.5 7.5 0 1 1 20 11.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m12 6.5.85 2.65L15.5 10l-2.65.85L12 13.5l-.85-2.65L8.5 10l2.65-.85L12 6.5Z" fill="currentColor"/></svg>';

  const panel = document.createElement("section");
  panel.id = "korim-chat-panel";
  panel.setAttribute("aria-label", "Korim AI Assistant chat");
  panel.setAttribute("aria-modal", "false");
  panel.innerHTML = `
    <div class="kc-head">
      <div class="kc-avatar" aria-hidden="true">K<span class="kc-online"></span></div>
      <div><div class="kc-title">Korim AI Assistant</div><div class="kc-subtitle">Here to help you explore</div></div>
      <button id="korim-chat-close" type="button" aria-label="Close chat">×</button>
    </div>
    <div class="kc-welcome">
      <div class="kc-welcome-title">Hey there! 👋</div>
      <div class="kc-welcome-copy">Looking for a developer? Ask me about services, projects, or starting your next idea.</div>
    </div>
    <div id="korim-chat-messages" role="log" aria-live="polite" aria-relevant="additions text"></div>
    <div class="kc-quick-label">Quick questions</div>
    <div class="kc-quick">
      <button type="button" data-prompt="What services does Korim offer?">✦ Services</button>
      <button type="button" data-prompt="Show me Korim's portfolio projects.">↗ Portfolio</button>
      <button type="button" data-prompt="How can I contact Korim for a project?">✉ Contact</button>
    </div>
    <div class="kc-composer">
      <form class="kc-form" id="korim-chat-form">
        <textarea id="korim-chat-input" rows="1" maxlength="1200" aria-label="Your message" placeholder="Type your message..." required></textarea>
        <button id="korim-chat-send" type="submit" aria-label="Send message"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m21 3-7.2 18-3.9-7.9L2 9.2 21 3Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 13 21 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
      </form>
      <div class="kc-note">Powered by Korim AI · <a href="mailto:mdkorimdeveloper@gmail.com">Contact Korim</a></div>
    </div>
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
    launcher.setAttribute("aria-label", "Close Korim AI Assistant");
    if (!messagesEl.childElementCount) {
      addMessage("assistant", "I can help you learn about Korim's services, portfolio, and project inquiries. What would you like to know?");
    }
    input.focus();
  }
  function closeChat() {
    panel.classList.remove("kc-open");
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-label", "Open chat with Korim AI Assistant");
    launcher.focus();
  }
  launcher.addEventListener("click", () => panel.classList.contains("kc-open") ? closeChat() : openChat());
  panel.querySelector("#korim-chat-close").addEventListener("click", closeChat);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel.classList.contains("kc-open")) closeChat();
  });

  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 92) + "px";
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  async function submitText(text) {
    const clean = String(text || "").trim().slice(0, 1200);
    if (!clean || busy) return;
    addMessage("user", clean);
    history.push({ role: "user", content: clean });
    input.value = "";
    input.style.height = "auto";
    busy = true;
    send.disabled = true;
    send.setAttribute("aria-label", "Sending message");
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
      history.pop();
    } finally {
      busy = false;
      send.disabled = false;
      send.setAttribute("aria-label", "Send message");
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
