import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/themeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ConvoAI – Modern AI Chat Platform",
  description: "ConvoAI is a sleek, fast, and modern AI chat app built with Next.js, supporting multi-model AI conversations, chat history, and a responsive user interface.",
  openGraph: {
    title: "ConvoAI – Modern AI Chat Platform",
    description: "ConvoAI is a sleek, fast, and modern AI chat app built with Next.js, supporting multi-model AI conversations, chat history, and a responsive user interface.",
    siteName: "ConvoAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ConvoAI – Modern AI Chat Platform",
    description: "ConvoAI is a sleek, fast, and modern AI chat app built with Next.js, supporting multi-model AI conversations, chat history, and a responsive user interface.",
    creator: "@ConvoAI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider 
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
