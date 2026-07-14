import { create } from 'zustand';

export interface IWebsiteSettings {
  websiteName: string;
  logoUrl?: string;
  email: string;
  phone: string;
  address: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    pinterest?: string;
  };
  brandStory: {
    storyText: string;
    missionText: string;
    visionText: string;
  };
  features: {
    wishlist: boolean;
    reviews: boolean;
    offers: boolean;
    featuredProducts: boolean;
    bestSellers: boolean;
    newArrivals: boolean;
  };
  enableDeliveryCharge: boolean;
  deliveryChargeAmount: number;
  minOrderForFreeDelivery: number;
  estimatedShippingTime: string;
  enableReturnPolicy: boolean;
  returnPolicyNotice: string;
  returnPolicyDesc1: string;
  returnPolicyDesc2: string;
  returnPolicyDesc3: string;
  returnPolicyDesc4: string;
}

interface SettingsStore {
  settings: IWebsiteSettings | null;
  setSettings: (settings: IWebsiteSettings) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  setSettings: (settings) => set({ settings }),
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),
}));
