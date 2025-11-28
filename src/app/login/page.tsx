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
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("gerente@xchef.local");
  const [password, setPassword] = useState("xchef123");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (
        (email === "gerente@xchef.local" && password === "xchef123") ||
        (email === "mesero@xchef.local" && password === "xchef123") ||
        (email === "cocinero@xchef.local" && password === "xchef123")
      ) {
        toast({
          title: "Inicio de Sesión Exitoso",
          description: "Bienvenido a XChef.",
        });
        router.push("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Error de Autenticación",
          description: "Correo o contraseña incorrectos.",
        });
        setIsLoading(false);
      }
    }, 1000);
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
                placeholder="gerente@xchef.local"
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
            Usa las credenciales de prueba para ingresar:
          </p>
          <ul className="mt-2 list-disc list-inside">
            <li>gerente@xchef.local</li>
            <li>mesero@xchef.local</li>
            <li>cocinero@xchef.local</li>
          </ul>
          <p className="mt-1">(Contraseña: xchef123)</p>
        </CardFooter>
      </Card>
    </div>
  );
}
