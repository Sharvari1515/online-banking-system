import { Account, Transaction } from '../types';

export class BankingService {
  private static readonly ACCOUNTS_KEY = 'banking_accounts';
  
  static getAccounts(): Record<string, Account> {
    try {
      const accounts = localStorage.getItem(this.ACCOUNTS_KEY);
      if (!accounts) return {};
      
      const parsed = JSON.parse(accounts);
      // Convert date strings back to Date objects
      Object.values(parsed).forEach((account: any) => {
        account.transactions = account.transactions.map((t: any) => ({
          ...t,
          date: new Date(t.date)
        }));
      });
      
      return parsed;
    } catch {
      return {};
    }
  }

  static saveAccounts(accounts: Record<string, Account>) {
    localStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  static createAccount(username: string, password: string): boolean {
    const accounts = this.getAccounts();
    
    if (accounts[username]) {
      return false; // Account already exists
    }

    const newAccount: Account = {
      username,
      password,
      balance: 10000, // Starting balance as per Java code
      transactions: [{
        id: this.generateTransactionId(),
        type: 'deposit',
        amount: 10000,
        date: new Date(),
        description: 'Initial deposit - Welcome bonus'
      }]
    };

    accounts[username] = newAccount;
    this.saveAccounts(accounts);
    return true;
  }

  static authenticate(username: string, password: string): Account | null {
    const accounts = this.getAccounts();
    const account = accounts[username];
    
    if (account && account.password === password) {
      return account;
    }
    
    return null;
  }

  static deposit(username: string, amount: number): boolean {
    if (amount <= 0) return false;
    
    const accounts = this.getAccounts();
    const account = accounts[username];
    
    if (!account) return false;

    account.balance += amount;
    account.transactions.push({
      id: this.generateTransactionId(),
      type: 'deposit',
      amount,
      date: new Date(),
      description: `Deposit of ₹${amount.toLocaleString()}`
    });

    this.saveAccounts(accounts);
    return true;
  }

  static withdraw(username: string, amount: number): boolean {
    if (amount <= 0) return false;
    
    const accounts = this.getAccounts();
    const account = accounts[username];
    
    if (!account || account.balance < amount) return false;

    account.balance -= amount;
    account.transactions.push({
      id: this.generateTransactionId(),
      type: 'withdraw',
      amount,
      date: new Date(),
      description: `Withdrawal of ₹${amount.toLocaleString()}`
    });

    this.saveAccounts(accounts);
    return true;
  }

  static transfer(fromUsername: string, toUsername: string, amount: number): boolean {
    if (amount <= 0) return false;
    
    const accounts = this.getAccounts();
    const fromAccount = accounts[fromUsername];
    const toAccount = accounts[toUsername];
    
    if (!fromAccount || !toAccount || fromAccount.balance < amount) return false;

    fromAccount.balance -= amount;
    toAccount.balance += amount;

    fromAccount.transactions.push({
      id: this.generateTransactionId(),
      type: 'transfer-sent',
      amount,
      date: new Date(),
      description: `Transfer to ${toUsername}`,
      recipientOrSender: toUsername
    });

    toAccount.transactions.push({
      id: this.generateTransactionId(),
      type: 'transfer-received',
      amount,
      date: new Date(),
      description: `Transfer from ${fromUsername}`,
      recipientOrSender: fromUsername
    });

    this.saveAccounts(accounts);
    return true;
  }

  static getAccount(username: string): Account | null {
    const accounts = this.getAccounts();
    return accounts[username] || null;
  }

  static accountExists(username: string): boolean {
    const accounts = this.getAccounts();
    return !!accounts[username];
  }

  private static generateTransactionId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 5);
  }
}