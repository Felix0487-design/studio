
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Snowflake } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Header from './Header';
import { ExternalLink } from 'lucide-react';
import { useFirebase } from '@/firebase/provider';
import { signOut } from 'firebase/auth';
import { USERS } from '@/lib/auth';

export default function VotePage() {
  const router = useRouter();
  const { auth, user, userDisplayName, isLoading, allVotes, userVote, votesLoading } = useFirebase();

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
  }, [allVotes.length, userVote, votesLoading, user, router, allVotes]);

  const handleLogout = async () => {
    if(auth) {
        await signOut(auth);
        router.push('/login');
    }
  };

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading || votesLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Snowflake className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header user={userDisplayName || 'Usuario'} onLogout={handleLogout} backPath="/home" />

      <main 
        className="relative min-h-[calc(100vh-65px)] bg-cover bg-center bg-no-repeat p-4 md:p-8"
        style={{ backgroundImage: "url('/login-background.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 container mx-auto">
          <div className="text-center mb-8 md:mb-12 text-white">
            <h2 className="text-3xl md:text-4xl font-headline mb-2 drop-shadow-md">Propuestas para el Encuentro</h2>
            <p className="text-lg text-white/80">
              Explora las opciones y luego emite tu voto.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Card A */}
            <Card className="flex flex-col bg-background/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-2xl text-accent">Opción A: Fin de Semana en Sacedón</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <CardDescription className="text-white/90">
                  Plan General: Ir a Sacedón, hospedarnos en el Hostal Plaza, cenar y tomar copas en el pueblo. Rutas ligeras por el entorno, ejemplos: Trillo, Alcocen ...
                </CardDescription>
                <Button variant="outline" className="w-full justify-between bg-transparent text-white border-white/30 hover:bg-white/10" onClick={() => openLink('https://www.google.com/search?sca_esv=e133efb347e6c9df&sxsrf=AE3TifO9Bz7j2LhxEQtkKwJxw7nO4v5PyA:1759505107420&q=bar+restaurante+hostal+plaza.+sacedon+guadalajara&spell=1&sa=X&ved=2ahUKEwjj7aGnq4iQAxUmVkEAHeXtJWMQBSgAegQIGBAB&biw=1707&bih=772&dpr=1.13')}>
                  Hostal Plaza <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between bg-transparent text-white border-white/30 hover:bg-white/10" onClick={() => openLink('https://www.alocen.es/')}>
                  Pueblo de Alocén <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between bg-transparent text-white border-white/30 hover:bg-white/10" onClick={() => openLink('https://carta.menu/restaurants/alocen/mirador-de-alocen')}>
                  Mirador de Alocén <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Card B */}
            <Card className="flex flex-col bg-background/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-2xl text-accent">Opción B: Comida en Restaurante</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <CardDescription className="text-white/90">
                  Comer en uno de los siguientes restaurantes. Revisa sus cartas y menús.
                </CardDescription>
                <Button variant="outline" className="w-full justify-between bg-transparent text-white border-white/30 hover:bg-white/10" onClick={() => openLink('https://www.google.com/search?q=la+taberna+torres+de+la+alameda+carta&oq=La+Taberna.+Torres+de+&aqs=chrome.2.69i57j0i22i30l9.17480j0j7&sourceid=chrome&ie=UTF-8#lpg=ik:CAoSF0NJSE0wb2dLRUlDQWdJREJrLXItdXdF')}>
                  La Taberna (Torres) <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between bg-transparent text-white border-white/30 hover:bg-white/10" onClick={() => openLink('https://www.google.com/search?q=el+bife+arganda+menu+del+dia&oq=el+Bife&aqs=chrome.2.69i57j46i175i199i512i654j0i512l3j0i20i263i512j46i175i199i512j0i512j46i67i175i199i512i650j0i512.9238j0j4&sourceid=chrome&ie=UTF-8#lpg=ik:CAoSLEFGMVFpcFByWkVETEFfMDdsWVJvUEt')}>
                  El Bife (Arganda) <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between bg-transparent text-white border-white/30 hover:bg-white/10" onClick={() => openLink('https://www.quintasanantonio.com/carta.html')}>
                  Quinta San Antonio (Velilla) <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
              <Button size="lg" onClick={() => router.push('/voting-booth')}>
                  <ThumbsUp className="mr-2 h-5 w-5" />
                  Ir a Votar
              </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
