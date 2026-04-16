"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/pricing", label: "Pricing" },
  { to: "/trust", label: "Trust & Privacy" },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Layers className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">MineralView</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  className={cn(
                    "text-sm transition-colors",
                    pathname === link.to
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="sm">Get started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-b border-border/50 bg-background">
        <div className="flex items-center justify-center gap-6 px-5 py-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className={cn(
                "text-sm transition-colors",
                pathname === link.to
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Layers className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-foreground">MineralView</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                Vigilant oversight for your mineral interests. We monitor the data so you don't have to decipher complex stubs alone.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3 text-sm">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/trust" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Trust & Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
              MineralView provides informational tools based on public data. It does not provide legal, tax, or investment advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
