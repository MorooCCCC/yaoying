import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "爻影 Yao-Vision — 六爻占卜",
  description: "新中式极简 AI 六爻占卜 · 摄像头手部捕捉摇卦 · LLM 深度解析",
  keywords: "六爻,占卜,易经,AI,卦象,周易,在线占卜",
  openGraph: {
    title: "爻影 Yao-Vision",
    description: "以手摇卦，以智解象 — 六爻感知天地之机",
    type: "website",
    locale: "zh_CN",
  },
  icons: {
    // SVG Favicon：天青色阴阳鱼
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>☯</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0e0e16",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <head>
        {/* Google Fonts 预连接 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* 思源宋体 + 思源黑体，按需加载字重 */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500;700&family=Noto+Sans+SC:wght@300;400;500&display=swap"
          rel="stylesheet"
        />

        {/* MediaPipe Hands（摇卦手势识别） */}
        <script
          src="https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/hands.js"
          crossOrigin="anonymous"
          async
          defer
        />
        <script
          src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1632090044/camera_utils.js"
          crossOrigin="anonymous"
          async
          defer
        />
      </head>
      <body className="bg-ink-gradient min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
