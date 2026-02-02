import React from 'react';
import { Order, OrderStatus } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BadgeCheck, Clock, Package, Truck, XCircle, AlertCircle } from 'lucide-react'; // Icons
import { useOrders } from '@/context/OrderContext';
import { cn } from '@/lib/utils';
import { useOrderStateMachine } from '@/hooks/useOrderStateMachine';

const STATUS_COLORS: Record<OrderStatus, string> = {
    PENDING: "border-l-4 border-l-yellow-500",
    PAID: "border-l-4 border-l-blue-500",
    PROCESSING: "border-l-4 border-l-orange-500",
    SHIPPED: "border-l-4 border-l-indigo-500",
    COMPLETED: "border-l-4 border-l-green-500",
    CANCELLED: "border-l-4 border-l-red-500 opacity-70",
};

const STATUS_ICONS: Record<OrderStatus, React.ReactNode> = {
    PENDING: <Clock className="h-4 w-4" />,
    PAID: <BadgeCheck className="h-4 w-4" />,
    PROCESSING: <Package className="h-4 w-4" />,
    SHIPPED: <Truck className="h-4 w-4" />,
    COMPLETED: <BadgeCheck className="h-4 w-4 text-green-600" />,
    CANCELLED: <XCircle className="h-4 w-4 text-red-600" />,
};

interface OrderCardProps {
    order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
    const { updateStatus } = useOrders();
    const { canTransition } = useOrderStateMachine();

    // Helper to render action buttons
    const renderActions = () => {
        // Determine next logical steps
        // Specific logic per user request
        if (order.status === 'CANCELLED' || order.status === 'COMPLETED') return null;

        return (
            <div className="flex flex-wrap gap-2 w-full">
                {order.status === 'PENDING' && (
                    <Button size="sm" onClick={() => updateStatus(order.id, 'PAID')} className="bg-blue-600 hover:bg-blue-700">
                        Mark Paid
                    </Button>
                )}
                {order.status === 'PAID' && (
                    <Button size="sm" onClick={() => updateStatus(order.id, 'PROCESSING')} className="bg-orange-600 hover:bg-orange-700">
                        Start Baking
                    </Button>
                )}
                {order.status === 'PROCESSING' && (
                    <Button size="sm" onClick={() => updateStatus(order.id, 'SHIPPED')} className="bg-indigo-600 hover:bg-indigo-700">
                        Ship / Ready
                    </Button>
                )}
                {order.status === 'SHIPPED' && (
                    <Button size="sm" onClick={() => updateStatus(order.id, 'COMPLETED')} className="bg-green-600 hover:bg-green-700">
                        Complete
                    </Button>
                )}

                {/* Cancel Option (Always available unless terminal) */}
                {!['COMPLETED', 'CANCELLED'].includes(order.status) && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(order.id, 'CANCELLED')} className="ml-auto text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200">
                        Cancel
                    </Button>
                )}
            </div>
        );
    };

    return (
        <Card className={cn("transition-all hover:shadow-md", STATUS_COLORS[order.status])}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            #{order.id.slice(0, 5)}...
                            <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                                {STATUS_ICONS[order.status]} {order.status}
                            </span>
                        </CardTitle>
                        <p className="text-sm font-medium mt-1">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerPhone}</p>

                        {/* Shipping Info */}
                        <div className="mt-2 text-xs">
                            <span className={cn("px-2 py-0.5 rounded-full font-semibold border",
                                order.shippingMethod === '7-11' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    order.shippingMethod === 'DELIVERY' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                        'bg-gray-50 text-gray-700 border-gray-200'
                            )}>
                                {order.shippingMethod}
                            </span>
                            {order.shippingMethod === '7-11' && order.sevenElevenStoreId && (
                                <div className="mt-1 text-muted-foreground">
                                    Store: {order.sevenElevenStoreId}<br />
                                    {order.sevenElevenAddress}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="font-bold text-lg mt-1">
                            ${order.totalAmount}
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3 pb-2">
                {/* Items List */}
                <div className="space-y-1">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm border-b border-dashed pb-1 last:border-0 last:pb-0">
                            <span>
                                <span className="font-bold mr-1">{item.quantity}x</span>
                                {item.name}
                            </span>
                            {item.notes && <span className="text-xs italic text-muted-foreground max-w-[40%] text-right">{item.notes}</span>}
                        </div>
                    ))}
                </div>

                {/* Special Requests */}
                {order.specialRequests && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-2 rounded-md text-red-600 dark:text-red-400 text-xs font-semibold flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {order.specialRequests}
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-2">
                {renderActions()}
            </CardFooter>
        </Card>
    );
};
