import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Sparkles, TrendingUp, Users, Layers } from "lucide-react";

export const TechnicalTabs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'explore';
  const { t } = useTranslation('marketplace');

  const tabs = [
    { id: "explore", label: t('categories.all'), icon: Layers, color: "from-blue-500 to-cyan-500" },
    { id: "trending", label: t('filters.mostPopular'), icon: TrendingUp, color: "from-orange-500 to-red-500" },
    { id: "creators", label: t('product.createdBy'), icon: Users, color: "from-purple-500 to-pink-500" },
    { id: "collections", label: t('titles.featuredCollections'), icon: Sparkles, color: "from-emerald-500 to-teal-500" },
  ];

  const handleTabChange = (value: string) => {
    setSearchParams(prev => {
      prev.set('tab', value);
      return prev;
    });
  };

  return (
    <div className="mb-8">
      <div className="relative">
        {/* Technical background */}
        <div className="absolute inset-0 bg-background/40 backdrop-blur-xl rounded-lg border border-border/50" />
        
        {/* Tabs container */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-2 p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "relative group px-4 py-3 rounded-lg transition-all duration-300",
                  "border font-mono text-sm",
                  isActive
                    ? "bg-primary/10 border-primary/50 text-primary shadow-lg shadow-primary/20"
                    : "bg-background/50 border-border/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <>
                    <div className="absolute inset-0 rounded-lg overflow-hidden">
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-r opacity-10",
                        tab.color
                      )} />
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    </div>
                  </>
                )}

                {/* Content */}
                <div className="relative flex items-center justify-center gap-2">
                  <Icon className={cn(
                    "w-4 h-4 transition-transform duration-300",
                    isActive ? "scale-110" : "group-hover:scale-105"
                  )} />
                  <span className="hidden sm:inline text-xs">{tab.label}</span>
                </div>

                {/* Hover effect */}
                <div className={cn(
                  "absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300",
                  "bg-gradient-to-r",
                  tab.color,
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                )} />

                {/* Technical corner accents */}
                {isActive && (
                  <>
                    <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-primary/50" />
                    <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-primary/50" />
                    <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-primary/50" />
                    <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-primary/50" />
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Status bar */}
        <div className="relative mt-3 px-2 pb-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <span>TAB_NAVIGATION // ACTIVE</span>
            </div>
            <div className="flex gap-1">
              {tabs.map((tab, idx) => (
                <div
                  key={tab.id}
                  className={cn(
                    "h-1 w-6 rounded-full transition-all duration-300",
                    activeTab === tab.id ? "bg-primary" : "bg-border/50"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
