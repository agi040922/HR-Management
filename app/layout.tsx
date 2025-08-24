'use client'

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SidebarLayout } from "@/components/(laytout)/sidebar-layout";
import { TutorialProvider } from "@/components/TutorialProvider";
import { usePathname } from "next/navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/landing';

  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {isLandingPage ? (
          children
        ) : (
          <TutorialProvider>
            <SidebarLayout>{children}</SidebarLayout>
          </TutorialProvider>
        )}
      </body>
    </html>
  );
}
