# DIGISOL Mobile Application: Checkout Flow (Cashier)
## Complete Screen-by-Screen Specification

This document provides a complete, detailed specification for the **Checkout Flow** within the DIGISOL mobile application. This flow is used by the **Cashier** to scan customer items, manage the cart, process payment, and print the receipt.

---

### 1. Overview: The Complete Checkout Flow

The checkout flow consists of **5 screens** that guide the Cashier from scanning items to successfully printing the receipt:

1. **POS Home** - Main scanning and cart management screen
2. **Cart Review** - Review cart items before payment
3. **Payment Options** - Select payment method and process transaction
4. **Receipt Confirmation** - Display receipt with QR code and reprint options
5. **Transaction History** (Optional) - View past transactions and reprint receipts

---

### 2. Design Constants (Apply to All Screens)

| Element | Specification |
| :--- | :--- |
| **Primary Color (Brand, Headers, CTAs)** | `#147644` (Dark Teal / Emerald Green) |
| **Secondary Color (Accents, Highlights)** | `#FF7A4A` (Warm Orange) |
| **Background Color** | `#F5F5F5` (Light Gray) |
| **Card Background** | `#FFFFFF` (White) |
| **Primary Text** | `#000000` (Black) |
| **Secondary Text (Labels, Subtitles)** | `#333333` (Dark Gray) |
| **Tertiary Text (Hints, Timestamps)** | `#757575` (Medium Gray) |
| **Success / Active Status** | `#2E7D32` (Green) |
| **Danger / Error** | `#D32F2F` (Red) |
| **Border Radius** | 12dp for cards, 8dp for buttons |
| **Global Margin** | 16dp left and right |
| **Typography - Headers** | Bold, Sans-Serif |
| **Typography - Body** | Regular, Sans-Serif |

---

## Screen 1: POS Home (Main Checkout)

**Page Name:** `CashierHomeScreen`
**Access:** Default landing screen after Cashier login

**Purpose:** Primary workspace for scanning items, managing the customer's cart, and initiating checkout.

**Content on the page (Top to Bottom):**

### A. Header Bar
- **Background:** Solid `#147644`
- **Left:** 
  - Text: "Store #01" (`#FFFFFF`, Bold, size 18)
  - Subtext: "Cashier: John Doe" (`#E0E0E0`, size 12)
- **Right:**
  - Bluetooth Printer Icon (`#FFFFFF`)
  - Connection Status Dot:
    - **Green** (`#2E7D32`) if online
    - **Orange** (`#FF7A4A`) if offline

### B. Scanner / Input Section
*(Card Style: `#FFFFFF`, 12dp radius, 16dp padding, subtle shadow)*

- **Primary Action Button:** Large (80dp diameter) circular FAB with `#FF7A4A` background
  - Icon: Barcode/Scan icon (`#FFFFFF`)
  - Text below: "**Tap to Scan**" (`#333333`, centered)
- **Divider:** "- OR -" (`#757575`, size 12, centered)
- **Manual Entry Row:**
  - Input Field: "Type SKU or Barcode Number" (Placeholder: `#757575`)
  - Background: `#F5F5F5`, Text: `#000000`
  - Small Button: "**ADD**" (White background, `#147644` border, `#147644` text)

### C. Customer Info Section (Optional Quick Add)
*(Card Style: `#FFFFFF`, 12dp radius, 12dp padding)*
- **Label:** "Customer (Optional)" (`#333333`, size 12)
- **Input Row:**
  - Text Input: "Customer name or phone" (Placeholder: `#757575`)
  - Button: "**ADD CUSTOMER**" (`#147644` text, small)

### D. Active Cart List (Scrollable)
- **Cart Header:**
  - Text: "Current Cart" (`#000000`, Bold, size 16)
  - Item Count Badge: "(3 items)" (`#757575`, size 14)
