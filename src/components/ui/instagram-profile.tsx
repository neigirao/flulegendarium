
import { memo } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Instagram, User } from 'lucide-react';

interface InstagramProfileProps {
  playerName: string;
  className?: string;
  showLink?: boolean;
  avatarSize?: 'sm' | 'md' | 'lg';
}

const getInstagramHandle = (playerName: string): string | null => {
  const match = playerName.match(/@([a-zA-Z0-9._]+)/);
  return match ? match[1] : null;
};

const getDisplayName = (playerName: string): string => {
  return playerName.replace(/\s*\(@[a-zA-Z0-9._]+\)/, '').trim();
};

export const InstagramProfile = memo(({ 
  playerName, 
  className = '',
  showLink = true,
  avatarSize = 'sm'
}: InstagramProfileProps) => {
  const instagramHandle = getInstagramHandle(playerName);
  const displayName = getDisplayName(playerName);

  const avatarSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  if (!instagramHandle) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Avatar className={avatarSizes[avatarSize]}>
          <AvatarFallback className="bg-gray-100">
            <User className="w-3 h-3 text-gray-400" />
          </AvatarFallback>
        </Avatar>
        <span>{displayName}</span>
      </div>
    );
  }

  const instagramUrl = `https://instagram.com/${instagramHandle}`;
  const instagramImageUrl = `https://instagram.com/${instagramHandle}/profile-picture`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Avatar className={avatarSizes[avatarSize]}>
        <AvatarImage 
          src={`https://unavatar.io/instagram/${instagramHandle}`}
          alt={`${instagramHandle} no Instagram`}
          onError={(e) => {
            // Fallback para quando não conseguir carregar a imagem
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <Instagram className="w-3 h-3" />
        </AvatarFallback>
      </Avatar>
      
      {showLink ? (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-flu-grena transition-colors hover:underline flex items-center gap-1"
        >
          {displayName}
          <Instagram className="w-3 h-3 text-gray-400" />
        </a>
      ) : (
        <span className="flex items-center gap-1">
          {displayName}
          <Instagram className="w-3 h-3 text-gray-400" />
        </span>
      )}
    </div>
  );
});

InstagramProfile.displayName = 'InstagramProfile';
