// Mock production series data - monthly historical data
export interface ProductionDataPoint {
  date: string; // YYYY-MM format
  oil: number; // BBL
  gas: number; // MCF
  water: number; // BBL
  daysOnline: number;
}

export interface ProductionSeries {
  wellId: string;
  wellName: string;
  operator: string;
  data: ProductionDataPoint[];
}

// Helper to generate declining production curve
function generateDeclineCurve(
  startOil: number,
  startGas: number,
  months: number,
  declineRate: number, // monthly decline as decimal
  variance: number = 0.05
): ProductionDataPoint[] {
  const data: ProductionDataPoint[] = [];
  let currentOil = startOil;
  let currentGas = startGas;
  
  const startDate = new Date("2024-01-01");
  
  for (let i = 0; i < months; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    
    // Add some random variance
    const oilVariance = 1 + (Math.random() * variance * 2 - variance);
    const gasVariance = 1 + (Math.random() * variance * 2 - variance);
    
    const oil = Math.round(currentOil * oilVariance);
    const gas = Math.round(currentGas * gasVariance);
    const water = Math.round(oil * (1.5 + Math.random() * 0.5)); // Water cut increases
    
    data.push({
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      oil,
      gas,
      water,
      daysOnline: 28 + Math.floor(Math.random() * 3),
    });
    
    // Apply decline
    currentOil *= (1 - declineRate);
    currentGas *= (1 - declineRate);
  }
  
  return data;
}

export const mockProductionSeries: ProductionSeries[] = [
  {
    wellId: "well-1",
    wellName: "Smith Unit 1H",
    operator: "Pioneer Natural Resources",
    data: generateDeclineCurve(5200, 15500, 12, 0.04),
  },
  {
    wellId: "well-2",
    wellName: "Smith Unit 2H",
    operator: "Pioneer Natural Resources",
    data: generateDeclineCurve(7500, 22000, 12, 0.035),
  },
  {
    wellId: "well-3",
    wellName: "Johnson Ranch 2H",
    operator: "Diamondback Energy",
    data: generateDeclineCurve(6800, 18500, 12, 0.025), // Slower decline - stable well
  },
];

// Decline summary with key stats
export interface DeclineSummary {
  wellId: string;
  wellName: string;
  trend: "declining" | "stable" | "increasing";
  percentChange: number; // Last 6 months
  currentMonthlyOil: number;
  currentMonthlyGas: number;
  projectedAssetLife: number; // Years remaining at economic limit
  declineType: "hyperbolic" | "exponential";
  initialDeclineRate: number; // First year decline %
  currentDeclineRate: number; // Recent decline %
  isWithinNormalRange: boolean;
  regionalComparison: "above" | "average" | "below";
  insight: string;
}

export const mockDeclineSummaries: DeclineSummary[] = [
  {
    wellId: "well-1",
    wellName: "Smith Unit 1H",
    trend: "declining",
    percentChange: -8,
    currentMonthlyOil: 4350,
    currentMonthlyGas: 12900,
    projectedAssetLife: 12,
    declineType: "hyperbolic",
    initialDeclineRate: 42,
    currentDeclineRate: 5,
    isWithinNormalRange: true,
    regionalComparison: "average",
    insight: "This well is declining at a rate consistent with its age. The 8% decline over 6 months is within the expected range for a 5-year-old horizontal Wolfcamp well.",
  },
  {
    wellId: "well-2",
    wellName: "Smith Unit 2H",
    trend: "declining",
    percentChange: -5,
    currentMonthlyOil: 6300,
    currentMonthlyGas: 20100,
    projectedAssetLife: 15,
    declineType: "hyperbolic",
    initialDeclineRate: 38,
    currentDeclineRate: 4,
    isWithinNormalRange: true,
    regionalComparison: "above",
    insight: "This well is performing above the regional average for its vintage. The slower-than-expected decline suggests a high-quality completion in productive rock.",
  },
  {
    wellId: "well-3",
    wellName: "Johnson Ranch 2H",
    trend: "stable",
    percentChange: -2,
    currentMonthlyOil: 5550,
    currentMonthlyGas: 15600,
    projectedAssetLife: 18,
    declineType: "hyperbolic",
    initialDeclineRate: 35,
    currentDeclineRate: 2.5,
    isWithinNormalRange: true,
    regionalComparison: "above",
    insight: "This well has stabilized with minimal decline. A 2% change over 6 months indicates strong reservoir pressure maintenance. This is a valuable, stable asset.",
  },
];
