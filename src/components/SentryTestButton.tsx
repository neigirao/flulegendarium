import React from 'react';
import { Button } from './ui/button';
import * as Sentry from '@sentry/react';

export const SentryTestButton: React.FC = () => {
  const handleTestError = () => {
    // Capture the error manually to ensure it's sent
    try {
      throw new Error("This is your first error!");
    } catch (error) {
      Sentry.captureException(error);
      console.log('Error captured and sent to Sentry:', error);
      // Re-throw to trigger other error handlers
      throw error;
    }
  };

  const handleManualTest = () => {
    // Manual test without throwing
    Sentry.captureMessage("Manual test message from button", "info");
    console.log('Manual test message sent to Sentry');
  };

  return (
    <div className="flex gap-2 mb-4">
      <Button 
        onClick={handleTestError}
        variant="destructive"
      >
        Break the world (Test Sentry)
      </Button>
      <Button 
        onClick={handleManualTest}
        variant="outline"
      >
        Test Message
      </Button>
    </div>
  );
};