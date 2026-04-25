import type { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react"

import "./globals.css";
import { ThemeProvider } from "next-themes";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: {
        default: "Smart Home - Advanced IoT Dashboard",
        template: "%s | Smart Home",
    },
    description: "Manage and monitor your smart home devices in real-time with our advanced IoT dashboard. Control lighting, temperature, and security from anywhere.",
    keywords: ["Smart Home", "IoT Dashboard", "Home Automation", "Real-time Monitoring"],

    openGraph: {
        title: "Smart Home - Advanced IoT Dashboard",
        description: "Real-time monitoring and control for your modern smart home.",
        url: baseUrl,
        siteName: "Smart Home App",
        locale: "vi_VN",
        type: "website",
        images: [
            {
                url: `${baseUrl}/screenshots/opengraph.png`, // Absolute URL is safer
                width: 1200,
                height: 630,
                alt: "Smart Home Dashboard Preview",
            },
        ],
    },
    // Add Twitter specific metadata
    twitter: {
        card: "summary_large_image",
        title: "Smart Home - Advanced IoT Dashboard",
        description: "Real-time monitoring and control for your modern smart home.",
        images: [`${baseUrl}/screenshots/opengraph.png`],
    },
    icons: {
        icon: "/favicon.ico",
    },
    alternates: {
        canonical: baseUrl,
    },
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