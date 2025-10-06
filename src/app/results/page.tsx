"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { USERS } from '@/lib/auth';
import { votingOptions } from '@/lib/voting';
import VoteResults from '../vote/VoteResults';
import { Trophy, Snowflake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Header from '../vote/Header';
import { useFirebase } from '@/firebase/provider';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

type Vote = {
  optionId: string;
  userName: string;
};

export default function ResultsPage() {
  const router = useRouter();
  const { auth, db, user, userDisplayName } = useFirebase();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!db) return;

    const votesCol = collection(db, 'votes');
    const unsubscribe = onSnapshot(votesCol, async (snapshot) => {
      if (snapshot.size < USERS.length) {
         // router.replace('/vote');
      }

      const votesData = snapshot.docs.map(doc => doc.data() as Vote);
      setVotes(votesData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching votes:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, db, router]);
  
  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    router.push('/login');
  };

  const { voteCounts, totalVotes, winner } = useMemo(() => {
    const counts: { [key: string]: number } = {};
    votingOptions.forEach(opt => counts[opt.id] = 0);
    
    votes.forEach(vote => {
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
      totalVotes: votes.length,
      winner: winnerOption,
    };
  }, [votes]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Snowflake className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header user={userDisplayName || 'Usuario'} onLogout={handleLogout} />

      <main className="container mx-auto p-4 md:p-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl text-primary mb-2">¡Votación Cerrada!</h2>
          <p className="text-lg text-foreground/70">
            Estos son los resultados finales.
          </p>
        </div>

        {winner && (
          <Card className="max-w-2xl mx-auto mb-12 bg-accent/10 border-accent shadow-xl">
            <CardHeader className="text-center">
              <Trophy className="mx-auto h-12 w-12 text-accent" />
              <CardTitle className="text-3xl text-accent-foreground mt-4">¡Tenemos un Ganador!</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-2xl font-bold text-primary">{winner.name}</p>
              <CardDescription className="mt-2 text-foreground/80">{winner.description}</CardDescription>
            </CardContent>
          </Card>
        )}
        
        {!winner && totalVotes > 0 && (
           <Card className="max-w-2xl mx-auto mb-12 bg-secondary/20 border-border shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-primary mt-4">¡Hay un Empate!</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg font-bold text-foreground/80">Varias opciones han recibido el mismo número de votos. ¡A debatir!</p>
            </CardContent>
          </Card>
        )}

        <section aria-labelledby="results-title">
          <VoteResults votes={voteCounts} totalVotes={totalVotes} options={votingOptions} />
        </section>
      </main>
    </div>
  );
}
