
"use client";

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Snowflake, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user: string;
  onLogout: () => void;
  showVoteButton: boolean;
}

export default function Header({ user, onLogout, showVoteButton }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
      { href: '/home', label: 'Inicio' },
      { href: '/vote', label: 'Propuestas' },
  ];

  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-6">
          <Link href="/home" className="flex items-center gap-2">
            <Snowflake className="h-6 w-6 text-primary" />
            <h1 className="hidden sm:block text-2xl text-primary font-headline">Navidad 2025</h1>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map(link => (
                 <Link 
                    key={link.href} 
                    href={link.href} 
                    className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        pathname === link.href ? "text-primary" : "text-foreground/60"
                    )}
                >
                    {link.label}
                </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
            {showVoteButton && (
                 <Button onClick={() => router.push('/voting-booth')}>
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Ir a Votar
                 </Button>
            )}
          <span className="hidden sm:inline text-foreground/80">¡Hola, {user}!</span>
          <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Cerrar sesión">
            <LogOut className="h-5 w-5 text-primary" />
          </Button>
        </div>
      </div>
    </header>
  );
}
