"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-2xl text-primary">Navidad Votes</h1>
          <Button onClick={() => router.push('/home')}>
            Acceder
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
          <div className="lg:w-1/2">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-3xl text-primary">Una Tradición Ininterrumpida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-foreground/80 text-justify">
                <p>
                  Si mis cálculos no fallan, y si es así que alguien me lo diga aportando datos, no vale decir "yo no estoy seguro, yo creo que...", etc., etc., llevamos desde diciembre de 1983, posiblemente el 23.12.1983 celebrando esta cena, ININTERRUPIDAMENTE.
                </p>
                <p className="font-bold text-primary">
                  VAMOS MUY BIEN PARA LLEGAR AL RECORD. Quien se "raje" paga.
                </p>
                <p>
                  Si no recuerdo mal, que algunos dirán que sí, que eso no se dijo, el año pasado hablamos de cambiar la "Cena" por "Comida", ya que la gran mayoría estaríamos ya jubilados y podríamos disfrutar más en una comida. Pero bueno, siempre estaremos a punto de ponernos de acuerdo en lo que decimos, recordamos y queremos.
                </p>
                <p>
                  Para este año y siguiendo mis recuerdos de la última cena "amén", hablamos de la posibilidad de hacer algo especial, como cuando estuvimos en Almansa. Buscar un sitio para poder estar un fin de semana.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="lg:w-1/2">
            <div className="relative aspect-video w-full max-w-xl mx-auto overflow-hidden rounded-lg shadow-2xl">
              <Image
                src="https://picsum.photos/seed/roundabout/800/600"
                alt="Rotonda de la ciudad"
                fill
                style={{ objectFit: 'cover' }}
                data-ai-hint="roundabout city"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