- **Cart Body (Scrollable vertically):**
  - **Empty State:** 
    - Icon: 🛒 (Large, `#757575`)
    - Text: "No items scanned. Start scanning!" (`#757575`, size 14)
  - **Filled State:** Each product row (White card, `#E0E0E0` border, 8dp radius, 8dp margin bottom):
    - **Row Layout:** Horizontal with three sections
    - **Left:** Product Name (e.g., "Classic T-Shirt - Red/M") (`#000000`, size 14, bold)
      - Subtext: SKU or description (`#757575`, size 11)
    - **Middle (Quantity Controls):**
      - `[-]` button (White, Gray `#757575` border, Black `-` text, 6dp radius)
      - Quantity Number (e.g., "2") (`#000000`, size 16, bold)
      - `[+]` button (`#FF7A4A` background, White `+` text, 6dp radius)
    - **Right:** Total Line Price (e.g., "$29.98") (`#147644`, Bold, size 16)
  - **Swipe to Delete:** Swipe left to remove item from cart

### E. Discount / Promo Section (Collapsible)
- **Header:** "💵 Add Discount or Promo" (`#333333`, Bold) + Expand Arrow (`#757575`)
- **Content (Expanded):**
  - **Discount Type Dropdown:** "Percentage" | "Fixed Amount" | "Promo Code"
  - **Discount Value Input:** Numeric field (Placeholder: "0")
  - **Apply Button:** "**APPLY**" (`#FF7A4A` background, White text)

### F. Bottom Fixed Footer (Totalizer & Action)
*(Background: `#FFFFFF`, Top border: `#FF7A4A`, 2dp)*

- **Top Row of Footer (Subtotal & Tax):**
  - Left Column: "Subtotal" (`#333333`) + Value "$120.00" (`#000000`)
  - Right Column: "Tax (VAT 10%)" (`#333333`) + Value "$12.00" (`#333333`)
- **Bottom Row of Footer (Grand Total):**
  - Left: "**TOTAL DUE**" (`#333333`, size 14)
  - Right: "**$132.00**" (`#147644`, size 28, Bold)
- **Primary Action Button (Full Width):**
  - Text: "**CHECKOUT**" 
  - Style: Solid `#147644` background, `#FFFFFF` text, Bold, size 18, 8dp radius
  - Disabled State: Gray background (`#A0C4B8`), White text, 50% opacity

---

### User Flow Logic for Screen 1:
1. Cashier taps **"Tap to Scan"** → Camera opens → Scan barcode → Item is instantly added to cart
2. Cashier uses `[-]` and `[+]` to adjust item quantities
3. **Swipe left** on an item → Delete confirmation appears → Remove item from cart
4. Cashier enters manual SKU → Tap "ADD" → Item is added to cart
5. Cashier optionally adds customer info or applies discount
6. Cashier taps **"CHECKOUT"** → Validates cart has items → Navigates to **Screen 2: Cart Review**

---

## Screen 2: Cart Review

**Page Name:** `CartReviewScreen`
**Entry:** Tapping "CHECKOUT" from Screen 1

**Purpose:** Review all cart items, verify quantities and prices before payment.

**Content on the page (Top to Bottom):**

### A. Header Bar
- **Background:** Solid `#147644`
- **Back Button:** `<` (White, navigates back to Screen 1)
- **Title:** "Review Order" (`#FFFFFF`, Bold, size 20)
- **Right:** "Step 1 of 2" (`#E0E0E0`, size 12)

### B. Cart Summary Section
*(Card Style: `#FFFFFF`, 12dp radius, 16dp padding)*

- **Header:** "Cart Summary" (`#000000`, Bold) + Item Count "(3 items)" (`#757575`)
- **Item List (Summary View - Read Only):**
  - Each row: Product Name (`#000000`) + Quantity (x2) (`#757575`) + Subtotal (`#147644`)
  - Example: "Classic T-Shirt - Red/M" + "x2" + "$29.98"
- **Divider:** Thin line (`#E0E0E0`)

### C. Price Breakdown
*(Card Style: `#FFFFFF`, 12dp radius, 16dp padding)*

- **Row 1:** "Subtotal" (`#333333`) + "$120.00" (`#000000`)
- **Row 2:** "Tax (VAT 10%)" (`#333333`) + "$12.00" (`#333333`)
- **Row 3:** "Discount" (`#333333`) + "-$5.00" (`#D32F2F`) *[If applied]*
- **Divider:** Thin line (`#E0E0E0`)
- **Grand Total:**
  - Left: "**TOTAL**" (`#000000`, Bold, size 18)
  - Right: "**$127.00**" (`#147644`, Bold, size 22)

