
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { USERS } from '@/lib/auth';
import { votingOptions } from '@/lib/voting';
import VoteCard from '../vote/VoteCard';
import { Snowflake, BarChart2 } from 'lucide-react';
import Header from '../vote/Header';
import { useFirebase } from '@/firebase/provider';
import { doc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import ConfirmationDialog from './ConfirmationDialog';
import type { VotingOption } from '@/lib/voting';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type Vote = {
  optionId: string;
  userName: string;
};

export default function VotingBoothPage() {
  const router = useRouter();
  const { auth, db, user, isLoading, userDisplayName, allVotes, userVote, votesLoading } = useFirebase();
  const votesCount = allVotes.length;
  
  const [selectedOption, setSelectedOption] = useState<VotingOption | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    // Redirect if voting is closed for everyone
    if (!votesLoading && allVotes.length === USERS.length) {
      router.replace('/results');
    }
  }, [allVotes.length, votesLoading, router]);


  const handleVoteClick = (option: VotingOption) => {
    // Prevent voting if the user has already voted or if all users have voted.
    if (userVote || allVotes.length === USERS.length) return;
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
      // No redirection needed, the page will re-render with the new state
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

  const allHaveVoted = allVotes.length === USERS.length;
  const hasVoted = !!userVote;

  const shouldShowLoading = isLoading || votesLoading || !user;
  
  if (shouldShowLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Snowflake className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const getHeaderText = () => {
    if (allHaveVoted) {
      return "La votación ha finalizado. Gracias por participar.";
    }
    if (hasVoted) {
      return null;
    }
    return "Solo puedes votar una vez. ¡Elige con sabiduría!";
  };
  
  const headerSubtitle = getHeaderText();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header user={userDisplayName || 'Usuario'} onLogout={handleLogout} />

      <main 
        className="relative min-h-[calc(100vh-81px)] bg-cover bg-center bg-no-repeat p-4 md:p-8"
        style={{ backgroundImage: "url('/login-background.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 container mx-auto">
          
          {hasVoted && !allHaveVoted && (
             <Card className="relative z-10 w-full max-w-md mx-auto mb-12 text-center shadow-2xl bg-background/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                    <CardTitle className="text-3xl text-white">¡Gracias por votar!</CardTitle>
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
          )}

          <div className="text-center mb-8 md:mb-12 text-white">
            <h2 className="text-3xl md:text-4xl font-headline mb-2 drop-shadow-md">
              {hasVoted ? `Gracias por tu colaboración, ${userDisplayName}.` : `${userDisplayName}, emite tu Voto`}
            </h2>
            {headerSubtitle && (
              <p className={`text-lg ${hasVoted || allHaveVoted ? 'text-accent font-bold' : 'text-white/80'}`}>
                {headerSubtitle}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            {votingOptions.map(option => (
              <VoteCard
                key={option.id}
                option={option}
                onVote={() => handleVoteClick(option)}
                disabled={hasVoted || allHaveVoted}
                isSelected={userVote?.optionId === option.id}
              />
            ))}
          </div>

           {allHaveVoted && (
            <div className="text-center">
                <Button size="lg" onClick={() => router.push('/results')}>
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Ver Resultados
                </Button>
            </div>
          )}

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
