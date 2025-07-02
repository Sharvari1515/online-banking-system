import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  ArrowUpRight, 
  AlertCircle, 
  CheckCircle,
  User
} from 'lucide-react';
import { BankingService } from '../services/bankingService';

interface TransactionModalProps {
  type: 'deposit' | 'withdraw' | 'transfer';
  username: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  type,
  username,
  onClose,
  onSuccess
}) => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const getTitle = () => {
    switch (type) {
      case 'deposit': return 'Deposit Money';
      case 'withdraw': return 'Withdraw Money';
      case 'transfer': return 'Transfer Money';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'deposit': return <Plus className="w-6 h-6" />;
      case 'withdraw': return <Minus className="w-6 h-6" />;
      case 'transfer': return <ArrowUpRight className="w-6 h-6" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'deposit': return 'text-green-600 bg-green-100';
      case 'withdraw': return 'text-red-600 bg-red-100';
      case 'transfer': return 'text-blue-600 bg-blue-100';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const amountNum = parseFloat(amount);
    
    if (!amountNum || amountNum <= 0) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }

    if (type === 'transfer' && !recipient.trim()) {
      setError('Please enter recipient username');
      setLoading(false);
      return;
    }

    if (type === 'transfer' && recipient.trim() === username) {
      setError('Cannot transfer to your own account');
      setLoading(false);
      return;
    }

    let result = false;

    try {
      switch (type) {
        case 'deposit':
          result = BankingService.deposit(username, amountNum);
          break;
        case 'withdraw':
          result = BankingService.withdraw(username, amountNum);
          if (!result) {
            setError('Insufficient balance or invalid amount');
          }
          break;
        case 'transfer':
          if (!BankingService.accountExists(recipient.trim())) {
            setError('Recipient account not found');
            setLoading(false);
            return;
          }
          result = BankingService.transfer(username, recipient.trim(), amountNum);
          if (!result) {
            setError('Transfer failed. Insufficient balance or invalid amount');
          }
          break;
      }

      if (result) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      setError('Transaction failed. Please try again.');
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Transaction Successful!</h3>
          <p className="text-gray-600">
            Your {type} of ₹{parseFloat(amount).toLocaleString()} has been processed successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-full mr-3 ${getColor()}`}>
              {getIcon()}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{getTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {type === 'transfer' && (
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="recipient"
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter recipient username"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter amount"
              required
            />
          </div>

          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                type === 'deposit' ? 'bg-green-600 hover:bg-green-700' :
                type === 'withdraw' ? 'bg-red-600 hover:bg-red-700' :
                'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Processing...' : `${getTitle()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};