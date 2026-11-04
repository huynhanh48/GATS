"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { VideoUploadHud } from "@/components/Layouts/video-upload-hud";
import { ThemeProvider } from "next-themes";
import { GoogleOAuthProvider } from "@react-oauth/google";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <ThemeProvider defaultTheme="light" attribute="class" enableSystem={false} storageKey="admin-theme">
        <SidebarProvider>
          {children}
          <VideoUploadHud />
        </SidebarProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
