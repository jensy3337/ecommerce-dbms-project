import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export default function ProductDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/product/:id");
  const [quantity, setQuantity] = useState(1);

  const productId = params?.id ? parseInt(params.id) : null;
  const { data: product, isLoading } = trpc.products.getById.useQuery(productId || 0, {
    enabled: !!productId,
  });
  const { data: relatedProducts = [] } = trpc.products.list.useQuery();
  const addToCartMutation = trpc.cart.addItem.useMutation();

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity,
      });
      toast.success(`Added ${quantity} item(s) to cart`);
      setQuantity(1);
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container py-12">
          <button
            onClick={() => setLocation("/catalog")}
            className="flex items-center gap-2 text-accent hover:text-accent-foreground transition mb-8"
          >
            <ChevronLeft size={20} />
            Back to Catalog
          </button>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Product not found</p>
            <Button
              onClick={() => setLocation("/catalog")}
              className="bg-accent text-accent-foreground hover:opacity-90"
            >
              Browse Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const relatedItems = relatedProducts
    .filter(p => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b-2 border-accent bg-background">
        <div className="container py-4 flex items-center gap-4">
          <button
            onClick={() => setLocation("/catalog")}
            className="flex items-center gap-2 text-accent hover:text-accent-foreground transition"
          >
            <ChevronLeft size={20} />
            Back
          </button>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="art-deco-frame p-8">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No image available</p>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-8">
              <h1 className="text-headline text-4xl mb-4 text-accent">{product.name}</h1>
              <div className="art-deco-accent-line mb-6"></div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price and Stock */}
            <div className="art-deco-card mb-8">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-sm text-muted-foreground">PRICE</span>
                <span className="text-4xl font-bold text-accent">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">AVAILABILITY</span>
                <span className={`text-lg font-bold ${product.stock > 0 ? "text-accent" : "text-destructive"}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Add to Cart Section */}
            {product.stock > 0 && (
              <div className="art-deco-card mb-8">
                <div className="mb-6">
                  <label className="text-sm text-accent block mb-3">QUANTITY</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition"
                    >
                      −
                    </button>
                    <Input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-20 text-center bg-input border-accent text-foreground"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-2 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending}
                  className="w-full bg-accent text-accent-foreground hover:opacity-90 py-3 text-base flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                </Button>
              </div>
            )}

            {/* Product Details */}
            <div className="art-deco-card">
              <h3 className="text-lg font-bold text-accent mb-4">PRODUCT DETAILS</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="text-accent ml-2">PROD-{product.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">CATEGORY:</span>
                  <span className="text-accent ml-2">Premium Collection</span>
                </div>
                <div>
                  <span className="text-muted-foreground">CONDITION:</span>
                  <span className="text-accent ml-2">New</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedItems.length > 0 && (
          <div>
            <div className="mb-8">
              <h2 className="text-headline text-3xl text-accent mb-4">RELATED ITEMS</h2>
              <div className="art-deco-accent-line w-32"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setLocation(`/product/${item.id}`)}
                  className="art-deco-card cursor-pointer hover:opacity-90 transition group"
                >
                  {item.imageUrl && (
                    <div className="mb-4 h-40 bg-muted overflow-hidden flex items-center justify-center">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </div>
                  )}
                  <h4 className="text-base font-bold text-accent mb-2">{item.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-accent">
                      ${parseFloat(item.price).toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
