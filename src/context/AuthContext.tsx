
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { initialUsers } from '@/lib/data';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    users: User[];
    login: (email: string) => boolean;
    logout: () => void;
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    updateUserAvatar: (userId: string, avatarUrl: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    const login = (email: string): boolean => {
        const foundUser = users.find(u => u.email === email);
        if (foundUser && foundUser.status === 'Activo') {
            setUser(foundUser);
            return true;
        }
        setUser(null);
        return false;
    };

    const logout = () => {
        setUser(null);
        router.push('/login');
    };
    
    const updateUserAvatar = (userId: string, avatarUrl: string) => {
        setUsers(prevUsers =>
            prevUsers.map(u => (u.id === userId ? { ...u, avatarUrl } : u))
        );
        if (user && user.id === userId) {
            setUser(prevUser => (prevUser ? { ...prevUser, avatarUrl } : null));
        }
    };

    const value = {
        user,
        users,
        login,
        logout,
        setUsers,
        updateUserAvatar
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
