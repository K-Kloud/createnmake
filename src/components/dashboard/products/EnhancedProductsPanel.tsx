import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";
import { LoadingState } from "@/components/ui/loading-state";
import { useState } from "react";
import { 
  Package, 
  TrendingUp, 
  Eye, 
  Heart, 
  Search,
  Filter,
  BarChart3,
  Plus
} from "lucide-react";

export const EnhancedProductsPanel = () => {
  const navigate = useNavigate();
  const { data: analytics, isLoading, error } = useProductAnalytics();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleViewAll = () => {
    navigate("/products");
  };

  const handleCreate = () => {
    navigate("/create");
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <LoadingState isLoading={true} error={null}>
            <div>Loading product analytics...</div>
          </LoadingState>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Unable to load product analytics
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredPerformers = analytics.topPerformers.filter(product => 
    selectedCategory === "all" || 
    product.title.toLowerCase().includes(selectedCategory.toLowerCase())
  ).filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{analytics.totalProducts}</div>
                <div className="text-sm text-muted-foreground">Total Products</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{analytics.totalLikes.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Likes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Conversion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top Performing Products
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create
            </Button>
            <Button variant="outline" size="sm" onClick={handleViewAll}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Products List */}
          {filteredPerformers.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No products found</p>
              <Button onClick={handleCreate}>Create Your First Product</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPerformers.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium mb-1">{product.title}</div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {product.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {product.likes}
                      </span>
                      <span>Price: £{product.price}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">£{product.revenue.toLocaleString()}</div>
                    <Badge variant="outline" className="text-xs">
                      Estimated Revenue
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.categoryBreakdown.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary" style={{
                    backgroundColor: `hsl(${200 + index * 40}, 70%, 50%)`
                  }} />
                  <span className="font-medium">{category.category}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{category.count} products</div>
                  <div className="text-sm text-muted-foreground">
                    £{category.revenue.toLocaleString()} revenue
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {analytics.performanceMetrics.map((metric, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">{metric.metric}</div>
                <Badge variant={metric.change >= 0 ? "default" : "destructive"} className="mt-2">
                  {metric.change >= 0 ? '+' : ''}{metric.change}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};