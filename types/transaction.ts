export type Transaction = {
  transactionId: string;
  totalAmount: number;
  paymentMethod: string;
  referenceNumber: string | null;
  isDeleted: number;
  createdAt: string;
  updatedAt: string;
};
