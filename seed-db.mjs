import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool(process.env.DATABASE_URL);

async function seedDatabase() {
  const connection = await pool.getConnection();
  
  try {
    // Insert categories
    const categories = [
      { id: 1, name: 'Fine Jewelry', description: 'Exquisite jewelry pieces' },
      { id: 2, name: 'Luxury Watches', description: 'Premium timepieces' },
      { id: 3, name: 'Designer Accessories', description: 'Sophisticated accessories' },
      { id: 4, name: 'Premium Leather', description: 'Fine leather goods' },
      { id: 5, name: 'Exclusive Fragrances', description: 'Rare and premium fragrances' },
    ];

    for (const cat of categories) {
      await connection.execute(
        'INSERT IGNORE INTO categories (id, name, description) VALUES (?, ?, ?)',
        [cat.id, cat.name, cat.description]
      );
    }

    // Insert products
    const products = [
      {
        name: 'Diamond Solitaire Ring',
        description: 'Exquisite 2-carat diamond solitaire set in 18k white gold with timeless elegance.',
        price: '4999.99',
        categoryId: 1,
        stock: 15,
        featured: 1,
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop'
      },
      {
        name: 'Platinum Bracelet',
        description: 'Sophisticated platinum bracelet adorned with emeralds and diamonds.',
        price: '3499.99',
        categoryId: 1,
        stock: 8,
        featured: 1,
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop'
      },
      {
        name: 'Luxury Chronograph Watch',
        description: 'Swiss-made chronograph with sapphire crystal and leather strap.',
        price: '5999.99',
        categoryId: 2,
        stock: 12,
        featured: 1,
        imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&h=500&fit=crop'
      },
      {
        name: 'Gold Dress Watch',
        description: 'Elegant 18k gold dress watch with automatic movement.',
        price: '4499.99',
        categoryId: 2,
        stock: 10,
        featured: 0,
        imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&h=500&fit=crop'
      },
      {
        name: 'Italian Leather Handbag',
        description: 'Premium Italian leather handbag with gold hardware and silk lining.',
        price: '2299.99',
        categoryId: 4,
        stock: 20,
        featured: 1,
        imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop'
      },
      {
        name: 'Silk Scarf Collection',
        description: 'Hand-painted silk scarves featuring Art Deco patterns.',
        price: '599.99',
        categoryId: 3,
        stock: 30,
        featured: 0,
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop'
      },
      {
        name: 'Oud Perfume 100ml',
        description: 'Rare oud fragrance with notes of rose and sandalwood.',
        price: '899.99',
        categoryId: 5,
        stock: 25,
        featured: 1,
        imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop'
      },
      {
        name: 'Rose Gold Pendant',
        description: '18k rose gold pendant with natural sapphire.',
        price: '1899.99',
        categoryId: 1,
        stock: 18,
        featured: 0,
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop'
      },
      {
        name: 'Leather Briefcase',
        description: 'Handcrafted leather briefcase with brass fittings.',
        price: '1599.99',
        categoryId: 4,
        stock: 12,
        featured: 1,
        imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop'
      },
      {
        name: 'Vintage Inspired Earrings',
        description: 'Art Deco style earrings with pearls and diamonds.',
        price: '1299.99',
        categoryId: 1,
        stock: 22,
        featured: 0,
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop'
      },
      {
        name: 'Premium Eau de Toilette',
        description: 'Sophisticated floral fragrance with notes of jasmine and amber.',
        price: '649.99',
        categoryId: 5,
        stock: 28,
        featured: 0,
        imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop'
      },
      {
        name: 'Diamond Stud Earrings',
        description: '1-carat diamond studs in 14k white gold.',
        price: '2499.99',
        categoryId: 1,
        stock: 14,
        featured: 1,
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop'
      }
    ];

    for (const product of products) {
      await connection.execute(
        'INSERT INTO products (name, description, price, categoryId, stock, featured, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [product.name, product.description, product.price, product.categoryId, product.stock, product.featured, product.imageUrl]
      );
    }

    console.log('✓ Database seeded successfully with categories and products');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await connection.end();
    await pool.end();
  }
}

seedDatabase().catch(console.error);
