import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./state/provider";
import localFont from "next/font/local";

const inter = Inter({ subsets: ["latin"] });

const geistSans = localFont({
  src: "fonts/SpicyRice-Regular.ttf",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "HealthyTales",
  description: "Learn healhty habits :)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}><Providers>{children}</Providers></body>
    </html>
  );
}
