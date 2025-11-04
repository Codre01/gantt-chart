import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gantt Chart App",
  description: "A Gantt chart application built with Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
