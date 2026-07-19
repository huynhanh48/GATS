"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cartApi } from "@/lib/cart/api";
import { toast } from "sonner";
import { useAuthModal } from "@/hooks/useAuth";

export type CartItem = {
  cartItemId: string;
  courseId: string;
  courseName: string;
  price: number;
  thumbnail: string | null;
};

export type CartContextType = {
  items: CartItem[];
  totalAmount: number;
  isLoading: boolean;
  addToCart: (courseId: string) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = async () => {
    if (status !== "authenticated") {
      setItems([]);
      return;
    }
    setIsLoading(true);
    try {
      const res: any = await cartApi.getCart();
      if (res.cart && res.cart.items) {
        const mappedItems: CartItem[] = res.cart.items.map((bItem: any) => ({
          cartItemId: bItem.id,
          courseId: bItem.courseId,
          courseName: bItem.course.title,
          price: bItem.finalPrice,
          thumbnail: bItem.course.thumbnail,
        }));
        setItems(mappedItems);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Failed to fetch cart", err);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [status]);

  const addToCart = async (courseId: string) => {
    if (status !== "authenticated") {
      openAuthModal("login");
      return;
    }
    try {
      await cartApi.addItem(courseId);
      await fetchCart();
      toast.success("Đã thêm vào giỏ hàng");
    } catch (err: any) {
      if (err?.message?.includes("already in cart")) {
        toast.info("Khóa học đã có trong giỏ hàng");
      } else if (err?.message?.includes("already enrolled")) {
        toast.info("Bạn đã đăng ký khóa học này rồi");
      } else {
        toast.error("Không thể thêm vào giỏ hàng");
      }
      throw err;
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      await cartApi.removeItem(cartItemId);
      await fetchCart();
      toast.success("Đã xóa khỏi giỏ hàng");
    } catch (err) {
      toast.error("Lỗi khi xóa khỏi giỏ hàng");
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clearCart();
      setItems([]);
    } catch (err) {
      toast.error("Lỗi khi xóa giỏ hàng");
    }
  };

  const totalAmount = items.reduce((acc, item) => acc + item.price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalAmount,
        isLoading,
        addToCart,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
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
