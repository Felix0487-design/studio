"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { USERS, SUPER_SECRET_PASSWORD, SUPER_USER, SUPER_USER_PASSWORD } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Snowflake } from 'lucide-react';

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  const [snowflakeClicks, setSnowflakeClicks] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedUser) {
      setError('Por favor, selecciona tu nombre.');
      return;
    }
    if (password === SUPER_SECRET_PASSWORD) {
      login(selectedUser);
      router.push('/vote');
    } else {
      setError('Contraseña incorrecta. Pista: el vínculo que nos une.');
      toast({
        title: 'Error de acceso',
        description: 'Contraseña incorrecta. Vuelve a intentarlo.',
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

  const handleAdminLogin = () => {
    if (adminUser === SUPER_USER && adminPassword === SUPER_USER_PASSWORD) {
      localStorage.removeItem('navidad-votes');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('navidad-voted_')) {
          localStorage.removeItem(key);
        }
      });
      toast({
        title: 'Votos Reseteados',
        description: 'Todos los registros de votos han sido eliminados.',
      });
      setShowAdminLogin(false);
      setAdminUser('');
      setAdminPassword('');
    } else {
      toast({
        title: 'Acceso de Administrador Fallido',
        description: 'Usuario o contraseña de administrador incorrectos.',
        variant: 'destructive',
      });
    }
  };


  if (!isClient) {
    return null; // Or a loading skeleton
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
