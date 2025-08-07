import { useState, useCallback } from "react";
import { INITIAL_TIMESTAMPS, INITIAL_METRICS } from "../utils/constants.js";
import { calculateLatencyMetrics, logMetrics } from "../utils/audioUtils.js";

export const usePerformanceMetrics = () => {
  const [timestamps, setTimestamps] = useState(INITIAL_TIMESTAMPS);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);

  const resetTimestamps = useCallback(() => {
    setTimestamps(INITIAL_TIMESTAMPS);
    setMetrics(INITIAL_METRICS);
    console.log("⏱️ Timestamps and metrics reset");
  }, []);

  const updateTimestamp = useCallback((key, value = performance.now()) => {
    setTimestamps((prev) => ({ ...prev, [key]: value }));
  }, []);

  const calculateMetrics = useCallback(() => {
    setTimestamps((prev) => {
      const newMetrics = calculateLatencyMetrics(prev);
      if (newMetrics) {
        logMetrics(newMetrics);
        setMetrics(newMetrics);
      }
      return prev;
    });
  }, []);

  return {
    timestamps,
    metrics,
    resetTimestamps,
    updateTimestamp,
    calculateMetrics,
    setTimestamps,
  };
};
