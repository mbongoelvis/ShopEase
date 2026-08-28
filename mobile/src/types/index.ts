export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  CashierHome: { scannedItem?: CartItem } | undefined;
  SecurityScan: undefined;
  GuardHome: undefined;
  StockerHome: undefined;
  StockerDashboard: { scannedBarcode?: string } | undefined;
  TaxRateSettings: undefined;
  ScanItem: { scanContext?: 'cashier' | 'guard' | 'stocker' } | undefined;
  SecurityScanOutput: { status: 'valid' | 'invalid'; items: CartItem[]; transactionId?: string } | undefined;
  SecurityGuardFlow: undefined;
  CartReview: { cartItems: CartItem[]; customerName?: string; customerPhone?: string; discount?: number; discountType?: 'Percentage' | 'Fixed Amount' | 'Promo Code' } | undefined;
  Payment: { cartItems: CartItem[]; customerName?: string; customerPhone?: string; discount?: number; discountType?: 'Percentage' | 'Fixed Amount' | 'Promo Code'; totalAmount: number } | undefined;
  ReceiptConfirmation: { transactionId: string } | undefined;
  TransactionHistory: undefined;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku?: string;
};

export type ReceiptStatus = 'Pending Exit' | 'Collected' | 'Discrepancy — Held';

export type Transaction = {
  id: string;
  dateTime: string;
  paymentMethod: 'Cash' | 'Credit/Debit Card' | 'Mobile Payment' | 'Split Payment';
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  change: number;
  status: ReceiptStatus;
  customerName?: string;
  customerPhone?: string;
};