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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&family=Merriweather:wght@400;700&family=Montserrat:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
