"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Snowflake, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  user: string;
  onLogout: () => void;
  backPath?: string;
}

export default function Header({ user, onLogout, backPath }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {backPath ? (
            <Button variant="ghost" size="icon" onClick={() => router.push(backPath)} aria-label="Volver">
              <ArrowLeft className="h-5 w-5 text-primary" />
            </Button>
          ) : (
            <Snowflake className="h-6 w-6 text-primary" />
          )}
          <h1 className="text-2xl text-primary font-headline">Navidad 2025</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-foreground/80">¡Hola, {user}!</span>
          <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Cerrar sesión">
            <LogOut className="h-5 w-5 text-primary" />
          </Button>
        </div>
      </div>
    </header>
  );
}
