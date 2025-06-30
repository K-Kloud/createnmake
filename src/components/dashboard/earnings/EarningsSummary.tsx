
import { ArrowUpRight } from "lucide-react";

interface EarningsSummaryProps {
  totalEarnings: number;
  lastMonth: number;
  percentageChange: string;
}

export const EarningsSummary = ({ 
  totalEarnings, 
  lastMonth, 
  percentageChange 
}: EarningsSummaryProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Total Earnings</p>
        <div className="flex items-end gap-1">
          <h3 className="text-2xl font-bold">£{totalEarnings.toLocaleString()}</h3>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">This Month</p>
        <div className="flex items-end gap-1">
          <h3 className="text-2xl font-bold">£{lastMonth.toLocaleString()}</h3>
          <span className={`text-xs pb-1 flex items-center ${Number(percentageChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Number(percentageChange) >= 0 ? '+' : ''}{percentageChange}%
            {Number(percentageChange) >= 0 ? 
              <ArrowUpRight className="h-3 w-3" /> : 
              <ArrowUpRight className="h-3 w-3 rotate-180" />
            }
          </span>
        </div>
      </div>
    </div>
  );
};
