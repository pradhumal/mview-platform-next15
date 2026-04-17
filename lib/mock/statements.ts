// Mock statement upload and parsing data
export interface ParsedStatement {
  id: string;
  uploadedAt: string;
  fileName: string;
  fileType: "pdf" | "image";
  status: "parsed" | "processing" | "error";
  linkedMineralId?: string;
  linkedMineralName?: string;
  period: string;
  operator: string;
  summary: {
    grossProduction: {
      oil: number;
      gas: number;
      ngl?: number;
    };
    netRevenue: number;
    deductions: {
      severanceTax: number;
      transportationFee: number;
      marketingFee: number;
      processingFee: number;
      other: number;
      total: number;
    };
    prices: {
      oil: number;
      gas: number;
    };
    nri: number;
    checkAmount: number;
  };
  discrepancies?: {
    type: "production" | "deduction" | "price";
    description: string;
    expectedValue: string;
    actualValue: string;
    severity: "high" | "medium" | "low";
  }[];
  insights: string[];
}

// Mock parsed statement result
export const mockParsedStatement: ParsedStatement = {
  id: "stmt-1",
  uploadedAt: "2025-02-09T10:30:00Z",
  fileName: "pioneer_jan2025_statement.pdf",
  fileType: "pdf",
  status: "parsed",
  linkedMineralId: "min-1",
  linkedMineralName: "Johnson Family Trust",
  period: "January 2025",
  operator: "Pioneer Natural Resources",
  summary: {
    grossProduction: {
      oil: 4250,
      gas: 12600,
      ngl: 890,
    },
    netRevenue: 2847.53,
    deductions: {
      severanceTax: 125.40,
      transportationFee: 45.20,
      marketingFee: 22.10,
      processingFee: 68.90,
      other: 12.50,
      total: 274.10,
    },
    prices: {
      oil: 72.50,
      gas: 2.85,
    },
    nri: 0.03125,
    checkAmount: 2573.43,
  },
  discrepancies: [
    {
      type: "production",
      description: "Reported production differs from RRC filing",
      expectedValue: "4,350 BBL (RRC)",
      actualValue: "4,250 BBL (Statement)",
      severity: "low",
    },
  ],
  insights: [
    "Your check amount of $2,573.43 is consistent with production levels and your 3.125% NRI.",
    "Deductions total 9.6% of gross revenue, which is within the normal range for this operator.",
    "Oil prices averaged $72.50/BBL this month, up $3.20 from December.",
    "There is a minor discrepancy between reported production and the RRC filing. This 2.3% difference is likely due to timing of volume allocations.",
  ],
};

// Helper to simulate upload processing
export function simulateStatementUpload(fileName: string): Promise<ParsedStatement> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...mockParsedStatement,
        id: `stmt-${Date.now()}`,
        uploadedAt: new Date().toISOString(),
        fileName,
      });
    }, 2000); // Simulate 2 second processing time
  });
}
