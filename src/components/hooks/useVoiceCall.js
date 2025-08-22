"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useWebSocket } from "./useWebSocket.js";
import { useAudioRecording } from "./useAudioRecording.js";
import { useAudioPlayback } from "./useAudioPlayback.js";
import { usePerformanceMetrics } from "./usePerformanceMetrics.js";

export const useVoiceCall = () => {
  const [callStatus, setCallStatus] = useState("idle");
  const [sttTranscript, setSttTranscript] = useState("");
  const { timestamps, metrics, resetTimestamps, updateTimestamp, calculateMetrics, setTimestamps } =
    usePerformanceMetrics();

  const { interruptAudio, setupAudio, playPCMChunk, base64PCMToFloat32, disconnectAudio } = useAudioPlayback();

  const handleWebSocketMessage = useCallback(
    async (message) => {
      if (message.type === "utterance_end") {
        setSttTranscript(message.response);
      } else if (message.type === "audio_chunk" && message.data) {
        playPCMChunk(base64PCMToFloat32(message.data));
      } else if (message.type === "audio_interrupt") {
        interruptAudio();
        console.log("🛑 Audio interrupt received");
        // stopCurrentAudio();
      }
    },
    [playPCMChunk, base64PCMToFloat32, interruptAudio]
  );

  const handleFirstAudioChunk = useCallback(
    (timestamp) => {
      setTimestamps((prev) => {
        if (!prev.firstAudioChunk) {
          const ttsLatency = timestamp - (prev.ttsStart || timestamp);
          console.log(`🎵 First audio chunk in: ${ttsLatency.toFixed(2)}ms`);
          return { ...prev, firstAudioChunk: timestamp };
        }
        return prev;
      });
    },
    [setTimestamps]
  );

  const { wsStatus, wsRef, connectWebSocket, disconnectWebSocket } = useWebSocket({
    onMessage: handleWebSocketMessage,
    onTimestampUpdate: updateTimestamp,
    onResetTimestamps: resetTimestamps,
    timestamps: timestamps,
    setTimestamps: setTimestamps,
  });

  const { micStatus, recordingStatus, startRecording, stopRecording } = useAudioRecording();

  useEffect(() => {
    // console.log(isAiSpeaking, "ai speak");
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "audio_playback_end",
        })
      );
      console.log("Sent audio_playback_end signal to backend.");
    }
  }, [wsRef]);

  const startCall = useCallback(async () => {
    if (callStatus === "connecting" || callStatus === "connected") {
      console.warn("Call is already in progress or connecting.");
      return;
    }

    setCallStatus("connecting");

    try {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.log("Connecting to WebSocket...");
        await connectWebSocket();
        console.log("WebSocket connected successfully!");
      }

      if (recordingStatus !== "recording") {
        console.log("Starting recording...");
        await startRecording(wsRef.current);
      }
      await setupAudio();
      setCallStatus("connected");
      console.log("Call started successfully!");
      return true;
    } catch (error) {
      console.error("Failed to start call:", error);
      setCallStatus("idle");
      alert(`Failed to start call: ${error.message}`);
      return false;
    }
  }, [callStatus, wsRef, connectWebSocket, recordingStatus, startRecording]);

  const stopCall = useCallback(async () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      disconnectWebSocket();
    } else {
      console.log("WebSocket is not connected, call might have been already stopped.");
    }
    if (recordingStatus === "recording") {
      console.log("Stopping recording...");
      stopRecording();
    }
    if (callStatus !== "idle") {
      setCallStatus("idle");
    }
    disconnectAudio();
    console.log("Call stopped successfully!");
  }, [wsRef, stopRecording, disconnectWebSocket, recordingStatus, callStatus, disconnectAudio]);

  return {
    // States
    callStatus,
    wsStatus,
    micStatus,
    recordingStatus,
    sttTranscript,
    timestamps,
    metrics,

    // Actions
    startCall,
    stopCall,
    resetTimestamps,

    // WebSocket
    wsRef,
  };
};
