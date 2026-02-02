"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminLogin() {
    const router = useRouter();
    const { initialize } = useOrders(); // We might repurpose this or remove it
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Successful Login
            // We might still initialize the local OrderContext logic if needed
            // but now Auth is handled by Supabase.
            // initialize(password); // Maybe not needed if we rely on RLS and valid session?

            router.push('/admin/dashboard');
            router.refresh(); // Refresh to update middleware/layout state
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary/20 p-4">
            <Card className="max-w-md w-full shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full mb-2 w-fit">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
                    <CardDescription>Secure access for store management</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>

                        {error && <p className="text-sm text-destructive text-center">{error}</p>}

                        <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Sign In'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
