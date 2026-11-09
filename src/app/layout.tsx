import type { Metadata } from "next";
import { Anton, Inter, JetBrains_Mono, Allura } from "next/font/google";
import "./globals.css";

const display = Anton({ variable: "--font-display-face", weight: "400", subsets: ["latin"] });
const sans = Inter({ variable: "--font-sans-face", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono-face", subsets: ["latin"] });
const script = Allura({ variable: "--font-script-face", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Paul Varghese Shibu — Mechanical Engineer",
  description:
    "Portfolio of Paul Varghese Shibu, Mechanical Engineering undergraduate at NIT Calicut: propulsion, CFD, aerial robotics and automation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} ${mono.variable} ${script.variable} antialiased`}>{children}</body>
    </html>
  );
}
