export type Product = {
  productId: string;
  name: string;
  description: string | null;
  quantity: number;
  price: number;
  isDeleted: number;
  createdAt: Date;
  updatedAt: Date;
};
