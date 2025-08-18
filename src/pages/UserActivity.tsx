import { MainLayout } from "@/components/layouts/MainLayout";
import { UserActivityTracker } from "@/components/user/UserActivityTracker";

const UserActivity = () => {
  return (
    <MainLayout
      seo={{
        title: "User Activity | Analytics Dashboard",
        description: "Monitor user activity, page views, and engagement metrics across your platform."
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              User Activity Analytics
            </h1>
            <p className="text-muted-foreground">
              Monitor user engagement, track popular pages, and analyze user behavior patterns.
            </p>
          </div>
          
          <UserActivityTracker />
        </div>
      </div>
    </MainLayout>
  );
};

export default UserActivity;