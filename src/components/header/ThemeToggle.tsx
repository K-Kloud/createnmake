
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

interface ThemeToggleProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

export const ThemeToggle = ({ isDarkMode, setIsDarkMode }: ThemeToggleProps) => {
  const { toast } = useToast();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    toast({
      title: `${isDarkMode ? 'Light' : 'Dark'} mode activated`,
      description: `Switched to ${isDarkMode ? 'light' : 'dark'} theme.`,
    });
  };

  return (
    <div className="flex items-center space-x-2 mr-2">
      <Switch
        checked={isDarkMode}
        onCheckedChange={toggleTheme}
        className="data-[state=checked]:bg-secondary transition-colors"
      />
    </div>
  );
};
