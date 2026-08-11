import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BillProvider } from "@/components/BillProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "bill splitter",
  description: "scan a receipt, split the bill, settle up",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.className} flex flex-col min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <BillProvider>
              <Header />
              <main className="flex-1 w-full">{children}</main>
              <Toaster />
            </BillProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
