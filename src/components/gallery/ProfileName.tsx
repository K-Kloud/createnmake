import { useCreatorProfile } from "@/hooks/useCreatorProfile";
import { getFallbackUsername } from "@/utils/usernameUtils";

interface ProfileNameProps {
  userId: string;
  fallbackName?: string;
  className?: string;
}

export const ProfileName = ({ userId, fallbackName, className = "font-bold text-white text-sm" }: ProfileNameProps) => {
  const { data: profile } = useCreatorProfile(userId);
  
  const displayName = profile?.display_name || 
    fallbackName || 
    getFallbackUsername(
      undefined, // email
      userId,    // userId
      undefined, // displayName
      undefined, // firstName
      undefined  // lastName
    ) || 'User';
  
  return (
    <span className={className}>
      {displayName}
    </span>
  );
};