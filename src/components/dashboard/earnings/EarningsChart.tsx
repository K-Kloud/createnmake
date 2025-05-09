
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface EarningsChartProps {
  data: Array<{
    name: string;
    amount: number;
  }>;
}

export const EarningsChart = ({ data }: EarningsChartProps) => {
  return (
    <div className="h-[180px] mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 5,
            left: 0,
            bottom: 5,
          }}
        >
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <YAxis hide />
          <Tooltip 
            formatter={(value) => [`$${value}`, 'Earnings']}
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
              border: 'none', 
              borderRadius: '4px',
              color: '#fff' 
            }}
          />
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ffa3" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#00ffa3" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#00ffa3"
            fillOpacity={1}
            fill="url(#colorAmount)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
