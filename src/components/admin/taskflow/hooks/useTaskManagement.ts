
import { useState, useEffect } from "react";
import { Task } from "../TaskWorkflow";

export const useTaskManagement = () => {
  const [activeDay, setActiveDay] = useState("monday");
  const [stats, setStats] = useState({
    completed: 0,
    remaining: 0,
    progress: 0,
    highPriority: 0,
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    taskType: "all",
    team: "all",
    timeFilter: "",
  });

  useEffect(() => {
    const sampleTasks: Task[] = [
      {
        id: "m1",
        title: "Review Weekly Objectives",
        description: "Go over key priorities and goals, including digital marketing metrics, social media engagement, and lead conversion targets.",
        time: "8:00 - 8:30 AM",
        timeBlock: "Morning",
        day: "monday",
        completed: false,
        important: false,
      },
      {
        id: "m2",
        title: "Team Meeting with Sales Officers (SO)",
        description: "Conduct a strategic planning meeting with the sales team. Set weekly goals for social media promotions, lead generation, and conversion metrics.",
        time: "8:30 - 10:00 AM",
        timeBlock: "Morning",
        day: "monday",
        completed: false,
        important: true,
      },
      {
        id: "m3",
        title: "Market Trend & Social Media Analysis",
        description: "Analyze AI SaaS/MaaS market trends and assess competitor social media strategies.",
        time: "10:00 - 11:30 AM",
        timeBlock: "Morning",
        day: "monday",
        completed: false,
        important: false,
      },
      {
        id: "m4",
        title: "Social Media Campaign Planning",
        description: "Develop ideas for upcoming social media posts and promotions aligned with branding guidelines.",
        time: "11:30 AM - 12:30 PM",
        timeBlock: "Morning",
        day: "monday",
        completed: false,
        important: false,
      },
      {
        id: "m5",
        title: "Lead Generation and Conversion Strategy",
        description: "Work on refining lead generation strategies, including targeted social media ads and SEO.",
        time: "1:30 - 3:00 PM",
        timeBlock: "Afternoon",
        day: "monday",
        completed: false,
        important: false,
      },
      {
        id: "m6",
        title: "Cross-Department Collaboration",
        description: "Meet with product, customer service, and development teams to align digital marketing and lead generation goals with product releases.",
        time: "3:00 - 4:30 PM",
        timeBlock: "Afternoon",
        day: "monday",
        completed: false,
        important: false,
      },
      {
        id: "m7",
        title: "Employee Development and Training",
        description: "Plan digital marketing training sessions for the team to enhance skills in lead generation, social media, and conversion optimization.",
        time: "4:30 - 5:30 PM",
        timeBlock: "Afternoon",
        day: "monday",
        completed: false,
        important: false,
      },
      
      {
        id: "t1",
        title: "Campaign Performance Analysis",
        description: "Analyze performance metrics for social media campaigns (CTR, CPA, engagement rates).",
        time: "8:00 - 9:00 AM",
        timeBlock: "Morning",
        day: "tuesday",
        completed: false,
        important: false,
      },
      {
        id: "t2",
        title: "Content Creation and Branding for Social Media",
        description: "Collaborate with the creative team to develop upcoming social media posts focused on brand building and user engagement.",
        time: "9:00 - 10:30 AM",
        timeBlock: "Morning",
        day: "tuesday",
        completed: false,
        important: false,
      },
      {
        id: "t3",
        title: "Customer Engagement Strategy",
        description: "Develop a strategy for engaging with users directly on social media (comments, messages, feedback).",
        time: "10:30 - 12:30 PM",
        timeBlock: "Morning",
        day: "tuesday",
        completed: false,
        important: true,
      },
      {
        id: "t4",
        title: "Lead Generation and Conversion Optimization",
        description: "Analyze lead generation data and fine-tune strategies to optimize conversion rates.",
        time: "1:30 - 3:00 PM",
        timeBlock: "Afternoon",
        day: "tuesday",
        completed: false,
        important: false,
      },
      {
        id: "t5",
        title: "Campaign Creation and Review",
        description: "Finalize upcoming social media campaigns, including paid promotions and organic posts.",
        time: "3:00 - 5:30 PM",
        timeBlock: "Afternoon",
        day: "tuesday",
        completed: false,
        important: false,
      },
      
      {
        id: "w1",
        title: "Strategy Meeting with CEO",
        description: "Discuss social media performance, lead conversion rates, and digital marketing ROI.",
        time: "11:00 AM - 12:00 PM",
        timeBlock: "Morning",
        day: "wednesday",
        completed: false,
        important: true,
      },
      {
        id: "th1",
        title: "Social Media Post Finalization and Scheduling",
        description: "Finalize and schedule social media content for the following week.",
        time: "3:00 - 4:30 PM",
        timeBlock: "Afternoon",
        day: "thursday",
        completed: false,
        important: true,
      },
      {
        id: "f1",
        title: "Report Preparation for CEO",
        description: "Compile a detailed report summarizing weekly social media performance, digital marketing insights, and lead conversion rates.",
        time: "3:00 - 4:30 PM",
        timeBlock: "Afternoon",
        day: "friday",
        completed: false,
        important: true,
      },
    ];
    
    setTasks(sampleTasks);
  }, []);

  useEffect(() => {
    updateStats();
  }, [tasks]);

  const updateStats = () => {
    const completed = tasks.filter(task => task.completed).length;
    const total = tasks.length;
    const remaining = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    const highPriority = tasks.filter(task => task.important && !task.completed).length;

    setStats({
      completed,
      remaining,
      progress,
      highPriority,
    });
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed } 
        : task
    ));
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleAddTask = (newTask: {
    title: string;
    description: string;
    time: string;
    timeBlock: string;
    day: string;
    important: boolean;
  }) => {
    const task = {
      ...newTask,
      id: `${newTask.day}-${Date.now()}`,
      completed: false,
    };
    setTasks([...tasks, task]);
  };

  const getFilteredTasks = () => {
    return tasks.filter(task => 
      task.day === activeDay && 
      (filters.search ? 
        task.title.toLowerCase().includes(filters.search.toLowerCase()) || 
        task.description.toLowerCase().includes(filters.search.toLowerCase()) 
        : true)
    );
  };

  const getTimeBlocks = (filteredTasks: Task[]) => {
    return Array.from(new Set(filteredTasks.map(task => task.timeBlock)));
  };

  return {
    activeDay,
    setActiveDay,
    stats,
    tasks,
    filters,
    handleFilterChange,
    toggleTaskCompletion,
    handleAddTask,
    getFilteredTasks,
    getTimeBlocks
  };
};
