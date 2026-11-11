import type { Metadata } from "next";
import { pageMetadata, ogCard } from "@/lib/og";

export const metadata: Metadata = pageMetadata({
  path: "/get-involved",
  title: "Stay Involved | Clayton Cuteri, SC-01",
  description:
    "The 2026 SC-01 race is over. Thank you to every volunteer. Stay in touch with Clayton Cuteri, share the story and join the American Congress Party.",
  ogTitle: "Stay Involved with Clayton Cuteri",
  ogDescription:
    "Thank you to every volunteer. Stay in touch, share the story and join the American Congress Party for what comes next.",
  image: ogCard("get-involved", "Clayton Cuteri walking a red carpet, with the headline Stay in the Movement"),
});

export default function GetInvolvedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
