
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  List, 
  BarChart, 
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-mobile";

interface CRMLayoutProps {
  children: React.ReactNode;
  currentTab?: string;
}

export const CRMLayout = ({ children, currentTab = "dashboard" }: CRMLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Auto-close sidebar on mobile
  const effectiveSidebarOpen = isMobile ? false : sidebarOpen;

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/crm" },
    { icon: Users, label: "Contacts", href: "/crm/contacts" },
    { icon: List, label: "Tasks", href: "/crm/tasks" },
    { icon: Calendar, label: "Calendar", href: "/crm/calendar" },
    { icon: BarChart, label: "Analytics", href: "/crm/analytics" },
    { icon: MessageCircle, label: "Communications", href: "/crm/communications" }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-grow flex">
        {/* Sidebar */}
        <aside 
          className={cn(
            "bg-card border-r transition-all duration-300 flex flex-col",
            effectiveSidebarOpen ? "w-64" : "w-16"
          )}
        >
          <div className="p-4 border-b flex justify-between items-center">
            {effectiveSidebarOpen && <span className="font-semibold">CRM</span>}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-full hover:bg-muted"
            >
              {effectiveSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>
          <nav className="flex-1 py-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a 
                    href={item.href} 
                    className={cn(
                      "flex items-center py-2 px-4 hover:bg-muted rounded-md mx-2",
                      currentTab === item.label.toLowerCase() && "bg-primary/10 text-primary"
                    )}
                  >
                    <item.icon size={20} />
                    {effectiveSidebarOpen && <span className="ml-3">{item.label}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
};
