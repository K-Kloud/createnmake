import { MainLayout } from "@/components/layouts/MainLayout";
import { PerformanceMonitor } from "@/components/analytics/PerformanceMonitor";

const Performance = () => {
  return (
    <MainLayout
      seo={{
        title: "Performance Monitor | System Analytics",
        description: "Real-time system performance monitoring with CPU, memory, network, and response time metrics."
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Performance Monitor
            </h1>
            <p className="text-muted-foreground">
              Real-time system performance metrics, alerts, and resource monitoring.
            </p>
          </div>
          
          <PerformanceMonitor />
        </div>
      </div>
    </MainLayout>
  );
};

export default Performance;