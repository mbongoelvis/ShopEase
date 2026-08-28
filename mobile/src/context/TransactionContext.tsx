import React, { createContext, useState, useContext } from 'react';
import { Transaction, ReceiptStatus, CartItem } from '../types';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  updateTransactionStatus: (id: string, status: ReceiptStatus) => void;
  getTransaction: (id: string) => Transaction | undefined;
  getStats: () => { totalSales: number; count: number; avgValue: number };
  // Shared scanner queue — ScanItemScreen pushes here, CashierHome reads and clears
  pendingScannedItem: CartItem | null;
  pushScannedItem: (item: CartItem) => void;
  clearPendingScannedItem: () => void;
}

const TransactionContext = createContext<TransactionContextType>({
  transactions: [],
  addTransaction: () => {},
  updateTransactionStatus: () => {},
  getTransaction: () => undefined,
  getStats: () => ({ totalSales: 0, count: 0, avgValue: 0 }),
  pendingScannedItem: null,
  pushScannedItem: () => {},
  clearPendingScannedItem: () => {},
});

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with some realistic mock transactions for a live-looking dashboard
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'TX-1024',
      dateTime: 'Aug 20, 2026 - 11:32 AM',
      paymentMethod: 'Cash',
      items: [
        { id: '1', name: 'Classic T-Shirt - Red/M', price: 14.99, quantity: 2 },
        { id: '2', name: 'Baseball Cap - Black', price: 15.00, quantity: 1 }
      ],
      subtotal: 44.98,
      tax: 4.50,
      discount: 5.00,
      total: 44.48,
      change: 5.52,
      status: 'Pending Exit',
      customerName: 'John Smith',
      customerPhone: '+1234567890'
    },
    {
      id: 'TX-1023',
      dateTime: 'Aug 20, 2026 - 10:15 AM',
      paymentMethod: 'Credit/Debit Card',
      items: [
        { id: '3', name: 'Ankara Wrap Dress (M)', price: 42.00, quantity: 1 }
      ],
      subtotal: 42.00,
      tax: 4.20,
      discount: 0,
      total: 46.20,
      change: 0,
      status: 'Collected',
      customerName: 'Aline N.',
      customerPhone: '+237670000000'
    },
    {
      id: 'TX-1022',
      dateTime: 'Aug 19, 2026 - 4:45 PM',
      paymentMethod: 'Mobile Payment',
      items: [
        { id: '4', name: 'Designer Tote Bag', price: 35.00, quantity: 2 }
      ],
      subtotal: 70.00,
      tax: 7.00,
      discount: 10.00,
      total: 67.00,
      change: 0,
      status: 'Discrepancy — Held',
      customerName: 'Walk-in Customer'
    }
  ]);

  // Scanner item queue shared between ScanItemScreen and CashierHomeScreen
  const [pendingScannedItem, setPendingScannedItem] = useState<CartItem | null>(null);

  const addTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
  };

  const updateTransactionStatus = (id: string, status: ReceiptStatus) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  const getTransaction = (id: string) => {
    return transactions.find((t) => t.id === id);
  };

  const getStats = () => {
    // Only calculate stats for today (Aug 20, 2026)
    const todayTxs = transactions.filter((t) => t.dateTime.includes('Aug 20, 2026'));
    const totalSales = todayTxs.reduce((sum, t) => sum + t.total, 0);
    const count = todayTxs.length;
    const avgValue = count > 0 ? totalSales / count : 0;
    return { totalSales, count, avgValue };
  };

  const pushScannedItem = (item: CartItem) => {
    setPendingScannedItem(item);
  };

  const clearPendingScannedItem = () => {
    setPendingScannedItem(null);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransactionStatus,
        getTransaction,
        getStats,
        pendingScannedItem,
        pushScannedItem,
        clearPendingScannedItem,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);
