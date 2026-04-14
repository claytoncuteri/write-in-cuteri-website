import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media | Appearances, Press, and Booking",
  description:
    "Media appearances, press coverage, and booking information for Clayton Cuteri, write-in candidate for U.S. House SC-01. Podcasts, interviews, and press kit downloads.",
};

export default function PressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
