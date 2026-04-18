import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: cartItems = [], refetch } = trpc.cart.getItems.useQuery();
  const removeItemMutation = trpc.cart.removeItem.useMutation();
  const updateQuantityMutation = trpc.cart.updateQuantity.useMutation();

  const handleRemoveItem = async (cartId: number) => {
    try {
      await removeItemMutation.mutateAsync(cartId);
      await refetch();
      toast.success("Item removed from cart");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove item");
    }
  };

  const handleUpdateQuantity = async (cartId: number, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(cartId);
      return;
    }

    try {
      await updateQuantityMutation.mutateAsync({ cartId, quantity });
      await refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to update quantity");
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (parseFloat(item.product?.price || "0") * item.quantity);
  }, 0);

  const tax = subtotal * 0.1;
  const total = subtotal + tax;

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
            <p className="text-muted-foreground mb-4">Please log in to view your cart</p>
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
          <h1 className="text-headline text-3xl">SHOPPING CART</h1>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cartItems.length > 0 ? (
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="art-deco-card flex gap-6"
                  >
                    {item.product?.imageUrl && (
                      <div className="w-32 h-32 bg-muted flex-shrink-0 overflow-hidden">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-accent mb-2">
                          {item.product?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {item.product?.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-bold text-accent">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-2">
                            ${parseFloat(item.product?.price || "0").toFixed(2)} each
                          </p>
                          <p className="text-lg font-bold text-accent">
                            ${(parseFloat(item.product?.price || "0") * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="ml-4 p-2 text-destructive hover:bg-destructive hover:text-destructive-foreground transition"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Your cart is empty</p>
                <Button
                  onClick={() => setLocation("/catalog")}
                  className="bg-accent text-accent-foreground hover:opacity-90"
                >
                  Continue Shopping
                </Button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {cartItems.length > 0 && (
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

                <Button
                  onClick={() => setLocation("/checkout")}
                  className="w-full bg-accent text-accent-foreground hover:opacity-90 py-3 text-base mb-3"
                >
                  Proceed to Checkout
                </Button>

                <Button
                  onClick={() => setLocation("/catalog")}
                  variant="outline"
                  className="w-full border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground py-3 text-base"
                >
                  Continue Shopping
                </Button>

                <div className="mt-8 pt-8 border-t-2 border-accent">
                  <p className="text-xs text-muted-foreground text-center">
                    ✓ Free shipping on all orders<br/>
                    ✓ Secure checkout<br/>
                    ✓ 30-day returns
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
