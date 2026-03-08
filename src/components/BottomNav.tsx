import { Link, useLocation } from "react-router-dom";
import { Sparkles, Compass, Settings } from "lucide-react";

const navItems = [
  { icon: Sparkles, label: "Intelligence", to: "/app" },
  { icon: Compass, label: "Explore", to: "/app/explore" },
  { icon: Settings, label: "Settings", to: "/app/settings" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-nav border-t border-border/50 pb-safe">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const isActive = item.to === "/app" 
            ? location.pathname === "/app" || location.pathname === "/app/"
            : location.pathname.startsWith(item.to);
            
          return (
            <Link
              key={item.label}
              to={item.to}
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
