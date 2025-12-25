let lead = {
  step: 0, // 0=name, 1=email, 2=done
  name: "",
  email: ""
};

const categoryLinkMap = {
  brand_overview: "https://eynthrasolution.com/features",
  product_positioning: "https://eynthrasolution.com/features",
  platform_access: "https://eynthrasolution.com/features",

  features: "https://eynthrasolution.com/features",
  ai_processing: "https://eynthrasolution.com/features",
  ocr_technology: "https://eynthrasolution.com/features",

  pricing: "https://eynthrasolution.com/pricing",
  subscription_limits: "https://eynthrasolution.com/pricing",

  events: "https://eynthrasolution.com/event-lead-capture",
  meetings: "https://eynthrasolution.com/event-lead-capture",

  data_security: "https://eynthrasolution.com/privacy",
  data_ownership: "https://eynthrasolution.com/privacy",
  privacy: "https://eynthrasolution.com/privacy",

  support: "https://eynthrasolution.com/contact",
  email_integration: "https://eynthrasolution.com/email-integration",

  legal: "https://eynthrasolution.com/terms"
};


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
// function isSimilar(a, b) {
//   if (!a || !b) return false;
//   a = a.toLowerCase();
//   b = b.toLowerCase();

//   if (a === b) return true;
//   if (Math.abs(a.length - b.length) > 2) return false;

//   let matches = 0;
//   const minLen = Math.min(a.length, b.length);

//   for (let i = 0; i < minLen; i++) {
//     if (a[i] === b[i]) matches++;
//   }

//   return matches / Math.max(a.length, b.length) >= 0.7;
// }

function normalize(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "") // remove symbols
    .replace(/\s+/g, " ");       // normalize spaces
}

// Levenshtein Distance
function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, () => []);

  for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i - 1] === a[j - 1]
        ? matrix[i - 1][j - 1]
        : Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
    }
  }
  return matrix[b.length][a.length];
}

function similarityScore(a, b) {
  const distance = levenshtein(a, b);
  return 1 - distance / Math.max(a.length, b.length);
}

// 🔥 MASTER FUZZY MATCH
function isFuzzyMatch(input, target, threshold = 0.75) {
  if (!input || !target) return false;

  input = normalize(input);
  target = normalize(target);

  // 1. Exact match
  if (input === target) return true;

  // 2. Substring match
  if (input.includes(target) || target.includes(input)) return true;

  // 3. Levenshtein similarity
  if (similarityScore(input, target) >= threshold) return true;

  // 4. Token-based matching (word-level)
  const inputTokens = input.split(" ");
  const targetTokens = target.split(" ");

  let matchedTokens = 0;

  inputTokens.forEach(iWord => {
    targetTokens.forEach(tWord => {
      if (similarityScore(iWord, tWord) >= 0.8) {
        matchedTokens++;
      }
    });
  });

  const tokenScore = matchedTokens / Math.max(inputTokens.length, targetTokens.length);
  return tokenScore >= 0.6;
}


