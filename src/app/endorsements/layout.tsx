import type { Metadata } from "next";
import { pageMetadata, ogCard } from "@/lib/og";

// The page itself is a client component (endorsement form), so its
// metadata lives here, the same pattern as /get-involved and /press.
export const metadata: Metadata = pageMetadata({
  path: "/endorsements",
  title: "Endorsements | Who Stands With Clayton",
  description:
    "Endorse Clayton Cuteri for U.S. House in South Carolina District 1. Community leaders, local voices, and everyday Americans can add their name with a short form.",
  ogTitle: "Endorse Clayton Cuteri for U.S. House, SC-01",
  ogDescription:
    "Add your endorsement of Clayton Cuteri for U.S. House in South Carolina District 1 with a short form: your name, organization and why.",
  image: ogCard("endorsements", "Clayton Cuteri seated, with the headline Who Stands With Clayton"),
});

export default function EndorsementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
