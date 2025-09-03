import React, { useState } from 'react';
import { ProductGrid } from '@/components/marketplace/ProductGrid';
import { SearchFilters } from '@/components/marketplace/SearchFilters';
import { CartProvider, ShoppingCart, CartButton } from '@/components/cart/ShoppingCart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Palette, Shirt, Users } from 'lucide-react';

export const MarketplacePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="max-w-6xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Fashion <span className="text-primary">Marketplace</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover AI-generated fashion designs, connect with artisans, and bring your style to life
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button size="lg" className="gap-2">
                <Sparkles className="w-5 h-5" />
                Create Design
              </Button>
              <CartButton />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>AI-Generated Designs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Browse thousands of unique fashion designs created by AI and talented creators
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shirt className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Custom Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Work with skilled artisans to bring your favorite designs to life with custom tailoring
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Global Community</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Connect with designers, artisans, and fashion enthusiasts from around the world
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Marketplace */}
        <section className="pb-20 px-4">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Browse Designs</h2>
                <p className="text-muted-foreground">
                  Explore our collection of fashion designs and find your next favorite piece
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <SearchFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              category={category}
              onCategoryChange={setCategory}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            {/* Product Grid */}
            <ProductGrid 
              searchQuery={searchQuery}
              category={category}
              sortBy={sortBy as 'recent' | 'popular' | 'trending'}
            />
          </div>
        </section>

        {/* Shopping Cart */}
        <ShoppingCart />
      </div>
    </CartProvider>
  );
};