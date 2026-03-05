import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SaveHalaly - Kids Savings Platform",
  description:
    "A fun, gamified savings platform for kids to learn money management the halal way",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <main className="max-w-md mx-auto min-h-screen pb-20">
          {children}
        </main>
        <Navbar />
      </body>
    </html>
  );
}
