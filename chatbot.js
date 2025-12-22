let intents = [];

// --------------------
// SYNONYM / SIMILAR WORD MAP
// --------------------
const synonymMap = {
  pricing: ["price", "prices", "amount", "cost", "fees", "fee", "opricing", "rate", "charges", "plans"],
  features: ["feature", "featurea", "functions", "capabilities", "modules", "tools", "options"],
  privacy: ["security", "data", "gdpr", "dpdp", "dpdpa", "protection", "policy"],
  demo: ["trial", "sample", "preview", "test", "walkthrough"],
  support: ["help", "contact", "customer", "care", "assistance"],
  // product: ["service", "services", "platform", "software", "system"],
  events: ["event", "expo", "conference", "webinar", "meet"]
};

// --------------------
// FUZZY MATCH FUNCTION
// --------------------
function isSimilar(a, b) {
  if (!a || !b) return false;
  a = a.toLowerCase();
  b = b.toLowerCase();

  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 2) return false;

  let matches = 0;
  const minLen = Math.min(a.length, b.length);

  for (let i = 0; i < minLen; i++) {
    if (a[i] === b[i]) matches++;
  }

  return matches / Math.max(a.length, b.length) >= 0.7;
}

// --------------------
// LOAD INTENTS JSON
// --------------------
fetch("eynthra_intent_level_knowledge_FULL_MERGED[2].json")
  .then(res => res.json())
  .then(data => {
    intents = data.intents || [];
    appendBotMessage(
      "👋 <b>Hello! I’m the Eynthra AI Assistant.</b><br><br>" +
      "You can ask me about:<br>" +
      "• Product & Features<br>" +
      "• Pricing & Free Trial<br>" +
      "• Demo & Events<br>" +
      "• Security, Privacy & Compliance<br>" +
      "• Support & Contact"
    );
  })
  .catch(() => {
    appendBotMessage("⚠️ Unable to load knowledge base.");
  });

const messages = document.getElementById("messages");
const input = document.getElementById("userInput");

// --------------------
// SEND ON ENTER
// --------------------
input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const userText = input.value.trim();
  if (!userText) return;

  appendUserMessage(userText);
  input.value = "";

  setTimeout(() => {
    const replies = getBotReplies(userText);
    replies.forEach(r => appendBotMessage(r));
  }, 300);
}

// --------------------
// BOT LOGIC (SYNONYM + FUZZY)
// --------------------
function getBotReplies(text) {
  const msg = text.toLowerCase().trim();
  const words = msg.split(/\s+/);

  // Greetings
  if (["hi", "hello", "hey"].includes(msg)) {
    return ["👋 Hello! How can I help you with Eynthra today?"];
  }

  // Thanks
  if (["thanks", "thank you", "thx"].includes(msg)) {
    return ["😊 You’re welcome! Let me know if you need anything else."];
  }

  let bestIntent = null;
  let highestScore = 0;

  for (let intent of intents) {
    let score = 0;

    const question = intent.question.toLowerCase();
    const category = intent.category.toLowerCase();
    const keywords = (intent.keywords || []).map(k => k.toLowerCase());

    for (let w of words) {
      // Keyword match
      for (let kw of keywords) {
        if (isSimilar(w, kw)) score += 5;
      }

      // Category match
      if (isSimilar(w, category)) score += 4;

      // Synonym match
      for (let key in synonymMap) {
        if (
          synonymMap[key].some(s => isSimilar(w, s)) &&
          isSimilar(key, category)
        ) {
          score += 6;
        }
      }

      // Question fallback
      if (question.includes(w)) score += 1;
    }

    if (score > highestScore) {
      highestScore = score;
      bestIntent = intent;
    }
  }

  // ✅ Return ONLY ONE BEST ANSWER
  if (bestIntent && highestScore > 0) {
    return [bestIntent.answer];
  }

  // Fallback
  return [
    `
❓ I couldn’t find an exact answer.<br><br>
Try asking about:<br>
• <a href="https://eynthrasolution.com/product" target="_blank">Product</a><br>
• <a href="https://eynthrasolution.com/pricing" target="_blank">Pricing</a><br>
• <a href="https://eynthrasolution.com/features" target="_blank">Features</a><br>
• <a href="https://eynthrasolution.com/privacy-policy" target="_blank">Privacy & Security</a>
    `
  ];
}


// --------------------
// MESSAGE RENDERING
// --------------------
function appendUserMessage(text) {
  const div = document.createElement("div");
  div.className = "message user";
  div.innerText = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function appendBotMessage(text) {
  const div = document.createElement("div");
  div.className = "message bot";

  if (text.includes("<a ")) {
    div.innerHTML = text;
  } else {
    div.innerHTML = text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
  }

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
