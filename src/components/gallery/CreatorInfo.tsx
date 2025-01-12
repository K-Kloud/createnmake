interface CreatorInfoProps {
  creator: {
    name: string;
    avatar: string;
  };
  timeAgo: string;
}

export const CreatorInfo = ({ creator, timeAgo }: CreatorInfoProps) => {
  return (
    <div className="flex items-center space-x-2">
      <img
        src={creator.avatar}
        alt={creator.name}
        className="w-6 h-6 rounded-full"
      />
      <span className="text-sm font-medium">{creator.name}</span>
      <span className="text-sm text-gray-400">{timeAgo}</span>
    </div>
  );
};