import { MapPin } from "lucide-react";
import Link from "next/link";

export function MiniActivityMap() {
  return (
    <div className="rounded-xl bg-secondary/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-medium text-foreground">Nearby Activity</span>
        </div>
        <Link 
          href="/app/explore/map"
          className="text-xs text-primary hover:underline"
        >
          Open map
        </Link>
      </div>
      
      {/* Simplified map placeholder */}
      <div className="relative h-32 bg-muted rounded-lg overflow-hidden">
        {/* Map background pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Interest marker (center) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-primary" />
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-2xs text-foreground font-medium">
              Your interest
            </span>
          </div>
        </div>
        
        {/* New permit marker */}
        <div className="absolute top-1/4 right-1/4">
          <div className="relative">
            <div className="w-5 h-5 rounded-full bg-info/30 border-2 border-info flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-info" />
            </div>
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-2xs text-muted-foreground">
              New permit
            </span>
          </div>
        </div>
        
        {/* Distance line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line 
            x1="50%" 
            y1="50%" 
            x2="75%" 
            y2="25%" 
            stroke="hsl(var(--border))" 
            strokeWidth="1" 
            strokeDasharray="4 2"
          />
        </svg>
      </div>
      
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-muted-foreground">
          1 new permit within 2 miles
        </p>
        <span className="text-xs text-info font-medium">~1.8 mi away</span>
      </div>
    </div>
  );
}
