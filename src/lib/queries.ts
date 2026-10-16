import { connectToDatabase } from "@/lib/mongodb";
import { Category, Order, Product, SupportMessage, User } from "@/models";
import { PRODUCTS_PER_PAGE, LOW_STOCK_THRESHOLD } from "@/constants";
import type { ICategory } from "@/models";
import type { Types } from "mongoose";

/* -------------------------------------------------------------------------- */
/*  Shared DTOs (plain, serialisable objects safe to pass to Client Components) */
/* -------------------------------------------------------------------------- */

export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  imagePublicId: string;
};

export type ProductDTO = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  brand: string;
  featured: boolean;
  images: { url: string; publicId: string }[];
  category: CategoryDTO | null;
  createdAt: string;
};

function toCategoryDTO(category: ICategory & { _id: Types.ObjectId }): CategoryDTO {
  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    image: category.image ?? "",
    imagePublicId: category.imagePublicId ?? "",
  };
}

/* -------------------------------------------------------------------------- */
/*  Products                                                                   */
/* -------------------------------------------------------------------------- */

export type ProductFilters = {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
};

export async function getProducts(filters: ProductFilters = {}) {
  await connectToDatabase();

  const { search, category, sort = "newest", page = 1 } = filters;
  const query: Record<string, unknown> = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (category) {
    const categoryDoc = await Category.findOne({ slug: category });
    query.category = categoryDoc?._id ?? null;
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    "name-asc": { name: 1 },
  };

  const limit = PRODUCTS_PER_PAGE;
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Product.find(query)
      .populate("category")
      .sort(sortMap[sort] ?? sortMap.newest)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  const products: ProductDTO[] = docs.map((doc) => ({
    ...serializeProduct(doc),
  }));

  return {
    products,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getAllProducts(): Promise<ProductDTO[]> {
  await connectToDatabase();
  const docs = await Product.find()
    .populate("category")
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(serializeProduct);
}

export async function getFeaturedProducts(limit = 8): Promise<ProductDTO[]> {
  await connectToDatabase();
  const docs = await Product.find({ featured: true })
    .populate("category")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return docs.map(serializeProduct);
}

export async function getLatestProducts(limit = 8): Promise<ProductDTO[]> {
  await connectToDatabase();
  const docs = await Product.find()
    .populate("category")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return docs.map(serializeProduct);
}

export async function getLowStockProducts(
  threshold = LOW_STOCK_THRESHOLD,
): Promise<ProductDTO[]> {
  await connectToDatabase();
  const docs = await Product.find({ stock: { $lte: threshold } })
    .populate("category")
    .sort({ stock: 1, name: 1 })
    .lean();
  return docs.map(serializeProduct);
}

export async function getProduct(idOrSlug: string): Promise<ProductDTO | null> {
  await connectToDatabase();

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  const doc = await Product.findOne(
    isObjectId ? { _id: idOrSlug } : { slug: idOrSlug },
  )
    .populate("category")
    .lean();

  return doc ? serializeProduct(doc) : null;
}

/* -------------------------------------------------------------------------- */
/*  Categories                                                                 */
/* -------------------------------------------------------------------------- */

export async function getCategories(): Promise<CategoryDTO[]> {
  await connectToDatabase();
  const docs = await Category.find().sort({ name: 1 }).lean();
  return docs.map((doc) => toCategoryDTO(doc));
}

export async function getCategoryBySlug(slug: string): Promise<CategoryDTO | null> {
  await connectToDatabase();
  const doc = await Category.findOne({ slug }).lean();
  return doc ? toCategoryDTO(doc) : null;
}

export async function getCategoryById(id: string): Promise<CategoryDTO | null> {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return null;
  await connectToDatabase();
  const doc = await Category.findById(id).lean();
  return doc ? toCategoryDTO(doc) : null;
}

/* -------------------------------------------------------------------------- */
/*  Orders                                                                     */
/* -------------------------------------------------------------------------- */

export type OrderDTO = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  paymentMethod: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  items: {
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  shipping: Record<string, string>;
  delivery: { courier: string; trackingNumber: string; trackingUrl?: string };
  customer?: { name: string; email: string } | null;
};

export async function getUserOrders(userId: string): Promise<OrderDTO[]> {
  await connectToDatabase();
  const docs = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();
  return docs.map((doc) => serializeOrder(doc));
}

export async function getOrderById(id: string): Promise<OrderDTO | null> {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return null;
  await connectToDatabase();
  const doc = await Order.findById(id)
    .populate("user", "name email")
    .lean();
  return doc ? serializeOrder(doc) : null;
}

export async function getAllOrders(status?: string): Promise<OrderDTO[]> {
  await connectToDatabase();
  const query = status ? { status } : {};
  const docs = await Order.find(query)
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();
  return docs.map((doc) => serializeOrder(doc));
}

export type TrackedOrderDTO = {
  orderNumber: string;
  status: string;
  courier: string;
  trackingNumber: string;
  trackingUrl?: string;
  updatedAt: string;
};

export async function getOrderByTrackingNumber(
  trackingNumber: string,
): Promise<TrackedOrderDTO | null> {
  const value = trackingNumber.trim();
  if (!value) return null;

  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  await connectToDatabase();
  const doc = await Order.findOne({
    "delivery.trackingNumber": { $regex: `^${escaped}$`, $options: "i" },
  }).lean();

  if (!doc) return null;

  return {
    orderNumber: doc.orderNumber,
    status: doc.status,
    courier: doc.delivery?.courier ?? "",
    trackingNumber: doc.delivery?.trackingNumber ?? "",
    trackingUrl: doc.delivery?.trackingUrl ?? "",
    updatedAt: new Date(doc.updatedAt ?? doc.createdAt).toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/*  Dashboard stats & users                                                    */
/* -------------------------------------------------------------------------- */

export async function getDashboardStats() {
  await connectToDatabase();

  const [productCount, categoryCount, orderCount, userCount, revenueAgg, recentOrders] =
    await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(5).lean(),
    ]);

  return {
    productCount,
    categoryCount,
    orderCount,
    userCount,
    revenue: revenueAgg[0]?.total ?? 0,
    recentOrders: recentOrders.map((doc) => serializeOrder(doc)),
  };
}

export async function getUsers() {
  await connectToDatabase();
  const docs = await User.find().sort({ createdAt: -1 }).lean();
  return docs.map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    role: doc.role,
    status: doc.status ?? "active",
    createdAt: doc.createdAt.toISOString(),
  }));
}

