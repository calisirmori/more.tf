// Google Analytics 4 event tracking utilities

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Track a custom event in Google Analytics
 * @param eventName - The name of the event (e.g., 'profile_view', 'search')
 * @param params - Additional event parameters
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

/**
 * Track page views (automatically tracked, but useful for SPAs)
 * @param pagePath - The path being viewed
 * @param pageTitle - Optional page title
 */
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-TLH7ZY29F8', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
};

// Predefined event tracking functions for common actions

export const trackProfileView = (steamid: string) => {
  trackEvent('profile_view', {
    steamid,
    event_category: 'engagement',
  });
};

export const trackSearch = (searchQuery: string, resultsCount?: number) => {
  trackEvent('search', {
    search_term: searchQuery,
    results_count: resultsCount,
    event_category: 'engagement',
  });
};

export const trackCardClick = (cardId: string, steamid: string) => {
  trackEvent('card_click', {
    card_id: cardId,
    steamid,
    event_category: 'engagement',
  });
};

export const trackLeaderboardView = (leaderboardType?: string) => {
  trackEvent('leaderboard_view', {
    leaderboard_type: leaderboardType,
    event_category: 'engagement',
  });
};

export const trackCollectionView = (steamid: string) => {
  trackEvent('collection_view', {
    steamid,
    event_category: 'engagement',
  });
};

export const trackButtonClick = (buttonName: string, location: string) => {
  trackEvent('button_click', {
    button_name: buttonName,
    location,
    event_category: 'interaction',
  });
};

export const trackError = (errorMessage: string, errorPage?: string) => {
  trackEvent('error', {
    error_message: errorMessage,
    error_page: errorPage,
    event_category: 'error',
  });
};
