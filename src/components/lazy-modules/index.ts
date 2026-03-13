import React from 'react';
import { createLazyComponent } from '@/components/LazyLoad';
import { PerformanceSkeleton } from '@/components/performance/PerformanceSkeleton';

// Quiz Module
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

// Conquistas Module
export const LazyConquistas = createLazyComponent(
  () => import('@/pages/Conquistas'),
  React.createElement(PerformanceSkeleton, { height: 600 })
);

// Reset Password Module
export const LazyResetPassword = createLazyComponent(
  () => import('@/pages/ResetPassword'),
  React.createElement(PerformanceSkeleton, { height: 400 })
);

// Profile Module
export const LazyProfilePage = createLazyComponent(
  () => import('@/pages/ProfilePage'),
  React.createElement(PerformanceSkeleton, { height: 600 })
);

// Daily Challenges Module
export const LazyDailyChallengesPage = createLazyComponent(
  () => import('@/pages/DailyChallengesPage'),
  React.createElement(PerformanceSkeleton, { height: 600 })
);

// Jersey Quiz Module
export const LazyJerseyQuizPage = createLazyComponent(
  () => import('@/pages/JerseyQuizPage'),
  React.createElement(PerformanceSkeleton, { height: 600 })
);

// Statistics Module
export const LazyEstatisticasPublicas = createLazyComponent(
  () => import('@/pages/EstatisticasPublicas'),
  React.createElement(PerformanceSkeleton, { height: 600 })
);