export async function getUserById(id: string) {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return null;
  await connectToDatabase();
  const doc = await User.findById(id).lean();
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    role: doc.role,
    status: doc.status ?? "active",
    createdAt: doc.createdAt.toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/*  Support messages                                                           */
/* -------------------------------------------------------------------------- */

export type SupportMessageDTO = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

export async function getSupportMessages(): Promise<SupportMessageDTO[]> {
  await connectToDatabase();
  const docs = await SupportMessage.find().sort({ createdAt: -1 }).lean();
  return docs.map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    subject: doc.subject,
    message: doc.message,
    status: doc.status ?? "open",
    createdAt: new Date(doc.createdAt).toISOString(),
  }));
}

/* -------------------------------------------------------------------------- */
/*  Serialisers                                                                */
/* -------------------------------------------------------------------------- */

type LeanProduct = {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  brand?: string;
  featured: boolean;
  images: { url: string; publicId: string }[];
  category: (ICategory & { _id: Types.ObjectId }) | null;
  createdAt: Date;
};

export function serializeProduct(doc: LeanProduct): ProductDTO {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    price: doc.price,
    compareAtPrice: doc.compareAtPrice,
    stock: doc.stock,
    brand: doc.brand ?? "",
    featured: doc.featured,
    images: (doc.images ?? []).map((img) => ({
      url: img.url,
      publicId: img.publicId ?? "",
    })),
    category: doc.category ? toCategoryDTO(doc.category) : null,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

type LeanOrder = {
  _id: Types.ObjectId;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  paymentMethod: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
  items: {
    product: Types.ObjectId;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  shipping: Record<string, string>;
  delivery?: { courier?: string; trackingNumber?: string; trackingUrl?: string } | null;
  user: { name: string; email: string } | Types.ObjectId | null;
};

function serializeOrder(doc: LeanOrder): OrderDTO {
  const customer =
    doc.user && typeof doc.user === "object" && "name" in doc.user
      ? { name: doc.user.name, email: doc.user.email }
      : null;

  return {
    id: doc._id.toString(),
    orderNumber: doc.orderNumber,
    status: doc.status,
    total: doc.total,
    subtotal: doc.subtotal,
    shippingFee: doc.shippingFee,
    paymentMethod: doc.paymentMethod,
    note: doc.note ?? "",
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt ?? doc.createdAt).toISOString(),
    items: doc.items.map((item) => ({
      productId: item.product?.toString() ?? "",
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
    })),
    shipping: doc.shipping,
    delivery: {
      courier: doc.delivery?.courier ?? "",
      trackingNumber: doc.delivery?.trackingNumber ?? "",
      trackingUrl: doc.delivery?.trackingUrl ?? "",
    },
    customer,
  };
}
