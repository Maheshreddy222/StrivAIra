function cleanJson(raw) {
  if (!raw) return "{}";
  return raw.replace(/```json/g, "").replace(/```/g, "").trim();
}

export async function nextQuestionWithGroq({
  interviewType,
  role,
  transcript,
  userAnswer,
  askedQuestions = [],
  timeLeftSeconds = null,
}) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
 
  if (!GROQ_API_KEY) {
    throw new Error("❌ GROQ_API_KEY is missing in backend .env file");
  }
 
  const isCoding = interviewType?.toLowerCase().includes("coding");
 
  const formattedTranscript = (transcript || [])
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");
 
  const askedListFormatted =
    askedQuestions.length > 0
      ? askedQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")
      : "None yet";
 
  const lastMinuteMode =
    typeof timeLeftSeconds === "number" && timeLeftSeconds <= 60;
 
  // ── CODING INTERVIEW MODE ──────────────────────────────────────────────────
  if (isCoding) {
    const systemPrompt = `
You are PrepWise AI Coding Interviewer.
 
Interview style: Coding challenge (LeetCode/competitive programming style).
Ask realistic coding problems relevant to the given Role.
 
STRICT RULES:
- Ask ONLY ONE coding problem at a time.
- English ONLY.
- Never repeat any problem from "Already Asked Problems".
- Vary difficulty: start easy, then medium, then hard.
- Each problem must be a different topic/data-structure/algorithm.
- Include: problem statement, example inputs/outputs, constraints.
- Specify the preferred language as JavaScript (unless role strongly implies another).
- Keep problem statement concise but complete.
 
TOPIC COVERAGE (rotate):
- Arrays & strings
- Hash maps / sets
- Linked lists
- Stacks & queues
- Binary search
- Recursion & backtracking
- Trees & graphs (BFS/DFS)
- Dynamic programming
- Sorting & two-pointers
- Bit manipulation (advanced)
 
EVALUATION (when userAnswer contains code):
- Review the submitted code for correctness.
- Check time/space complexity.
- Note edge cases handled or missed.
- Give short, constructive feedback (1-2 sentences).
 
Return ONLY valid JSON (no markdown, no extra text):
{
  "nextQuestion": "string — full problem statement with examples",
  "shortFeedback": "string — feedback on previous code, or empty string for first question",
  "language": "javascript",
  "starterCode": "string — minimal function stub for the problem"
}
`;
 
    const userPrompt = `
Role: ${role}
 
Already Asked Problems (DO NOT REPEAT):
${askedListFormatted}
 
Transcript:
${formattedTranscript || "None yet"}
 
User latest code submission:
${userAnswer || "None (this is the first problem)"}
 
Task:
- If this is the first problem -> ask an easy warm-up problem.
- Else -> provide short code feedback (1-2 sentences) then ask the next problem (step up difficulty).
${lastMinuteMode ? `Time Left: ${timeLeftSeconds}s — ask one final easy problem.` : ""}
 
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
        temperature: 0.7,
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
      if (!parsed?.nextQuestion) throw new Error("Missing nextQuestion");
      if (!parsed.shortFeedback) parsed.shortFeedback = "Thanks for your submission.";
      if (!parsed.language) parsed.language = "javascript";
      if (!parsed.starterCode) {
        parsed.starterCode = "/**\n * @param {any} input\n * @return {any}\n */\nfunction solution(input) {\n  // your code here\n}";
      }
      return parsed;
    } catch (err) {
      console.log("❌ Coding Groq JSON parse failed:", err);
      console.log("RAW:", raw);
      return {
        nextQuestion: `Write a function that takes an array of integers and returns the sum of all even numbers.\n\nExample:\nInput: [1, 2, 3, 4, 5, 6]\nOutput: 12\n\nConstraints: 1 <= arr.length <= 10^4`,
        shortFeedback: "Thanks for your submission.",
        language: "javascript",
        starterCode: "/**\n * @param {number[]} arr\n * @return {number}\n */\nfunction sumEven(arr) {\n  // your code here\n}",
      };
    }
  }
 
  // ── NORMAL (non-coding) INTERVIEW MODE ────────────────────────────────────
  const systemPrompt = `
You are PrepWise AI Interviewer.
 
Interview style: Normal (professional, friendly).
Ask realistic interview questions ONLY based on given Role and Interview Type.
 
STRICT RULES:
- Ask ONLY ONE question at a time.
- English ONLY.
- Never repeat any question from "Already Asked Questions".
- Never rephrase the same question again.
- Each question must introduce a NEW topic/skill area.
- Questions must be concise, practical, and role-based.
- If user answer is weak/short, ask a follow-up, but NOT repeating any previous question.
 
TOPIC COVERAGE (rotate):
- Fundamentals
- Projects & real work
- Debugging & troubleshooting
- Performance/optimization
- System/design basics (only if role supports)
- Best practices, edge cases
- Communication / reasoning
 
IMPORTANT LAST MINUTE RULE:
If timeLeftSeconds <= 60:
- Start with: "⚠️ We have less than one minute left. This will be the last question."
- Then ask the final best question.
 
Return ONLY valid JSON (no markdown, no extra text):
{
  "nextQuestion": "string",
  "shortFeedback": "string"
}
`;
 
  const userPrompt = `
Interview Type: ${interviewType}
Role: ${role}
 
Already Asked Questions (DO NOT REPEAT):
${askedListFormatted}
 
Transcript:
${formattedTranscript || "None yet"}
 
User latest answer:
${userAnswer || "None (this is the first question)"}
 
Task:
- If this is the first question -> ask opening question relevant to the role.
- Else -> provide short feedback (1 short sentence) then ask a NEW question.
${lastMinuteMode ? `Time Left: ${timeLeftSeconds}s (LAST QUESTION)` : ""}
 
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
      temperature: 0.75,
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
 
    if (!parsed?.nextQuestion) throw new Error("Missing nextQuestion");
 
    if (lastMinuteMode && !parsed.nextQuestion.includes("⚠️")) {
      parsed.nextQuestion =
        "⚠️ We have less than one minute left. This will be the last question.\n\n" +
        parsed.nextQuestion;
    }
 
    if (!parsed.shortFeedback) parsed.shortFeedback = "Thanks for your answer.";
 
    return parsed;
  } catch (err) {
    console.log("❌ Groq JSON parse failed:", err);
    console.log("RAW:", raw);
 
    const fallbackQ = lastMinuteMode
      ? `⚠️ We have less than one minute left. This will be the last question.\n\nWhat is one improvement you would make in your last project as a ${role}?`
      : `What is one key concept you use daily as a ${role}, and why is it important?`;
 
    return {
      nextQuestion: fallbackQ,
      shortFeedback: "Thanks for your answer.",
    };
  }
}
 