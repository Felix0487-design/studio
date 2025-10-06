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
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type Vote = {
  optionId: string;
  userName: string;
};

export default function VotingBoothPage() {
  const router = useRouter();
  const { auth, db, user, isLoading, userDisplayName } = useFirebase();

  const [allVotes, setAllVotes] = useState<Vote[]>([]);
  const [userVote, setUserVote] = useState<Vote | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!db || !user) return;

    // Listen for all votes
    const votesCol = collection(db, 'votes');
    const unsubscribeAll = onSnapshot(votesCol, (snapshot) => {
      const votesData = snapshot.docs.map(doc => doc.data() as Vote);
      setAllVotes(votesData);

      if (votesData.length === USERS.length) {
        router.replace('/results');
      }
    }, (error) => {
      const permissionError = new FirestorePermissionError({
        path: votesCol.path,
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    // Listen for the current user's vote
    const userVoteDoc = doc(db, 'votes', user.uid);
    const unsubscribeUser = onSnapshot(userVoteDoc, (doc) => {
      if (doc.exists()) {
        setUserVote(doc.data() as Vote);
      } else {
        setUserVote(null);
      }
    }, (error) => {
       const permissionError = new FirestorePermissionError({
        path: userVoteDoc.path,
        operation: 'get',
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    return () => {
      unsubscribeAll();
      unsubscribeUser();
    };
  }, [db, user, router]);


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
    }
    router.push('/login');
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

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Snowflake className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header user={userDisplayName || 'Usuario'} onLogout={handleLogout} backPath="/vote" />

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
              isSelected={userVote?.optionId === option.id}
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
