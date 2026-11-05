import type { Metadata } from "next";

// Admin is behind a password, so it never gets a rich link preview and
// must stay out of search results (robots.txt already disallows
// /admin/; this covers crawlers that land here from a pasted link).
// The site-default share tags from the root layout still apply.
export const metadata: Metadata = {
  title: "Campaign Admin",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
