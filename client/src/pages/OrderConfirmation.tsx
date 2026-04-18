import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronLeft } from "lucide-react";

export default function OrderConfirmation() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/order-confirmation/:id");

  const orderId = params?.id;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
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
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12 flex-1 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="art-deco-card text-center">
            {/* Success Icon */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 border-4 border-accent rounded-full animate-pulse"></div>
                <CheckCircle size={80} className="text-accent relative z-10" />
              </div>
            </div>

            {/* Confirmation Message */}
            <h1 className="text-headline text-4xl mb-4 text-accent">
              ORDER CONFIRMED
            </h1>

            <div className="art-deco-accent-line mx-auto w-32 mb-6"></div>

            <p className="text-lg text-muted-foreground mb-8">
              Thank you for your purchase. Your order has been successfully placed.
            </p>

            {/* Order Details */}
            <div className="bg-card border-2 border-accent p-8 mb-8">
              <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b-2 border-accent">
                <div className="text-left">
                  <p className="text-sm text-muted-foreground mb-2">ORDER NUMBER</p>
                  <p className="text-2xl font-bold text-accent">#{orderId}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground mb-2">STATUS</p>
                  <p className="text-2xl font-bold text-accent">PENDING</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date:</span>
                  <span className="text-accent font-bold">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Delivery:</span>
                  <span className="text-accent font-bold">
                    {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="art-deco-card mb-8">
              <h3 className="text-lg font-bold text-accent mb-4">WHAT'S NEXT</h3>
              <ul className="text-left space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold">1.</span>
                  <span>A confirmation email has been sent to your registered email address</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold">2.</span>
                  <span>Your order will be processed and shipped within 1-2 business days</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold">3.</span>
                  <span>You can track your order status from your account dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold">4.</span>
                  <span>For questions, contact our support team at support@luxemarketplace.com</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={() => setLocation("/orders")}
                className="flex-1 bg-accent text-accent-foreground hover:opacity-90 py-3 text-base"
              >
                View Order History
              </Button>
              <Button
                onClick={() => setLocation("/catalog")}
                variant="outline"
                className="flex-1 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground py-3 text-base"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
