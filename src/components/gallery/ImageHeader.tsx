interface ImageHeaderProps {
  creator: {
    name: string;
    avatar: string;
  };
  timeAgo: string;
}

export const ImageHeader = ({ creator, timeAgo }: ImageHeaderProps) => {
  return (
    <div className="flex items-center space-x-2 mb-2">
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