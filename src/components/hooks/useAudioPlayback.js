"use client";
import { useRef, useEffect, useCallback, useState } from "react";

export function useAudioPlayback() {
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);
  const chunkQueue = useRef([]);
  const isPlaying = useRef(false);
  const isWorkletConnected = useRef(false);

  // Function to create and connect the AudioContext and WorkletNode
  const setupAudio = useCallback(async () => {
    if (audioContextRef.current) {
      return;
    }

    const ctx = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 24000,
    });
    audioContextRef.current = ctx;

    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    console.log("[AudioPlayback] Created and resumed AudioContext.");

    try {
      await ctx.audioWorklet.addModule("/pcm-player-processor.js");
      workletNodeRef.current = new window.AudioWorkletNode(ctx, "pcm-player-processor");
      workletNodeRef.current.connect(ctx.destination);
      isWorkletConnected.current = true;
      console.log("[AudioPlayback] AudioWorkletNode created and connected.");

      // Set up the message handler for backpressure
      workletNodeRef.current.port.onmessage = (event) => {
        if (event.data && event.data.bufferSpaceAvailable) {
          sendNextChunk();
        }
      };
    } catch (e) {
      console.error("[AudioPlayback] Error setting up AudioWorklet:", e);
      isWorkletConnected.current = false; // Add this line
      // Clean up on error
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null; // Add this line
      }
    }
  }, []);

  // Function to send the next chunk from the queue
  const sendNextChunk = () => {
    // Add connection check
    if (!isWorkletConnected.current || !workletNodeRef.current) {
      console.warn("[AudioPlayback] Cannot send chunk - worklet not connected.");
      isPlaying.current = false;
      return;
    }

    if (chunkQueue.current.length > 0) {
      const nextChunk = chunkQueue.current.shift();
      workletNodeRef.current.port.postMessage({ samples: nextChunk });
    } else {
      isPlaying.current = false;
      // console.log("[AudioPlayback] Playback finished.");
    }
  };

  const interruptAudio = async () => {
    if (workletNodeRef.current && audioContextRef.current && isWorkletConnected.current) {
      // Disconnect completely
      workletNodeRef.current.disconnect();
      isWorkletConnected.current = false;
      // Clear remaining chunks
      chunkQueue.current = [];
      isPlaying.current = false;
      console.log("[AudioPlayback] Audio interrupted - disconnected and queue cleared.");

      // Auto-reconnect for next turn
      try {
        workletNodeRef.current.connect(audioContextRef.current.destination);
        isWorkletConnected.current = true;
        console.log("[AudioPlayback] Audio automatically reconnected for next turn.");
      } catch (e) {
        console.error("[AudioPlayback] Error auto-reconnecting worklet:", e);
        // If reconnection fails, setup audio from scratch
        await setupAudio();
      }
    }
  };

  const resumeAfterInterrupt = () => {
    if (workletNodeRef.current && audioContextRef.current && !isWorkletConnected.current) {
      try {
        // Reconnect for next conversation turn
        workletNodeRef.current.connect(audioContextRef.current.destination);
        isWorkletConnected.current = true; // Fix: Update connection status
        console.log("[AudioPlayback] Audio reconnected for next turn.");
        return true;
      } catch (e) {
        console.error("[AudioPlayback] Error reconnecting worklet:", e);
        isWorkletConnected.current = false;
        return false;
      }
    }
    return isWorkletConnected.current;
  };

  useEffect(() => {
    return () => {
      console.log("[AudioPlayback] Cleanup on unmount.");
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
        workletNodeRef.current = null;
        isWorkletConnected.current = false; // Add this line
      }
    };
  }, []);

  // Call this with Float32Array PCM samples (range -1 to 1)
  const playPCMChunk = (pcmFloat32Array) => {
    if (!audioContextRef.current || !workletNodeRef.current) {
      console.warn("[AudioPlayback] Audio setup is not ready.");
      return;
    }

    // Check connection status but don't auto-reconnect
    if (!isWorkletConnected.current) {
      console.warn("[AudioPlayback] Worklet is not connected. Call resumeAfterInterrupt() first.");
      return;
    }

    if (!(pcmFloat32Array instanceof Float32Array)) {
      console.warn("[AudioPlayback] Invalid input: not a Float32Array.");
      return;
    }
    // Split the large array into smaller chunks
    const chunkSize = 4096;
    for (let i = 0; i < pcmFloat32Array.length; i += chunkSize) {
      const chunk = pcmFloat32Array.subarray(i, i + chunkSize);
      chunkQueue.current.push(chunk);
    }

    // If playback is not active, start the process
    if (!isPlaying.current) {
      isPlaying.current = true;
      sendNextChunk();
    }
  };

  // Utility: Convert Int16 PCM to Float32 PCM
  const int16ToFloat32 = (int16Array) => {
    const float32 = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32[i] = int16Array[i] / 32768;
    }
    // console.log("[AudioPlayback] Converted Int16Array to Float32Array of length:", float32.length);
    return float32;
  };

  // Utility: Convert base64 PCM to Float32 PCM
  const base64PCMToFloat32 = (base64) => {
    const binary = atob(base64);
    const len = binary.length / 2;
    const int16 = new Int16Array(len);
    for (let i = 0; i < len; i++) {
      int16[i] = (binary.charCodeAt(i * 2 + 1) << 8) | binary.charCodeAt(i * 2);
    }
    // console.log("[AudioPlayback] Decoded base64 to Int16Array of length:", int16.length);
    return int16ToFloat32(int16);
  };

  return { interruptAudio, setupAudio, playPCMChunk, int16ToFloat32, base64PCMToFloat32 };
}
