import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donate | Support Clayton Cuteri for U.S. Congress SC-01",
  description:
    "Support Clayton Cuteri's write-in campaign for U.S. House SC-01. Every dollar funds voter education across Charleston, Berkeley, Dorchester, Beaufort, Colleton, and Jasper counties. Not TV attack ads.",
};

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
