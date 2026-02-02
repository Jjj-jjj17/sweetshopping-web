import React, { useState } from 'react';
import { useOrders } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, ShoppingBag } from 'lucide-react';
import { OrderItem } from '@/types';
import { Modal } from '@/components/ui/modal';

interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose }) => {
    const { addOrder } = useOrders();
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [specialRequests, setSpecialRequests] = useState('');
    const [items, setItems] = useState<OrderItem[]>([{ name: '', quantity: 1, notes: '' }]);
    const [error, setError] = useState<string | null>(null);

    const addItem = () => {
        setItems([...items, { name: '', quantity: 1, notes: '' }]);
    };

    const removeItem = (idx: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== idx));
        }
    };

    const updateItem = (idx: number, field: keyof OrderItem, value: string | number) => {
        const newItems = [...items];
        if (field === 'quantity') {
            newItems[idx].quantity = Number(value);
        } else {
            (newItems[idx] as any)[field] = value;
        }
        setItems(newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Basic Validation
        if (!customerName.trim() || !customerPhone.trim()) {
            setError("Customer details are required.");
            return;
        }

        // Filter empty items
        const validItems = items.filter(i => i.name.trim() !== '');
        if (validItems.length === 0) {
            setError("At least one item is required.");
            return;
        }

        // Phone Regex Check (Simple)
        const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        if (!phoneRegex.test(customerPhone)) {
            setError("Invalid phone number format.");
            return;
        }

        try {
            addOrder({
                customerName,
                customerPhone,
                items: validItems,
                specialRequests,
                status: 'PENDING',
                totalAmount: 0,
                shippingMethod: 'PICKUP'
            });
            console.log("Adding order..."); // Debug

            // Reset Form
            setCustomerName('');
            setCustomerPhone('');
            setSpecialRequests('');
            setItems([{ name: '', quantity: 1, notes: '' }]);
            onClose();
        } catch (e) {
            console.error(e);
            setError("Failed to create order.");
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Order" className="max-w-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Customer Name</label>
                        <Input
                            value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                            placeholder="Ex: John Doe"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Phone</label>
                        <Input
                            value={customerPhone}
                            onChange={e => setCustomerPhone(e.target.value)}
                            placeholder="Ex: 555-0123"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex justify-between">
                        Order Items
                        <Button type="button" size="sm" variant="ghost" className="h-6 text-xs text-primary" onClick={addItem}>
                            <Plus className="h-3 w-3 mr-1" /> Add Item
                        </Button>
                    </label>
                    <div className="space-y-2 max-h-[30vh] overflow-y-auto p-1">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-start bg-secondary/30 p-2 rounded-md">
                                <div className="w-16">
                                    <Input
                                        type="number"
                                        min={1}
                                        value={item.quantity}
                                        onChange={e => updateItem(idx, 'quantity', e.target.value)}
                                        placeholder="Qty"
                                        className="h-8 text-center"
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Input
                                        value={item.name}
                                        onChange={e => updateItem(idx, 'name', e.target.value)}
                                        placeholder="Item Name (e.g. Sourdough)"
                                        className="h-8"
                                    />
                                    <Input
                                        value={item.notes || ''}
                                        onChange={e => updateItem(idx, 'notes', e.target.value)}
                                        placeholder="Notes (optional)"
                                        className="h-7 text-xs"
                                    />
                                </div>
                                {items.length > 1 && (
                                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeItem(idx)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium flex items-center gap-2">
                        Special Requests / Allergies
                        <span className="text-xs text-muted-foreground font-normal">(Visible in Red)</span>
                    </label>
                    <Input
                        value={specialRequests}
                        onChange={e => setSpecialRequests(e.target.value)}
                        placeholder="Ex: NUT ALLERGY, No slicing..."
                        className="border-red-200 focus-visible:ring-red-500"
                    />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="pt-2 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Place Order</Button>
                </div>
            </form>
        </Modal>
    );
};
