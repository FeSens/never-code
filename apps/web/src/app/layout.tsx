import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Never Code",
  description: "TypeScript fullstack app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
