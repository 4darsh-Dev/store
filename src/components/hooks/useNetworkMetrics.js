"use client";
import { useState, useEffect, useCallback, useRef } from "react";

export function useNetworkMetrics() {
  const [isOnline, setIsOnline] = useState(true);
  const [networkInfo, setNetworkInfo] = useState({
    effectiveType: "unknown",
    downlink: 0,
    rtt: 0,
    saveData: false,
    type: "unknown",
  });
  const [connectionQuality, setConnectionQuality] = useState("good");
  const lastUpdateRef = useRef(Date.now());

  // Get initial network information
  const getNetworkInfo = useCallback(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection) {
      return {
        effectiveType: connection.effectiveType || "unknown",
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false,
        type: connection.type || "unknown",
      };
    }

    return {
      effectiveType: "unknown",
      downlink: 0,
      rtt: 0,
      saveData: false,
      type: "unknown",
    };
  }, []);

  // Determine connection quality based on metrics
  const getConnectionQuality = useCallback((info) => {
    if (!navigator.onLine) return "offline";

    // Based on effective connection type
    if (info.effectiveType === "4g" && info.downlink > 5 && info.rtt < 100) {
      return "excellent";
    } else if (info.effectiveType === "4g" || (info.downlink > 2 && info.rtt < 200)) {
      return "good";
    } else if (info.effectiveType === "3g" || (info.downlink > 0.5 && info.rtt < 500)) {
      return "fair";
    } else if (info.effectiveType === "2g" || info.downlink > 0) {
      return "poor";
    } else {
      return "unknown";
    }
  }, []);

  // Update network metrics
  const updateNetworkMetrics = useCallback(() => {
    const now = Date.now();
    // Throttle updates to avoid excessive calls
    if (now - lastUpdateRef.current < 1000) return;

    lastUpdateRef.current = now;

    const isCurrentlyOnline = navigator.onLine;
    const info = getNetworkInfo();
    const quality = getConnectionQuality(info);

    setIsOnline(isCurrentlyOnline);
    setNetworkInfo(info);
    setConnectionQuality(quality);

    console.log("[NetworkMetrics] Updated:", {
      online: isCurrentlyOnline,
      quality,
      ...info,
    });
  }, [getNetworkInfo, getConnectionQuality]);

  // Test actual connectivity (more reliable than navigator.onLine)
  const testConnectivity = useCallback(async () => {
    try {
      // Try to fetch a small resource with cache busting
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("/favicon.ico?t=" + Date.now(), {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-cache",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      console.log("[NetworkMetrics] Connectivity test failed:", error.message);
      return false;
    }
  }, []);

  // Get network speed estimate
  const getNetworkSpeed = useCallback(async () => {
    if (!isOnline) return { downloadSpeed: 0, latency: 0 };

    try {
      const startTime = performance.now();
      const response = await fetch("/favicon.ico?t=" + Date.now(), {
        cache: "no-cache",
      });
      const endTime = performance.now();

      if (response.ok) {
        const latency = endTime - startTime;
        const contentLength = response.headers.get("content-length");
        const downloadSpeed = contentLength
          ? (contentLength * 8) / (latency / 1000) / 1000 // kbps
          : networkInfo.downlink * 1000; // fallback to connection API

        return {
          downloadSpeed: Math.round(downloadSpeed),
          latency: Math.round(latency),
        };
      }
    } catch (error) {
      console.log("[NetworkMetrics] Speed test failed:", error.message);
    }

    return {
      downloadSpeed: networkInfo.downlink * 1000,
      latency: networkInfo.rtt,
    };
  }, [isOnline, networkInfo]);

  // Setup event listeners
  useEffect(() => {
    // Initialize
    updateNetworkMetrics();

    // Online/offline events
    const handleOnline = () => {
      console.log("[NetworkMetrics] Came online");
      updateNetworkMetrics();
    };

    const handleOffline = () => {
      console.log("[NetworkMetrics] Went offline");
      setIsOnline(false);
      setConnectionQuality("offline");
    };

    // Network information change events
    const handleNetworkChange = () => {
      console.log("[NetworkMetrics] Network changed");
      updateNetworkMetrics();
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Network Information API change listener
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection) {
      connection.addEventListener("change", handleNetworkChange);
    }

    // Periodic check for connection quality
    const interval = setInterval(updateNetworkMetrics, 30000); // Every 30 seconds

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);

      if (connection) {
        connection.removeEventListener("change", handleNetworkChange);
      }

      clearInterval(interval);
    };
  }, [updateNetworkMetrics]);

  // Return network metrics and utilities
  return {
    isOnline,
    networkInfo,
    connectionQuality,
    testConnectivity,
    getNetworkSpeed,
    updateMetrics: updateNetworkMetrics,

    // Convenience getters
    get isGoodConnection() {
      return ["excellent", "good"].includes(connectionQuality);
    },

    get isMobile() {
      return ["cellular", "2g", "3g", "4g", "5g"].includes(networkInfo.type);
    },

    get shouldOptimize() {
      return networkInfo.saveData || ["poor", "fair"].includes(connectionQuality);
    },
  };
}
