"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { votingOptions, type VoteCounts } from '@/lib/voting';
import { Button } from '@/components/ui/button';
import { LogOut, Snowflake, ExternalLink, ThumbsUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function VotePage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router, isClient]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading || !user || !isClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Snowflake className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Snowflake className="h-6 w-6 text-primary" />
            <h1 className="text-2xl text-primary">Navidad Votes</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-foreground/80">¡Hola, {user.name}!</span>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Cerrar sesión">
              <LogOut className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl text-primary mb-2">Propuestas para el Encuentro</h2>
          <p className="text-lg text-foreground/70">
            Explora las opciones y luego emite tu voto.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Card A */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Opción A: Fin de Semana en Sacedón</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <CardDescription>
                Plan General: Ir a Sacedón, hospedarnos en el Hostal Plaza, cenar y tomar copas en el pueblo. Rutas ligeras por el entorno.
              </CardDescription>
              <Button variant="outline" className="w-full justify-between" onClick={() => openLink('https://www.google.com/search?sca_esv=e133efb347e6c9df&sxsrf=AE3TifO9Bz7j2LhxEQtkKwJxw7nO4v5PyA:1759505107420&q=bar+restaurante+hostal+plaza.+sacedon+guadalajara&spell=1&sa=X&ved=2ahUKEwjj7aGnq4iQAxUmVkEAHeXtJWMQBSgAegQIGBAB&biw=1707&bih=772&dpr=1.13')}>
                Hostal Plaza <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between" onClick={() => openLink('https://www.alocen.es/')}>
                Pueblo de Alocén <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between" onClick={() => openLink('https://carta.menu/restaurants/alocen/mirador-de-alocen')}>
                Mirador de Alocén <ExternalLink className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Card B */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Opción B: Comida en Restaurante</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <CardDescription>
                Comer en uno de los siguientes restaurantes locales. Revisa sus cartas y menús.
              </CardDescription>
              <Button variant="outline" className="w-full justify-between" onClick={() => openLink('https://www.google.com/search?q=la+taberna+torres+de+la+alameda+carta&oq=La+Taberna.+Torres+de+&aqs=chrome.2.69i57j0i22i30l9.17480j0j7&sourceid=chrome&ie=UTF-8#lpg=ik:CAoSF0NJSE0wb2dLRUlDQWdJREJrLXItdXdF')}>
                La Taberna (Torres) <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between" onClick={() => openLink('https://www.google.com/search?q=el+bife+arganda+menu+del+dia&oq=el+Bife&aqs=chrome.2.69i57j46i175i199i512i654j0i512l3j0i20i263i512j46i175i199i512j0i512j46i67i175i199i512i650j0i512.9238j0j4&sourceid=chrome&ie=UTF-8#lpg=ik:CAoSLEFGMVFpcFByWkVETEFfMDdsWVJvUEt')}>
                El Bife (Arganda) <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between" onClick={() => openLink('https://www.quintasanantonio.com/carta.html')}>
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

      </main>
    </div>
  );
}
