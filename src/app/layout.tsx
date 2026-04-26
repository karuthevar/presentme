import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Present.AI — Turn Your Profile Into Stunning Slides",
  description:
    "Upload your resume, paste a LinkedIn or GitHub URL, and get high-impact presentation slides in seconds. Perfect for job seekers, students, and professionals.",
  keywords: [
    "presentation generator",
    "resume slides",
    "AI presentation",
    "LinkedIn to slides",
    "portfolio presentation",
  ],
  openGraph: {
    title: "Present.AI",
    description: "Turn your profile into stunning slides instantly",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gray-950 text-white antialiased">{children}</body>
    </html>
  );
}
