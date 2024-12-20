import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ArtisanOverviewProps {
  artisan: any;
}

export const ArtisanOverview = ({ artisan }: ArtisanOverviewProps) => {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
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
  );
};