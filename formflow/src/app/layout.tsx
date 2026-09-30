import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FormFlow — Drag-and-Drop No-Code Form Builder",
  description:
    "Create powerful forms, surveys and conditional workflows visually — without writing code. Free, open-source form builder for students, clubs, and hackathons.",
  keywords: [
    "form builder",
    "survey builder",
    "no-code",
    "drag and drop",
    "conditional logic",
    "webhooks",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
