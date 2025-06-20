
export const cronJobs = [
  {
    name: "daily-maintenance",
    schedule: "0 2 * * *", // Every day at 2 AM UTC
    function: "daily-maintenance",
    description: "Clean up expired data and maintain system health"
  },
  {
    name: "user-engagement",
    schedule: "0 10 * * *", // Every day at 10 AM UTC
    function: "user-engagement-automation",
    description: "Send engagement notifications and reminders"
  },
  {
    name: "weekly-analytics",
    schedule: "0 9 * * 1", // Every Monday at 9 AM UTC
    function: "weekly-analytics",
    description: "Generate weekly analytics and insights"
  }
];
