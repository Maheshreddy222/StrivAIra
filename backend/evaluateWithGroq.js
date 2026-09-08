function cleanJson(raw) {
  if (!raw) return "{}";
  return raw.replace(/```json/g, "").replace(/```/g, "").trim();
}
 
export async function evaluateWithGroq({
  interviewType,
  role,
  duration,
  transcript,
}) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
 
  if (!GROQ_API_KEY) {
    throw new Error("❌ GROQ_API_KEY missing in backend .env");
  }
 
  const formattedTranscript = (transcript || [])
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");
 
  const isCoding = interviewType?.toLowerCase().includes("coding");
 
  const systemPrompt = `
You are PrepWise AI Interview Evaluator.
 
Rules:
- English ONLY.
- Score out of 10 (0-10, one decimal allowed).
- Evaluate based on:
  1) Technical correctness${isCoding ? " and code quality/efficiency" : ""}
  2) Communication clarity
${isCoding ? "  3) Code readability, edge case handling, time/space complexity awareness" : ""}
- Give strengths, improvements, focus areas.
- Return ONLY valid JSON.
 
JSON format:
{
  "score": number,
  "strengths": ["..."],
  "improvements": ["..."],
  "focusAreas": ["..."],
  "finalFeedback": "..."
}
`;
 
  const userPrompt = `
Interview Type: ${interviewType}
Role: ${role}
Duration: ${duration} minutes
 
Transcript:
${formattedTranscript}
 
Return JSON only.
`;
 
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt.trim() },
        { role: "user", content: userPrompt.trim() },
      ],
    }),
  });
 
  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content || "{}";
  const clean = cleanJson(raw);
 
  try {
    const parsed = JSON.parse(clean);
 
    return {
      score: parsed.score ?? 6.5,
      strengths: parsed.strengths ?? ["Good effort"],
      improvements: parsed.improvements ?? ["Improve clarity and depth"],
      focusAreas: parsed.focusAreas ?? ["Core fundamentals"],
      finalFeedback: parsed.finalFeedback ?? "Keep practicing regularly.",
    };
  } catch (e) {
    console.log("❌ Evaluation JSON Parse Error:", e);
    console.log("RAW:", raw);
 
    return {
      score: 6.5,
      strengths: ["Good effort"],
      improvements: ["Improve answer structure and clarity"],
      focusAreas: ["Role-based fundamentals"],
      finalFeedback: "Nice attempt. Keep practicing daily!",
    };
  }
}