import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AuthModalProvider } from "@/components/providers/AuthModalProvider";
import { Toaster } from "@/components/ui/sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CartProvider } from "@/components/providers/CartProvider";

/**
 * Fonts are CSS stacks (no next/font/google) so CI/build does not depend on
 * fetching Google Fonts at build time. Brand faces can be self-hosted later.
 */
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
      className={cn("h-full antialiased font-sans")}
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
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
