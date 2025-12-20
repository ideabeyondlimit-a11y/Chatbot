let intents = [];

fetch("eynthra_intent_level_knowledge.json")
  .then(res => res.json())
  .then(data => {
    intents = data.intents;
    botMessage("👋 Hello! I’m the Eynthra AI Assistant. How can I help you today?");
  });

const messages = document.getElementById("messages");
const input = document.getElementById("userInput");

input.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    const userText = input.value.trim();
    if (!userText) return;

    input.value = "";
    userMessage(userText);

    const reply = getBotReply(userText);
    botMessage(reply);
  }
});

function getBotReply(text) {
  const msg = text.toLowerCase().trim();

  // 👋 Greetings
  if (["hi", "hello", "hey"].some(w => msg === w)) {
    return "Hello 👋 How can I help you with Eynthra today?";
  }

  // 🙏 Thanks
  if (["thanks", "thank you", "thx"].includes(msg)) {
    return "You’re welcome 😊 Let me know if you need anything else!";
  }

  // 🔑 Keyword category map
  const keywordMap = {
    product: ["service", "services", "features", "feature", "product", "crm", "software"],
    pricing: ["pricing", "price", "cost", "fees", "plans"],
    demo: ["demo", "trial", "free trial", "testing"],
    support: ["support", "help", "contact", "customer care"],
    security: ["security", "data", "privacy", "compliance"],
    events: ["event", "events", "expo", "conference"]
  };

  // 🔎 Direct keyword → category match
  for (let category in keywordMap) {
    if (keywordMap[category].some(k => msg.includes(k))) {
      const intent = intents.find(i => i.category === category);
      if (intent) return intent.answer;
    }
  }

  // 🔍 Keyword scoring (fallback)
  let bestMatch = null;
  let highestScore = 0;

  const userWords = msg.split(" ");

  for (let intent of intents) {
    let score = 0;
    const intentWords = intent.question.toLowerCase().split(" ");

    for (let w of userWords) {
      if (intentWords.includes(w)) score++;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = intent;
    }
  }

  if (bestMatch && highestScore >= 1) {
    return bestMatch.answer;
  }

  // ❌ Final fallback
  return "I can help with Eynthra features, services, pricing, demo, security, and support. Please ask again.";
}


function userMessage(text) {
  const div = document.createElement("div");
  div.className = "user";
  div.innerText = "You: " + text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function botMessage(text) {
  const div = document.createElement("div");
  div.className = "bot";
  div.innerText = "Bot: " + text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
