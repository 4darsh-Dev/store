import { useState, useRef, useCallback, useEffect } from "react";
import { WEBSOCKET_URL } from "../utils/constants.js";
import { useRouter } from "next/navigation.js";
import { nav } from "framer-motion/client";
import { add, shoppingCartStore } from "@/store/shoppingCart";
import { addToCart, buyNow, navigateToProduct, navigateToSearch } from "@/components/utils/commandUtils.js";

export const useWebSocket = ({ onMessage, onTimestampUpdate, onResetTimestamps, timestamps, setTimestamps }) => {
  const [wsStatus, setWsStatus] = useState("disconnected");
  const wsRef = useRef(null);
  const router = useRouter();

  const connectWebSocket = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log("WebSocket already open.");
        setWsStatus("connected");
        resolve();
        return;
      }

      setWsStatus("connecting");
      const newWs = new WebSocket(WEBSOCKET_URL);

      const connectionTimeout = setTimeout(() => {
        newWs.close();
        reject(new Error("WebSocket connection timeout"));
      }, 10000);

      newWs.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log("WebSocket connection established.");
        setWsStatus("connected");
        resolve();
      };

      newWs.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error("WebSocket error:", error);
        setWsStatus("disconnected");
        newWs.close();
        reject(error);
      };

      newWs.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log("WebSocket connection closed:", event.code, event.reason);
        setWsStatus("disconnected");
        wsRef.current = null;
      };

      newWs.onmessage = async (event) => {
        try {
          let message;
          if (typeof event.data === "string") {
            message = JSON.parse(event.data);
          } else {
            message = event.data;
          }

          const now = performance.now();

          if (message.type === "utterance_start") {
            onTimestampUpdate("utteranceStart", now);
            console.log(`🎤 Utterance started at: ${now}ms`);
          } else if (message.type === "utterance_end") {
            onTimestampUpdate("utteranceEnd", now);
            console.log(`📝 STT completed at ${Date.now()}ms universal time`);
            onMessage?.(message);
          } else if (message.type === "llm_start") {
            onTimestampUpdate("llmStart", now);
            console.log(`🧠 LLM processing started at: ${now}ms`);
          } else if (message.type === "llm_complete") {
            onTimestampUpdate("llmEnd", now);
            console.log(`🧠 LLM completed`);
          } else if (message.type === "tts_start") {
            onTimestampUpdate("ttsStart", now);
            console.log(`🗣️ TTS processing started at: ${now}ms`);
          } else if (message.type === "audio_chunk") {
            // console.log(`🎵 Audio chunk received at: ${now}ms for task ${message.task_id}`);

            setTimestamps((prev) => {
              if (!prev.firstAudioChunk) {
                const ttsLatency = now - (prev.ttsStart || now);
                const totalResTime = now - (prev.utteranceEnd || now);
                console.log(
                  `🎵 First audio chunk in: ${ttsLatency.toFixed(2)}ms after ${totalResTime.toFixed(
                    2
                  )}ms of utterance end for task ${message.task_id} and at ${Date.now()}ms universal time`
                );
                return { ...prev, firstAudioChunk: now };
              }
              return { ...prev, lastAudioChunk: now };
            });
          } else if (message.type === "audio_interrupt") {
            console.log("🛑 Audio interrupt received");
            onResetTimestamps?.();
          } else if (message.type === "command") {
            console.log("🔄 got command message, type:", message.command);
            onResetTimestamps?.();
            if (message.command === "navigate_to_search") {
              console.log("Navigating to search page");
              // Implement navigation logic here
              const query = message.search_query || "";
              if (!query) {
                console.warn("No search query provided in command message.");
              }
              navigateToSearch(query, router, wsRef.current);
            } else if (message.command === "add_to_cart") {
              console.log("Adding to cart");
              // Implement add to cart logic here
              const product_id = message.product_id || "";
              const quantity = message.quantity || 1;
              if (!product_id) {
                console.warn("No product ID provided in command message.");
              }
              if (quantity <= 0) {
                console.warn("Invalid quantity provided in command message.");
              }
              addToCart(product_id, quantity, shoppingCartStore);
            } else if (message.command === "navigate_to_product") {
              console.log("Navigating to product page");
              // Implement navigation logic here
              const product_id = message.product_id || "";
              if (!product_id) {
                console.warn("No product ID provided in command message.");
              }
              navigateToProduct(product_id, router);
            } else if (message.command === "buy_now") {
              console.log("Navigating to checkout page");
              // Implement navigation logic here
              const product_id = message.product_id || "";
              const quantity = message.quantity || 1;
              if (!product_id) {
                console.warn("No product ID provided in command message.");
              }
              if (quantity <= 0) {
                console.warn("Invalid quantity provided in command message.");
              }
              buyNow(product_id, quantity, shoppingCartStore, router);
            }
          }
          onMessage?.(message);
        } catch (e) {
          console.error("WebSocket message error:", e);
        }
      };

      wsRef.current = newWs;
    });
  }, [onMessage, onTimestampUpdate, onResetTimestamps, setTimestamps, router]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      console.log("Disconnecting WebSocket...");
      wsRef.current.close();
      wsRef.current = null;
      setWsStatus("disconnected");
      console.log("WebSocket disconnected manually.");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    wsStatus,
    wsRef,
    connectWebSocket,
    disconnectWebSocket,
  };
};
