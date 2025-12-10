
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { 
  apiAutenticacion, 
  apiUsuarios, 
  obtenerToken, 
  establecerToken,
  type Usuario as UsuarioAPI 
} from '@/services/api';

// Convertir de formato API a formato frontend
const convertirUsuario = (u: UsuarioAPI): User => ({
  id: u.id,
  name: u.nombre,
  email: u.correo,
  role: u.rol,
  status: u.estado,
  permissions: u.permisos,
  avatarUrl: u.urlAvatar,
});

// Convertir de formato frontend a formato API
const convertirAUsuarioAPI = (u: User): UsuarioAPI => ({
  id: u.id,
  nombre: u.name,
  correo: u.email,
  rol: u.role,
  estado: u.status,
  permisos: u.permissions,
  urlAvatar: u.avatarUrl,
});

interface AuthContextType {
    user: User | null;
    users: User[];
    loading: boolean;
    login: (email: string, password?: string) => Promise<User | null>;
    logout: () => void;
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    updateUserAvatar: (userId: string, avatarUrl: string) => void;
    refreshUsers: () => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<User[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Cargar usuarios al inicio
    useEffect(() => {
        const inicializar = async () => {
            try {
                // Verificar si hay un token guardado
                const token = obtenerToken();
                if (token) {
                    const { usuario } = await apiAutenticacion.verificarSesion();
                    setUser(convertirUsuario(usuario));
                }
            } catch (error) {
                console.error('Error al verificar sesión:', error);
                establecerToken(null);
            } finally {
                setLoading(false);
            }
        };
        inicializar();
    }, []);

    // Cargar lista de usuarios cuando hay sesión activa
    useEffect(() => {
        if (user) {
            refreshUsers();
        }
    }, [user]);

    const refreshUsers = async () => {
        try {
            const usuariosAPI = await apiUsuarios.obtenerTodos();
            setUsers(usuariosAPI.map(convertirUsuario));
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    };

    const login = async (email: string, password?: string): Promise<User | null> => {
        try {
            const { usuario } = await apiAutenticacion.iniciarSesion(email, password);
            const userConvertido = convertirUsuario(usuario);
            setUser(userConvertido);
            return userConvertido;
        } catch (error) {
            console.error('Error en login:', error);
            setUser(null);
            return null;
        }
    };

    const logout = () => {
        apiAutenticacion.cerrarSesion();
        setUser(null);
        router.push('/login');
    };
    
    const updateUserAvatar = async (userId: string, avatarUrl: string) => {
        try {
            await apiUsuarios.actualizarAvatar(userId, avatarUrl);
            setUsers((prevUsers: User[]) =>
                prevUsers.map((u: User) => (u.id === userId ? { ...u, avatarUrl } : u))
            );
            if (user && user.id === userId) {
                setUser((prevUser: User | null) => (prevUser ? { ...prevUser, avatarUrl } : null));
            }
        } catch (error) {
            console.error('Error al actualizar avatar:', error);
        }
    };

    const changePassword = async (currentPassword: string, newPassword: string) => {
        if (!user) throw new Error('No hay usuario autenticado');
        await apiUsuarios.cambiarContrasena(user.id, currentPassword, newPassword);
    };

    const value = {
        user,
        users,
        loading,
        login,
        logout,
        setUsers,
        updateUserAvatar,
        refreshUsers,
        changePassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
