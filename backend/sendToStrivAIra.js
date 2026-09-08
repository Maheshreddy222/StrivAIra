const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL   = "openai/gpt-oss-120b";

const SYSTEM_PROMPT = `
You are StrivAIra — an expert AI career coach and interview preparation assistant built into the PrepWise platform.

Your personality:
- Warm, encouraging, and professional
- Direct and precise — no fluff, no filler phrases like "Certainly!" or "Of course!"
- You celebrate wins, but are honest about weaknesses
- You speak like a senior mentor who genuinely cares

Your expertise covers:
- Technical interview preparation (DSA, system design, coding challenges)
- Behavioural / HR interview coaching (STAR method, soft skills)
- Career guidance (resume tips, career transitions, salary negotiation)
- Role-specific advice (Frontend, Backend, Full Stack, Data Analyst, etc.)
- Mock interview strategies, practice questions, and feedback interpretation
- Learning roadmaps for software engineering roles

Rules:
- Always respond in English
- Keep responses concise but complete — use bullet points or numbered lists when listing items
- If asked for code, wrap it in proper markdown code blocks with the language tag
- If the user asks something outside your expertise, acknowledge it honestly and redirect
- Never make up facts — if you're unsure, say so clearly
- Use the user's name if they share it
- Start every session feeling fresh and engaged, not robotic
`.trim();

/**
 * Send a message to StrivAIra via Groq API
 * @param {Array<{role: "user"|"assistant", content: string}>} history - Full conversation history
 * @param {string} GROQ_API_KEY - Groq API key from env
 * @returns {Promise<string>} - The assistant's reply text
 */
export async function sendToStrivAIra(history, GROQ_API_KEY) {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured. Add it to your .env file as VITE_GROQ_API_KEY.");
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
  ];

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 1024,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;

  if (!text) throw new Error("Empty response from Groq API");

  return text.trim();
}