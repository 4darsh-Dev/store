// export const WEBSOCKET_URL ='wss://csr-backend-gtadhjfuhkgqcahb.centralindia-01.azurewebsites.net/ws/audio'
// export const WEBSOCKET_URL = "ws://43.204.28.185/ws/audio";
export const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL

export const AUDIO_CONFIG = {
  RECORDING: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  MEDIA_RECORDER: {
    mimeType: "audio/webm; codecs=opus",
    audioBitsPerSecond: 16000,
  },
  CHUNK_INTERVAL: 100,
};

export const ANIMATION_CONFIG = {
  CIRCLE_SCALE_DOWN_DURATION: 0.2,
  CIRCLE_EXPAND_DURATION: 1.3,
  BACKGROUND_REVEAL_DELAY: 800,
};

export const INITIAL_TIMESTAMPS = {
  utteranceStart: null,
  utteranceEnd: null,
  llmStart: null,
  llmEnd: null,
  ttsStart: null,
  firstAudioChunk: null,
  lastAudioChunk: null,
  playbackStart: null,
  playbackEnd: null,
};

export const INITIAL_METRICS = {
  sttLatency: 0,
  llmLatency: 0,
  ttsLatency: 0,
  totalLatency: 0,
  e2eLatency: 0,
};
