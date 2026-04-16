"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, MapPin, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AddMethod = "api" | "legal" | "map";

export default function AddMineralPage() {
  const router = useRouter();
  const [method, setMethod] = useState<AddMethod | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [interestName, setInterestName] = useState("");

  const methods = [
    {
      id: "api" as const,
      icon: Search,
      title: "API or Well Name",
      description: "Search by API number or well name",
      placeholder: "Enter API number (e.g., 42-329-12345)",
    },
    {
      id: "legal" as const,
      icon: FileText,
      title: "Legal Description",
      description: "Enter survey, section, block, or abstract",
      placeholder: "e.g., Section 15, Block A, Township 1N",
    },
    {
      id: "map" as const,
      icon: MapPin,
      title: "Map Location",
      description: "Drop a pin on the map",
      placeholder: "",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would save to database
    router.push("/app/explore/minerals");
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-medium text-foreground">
              Add mineral interest
            </h1>
          </div>
        </div>
      </header>

      <div className="px-5 py-6 md:px-8">
        {!method ? (
          <>
            <p className="text-muted-foreground text-sm mb-6">
              How would you like to add your mineral interest?
            </p>
            
            <div className="space-y-3">
              {methods.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className="calm-card w-full text-left hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{m.title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{m.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : method === "map" ? (
          <div className="space-y-6">
            <button
              onClick={() => setMethod(null)}
              className="text-sm text-primary hover:underline"
            >
              ← Choose different method
            </button>
            
            {/* Map placeholder */}
            <div className="aspect-square bg-muted/50 rounded-xl flex items-center justify-center border border-border/50">
              <div className="text-center p-6">
                <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Map pin selection coming soon
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  For now, please use API or legal description
                </p>
              </div>
            </div>
            
            <Button variant="outline" className="w-full" onClick={() => setMethod(null)}>
              Go back
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <button
              type="button"
              onClick={() => setMethod(null)}
              className="text-sm text-primary hover:underline"
            >
              ← Choose different method
            </button>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {method === "api" ? "API Number or Well Name" : "Legal Description"}
              </label>
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={methods.find(m => m.id === method)?.placeholder}
                className="h-12"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Name this interest (optional)
              </label>
              <Input
                value={interestName}
                onChange={(e) => setInterestName(e.target.value)}
                placeholder="e.g., Johnson Family Trust"
                className="h-12"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Give it a name you'll recognize. You can change this later.
              </p>
            </div>

            {/* Disclaimer */}
            <div className="p-4 bg-muted/50 rounded-xl">
              <div className="flex gap-3">
                <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  MineralView does not verify legal ownership. Adding an interest to your monitoring list does not establish or imply ownership. This tool is for informational purposes only.
                </p>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12"
              disabled={!searchValue.trim()}
            >
              Add to monitoring
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
