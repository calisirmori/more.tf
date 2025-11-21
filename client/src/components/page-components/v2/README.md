# V2 Components

This directory contains the refactored, clean version 2 components for more.tf.

## Philosophy

All v2 components follow these principles:
- **Clean Code**: Proper separation of concerns, no duplicate logic
- **Type Safety**: Full TypeScript coverage with proper interfaces
- **Reusability**: Components are broken down into small, reusable pieces
- **Maintainability**: Clear file structure and naming conventions
- **Performance**: Optimized rendering and data fetching

## Directory Structure

```
v2/
├── profile/              # Profile page components
│   ├── components/       # Reusable profile sub-components
│   │   ├── ProfileAvatar.tsx
│   │   ├── ProfileBadges.tsx
│   │   ├── ProfileHeader.tsx
│   │   ├── ProfileTabs.tsx
│   │   ├── SocialLinks.tsx
│   │   └── tabs/         # Tab-specific content components
│   │       ├── ActivityTab.tsx
│   │       ├── GalleryTab.tsx
│   │       ├── MatchesTab.tsx
│   │       ├── OverviewTab.tsx
│   │       └── PeersTab.tsx
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── index.tsx         # Main ProfileV2 page
│
└── log/                  # Log viewer components
    ├── KillsByClassSection.tsx
    ├── LogHeader.tsx
    ├── MedicStatsSection.tsx
    ├── RoundSection.tsx
    ├── StatsTable.tsx
    ├── TeamSummaryTable.tsx
    ├── types.ts
    └── index.tsx         # Main LogV2 page
```

## Profile Components

### Main Component
- **ProfileV2** (`profile/index.tsx`): Main page component that handles data fetching and tab routing

### Sub-Components
- **ProfileHeader**: Composite header with background, avatar, badges, and tabs
- **ProfileAvatar**: Avatar image with country flag overlay
- **ProfileBadges**: Achievement badges display
- **ProfileTabs**: Tab navigation (desktop + mobile)
- **SocialLinks**: Social media and league links (desktop + mobile dropdown)

### Tab Components
Each tab is a separate component for better code splitting:
- **OverviewTab**: Player overview and statistics
- **MatchesTab**: Match history
- **PeersTab**: Teammates and opponents
- **ActivityTab**: Activity timeline
- **GalleryTab**: Card collection and achievements

### Types
All TypeScript interfaces are centralized in `profile/types/index.ts`:
- `SteamProfile`
- `RGLProfile`
- `ProfileData`
- `ProfileTab`
- And more...

## Routes

### Profile Routes
- `/v2/profile/:playerId` - Main profile page (defaults to overview tab)
- `/v2/profile/:playerId/overview` - Overview tab
- `/v2/profile/:playerId/matches` - Matches tab
- `/v2/profile/:playerId/peers` - Peers tab
- `/v2/profile/:playerId/activity` - Activity tab
- `/v2/profile/:playerId/gallery` - Gallery tab

### Log Routes
- `/log/v2/:id` - Log viewer (v2 design)

## Development Guidelines

### Adding New Components
1. Create component file in appropriate directory
2. Add TypeScript interfaces in `types/` directory
3. Keep components focused on single responsibility
4. Use proper prop typing
5. Document complex logic with comments

### Component Structure
```tsx
/**
 * Component description
 * What it does and when to use it
 */

import statements...

interface ComponentProps {
  // Properly typed props
}

export default function ComponentName({ props }: ComponentProps) {
  // Component logic
}
```

### Styling
- Use Tailwind CSS classes
- Follow existing color scheme (warm-*, light-*, brand-orange)
- Ensure mobile responsiveness
- Use `max-md:` and `md:` prefixes for responsive design

## API Integration

Profile data is fetched from `/api/profile-data/:playerId` endpoint which returns:
```typescript
{
  playerSteamInfo: SteamProfile;
  rglInfo: RGLProfile;
  matchHistory: Match[];
  // ... other data
}
```

## Future Enhancements

- [ ] Implement tab content (currently placeholders)
- [ ] Add loading skeletons
- [ ] Implement error boundaries
- [ ] Add animations and transitions
- [ ] Optimize bundle size with code splitting
- [ ] Add unit tests
- [ ] Add Storybook stories
