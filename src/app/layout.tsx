import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cuzzo's Options Terminal",
  description: "Dashboard for evaluating long-dated calls and LEAPS."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
