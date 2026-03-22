import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BillProvider } from "@/components/BillProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

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
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <BillProvider>
              <Header />
              <main className="flex-1 flex flex-col items-center justify-center">
                {children}
              </main>
              <Toaster />
            </BillProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
