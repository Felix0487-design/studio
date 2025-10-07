
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { USERS } from '@/lib/auth';
import { votingOptions } from '@/lib/voting';
import VoteCard from '../vote/VoteCard';
import { Snowflake } from 'lucide-react';
import Header from '../vote/Header';
import { useFirebase } from '@/firebase/provider';
import { doc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import ConfirmationDialog from './ConfirmationDialog';
import type { VotingOption } from '@/lib/voting';

type Vote = {
  optionId: string;
  userName: string;
};

export default function VotingBoothPage() {
  const router = useRouter();
  const { auth, db, user, isLoading, userDisplayName, allVotes, userVote, votesLoading } = useFirebase();

  const [selectedOption, setSelectedOption] = useState<VotingOption | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!votesLoading && user) {
      if (allVotes.length === USERS.length) {
        router.replace('/results');
      } else if (userVote) {
        router.replace('/voted');
      }
    }
  }, [allVotes.length, votesLoading, router, user, userVote]);

  const handleVoteClick = (option: VotingOption) => {
    if (userVote) return;
    setSelectedOption(option);
    setIsDialogOpen(true);
  };

  const handleConfirmVote = async () => {
    if (!user || !db || !selectedOption) return;

    const voteData: Vote = {
      optionId: selectedOption.id,
      userName: userDisplayName || 'Anónimo',
    };
    
    const voteRef = doc(db, 'votes', user.uid);
    try {
      await setDoc(voteRef, voteData);
    } catch (error) {
      const permissionError = new FirestorePermissionError({
          path: voteRef.path,
          operation: 'create',
          requestResourceData: voteData,
      });
      errorEmitter.emit('permission-error', permissionError);
    } finally {
        setIsDialogOpen(false);
        setSelectedOption(null);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  const shouldShowLoading = isLoading || votesLoading || !user || (!votesLoading && (userVote || allVotes.length === USERS.length));
  
  if (shouldShowLoading) {
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
            <h2 className="text-3xl md:text-4xl font-headline mb-2 drop-shadow-md">{userDisplayName} emite tu Voto</h2>
            <p className="text-lg text-white/80">
               Solo puedes votar una vez. ¡Elige con sabiduría!
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            {votingOptions.map(option => (
              <VoteCard
                key={option.id}
                option={option}
                onVote={() => handleVoteClick(option)}
                disabled={!!userVote}
                isSelected={userVote?.optionId === option.id}
              />
            ))}
          </div>

          {selectedOption && (
             <ConfirmationDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onConfirm={handleConfirmVote}
                optionName={selectedOption.name}
             />
          )}

        </div>
      </main>
    </div>
  );
}
