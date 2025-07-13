"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Cart, CartItem, apiClient } from "@/lib/api";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getCartItemsCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [user]);

  const refreshCart = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const cartData = await apiClient.getCart();
      setCart(cartData);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number) => {
    try {
      await apiClient.addToCart({ productId, quantity });
      await refreshCart();
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw error;
    }
  };

  const updateCartItem = async (itemId: number, quantity: number) => {
    try {
      await apiClient.updateCartItem(itemId, { quantity });
      await refreshCart();
    } catch (error) {
      console.error("Failed to update cart item:", error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      await apiClient.removeFromCart(itemId);
      await refreshCart();
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await apiClient.clearCart();
      await refreshCart();
    } catch (error) {
      console.error("Failed to clear cart:", error);
      throw error;
    }
  };

  const getCartItemsCount = () => {
    if (!cart) return 0;
    console.log({ cart });
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refreshCart,
        getCartItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
