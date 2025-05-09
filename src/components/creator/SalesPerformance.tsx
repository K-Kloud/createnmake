
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

interface SalesPerformanceProps {
  creatorId: string;
}

export const SalesPerformance = ({ creatorId }: SalesPerformanceProps) => {
  const [timeframe, setTimeframe] = useState("week");
  
  // Sample data - would be fetched from the database in a real app
  const salesData = [
    { date: "Mon", sales: 5, revenue: 250, views: 120 },
    { date: "Tue", sales: 7, revenue: 350, views: 145 },
    { date: "Wed", sales: 10, revenue: 500, views: 160 },
    { date: "Thu", sales: 8, revenue: 400, views: 190 },
    { date: "Fri", sales: 12, revenue: 600, views: 220 },
    { date: "Sat", sales: 15, revenue: 750, views: 250 },
    { date: "Sun", sales: 11, revenue: 550, views: 200 },
  ];

  const productPerformance = [
    { name: "Modern Chair", sales: 45, revenue: 2250 },
    { name: "Minimalist Lamp", sales: 32, revenue: 1600 },
    { name: "Artisan Table", sales: 28, revenue: 4200 },
    { name: "Ceramic Vase", sales: 25, revenue: 1250 },
    { name: "Wall Art", sales: 20, revenue: 1000 },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="customers">Customer Demographics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="flex justify-end mb-4">
            <TabsList>
              <TabsTrigger 
                value="week" 
                onClick={() => setTimeframe("week")}
                className={timeframe === "week" ? "bg-primary text-primary-foreground" : ""}
              >
                Week
              </TabsTrigger>
              <TabsTrigger 
                value="month" 
                onClick={() => setTimeframe("month")}
                className={timeframe === "month" ? "bg-primary text-primary-foreground" : ""}
              >
                Month
              </TabsTrigger>
              <TabsTrigger 
                value="year" 
                onClick={() => setTimeframe("year")}
                className={timeframe === "year" ? "bg-primary text-primary-foreground" : ""}
              >
                Year
              </TabsTrigger>
            </TabsList>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Sales Over Time</CardTitle>
              <CardDescription>Track your sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={salesData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Product Views vs. Sales</CardTitle>
              <CardDescription>Conversion metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={salesData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#8884d8" />
                  <Bar dataKey="sales" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Products with highest sales volume</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={productPerformance}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" />
                  <Bar dataKey="revenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Demographics</CardTitle>
              <CardDescription>Insights about your customer base</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Demographics data will be available once you have more sales.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
