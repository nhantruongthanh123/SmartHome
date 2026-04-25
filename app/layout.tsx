import type { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react"

import "./globals.css";
import { ThemeProvider } from "next-themes";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
    title: {
        default: "Smart Home",
        template: "%s | Smart Home",
    },
    description: "A smart home management system built with Next.js and React.",
    keywords: ["Smart Home", "Smart Home System", "Smart Home Management System"],
    openGraph: {
        title: "Smart Home",
        description: "A smart home management system built with Next.js and React.",
        url: `${baseUrl}`,
        siteName: "Smart Home App",
        locale: "vi_VN",
        type: "website",
        phoneNumbers: "0987654321",
        countryName: "Việt Nam",
        images: [
            {
                url: `/screenshots/opengraph.png`,
                width: 1200,
                height: 630,
                alt: "Smart Home",
            },
        ]
    },
    icons: {
        icon: "/favicon.ico",
    },
    alternates: {
        canonical: `${baseUrl}`,
    },
    metadataBase: new URL(baseUrl),
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};

type RootLayoutProps = {
    children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="vi_VN" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <SessionProvider>
                    <ThemeProvider attribute="class" defaultTheme="light">
                        {children}
                    </ThemeProvider>
                </SessionProvider>
            </body>
        </html>
    );
}