### D. Customer Info (Read Only)
*(Card Style: `#FFFFFF`, 12dp radius, 12dp padding)*
- **Label:** "Customer" (`#333333`)
- **Value:** "John Smith - +1234567890" (`#000000`) *[If added]*
- **Value if not added:** "Walk-in Customer" (`#757575`)

### E. Action Buttons (Bottom Fixed)
- **Button 1 (Secondary):** "**EDIT CART**" (White background, `#147644` border, `#147644` text)
  - *Navigates back to Screen 1 to make changes*
- **Button 2 (Primary):** "**PROCEED TO PAYMENT**" (Solid `#147644` background, White text, Bold)
  - *Navigates to Screen 3: Payment Options*

---

### User Flow Logic for Screen 2:
1. Cashier reviews all items and totals
2. Tap "EDIT CART" → Returns to Screen 1 to make changes
3. Tap "PROCEED TO PAYMENT" → Navigates to **Screen 3: Payment Options**

---

## Screen 3: Payment Options

**Page Name:** `PaymentScreen`
**Entry:** Tapping "PROCEED TO PAYMENT" from Screen 2

**Purpose:** Select payment method, process payment, and generate receipt.

**Content on the page (Top to Bottom):**

### A. Header Bar
- **Background:** Solid `#147644`
- **Back Button:** `<` (White, navigates back to Screen 2)
- **Title:** "Payment" (`#FFFFFF`, Bold, size 20)
- **Right:** "Step 2 of 2" (`#E0E0E0`, size 12)

### B. Amount Display
*(Card Style: `#FFFFFF`, 12dp radius, 16dp padding, centered content)*
- **Label:** "Amount Due" (`#333333`, size 14)
- **Value:** "**$127.00**" (`#147644`, size 32, Bold)

### C. Payment Method Selection
*(Card Style: `#FFFFFF`, 12dp radius, 16dp padding)*

- **Label:** "Select Payment Method" (`#000000`, Bold, size 16)

- **Payment Method Cards (Vertical List):**
  - **Card 1: Cash**
    - Icon: 💵 (`#147644`)
    - Title: "Cash" (`#000000`)
    - Subtitle: "Pay with physical cash" (`#757575`)
    - Radio Button: Selected/Opaque circle (`#147644` or `#E0E0E0`)
  
  - **Card 2: Credit/Debit Card**
    - Icon: 💳 (`#147644`)
    - Title: "Credit / Debit Card" (`#000000`)
    - Subtitle: "Pay with card (terminal required)" (`#757575`)
    - Radio Button: Selected/Opaque circle

  - **Card 3: Mobile Payment**
    - Icon: 📱 (`#147644`)
    - Title: "Mobile Payment" (`#000000`)
    - Subtitle: "Pay with QR Code or NFC" (`#757575`)
    - Radio Button: Selected/Opaque circle

  - **Card 4: Split Payment (Conditional)**
    - Icon: 🔀 (`#FF7A4A`)
    - Title: "Split Payment" (`#000000`)
    - Subtitle: "Combine multiple payment methods" (`#757575`)
    - Radio Button: Selected/Opaque circle

### D. Cash Payment Details (Conditional - When Cash is Selected)
*(Card Style: `#FFFFFF`, 12dp radius, 12dp padding)*

- **Label:** "Cash Tendered" (`#333333`)
- **Input:** Numeric field with currency symbol (Placeholder: "0.00")
- **Quick Amount Buttons:** [Exact Amount] [+$10] [+$20] [+$50]
- **Change Display:** "Change Due: $0.00" (`#147644`)

### E. Card Payment Details (Conditional - When Card is Selected)
*(Card Style: `#FFFFFF`, 12dp radius, 12dp padding)*

- **Label:** "Card Terminal" (`#333333`)
- **Status:** "Waiting for terminal..." (`#FF7A4A`) *[Processing state]*
- **Button:** "**CONNECT TERMINAL**" (`#147644` border, `#147644` text)

