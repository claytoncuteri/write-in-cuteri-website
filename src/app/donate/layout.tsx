import type { Metadata } from "next";
import { pageMetadata, ogCard } from "@/lib/og";

export const metadata: Metadata = pageMetadata({
  path: "/donate",
  title: "Donate | Support Clayton Cuteri for U.S. Congress SC-01",
  description:
    "Support Clayton Cuteri's write-in campaign for U.S. House SC-01. Every dollar funds voter education across Charleston, Berkeley, Dorchester, Beaufort, Colleton, and Jasper counties. Not TV attack ads.",
  ogTitle: "Donate to Clayton Cuteri for Congress",
  ogDescription:
    "Contribute to Clayton Cuteri's SC-01 campaign through Anedot's secure form. Federal contribution limits and donor rules are on the page.",
  image: ogCard("donate", "Clayton Cuteri seated, with the headline Support the Campaign"),
});

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
