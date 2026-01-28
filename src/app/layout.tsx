import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "FastCampaign - 위치기반 실시간 리뷰 캠페인",
    template: "%s | FastCampaign",
  },
  description:
    "내 주변 리뷰 캠페인을 찾아 참여하고 혜택을 받으세요. 사업주는 쉽게 리뷰 캠페인을 만들고 관리할 수 있습니다.",
  keywords: ["리뷰 캠페인", "체험단", "인스타그램 리뷰", "네이버 블로그", "매장 마케팅"],
  authors: [{ name: "FastCampaign" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "FastCampaign",
    title: "FastCampaign - 위치기반 실시간 리뷰 캠페인",
    description: "내 주변 리뷰 캠페인을 찾아 참여하고 혜택을 받으세요.",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

import { AuthProvider } from "@/components/providers/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Naver Map SDK */}
        <script
          type="text/javascript"
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}&submodules=geocoder`}
          defer
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-dvh bg-background text-foreground antialiased transition-colors duration-300">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
