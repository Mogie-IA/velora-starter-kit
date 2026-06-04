export type ProductType = "one_time" | "subscription";

export interface Product {
  id: string;
  merchantId: string;
  name: string;
  description: string | null;
  priceLamports: number;
  currency: string;
  imageUrl: string | null;
  isActive: boolean;
  productType: ProductType;
  createdAt: string;
  updatedAt: string;
}
