import React, { createContext, useState, useContext, useEffect } from 'react';
import { Transaction, ReceiptStatus, CartItem } from '../types';
import { useAuth } from './AuthContext';
import { apiRequest } from '../services/api';

interface TransactionContextType {
  transactions: Transaction[];
  refreshTransactions: () => Promise<void>;
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
  refreshTransactions: async () => {},
  addTransaction: () => {},
  updateTransactionStatus: () => {},
  getTransaction: () => undefined,
  getStats: () => ({ totalSales: 0, count: 0, avgValue: 0 }),
  pendingScannedItem: null,
  pushScannedItem: () => {},
  clearPendingScannedItem: () => {},
});

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { role } = useAuth();

  const refreshTransactions = async () => {
    if (role !== 'cashier') {
      setTransactions([]);
      return;
    }

    try {
      const response = await apiRequest<{ transactions: any[] }>('/checkout/history?period=month');
      setTransactions((response.transactions || []).map((transaction) => ({
        id: String(transaction.sale_id),
        qrCode: transaction.qr_code || undefined,
        dateTime: transaction.timestamp,
        paymentMethod: transaction.payment_method || 'Cash',
        items: (transaction.items || []).map((item: any) => ({
          id: String(item.product_id),
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.qty),
          sku: item.barcode,
        })),
        subtotal: Number(transaction.total) - Number(transaction.tax || 0),
        tax: Number(transaction.tax || 0),
        discount: Number(transaction.discount || 0),
        total: Number(transaction.total),
        change: 0,
        status: transaction.receipt_status === 'COLLECTED' ? 'Collected' : 'Pending Exit',
        customerName: transaction.customer_name || undefined,
        customerPhone: transaction.customer_phone || undefined,
      })));
    } catch {
      setTransactions([]);
    }
  };

  useEffect(() => {
    refreshTransactions();
  }, [role]);

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
    const today = new Date().toDateString();
    const todayTxs = transactions.filter((t) => new Date(t.dateTime).toDateString() === today);
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
        refreshTransactions,
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
