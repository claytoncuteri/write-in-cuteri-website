import Link from "next/link";

interface CTAButtonProps {
  variant?: "primary" | "secondary" | "tertiary";
  href?: string;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
}

export function CTAButton({
  variant = "primary",
  href,
  children,
  className = "",
  type = "button",
  onClick,
}: CTAButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary:
      "px-6 py-3 text-white bg-red-accent hover:bg-red-accent-dark focus:ring-red-accent",
    secondary:
      "px-6 py-3 text-navy border-2 border-navy hover:bg-navy hover:text-white focus:ring-navy",
    tertiary:
      "px-4 py-2 text-navy hover:text-navy-dark underline-offset-4 hover:underline focus:ring-navy",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
