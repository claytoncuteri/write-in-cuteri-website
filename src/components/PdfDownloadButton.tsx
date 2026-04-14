"use client";

interface PdfDownloadButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function PdfDownloadButton({ href, children, className = "" }: PdfDownloadButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 px-6 py-3 text-navy border-2 border-navy hover:bg-navy hover:text-white focus:ring-navy";

  return (
    <button
      className={`${baseClasses} ${className}`}
      onClick={() => {
        window.open(href, "_blank");
        setTimeout(() => {
          const a = document.createElement("a");
          a.href = href;
          a.download = "";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, 500);
      }}
    >
      {children}
    </button>
  );
}
