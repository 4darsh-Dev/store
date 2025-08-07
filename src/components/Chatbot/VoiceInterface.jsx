"use client";
import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import { ANIMATION_CONFIG } from "../utils/constants.js";

export const VoiceInterface = ({ onStartCall, onStopCall, wsStatus, stage: externalStage, wsRef }) => {
  const [stage, setStage] = useState(externalStage || "idle");
  const [greetingSent, setGreetingSent] = useState(false);
  const controls = useAnimation();
  const overlayControls = useAnimation();
  const backgroundControls = useAnimation();

  // ✅ Start heart beat animation when component mounts and stage is idle
  useEffect(() => {
    if (stage === "idle") {
      controls.start("heartbeat");
    }
    if (stage === "done" && !greetingSent) {
      if (wsRef && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log("Sending greeting message to backend...");
        wsRef.current.send(JSON.stringify({ type: "greeting", message: "Hello!" }));
      }
      setGreetingSent(true);
    }
  }, [stage, controls]);

  useEffect(() => {
    if (wsStatus === "disconnected") {
      handleStopCall();
    }
  }, [wsStatus]);
  const animationStart = async () => {
    setStage("animating");

    const circleAnimation = controls.start("scaleDown").then(() => controls.start("expand"));
    const backgroundAnimation = backgroundControls.start("scaleDown");

    setTimeout(async () => {
      await backgroundControls.start("comeToFront");
      await overlayControls.start("reveal");
      setStage("done");
    }, ANIMATION_CONFIG.BACKGROUND_REVEAL_DELAY);
  };

  const handleStartCall = async () => {
    const success = await onStartCall();
    if (success && stage === "idle") {
      animationStart();
    }
  };
  const handleStopCall = async () => {
    onStopCall();
    setStage("idle");
    controls.start("initial");
    backgroundControls.start("normal");
    overlayControls.start("hidden");
    setGreetingSent(false);
  };
  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Main Background Content */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial="normal"
        animate={backgroundControls}
        variants={{
          normal: {
            zIndex: 0,
            clipPath: "circle(50% at 50% 50%)",
          },
          scaleDown: {
            zIndex: 0,
            clipPath: "circle(0% at 50% 50%)",
            transition: {
              duration: 1,
              ease: "easeInOut",
              delay: 0,
            },
          },
          comeToFront: {
            zIndex: 30,
            clipPath: "circle(100% at 50% 50%)",
            transition: {
              duration: 1,
              ease: "easeOut",
            },
          },
        }}
      >
        {stage === "idle" ? (
          <div className="absolute inset-0" />
        ) : (
          <div className="absolute inset-0">
            {/* Animated SVG Wave */}
            <svg
              className="absolute bottom-0 left-0 w-full h-full"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
              style={{ zIndex: 1 }}
            >
              <defs>
                <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#43e97b" />
                  <stop offset="50%" stopColor="#38f9d7" />
                  <stop offset="100%" stopColor="#1e90ff" />
                </linearGradient>
              </defs>
              <path
                d="M0,160L60,165.3C120,171,240,181,360,186.7C480,192,600,192,720,186.7C840,181,960,171,1080,154.7C1200,139,1320,117,1380,106.7L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
                fill="url(#waveGradient)"
              >
                <animate
                  attributeName="d"
                  dur="4s"
                  repeatCount="indefinite"
                  values="
              M0,160L60,165.3C120,171,240,181,360,186.7C480,192,600,192,720,186.7C840,181,960,171,1080,154.7C1200,139,1320,117,1380,106.7L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z;
              M0,180L60,185.3C120,191,240,201,360,206.7C480,212,600,212,720,206.7C840,201,960,191,1080,174.7C1200,159,1320,137,1380,126.7L1440,116L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z;
              M0,160L60,165.3C120,171,240,181,360,186.7C480,192,600,192,720,186.7C840,181,960,171,1080,154.7C1200,139,1320,117,1380,106.7L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z
            "
                />
              </path>
            </svg>
          </div>
        )}

        <div className="absolute inset-0 bg-transparent " />

        <div className="text-center text-white z-10 relative">
          <div
            className="h-70 w-70 cursor-pointer"
            onClick={wsStatus === "connected" ? handleStopCall : handleStartCall}
          >
            <Image src="/csr-mandala-removebg-preview.png" alt="Description" layout="fill" objectFit="cover" />
          </div>
        </div>
      </motion.div>

      {/* Overlay Animation */}
      {stage !== "done" && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-transparent"
          // initial='hidden'
          // animate={overlayControls}
          // variants={{
          //   hidden: { backgroundColor: '#000' },
          //   reveal: {
          //     backgroundColor: '#000',
          //     transition: {
          //       duration: 0.5,
          //       ease: 'easeOut'
          //     }
          //   }
          // }}
        >
          <motion.div
            style={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 50%, #1e90ff 100%)",
            }}
            className="rounded-full h-15 w-15 cursor-pointer z-20"
            initial="initial"
            animate={controls}
            variants={{
              initial: { scale: 1 },
              // ✅ Heart beating animation
              heartbeat: {
                scale: [1, 1.15, 1, 1.3, 1],
                transition: {
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "loop",
                  times: [0, 0.1, 0.2, 0.4, 1],
                },
              },
              scaleDown: {
                scale: 0.3,
                transition: {
                  duration: ANIMATION_CONFIG.CIRCLE_SCALE_DOWN_DURATION,
                },
              },
              expand: {
                scale: 60,
                borderRadius: "0%",
                transition: {
                  duration: ANIMATION_CONFIG.CIRCLE_EXPAND_DURATION,
                  ease: "easeInOut",
                },
              },
            }}
            onClick={stage === "idle" ? handleStartCall : undefined}
          />
        </div>
      )}
    </div>
  );
};
