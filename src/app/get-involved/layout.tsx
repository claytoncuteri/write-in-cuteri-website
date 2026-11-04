import type { Metadata } from "next";
import { pageMetadata, ogCard } from "@/lib/og";

export const metadata: Metadata = pageMetadata({
  path: "/get-involved",
  title: "Get Involved | Volunteer for Clayton Cuteri SC-01",
  description:
    "Volunteer for Clayton Cuteri's write-in campaign in South Carolina District 1. Sign up, spread the word, download materials, and help build a third-party alternative across Charleston, Berkeley, Dorchester, Beaufort, Colleton, and Jasper counties.",
  ogTitle: "Get Involved with the Cuteri Campaign",
  ogDescription:
    "Volunteer for Clayton Cuteri's SC-01 campaign, share it with friends, and download flyers, cards and the full volunteer kit.",
  image: ogCard("get-involved", "Clayton Cuteri walking a red carpet, with the headline Join the Movement"),
});

export default function GetInvolvedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
