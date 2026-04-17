export interface NavItem {
  label: string;
  href: string;
}

export const mainNavItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Problems", href: "/problems" },
  { label: "Priorities", href: "/policies" },
  { label: "About", href: "/about" },
  { label: "Get Involved", href: "/get-involved" },
];

export const footerNavItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "SC-01 Problems", href: "/problems" },
  { label: "Priorities", href: "/policies" },
  { label: "How to Write Me In", href: "/write-in" },
  { label: "About", href: "/about" },
  { label: "Get Involved", href: "/get-involved" },
  { label: "Events", href: "/events" },
  { label: "Endorsements", href: "/endorsements" },
  { label: "Donate", href: "/donate" },
  { label: "Media", href: "/press" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Accessibility", href: "/accessibility" },
];
