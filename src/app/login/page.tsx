
"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { USERS } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Snowflake, Eye, EyeOff } from 'lucide-react';
import { useFirebase } from '@/firebase/provider';
import { signInWithEmailAndPassword } from 'firebase/auth';


const normalizeString = (str: string) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s/g, '');
};

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const { auth, db, user } = useFirebase();

  const [isLoading, setIsLoading] = useState(true);
  
  // Secret admin link state
  const [tapCount, setTapCount] = useState(0);
  const [showAdminLink, setShowAdminLink] = useState(false);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      router.replace('/home');
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

  const handleSecretTap = () => {
    if (tapTimeout.current) {
      clearTimeout(tapTimeout.current);
    }

    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    if (newTapCount >= 3) {
      setShowAdminLink(true);
    } else {
      tapTimeout.current = setTimeout(() => {
        setTapCount(0); // Reset after 2 seconds
      }, 2000);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedUser) {
      setError('Por favor, selecciona tu nombre.');
      return;
    }

    if (!auth || !db) {
      setError('Servicio de autenticación no disponible. Inténtalo de nuevo más tarde.');
      return;
    }

    try {
      const email = `${normalizeString(selectedUser)}@navidad-votes.com`;
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/home');
    } catch (error: any) {
       if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        setError('Credenciales incorrectas. Vuelve a intentarlo.');
        toast({
          title: 'Error de acceso',
          description: 'Usuario o contraseña incorrectos.',
          variant: 'destructive',
        });
       } else {
        setError('Ha ocurrido un error inesperado.');
        toast({
          title: 'Error',
          description: 'No se pudo iniciar sesión. Por favor, inténtalo de nuevo más tarde.',
          variant: 'destructive',
        });
       }
    }
  };

  if (isLoading || user) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Snowflake className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <main 
        className="relative flex min-h-screen items-center justify-center bg-cover bg-center p-4"
        style={{ backgroundImage: "url('/login-background.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <Card className="relative z-10 w-full max-w-sm shadow-2xl bg-black/50 border-white/20 text-white">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6" onClick={handleSecretTap}>
               <Snowflake className="h-12 w-12 text-white" />
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="user-select" className="text-white">Nombre</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger id="user-select" className="w-full bg-white/90 text-black">
                    <SelectValue placeholder="Selecciona tu nombre" />
                  </SelectTrigger>
                  <SelectContent>
                    {USERS.map(user => (
                      <SelectItem key={user} value={user}>{user}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative space-y-2">
                <Label htmlFor="password" className="text-white">Contraseña</Label>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="pr-10 bg-white/90 text-black"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-7 h-7 w-7 text-gray-500 hover:bg-white/10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                  <span className="sr-only">{showPassword ? 'Ocultar' : 'Mostrar'} contraseña</span>
                </Button>
              </div>
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              <Button type="submit" className="w-full !mt-8">
                Entrar
              </Button>
            </form>
             <div className="mt-4 text-center text-xs h-4">
              {showAdminLink && (
                  <Link href="/admin" className="text-white/50 hover:text-white/80 transition-opacity">
                    Admin Panel
                  </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
