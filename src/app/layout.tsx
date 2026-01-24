import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GlobalPlayer from "@/components/player/GlobalPlayer";
import FullScreenPlayer from "@/components/player/FullScreenPlayer";
import PlaylistModal from "@/components/player/PlaylistModal";
import { AuthProvider } from "@/components/providers/SessionProvider";
import { ToastContainer } from "@/components/Toast";

import CommandPalette from "@/components/CommandPalette";
import CustomCursor from "@/components/common/CustomCursor";

export const metadata: Metadata = {
  title: "COREWAVE RECORDS | Where Artists and Sound Evolve",
  description: "Upload. Distribute. Stream. Experience music at its core.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <GlobalPlayer />
          <FullScreenPlayer />
          <PlaylistModal />
          <CommandPalette />
          <CustomCursor />
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
