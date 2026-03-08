import { useCallback } from "react";
import { Link } from "react-router-dom";
import { Map, Activity, FileText, Layers } from "lucide-react";
import { TravelingIntelligence } from "@/components/TravelingIntelligence";

const sections = [
  { icon: Map, label: "Map", to: "/app/explore/map", desc: "View wells and activity near your interests" },
  { icon: Activity, label: "Production", to: "/app/explore/production", desc: "Current and historical production data" },
  { icon: FileText, label: "Reports", to: "/app/explore/reports", desc: "Filings, permits, and regulatory updates" },
  { icon: Layers, label: "Activity", to: "/app/explore/activity", desc: "Recent events tied to your interests" },
];

export default function ExplorePage() {
  const openIntelligence = useCallback(() => {
    window.dispatchEvent(new CustomEvent("open-intelligence"));
  }, []);

  return (
    <div className="px-5 py-8 md:px-8 animate-fade-in">
      <h1 className="text-xl font-medium text-foreground mb-2">Explore</h1>
      <p className="text-sm text-muted-foreground mb-6">Verify and browse the data behind your interests.</p>

      {/* Intelligence Summary — guidance before data */}
      <TravelingIntelligence subPage="explore" onOpenIntelligence={openIntelligence} className="mb-6" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sections.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="calm-card flex items-start gap-4 hover:border-primary/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <s.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}