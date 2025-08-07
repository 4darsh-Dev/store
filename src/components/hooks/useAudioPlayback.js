import { useRef, useCallback, useState } from "react";
import { convertAudioDataToBlob } from "../utils/audioUtils.js";

export const useAudioPlayback = ({ onTimestampUpdate, onCalculateMetrics }) => {
  const audioContextRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingAudioRef = useRef(false);
  const currentAudioRef = useRef(null);
  const audioSourceRef = useRef(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  const stopCurrentAudio = useCallback(() => {
    console.log("🛑 Stopping current audio playback...");

    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
        console.log("✅ Web Audio source stopped");
      } catch (e) {
        console.log("⚠️ Audio source already stopped");
      }
    }

    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
        console.log("✅ HTML5 audio stopped");
      } catch (e) {
        console.log("⚠️ HTML5 audio already stopped");
      }
    }

    const queueLength = audioQueueRef.current.length;
    audioQueueRef.current = [];
    isPlayingAudioRef.current = false;

    console.log(`🧹 Cleared ${queueLength} queued audio chunks`);
  }, []);

  const playNextAudioChunk = useCallback(async () => {
    if (audioQueueRef.current.length === 0 || isPlayingAudioRef.current) {
      isPlayingAudioRef.current = false;
      return;
    }

    const now = performance.now();

    // Mark playback start for first chunk
    onTimestampUpdate?.("playbackStart", now);
    setIsAiSpeaking(true);
    isPlayingAudioRef.current = true;
    const audioBlob = audioQueueRef.current.shift();

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);

      audioSourceRef.current = source;

      source.onended = () => {
        audioSourceRef.current = null;
        isPlayingAudioRef.current = false;

        if (audioQueueRef.current.length > 0) {
          playNextAudioChunk();
        } else {
          const endTime = performance.now();
          onTimestampUpdate?.("playbackEnd", endTime);
          onCalculateMetrics?.();
          setIsAiSpeaking(false);
        }
      };

      source.start(0);
    } catch (e) {
      console.error("Audio playback error:", e);
      audioSourceRef.current = null;
      isPlayingAudioRef.current = false;

      if (audioQueueRef.current.length > 0) {
        playNextAudioChunk();
      }
    }
  }, [onTimestampUpdate, onCalculateMetrics]);

  const playMP3AudioChunk = useCallback(
    async (audioData) => {
      try {
        const audioBlob = convertAudioDataToBlob(audioData);
        audioQueueRef.current.push(audioBlob);

        if (!isPlayingAudioRef.current) {
          playNextAudioChunk();
        }
      } catch (error) {
        console.error("Error processing MP3 audio chunk:", error);
      }
    },
    [playNextAudioChunk]
  );

  return {
    stopCurrentAudio,
    playMP3AudioChunk,
    audioQueueRef,
    isPlayingAudioRef,
    isAiSpeaking,
  };
};
