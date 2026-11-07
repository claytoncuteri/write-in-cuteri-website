import type { Metadata } from "next";
import { pageMetadata, ogCard } from "@/lib/og";

export const metadata: Metadata = pageMetadata({
  path: "/donate",
  title: "Thank You to Our Donors | Clayton Cuteri",
  description:
    "The 2026 SC-01 race is over and Cuteri for Americans is not accepting contributions right now. Thank you to every donor. Stay in touch and join the American Congress Party.",
  ogTitle: "Thank You to Our Donors",
  ogDescription:
    "The 2026 SC-01 race is over. Thank you to every donor who made Clayton Cuteri's campaign possible.",
  image: ogCard("donate", "Clayton Cuteri seated, with the headline Thank You to Our Donors"),
});

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
