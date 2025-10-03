"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { votingOptions } from '@/lib/voting';
import VoteCard from '../vote/VoteCard';
import VoteResults from '../vote/VoteResults';
import { Button } from '@/components/ui/button';
import { LogOut, Snowflake, ArrowLeft } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { collection, doc, setDoc, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';

export default function VotingBoothPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const userVoteRef = useMemoFirebase(() => user ? doc(firestore, 'votes', user.uid) : null, [firestore, user]);
  const { data: userVote, isLoading: isVoteLoading } = useDoc(userVoteRef);

  const votesColRef = useMemoFirebase(() => collection(firestore, 'votes'), [firestore]);
  const { data: allVotes, isLoading: areVotesLoading } = useCollection(votesColRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const handleVote = async (optionId: string) => {
    if (userVote || !user) return;

    const voteData = {
      userId: user.uid,
      optionId: optionId,
      timestamp: serverTimestamp(),
      userEmail: user.email,
    };
    
    if (userVoteRef) {
      await setDoc(userVoteRef, voteData);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const voteCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    votingOptions.forEach(opt => counts[opt.id] = 0);
    if (allVotes) {
      for (const vote of allVotes) {
        if (vote.optionId in counts) {
          counts[vote.optionId]++;
        }
      }
    }
    return counts;
  }, [allVotes]);
  
  const totalVotes = allVotes?.length ?? 0;
  const hasVoted = userVote?.optionId;

  if (isUserLoading || !user || isVoteLoading || areVotesLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Snowflake className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" onClick={() => router.push('/vote')} aria-label="Volver">
                <ArrowLeft className="h-5 w-5 text-primary" />
            </Button>
            <h1 className="text-2xl text-primary">Cabina de Votación</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-foreground/80">¡Hola, {user.displayName || user.email}!</span>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Cerrar sesión">
              <LogOut className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl text-primary mb-2">Emite tu Voto</h2>
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
            <VoteResults votes={voteCounts} totalVotes={totalVotes} options={votingOptions} />
          </section>
        )}
      </main>
    </div>
  );
}
