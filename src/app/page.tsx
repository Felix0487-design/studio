"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight, Users, UserCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { USERS } from '@/lib/auth';
import { useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';

export default function LandingPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const votesQuery = useMemoFirebase(() => collection(firestore, 'votes'), [firestore]);
  const { data: votes, isLoading } = useCollection(votesQuery);

  const votesCasted = votes?.length ?? 0;
  const totalUsers = USERS.length;
  const remainingVotes = totalUsers - votesCasted;

  return (
    <div 
      className="min-h-screen bg-cover bg-center text-foreground"
      style={{ backgroundImage: "url('https://picsum.photos/seed/roundabout/1200/800')" }}
    >
      <div className="min-h-screen bg-background/60 backdrop-blur-sm">
        <header className="sticky top-0 z-10 border-b bg-background/80">
          <div className="container mx-auto flex items-center justify-between p-4">
            <h1 className="text-2xl text-primary">Navidad Votes</h1>
            <Button onClick={() => router.push('/home')}>
              Acceder
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="container mx-auto flex items-center justify-center p-4 md:p-8" style={{minHeight: 'calc(100vh - 65px)'}}>
            <Card className="w-full max-w-2xl shadow-xl bg-card/90">
              <CardHeader>
                <CardTitle className="text-3xl text-primary text-center">Una Tradición Ininterrumpida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-foreground/80 text-justify">
                <p>
                  Si mis cálculos no fallan, y si es así que alguien me lo diga aportando datos, no vale decir "yo no estoy seguro, yo creo que...", etc., etc., llevamos desde diciembre de 1983, posiblemente el 23.12.1983 celebrando esta cena, ININTERRUPIDAMENTE.
                </p>
                <p className="font-bold text-primary text-center">
                  VAMOS MUY BIEN PARA LLEGAR AL RECORD. Quien se "raje" paga.
                </p>
                <p>
                  Si no recuerdo mal, que algunos dirán que sí, que eso no se dijo, el año pasado hablamos de cambiar la "Cena" por "Comida", ya que la gran mayoría estaríamos ya jubilados y podríamos disfrutar más en una comida. Pero bueno, siempre estaremos a punto de ponernos de acuerdo en lo que decimos, recordamos y queremos.
                </p>
                <p>
                  Para este año y siguiendo mis recuerdos de la última cena "amén", hablamos de la posibilidad de hacer algo especial, como cuando estuvimos en Almansa. Buscar un sitio para poder estar un fin de semana.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
                <div className="flex items-center gap-2 text-sm font-medium p-2 rounded-md bg-secondary text-secondary-foreground">
                  <UserCheck className="h-5 w-5 text-primary" />
                  Votos emitidos: <span className="font-bold text-primary">{isLoading ? '...' : votesCasted}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium p-2 rounded-md bg-secondary text-secondary-foreground">
                  <Users className="h-5 w-5 text-primary" />
                  Faltan por votar: <span className="font-bold text-primary">{isLoading ? '...' : remainingVotes}</span>
                </div>
              </CardFooter>
            </Card>
        </main>
      </div>
    </div>
  );
}
