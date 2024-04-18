import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminBadge from './AdminBadge';
import Calendar from './calendar';
import Home from './Home';
import Leaderboard from './leaderboard';
import Logs from './Logs';
import Matches from './Matches';
import Peers from './peers';
import Profile from './Profile';

describe('AdminBadge', () => {
  // Test for AdminBadge.tsx
  it('Home renders without crashing', () => {
    render(<AdminBadge />);
    expect(screen.getByTestId('admin-badge-container')).toBeInTheDocument();
  });

  // Test for Home.tsx
  it('Home renders without crashing', () => {
    render(<Home />);
    expect(screen.getByTestId('home-container')).toBeInTheDocument();
  });

  // Test for Calendar.tsx
  it('Calendar renders without crashing', () => {
    render(<Calendar />);
    expect(screen.getByTestId('calendar-container')).toBeInTheDocument();
  });

  // Test for Leaderboard.tsx
  it('Leaderboard renders without crashing', () => {
    render(<Leaderboard />);
    expect(screen.getByTestId('leaderboard-container')).toBeInTheDocument();
  });
});