
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddTaskDialogProps {
  onTaskAdd: (task: {
    title: string;
    description: string;
    time: string;
    timeBlock: string;
    day: string;
    important: boolean;
  }) => void;
}

export const AddTaskDialog = ({ onTaskAdd }: AddTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");
  const [timeBlock, setTimeBlock] = useState("Morning");
  const [day, setDay] = useState("monday");
  const [important, setImportant] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTaskAdd({
      title,
      description,
      time,
      timeBlock,
      day,
      important,
    });
    setOpen(false);
    // Reset form
    setTitle("");
    setDescription("");
    setTime("");
    setTimeBlock("Morning");
    setDay("monday");
    setImportant(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Task</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Create a new task for your workflow. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g. 9:00 AM - 10:00 AM"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeBlock">Time Block</Label>
            <Select value={timeBlock} onValueChange={setTimeBlock}>
              <SelectTrigger>
                <SelectValue placeholder="Select time block" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Morning">Morning</SelectItem>
                <SelectItem value="Afternoon">Afternoon</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="day">Day</Label>
            <Select value={day} onValueChange={setDay}>
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="tuesday">Tuesday</SelectItem>
                <SelectItem value="wednesday">Wednesday</SelectItem>
                <SelectItem value="thursday">Thursday</SelectItem>
                <SelectItem value="friday">Friday</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={important}
              onChange={(e) => setImportant(e.target.checked)}
              className="checkbox"
            />
            <span>Mark as important</span>
          </label>
          <DialogFooter>
            <Button type="submit">Add Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
