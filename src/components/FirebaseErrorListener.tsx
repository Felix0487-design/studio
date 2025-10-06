'use client';
// See the 'Firebase Usage Instructions' for more details on working with code scaffolding.
import React, {useEffect} from 'react';
import {errorEmitter} from '@/firebase/error-emitter';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: Error) => {
      // Throwing the error here will cause it to be caught by Next.js's error overlay
      // This is only for development and should be disabled in production
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
    };
    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.removeListener('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}
