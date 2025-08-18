export function base64ToArrayBuffer(base64) {
  const binaryData = atob(base64);
  const arrayBuffer = new ArrayBuffer(binaryData.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < binaryData.length; i++) uint8Array[i] = binaryData.charCodeAt(i);

  return arrayBuffer;
}

export const calculateLatencyMetrics = (timestamps) => {
  if (!timestamps.utteranceStart) return null;

  return {
    sttLatency: timestamps.utteranceEnd ? timestamps.utteranceEnd - timestamps.utteranceStart : 0,
    llmLatency: timestamps.llmEnd && timestamps.llmStart ? timestamps.llmEnd - timestamps.llmStart : 0,
    ttsLatency:
      timestamps.firstAudioChunk && timestamps.ttsStart ? timestamps.firstAudioChunk - timestamps.ttsStart : 0,
    totalLatency: timestamps.playbackStart ? timestamps.playbackStart - timestamps.utteranceStart : 0,
    e2eLatency: timestamps.playbackEnd ? timestamps.playbackEnd - timestamps.utteranceStart : 0,
  };
};

export const logMetrics = (metrics) => {
  console.log("📊 Performance Metrics:");
  console.log(`   STT Latency: ${metrics.sttLatency.toFixed(2)}ms`);
  console.log(`   LLM Latency: ${metrics.llmLatency.toFixed(2)}ms`);
  console.log(`   TTS Latency: ${metrics.ttsLatency.toFixed(2)}ms`);
  console.log(`   Total Latency: ${metrics.totalLatency.toFixed(2)}ms`);
  console.log(`   E2E Latency: ${metrics.e2eLatency.toFixed(2)}ms`);
};
