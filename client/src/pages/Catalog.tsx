import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft } from "lucide-react";

export default function Catalog() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: products = [] } = trpc.products.list.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { data: searchResults = [] } = trpc.products.search.useQuery(searchQuery, {
    enabled: searchQuery.length > 0,
  });

  const filteredProducts = searchQuery.length > 0 
    ? searchResults
    : selectedCategory 
      ? products.filter(p => p.categoryId === selectedCategory)
      : products;

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
          <h1 className="text-headline text-3xl">COLLECTION</h1>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="art-deco-card">
              <h3 className="text-lg font-bold text-accent mb-6">FILTERS</h3>

              {/* Search */}
              <div className="mb-8">
                <label className="text-sm text-accent block mb-2">SEARCH</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-input border-accent text-foreground placeholder:text-muted-foreground"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="text-sm text-accent block mb-4">CATEGORIES</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`block w-full text-left px-4 py-2 transition ${
                      selectedCategory === null
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-accent"
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`block w-full text-left px-4 py-2 transition ${
                        selectedCategory === category.id
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-accent"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Products */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-accent">
                {selectedCategory
                  ? categories.find(c => c.id === selectedCategory)?.name || "Products"
                  : searchQuery
                    ? `Search Results for "${searchQuery}"`
                    : "All Products"}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                {filteredProducts.length} items found
              </p>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProducts.map((product) => (
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
                      <span className={`text-xs ${product.stock > 0 ? "text-accent" : "text-destructive"}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No products found</p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                  className="bg-accent text-accent-foreground hover:opacity-90"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