### F. Action Buttons (Bottom Fixed)
- **Button 1 (Secondary):** "**CANCEL**" (White background, `#D32F2F` border, `#D32F2F` text)
  - *Cancels payment and returns to Screen 2*
- **Button 2 (Primary):** "**COMPLETE PAYMENT**" (Solid `#147644` background, White text, Bold)
  - *Processes payment → Navigates to Screen 4: Receipt Confirmation*
  - Disabled if no payment method selected or amount not entered

---

### User Flow Logic for Screen 3:
1. Cashier selects payment method (Cash, Card, Mobile, Split)
2. If Cash: Enter tendered amount → System calculates change
3. If Card: Connect to terminal → Process payment
4. Tap "COMPLETE PAYMENT" → Payment is processed → Navigates to **Screen 4: Receipt Confirmation**
5. Tap "CANCEL" → Returns to Screen 2 without processing

---

## Screen 4: Receipt Confirmation

**Page Name:** `ReceiptConfirmationScreen`
**Entry:** After successful payment from Screen 3

**Purpose:** Confirm payment success, print receipt, display QR code for security exit, and provide next actions.

**Content on the page (Top to Bottom):**

### A. Header Bar
- **Background:** Solid `#147644`
- **Title:** "Payment Successful!" (`#FFFFFF`, Bold, size 20)
- **Right:** "Transaction Complete" (`#E0E0E0`, size 12)

### B. Success Section
*(Centered content, 16dp padding top/bottom)*
- **Icon:** Large Green checkmark circle (`#2E7D32`, size 56)
- **Title:** "✓ Payment Successful!" (`#000000`, Bold, size 24, centered)
- **Subtitle:** "Receipt sent to printer." (`#333333`, size 14, centered)

### C. Receipt Summary Card
*(Card Style: `#FFFFFF`, `#147644` border (2dp), 12dp radius, 16dp padding)*

- **Transaction ID:** `#TX-1024` (`#147644`, Bold, size 18)
- **Date & Time:** "July 28, 2026 - 2:32 PM" (`#757575`, size 14)
- **Payment Method:** "Cash" (`#333333`)
- **Itemized Summary:** 
  - "Classic T-Shirt - Red/M" + "x2" + "$29.98" (`#000000`)
  - "Baseball Cap - Black" + "x1" + "$15.00" (`#000000`)
- **Divider:** Thin line (`#E0E0E0`)
- **Total Paid:** "Total: $127.00" (`#147644`, Bold, size 20)
- **Change:** "Change: $3.00" (`#333333`) *[If cash payment]*

### D. Security QR Code Section (The "Exit Lock")
*(Card Style: `#F5F5F5` background, `#FF7A4A` border (2dp), 12dp radius, 16dp padding)*

- **Header:** "🔒 Exit Verification QR Code" (`#000000`, Bold, size 14, centered)
- **QR Code Image:** Large, high-contrast QR code (approx. 150dp x 150dp, centered)
- **Instruction Text:** "Customer must present this QR at the exit for security verification." (`#333333`, size 12, centered)
- **Expiry/Lock Warning:** "This QR is unique and expires immediately upon exit scan." (`#757575`, size 10, centered)
- **Status Badge:** "🟢 Active - Awaiting Exit Scan" (`#2E7D32`)

### E. Quick Stats (If applicable)
*(Three small cards in a row)*
- **Card 1:** "Today's Total" + "$1,245" (`#147644`)
- **Card 2:** "Transactions" + "12" (`#FF7A4A`)
- **Card 3:** "Avg. Value" + "$104" (`#000000`)

### F. Action Buttons (Bottom Fixed)
- **Button 1 (Secondary):** "**REPRINT RECEIPT**" 
  - Style: White background, `#147644` border, `#147644` text
  - Action: Resends print command to Bluetooth printer
- **Button 2 (Primary):** "**NEW TRANSACTION**"
  - Style: Solid `#FF7A4A` background, White text, Bold
  - Action: Resets cart → Navigates back to Screen 1
- **Button 3 (Text Link):** "**VIEW TRANSACTION HISTORY**" (`#757575`, size 14)
  - Action: Navigates to Screen 5: Transaction History

---

