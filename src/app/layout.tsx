import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import dynamic from "next/dynamic";

// Dynamically import ChatbotMain with SSR disabled
const ChatbotMain = dynamic(() => import("@/components/Chatbot/ChatbotMain"), {
  ssr: false,
});

const outfitFont = localFont({
  src: "../assets/fonts/Outfit-VariableFont.ttf",
  fallback: ["sans-serif", "system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "BITEX",
  description: "Electronic Shop",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfitFont.className}>
        {children}
        <ChatbotMain />
      </body>
    </html>
  );
}
