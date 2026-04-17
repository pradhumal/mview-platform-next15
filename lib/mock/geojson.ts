// Mock GeoJSON data for map features
export interface MapFeature {
  id: string;
  type: "well" | "interest" | "permit";
  properties: {
    name: string;
    status: string;
    operator?: string;
    county: string;
    isUserInterest: boolean;
    linkedMineralId?: string;
  };
  geometry: {
    type: "Point" | "Polygon";
    coordinates: number[] | number[][][];
  };
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Mock map features for Texas Permian Basin area
export const mockMapFeatures: MapFeature[] = [
  // User's mineral interests (as polygons)
  {
    id: "geo-min-1",
    type: "interest",
    properties: {
      name: "Johnson Family Trust",
      status: "producing",
      operator: "Pioneer Natural Resources",
      county: "Midland County",
      isUserInterest: true,
      linkedMineralId: "min-1",
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-102.090, 32.020],
        [-102.085, 32.020],
        [-102.085, 32.025],
        [-102.090, 32.025],
        [-102.090, 32.020],
      ]],
    },
  },
  {
    id: "geo-min-2",
    type: "interest",
    properties: {
      name: "Section 15 Block A",
      status: "producing",
      operator: "Diamondback Energy",
      county: "Howard County",
      isUserInterest: true,
      linkedMineralId: "min-2",
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-101.460, 32.343],
        [-101.455, 32.343],
        [-101.455, 32.348],
        [-101.460, 32.348],
        [-101.460, 32.343],
      ]],
    },
  },
  {
    id: "geo-min-3",
    type: "interest",
    properties: {
      name: "Inherited Lease - Reeves",
      status: "permitted",
      operator: "Apache Corporation",
      county: "Reeves County",
      isUserInterest: true,
      linkedMineralId: "min-3",
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-103.795, 31.452],
        [-103.785, 31.452],
        [-103.785, 31.462],
        [-103.795, 31.462],
        [-103.795, 31.452],
      ]],
    },
  },
  // Wells as points
  {
    id: "geo-well-1",
    type: "well",
    properties: {
      name: "Smith Unit 1H",
      status: "producing",
      operator: "Pioneer Natural Resources",
      county: "Midland County",
      isUserInterest: false,
    },
    geometry: {
      type: "Point",
      coordinates: [-102.0876, 32.0234],
    },
  },
  {
    id: "geo-well-2",
    type: "well",
    properties: {
      name: "Smith Unit 2H",
      status: "producing",
      operator: "Pioneer Natural Resources",
      county: "Midland County",
      isUserInterest: false,
    },
    geometry: {
      type: "Point",
      coordinates: [-102.0892, 32.0256],
    },
  },
  {
    id: "geo-well-3",
    type: "well",
    properties: {
      name: "Johnson Ranch 2H",
      status: "producing",
      operator: "Diamondback Energy",
      county: "Howard County",
      isUserInterest: false,
    },
    geometry: {
      type: "Point",
      coordinates: [-101.4567, 32.3456],
    },
  },
  {
    id: "geo-well-4",
    type: "well",
    properties: {
      name: "Johnson Ranch 3H",
      status: "completed",
      operator: "Diamondback Energy",
      county: "Howard County",
      isUserInterest: false,
    },
    geometry: {
      type: "Point",
      coordinates: [-101.4589, 32.3478],
    },
  },
  {
    id: "geo-well-5",
    type: "permit",
    properties: {
      name: "Davis Lease 4H",
      status: "permitted",
      operator: "Apache Corporation",
      county: "Reeves County",
      isUserInterest: false,
    },
    geometry: {
      type: "Point",
      coordinates: [-103.7890, 31.4567],
    },
  },
  {
    id: "geo-well-7",
    type: "well",
    properties: {
      name: "Pioneer State 12H",
      status: "producing",
      operator: "Pioneer Natural Resources",
      county: "Midland County",
      isUserInterest: false,
    },
    geometry: {
      type: "Point",
      coordinates: [-102.0950, 32.0310],
    },
  },
  {
    id: "geo-well-8",
    type: "well",
    properties: {
      name: "Midland Basin 7H",
      status: "drilling",
      operator: "Occidental Petroleum",
      county: "Midland County",
      isUserInterest: false,
    },
    geometry: {
      type: "Point",
      coordinates: [-102.0812, 32.0189],
    },
  },
];

// Function to filter map features by bounds
export function filterFeaturesByBounds(features: MapFeature[], bounds: MapBounds): MapFeature[] {
  return features.filter((feature) => {
    if (feature.geometry.type === "Point") {
      const [lng, lat] = feature.geometry.coordinates as number[];
      return (
        lat >= bounds.south &&
        lat <= bounds.north &&
        lng >= bounds.west &&
        lng <= bounds.east
      );
    }
    // For polygons, check if any point is within bounds
    if (feature.geometry.type === "Polygon") {
      const coords = feature.geometry.coordinates as number[][][];
      return coords[0].some(([lng, lat]) => 
        lat >= bounds.south &&
        lat <= bounds.north &&
        lng >= bounds.west &&
        lng <= bounds.east
      );
    }
    return false;
  });
}
