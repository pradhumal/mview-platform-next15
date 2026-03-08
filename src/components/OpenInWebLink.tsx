import { ExternalLink } from "lucide-react";

interface OpenInWebLinkProps {
  href: string;
  label?: string;
}

/**
 * Consistent "Open in Web" deep link pattern.
 * Used wherever an advanced or detailed feature exists on the web
 * and the mobile app shows a summary card instead.
 */
export function OpenInWebLink({ href, label = "Open in Web" }: OpenInWebLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline underline-offset-2 transition-colors"
    >
      {label}
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}
