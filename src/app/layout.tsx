import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BillProvider } from "@/components/BillProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import { Toaster } from "@/components/ui/sonner";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "bill splitter",
  description: "scan a receipt, split the bill, settle up",
  applicationName: "bill splitter",
  appleWebApp: {
    capable: true,
    title: "billsplit",
    // "default" keeps iOS reserving the status bar area, so the header isn't
    // drawn underneath it.
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2e1f52" },
    { media: "(prefers-color-scheme: dark)", color: "#1e2030" },
  ],
  // Keeps the installed app from bouncing when the on-screen keyboard opens.
  viewportFit: "cover",
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
              <ServiceWorkerRegistrar />
            </BillProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
