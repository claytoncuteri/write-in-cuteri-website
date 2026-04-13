interface SectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  bgColor?: "white" | "cream" | "navy";
  children: React.ReactNode;
  className?: string;
}

export function Section({
  id,
  title,
  subtitle,
  bgColor = "white",
  children,
  className = "",
}: SectionProps) {
  const bgClasses = {
    white: "bg-white",
    cream: "bg-cream",
    navy: "bg-navy text-white",
  };

  return (
    <section id={id} className={`py-16 sm:py-20 ${bgClasses[bgColor]} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="max-w-3xl mb-10 sm:mb-12">
            {title && (
              <h2
                className={`text-3xl sm:text-4xl font-bold font-serif ${
                  bgColor === "navy" ? "text-white" : "text-charcoal"
                }`}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className={`mt-4 text-lg ${
                  bgColor === "navy" ? "text-white/80" : "text-charcoal/70"
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
