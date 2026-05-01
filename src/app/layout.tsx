import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display, Caveat } from "next/font/google";
import "./globals.css";
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
    // Default and template both include the exact ballot phrase
    // ("U.S. House of Representatives, District 1") so every browser
    // tab, every search result snippet, and every share preview
    // pairs Clayton's name with the title voters will see on the
    // ExpressVote screen on Nov 3.
    default:
      "Clayton Cuteri for U.S. House of Representatives, District 1 (SC) | Write-In Candidate 2026",
    template:
      "%s | Clayton Cuteri for U.S. House of Representatives, District 1 (SC)",
  },
  description:
    "Clayton A. Cuteri, write-in candidate for U.S. House of Representatives, District 1 (South Carolina, SC-01), November 3, 2026. American Congress Party. Third-party alternative for Charleston, Berkeley, Dorchester, Beaufort, Colleton, and Jasper county voters across the Lowcountry.",
  keywords: [
    "Clayton Cuteri",
    "SC-01 candidates 2026",
    "write-in candidate SC-01",
    "South Carolina district 1 election 2026",
    "third party candidate South Carolina 2026",
    "American Congress Party",
    "Charleston SC congressional race",
    "Beaufort SC congressional race",
    "Hilton Head congressional race",
    "Summerville SC congressional race",
    "Goose Creek SC congressional race",
    "who is running for Congress Charleston SC",
    "who is running for Congress Beaufort SC",
    "independent candidate Charleston SC",
    "independent candidate Hilton Head",
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
    siteName:
      "Clayton Cuteri for U.S. House of Representatives, District 1 (SC)",
    title:
      "Clayton Cuteri | U.S. House of Representatives, District 1 (SC) | Write-In 2026",
    description:
      "Write-in candidate for U.S. House of Representatives, District 1 (South Carolina). Third-party alternative for the Americans neither party speaks for. November 3, 2026.",
    // Switched OG/share image from the headshot to the Write-In
    // Cuteri wordmark on navy. Reason: every iMessage, X, Facebook,
    // Slack, Discord, and LinkedIn share preview now reinforces the
    // exact same brand mark that lives in the site nav  -  every
    // share becomes a logo impression. Asset already shipped with the
    // logo_a_star_divider banner pack; no new export needed.
    images: [
      {
        url: "/logo_a_star_divider/digital_og_image/navy.png",
        width: 1200,
        height: 630,
        alt: "Write-In Cuteri  -  Clayton Cuteri for U.S. House of Representatives, District 1, South Carolina",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Clayton Cuteri | U.S. House of Representatives, District 1 (SC) | Write-In 2026",
    description:
      "Third-party write-in candidate for U.S. House of Representatives, District 1 (South Carolina). American Congress Party. November 3, 2026.",
    images: ["/logo_a_star_divider/digital_og_image/navy.png"],
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
      // jobTitle uses the exact ballot phrase Google + LLM crawlers
      // (Claude, ChatGPT, Bing) read when answering "who is running
      // for U.S. House in South Carolina District 1?". This is the
      // single most important string for the campaign's structured
      // data.
      jobTitle:
        "Write-In Candidate for U.S. House of Representatives, District 1 (South Carolina)",
      description:
        "Write-in candidate for U.S. House of Representatives, District 1 (South Carolina). Secretary General of the American Congress Party. Author of the forthcoming book America Reimagined.",
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
      className={`${dmSans.variable} ${dmSerif.variable} ${caveat.variable}`}
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
