import type { Metadata } from "next";
import { pageMetadata, ogCard } from "@/lib/og";

export const metadata: Metadata = pageMetadata({
  path: "/press",
  title: "Media | Appearances, Press, and Booking",
  description:
    "Media appearances, press coverage, and booking information for Clayton Cuteri, write-in candidate for U.S. House SC-01. Podcasts, interviews, and press kit downloads.",
  ogTitle: "Media Resources: Clayton Cuteri",
  ogDescription:
    "Bio, high-resolution photos, press kit downloads, media contact and booking details for Clayton Cuteri, write-in candidate for U.S. House SC-01.",
  image: ogCard("press", "Clayton Cuteri at a bank of press microphones, with the headline Media Resources"),
});

export default function PressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
