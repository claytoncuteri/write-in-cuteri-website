import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Involved | Volunteer for Clayton Cuteri SC-01",
  description:
    "Volunteer for Clayton Cuteri's write-in campaign in South Carolina District 1. Sign up, spread the word, download materials, and help build a third-party alternative across Charleston, Berkeley, Dorchester, Beaufort, Colleton, and Jasper counties.",
};

export default function GetInvolvedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
