import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { nextQuestionWithGroq } from "./nextQuestionWithGroq.js";
import { evaluateWithGroq } from "./evaluateWithGroq.js";
import { computeAccuracy } from "./accuracy.js";
import { addMetric, getMetrics } from "./metricsStore.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// app.post("/api/interview/next", async (req, res) => {
//   try {
//     const {
//       interviewType,
//       role,
//       transcript = [],
//       userAnswer = null,
//       askedQuestions = [],
//       timeLeftSeconds = null,
//     } = req.body;

//     const result = await nextQuestionWithGroq({
//       interviewType,
//       role,
//       transcript,
//       userAnswer,
//       askedQuestions,
//       timeLeftSeconds,
//     });

//     return res.json(result);
//   } catch (err) {
//     console.log("❌ /api/interview/next error:", err);

//     return res.status(500).json({
//       nextQuestion:
//         "⚠️ Sorry, there was an issue generating the next question. Please click Speak again.",
//       shortFeedback: "Backend error occurred.",
//     });
//   }
// });

app.post("/api/interview/next", async (req, res) => {

  const startTime = Date.now();

  try {

    const {
      interviewType,
      role,
      transcript = [],
      userAnswer = null,
      askedQuestions = [],
      timeLeftSeconds = null,
    } = req.body;

    const result = await nextQuestionWithGroq({
      interviewType,
      role,
      transcript,
      userAnswer,
      askedQuestions,
      timeLeftSeconds,
    });

    const latency = Date.now() - startTime;

    addMetric({
      timestamp: Date.now(),
      accuracy: null,
      latency,
      errorRate: 0
    });

    return res.json(result);

  } catch (err) {

    const latency = Date.now() - startTime;

    addMetric({
      timestamp: Date.now(),
      accuracy: null,
      latency,
      errorRate: 1
    });

    console.log("❌ /api/interview/next error:", err);

    return res.status(500).json({
      nextQuestion:
        "⚠️ Sorry, there was an issue generating the next question.",
      shortFeedback: "Backend error occurred."
    });

  }
});

// app.post("/api/interview/end", async (req, res) => {
//   try {
//     const { interviewType, role, duration, transcript = [] } = req.body;

//     const evaluation = await evaluateWithGroq({
//       interviewType,
//       role,
//       duration,
//       transcript,
//     });

//     return res.json(evaluation);
//   } catch (err) {
//     console.log("❌ /api/interview/end error:", err);

//     return res.status(500).json({
//       score: 0,
//       strengths: [],
//       improvements: ["Evaluation failed due to backend error."],
//       focusAreas: ["Try again"],
//       finalFeedback: "Could not generate evaluation. Please retry.",
//     });
//   }
// });

app.post("/api/interview/end", async (req, res) => {

  try {

    const { interviewType, role, duration, transcript = [] } = req.body;

    const evaluation = await evaluateWithGroq({
      interviewType,
      role,
      duration,
      transcript,
    });

    const accuracy = computeAccuracy(transcript);

    addMetric({
      timestamp: Date.now(),
      accuracy,
      latency: null,
      errorRate: 0
    });

    return res.json({
      ...evaluation,
      accuracy
    });

  } catch (err) {

    console.log("❌ /api/interview/end error:", err);

    addMetric({
      timestamp: Date.now(),
      accuracy: 0,
      latency: null,
      errorRate: 1
    });

    return res.status(500).json({
      score: 0,
      strengths: [],
      improvements: ["Evaluation failed due to backend error."],
      focusAreas: ["Try again"],
      finalFeedback: "Could not generate evaluation."
    });
  }
});

app.get("/api/metrics", (req, res) => {
  const data = getMetrics();
  return res.json(data);
});

app.listen(5000, () => console.log("✅ Backend running at port 5000"));
