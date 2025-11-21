/**
 * ProfileBadges Component
 * Displays player achievement badges
 */

interface ProfileBadgesProps {
  badges: (string | null | undefined)[];
}

export default function ProfileBadges({ badges }: ProfileBadgesProps) {
  const validBadges = badges.filter((badge): badge is string => !!badge);

  if (validBadges.length === 0) {
    return null;
  }

  return (
    <div className="flex ml-1 items-center gap-1">
      {validBadges.map((badge, index) => (
        <img
          key={`${badge}-${index}`}
          src={`/badges/${badge}.png`}
          alt={`Badge ${badge}`}
          className="max-md:w-4 max-md:h-4 md:w-8 md:h-8 rounded-sm"
        />
      ))}
    </div>
  );
}
