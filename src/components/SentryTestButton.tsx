import React from 'react';
import { Button } from './ui/button';

export const SentryTestButton: React.FC = () => {
  const handleTestError = () => {
    throw new Error("This is your first error!");
  };

  return (
    <Button 
      onClick={handleTestError}
      variant="destructive"
      className="mb-4"
    >
      Break the world (Test Sentry)
    </Button>
  );
};