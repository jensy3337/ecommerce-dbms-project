import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts,
  getCategories,
  getCategoryById,
  getCartItems,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  createOrder,
  getOrdersByUser,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  createOrderItem,
  getOrderItems,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  getUserById,
} from "./db";

// Helper to check if user is admin
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Products router
  products: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getProducts(input?.limit, input?.offset);
      }),

    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const product = await getProductById(input);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }
        return product;
      }),

    getByCategory: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return getProductsByCategory(input);
      }),

    getFeatured: publicProcedure
      .input(z.number().optional())
      .query(async ({ input }) => {
        return getFeaturedProducts(input || 6);
      }),

    search: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        return searchProducts(input);
      }),
  }),

  // Categories router
  categories: router({
    list: publicProcedure.query(async () => {
      return getCategories();
    }),

    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const category = await getCategoryById(input);
        if (!category) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
        }
        return category;
      }),
  }),

  // Cart router
  cart: router({
    getItems: protectedProcedure.query(async ({ ctx }) => {
      const items = await getCartItems(ctx.user.id);
      // Enrich with product details
      const enriched = await Promise.all(
        items.map(async (item) => {
          const product = await getProductById(item.productId);
          return { ...item, product };
        })
      );
      return enriched;
    }),

    addItem: protectedProcedure
      .input(z.object({ productId: z.number(), quantity: z.number().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const product = await getProductById(input.productId);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }
        if (product.stock < input.quantity) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient stock" });
        }
        await addToCart(ctx.user.id, input.productId, input.quantity);
        return { success: true };
      }),

    removeItem: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        await removeFromCart(input);
        return { success: true };
      }),

    updateQuantity: protectedProcedure
      .input(z.object({ cartId: z.number(), quantity: z.number().min(1) }))
      .mutation(async ({ input }) => {
        await updateCartQuantity(input.cartId, input.quantity);
        return { success: true };
      }),

    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  // Orders router
  orders: router({
    create: protectedProcedure
      .input(
        z.object({
          items: z.array(z.object({ productId: z.number(), quantity: z.number() })),
          customerName: z.string(),
          customerEmail: z.string(),
          shippingAddress: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Calculate subtotal and validate stock
        let subtotal = 0;
        const orderItems: Array<{ productId: number; quantity: number; price: string }> = [];

        for (const item of input.items) {
          const product = await getProductById(item.productId);
          if (!product) {
            throw new TRPCError({ code: "NOT_FOUND", message: `Product ${item.productId} not found` });
          }
          if (product.stock < item.quantity) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Insufficient stock for ${product.name}`,
            });
          }
          const itemTotal = parseFloat(product.price) * item.quantity;
          subtotal += itemTotal;
          orderItems.push({
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          });
        }

        const taxAmount = subtotal * 0.1;
        const totalAmount = subtotal + taxAmount;

        // Create order
        let orderResult;
        try {
          orderResult = await createOrder(ctx.user.id, totalAmount.toFixed(2), input.shippingAddress, input.customerName, input.customerEmail);
        } catch (error) {
          console.error('[Orders] Error creating order:', error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create order" });
        }
        
        if (!orderResult) {
          console.error('[Orders] Order result is null or undefined');
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create order" });
        }

        // Get the order ID from the result
        const orderId = orderResult.id;
        if (!orderId) {
          console.error('[Orders] Order result missing ID:', JSON.stringify(orderResult));
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get order ID" });
        }

        // Create order items
        for (const item of orderItems) {
          await createOrderItem(orderId, item.productId, item.quantity, item.price);
        }

        // Clear user's cart
        await clearCart(ctx.user.id);

        return { orderId, subtotal, taxAmount, totalAmount };
      }),

    getHistory: protectedProcedure.query(async ({ ctx }) => {
      const userOrders = await getOrdersByUser(ctx.user.id);
      // Enrich with order items
      const enriched = await Promise.all(
        userOrders.map(async (order) => {
          const items = await getOrderItems(order.id);
          return { ...order, items };
        })
      );
      return enriched;
    }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input, ctx }) => {
        const order = await getOrderById(input);
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }
        // Check authorization
        if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        }
        const items = await getOrderItems(order.id);
        return { ...order, items };
      }),
  }),

  // Admin router
  admin: router({
    products: router({
      list: adminProcedure.query(async () => {
        return getProducts();
      }),

      create: adminProcedure
        .input(
          z.object({
            name: z.string(),
            description: z.string(),
            price: z.string(),
            categoryId: z.number(),
            imageUrl: z.string(),
            stock: z.number(),
          })
        )
        .mutation(async ({ input }) => {
          const result = await createProduct(
            input.name,
            input.description,
            input.price,
            input.categoryId,
            input.imageUrl,
            input.stock
          );
          return { success: true, result };
        }),

      update: adminProcedure
        .input(
          z.object({
            id: z.number(),
            name: z.string(),
            description: z.string(),
            price: z.string(),
            categoryId: z.number(),
            imageUrl: z.string(),
            stock: z.number(),
            featured: z.number(),
          })
        )
        .mutation(async ({ input }) => {
          await updateProduct(
            input.id,
            input.name,
            input.description,
            input.price,
            input.categoryId,
            input.imageUrl,
            input.stock,
            input.featured
          );
          return { success: true };
        }),

      delete: adminProcedure
        .input(z.number())
        .mutation(async ({ input }) => {
          await deleteProduct(input);
          return { success: true };
        }),
    }),

    orders: router({
      list: adminProcedure.query(async () => {
        const allOrders = await getAllOrders();
        // Enrich with order items and user info
        const enriched = await Promise.all(
          allOrders.map(async (order) => {
            const items = await getOrderItems(order.id);
            const user = await getUserById(order.userId);
            return { ...order, items, user };
          })
        );
        return enriched;
      }),

      updateStatus: adminProcedure
        .input(z.object({ orderId: z.number(), status: z.string() }))
        .mutation(async ({ input }) => {
          await updateOrderStatus(input.orderId, input.status);
          return { success: true };
        }),
    }),

    dashboard: router({
      stats: adminProcedure.query(async () => {
        const allProducts = await getProducts();
        const allOrders = await getAllOrders();
        const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
        const totalOrders = allOrders.length;
        const totalProducts = allProducts.length;

        return {
          totalProducts,
          totalOrders,
          totalRevenue,
          recentOrders: allOrders.slice(-5),
        };
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
