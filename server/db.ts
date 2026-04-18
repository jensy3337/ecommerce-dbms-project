import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, categories, cart, orders, orderItems } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Products queries
export async function getProducts(limit?: number, offset?: number) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(products);
  if (limit) query.limit(limit);
  if (offset) query.offset(offset);
  return query;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.categoryId, categoryId));
}

export async function getFeaturedProducts(limit: number = 6) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.featured, 1)).limit(limit);
}

export async function searchProducts(query: string) {
  const db = await getDb();
  if (!db) return [];
  // Simple search implementation
  return db.select().from(products).where(
    sql`${products.name} LIKE ${`%${query}%`}`
  );
}

// Categories queries
export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Cart queries
export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cart).where(eq(cart.userId, userId));
}

export async function addToCart(userId: number, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await db.select().from(cart)
    .where(sql`${cart.userId} = ${userId} AND ${cart.productId} = ${productId}`)
    .limit(1);
  
  if (existing.length > 0) {
    await db.update(cart)
      .set({ quantity: existing[0].quantity + quantity })
      .where(sql`${cart.userId} = ${userId} AND ${cart.productId} = ${productId}`);
  } else {
    await db.insert(cart).values({ userId, productId, quantity });
  }
}

export async function removeFromCart(cartId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(cart).where(eq(cart.id, cartId));
}

export async function updateCartQuantity(cartId: number, quantity: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(cart).set({ quantity }).where(eq(cart.id, cartId));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(cart).where(eq(cart.userId, userId));
}

// Orders queries
export async function createOrder(userId: number, totalAmount: string, shippingAddress: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(orders).values({
    userId,
    totalAmount: totalAmount as any,
    shippingAddress,
    status: 'pending',
  });
  return result;
}

export async function getOrdersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId));
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders);
}

export async function updateOrderStatus(orderId: number, status: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ status: status as any }).where(eq(orders.id, orderId));
}

// Order Items queries
export async function createOrderItem(orderId: number, productId: number, quantity: number, price: string) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(orderItems).values({
    orderId,
    productId,
    quantity,
    price: price as any,
  });
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

// Admin queries
export async function createProduct(name: string, description: string, price: string, categoryId: number, imageUrl: string, stock: number) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(products).values({
    name,
    description,
    price: price as any,
    categoryId,
    imageUrl,
    stock,
  });
}

export async function updateProduct(productId: number, name: string, description: string, price: string, categoryId: number, imageUrl: string, stock: number, featured: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(products)
    .set({ name, description, price: price as any, categoryId, imageUrl, stock, featured })
    .where(eq(products.id, productId));
}

export async function deleteProduct(productId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(products).where(eq(products.id, productId));
}

export async function createCategory(name: string, description: string) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(categories).values({ name, description });
}
