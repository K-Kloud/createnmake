
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-8">
            Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or never existed.
          </p>
          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/">Return to Home</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
