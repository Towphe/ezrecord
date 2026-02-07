export type Transaction = {
  transactionId: string;
  totalAmount: number;
  paymentMethod: string;
  referenceNumber: string | null;
  receiptImageUri: string | null;
  isDeleted: number;
  createdAt: Date;
  updatedAt: Date;
};

export type UntreatedTransactionProduct = {
  transactionProductId: string;
  transactionId: string;
  productId: string;
  name: string;
  amount: number;
  unitPrice: number;
  quantity: number;
  isDeleted: number;
  createdAt: string;
  updatedAt: string;
};

export type TransactionProduct = {
  transactionProductId: string;
  transactionId: string;
  productId: string;
  name: string;
  unitPrice: number;
  amount: number;
  quantity: number;
  isDeleted: number;
  createdAt: Date;
  updatedAt: Date;
};
