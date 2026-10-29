import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GeoCheckin",
  description:
    "Émargement autonome des volontaires Jambaar 26 au Stade Abdoulaye Wade.",
  applicationName: "GeoCheckin",
  appleWebApp: {
    capable: true,
    title: "GeoCheckin",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#00853f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