### User Flow Logic for Screen 4:
1. Receipt automatically prints via Bluetooth on page load
2. Cashier hands printed receipt (with QR code) to customer
3. Tap "REPRINT RECEIPT" → Resends print command
4. Tap "NEW TRANSACTION" → Cart cleared → Returns to Screen 1
5. Tap "VIEW TRANSACTION HISTORY" → Navigates to Screen 5

---

## Screen 5: Transaction History (Optional / Side Menu)

**Page Name:** `TransactionHistoryScreen`
**Access:** Tapping "VIEW TRANSACTION HISTORY" from Screen 4 OR via Bottom Navigation tab

**Purpose:** View past transactions, reprint receipts, and track daily sales.

**Content on the page (Top to Bottom):**

### A. Header Bar
- **Background:** Solid `#147644`
- **Back Button:** `<` (White, navigates back to previous screen)
- **Title:** "Transaction History" (`#FFFFFF`, Bold, size 20)
- **Right:** Today's total `$1,245` (`#FF7A4A`, Bold)

### B. Filter & Search Bar
- **Search Input:** "Search by transaction ID or customer" (Placeholder: `#757575`)
- **Filter Tabs (Horizontal Scrollable):**
  - **[Today]** | **[Yesterday]** | **[This Week]** | **[This Month]**
  - Style: Inactive tabs `#757575`, Selected tab `#000000` with `#FF7A4A` underline

### C. Transaction List (Scrollable)
- **Each Transaction Card** (White `#FFFFFF`, `#E0E0E0` border, 8dp radius, 8dp margin bottom):
  - **Top Row:**
    - Left: `#TX-1024` (`#147644`, Bold)
    - Center: "2:32 PM" (`#757575`)
    - Right: "$127.00" (`#FF7A4A`, Bold)
  - **Middle Row:**
    - Left: "3 items" (`#333333`)
    - Center: "Cash" (`#333333`)
    - Right: "John Smith" (`#333333`) *[If customer added]*
  - **Bottom Row:**
    - **Status Badge:**
      - "🟢 Collected" (Green `#2E7D32` text) if security confirmed exit
      - "🟠 Pending Exit" (`#FF7A4A` text) if not yet scanned at exit
      - "🔴 Flagged" (`#D32F2F` text) if discrepancy found

### D. Transaction Detail Modal (Tapping a card opens this)
- **Overlay:** Dark transparent background (`#000000` with 70% opacity)
- **Modal Card:** White `#FFFFFF`, `#147644` border, 12dp radius, 20dp padding
- **Content:**
  - Transaction ID: `#TX-1024` (`#147644`, Bold)
  - Date/Time: "July 28, 2026 - 2:32 PM" (`#757575`)
  - Customer: "John Smith - +1234567890" (`#000000`)
  - Payment Method: "Cash" (`#333333`)
  - **Itemized List:**
    - "Classic T-Shirt - Red/M" + "x2" + "$29.98" (`#000000`)
    - "Baseball Cap - Black" + "x1" + "$15.00" (`#000000`)
  - **Totals:**
    - Subtotal: "$120.00" (`#333333`)
    - Tax: "$12.00" (`#333333`)
    - **Total: "$127.00"** (`#147644`, Bold)
  - **Exit Status:**
    - "🟢 Collected at 2:35 PM" (Green) OR
    - "🟠 Pending Exit Scan" (Orange)
  - **Action Button:** "**REPRINT THIS RECEIPT**" (`#FF7A4A` background, White text)

---

### User Flow Logic for Screen 5:
1. Cashier views list of past transactions
2. Tap filter tabs to change time period
3. Tap search bar to find specific transaction
4. Tap a transaction card → Opens detail modal
5. Tap "REPRINT THIS RECEIPT" → Sends receipt to printer → Closes modal
" (Orange)
  - **Action Button:** "**REPRINT THIS RECEIPT**" (`#FF7A4A` background, White text)

---

### User Flow Logic for Screen 5:
1. Cashier views list of past transactions
2. Tap filter tabs to change time period
3. Tap search bar to find specific transaction
4. Tap a transaction card → Opens detail modal
5. Tap "REPRINT THIS RECEIPT" → Sends receipt to printer → Closes modal

---

## Complete Flow Diagram (Text-Based)