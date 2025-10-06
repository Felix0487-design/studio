
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { USERS } from '@/lib/auth';
import { votingOptions } from '@/lib/voting';
import VoteCard from '../vote/VoteCard';
import VoteResults from '../vote/VoteResults';
import { Snowflake } from 'lucide-react';
import Header from '../vote/Header';
import { useFirebase } from '@/firebase/provider';
import { doc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type Vote = {
  optionId: string;
  userName: string;
};

export default function VotingBoothPage() {
  const router = useRouter();
  const { auth, db, user, isLoading, userDisplayName, allVotes, userVote, votesLoading } = useFirebase();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!votesLoading && user && userVote) {
      router.replace('/voted');
    } else if (!votesLoading && allVotes.length === USERS.length) {
      router.replace('/results');
    }
  }, [allVotes, votesLoading, router, user, userVote]);

  const handleVote = async (optionId: string) => {
    if (!user || !db || userVote) return;

    const voteData: Vote = {
      optionId: optionId,
      userName: userDisplayName || 'Anónimo',
    };
    
    const voteRef = doc(db, 'votes', user.uid);
    setDoc(voteRef, voteData)
      .catch((error) => {
        const permissionError = new FirestorePermissionError({
            path: voteRef.path,
            operation: 'create',
            requestResourceData: voteData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  const voteCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    votingOptions.forEach(opt => counts[opt.id] = 0);
    allVotes.forEach(v => {
      if (v.optionId in counts) {
        counts[v.optionId]++;
      }
    });
    return counts;
  }, [allVotes]);
  
  const totalVotes = allVotes.length;

  if (isLoading || votesLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Snowflake className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header user={userDisplayName || 'Usuario'} onLogout={handleLogout} backPath="/vote" />

      <main 
        className="relative min-h-[calc(100vh-65px)] bg-cover bg-center bg-no-repeat p-4 md:p-8"
        style={{ backgroundImage: "url('/login-background.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 container mx-auto">
          <div className="text-center mb-8 md:mb-12 text-white">
            <h2 className="text-3xl md:text-4xl font-headline mb-2 drop-shadow-md">Emite tu Voto</h2>
            <p className="text-lg text-white/80">
              Solo puedes votar una vez. ¡Elige con sabiduría!
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            {votingOptions.map(option => (
              <VoteCard
                key={option.id}
                option={option}
                onVote={() => handleVote(option.id)}
                disabled={!!userVote}
                isSelected={userVote?.optionId === option.id}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
