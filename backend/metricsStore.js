export const metrics = [];

export function addMetric(metric) {

  metrics.push(metric);

  // keep last 100 values only
  if (metrics.length > 100) {
    metrics.shift();
  }
}

export function getMetrics() {
  return metrics;
}