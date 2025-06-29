import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BillProvider } from "@/components/BillProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "title",
  description: "description",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} flex flex-col items-center justify-center min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <BillProvider>{children}</BillProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
