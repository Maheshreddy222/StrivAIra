export function computeAccuracy(transcript) {

  let totalQuestions = 0;
  let answeredQuestions = 0;

  for (let i = 0; i < transcript.length - 1; i++) {

    const current = transcript[i];
    const next = transcript[i + 1];

    if (current.role === "ai" && next.role === "user") {

      totalQuestions++;

      // simple heuristic:
      if (next.content && next.content.trim().length > 20) {
        answeredQuestions++;
      }

    }

  }

  if (totalQuestions === 0) return 0;

  return Number(
    ((answeredQuestions / totalQuestions) * 100).toFixed(2)
  );
}