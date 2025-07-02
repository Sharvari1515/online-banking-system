import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Minus, 
  ArrowUpRight, 
  Clock, 
  Eye,
  LogOut,
  Wallet
} from 'lucide-react';
import { Account } from '../types';
import { BankingService } from '../services/bankingService';
import { TransactionModal } from './TransactionModal';
import { TransactionHistory } from './TransactionHistory';

interface DashboardProps {
  user: { username: string };
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw' | 'transfer'>('deposit');
  const [showHistory, setShowHistory] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    loadAccount();
  }, [user.username]);

  const loadAccount = () => {
    const acc = BankingService.getAccount(user.username);
    setAccount(acc);
  };

  const handleTransaction = () => {
    loadAccount();
    setShowTransactionModal(false);
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  const recentTransactions = account.transactions
    .slice(-3)
    .reverse();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">SecureBank</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user.username}</span>
              <button
                onClick={onLogout}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl text-white p-8 mb-8 shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-blue-100 text-sm font-medium">Current Balance</p>
              <div className="flex items-center mt-2">
                {showBalance ? (
                  <h2 className="text-4xl font-bold">₹{account.balance.toLocaleString()}</h2>
                ) : (
                  <h2 className="text-4xl font-bold">₹••••••</h2>
                )}
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="ml-3 p-1 hover:bg-blue-500 rounded-full transition-colors"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Account</p>
              <p className="text-lg font-medium">{user.username}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => {
                setTransactionType('deposit');
                setShowTransactionModal(true);
              }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-all duration-200 text-center"
            >
              <Plus className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Deposit</span>
            </button>
            <button
              onClick={() => {
                setTransactionType('withdraw');
                setShowTransactionModal(true);
              }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-all duration-200 text-center"
            >
              <Minus className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Withdraw</span>
            </button>
            <button
              onClick={() => {
                setTransactionType('transfer');
                setShowTransactionModal(true);
              }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-all duration-200 text-center"
            >
              <ArrowUpRight className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Transfer</span>
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Transactions</h3>
            <button
              onClick={() => setShowHistory(true)}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              View All
            </button>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-4 ${
                      transaction.type === 'deposit' ? 'bg-green-100 text-green-600' :
                      transaction.type === 'withdraw' ? 'bg-red-100 text-red-600' :
                      transaction.type === 'transfer-sent' ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {transaction.type === 'deposit' ? <Plus className="w-4 h-4" /> :
                       transaction.type === 'withdraw' ? <Minus className="w-4 h-4" /> :
                       <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.date.toLocaleDateString()} at {transaction.date.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className={`text-right ${
                    transaction.type === 'deposit' || transaction.type === 'transfer-received' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    <p className="font-semibold">
                      {transaction.type === 'deposit' || transaction.type === 'transfer-received' ? '+' : '-'}
                      ₹{transaction.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400">Your transaction history will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <TransactionModal
          type={transactionType}
          username={user.username}
          onClose={() => setShowTransactionModal(false)}
          onSuccess={handleTransaction}
        />
      )}

      {/* Transaction History Modal */}
      {showHistory && (
        <TransactionHistory
          transactions={account.transactions}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};