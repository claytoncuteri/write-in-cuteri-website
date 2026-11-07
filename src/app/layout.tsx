import type { Metadata } from "next";
import { Inter, Fraunces, Caveat } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostHogProvider } from "@/components/PostHogProvider";

// Brand fonts per the campaign spec: Fraunces for headlines (warm,
// human serif that carries trust without reading glossy), Inter for
// body (screen-native legibility at the small sizes where policy
// detail and disclaimers live). Both are variable fonts, so no weight
// list is needed. Caveat is kept for handwritten accents.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: {
    // Post-election (after Nov 3, 2026): the site no longer asks for
    // votes. Name first, then party and district.
    default: "Clayton Cuteri | American Congress Party, SC District 1",
    template: "%s | Clayton Cuteri, American Congress Party",
  },
  description:
    "Thank you, Lowcountry. Clayton A. Cuteri ran for U.S. House in South Carolina District 1 (SC-01) in 2026 as the American Congress Party write-in. The race is over. The work is not. Stay in touch and see what comes next.",
  keywords: [
    "Clayton Cuteri",
    "American Congress Party",
    "SC-01 2026",
    "South Carolina District 1",
    "third party South Carolina",
    "Charleston SC",
    "Lowcountry",
    "U.S. House SC-01",
  ],
  // Site-default share tags. Every public page overrides these through
  // pageMetadata() in src/lib/og.ts with its own title, URL and card;
  // these remain for admin and 404 pages.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://writeincuteri.com",
    siteName: "Clayton Cuteri, American Congress Party (SC-01)",
    title: "Thank you, Lowcountry | Clayton Cuteri",
    description:
      "The 2026 SC-01 race is over. Thank you to every voter and volunteer. Stay in touch and see what comes next.",
    images: [
      {
        url: "/og/default.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Thank you, Lowcountry. Clayton Cuteri, American Congress Party, South Carolina District 1",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Thank you, Lowcountry | Clayton Cuteri",
    description:
      "The 2026 SC-01 race is over. Thank you to every voter and volunteer. Stay in touch and see what comes next.",
    site: "@ClaytonCuteri",
    creator: "@ClaytonCuteri",
    images: ["/og/default.png"],
  },
  metadataBase: new URL("https://writeincuteri.com"),
  alternates: {
    canonical: "https://writeincuteri.com",
  },
  manifest: "/site.webmanifest",
  // Google Search Console verification is handled via DNS TXT record on
  // writeincuteri.com, not an HTML meta tag. If we ever need meta-tag
  // verification (for example, for a non-DNS-owned subdomain), add it
  // back here as:
  //   other: { "google-site-verification": "<code from Search Console>" }
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
        "Clayton Cuteri, American Congress Party. 2026 candidate for U.S. House of Representatives, South Carolina District 1 (SC-01).",
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
      // Post-election: no longer a current candidacy.
      jobTitle: "Secretary General, American Congress Party",
      description:
        "Secretary General of the American Congress Party. 2026 write-in candidate for U.S. House of Representatives, District 1 (South Carolina). Author of the forthcoming book America Reimagined.",
      image: "https://writeincuteri.com/images/Clayton_Headshot.jpg",
      url: "https://writeincuteri.com/about/",
      affiliation: {
        "@type": "PoliticalParty",
        name: "American Congress Party",
        url: "https://americancongressparty.com",
      },
      // sameAs links Clayton's identity to his major social profiles
      // so search engines and AI crawlers consolidate the campaign
      // entity correctly.
      sameAs: [
        "https://americancongressparty.com",
        "https://www.instagram.com/claytoncuteri/",
        "https://www.facebook.com/clayton.cuteri.2025/",
        "https://www.youtube.com/@ClaytonCuteriACP",
        "https://x.com/ClaytonCuteri",
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

// JSON-LD lives inside <body>, not <head>, per Next.js 16 official guidance
// (node_modules/next/dist/docs/01-app/02-guides/json-ld.md). Keeping it in
// <head> breaks hydration in dev because Replit's proxy injects
// <script src="/__replco/static/devtools/injected.js"> into <head>, which
// shifts children and makes React's positional match fail. Google reads
// JSON-LD from anywhere in the document, so body placement is SEO-equivalent.
//
// The <link rel="manifest"> was redundant with metadata.manifest; removed.
//
// suppressHydrationWarning on <html> + <body> silences the remaining
// attribute-level mismatches caused by browser extensions (Grammarly,
// LastPass) that inject data-* attrs into <body> after SSR. It only
// suppresses one-level mismatches on those elements; it cannot hide bugs
// in child components.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} ${caveat.variable}`}
    >
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        {/* JSON-LD structured data. \u003c replacement prevents XSS via
            stringified input that contains </script>. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <PostHogProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </PostHogProvider>
      </body>
    </html>
  );
}
