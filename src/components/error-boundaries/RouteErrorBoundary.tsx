import React from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';

interface RouteErrorBoundaryProps {
  children: React.ReactNode;
}

export const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({ children }) => {
  const location = useLocation();
  return <ErrorBoundary key={location.pathname}>{children}</ErrorBoundary>;
};
