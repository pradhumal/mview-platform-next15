import { TrendingDown } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from "recharts";

const mockProductionData = [
  { month: "Aug", value: 1200 },
  { month: "Sep", value: 1150 },
  { month: "Oct", value: 1100 },
  { month: "Nov", value: 1080 },
  { month: "Dec", value: 1050 },
  { month: "Jan", value: 1020 },
];

export function MiniProductionChart() {
  const percentChange = -5;
  
  return (
    <div className="rounded-xl bg-secondary/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-info/20 flex items-center justify-center">
            <TrendingDown className="w-3.5 h-3.5 text-info" />
          </div>
          <span className="text-xs font-medium text-foreground">Production Trend</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {percentChange}% this period
        </span>
      </div>
      
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockProductionData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--info))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--info))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              interval={1}
            />
            <YAxis hide domain={['dataMin - 50', 'dataMax + 50']} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--info))"
              strokeWidth={2}
              fill="url(#productionGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        Normal decline pattern for well age
      </p>
    </div>
  );
}
