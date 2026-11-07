import type { Metadata } from "next";
import { pageMetadata, ogCard } from "@/lib/og";

// The page itself is a client component (endorsement form), so its
// metadata lives here, the same pattern as /get-involved and /press.
export const metadata: Metadata = pageMetadata({
  path: "/endorsements",
  title: "Endorsements | Who Stood With Clayton",
  description:
    "Thank you to everyone who stood with Clayton Cuteri in the 2026 SC-01 race. Want to add your name for what comes next? Use the short form.",
  ogTitle: "Who Stood With Clayton Cuteri",
  ogDescription:
    "Thank you to everyone who stood with Clayton in 2026. Add your name for what comes next with a short form.",
  image: ogCard("endorsements", "Clayton Cuteri seated, with the headline Who Stands With Clayton"),
});

export default function EndorsementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
