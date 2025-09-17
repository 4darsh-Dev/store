"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/shared/components/UI/button";
import { cn } from "@/shared/utils/styling";

const PAYMENT_TIME = 300; // seconds (5 minutes)

const PaymentPage = () => {
  const [secondsLeft, setSecondsLeft] = useState(PAYMENT_TIME);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="mt-[90px] bg-white min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8 flex flex-col items-center">
        <h1 className="text-2xl font-light text-gray-900 mb-2">
          Pay to <span className="font-semibold">Solve Ease</span>
        </h1>
        <div className="text-gray-600 mb-6">Scan the QR code below to complete your payment.</div>
        <div className="flex flex-col items-center gap-4 mb-6">
          {/* Dummy QR code */}
          <div className="bg-gray-200 rounded-lg p-4">
            <Image
              src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=solveease@upi&pn=SolveEase&am=100"
              alt="Payment QR"
              width={180}
              height={180}
              className="rounded"
            />
          </div>
          <div className="text-gray-700 text-lg">
            <span className="font-semibold">UPI ID:</span> solveease@upi
          </div>
        </div>
        <div className="mb-6">
          <span className="text-gray-600">Time left to pay: </span>
          <span className={cn("font-mono text-lg", secondsLeft < 30 && "text-red-600")}>
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>
        <Link
          className="w-full text-base font-semibold text-white bg-green-600 hover:bg-green-700 mb-2 flex justify-center rounded-md p-1"
          href="/order_summary"
        >
          I&apos;ve Paid
        </Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 mt-2">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PaymentPage;
