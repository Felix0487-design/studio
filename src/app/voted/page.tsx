
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase/provider';
import { USERS } from '@/lib/auth';
import { signOut } from 'firebase/auth';
import Header from '../vote/Header';
import { Snowflake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function VotedPage() {
  const router = useRouter();
  const { auth, user, userDisplayName, isLoading, allVotes, userVote, votesLoading } = useFirebase();
  const votesCount = allVotes.length;

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!votesLoading && votesCount === USERS.length) {
        router.replace('/results');
    }
  }, [votesCount, votesLoading, router]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };
  
  // Render loading state until we can be sure where to direct the user.
  if (isLoading || votesLoading || !user || (!votesLoading && votesCount === USERS.length)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Snowflake className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const hasVoted = !!userVote;
  const allVoted = votesCount === USERS.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header user={userDisplayName || 'Usuario'} onLogout={handleLogout} showVoteButton={!hasVoted && !allVoted} />
      <main 
        className="relative flex min-h-[calc(100vh-81px)] items-center justify-center bg-cover bg-center p-4"
        style={{ backgroundImage: "url('/login-background.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/70" />

        <Card className="relative z-10 w-full max-w-md text-center shadow-2xl bg-background/10 backdrop-blur-sm border-white/20 text-white">
          <CardHeader>
            <CardTitle className="text-3xl text-white">¡Gracias por votar {userDisplayName}!</CardTitle>
            <CardDescription className="text-white/80">Tu voto ha sido registrado correctamente.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="my-4 rounded-lg bg-black/50 p-6">
              <h3 className="text-xl font-bold text-white">Estado de la Votación</h3>
              <p className="mt-2 text-lg text-white">
                Votos emitidos hasta ahora:
              </p>
              <p className="mt-1 text-5xl font-extrabold text-accent">
                {votesCount} <span className="text-2xl font-medium text-white/80">/ {USERS.length}</span>
              </p>
            </div>
            <p className="mt-6 text-sm text-white/60">
              Cuando todos hayan votado, los resultados finales se mostrarán automáticamente.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
