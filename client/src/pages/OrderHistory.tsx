import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function OrderHistory() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const { data: orders = [] } = trpc.orders.getHistory.useQuery();

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container py-12">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-accent hover:text-accent-foreground transition mb-8"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Please log in to view your orders</p>
            <Button
              onClick={() => setLocation("/")}
              className="bg-accent text-accent-foreground hover:opacity-90"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-accent";
      case "processing":
        return "text-accent";
      case "pending":
        return "text-muted-foreground";
      case "cancelled":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b-2 border-accent bg-background">
        <div className="container py-4 flex items-center gap-4">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-accent hover:text-accent-foreground transition"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          <h1 className="text-headline text-3xl">ORDER HISTORY</h1>
        </div>
      </div>

      <div className="container py-12">
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="art-deco-card">
                <button
                  onClick={() =>
                    setExpandedOrderId(expandedOrderId === order.id ? null : order.id)
                  }
                  className="w-full flex items-center justify-between hover:opacity-90 transition"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-lg font-bold text-accent">
                        Order #{order.id}
                      </span>
                      <span className={`text-sm font-bold uppercase ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span>
                        {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
                      </span>
                      <span className="text-lg font-bold text-accent">
                        ${parseFloat(order.totalAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    size={24}
                    className={`text-accent transition ${
                      expandedOrderId === order.id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Expanded Details */}
                {expandedOrderId === order.id && (
                  <div className="mt-6 pt-6 border-t-2 border-accent">
                    {/* Order Items */}
                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-accent mb-4">ITEMS</h3>
                      <div className="space-y-3">
                        {order.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div>
                              <p className="text-accent font-bold">
                                {item.productId}
                              </p>
                              <p className="text-muted-foreground">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <span className="text-accent font-bold">
                              ${parseFloat(item.price).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="mb-6 pb-6 border-b-2 border-accent">
                      <h3 className="text-sm font-bold text-accent mb-2">
                        SHIPPING ADDRESS
                      </h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {order.shippingAddress}
                      </p>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-card border-2 border-accent p-4 mb-6">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="text-accent">
                            ${(parseFloat(order.totalAmount) / 1.1).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tax (10%)</span>
                          <span className="text-accent">
                            ${(parseFloat(order.totalAmount) * 0.1 / 1.1).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-accent">
                          <span className="text-accent">Total</span>
                          <span className="text-accent">
                            ${parseFloat(order.totalAmount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setLocation(`/order/${order.id}`)}
                        className="flex-1 bg-accent text-accent-foreground hover:opacity-90 py-2 text-sm"
                      >
                        View Details
                      </Button>
                      <Button
                        onClick={() => setLocation("/catalog")}
                        variant="outline"
                        className="flex-1 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground py-2 text-sm"
                      >
                        Order Again
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
            <Button
              onClick={() => setLocation("/catalog")}
              className="bg-accent text-accent-foreground hover:opacity-90"
            >
              Start Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
