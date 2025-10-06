"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase/provider';
import { Snowflake } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading } = useFirebase();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/vote');
      } else {
        router.replace('/home');
      }
    }
  }, [isLoading, user, router]);

  return (
     <div className="flex h-screen w-full items-center justify-center bg-background">
        <Snowflake className="h-16 w-16 animate-spin text-primary" />
      </div>
  );
}
