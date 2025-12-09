
"use client";

import React, { useState } from 'react';
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle, Edit, Trash, LayoutDashboard, Table as TableIcon, ClipboardList, ChefHat, Menu, Boxes, LineChart, Users, CreditCard } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
  } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/lib/types';


const allPermissions = [
    { id: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "/dashboard/mesas", label: "Gestión de Mesas", icon: TableIcon },
    { id: "/dashboard/pedidos", label: "Pedidos", icon: ClipboardList },
    { id: "/dashboard/cocina", label: "KDS Cocina", icon: ChefHat },
    { id: "/dashboard/menu", label: "Menú", icon: Menu },
    { id: "/dashboard/inventario", label: "Inventario", icon: Boxes },
    { id: "/dashboard/finanzas", label: "Finanzas", icon: LineChart },
    { id: "/dashboard/facturacion", label: "Facturación", icon: CreditCard },
    { id: "/dashboard/usuarios", label: "Usuarios", icon: Users },
];

type UserFormData = Omit<User, 'id'>;

function UserForm({ onSave, userToEdit }: { onSave: (user: UserFormData) => void; userToEdit?: Omit<User, 'id'> | null }) {
    const [user, setUser] = useState<Partial<UserFormData>>(userToEdit || {
        name: '',
        email: '',
        role: '',
        status: 'Activo',
        permissions: []
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSelectChange = (name: 'status', value: string) => {
        setUser(prev => ({...prev, [name]: value}));
    }

    const handlePermissionChange = (permissionId: string) => {
        setUser(prev => {
            const permissions = prev.permissions || [];
            if (permissions.includes(permissionId)) {
                return { ...prev, permissions: permissions.filter(p => p !== permissionId) };
            } else {
                return { ...prev, permissions: [...permissions, permissionId] };
            }
        });
    }

    const handleSave = () => {
        if (user.name && user.email && user.status && user.permissions) {
            onSave(user as UserFormData);
        } else {
            alert("Por favor, completa todos los campos.");
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" name="name" value={user.name} onChange={handleInputChange} placeholder="Ej: Juan Pérez" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={user.email} onChange={handleInputChange} placeholder="Ej: juan@example.com" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="role">Cargo</Label>
                    <Input id="role" name="role" value={user.role} onChange={handleInputChange} placeholder="Ej: Gerente de Turno" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select value={user.status} onValueChange={(value) => handleSelectChange('status', value)}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar Estado"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Activo">Activo</SelectItem>
                            <SelectItem value="Inactivo">Inactivo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className='space-y-2'>
                <Label>Permisos de Acceso</Label>
                <div className='grid grid-cols-2 gap-2 rounded-md border p-4'>
                    {allPermissions.map(permission => (
                        <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`perm-${permission.id}`}
                                checked={user.permissions?.includes(permission.id)}
                                onCheckedChange={() => handlePermissionChange(permission.id)}
                            />
                            <label htmlFor={`perm-${permission.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {permission.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleSave}>Guardar Usuario</Button>
            </DialogFooter>
        </div>
    );
}

export default function UsuariosPage() {
  const { users, setUsers } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleAddNew = () => {
    setEditingUser(null);
    setModalOpen(true);
  }

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  }

  const handleSaveUser = (userData: UserFormData) => {
    if(editingUser) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...editingUser, ...userData } : u));
    } else {
        const newUser: User = {
            id: `usr${Date.now()}`,
            ...userData
        };
        setUsers(prev => [...prev, newUser]);
    }
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };


  return (
    <>
    <Card>
      <CardHeader>
         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>
                Crea, modifica y gestiona los usuarios y sus permisos en el sistema.
                </CardDescription>
            </div>
            <div className="flex gap-2">
                 <Input placeholder="Buscar usuario..." className="max-w-xs" />
                <Button onClick={handleAddNew}>
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
              <TableHead>Cargo</TableHead>
              <TableHead>Permisos</TableHead>
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
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                      <Badge variant={'secondary'}>{user.permissions.length} Permisos</Badge>
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
                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-destructive focus:text-destructive">
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
    <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
                <DialogDescription>
                    {editingUser ? 'Modifica los detalles y permisos del usuario.' : 'Añade un nuevo usuario y asigna sus permisos de acceso.'}
                </DialogDescription>
            </DialogHeader>
            <UserForm onSave={handleSaveUser} userToEdit={editingUser} />
        </DialogContent>
    </Dialog>
    </>
  );
}
