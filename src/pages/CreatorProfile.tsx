import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";
import { useCreatorStats } from "@/hooks/useCreatorStats";
import { useCreatorPortfolio } from "@/hooks/useCreatorPortfolio";
import { useFollowStatus } from "@/hooks/useFollowStatus";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, Image as ImageIcon, Users, UserPlus, UserMinus } from "lucide-react";
import { ImprovedImageGallery } from "@/components/gallery/ImprovedImageGallery";

const CreatorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { data: profile, isLoading: profileLoading } = useCreatorProfile(id);
  const { data: stats, isLoading: statsLoading } = useCreatorStats(id);
  const { data: portfolio, isLoading: portfolioLoading } = useCreatorPortfolio(id);
  const { isFollowing, toggleFollow, isToggling } = useFollowStatus(id);

  if (profileLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout
        seo={{
          title: "Creator Not Found",
          description: "The creator profile you're looking for could not be found.",
          noIndex: true
        }}
      >
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Creator Not Found</h1>
          <p className="text-muted-foreground">
            The creator profile you're looking for could not be found.
          </p>
        </div>
      </MainLayout>
    );
  }

  const creatorName = profile.display_name || `Creator ${profile.id.slice(0, 8)}`;
  const profileUrl = `${window.location.origin}/creator/${profile.id}`;

  return (
    <MainLayout
      seo={{
        title: `${creatorName} - Creator Profile`,
        description: profile.bio || `Discover amazing designs by ${creatorName}. View their portfolio and latest creations.`,
        canonicalUrl: profileUrl,
        ogImage: profile.avatar_url || undefined,
        ogType: "profile",
        keywords: ["creator", "fashion", "design", creatorName]
      }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {creatorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold">{creatorName}</h1>
                      {profile.bio && (
                        <p className="text-muted-foreground mt-2">{profile.bio}</p>
                      )}
                      {profile.location && (
                        <p className="text-sm text-muted-foreground mt-1">
                          📍 {profile.location}
                        </p>
                      )}
                      {profile.website && (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline mt-1 block"
                        >
                          🌐 {profile.website}
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {profile.is_creator ? "Creator" : "Member"}
                      </Badge>
                      <Button
                        onClick={toggleFollow}
                        disabled={isToggling}
                        variant={isFollowing ? "outline" : "default"}
                        size="sm"
                      >
                        {isFollowing ? (
                          <>
                            <UserMinus className="h-4 w-4 mr-2" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Follow
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <ImageIcon className="h-4 w-4 mr-2" />
                Designs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.designs_count || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Heart className="h-4 w-4 mr-2" />
                Total Likes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.total_likes || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Total Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.total_views || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Followers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.followers_count || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
          {portfolioLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : portfolio && portfolio.length > 0 ? (
            <div className="text-center py-8">No designs available</div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No designs yet</h3>
                <p className="text-muted-foreground">
                  This creator hasn't shared any designs yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CreatorProfile;