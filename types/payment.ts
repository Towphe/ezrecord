export type UntreatedPayment = {
  name: string | null;
  accountNumber: string;
  amount: string;
  referenceNumber: string;
  date: string | null;
};

export type Payment = {
  name: string | null;
  accountNumber: string | null;
  amount: number;
  referenceNumber: string;
};
