/**
 * Seed script — populates the local MongoDB with demo data.
 *
 * Usage:  npm run seed
 * Reads MONGODB_URI from the environment or from .env.local.
 */
import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

function loadEnv() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  try {
    const content = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of content.split("\n")) {
      const match = line.match(/^\s*MONGODB_URI\s*=\s*(.+)\s*$/);
      if (match) return match[1].replace(/^["']|["']$/g, "");
    }
  } catch {
    // ignore
  }
  return "mongodb://localhost:27017/gamestore";
}

const categories = [
  { name: "Controllers", description: "Gamepads and pro controllers." },
  { name: "Headsets", description: "Immersive gaming audio." },
  { name: "Keyboards", description: "Mechanical and membrane keyboards." },
  { name: "Mice", description: "Precision gaming mice." },
  { name: "Chairs", description: "Comfortable gaming chairs." },
];

const products = [
  {
    name: "Pro Wireless Controller",
    category: "Controllers",
    price: 89.99,
    compareAtPrice: 109.99,
    stock: 25,
    brand: "Hyperion",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&q=80",
    description:
      "Ultra-responsive wireless controller with adjustable triggers and a 40-hour battery life.",
  },
  {
    name: "Specter 7.1 Headset",
    category: "Headsets",
    price: 129.99,
    stock: 18,
    brand: "AuralX",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1599669454699-248893623440?w=800&q=80",
    description:
      "Surround-sound gaming headset with a noise-cancelling microphone and plush memory-foam ear cups.",
  },
  {
    name: "Tactile RGB Mechanical Keyboard",
    category: "Keyboards",
    price: 109.99,
    compareAtPrice: 139.99,
    stock: 30,
    brand: "KeyForge",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
    description:
      "Hot-swappable mechanical keyboard with per-key RGB and tactile switches for fast, accurate typing.",
  },
  {
    name: "Viper Lightweight Mouse",
    category: "Mice",
    price: 59.99,
    stock: 42,
    brand: "SwiftPoint",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80",
    description:
      "58g ultralight gaming mouse with a 26K DPI optical sensor and PTFE glide feet.",
  },
  {
    name: "Throne Ergonomic Gaming Chair",
    category: "Chairs",
    price: 249.99,
    stock: 10,
    brand: "ComfortCraft",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&q=80",
    description:
      "Ergonomic gaming chair with lumbar support, 4D armrests and a reclining backrest.",
  },
  {
    name: "Pulse Wired Controller",
    category: "Controllers",
    price: 44.99,
    stock: 55,
    brand: "Hyperion",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&q=80",
    description:
      "Reliable wired controller with textured grips and clicky face buttons.",
  },
];

async function main() {
  const uri = loadEnv();
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  console.log(`Connected to ${uri}`);

  const passwordHash = await bcrypt.hash("admin123", 10);
  await db.collection("users").updateOne(
    { email: "admin@gamestore.dev" },
    {
      $set: {
        name: "Store Admin",
        email: "admin@gamestore.dev",
        password: passwordHash,
        role: "admin",
        image: "",
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true },
  );
  console.log("✓ Admin user (admin@gamestore.dev / admin123)");

  const categoryIds = {};
  for (const category of categories) {
    const slug = category.name.toLowerCase().replace(/\s+/g, "-");
    await db.collection("categories").updateOne(
      { slug },
      {
        $set: { ...category, slug, image: "", updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
    const doc = await db.collection("categories").findOne({ slug });
    categoryIds[category.name] = doc._id;
  }
  console.log(`✓ ${categories.length} categories`);

  for (const product of products) {
    const slug = product.name.toLowerCase().replace(/\s+/g, "-");
    const { category, image, ...rest } = product;
    await db.collection("products").updateOne(
      { slug },
      {
        $set: {
          ...rest,
          slug,
          category: categoryIds[category],
          images: [{ url: image, publicId: "" }],
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
  }
  console.log(`✓ ${products.length} products`);

  await client.close();
  console.log("Seeding complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
