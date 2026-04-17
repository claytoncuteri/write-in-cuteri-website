import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display, Caveat } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostHogProvider } from "@/components/PostHogProvider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: {
    default:
      "Clayton Cuteri for U.S. Congress | Write-In Candidate SC-01 2026",
    template: "%s | Clayton Cuteri for U.S. Congress",
  },
  description:
    "Clayton Cuteri is a write-in candidate for U.S. House of Representatives, South Carolina District 1 (SC-01). American Congress Party. Third-party alternative for Charleston, Berkeley, Beaufort, and Lowcountry voters. November 3, 2026.",
  keywords: [
    "Clayton Cuteri",
    "SC-01 candidates 2026",
    "write-in candidate SC-01",
    "South Carolina district 1 election 2026",
    "third party candidate South Carolina 2026",
    "American Congress Party",
    "Charleston SC congressional race",
    "who is running for Congress Charleston SC",
    "independent candidate Charleston SC",
    "how to write in a candidate South Carolina",
    "SC-01 open seat 2026",
    "alternative to Republican Democrat SC-01",
    "Charleston flood insurance cost",
    "SC housing affordability crisis",
    "South Carolina income tax elimination",
    "cost of living Charleston SC",
    "write-in candidate how does it work",
    "SC 2026 election date",
    "South Carolina voter registration 2026",
    "Lowcountry resilience",
    "third party Congress 2026",
    "U.S. House SC-01",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://writeincuteri.com",
    siteName: "Clayton Cuteri for U.S. Congress",
    title:
      "Clayton Cuteri for U.S. Congress | Write-In Candidate SC-01 2026",
    description:
      "Write-in candidate for U.S. House, South Carolina District 1. Third-party alternative for the Americans neither party speaks for. November 3, 2026.",
    images: [
      {
        url: "/images/Clayton_Headshot.jpg",
        width: 800,
        height: 800,
        alt: "Clayton Cuteri, write-in candidate for U.S. Congress SC-01",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clayton Cuteri for U.S. Congress | SC-01 Write-In 2026",
    description:
      "Third-party write-in candidate for U.S. House, South Carolina District 1. American Congress Party. November 3, 2026.",
    images: ["/images/Clayton_Headshot.jpg"],
  },
  metadataBase: new URL("https://writeincuteri.com"),
  alternates: {
    canonical: "https://writeincuteri.com",
  },
  manifest: "/site.webmanifest",
  other: {
    "google-site-verification": "[GOOGLE_SITE_VERIFICATION_CODE]",
  },
};

// JSON-LD structured data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://writeincuteri.com/#website",
      url: "https://writeincuteri.com",
      name: "Clayton Cuteri for U.S. Congress",
      description:
        "Write-in candidate for U.S. House of Representatives, South Carolina District 1 (SC-01). American Congress Party.",
      publisher: { "@id": "https://writeincuteri.com/#organization" },
    },
    {
      "@type": "Organization",
      "@id": "https://writeincuteri.com/#organization",
      name: "Cuteri for Americans",
      url: "https://writeincuteri.com",
      logo: {
        "@type": "ImageObject",
        url: "https://writeincuteri.com/images/ACP_logo_with_letters.png",
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: "info@writeincuteri.com",
        contactType: "campaign office",
      },
    },
    {
      "@type": "Person",
      "@id": "https://writeincuteri.com/#candidate",
      name: "Clayton A. Cuteri",
      jobTitle: "Write-In Candidate for U.S. House of Representatives, SC-01",
      description:
        "Write-in candidate for U.S. Congress, South Carolina District 1. Secretary General of the American Congress Party. Author of America Reimagined.",
      image: "https://writeincuteri.com/images/Clayton_Headshot.jpg",
      url: "https://writeincuteri.com/about/",
      affiliation: {
        "@type": "PoliticalParty",
        name: "American Congress Party",
        url: "https://americancongressparty.com",
      },
      sameAs: [
        "https://americancongressparty.com",
      ],
      knowsAbout: [
        "coastal insurance reform",
        "affordable housing policy",
        "military spending reform",
        "government transparency",
        "tax reform",
        "South Carolina District 1",
      ],
    },
  ],
};

// suppressHydrationWarning on <html> + <body>: in dev, Replit injects its
// devtools <script src="/__replco/..."> into <head> and browser extensions
// (Grammarly, LastPass) inject attributes into <body>. Neither shows up in
// prod. Suppressing at the root only silences these specific mismatches;
// it does not mask bugs in child components.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSans.variable} ${dmSerif.variable} ${caveat.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="author" href="/humans.txt" />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <Suspense fallback={null}>
          <PostHogProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </PostHogProvider>
        </Suspense>
      </body>
    </html>
  );
}
