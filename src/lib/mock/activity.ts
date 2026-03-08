// Mock activity feed - permits, completions, workovers, nearby drilling
export type ActivityEventType = "permit" | "completion" | "workover" | "spud" | "production_change" | "rig_move" | "frac";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  description: string;
  date: string; // ISO date
  relativeDate: string; // "2 days ago" etc.
  distance: number; // miles from user's interest
  distanceLabel: string;
  relatedMineralId: string;
  relatedMineralName: string;
  relatedWellId?: string;
  relatedWellName?: string;
  operator: string;
  county: string;
  significance: "high" | "medium" | "low";
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const mockActivityFeed: ActivityEvent[] = [
  {
    id: "act-1",
    type: "permit",
    title: "New drilling permit filed",
    description: "A new horizontal well permit was filed by Occidental Petroleum. The proposed well is 1.8 miles from your Section 15 Block A interest. Drilling typically begins 30-90 days after permit approval. Based on spacing patterns, this well may share the same formation as nearby producing wells.",
    date: "2025-02-06",
    relativeDate: "3 days ago",
    distance: 1.8,
    distanceLabel: "~1.8 miles",
    relatedMineralId: "min-2",
    relatedMineralName: "Section 15 Block A",
    operator: "Occidental Petroleum",
    county: "Howard County",
    significance: "high",
    coordinates: { lat: 32.3489, lng: -101.4612 },
  },
  {
    id: "act-2",
    type: "production_change",
    title: "Production changed last month",
    description: "Monthly production for the adjacent well showed a 5% decrease compared to the previous month. This is within the normal decline range for a well of this age and type. No action is required.",
    date: "2025-02-01",
    relativeDate: "1 week ago",
    distance: 0,
    distanceLabel: "Adjacent well",
    relatedMineralId: "min-1",
    relatedMineralName: "Johnson Family Trust",
    relatedWellId: "well-1",
    relatedWellName: "Smith Unit 1H",
    operator: "Pioneer Natural Resources",
    county: "Midland County",
    significance: "low",
    coordinates: { lat: 32.0234, lng: -102.0876 },
  },
  {
    id: "act-3",
    type: "completion",
    title: "Well reported first production",
    description: "Johnson Ranch 3H began producing as of January 8th. This recently completed well is adjacent to your Section 15 Block A interest. Initial production rates appear strong, with reported IP of 890 BBL/day oil.",
    date: "2025-01-25",
    relativeDate: "2 weeks ago",
    distance: 0.3,
    distanceLabel: "~0.3 miles",
    relatedMineralId: "min-2",
    relatedMineralName: "Section 15 Block A",
    relatedWellId: "well-4",
    relatedWellName: "Johnson Ranch 3H",
    operator: "Diamondback Energy",
    county: "Howard County",
    significance: "high",
    coordinates: { lat: 32.3478, lng: -101.4589 },
  },
  {
    id: "act-4",
    type: "spud",
    title: "Drilling began on nearby well",
    description: "Midland Basin 7H spudded on January 15th. The rig is visible approximately 1.2 miles from your Johnson Family Trust interest. Drilling is expected to take 18-25 days.",
    date: "2025-01-15",
    relativeDate: "3 weeks ago",
    distance: 1.2,
    distanceLabel: "~1.2 miles",
    relatedMineralId: "min-1",
    relatedMineralName: "Johnson Family Trust",
    relatedWellId: "well-8",
    relatedWellName: "Midland Basin 7H",
    operator: "Occidental Petroleum",
    county: "Midland County",
    significance: "medium",
    coordinates: { lat: 32.0189, lng: -102.0812 },
  },
  {
    id: "act-5",
    type: "permit",
    title: "Two new permits filed in your area",
    description: "Apache Corporation filed two horizontal well permits in Reeves County. These wells are adjacent to your Inherited Lease interest. Combined, they represent potential development of the Bone Spring formation on the acreage.",
    date: "2025-01-10",
    relativeDate: "1 month ago",
    distance: 0,
    distanceLabel: "Your interest",
    relatedMineralId: "min-3",
    relatedMineralName: "Inherited Lease - Reeves",
    operator: "Apache Corporation",
    county: "Reeves County",
    significance: "high",
    coordinates: { lat: 31.4567, lng: -103.7890 },
  },
  {
    id: "act-6",
    type: "frac",
    title: "Frac operations completed",
    description: "Hydraulic fracturing was completed on Smith Unit 2H. This well is part of your Johnson Family Trust interest. First production is expected within the next 30-45 days.",
    date: "2024-12-18",
    relativeDate: "2 months ago",
    distance: 0,
    distanceLabel: "Your interest",
    relatedMineralId: "min-1",
    relatedMineralName: "Johnson Family Trust",
    relatedWellId: "well-2",
    relatedWellName: "Smith Unit 2H",
    operator: "Pioneer Natural Resources",
    county: "Midland County",
    significance: "medium",
    coordinates: { lat: 32.0256, lng: -102.0892 },
  },
];
