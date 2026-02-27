import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { AppThemeProvider } from "@/context/ThemeContext";
import { QueryProvider } from "@/context/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#1a237e",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "GovForm Optimizer | Image & PDF Compressor for SSC, UPSC, Govt Exams",
  description: "Precision image and PDF size optimizer for Indian government job applications. Compressed files to exact KB (50KB, 100KB) for SSC, UPSC, and more with 100% privacy.",
  keywords: "image compressor, pdf compressor, ssc image resize, upsc photo resize, gov form photo tool, india govt exam photo optimizer",
  openGraph: {
    title: "GovForm Optimizer | Precise Image & PDF Compressor",
    description: "Fast, private image and PDF compression for government forms.",
    type: "website",
    locale: "en_IN",
    siteName: "GovForm Optimizer",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <QueryProvider>
            <AppThemeProvider>
              {children}
            </AppThemeProvider>
          </QueryProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

