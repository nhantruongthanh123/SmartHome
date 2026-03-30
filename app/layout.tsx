import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react"

import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Home",
  description: "A smart home management system built with Next.js and React.",
};

type RootLayoutProps = {
    children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <SessionProvider>
                    {children}
                </SessionProvider>
            </body>
        </html>
    );
}