
import { Button } from "@/components/ui/button";

interface DaySelectorProps {
  activeDay: string;
  setActiveDay: (day: string) => void;
}

export const DaySelector = ({ activeDay, setActiveDay }: DaySelectorProps) => {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  
  return (
    <div className="flex overflow-x-auto pb-2">
      {days.map((day) => (
        <Button
          key={day}
          variant={activeDay === day ? "default" : "outline"}
          className="min-w-[100px] capitalize mr-2"
          onClick={() => setActiveDay(day)}
        >
          {day}
        </Button>
      ))}
    </div>
  );
};
