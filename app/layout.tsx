import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "RUN IN ONE — 국내 러닝 통합 플랫폼",
  description: "대회 정보, 커뮤니티, 트레이닝, 러닝 스토어까지 — 달리는 사람들의 모든 것",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0f0f0f] text-white`}
      >
        <Navbar />
        {/* 데스크탑: 상단 nav 높이만큼 padding, 모바일: 하단 tab bar 높이만큼 padding */}
        <main className="md:pt-14 pb-16 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  );
}
