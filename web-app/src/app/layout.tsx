import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AuthModalProvider } from "@/components/providers/AuthModalProvider";
import { Toaster } from "@/components/ui/sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CartProvider } from "@/components/providers/CartProvider";

import { Outfit, Inter } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GATS Academy - Nền tảng đào tạo AI doanh nghiệp",
  description: "Giải pháp toàn diện của bạn để làm chủ công nghệ tương lai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={cn("h-full antialiased font-sans", outfit.variable, inter.variable)}
    >
      <body className="min-h-full flex flex-col bg-background font-sans" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
          >
            <AuthProvider>
              <AuthModalProvider>
                <CartProvider>
                  {children}
                  <Toaster />
                </CartProvider>
              </AuthModalProvider>
            </AuthProvider>
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
