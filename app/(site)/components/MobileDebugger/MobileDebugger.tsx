'use client';
import React, { useState, useEffect } from 'react';

export default function MobileDebugger({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Catch unhandled promise rejections (common in Sanity/API calls)
    const handleRejection = (event: PromiseRejectionEvent) => {
      setError(`Promise Error: ${event.reason}`);
    };

    // Catch standard JS errors
    const handleError = (event: ErrorEvent) => {
      setError(`Runtime Error: ${event.message} at ${event.filename}:${event.lineno}`);
    };

    window.addEventListener('unhandledrejection', handleRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (error) {
    return (
      <div style={{ padding: '20px', background: 'red', color: 'white', fontSize: '12px', wordBreak: 'break-all', zIndex: 9999, position: 'relative' }}>
        <h3>Mobile Crash Detected:</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} style={{ color: 'black', padding: '5px' }}>Reload Page</button>
      </div>
    );
  }

  return <>{children}</>;
}