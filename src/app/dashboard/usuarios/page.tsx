"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle, Edit, Trash } from "lucide-react";

const users = [
  { id: 'usr01', name: "Gerente Demo", email: "gerente@xchef.local", role: "Gerente", status: "Activo" },
  { id: 'usr02', name: "Carlos", email: "carlos@xchef.local", role: "Mesero", status: "Activo" },
  { id: 'usr03', name: "Ana", email: "ana@xchef.local", role: "Mesero", status: "Activo" },
  { id: 'usr04', name: "Sofia", email: "sofia@xchef.local", role: "Mesero", status: "Inactivo" },
  { id: 'usr05', name: "Juan", email: "juan@xchef.local", role: "Cocinero", status: "Activo" },
  { id: 'usr06', name: "Maria", email: "maria@xchef.local", role: "Cocinero", status: "Activo" },
  { id: 'usr07', name: "Pedro", email: "pedro@xchef.local", role: "Cocinero", status: "Activo" },
];

const roleVariant: { [key: string]: "default" | "secondary" | "outline" } = {
    Gerente: "default",
    Mesero: "secondary",
    Cocinero: "outline"
}

export default function UsuariosPage() {
  return (
    <Card>
      <CardHeader>
         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>
                Crea, modifica y gestiona los usuarios del sistema.
                </CardDescription>
            </div>
            <div className="flex gap-2">
                 <Input placeholder="Buscar usuario..." className="max-w-xs" />
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Usuario
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                      <Badge variant={roleVariant[user.role]}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                      <Badge variant={user.status === 'Activo' ? 'outline' : 'destructive'}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
