import { NavBar } from "@/components/nav-bar";
import { TRPCProvider } from "@/trpc/provider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Never Code",
  description: "TypeScript fullstack app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>
          <NavBar />
          <main>{children}</main>
        </TRPCProvider>
      </body>
    </html>
  );
}
