"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { USERS, getCurrentUser, logoutUser, getVotes, saveVote } from '@/lib/auth';
import { votingOptions } from '@/lib/voting';
import VoteCard from '../vote/VoteCard';
import VoteResults from '../vote/VoteResults';
import { Button } from '@/components/ui/button';
import { Snowflake } from 'lucide-react';
import Header from '../vote/Header';

export default function VotingBoothPage() {
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

    setUser(currentUser);
    const storedVotes = getVotes();
    setVotes(storedVotes);
    
    if (Object.keys(storedVotes).length === USERS.length) {
      router.replace('/results');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleVote = (optionId: string) => {
    if (!user || votes[user]) return;

    const newVotes = saveVote(user, optionId);
    setVotes(newVotes);

    // If all users have voted, redirect to results
    if (Object.keys(newVotes).length === USERS.length) {
      router.push('/results');
    }
  };

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  const voteCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    votingOptions.forEach(opt => counts[opt.id] = 0);
    for (const voter in votes) {
      const optionId = votes[voter];
      if (optionId in counts) {
        counts[optionId]++;
      }
    }
    return counts;
  }, [votes]);
  
  const totalVotes = Object.keys(votes).length;
  const userVote = user ? votes[user] : null;

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Snowflake className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header user={user} onLogout={handleLogout} backPath="/vote" />

      <main className="container mx-auto p-4 md:p-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl text-primary mb-2">Emite tu Voto</h2>
          <p className="text-lg text-foreground/70">
            {userVote ? '¡Gracias por tu voto!' : 'Solo puedes votar una vez. ¡Elige con sabiduría!'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {votingOptions.map(option => (
            <VoteCard
              key={option.id}
              option={option}
              onVote={() => handleVote(option.id)}
              disabled={!!userVote}
              isSelected={userVote === option.id}
            />
          ))}
        </div>

        {userVote && (
          <section aria-labelledby="results-title">
            <h3 id="results-title" className="text-2xl text-center text-primary mb-6">Resultados en tiempo real</h3>
            <VoteResults votes={voteCounts} totalVotes={totalVotes} options={votingOptions} />
          </section>
        )}
      </main>
    </div>
  );
}
