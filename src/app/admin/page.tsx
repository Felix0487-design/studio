
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SUPER_USER, SUPER_USER_PASSWORD } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';
import { collection, writeBatch, getDocs } from 'firebase/firestore';
import { Shield, LogOut } from 'lucide-react';

export default function AdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { db } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === SUPER_USER && password === SUPER_USER_PASSWORD) {
      setIsAuthenticated(true);
      toast({ title: "Acceso concedido", description: "Bienvenido, administrador." });
    } else {
      setError('Credenciales de administrador incorrectas.');
      toast({ title: "Error de acceso", description: "Las credenciales de administrador son incorrectas.", variant: "destructive" });
    }
  };
  
  const handleResetVotes = async () => {
    if (!db) {
      alert("La base de datos no está disponible.");
      return;
    }
    
    const confirmReset = window.confirm("¿Estás seguro de que quieres borrar todos los votos? Esta acción no se puede deshacer.");
    if (confirmReset) {
      try {
        const votesCollection = collection(db, 'votes');
        const votesSnapshot = await getDocs(votesCollection);
        const batch = writeBatch(db);
        votesSnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        toast({ title: "Votos Reseteados", description: "Todos los votos han sido borrados correctamente." });
      } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "No se pudieron resetear los votos.", variant: "destructive" });
      }
    }
  };

  return (
    <main 
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: "url('/login-background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <Card className="relative z-10 w-full max-w-sm shadow-2xl bg-black/50 border-white/20 text-white">
        <CardHeader className="text-center">
            <Shield className="mx-auto h-10 w-10 text-primary" />
            <CardTitle className="text-2xl mt-2">Panel de Administrador</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {!isAuthenticated ? (
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario Admin</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="super_usuario"
                  className="bg-white/90 text-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña Admin</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="bg-white/90 text-black"
                />
              </div>
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              <Button type="submit" className="w-full !mt-8">
                Autenticar
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <p className="text-center">Has iniciado sesión como administrador.</p>
              <Button variant="destructive" onClick={handleResetVotes} className="w-full">
                Resetear Todos los Votos
              </Button>
               <Button variant="secondary" onClick={() => setIsAuthenticated(false)} className="w-full">
                <LogOut className="mr-2"/> Cerrar Sesión de Admin
              </Button>
            </div>
          )}
          <div className="mt-6 text-center">
            <Button variant="link" onClick={() => router.push('/login')}>
              Volver al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
