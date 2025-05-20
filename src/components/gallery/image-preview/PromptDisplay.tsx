
interface PromptDisplayProps {
  isVisible: boolean;
  prompt: string;
}

export const PromptDisplay = ({ isVisible, prompt }: PromptDisplayProps) => {
  if (!isVisible || !prompt) return null;
  
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
      <p className="text-white text-sm md:text-base">{prompt}</p>
    </div>
  );
};
