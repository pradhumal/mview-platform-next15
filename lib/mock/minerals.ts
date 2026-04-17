// Mock mineral interests - Texas focused sample data
export interface MineralInterest {
  id: string;
  name: string;
  county: string;
  state: string;
  operator: string | null;
  status: "producing" | "permitted" | "inactive";
  apiNumber?: string;
  nri?: number; // Net Revenue Interest as decimal
  legalDescription?: string;
  acreage?: number;
  linkedWellIds: string[];
  createdAt: string;
  lastChecked: string;
  alertRadius: number;
  emailAlerts: boolean;
  pushAlerts: boolean;
}

export const mockMinerals: MineralInterest[] = [
  {
    id: "min-1",
    name: "Johnson Family Trust",
    county: "Midland County",
    state: "Texas",
    operator: "Pioneer Natural Resources",
    status: "producing",
    apiNumber: "42-329-12345",
    nri: 0.03125,
    legalDescription: "Section 15, Block 41, T-2-S, T&P RR Co. Survey",
    acreage: 160,
    linkedWellIds: ["well-1", "well-2"],
    createdAt: "2024-06-15",
    lastChecked: "2025-02-09T09:15:00Z",
    alertRadius: 5,
    emailAlerts: true,
    pushAlerts: false,
  },
  {
    id: "min-2",
    name: "Section 15 Block A",
    county: "Howard County",
    state: "Texas",
    operator: "Diamondback Energy",
    status: "producing",
    apiNumber: "42-227-67890",
    nri: 0.025,
    legalDescription: "Section 15, Block A, Bauer & Cockrell Survey",
    acreage: 80,
    linkedWellIds: ["well-3", "well-4"],
    createdAt: "2024-08-22",
    lastChecked: "2025-02-09T09:15:00Z",
    alertRadius: 3,
    emailAlerts: true,
    pushAlerts: true,
  },
  {
    id: "min-3",
    name: "Inherited Lease - Reeves",
    county: "Reeves County",
    state: "Texas",
    operator: null,
    status: "permitted",
    legalDescription: "Section 8, Block 56, T-3, T&P RR Co. Survey",
    acreage: 320,
    linkedWellIds: ["well-5", "well-6"],
    createdAt: "2024-11-10",
    lastChecked: "2025-02-09T09:15:00Z",
    alertRadius: 10,
    emailAlerts: true,
    pushAlerts: false,
  },
];
