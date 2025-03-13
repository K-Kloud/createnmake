
interface CreatorInfoProps {
  creator: {
    name: string;
    avatar: string;
  };
  timeAgo: string;
  price?: string; // Add optional price prop
}

export const CreatorInfo = ({ creator, timeAgo, price }: CreatorInfoProps) => {
  // Use a default avatar if none is provided
  const avatarSrc = creator?.avatar || '/placeholder.svg';
  const displayName = creator?.name || 'Anonymous';

  return (
    <div className="flex items-center space-x-2">
      <img
        src={avatarSrc}
        alt={displayName}
        className="w-6 h-6 rounded-full"
      />
      <span className="text-sm font-medium">{displayName}</span>
      <span className="text-sm text-gray-400">{timeAgo}</span>
      {price && (
        <span className="text-sm font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
          {price}
        </span>
      )}
    </div>
  );
};
