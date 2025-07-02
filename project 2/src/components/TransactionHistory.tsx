import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Plus, 
  Minus, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  Filter
} from 'lucide-react';
import { Transaction } from '../types';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onClose: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.recipientOrSender?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Sort by date
    return filtered.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });
  }, [transactions, searchTerm, filterType, sortOrder]);

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return <Plus className="w-4 h-4" />;
      case 'withdraw':
        return <Minus className="w-4 h-4" />;
      case 'transfer-sent':
        return <ArrowUpRight className="w-4 h-4" />;
      case 'transfer-received':
        return <ArrowDownLeft className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-100 text-green-600';
      case 'withdraw':
        return 'bg-red-100 text-red-600';
      case 'transfer-sent':
        return 'bg-orange-100 text-orange-600';
      case 'transfer-received':
        return 'bg-blue-100 text-blue-600';
    }
  };

  const getAmountColor = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'transfer-received':
        return 'text-green-600';
      case 'withdraw':
      case 'transfer-sent':
        return 'text-red-600';
    }
  };

  const getAmountPrefix = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'transfer-received':
        return '+';
      case 'withdraw':
      case 'transfer-sent':
        return '-';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">Transaction History</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-12 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdraw">Withdrawals</option>
                <option value="transfer-sent">Transfers Sent</option>
                <option value="transfer-received">Transfers Received</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                className="pl-12 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="overflow-y-auto max-h-[60vh]">
          {filteredAndSortedTransactions.length > 0 ? (
            <div className="divide-y">
              {filteredAndSortedTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className={`p-3 rounded-full mr-4 ${getTransactionColor(transaction.type)}`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {transaction.description}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span>
                            {transaction.date.toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span>
                            {transaction.date.toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {transaction.recipientOrSender && (
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {transaction.type.includes('sent') ? 'To: ' : 'From: '}
                              {transaction.recipientOrSender}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${getAmountColor(transaction.type)}`}>
                        {getAmountPrefix(transaction.type)}₹{transaction.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your filters or search terms'
                  : 'Your transaction history will appear here'
                }
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredAndSortedTransactions.length > 0 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>
                Showing {filteredAndSortedTransactions.length} of {transactions.length} transactions
              </span>
              <span>
                Total Amount: ₹
                {filteredAndSortedTransactions
                  .reduce((sum, t) => {
                    if (t.type === 'deposit' || t.type === 'transfer-received') {
                      return sum + t.amount;
                    } else {
                      return sum - t.amount;
                    }
                  }, 0)
                  .toLocaleString()
                }
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};