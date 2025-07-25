import React from 'react';
import { createLazyComponent } from '@/components/LazyLoad';
import { PerformanceSkeleton } from '@/components/performance/PerformanceSkeleton';

// Quiz Module
export const LazyAdaptiveGuessPlayer = createLazyComponent(
  () => import('@/pages/AdaptiveGuessPlayer'),
  React.createElement(PerformanceSkeleton, { height: 600 })
);

export const LazyDecadeGuessPlayer = createLazyComponent(
  () => import('@/pages/DecadeGuessPlayer'),
  React.createElement(PerformanceSkeleton, { height: 600 })
);

export const LazyGameModeSelection = createLazyComponent(
  () => import('@/pages/GameModeSelection'),
  React.createElement(PerformanceSkeleton, { height: 500 })
);

// Admin Module
export const LazyAdmin = createLazyComponent(
  () => import('@/pages/Admin'),
  React.createElement(PerformanceSkeleton, { height: 700 })
);

export const LazyAdminLogin = createLazyComponent(
  () => import('@/pages/AdminLogin'),
  React.createElement(PerformanceSkeleton, { height: 400 })
);

// Social Module
export const LazySocialPage = createLazyComponent(
  () => import('@/pages/SocialPage'),
  React.createElement(PerformanceSkeleton, { height: 600 })
);


// Auth Module
export const LazyAuth = createLazyComponent(
  () => import('@/pages/Auth'),
  React.createElement(PerformanceSkeleton, { height: 400 })
);

// FAQ Module
export const LazyFAQ = createLazyComponent(
  () => import('@/pages/FAQ'),
  React.createElement(PerformanceSkeleton, { height: 500 })
);

// News Module
export const LazyNewsPortal = createLazyComponent(
  () => import('@/pages/NewsPortal'),
  React.createElement(PerformanceSkeleton, { height: 600 })
);

export const LazyNewsArticle = createLazyComponent(
  () => import('@/pages/NewsArticle'),
  React.createElement(PerformanceSkeleton, { height: 800 })
);

// Donations Module
export const LazyDonations = createLazyComponent(
  () => import('@/pages/Donations'),
  React.createElement(PerformanceSkeleton, { height: 600 })
);