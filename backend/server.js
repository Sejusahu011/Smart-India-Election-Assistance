const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// ✅ Railway dynamic port
const port = process.env.PORT || 8080;

// Security & Efficiency Middlewares
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: "1mb" })); // Prevent large payload attacks

// Rate Limiting to prevent DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: "Too many requests, please try again later." }
});
app.use("/api/", limiter);

// ✅ Safe Gemini initialization
let model = null;

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is missing");
} else {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("✅ Gemini initialized");
  } catch (err) {
    console.error("❌ Gemini init error:", err.message);
  }
}

// ✅ System prompt - Fully Aligned with Problem Statement
const SYSTEM_PROMPT = `
You are "ElectionVerse AI Assistant" - a Smart AI Election Assistant for India.
Your core goal is to guide users step-by-step and clear ALL doubts related to elections in a simple and interactive way.

Strictly adhere to these features:
1. Validate Voter ID (e.g., check mock IDs and return eligibility)
2. Simulate Face Verification (ask user to upload/simulate photo check)
3. Step-by-Step Voting Process Guide (EVM, VVPAT, etc.)
4. Smart Doubt Solver (always answer in 3 parts: Simple explanation, Example, Short summary)
5. Complaint System (guide users on how to report issues)
6. Voting Demo (simulate a fake candidate voting process)

Respond clearly, friendly, and primarily in the requested language. If the user asks a doubt, ensure you provide real-life examples.

Mock Data Reference:
EV-2026-1001 → Rohan Sharma, Age 25, Pune (Eligible)
EV-2026-1002 → Priya Patel, Age 32, Surat (Eligible)
EV-2026-1003 → Aryan Gupta, Age 17, Delhi (Not eligible - under age)
`;

// ✅ Chat API
app.post("/api/chat", async (req, res) => {
  try {
    if (!model) {
      return res.status(503).json({
        error: "AI service not available (missing API key or initialization failed)",
      });
    }

    const { message, language, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    // Input sanitization placeholder
    const sanitizedMessage = String(message).trim();

    const lang = language ? `Reply in ${language}` : "";
    const ctx = context ? `Context: ${context}` : "";

    const chatConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n${lang}\n${ctx}\nUser: ${sanitizedMessage}` }] }],
      generationConfig: chatConfig
    });

    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error("❌ AI Error:", error.message);
    // Do not expose internal error details to client for security
    return res.status(500).json({ error: "Failed to get AI response. Please try again." });
  }
});

// ✅ Health route (IMPORTANT for Railway)
app.get("/", (req, res) => {
  res.send("🚀 ElectionVerse Backend Running");
});

// ✅ Start server
if (require.main === module) {
  app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}

module.exports = app;