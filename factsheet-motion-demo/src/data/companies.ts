export type Metric = {
  id: string;
  label: string;
  unit?: string;
  value: number;
  delta: number;
};

export type PerformancePoint = {
  month: string;
  fund: number;
  benchmark: number;
};

export type Company = {
  id: string;
  name: string;
  sector: string;
  description: string;
  metrics: Metric[];
  highlights: string[];
  performance: PerformancePoint[];
};

export const companies: Company[] = [
  {
    id: "solaris-growth",
    name: "Solaris Growth Fund",
    sector: "Renewable Infrastructure",
    description:
      "A diversified growth portfolio focused on solar and wind assets across North America.",
    metrics: [
      { id: "aum", label: "Assets under management", unit: "B", value: 4.6, delta: 0.12 },
      { id: "returnYtd", label: "Return YTD", unit: "%", value: 12.4, delta: 0.8 },
      { id: "esgScore", label: "ESG Score", value: 82, delta: 1.2 }
    ],
    highlights: [
      "Added three community solar projects with long-term PPAs.",
      "Improved grid integration reducing curtailment by 14%.",
      "Strengthened community impact reporting across all assets."
    ],
    performance: [
      { month: "Jan", fund: 100, benchmark: 100 },
      { month: "Feb", fund: 102.8, benchmark: 101.1 },
      { month: "Mar", fund: 104.1, benchmark: 102.6 },
      { month: "Apr", fund: 106.9, benchmark: 104.2 },
      { month: "May", fund: 109.4, benchmark: 105.8 },
      { month: "Jun", fund: 112.1, benchmark: 106.2 },
      { month: "Jul", fund: 115.8, benchmark: 108.7 },
      { month: "Aug", fund: 117.5, benchmark: 109.3 },
      { month: "Sep", fund: 118.7, benchmark: 108.9 },
      { month: "Oct", fund: 120.2, benchmark: 109.7 },
      { month: "Nov", fund: 123.5, benchmark: 111.2 },
      { month: "Dec", fund: 126.9, benchmark: 112.6 }
    ]
  },
  {
    id: "aurora-credit",
    name: "Aurora Sustainable Credit",
    sector: "Green Bonds",
    description:
      "Investment-grade credit strategy prioritising issuers funding the low-carbon transition.",
    metrics: [
      { id: "aum", label: "Assets under management", unit: "B", value: 7.9, delta: 0.05 },
      { id: "returnYtd", label: "Return YTD", unit: "%", value: 6.1, delta: 0.3 },
      { id: "esgScore", label: "ESG Score", value: 88, delta: 0.6 }
    ],
    highlights: [
      "Participated in Asia's largest green railway issuance.",
      "Introduced net-zero alignment screening for all issuers.",
      "Expanded stewardship outreach to 42 sovereign debt issuers."
    ],
    performance: [
      { month: "Jan", fund: 100, benchmark: 100 },
      { month: "Feb", fund: 100.6, benchmark: 100.8 },
      { month: "Mar", fund: 101.3, benchmark: 101.2 },
      { month: "Apr", fund: 102.4, benchmark: 101.9 },
      { month: "May", fund: 103.1, benchmark: 102.2 },
      { month: "Jun", fund: 103.8, benchmark: 102.7 },
      { month: "Jul", fund: 104.5, benchmark: 103.1 },
      { month: "Aug", fund: 105.2, benchmark: 103.6 },
      { month: "Sep", fund: 105.9, benchmark: 103.9 },
      { month: "Oct", fund: 106.4, benchmark: 104.1 },
      { month: "Nov", fund: 107.1, benchmark: 104.8 },
      { month: "Dec", fund: 107.8, benchmark: 105.2 }
    ]
  },
  {
    id: "lumen-innovation",
    name: "Lumen Innovation Trust",
    sector: "Climate Tech Venture",
    description:
      "Late-stage venture capital fund backing electrification and storage breakthroughs.",
    metrics: [
      { id: "aum", label: "Assets under management", unit: "B", value: 2.1, delta: 0.21 },
      { id: "returnYtd", label: "Return YTD", unit: "%", value: 18.9, delta: 1.5 },
      { id: "esgScore", label: "ESG Score", value: 79, delta: 0.9 }
    ],
    highlights: [
      "Closed Series D for solid-state battery leader Photonix.",
      "Exited VoltGrid with 3.4x MOIC via strategic sale.",
      "Launched founder-in-residence program for grid edge AI."
    ],
    performance: [
      { month: "Jan", fund: 100, benchmark: 100 },
      { month: "Feb", fund: 104.3, benchmark: 101.2 },
      { month: "Mar", fund: 107.5, benchmark: 102.6 },
      { month: "Apr", fund: 110.1, benchmark: 103.5 },
      { month: "May", fund: 115.2, benchmark: 105.1 },
      { month: "Jun", fund: 119.8, benchmark: 106.9 },
      { month: "Jul", fund: 125.1, benchmark: 108.2 },
      { month: "Aug", fund: 131.4, benchmark: 109.4 },
      { month: "Sep", fund: 138.8, benchmark: 110.3 },
      { month: "Oct", fund: 142.3, benchmark: 111.5 },
      { month: "Nov", fund: 149.7, benchmark: 112.8 },
      { month: "Dec", fund: 158.2, benchmark: 114.1 }
    ]
  }
];
