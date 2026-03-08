// Mock reports and filings data
export type ReportType = "rrc_filing" | "operator_report" | "production_report" | "division_order" | "pooling_order";

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  filedDate: string;
  source: string;
  relatedMineralId?: string;
  relatedMineralName?: string;
  relatedWellId?: string;
  relatedWellName?: string;
  operator?: string;
  county: string;
  documentUrl?: string; // Would be actual URL in production
  status: "new" | "reviewed" | "requires_attention";
  summary?: string;
}

export const mockReports: Report[] = [
  {
    id: "rpt-1",
    type: "production_report",
    title: "December 2024 Production Report",
    description: "Monthly production report for Smith Unit 1H filed with the Texas Railroad Commission.",
    filedDate: "2025-01-25",
    source: "Texas Railroad Commission",
    relatedMineralId: "min-1",
    relatedMineralName: "Johnson Family Trust",
    relatedWellId: "well-1",
    relatedWellName: "Smith Unit 1H",
    operator: "Pioneer Natural Resources",
    county: "Midland County",
    status: "new",
    summary: "Production totaled 4,350 BBL oil and 12,900 MCF gas for December. This is a 4.8% decline from November, consistent with expected hyperbolic decline for a well of this vintage.",
  },
  {
    id: "rpt-2",
    type: "rrc_filing",
    title: "W-1 Permit Application",
    description: "New horizontal well permit application for Davis Lease 4H targeting the Bone Spring formation.",
    filedDate: "2025-01-10",
    source: "Texas Railroad Commission",
    relatedMineralId: "min-3",
    relatedMineralName: "Inherited Lease - Reeves",
    relatedWellId: "well-5",
    relatedWellName: "Davis Lease 4H",
    operator: "Apache Corporation",
    county: "Reeves County",
    status: "requires_attention",
    summary: "Apache has filed a drilling permit on acreage that includes your inherited interest. The proposed lateral is 10,500 feet targeting the Bone Spring Sand. Estimated spud date is Q2 2025.",
  },
  {
    id: "rpt-3",
    type: "operator_report",
    title: "Completion Report - Johnson Ranch 3H",
    description: "Final completion report filed for Johnson Ranch 3H horizontal well.",
    filedDate: "2025-01-08",
    source: "Texas Railroad Commission",
    relatedMineralId: "min-2",
    relatedMineralName: "Section 15 Block A",
    relatedWellId: "well-4",
    relatedWellName: "Johnson Ranch 3H",
    operator: "Diamondback Energy",
    county: "Howard County",
    status: "reviewed",
    summary: "Well completed with 11,000 ft lateral in the Wolfcamp A. Initial production test showed 890 BBL/day oil, 2,100 MCF/day gas. Completion used 2,800 lbs/ft proppant loading.",
  },
  {
    id: "rpt-4",
    type: "division_order",
    title: "Updated Division Order - Smith Unit",
    description: "Revised division order reflecting updated ownership interests for the Smith Unit.",
    filedDate: "2024-12-15",
    source: "Pioneer Natural Resources",
    relatedMineralId: "min-1",
    relatedMineralName: "Johnson Family Trust",
    operator: "Pioneer Natural Resources",
    county: "Midland County",
    status: "reviewed",
    summary: "Your Net Revenue Interest (NRI) remains at 3.125% for the Smith Unit. No changes to your decimal interest from the previous division order.",
  },
  {
    id: "rpt-5",
    type: "production_report",
    title: "November 2024 Production Report",
    description: "Monthly production report for Johnson Ranch 2H filed with the Texas Railroad Commission.",
    filedDate: "2024-12-20",
    source: "Texas Railroad Commission",
    relatedMineralId: "min-2",
    relatedMineralName: "Section 15 Block A",
    relatedWellId: "well-3",
    relatedWellName: "Johnson Ranch 2H",
    operator: "Diamondback Energy",
    county: "Howard County",
    status: "reviewed",
    summary: "Production totaled 5,550 BBL oil and 15,600 MCF gas for November. Production has been remarkably stable, with only 2% decline over the past 6 months.",
  },
];

export interface ReportDetail extends Report {
  fullContent: string;
  keyMetrics?: {
    label: string;
    value: string;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
  }[];
  actions?: {
    label: string;
    description: string;
    priority: "required" | "recommended" | "optional";
  }[];
}

export const mockReportDetails: ReportDetail[] = [
  {
    ...mockReports[0],
    fullContent: `
## December 2024 Production Report

**Well:** Smith Unit 1H  
**API Number:** 42-329-12345-00  
**Operator:** Pioneer Natural Resources  
**Reporting Period:** December 1-31, 2024

### Production Summary

| Product | Volume | Units | Change from Prior Month |
|---------|--------|-------|------------------------|
| Oil | 4,350 | BBL | -4.8% |
| Gas | 12,900 | MCF | -4.2% |
| Water | 9,200 | BBL | +2.1% |

### Analysis

This well continues to perform within expected parameters for its age. The decline rate of 4.8% is consistent with hyperbolic decline curves for Wolfcamp A horizontal wells in the Midland Basin.

### Projected Next Month

Based on current decline trajectory, January 2025 production is projected at approximately 4,140 BBL oil and 12,350 MCF gas.
    `,
    keyMetrics: [
      { label: "Oil Production", value: "4,350 BBL", change: "-4.8%", changeType: "neutral" },
      { label: "Gas Production", value: "12,900 MCF", change: "-4.2%", changeType: "neutral" },
      { label: "Water Cut", value: "68%", change: "+2.1%", changeType: "negative" },
      { label: "Days Online", value: "31 days", changeType: "positive" },
    ],
  },
  {
    ...mockReports[1],
    fullContent: `
## W-1 Permit Application - Davis Lease 4H

**Operator:** Apache Corporation  
**Proposed Well:** Davis Lease 4H  
**API Number:** 42-389-34567-00 (pending)  
**Filing Date:** January 10, 2025

### Permit Details

| Parameter | Value |
|-----------|-------|
| Well Type | Horizontal |
| Target Formation | Bone Spring Sand |
| Proposed TD | 18,500 ft |
| Lateral Length | 10,500 ft |
| Surface Location | Section 8, Block 56 |
| BHL Location | Section 8, Block 56 |

### Mineral Interest Impact

This permit directly affects your Inherited Lease interest in Reeves County. The proposed well lateral will traverse acreage in which you hold mineral rights.

### What This Means

1. **Development is coming**: Apache plans to develop your minerals with a horizontal well
2. **Timeline**: Permitting takes 30-60 days; drilling typically starts within 90 days of permit approval
3. **Your Interest**: Your NRI will apply to production from this new well

### Recommended Actions

- Verify your ownership is properly recorded in county deed records
- Watch for a Division Order from Apache (typically sent before first payment)
- Contact Apache's Land Department if you have questions: (432) 555-0100
    `,
    keyMetrics: [
      { label: "Proposed Lateral", value: "10,500 ft" },
      { label: "Target Formation", value: "Bone Spring" },
      { label: "Estimated Spud", value: "Q2 2025" },
    ],
    actions: [
      { label: "Verify Ownership Records", description: "Confirm your deed is properly recorded", priority: "recommended" },
      { label: "Watch for Division Order", description: "Apache will send before first payment", priority: "required" },
    ],
  },
];
