"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { USERS } from '@/lib/auth';
import { Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { collection, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


export default function HomePage() {
  const router = useRouter();
  const { db } = useFirebase();
  const [votesCount, setVotesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      // Firebase not initialized yet
      return;
    }
    setIsLoading(true);
    const votesCol = collection(db, 'votes');
    const unsubscribe = onSnapshot(votesCol, (snapshot) => {
      setVotesCount(snapshot.size);
      setIsLoading(false);
    }, (error) => {
      const permissionError = new FirestorePermissionError({
        path: votesCol.path,
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db]);


  const handleAccess = () => {
    router.push('/login');
  };

  const remainingVotes = USERS.length - votesCount;

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-no-repeat p-8 text-white"
      style={{ backgroundImage: "url('https://picsum.photos/seed/rotonda/1920/1080')" }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center text-center">
        <Snowflake className="mb-6 h-14 w-14 text-white drop-shadow-lg" />
        <h1 className="mb-4 text-4xl font-bold text-white drop-shadow-md sm:text-5xl md:text-6xl font-headline">
          Encuentro Anual
        </h1>

        <div className="my-8 rounded-lg bg-black/50 p-6 backdrop-blur-sm">
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

        {!isLoading && (
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

        <Button size="lg" onClick={handleAccess} className="mt-4 animate-pulse">
          Acceder para Votar
        </Button>
      </div>
    </main>
  );
}
