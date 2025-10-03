"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { votingOptions, type VoteCounts } from '@/lib/voting';
import VoteCard from './VoteCard';
import VoteResults from './VoteResults';
import { Button } from '@/components/ui/button';
import { LogOut, Snowflake } from 'lucide-react';

export default function VotePage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const [hasVoted, setHasVoted] = useState<string | null>(null);
  const [votes, setVotes] = useState<VoteCounts>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router, isClient]);

  useEffect(() => {
    if (isClient && user) {
      const storedHasVoted = localStorage.getItem(`navidad-voted_${user.name}`);
      setHasVoted(storedHasVoted);

      const storedVotes = localStorage.getItem('navidad-votes');
      if (storedVotes) {
        setVotes(JSON.parse(storedVotes));
      } else {
        const initialVotes = votingOptions.reduce((acc, option) => {
          acc[option.id] = 0;
          return acc;
        }, {} as VoteCounts);
        setVotes(initialVotes);
      }
    }
  }, [isClient, user]);

  const handleVote = (optionId: string) => {
    if (hasVoted || !user) return;

    const newVotes = { ...votes, [optionId]: (votes[optionId] || 0) + 1 };
    setVotes(newVotes);
    localStorage.setItem('navidad-votes', JSON.stringify(newVotes));

    localStorage.setItem(`navidad-voted_${user.name}`, optionId);
    setHasVoted(optionId);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading || !user || !isClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Snowflake className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Snowflake className="h-6 w-6 text-primary" />
            <h1 className="text-2xl text-primary">Navidad Votes</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-foreground/80">¡Hola, {user.name}!</span>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Cerrar sesión">
              <LogOut className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl text-primary mb-2">Propuestas para el Encuentro</h2>
          <p className="text-lg text-foreground/70">
            {hasVoted ? '¡Gracias por tu voto!' : 'Solo puedes votar una vez. ¡Elige con sabiduría!'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {votingOptions.map(option => (
            <VoteCard
              key={option.id}
              option={option}
              onVote={() => handleVote(option.id)}
              disabled={!!hasVoted}
              isSelected={hasVoted === option.id}
            />
          ))}
        </div>

        {hasVoted && (
          <section aria-labelledby="results-title">
            <h3 id="results-title" className="text-2xl text-center text-primary mb-6">Resultados en tiempo real</h3>
            <VoteResults votes={votes} totalVotes={totalVotes} options={votingOptions} />
          </section>
        )}
      </main>
    </div>
  );
}
