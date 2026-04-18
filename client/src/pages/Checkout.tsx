import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [shippingAddress, setShippingAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: cartItems = [] } = trpc.cart.getItems.useQuery();
  const createOrderMutation = trpc.orders.create.useMutation();

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (parseFloat(item.product?.price || "0") * item.quantity);
  }, 0);

  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      toast.error("Please enter a shipping address");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessing(true);

    try {
      const result = await createOrderMutation.mutateAsync({
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress,
      });

      toast.success("Order placed successfully!");
      setLocation(`/order-confirmation/${result.orderId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

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
            <p className="text-muted-foreground mb-4">Please log in to checkout</p>
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container py-12">
          <button
            onClick={() => setLocation("/cart")}
            className="flex items-center gap-2 text-accent hover:text-accent-foreground transition mb-8"
          >
            <ChevronLeft size={20} />
            Back to Cart
          </button>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Button
              onClick={() => setLocation("/catalog")}
              className="bg-accent text-accent-foreground hover:opacity-90"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b-2 border-accent bg-background">
        <div className="container py-4 flex items-center gap-4">
          <button
            onClick={() => setLocation("/cart")}
            className="flex items-center gap-2 text-accent hover:text-accent-foreground transition"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          <h1 className="text-headline text-3xl">CHECKOUT</h1>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="art-deco-card mb-8">
              <h2 className="text-2xl font-bold text-accent mb-6">BILLING & SHIPPING</h2>

              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <label className="text-sm text-accent block mb-2">FULL NAME</label>
                  <Input
                    type="text"
                    value={user.name || ""}
                    disabled
                    className="bg-input border-accent text-foreground"
                  />
                </div>

                <div>
                  <label className="text-sm text-accent block mb-2">EMAIL</label>
                  <Input
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="bg-input border-accent text-foreground"
                  />
                </div>

                {/* Shipping Address */}
                <div>
                  <label className="text-sm text-accent block mb-2">SHIPPING ADDRESS *</label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter your complete shipping address"
                    className="w-full p-3 bg-input border-2 border-accent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="art-deco-card">
              <h2 className="text-2xl font-bold text-accent mb-6">ORDER ITEMS</h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-4 border-b border-accent last:border-b-0"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-accent">{item.product?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ${parseFloat(item.product?.price || "0").toFixed(2)}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-accent">
                      ${(parseFloat(item.product?.price || "0") * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="art-deco-card sticky top-4">
              <h2 className="text-lg font-bold text-accent mb-6">ORDER SUMMARY</h2>

              <div className="space-y-4 mb-6 pb-6 border-b-2 border-accent">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-accent">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span className="text-accent">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-accent">FREE</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold text-accent">Total</span>
                <span className="text-3xl font-bold text-accent">
                  ${total.toFixed(2)}
                </span>
              </div>

              {/* Payment Info */}
              <div className="mb-8 p-4 bg-card border-2 border-accent">
                <p className="text-xs text-muted-foreground text-center">
                  This is a demonstration. In production, payment processing would be handled here.
                </p>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !shippingAddress.trim()}
                className="w-full bg-accent text-accent-foreground hover:opacity-90 py-3 text-base mb-3"
              >
                {isProcessing ? "Processing..." : "Place Order"}
              </Button>

              <Button
                onClick={() => setLocation("/cart")}
                variant="outline"
                className="w-full border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground py-3 text-base"
              >
                Return to Cart
              </Button>

              <div className="mt-8 pt-8 border-t-2 border-accent">
                <p className="text-xs text-muted-foreground text-center">
                  ✓ Secure checkout<br/>
                  ✓ Your information is protected<br/>
                  ✓ 30-day returns
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
