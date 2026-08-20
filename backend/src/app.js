//This file is the express application itself, we configure middleware and mout routes here
//This file doesn't start the server (server.js handles that - standard way (we separate both app.js and server.js so we avoid binding ports, which we will use if we write automated tests))

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import checkoutRoutes from './routes/checkout.routes.js';
import exitRoutes from './routes/exit.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import supplierRoutes from './routes/supplier.routes.js';
import purchaseOrderRoutes from './routes/purchaseOrder.routes.js';
import adminRoutes from './routes/admin.routes.js';
import supportTicketRoutes from './routes/supportTicket.routes.js';

const app = express();

app.use(cors()); // allows requests from any origin fine for development.

// Built-in middleware: parses incoming JSON request bodies into req.body.
// Without this, req.body would be undefined on every POST request.
app.use(express.json());

// A simple health-check to see if its working
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);           // -> POST /auth/login
app.use('/employees', employeeRoutes);  // -> POST /employees
app.use('/categories', categoryRoutes); // -> POST/GET /categories
app.use('/products', productRoutes);    // -> POST /products, GET /products/:barcode
app.use('/checkout', checkoutRoutes); // -> POST /checkout
app.use('/exit', exitRoutes); // -> POST /exit
app.use('/analytics', analyticsRoutes); // -> GET /analytics
app.use('/suppliers', supplierRoutes); // -> POST /suppliers
app.use('/purchase-orders', purchaseOrderRoutes); // -> /purchase-orders
app.use('/admin', adminRoutes); // -> POST /login
app.use('/support-tickets', supportTicketRoutes); // -> POST /support-tickets

export default app;