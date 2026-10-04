import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RC Portfolio",
    template: "%s · RC Portfolio", // e.g. "Admin Dashboard · RC Portfolio"
  },
  description:
    "Ramon Carlo Evidente — Full Stack Developer in Toronto. Projects, skills and experience.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
