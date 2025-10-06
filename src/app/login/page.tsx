"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { USERS, SUPER_USER_PASSWORD, SUPER_USER } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Snowflake } from 'lucide-react';
import { useFirebase } from '@/firebase/provider';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { collection, getDocs } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


const normalizeString = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s/g, '');
};

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const { auth, db, user } = useFirebase();

  const [isLoading, setIsLoading] = useState(true);
  const [snowflakeClicks, setSnowflakeClicks] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  useEffect(() => {
    if (user) {
      router.replace('/vote');
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;

      // The rest of the logic runs after successful login, handled by useEffect and page navigations
      // which already have their own error handling.
      // This try-catch is now specifically for login failure.
      
      const votesCol = collection(db, 'votes');
      const votesSnapshot = await getDocs(votesCol).catch(err => {
        const permissionError = new FirestorePermissionError({
            path: votesCol.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        // We don't re-throw, as login was successful. The app will navigate.
        return null; 
      });

      if (!votesSnapshot) return; // Error was handled, stop execution here.

      const allVotesIn = votesSnapshot.size === USERS.length;
      if (allVotesIn) {
        router.push('/results');
        return;
      }
      
      const userDocRef = doc(db, 'votes', loggedInUser.uid);
      const userDoc = await getDoc(userDocRef).catch(err => {
         const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        // We don't re-throw, as login was successful.
        return null;
      });

      if (!userDoc) return; // Error was handled, stop execution here.

      if (userDoc.exists()) {
         toast({
          title: 'Ya has votado',
          description: 'Serás redirigido a la página de votación para ver los resultados parciales.',
        });
        router.push('/voting-booth');
      } else {
        router.push('/vote');
      }

    } catch (error: any) {
      // This catch block now correctly handles only authentication errors
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

  const resetVotes = async () => {
    if (!db) return;
    try {
        const votesCol = collection(db, 'votes');
        const votesQuery = await getDocs(votesCol).catch(err => {
            const permissionError = new FirestorePermissionError({ path: votesCol.path, operation: 'list' });
            errorEmitter.emit('permission-error', permissionError);
            throw err;
        });

        if (votesQuery.empty) {
            toast({ title: 'No hay votos para resetear.' });
            return;
        }
        const batch = writeBatch(db);
        votesQuery.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit().catch(err => {
            const permissionError = new FirestorePermissionError({ path: 'votes', operation: 'delete' });
            errorEmitter.emit('permission-error', permissionError);
            throw err;
        });

        toast({
            title: 'Votos Reseteados',
            description: 'Todos los registros de votos han sido eliminados.',
        });

    } catch (error: any) {
       if (error.name !== 'FirestorePermissionError') {
        toast({
            title: 'Error al resetear',
            description: 'No se pudieron eliminar los votos.',
            variant: 'destructive',
        });
       }
    }
  };


  const handleAdminLogin = async () => {
    if (adminUser === SUPER_USER && adminPassword === SUPER_USER_PASSWORD) {
      await resetVotes();
      if (auth && auth.currentUser) {
          await signOut(auth);
      }
      setShowAdminLogin(false);
      setAdminUser('');
      setAdminPassword('');
      router.refresh(); 
    } else {
      toast({
        title: 'Acceso de Administrador Fallido',
        description: 'Usuario o contraseña de administrador incorrectos.',
        variant: 'destructive',
      });
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
                  onChange={(e) => setPassword(e.targe.value)}
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

    