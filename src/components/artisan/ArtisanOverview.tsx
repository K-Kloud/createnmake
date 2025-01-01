import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { User, FileText, MessageSquare, CheckSquare, ListChecks } from "lucide-react";

interface ArtisanOverviewProps {
  artisan: any;
  stats?: {
    requested: number;
    accepted: number;
    completed: number;
  };
}

export const ArtisanOverview = ({ artisan, stats }: ArtisanOverviewProps) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Profile Card */}
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Business Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <p>
                <span className="font-medium">Username:</span>{" "}
                {artisan?.username || "Not set"}
              </p>
              <p>
                <span className="font-medium">Member since:</span>{" "}
                {new Date(artisan?.created_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          icon={MessageSquare}
          title="Requested Quotes"
          value={stats?.requested || 0}
        />
        <StatsCard
          icon={CheckSquare}
          title="Accepted Works"
          value={stats?.accepted || 0}
        />
        <StatsCard
          icon={ListChecks}
          title="Completed Works"
          value={stats?.completed || 0}
        />
      </div>
    </div>
  );
};