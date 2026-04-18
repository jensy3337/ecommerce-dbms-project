import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user context
function createMockContext(role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("E-Commerce API", () => {
  describe("Products", () => {
    it("should list products", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const products = await caller.products.list.query({});
      expect(Array.isArray(products)).toBe(true);
    });

    it("should search products", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const results = await caller.products.search.query("test");
      expect(Array.isArray(results)).toBe(true);
    });

    it("should get featured products", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const featured = await caller.products.getFeatured.query(6);
      expect(Array.isArray(featured)).toBe(true);
    });
  });

  describe("Categories", () => {
    it("should list categories", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const categories = await caller.categories.list.query();
      expect(Array.isArray(categories)).toBe(true);
    });
  });

  describe("Cart", () => {
    it("should get cart items for authenticated user", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const cartItems = await caller.cart.getItems.query();
      expect(Array.isArray(cartItems)).toBe(true);
    });

    it("should clear cart", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.cart.clear.mutation();
      expect(result.success).toBe(true);
    });
  });

  describe("Orders", () => {
    it("should get order history for authenticated user", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const orders = await caller.orders.getHistory.query();
      expect(Array.isArray(orders)).toBe(true);
    });
  });

  describe("Admin", () => {
    it("should deny admin access to non-admin users", async () => {
      const ctx = createMockContext("user");
      const caller = appRouter.createCaller(ctx);
      
      try {
        await caller.admin.dashboard.stats.query();
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should allow admin to access dashboard", async () => {
      const ctx = createMockContext("admin");
      const caller = appRouter.createCaller(ctx);
      const stats = await caller.admin.dashboard.stats.query();
      
      expect(stats).toHaveProperty("totalProducts");
      expect(stats).toHaveProperty("totalOrders");
      expect(stats).toHaveProperty("totalRevenue");
    });

    it("should allow admin to list products", async () => {
      const ctx = createMockContext("admin");
      const caller = appRouter.createCaller(ctx);
      const products = await caller.admin.products.list.query();
      expect(Array.isArray(products)).toBe(true);
    });

    it("should allow admin to list orders", async () => {
      const ctx = createMockContext("admin");
      const caller = appRouter.createCaller(ctx);
      const orders = await caller.admin.orders.list.query();
      expect(Array.isArray(orders)).toBe(true);
    });
  });

  describe("Authentication", () => {
    it("should return current user info", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const user = await caller.auth.me.query();
      expect(user).toEqual(ctx.user);
    });

    it("should logout user", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.logout.mutation();
      expect(result.success).toBe(true);
    });
  });
});
