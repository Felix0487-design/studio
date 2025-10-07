
"use client";

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Snowflake, Menu } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { USERS } from '@/lib/auth';
import { useFirebase } from '@/firebase/provider';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

interface HeaderProps {
  user: string;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const pathname = usePathname();
  const { allVotes, votesLoading } = useFirebase();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const allVoted = !votesLoading && allVotes.length === USERS.length;

  const navLinks = [
      { href: '/home', label: 'Inicio' },
      { href: '/vote', label: 'Propuestas' },
      { href: '/voting-booth', label: 'Opciones' },
  ];

  const NavLink = ({ href, children, className }: { href: string; children: React.ReactNode, className?: string }) => (
    <Link 
      href={href} 
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        pathname === href ? "text-primary" : "text-foreground/60",
        className
      )}
    >
      {children}
    </Link>
  );

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
                 <NavLink key={link.href} href={link.href}>{link.label}</NavLink>
            ))}
             <Link 
                href={isClient && allVoted ? '/results' : '#'}
                className={cn(
                    "text-sm font-medium transition-colors",
                    pathname === '/results' ? "text-primary" : "text-foreground/60",
                    isClient && allVoted ? "hover:text-primary" : "cursor-not-allowed opacity-50"
                )}
                aria-disabled={!isClient || !allVoted}
                tabIndex={!isClient || !allVoted ? -1 : undefined}
                onClick={(e) => (!isClient || !allVoted) && e.preventDefault()}
            >
                Resultados
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-4">
            <span className="text-foreground/80">¡Hola, {user}!</span>
            <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Cerrar sesión">
              <LogOut className="h-5 w-5 text-primary" />
            </Button>
          </div>
          
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                     <Link href="/home" className="flex items-center gap-2">
                        <Snowflake className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl text-primary font-headline">Navidad 2025</h1>
                      </Link>
                  </div>
                  <nav className="flex flex-col gap-4 p-4">
                    {navLinks.map(link => (
                      <SheetClose asChild key={link.href}>
                         <NavLink href={link.href} className="text-lg">{link.label}</NavLink>
                      </SheetClose>
                    ))}
                    <SheetClose asChild>
                      <Link 
                          href={isClient && allVoted ? '/results' : '#'}
                          className={cn(
                              "text-lg font-medium transition-colors",
                              pathname === '/results' ? "text-primary" : "text-foreground/60",
                              isClient && allVoted ? "hover:text-primary" : "cursor-not-allowed opacity-50"
                          )}
                          aria-disabled={!isClient || !allVoted}
                          tabIndex={!isClient || !allVoted ? -1 : undefined}
                          onClick={(e) => (!isClient || !allVoted) && e.preventDefault()}
                      >
                          Resultados
                      </Link>
                    </SheetClose>
                  </nav>
                  <Separator />
                  <div className="mt-auto p-4 flex flex-col gap-4">
                     <span className="text-foreground/80 text-center">¡Hola, {user}!</span>
                     <Button variant="outline" onClick={onLogout} aria-label="Cerrar sesión">
                        <LogOut className="mr-2 h-5 w-5" />
                        Cerrar sesión
                      </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
