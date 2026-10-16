"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* Hydrating state from localStorage inside an effect is the standard
   SSR-safe pattern (server has no access to localStorage), so the
   set-state-in-effect rule is disabled for this file. */
/* eslint-disable react-hooks/set-state-in-effect */

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "gamestore:cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return {
      items,
      count,
      subtotal,
      addItem(item, quantity = 1) {
        setItems((prev) => {
          const existing = prev.find((line) => line.id === item.id);
          if (existing) {
            return prev.map((line) =>
              line.id === item.id
                ? {
                    ...line,
                    quantity: Math.min(
                      line.quantity + quantity,
                      item.stock || line.stock,
                    ),
                  }
                : line,
            );
          }
          return [...prev, { ...item, quantity }];
        });
      },
      removeItem(id) {
        setItems((prev) => prev.filter((line) => line.id !== id));
      },
      updateQuantity(id, quantity) {
        setItems((prev) =>
          prev.map((line) =>
            line.id === id
              ? {
                  ...line,
                  quantity: Math.max(1, Math.min(quantity, line.stock)),
                }
              : line,
          ),
        );
      },
      clearCart() {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