// --------------------
// LOAD INTENTS JSON
// --------------------
fetch("eynthra_intent_level_knowledge_FULL_MERGED[2].json")
  .then(res => res.json())
  .then(data => {
    intents = data.intents || [];
    // appendBotMessage(
    //   "👋 <b>Hello! I’m the Eynthra AI Assistant.</b><br><br>" +
    //   "You can ask me about:<br>" +
    //   "• Product & Features<br>" +
    //   "• Pricing & Free Trial<br>" +
    //   "• Demo & Events<br>" +
    //   "• Security, Privacy & Compliance<br>" +
    //   "• Support & Contact"
    // );
    appendBotMessage(
      "👋 <b>Hello! I’m the Eynthra AI Assistant.</b><br><br>" +
      "Before we begin, may I know your name?"
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

// function sendMessage() {
//   const userText = input.value.trim();
//   if (!userText) return;

//   appendUserMessage(userText);
//   input.value = "";

//   setTimeout(() => {
//     const replies = getBotReplies(userText);
//     replies.forEach(r => appendBotMessage(r));
//   }, 300);
// }

function sendMessage() {
  const userText = input.value.trim();
  if (!userText) return;

  appendUserMessage(userText);
  input.value = "";

  setTimeout(() => {
    // 🔹 NAME STEP
    if (lead.step === 0) {
      lead.name = userText;
      lead.step = 1;
      appendBotMessage(`Nice to meet you, <b>${lead.name}</b> 😊<br>Please share your email address.`);
      return;
    }

    // 🔹 EMAIL STEP
    if (lead.step === 1) {
      if (!validateEmail(userText)) {
        appendBotMessage("❌ Please enter a valid email address.");
        return;
      }

      lead.email = userText;
      lead.step = 2;

      appendBotMessage(
        "✅ Thank you! You can now ask me anything about Eynthra."
      );

      input.disabled = false;

      // 👉 SEND TO EMAIL / BACKEND
      sendLeadToAdmin(lead);

      return;
    }

    // 🔹 NORMAL CHAT
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

  // --------------------
  // GREETINGS (FUZZY)
  // --------------------
  const greetings = [
    "hi", "hello", "hey", "hii", "hiii",
    "hey there", "hello there", "hi there",
    "good morning", "good afternoon", "good evening",
    "gm", "ge", "good day", "hola"
  ];

  if (greetings.some(g => isFuzzyMatch(msg, g))) {
    return ["👋 Hello! How can I help you with Eynthra today?"];
  }

  // --------------------
  // THANKS / OK / BYE / END CHAT (FUZZY)
  // --------------------

  const thanksWords = [
    "thanks", "thank you", "thx", "ty",
    "thanks a lot", "thankyou",
    "many thanks", "appreciate it",
    "appreciated", "much appreciated"
  ];

  const okWords = [
    "ok", "okay", "okey", "okk", "alright",
    "fine", "cool", "got it", "understood",
    "makes sense"
  ];

  const byeWords = [
    "bye", "goodbye", "bye bye", "see you",
    "see ya", "later", "talk later",
    "exit", "close", "end", "stop"
  ];

  // THANKS
  if (thanksWords.some(t => isFuzzyMatch(msg, t))) {
    return ["😊 You’re welcome! Let me know if you need anything else."];
  }

  // OK / ACKNOWLEDGEMENT
  if (okWords.some(o => isFuzzyMatch(msg, o))) {
    return ["👍 Got it! Feel free to ask me anything whenever you’re ready."];
  }

  // BYE / END CHAT
  if (byeWords.some(b => isFuzzyMatch(msg, b))) {
    return [
      "👋 Thanks for chatting with Eynthra!<br>" +
      "If you need anything later, I’ll be right here. 😊"
    ];
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
        if (isFuzzyMatch(w, kw)) score += 5;
      }

      // Category match
      if (isFuzzyMatch(w, category)) score += 4;

      // Synonym match
      for (let key in synonymMap) {
        if (
          synonymMap[key].some(s => isFuzzyMatch(w, s)) &&
          isFuzzyMatch(key, category)
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
    const link =
      categoryLinkMap[bestIntent.category] ||
      "https://eynthrasolution.com/features";

    return [
      `${bestIntent.answer}<br><br>
    🔗 <a href="${link}" target="_blank" rel="noopener noreferrer">
      Learn more
    </a>`
    ];
  }



  // Fallback
  return [
    `
🤔 Hmm… I couldn’t find the exact answer to that right now.<br><br>
But no worries! You can explore these helpful sections:<br><br>
👉 <a href="https://eynthrasolution.com/product" target="_blank">Product Overview</a><br>
👉 <a href="https://eynthrasolution.com/pricing" target="_blank">Pricing & Plans</a><br>
👉 <a href="https://eynthrasolution.com/features" target="_blank">Features</a><br>
👉 <a href="https://eynthrasolution.com/privacy-policy" target="_blank">Privacy & Security</a><br><br>
If you’d like, just rephrase your question—I’m here to help 😊
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

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


function sendLeadToAdmin(lead) {
  fetch("https://eynthrasolution.com/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: lead.name,
      email: lead.email
    })
  });
}
