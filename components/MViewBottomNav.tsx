"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Compass, Wrench } from "lucide-react";

interface Props {
  role: "owner" | "professional";
}

const navItems = [
  { icon: Sparkles, label: "Intelligence", to: "/app/intelligence" },
  { icon: Compass, label: "Explore", to: "/app/explore" },
  { icon: Wrench, label: "Advanced", to: "/app/advanced" },
];

export function MViewBottomNav({ role: _role }: Props) {
  const pathname = usePathname();
  const items = navItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-nav border-t border-border/50 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const isActive = item.to === "/app/intelligence"
            ? pathname === "/app/intelligence" || pathname === "/app/intelligence/"
            : pathname.startsWith(item.to);

          return (
            <Link
              key={item.label}
              href={item.to}
              className={`nav-item ${isActive ? "nav-item-active" : ""}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-2xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

