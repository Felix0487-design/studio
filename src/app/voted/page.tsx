"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase/provider';
import { USERS } from '@/lib/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Header from '../vote/Header';
import { Snowflake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function VotedPage() {
  const router = useRouter();
  const { auth, user, userDisplayName, isLoading, db } = useFirebase();
  const [votesCount, setVotesCount] = useState(0);
  const [isVotesLoading, setIsVotesLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!db) return;

    const votesCol = collection(db, 'votes');
    const unsubscribe = onSnapshot(votesCol, (snapshot) => {
      setVotesCount(snapshot.size);
      setIsVotesLoading(false);
      if (snapshot.size === USERS.length) {
        router.replace('/results');
      }
    }, (error) => {
      const permissionError = new FirestorePermissionError({
        path: votesCol.path,
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
      setIsVotesLoading(false);
    });

    return () => unsubscribe();
  }, [db, router]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };
  
  if (isLoading || isVotesLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Snowflake className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header user={userDisplayName || 'Usuario'} onLogout={handleLogout} />
      <main className="container mx-auto flex h-[calc(100vh-80px)] items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl text-primary">¡Gracias por votar!</CardTitle>
            <CardDescription>Tu voto ha sido registrado correctamente.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="my-4 rounded-lg bg-primary/10 p-6">
              <h3 className="text-xl font-bold text-primary">Estado de la Votación</h3>
              <p className="mt-2 text-lg text-foreground">
                Votos emitidos hasta ahora:
              </p>
              <p className="mt-1 text-5xl font-extrabold text-accent">
                {votesCount} <span className="text-2xl font-medium text-foreground/80">/ {USERS.length}</span>
              </p>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Cuando todos hayan votado, los resultados finales se mostrarán automáticamente.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
