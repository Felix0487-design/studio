
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { USERS } from '@/lib/auth';
import { Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase/provider';
import Header from '../vote/Header';
import { signOut } from 'firebase/auth';

export default function HomePage() {
  const router = useRouter();
  const { auth, user, userDisplayName, isLoading, allVotes, votesLoading, userVote } = useFirebase();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  const handleLogout = async () => {
    if(auth) {
        await signOut(auth);
        router.push('/login');
    }
  };

  if (isLoading || !user) {
    return (
     <div className="flex h-screen w-full items-center justify-center bg-background">
        <Snowflake className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  const votesCount = allVotes.length;
  const remainingVotes = USERS.length - votesCount;
  const hasVoted = !!userVote;
  const allVoted = votesCount === USERS.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header user={userDisplayName || 'Usuario'} onLogout={handleLogout} />
      <main
        className="relative min-h-[calc(100vh-81px)] bg-cover bg-center bg-no-repeat p-8 text-white"
        style={{ backgroundImage: "url('/login-background.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center text-center">
          <Snowflake className="mb-6 h-14 w-14 text-white drop-shadow-lg" />
          <h1 className="mb-4 text-4xl font-bold text-white drop-shadow-md sm:text-5xl md:text-6xl font-headline">
            ¡Bienvenido, {userDisplayName}!
          </h1>

          <div className="my-8 rounded-lg bg-black/0 p-6 ">
            <p className="mb-4 text-lg leading-relaxed">
              Si mis cálculos no fallan, y si es así que alguien me lo diga aportando datos, no vale decir "yo no estoy seguro, yo creo que...", etc., etc., llevamos desde diciembre de 1983, posiblemente el 23.12.1983 celebrando esta cena, ININTERRUMPIDAMENTE.
            </p>
            <p className="mb-4 text-lg font-bold">VAMOS MUY BIEN PARA LLEGAR AL RECORD. Quien se "raje" paga.</p>
            <p className="mb-4 text-lg leading-relaxed">
              Si no recuerdo mal, que algunos dirán que sí, que eso no se dijo, el año pasado hablamos de cambiar la "Cena" por "Comida", ya que la gran mayoría estaríamos ya jubilados y podríamos disfrutar más en una comida. Pero bueno, siempre estaremos a punto de ponernos de acuerdo en lo que decimos, recordamos y queremos.
            </p>
            <p className="text-lg leading-relaxed">
              Para este año y siguiendo mis recuerdos de la última cena "amén", hablamos de la posibilidad de hacer algo especial, como cuando estuvimos en Almansa. Buscar un sitio para poder estar un fin de semana.
            </p>
          </div>

          {!votesLoading && (
              <div className="my-8 rounded-lg bg-primary/80 px-8 py-4 text-center backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white">Estado de la Votación</h3>
              <p className="text-lg text-primary-foreground">
                  Votos emitidos: <span className="font-extrabold">{votesCount}</span> de {USERS.length}
              </p>
              <p className="text-lg text-primary-foreground">
                  Faltan por votar: <span className="font-extrabold">{remainingVotes > 0 ? remainingVotes : 0}</span>
              </p>
              </div>
          )}

          {!hasVoted && !allVoted && (
             <Button size="lg" onClick={() => router.push('/vote')} className="mt-4 animate-pulse">
                Ver Propuestas y Votar
             </Button>
          )}
        </div>
      </main>
    </div>
  );
}
