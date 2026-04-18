import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, LogOut } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: featuredProducts = [] } = trpc.products.getFeatured.useQuery(6);
  const { data: categories = [] } = trpc.categories.list.useQuery();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b-2 border-accent bg-background">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-headline text-2xl">LUXE</h1>
            <span className="text-sm text-accent">MARKETPLACE</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation("/catalog")}
              className="text-accent hover:text-accent-foreground transition"
            >
              Shop
            </button>
            <button
              onClick={() => setLocation("/cart")}
              className="text-accent hover:text-accent-foreground transition flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              Cart
            </button>
            
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === "admin" && (
                  <button
                    onClick={() => setLocation("/admin")}
                    className="px-3 py-1 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition"
                  >
                    Admin
                  </button>
                )}
                <button
                  onClick={() => setLocation("/orders")}
                  className="px-3 py-1 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition"
                >
                  Orders
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-accent text-accent-foreground hover:opacity-90 transition flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <a
                href={getLoginUrl()}
                className="px-4 py-2 bg-accent text-accent-foreground hover:opacity-90 transition"
              >
                Login
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-background py-24 overflow-hidden">
        <div className="absolute inset-0 art-deco-pattern"></div>
        
        <div className="container relative z-10">
          <div className="grid grid-cols-2 gap-12 items-center">
            {/* Left side - Text */}
            <div>
              <div className="mb-8 flex items-center gap-4">
                <div className="art-deco-corner-tl"></div>
                <div className="art-deco-corner-tr"></div>
              </div>
              
              <h2 className="text-headline text-5xl mb-6 text-accent">
                TIMELESS LUXURY
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Curated collections of exquisite craftsmanship and sophisticated elegance. 
                Experience the pinnacle of refined taste with our exclusive marketplace.
              </p>
              
              <div className="flex gap-4">
                <Button
                  onClick={() => setLocation("/catalog")}
                  className="bg-accent text-accent-foreground hover:opacity-90 px-8 py-3 text-base"
                >
                  Explore Collection
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground px-8 py-3 text-base"
                >
                  Learn More
                </Button>
              </div>
              
              <div className="mt-12 flex items-center gap-4">
                <div className="art-deco-corner-bl"></div>
                <div className="art-deco-corner-br"></div>
              </div>
            </div>
            
            {/* Right side - Decorative */}
            <div className="relative h-96 flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-accent opacity-30"></div>
              <div className="text-center">
                <div className="text-6xl text-accent opacity-20 mb-4">✦</div>
                <p className="text-accent text-sm tracking-widest">ESTABLISHED 2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container py-8">
        <div className="art-deco-divider-top"></div>
      </div>

      {/* Featured Products Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h3 className="text-headline text-4xl mb-4 text-accent">
              FEATURED SELECTIONS
            </h3>
            <div className="art-deco-accent-line mx-auto w-32 mb-4"></div>
            <p className="text-muted-foreground">
              Handpicked treasures from our most distinguished collections
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setLocation(`/product/${product.id}`)}
                  className="art-deco-card cursor-pointer hover:opacity-90 transition group"
                >
                  {product.imageUrl && (
                    <div className="mb-4 h-48 bg-muted overflow-hidden flex items-center justify-center">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </div>
                  )}
                  <h4 className="text-lg font-bold text-accent mb-2">{product.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-accent">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No featured products available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="container py-8">
        <div className="art-deco-divider-top"></div>
      </div>

      {/* Categories Section */}
      <section className="py-20 bg-card">
        <div className="container">
          <div className="text-center mb-16">
            <h3 className="text-headline text-4xl mb-4 text-accent">
              EXPLORE CATEGORIES
            </h3>
            <div className="art-deco-accent-line mx-auto w-32 mb-4"></div>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setLocation(`/catalog?category=${category.id}`)}
                  className="group relative py-12 px-6 border-2 border-accent hover:bg-accent transition"
                >
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-accent"></div>
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-accent"></div>
                  
                  <h4 className="text-lg font-bold text-accent group-hover:text-accent-foreground transition">
                    {category.name}
                  </h4>
                  {category.description && (
                    <p className="text-xs text-muted-foreground mt-2 group-hover:text-accent-foreground transition">
                      {category.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No categories available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-accent bg-background py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-accent font-bold mb-4">LUXE</h4>
              <p className="text-sm text-muted-foreground">
                Premium marketplace for discerning collectors
              </p>
            </div>
            <div>
              <h5 className="text-accent font-bold mb-4">Shop</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-accent transition">All Products</a></li>
                <li><a href="#" className="hover:text-accent transition">New Arrivals</a></li>
                <li><a href="#" className="hover:text-accent transition">Collections</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-accent font-bold mb-4">Support</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-accent transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-accent transition">Shipping Info</a></li>
                <li><a href="#" className="hover:text-accent transition">Returns</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-accent font-bold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-accent transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-accent transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-accent pt-8">
            <p className="text-center text-sm text-muted-foreground">
              © 2024 LUXE Marketplace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
