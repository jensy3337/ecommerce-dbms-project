import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Plus, Edit2, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

type TabType = "dashboard" | "products" | "orders";

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "1",
    imageUrl: "",
    stock: "0",
    featured: 0,
  });

  const { data: dashboardStats } = trpc.admin.dashboard.stats.useQuery();
  const { data: products = [], refetch: refetchProducts } = trpc.admin.products.list.useQuery();
  const { data: orders = [], refetch: refetchOrders } = trpc.admin.orders.list.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();

  const createProductMutation = trpc.admin.products.create.useMutation();
  const updateProductMutation = trpc.admin.products.update.useMutation();
  const deleteProductMutation = trpc.admin.products.delete.useMutation();
  const updateOrderStatusMutation = trpc.admin.orders.updateStatus.useMutation();

  if (!user || user.role !== "admin") {
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
            <p className="text-muted-foreground mb-4">Admin access required</p>
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

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        await updateProductMutation.mutateAsync({
          id: editingProduct.id,
          name: formData.name,
          description: formData.description,
          price: formData.price,
          categoryId: parseInt(formData.categoryId),
          imageUrl: formData.imageUrl,
          stock: parseInt(formData.stock),
          featured: formData.featured,
        });
        toast.success("Product updated successfully");
      } else {
        await createProductMutation.mutateAsync({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          categoryId: parseInt(formData.categoryId),
          imageUrl: formData.imageUrl,
          stock: parseInt(formData.stock),
        });
        toast.success("Product created successfully");
      }

      setFormData({
        name: "",
        description: "",
        price: "",
        categoryId: "1",
        imageUrl: "",
        stock: "0",
        featured: 0,
      });
      setEditingProduct(null);
      setShowProductForm(false);
      await refetchProducts();
    } catch (error: any) {
      toast.error(error.message || "Failed to save product");
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProductMutation.mutateAsync(productId);
      toast.success("Product deleted successfully");
      await refetchProducts();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  const handleEditProduct = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      categoryId: product.categoryId.toString(),
      imageUrl: product.imageUrl || "",
      stock: product.stock.toString(),
      featured: product.featured,
    });
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      await updateOrderStatusMutation.mutateAsync({ orderId, status });
      toast.success("Order status updated");
      await refetchOrders();
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b-2 border-accent bg-background">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation("/")}
              className="flex items-center gap-2 text-accent hover:text-accent-foreground transition"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-headline text-3xl">ADMIN PANEL</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-accent bg-background sticky top-0 z-10">
        <div className="container flex gap-8">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`py-4 px-4 border-b-2 transition ${
              activeTab === "dashboard"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-accent"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`py-4 px-4 border-b-2 transition ${
              activeTab === "products"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-accent"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-4 px-4 border-b-2 transition ${
              activeTab === "orders"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-accent"
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      <div className="container py-12">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div>
            <h2 className="text-2xl font-bold text-accent mb-8">DASHBOARD</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="art-deco-card">
                <p className="text-sm text-muted-foreground mb-2">TOTAL PRODUCTS</p>
                <p className="text-4xl font-bold text-accent">{dashboardStats?.totalProducts || 0}</p>
              </div>
              <div className="art-deco-card">
                <p className="text-sm text-muted-foreground mb-2">TOTAL ORDERS</p>
                <p className="text-4xl font-bold text-accent">{dashboardStats?.totalOrders || 0}</p>
              </div>
              <div className="art-deco-card">
                <p className="text-sm text-muted-foreground mb-2">TOTAL REVENUE</p>
                <p className="text-4xl font-bold text-accent">
                  ${(dashboardStats?.totalRevenue || 0).toFixed(2)}
                </p>
              </div>
              <div className="art-deco-card flex items-center justify-center">
                <TrendingUp size={48} className="text-accent" />
              </div>
            </div>

            {/* Recent Orders */}
            <div>
              <h3 className="text-xl font-bold text-accent mb-4">RECENT ORDERS</h3>
              <div className="space-y-3">
                {dashboardStats?.recentOrders?.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="art-deco-card flex items-center justify-between">
                    <div>
                      <p className="font-bold text-accent">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-accent">
                      ${parseFloat(order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-accent">PRODUCTS</h2>
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setFormData({
                    name: "",
                    description: "",
                    price: "",
                    categoryId: "1",
                    imageUrl: "",
                    stock: "0",
                    featured: 0,
                  });
                  setShowProductForm(!showProductForm);
                }}
                className="bg-accent text-accent-foreground hover:opacity-90 flex items-center gap-2"
              >
                <Plus size={20} />
                {showProductForm ? "Cancel" : "Add Product"}
              </Button>
            </div>

            {/* Product Form */}
            {showProductForm && (
              <form onSubmit={handleProductSubmit} className="art-deco-card mb-8">
                <h3 className="text-lg font-bold text-accent mb-6">
                  {editingProduct ? "EDIT PRODUCT" : "ADD NEW PRODUCT"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-accent block mb-2">NAME *</label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-input border-accent text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-accent block mb-2">PRICE *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      className="bg-input border-accent text-foreground"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm text-accent block mb-2">DESCRIPTION</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 bg-input border-2 border-accent text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-accent block mb-2">CATEGORY *</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full p-3 bg-input border-2 border-accent text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-accent block mb-2">STOCK *</label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                      className="bg-input border-accent text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-accent block mb-2">FEATURED</label>
                    <select
                      value={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: parseInt(e.target.value) })}
                      className="w-full p-3 bg-input border-2 border-accent text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-sm text-accent block mb-2">IMAGE URL</label>
                  <Input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="bg-input border-accent text-foreground"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                    className="flex-1 bg-accent text-accent-foreground hover:opacity-90"
                  >
                    {createProductMutation.isPending || updateProductMutation.isPending
                      ? "Saving..."
                      : "Save Product"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowProductForm(false)}
                    variant="outline"
                    className="flex-1 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Products List */}
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="art-deco-card flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-accent">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      ${parseFloat(product.price).toFixed(2)} • Stock: {product.stock}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-2 text-accent hover:bg-accent hover:text-accent-foreground transition"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-destructive hover:bg-destructive hover:text-destructive-foreground transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <h2 className="text-2xl font-bold text-accent mb-8">ORDERS</h2>
            <div className="space-y-3">
              {orders.map((order: any) => (
                <div key={order.id} className="art-deco-card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-accent">Order #{order.id}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-accent">
                        ${parseFloat(order.totalAmount).toFixed(2)}
                      </p>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="text-sm p-1 bg-input border-2 border-accent text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Address:</strong> {order.shippingAddress}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
