import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Admin Imports
import AdminLogin from "./admin/pages/LoginForm.jsx";
import AdminPasswordReset from "./admin/pages/AdminPasswordReset.jsx";
import ShopEaseAdmin from "./admin/pages/ShopEaseAdmin.jsx";

// Tenant Imports
import Login from "./tenant/pages/login.jsx";
import LandingPage from "./tenant/pages/landing.jsx";
import TenantDashboard from "./tenant/pages/tenantDashboard.jsx";
import ChangePassword from "./tenant/pages/ChangePassword.jsx";
import Checkout from "./tenant/pages/checkout.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Landing & Auth */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<Login />} />

        {/* Tenant Portal */}
        <Route path="/tenant/dashboard" element={<TenantDashboard />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* Admin Portal */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/reset-password" element={<AdminPasswordReset />} />
        <Route path="/admin/dashboard" element={<ShopEaseAdmin />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}