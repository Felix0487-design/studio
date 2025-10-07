
"use client";

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { votingOptions } from '@/lib/voting';
import VoteResults from '../vote/VoteResults';
import { Trophy, Snowflake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Header from '../vote/Header';
import { useFirebase } from '@/firebase/provider';
import { signOut } from 'firebase/auth';

export default function ResultsPage() {
  const router = useRouter();
  const { auth, user, userDisplayName, isLoading, allVotes, votesLoading } = useFirebase();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  const { voteCounts, totalVotes, winner } = useMemo(() => {
    const counts: { [key: string]: number } = {};
    votingOptions.forEach(opt => counts[opt.id] = 0);
    
    allVotes.forEach(vote => {
      if (vote.optionId in counts) {
        counts[vote.optionId]++;
      }
    });

    let maxVotes = 0;
    let winnerId: string | null = null;
    let isTie = false;
    
    for (const optionId in counts) {
      if (counts[optionId] > maxVotes) {
        maxVotes = counts[optionId];
        winnerId = optionId;
        isTie = false;
      } else if (counts[optionId] === maxVotes && maxVotes > 0) {
        isTie = true;
      }
    }
    
    const winnerOption = !isTie && winnerId ? votingOptions.find(opt => opt.id === winnerId) : null;

    return { 
      voteCounts: counts, 
      totalVotes: allVotes.length,
      winner: winnerOption,
    };
  }, [allVotes]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    router.push('/login');
  };
  
  if (isLoading || votesLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Snowflake className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header user={userDisplayName || 'Usuario'} onLogout={handleLogout} />

      <main
        className="relative min-h-[calc(100vh-81px)] bg-cover bg-center bg-no-repeat p-4 md:p-8"
        style={{ backgroundImage: "url('/login-background.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 container mx-auto">
            <div className="text-center mb-8 md:mb-12 text-white">
              <h2 className="text-3xl md:text-4xl text-white font-headline mb-2 drop-shadow-md">¡Votación Cerrada!</h2>
              <p className="text-lg text-white/80">
                Estos son los resultados finales.
              </p>
            </div>

            {winner && (
              <Card className="max-w-2xl mx-auto mb-12 bg-background/10 backdrop-blur-sm border-white/20 text-white shadow-xl">
                <CardHeader className="text-center">
                  <Trophy className="mx-auto h-12 w-12 text-accent" />
                  <CardTitle className="text-3xl text-accent mt-4">¡Tenemos un Ganador!</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-2xl font-bold text-white">{winner.name}</p>
                  <CardDescription className="mt-2 text-white/80">{winner.description}</CardDescription>
                </CardContent>
              </Card>
            )}
            
            {!winner && totalVotes > 0 && (
               <Card className="max-w-2xl mx-auto mb-12 bg-background/10 backdrop-blur-sm border-white/20 text-white shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl text-white mt-4">¡Hay un Empate!</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-lg font-bold text-white/80">Varias opciones han recibido el mismo número de votos. ¡A debatir!</p>
                </CardContent>
              </Card>
            )}

            <section aria-labelledby="results-title">
              <VoteResults votes={voteCounts} totalVotes={totalVotes} options={votingOptions} />
            </section>
        </div>
      </main>
    </div>
  );
}
