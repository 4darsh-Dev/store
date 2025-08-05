export const convertAudioDataToBlob = (audioData) => {
  if (typeof audioData === 'string') {
    // If it's base64 string
    const binaryString = atob(audioData)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return new Blob([bytes], { type: 'audio/mp3' })
  } else if (audioData instanceof ArrayBuffer) {
    // If it's already ArrayBuffer
    return new Blob([audioData], { type: 'audio/mp3' })
  } else {
    // If it's already a Blob
    return audioData
  }
}

export const calculateLatencyMetrics = (timestamps) => {
  if (!timestamps.utteranceStart) return null

  return {
    sttLatency: timestamps.utteranceEnd
      ? timestamps.utteranceEnd - timestamps.utteranceStart
      : 0,
    llmLatency:
      timestamps.llmEnd && timestamps.llmStart
        ? timestamps.llmEnd - timestamps.llmStart
        : 0,
    ttsLatency:
      timestamps.firstAudioChunk && timestamps.ttsStart
        ? timestamps.firstAudioChunk - timestamps.ttsStart
        : 0,
    totalLatency: timestamps.playbackStart
      ? timestamps.playbackStart - timestamps.utteranceStart
      : 0,
    e2eLatency: timestamps.playbackEnd
      ? timestamps.playbackEnd - timestamps.utteranceStart
      : 0
  }
}

export const logMetrics = (metrics) => {
  console.log('📊 Performance Metrics:')
  console.log(`   STT Latency: ${metrics.sttLatency.toFixed(2)}ms`)
  console.log(`   LLM Latency: ${metrics.llmLatency.toFixed(2)}ms`)
  console.log(`   TTS Latency: ${metrics.ttsLatency.toFixed(2)}ms`)
  console.log(`   Total Latency: ${metrics.totalLatency.toFixed(2)}ms`)
  console.log(`   E2E Latency: ${metrics.e2eLatency.toFixed(2)}ms`)
}
