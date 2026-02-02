"use client";

import React, { useState } from 'react';
import { useOrders } from '@/context/OrderContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, ShieldCheck, AlertTriangle } from 'lucide-react';

export const LoginScreen = () => {
    const { isInitialized, initialize, login, error } = useOrders();
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (pin.length < 4) {
            setLocalError("PIN must be at least 4 characters");
            return;
        }

        if (!isInitialized) {
            if (pin !== confirmPin) {
                setLocalError("PINs do not match");
                return;
            }
            initialize(pin);
        } else {
            const success = login(pin);
            if (!success) {
                setLocalError("Incorrect PIN");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md border-2 border-primary/20 shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        {isInitialized ? <Lock className="h-6 w-6 text-primary" /> : <ShieldCheck className="h-6 w-6 text-primary" />}
                    </div>
                    <CardTitle className="text-2xl">
                        {isInitialized ? 'Kitchen Access' : 'System Setup'}
                    </CardTitle>
                    <CardDescription>
                        {isInitialized
                            ? 'Enter your security PIN to access the dashboard'
                            : 'Create a secure PIN for local encyption'}
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder={isInitialized ? "Enter PIN" : "Create PIN"}
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="text-center text-lg tracking-widest"
                                autoFocus
                            />
                        </div>
                        {!isInitialized && (
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="Confirm PIN"
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value)}
                                    className="text-center text-lg tracking-widest"
                                />
                            </div>
                        )}

                        {(localError || error) && (
                            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                <AlertTriangle className="h-4 w-4" />
                                <p>{localError || error}</p>
                            </div>
                        )}

                        {!isInitialized && (
                            <div className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-md">
                                <p className="font-semibold mb-1">Security Note:</p>
                                Your data is encrypted locally. If you lose this PIN, your data cannot be recovered unless you have an exported backup.
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" size="lg">
                            {isInitialized ? 'Unlock Dashboard' : 'Initialize System'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};
