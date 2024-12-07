import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, Image, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://github.com/shadcn.png",
    credits: 100,
    imagesGenerated: 25,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 py-24">
        <div className="flex flex-col md:flex-row gap-8">
          {/* User Profile Section */}
          <Card className="flex-1 glass-card">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-gray-400">{user.email}</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <div className="flex-[2] grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-4xl font-bold">{user.credits}</p>
                  <Button variant="outline">Buy More</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Images Generated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{user.imagesGenerated}</p>
              </CardContent>
            </Card>

            <Card className="glass-card col-span-full">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => navigate("/create")}>
                    <Image className="mr-2 h-4 w-4" />
                    Create New Image
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/gallery")}>
                    <History className="mr-2 h-4 w-4" />
                    View Gallery
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;