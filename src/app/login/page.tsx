"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { USERS, SUPER_USER, SUPER_USER_PASSWORD } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Snowflake } from 'lucide-react';
import { getFirestore, writeBatch, collection, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

// Función para normalizar el email eliminando tildes
const normalizeEmail = (name: string) => {
  const normalized = name
    .toLowerCase()
    .normalize("NFD") // Descompone caracteres en su forma base y diacríticos
    .replace(/[\u0300-\u036f]/g, ""); // Elimina los diacríticos (tildes, etc.)
  return `${normalized.replace(/\s/g, '')}@navidad-votes.com`;
};

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [snowflakeClicks, setSnowflakeClicks] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/vote');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedUser) {
      setError('Por favor, selecciona tu nombre.');
      return;
    }
    try {
      const email = normalizeEmail(selectedUser);
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/vote');
    } catch (error) {
      console.error(error);
      setError('Credenciales incorrectas. Vuelve a intentarlo.');
      toast({
        title: 'Error de acceso',
        description: 'Usuario o contraseña incorrectos.',
        variant: 'destructive',
      });
    }
  };

  const handleSnowflakeClick = () => {
    const newClickCount = snowflakeClicks + 1;
    setSnowflakeClicks(newClickCount);
    if (newClickCount >= 3) {
      setShowAdminLogin(true);
      setSnowflakeClicks(0);
    }
  };

  const handleAdminLogin = async () => {
    if (adminUser === SUPER_USER && adminPassword === SUPER_USER_PASSWORD) {
      try {
        const batch = writeBatch(firestore);
        const votesSnapshot = await getDocs(collection(firestore, 'votes'));
        votesSnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();

        toast({
          title: 'Votos Reseteados',
          description: 'Todos los registros de votos han sido eliminados de la base de datos.',
        });
        setShowAdminLogin(false);
        setAdminUser('');
        setAdminPassword('');
        // Log out current user if any, to reflect changes
        if (auth.currentUser) {
          await signOut(auth);
        }
      } catch (error) {
        console.error("Error resetting votes:", error);
        toast({
          title: 'Error',
          description: 'No se pudieron resetear los votos.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Acceso de Administrador Fallido',
        description: 'Usuario o contraseña de administrador incorrectos.',
        variant: 'destructive',
      });
    }
  };

  if (isUserLoading || user) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Snowflake className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-2xl border-border/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex items-center justify-center cursor-pointer" onClick={handleSnowflakeClick} title="Haz clic tres veces para opciones de administrador">
              <Snowflake className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl text-primary">Navidad Votes</CardTitle>
            <CardDescription>Inicia sesión para votar por tu plato favorito.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="user-select">Nombre</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger id="user-select" className="w-full">
                    <SelectValue placeholder="Selecciona tu nombre" />
                  </SelectTrigger>
                  <SelectContent>
                    {USERS.map(user => (
                      <SelectItem key={user} value={user}>{user}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                />
                 <p className="text-xs text-muted-foreground pt-1">Pista: el vínculo que nos une.</p>
              </div>
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              <Button type="submit" className="w-full !mt-8">
                Entrar a Votar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acceso de Superusuario</DialogTitle>
            <DialogDescription>
              Introduce las credenciales para resetear los votos de la aplicación.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="admin-user">Usuario</Label>
              <Input
                id="admin-user"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                placeholder="Superusuario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Contraseña</Label>
              <Input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="********"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdminLogin(false)}>Cancelar</Button>
            <Button onClick={handleAdminLogin}>Resetear Votos</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
