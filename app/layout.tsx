import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";

import { DevServiceWorkerCleanup } from "@/components/DevServiceWorkerCleanup";
import "./globals.css";

const heebo = Heebo({ subsets: ["hebrew", "latin"] });

const APP_NAME = "מעקב הוצאות";
const APP_DESCRIPTION = "עקבו אחר ההוצאות שלכם עם סיכומים חודשיים והתראות תקציב";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#061912",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.className} bg-gradient-to-br from-olive-950 via-olive-900 to-olive-950 min-h-screen text-white/95 antialiased bg-fixed`}>
        <DevServiceWorkerCleanup />
        {children}
      </body>
    </html>
  );
}
