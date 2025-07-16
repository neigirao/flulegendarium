import React from 'react';
import { Button } from './ui/button';
import * as Sentry from '@sentry/react';

export const SentryTestButton: React.FC = () => {
  return (
    <div className="flex gap-2 mb-4">
      <Button onClick={() => {throw new Error("This is your first error!");}}>
        Break the world
      </Button>
    </div>
  );
};