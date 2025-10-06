"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getVotes, getCurrentUser, logoutUser, USERS } from '@/lib/auth';
import { votingOptions, type VotingOption } from '@/lib/voting';
import VoteResults from '../vote/VoteResults';
import { Button } from '@/components/ui/button';
import { Trophy, Snowflake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Header from '../vote/Header';

export default function ResultsPage() {
  const [user, setUser] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.replace('/login');
      return;
    }
    
    const storedVotes = getVotes();
    // Only allow access if all votes are in
    if (Object.keys(storedVotes).length < USERS.length) {
      router.replace('/vote');
      return;
    }

    setUser(currentUser);
    setVotes(storedVotes);
    setIsLoading(false);
  }, [router]);
  
  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  const { voteCounts, totalVotes, winner } = useMemo(() => {
    const counts: { [key: string]: number } = {};
    votingOptions.forEach(opt => counts[opt.id] = 0);
    
    for (const voter in votes) {
      const optionId = votes[voter];
      if (optionId in counts) {
        counts[optionId]++;
      }
    }

    let maxVotes = 0;
    let winnerId: string | null = null;
    for (const optionId in counts) {
      if (counts[optionId] > maxVotes) {
        maxVotes = counts[optionId];
        winnerId = optionId;
      }
    }
    
    const winnerOption = winnerId ? votingOptions.find(opt => opt.id === winnerId) : null;

    return { 
      voteCounts: counts, 
      totalVotes: Object.keys(votes).length,
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
      <Header user={user} onLogout={handleLogout} />

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

        <section aria-labelledby="results-title">
          <VoteResults votes={voteCounts} totalVotes={totalVotes} options={votingOptions} />
        </section>
      </main>
    </div>
  );
}
