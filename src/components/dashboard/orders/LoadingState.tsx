
export const LoadingState = () => {
  return (
    <div className="space-y-2">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="w-full h-16 rounded-lg bg-card/50 animate-pulse" />
      ))}
    </div>
  );
};
