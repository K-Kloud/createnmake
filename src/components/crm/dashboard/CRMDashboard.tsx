
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CRMDashboardSkeleton } from "./CRMDashboardSkeleton";
import { CRMStatCards } from "./CRMStatCards";
import { CRMTabContent } from "./CRMTabContent";
import { CRMActionButtons } from "./CRMActionButtons";
import { useCRMTasks } from "./useCRMTasks";
import { useState } from "react";

export const CRMDashboard = () => {
  const { tasks, stats, isLoading } = useCRMTasks();
  const [activeTab, setActiveTab] = useState("list");

  if (isLoading) return <CRMDashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold">CRM Dashboard</h1>
        <CRMActionButtons />
      </div>

      <CRMStatCards stats={stats} />

      <Tabs defaultValue="list" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="google-sheets">Google Sheets</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-6">
          <CRMTabContent activeTab={activeTab} tasks={tasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
