import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, BookOpen, Star, Award, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const WorkflowTemplates = () => {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["workflow-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workflow_templates")
        .select("*")
        .eq("featured", true)
        .order("view_count", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "advanced":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-label="Loading workflow templates">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-ghost-white/10 rounded-none p-6 bg-void-black/50 animate-pulse">
            <div className="h-6 bg-ghost-white/10 rounded mb-4"></div>
            <div className="h-4 bg-ghost-white/10 rounded mb-2"></div>
            <div className="h-4 bg-ghost-white/10 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-6" aria-labelledby="workflow-templates-heading">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-acid-lime" aria-hidden="true" />
          <h2 id="workflow-templates-heading" className="text-xl font-mono uppercase tracking-widest text-ghost-white">
            PROFESSIONAL_WORKFLOWS
          </h2>
        </div>
        <Button
          variant="outline"
          className="border-acid-lime/20 text-acid-lime hover:bg-acid-lime/10"
          aria-label="View all workflow templates"
        >
          View All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Featured workflow templates">
        {templates?.map((template) => (
          <article
            key={template.id}
            className="group border border-ghost-white/10 rounded-none p-6 bg-void-black/50 hover:border-acid-lime/30 transition-colors space-y-4"
            role="listitem"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-ghost-white group-hover:text-acid-lime transition-colors">
                  {template.title}
                </h3>
                {template.difficulty_level && (
                  <Badge
                    variant="outline"
                    className={`text-xs uppercase tracking-wider ${getDifficultyColor(template.difficulty_level)}`}
                    aria-label={`Difficulty: ${template.difficulty_level}`}
                  >
                    {template.difficulty_level}
                  </Badge>
                )}
              </div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
                {template.category}
              </p>
            </div>

            {template.description && (
              <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                {template.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2" role="list" aria-label="Required tools">
              {template.tools_required?.slice(0, 3).map((tool, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-mono uppercase tracking-wider border border-ghost-white/10 text-slate-400 rounded-none"
                  role="listitem"
                >
                  {tool}
                </span>
              ))}
              {template.tools_required && template.tools_required.length > 3 && (
                <span className="px-2 py-1 text-xs font-mono text-slate-500">
                  +{template.tools_required.length - 3} more
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-ghost-white/10">
              <div className="text-center" role="group" aria-label="Estimated time">
                <Clock className="h-4 w-4 mx-auto mb-1 text-slate-400" aria-hidden="true" />
                <p className="text-xs text-slate-500">{template.estimated_time_minutes}min</p>
              </div>
              <div className="text-center" role="group" aria-label="View count">
                <TrendingUp className="h-4 w-4 mx-auto mb-1 text-slate-400" aria-hidden="true" />
                <p className="text-xs text-slate-500">{template.view_count} views</p>
              </div>
              <div className="text-center" role="group" aria-label="Completion count">
                <Users className="h-4 w-4 mx-auto mb-1 text-slate-400" aria-hidden="true" />
                <p className="text-xs text-slate-500">{template.completion_count} done</p>
              </div>
            </div>

            <Button
              className="w-full bg-acid-lime text-void-black hover:bg-acid-lime/90 group-hover:shadow-lg transition-shadow"
              aria-label={`Start ${template.title} workflow`}
            >
              Start Workflow
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
};
