export interface Account {
  username: string;
  password: string;
  balance: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'transfer-sent' | 'transfer-received';
  amount: number;
  date: Date;
  description: string;
  recipientOrSender?: string;
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}