import React, { useState } from 'react';
import { useOrders } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Download, Upload, RefreshCw, Trash2, Database } from 'lucide-react';
import { StorageService } from '@/services/storage';

// Since I didn't install dialog (radix), I'll build a simple inline section or modal for "Reset Confirmation" / "PIN check".
// For now, I'll use simple browser confirm() for "Factory Reset" to save time/complexity unless requested otherwise, 
// OR I can use a simple state-based view overlay.
// User requested "Double confirmation required".

export const SettingsPanel = () => {
    const { exportData, importData, factoryReset, orders } = useOrders();
    const [usage, setUsage] = useState<number>(0);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [importString, setImportString] = useState('');

    React.useEffect(() => {
        // Check usage on mount
        if (typeof window !== 'undefined') {
            // Approximate usage
            const size = StorageService.getUsage();
            setUsage(size);
        }
    }, [orders]); // Refresh when orders change

    const handleExport = () => {
        const json = exportData();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lfs_boms_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = () => {
        if (!importString) return;
        try {
            importData(importString);
            alert("Import Successful!");
            setImportString('');
        } catch (e) {
            alert("Import Failed: Invalid JSON or Key Mismatch");
        }
    };

    const usagePercent = (usage / (5 * 1024 * 1024)) * 100;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> Storage Health</CardTitle>
                    <CardDescription>
                        Local storage usage. Max limit is ~5MB.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Used: {(usage / 1024).toFixed(2)} KB</span>
                            <span>Limit: 5 MB</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className={`h-full ${usagePercent > 90 ? 'bg-red-500' : 'bg-primary'}`}
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            />
                        </div>
                        {usagePercent > 90 && <p className="text-red-500 text-xs font-bold">Warning: Storage effectively full!</p>}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>Backup and Restore</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div className="space-y-1">
                            <h4 className="font-medium">Export Data</h4>
                            <p className="text-sm text-muted-foreground">Download decrypted JSON backup.</p>
                        </div>
                        <Button onClick={handleExport} variant="outline" className="gap-2">
                            <Download className="h-4 w-4" /> Export
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-medium">Import Data</h4>
                        <p className="text-sm text-muted-foreground">Paste JSON content here to restore.</p>
                        <textarea
                            className="w-full h-24 p-2 border rounded-md text-xs font-mono"
                            placeholder="Paste JSON here..."
                            value={importString}
                            onChange={(e) => setImportString(e.target.value)}
                        />
                        <Button onClick={handleImport} size="sm" variant="secondary" className="gap-2 w-full">
                            <Upload className="h-4 w-4" /> Restore Data
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-900">
                <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                    {!showResetConfirm ? (
                        <Button variant="destructive" className="w-full gap-2" onClick={() => setShowResetConfirm(true)}>
                            <Trash2 className="h-4 w-4" /> Factory Reset
                        </Button>
                    ) : (
                        <div className="space-y-2 bg-red-50 dark:bg-red-950 p-4 rounded-md">
                            <p className="text-sm font-bold text-red-700">Are you absolutely sure?</p>
                            <p className="text-xs text-red-600">This will delete ALL orders and encryption keys. Data will be unrecoverable.</p>
                            <div className="flex gap-2 mt-2">
                                <Button variant="outline" size="sm" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
                                <Button variant="destructive" size="sm" onClick={factoryReset}>Yes, Delete Everything</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
