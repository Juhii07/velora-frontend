import { create } from 'zustand';

export interface ICartItem {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number;
    images: string[];
    stock: number;
  };
  quantity: number;
}

interface CartStore {
  items: ICartItem[];
  wishlistIds: string[];
  setItems: (items: ICartItem[]) => void;
  setWishlistIds: (ids: string[]) => void;
  addItem: (item: ICartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  toggleWishlistId: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  wishlistIds: [],
  setItems: (items) => set({ items }),
  setWishlistIds: (wishlistIds) => set({ wishlistIds }),
  addItem: (newItem) => set((state) => {
    const existingIndex = state.items.findIndex(item => item.product._id === newItem.product._id);
    if (existingIndex > -1) {
      const updated = [...state.items];
      updated[existingIndex].quantity += newItem.quantity;
      return { items: updated };
    }
    return { items: [...state.items, newItem] };
  }),
  removeItem: (productId) => set((state) => ({
    items: state.items.filter(item => item.product._id !== productId)
  })),
  updateQuantity: (productId, qty) => set((state) => ({
    items: state.items.map(item => item.product._id === productId ? { ...item, quantity: qty } : item)
  })),
  toggleWishlistId: (productId) => set((state) => {
    const exists = state.wishlistIds.includes(productId);
    const updated = exists 
      ? state.wishlistIds.filter(id => id !== productId)
      : [...state.wishlistIds, productId];
    return { wishlistIds: updated };
  }),
  clearCart: () => set({ items: [] })
}));
