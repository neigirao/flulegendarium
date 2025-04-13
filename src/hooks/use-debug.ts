
import { useState, useCallback, useEffect } from "react";

export const useDebug = () => {
  const [debugClickCount, setDebugClickCount] = useState(0);
  const [showImageUrl, setShowImageUrl] = useState(false);

  const handleDebugClick = useCallback(() => {
    setDebugClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        setShowImageUrl(true);
        return 0;
      }
      return newCount;
    });
  }, []);

  useEffect(() => {
    if (showImageUrl) {
      const timer = setTimeout(() => {
        setShowImageUrl(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showImageUrl]);

  return {
    showImageUrl,
    handleDebugClick
  };
};
