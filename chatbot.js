let intents = [];

// Load intents JSON
fetch("eynthra_intent_level_knowledge.json")
  .then(res => res.json())
  .then(data => {
    intents = data.intents || [];
    appendBotMessage(
      "👋 Hello! I’m the Eynthra AI Assistant.\nAsk me about features, pricing, demo, events, or support."
    );
  })
  .catch(() => {
    appendBotMessage("⚠️ Unable to load knowledge base.");
  });

const messages = document.getElementById("messages");
const input = document.getElementById("userInput");

// Send on Enter key
input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});

function sendMessage() {
  const userText = input.value.trim();
  if (!userText) return;

  appendUserMessage(userText);
  input.value = "";

  setTimeout(() => {
    const reply = getBotReply(userText);
    appendBotMessage(reply);
  }, 300);
}

// --------------------
// BOT LOGIC
// --------------------
function getBotReply(text) {
  const msg = text.toLowerCase();

  // 👋 Greetings
  if (["hi", "hello", "hey", "good morning", "good evening"].includes(msg)) {
    return "👋 Hello! How can I help you with Eynthra today?";
  }

  // 🙏 Thanks
  if (["thanks", "thank you", "thx"].includes(msg)) {
    return "😊 You’re welcome! Let me know if you need anything else.";
  }

  // 🔑 Keyword → Category Map
  const keywordMap = {
    product: ["service", "services", "features", "feature", "product", "crm", "software"],
    trial: ["pricing", "price", "cost", "fees", "plans", "trial", "free"],
    demo: ["demo", "book demo", "live demo"],
    support: ["support", "help", "contact", "customer care"],
    security: ["security", "data", "privacy", "gdpr", "dpdpa"],
    events: ["event", "events", "expo", "conference"]
  };

  // 1️⃣ Direct keyword → category answer
  for (let category in keywordMap) {
    if (keywordMap[category].some(k => msg.includes(k))) {
      const intent = intents.find(i => i.category === category);
      if (intent) return intent.answer;
    }
  }

  // 2️⃣ Keyword scoring against questions
  let bestMatch = null;
  let highestScore = 0;

  const userWords = msg.split(/\s+/);

  for (let intent of intents) {
    let score = 0;
    const questionWords = intent.question.toLowerCase().split(/\s+/);

    for (let w of userWords) {
      if (questionWords.includes(w)) score++;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = intent;
    }
  }

  if (bestMatch && highestScore > 0) {
    return bestMatch.answer;
  }

  // ❌ Fallback
  return "❓ I couldn’t find an exact answer. You can ask about features, pricing, demo, events, security, or support.";
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
  div.innerText = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
