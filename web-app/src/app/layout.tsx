import type { Metadata } from "next";
import "@/styles/global.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AuthModalProvider } from "@/components/providers/AuthModalProvider";
import { Toaster } from "@/components/ui/sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CartProvider } from "@/components/providers/CartProvider";

import { Exo, Open_Sans, Be_Vietnam_Pro } from "next/font/google";

/** Font body chính — dùng cho paragraph, label, button text */
const exo = Exo({
  subsets: ["latin", "vietnamese"],
  variable: "--font-exo",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

/** Font secondary — dùng cho caption, small text, description */
const openSans = Open_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-open-sans",
  display: "swap",
  weight: ["300", "400", "600", "700"],
});

/** Font heading — dùng cho H1, H2, H3, title nổi bật */
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
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
      className={cn("h-full antialiased font-sans", exo.variable, openSans.variable, beVietnamPro.variable)}
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
