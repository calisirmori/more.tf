/**
 * ProfileAvatar Component
 * Displays player avatar with country flag overlay
 */

interface ProfileAvatarProps {
  avatarUrl: string;
  countryCode?: string;
  alt?: string;
}

export default function ProfileAvatar({ avatarUrl, countryCode, alt = 'Player Avatar' }: ProfileAvatarProps) {
  return (
    <div className="relative">
      <img
        src={avatarUrl}
        alt={alt}
        className="max-md:w-16 max-md:h-16 md:w-28 md:h-28 rounded-full border-4 border-lightscale-2"
      />
      {countryCode && (
        <img
          src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
          alt={countryCode}
          className="absolute max-md:bottom-1 md:bottom-3 right-0 max-md:w-[24px] md:w-[30px] max-md:h-[16px] md:h-[20px] rounded-sm border border-warmscale-8"
        />
      )}
    </div>
  );
}
