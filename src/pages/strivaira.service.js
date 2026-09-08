const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL   = "openai/gpt-oss-120b";

const SYSTEM_PROMPT = `
You are StrivAIra — a focused AI career & education assistant inside the PrepWise platform.

YOUR STRICT SCOPE — you ONLY help with:
1. Interview preparation (technical, behavioural/HR, system design, DSA, coding challenges)
2. Resume & cover letter building, review, and tips
3. Course & learning path recommendations (programming, data science, cloud, design, etc.)
4. Career guidance (career transitions, job search strategies, salary negotiation, LinkedIn optimization)
5. Educational content (programming concepts, CS fundamentals, data structures, algorithms, web dev, databases, DevOps, AI/ML basics)
6. Soft skills for professional growth (communication, leadership, teamwork in work contexts)
7. Productivity and study techniques related to learning tech skills

OUT OF SCOPE — if the user asks about ANY of the following, refuse politely:
- Personal life advice unrelated to career (relationships, health, lifestyle, food, entertainment)
- Politics, religion, news, current events
- Finance, investing, cryptocurrency (unless it is salary/negotiation context)
- Sports, gaming, movies, music (unless asking about a career in those industries)
- General trivia, jokes, fun facts unrelated to tech/career
- Travel, cooking, fashion, or any other lifestyle topics
- Anything illegal, harmful, or unethical

REFUSAL FORMAT — when out of scope, respond EXACTLY like this and nothing else:
<OUT_OF_SCOPE>
[1-2 sentence polite refusal + redirect to what you CAN help with]
</OUT_OF_SCOPE>

YOUR PERSONALITY:
- Warm, encouraging, sharp — like a senior mentor who genuinely cares
- Direct and precise — no filler openers like "Certainly!" or "Of course!"
- Use markdown: **bold** key terms, bullet lists for steps, code blocks for code
- Comprehensive but never bloated

Respond in English only.
`.trim();

/**
 * Parse raw Groq output — detects out-of-scope refusals
 * @param {string} text
 * @returns {{ isRefusal: boolean, message: string }}
 */
export function parseResponse(text) {
  const match = text.match(/<OUT_OF_SCOPE>([\s\S]*?)<\/OUT_OF_SCOPE>/);
  if (match) return { isRefusal: true, message: match[1].trim() };
  return { isRefusal: false, message: text.trim() };
}

/**
 * Send conversation to StrivAIra
 * @param {Array<{role:"user"|"assistant", content:string}>} history
 * @param {string} GROQ_API_KEY
 * @returns {Promise<{ isRefusal:boolean, message:string }>}
 */
export async function sendToStrivAIra(history, GROQ_API_KEY) {
  if (!GROQ_API_KEY)
    throw new Error("GROQ_API_KEY missing — add VITE_GROQ_API_KEY to your .env file.");

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.65,
      max_tokens: 1200,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const raw  = data?.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Empty response from Groq API.");

  return parseResponse(raw);
}