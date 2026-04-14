import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

export const metadata: Metadata = {
  title: {
    default: "Clayton Cuteri for Congress | SC-01 Write-In Candidate",
    template: "%s | Clayton Cuteri for Congress",
  },
  description:
    "Clayton Cuteri is a write-in candidate for U.S. House of Representatives, South Carolina District 1. American Congress Party. November 3, 2026.",
  keywords: [
    "Clayton Cuteri",
    "SC-01",
    "South Carolina",
    "Congress",
    "write-in candidate",
    "American Congress Party",
    "Charleston",
    "2026 election",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://writeincuteri.com",
    siteName: "Clayton Cuteri for Congress",
    title: "Clayton Cuteri for Congress | SC-01 Write-In Candidate",
    description:
      "Write-in candidate for U.S. House, South Carolina District 1. For the 60% of Americans neither party speaks for.",
    images: [
      {
        url: "/images/ACP_Eagle_transparent_background.png",
        width: 800,
        height: 800,
        alt: "American Congress Party Eagle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clayton Cuteri for Congress | SC-01",
    description:
      "Write-in candidate for U.S. House, South Carolina District 1. American Congress Party.",
    images: ["/images/ACP_Eagle_transparent_background.png"],
  },
  metadataBase: new URL("https://writeincuteri.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmSerif.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
