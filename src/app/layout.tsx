import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "まくろなねこNOTE",
    template: "%s | まくろなねこNOTE",
  },
  description:
    "総務・人事向け業務効率化ツールの紹介ブログ。現場で本当に使えるツールの選び方・活用法を発信しています。",
  metadataBase: new URL("https://kuroneconote.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
