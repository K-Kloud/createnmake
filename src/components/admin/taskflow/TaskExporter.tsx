
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Task } from './TaskWorkflow';

export const exportTaskReport = (tasks: Task[]) => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Digital Marketing Workflow Report', 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Add task statistics
  const completed = tasks.filter(task => task.completed).length;
  const total = tasks.length;
  const remaining = total - completed;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const highPriority = tasks.filter(task => task.important && !task.completed).length;
  
  doc.text('Task Statistics:', 14, 40);
  doc.text(`Total Tasks: ${total}`, 20, 48);
  doc.text(`Completed Tasks: ${completed}`, 20, 56);
  doc.text(`Remaining Tasks: ${remaining}`, 20, 64);
  doc.text(`Progress: ${progress}%`, 20, 72);
  doc.text(`High Priority Tasks: ${highPriority}`, 20, 80);
  
  // Add simple charts
  createProgressChart(doc, progress, 120, 60);
  createTaskStatusChart(doc, completed, remaining, 120, 120);
  
  // Move to next page
  doc.addPage();
  
  // Group tasks by day
  const tasksByDay = groupTasksByDay(tasks);
  
  // Add task tables by day
  let yPosition = 20;
  Object.entries(tasksByDay).forEach(([day, dayTasks]) => {
    // Add day header
    doc.setFontSize(14);
    doc.text(capitalizeFirstLetter(day), 14, yPosition);
    yPosition += 10;
    
    // Create table for completed tasks
    const completedTasks = dayTasks.filter(task => task.completed);
    if (completedTasks.length > 0) {
      doc.setFontSize(12);
      doc.text('Completed Tasks:', 14, yPosition);
      yPosition += 8;
      
      addTaskTable(doc, completedTasks, yPosition);
      yPosition += completedTasks.length * 12 + 15;
    }
    
    // Create table for pending tasks
    const pendingTasks = dayTasks.filter(task => !task.completed);
    if (pendingTasks.length > 0) {
      doc.setFontSize(12);
      doc.text('Pending Tasks:', 14, yPosition);
      yPosition += 8;
      
      addTaskTable(doc, pendingTasks, yPosition);
      yPosition += pendingTasks.length * 12 + 15;
    }
    
    // Add page if needed
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
  });
  
  // Save the PDF
  doc.save('task-workflow-report.pdf');
};

const createProgressChart = (doc: jsPDF, progress: number, x: number, y: number) => {
  // Draw progress chart (simple circle)
  const radius = 20;
  
  // Draw background circle
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(240, 240, 240);
  doc.circle(x, y, radius, 'FD');
  
  // Draw progress arc
  doc.setDrawColor(41, 128, 185);
  doc.setFillColor(52, 152, 219);
  
  // We can only draw a full circle, so we'll draw a filled text instead
  doc.setFontSize(14);
  doc.setTextColor(52, 152, 219);
  doc.text(`${progress}%`, x - 8, y + 5);
  
  // Add legend
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Progress', x - 15, y + radius + 10);
};

const createTaskStatusChart = (doc: jsPDF, completed: number, remaining: number, x: number, y: number) => {
  // Draw task status bar chart (simple horizontal bars)
  const barWidth = 80;
  const barHeight = 10;
  
  // Completed tasks bar
  doc.setFillColor(46, 204, 113);
  doc.rect(x, y, (completed / (completed + remaining)) * barWidth, barHeight, 'F');
  
  // Remaining tasks bar
  doc.setFillColor(231, 76, 60);
  doc.rect(x + (completed / (completed + remaining)) * barWidth, y, 
           (remaining / (completed + remaining)) * barWidth, barHeight, 'F');
  
  // Add legend
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text('Completed', x, y + barHeight + 8);
  doc.text('Remaining', x + barWidth - 30, y + barHeight + 8);
};

const addTaskTable = (doc: jsPDF, tasks: Task[], yPosition: number) => {
  const tableData = tasks.map(task => [
    task.title,
    task.time,
    task.important ? 'Yes' : 'No'
  ]);
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Task Title', 'Time', 'Important']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [52, 73, 94] },
    margin: { left: 14, right: 14 }
  });
};

const groupTasksByDay = (tasks: Task[]) => {
  return tasks.reduce((acc, task) => {
    if (!acc[task.day]) {
      acc[task.day] = [];
    }
    acc[task.day].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
};

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
