
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { XChefLogo } from "@/components/icons";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { allNavItems } from "@/app/dashboard/layout";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Iniciar Sesión | XChef";
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser) {
        toast({
          title: "Inicio de Sesión Exitoso",
          description: "Bienvenido a XChef.",
        });
        
        // Find the first page the user has access to
        const userPermissions = loggedInUser.permissions || [];
        const availableNavItems = allNavItems.filter(item => userPermissions.includes(item.href));
        
        const redirectTo = availableNavItems.length > 0 ? availableNavItems[0].href : '/login';

        router.push(redirectTo);

      } else {
        toast({
          variant: "destructive",
          title: "Error de Autenticación",
          description: "Correo incorrecto o usuario inactivo.",
        });
        setIsLoading(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: "No se pudo conectar con el servidor.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <XChefLogo className="h-16 w-16 text-primary" />
          <CardTitle className="font-headline text-3xl">Bienvenido a XChef</CardTitle>
          <CardDescription>
            Inicia sesión para gestionar tu restaurante
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col text-center text-xs text-muted-foreground">
          <p>
            Sistema de Gestión de Restaurantes XChef
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
