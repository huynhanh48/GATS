import "@/css/style.css";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import type { Metadata } from "next";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Toaster } from "sonner";
import { Providers } from "./providers";

const inter = localFont({
  src: "../fonts/Inter-Variable.ttf",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    template: "%s | GATS Academy Admin",
    default: "GATS Academy Admin",
  },
  description:
    "GATS Academy admin dashboard — courses, orders, users, and operations.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${inter.variable} font-sans antialiased`}
    >
      <body suppressHydrationWarning className="font-sans">
        <Providers>
          <NextTopLoader color="#5750F1" showSpinner={false} />

          {children}

          <Toaster
            position="bottom-right"
            richColors
            closeButton
            duration={5000}
            toastOptions={{
              className: "dark:bg-gray-dark dark:border-dark-3 dark:text-white",
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
