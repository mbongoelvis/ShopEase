import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function useAdminApi(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('digisol_admin_token');
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(`Failed to fetch ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, refetch: fetchData };
}

export default function ShopEaseAdmin() {
  const navigate = useNavigate();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tenants');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenantDetail, setTenantDetail] = useState(null);

  // Get current admin from localStorage
  const currentAdmin = (() => {
    const adminJSON = localStorage.getItem('digisol_admin');
    return adminJSON ? JSON.parse(adminJSON) : null;
  })();

  const handleLogout = () => {
    localStorage.removeItem('digisol_admin_token');
    localStorage.removeItem('digisol_admin');
    navigate('/admin/login');
  };

  // Real API data
  const { data: tenantsData, loading: tenantsLoading } = useAdminApi('/admin/tenants');
  const { data: analyticsData } = useAdminApi('/admin/analytics');
  const { data: billingData, refetch: refetchBilling } = useAdminApi('/admin/billing');
  const { data: ticketsData, refetch: refetchTickets } = useAdminApi('/admin/support-tickets');

  const tenants = tenantsData?.tenants || [];
  const analytics = analyticsData?.analytics || {};
  const billingRecords = billingData?.subscriptions || [];
  const supportTickets = ticketsData?.tickets || [];

  // Billing Modal State
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderTone, setReminderTone] = useState('Friendly');
  const [selectedBillingTenant, setSelectedBillingTenant] = useState('');

  // Support Modal State & New Ticket Form State
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [newTicketTenant, setNewTicketTenant] = useState('');
  const [newTicketPriority, setNewTicketPriority] = useState('Low');
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketDescription, setNewTicketDescription] = useState('');
  const [editingTicketId, setEditingTicketId] = useState(null);

  const selectedBillingRecord = billingRecords.find(
    (record) => record.store_name === selectedBillingTenant
  );

  const selectedTenantData = tenants.find(
    (tenant) => tenant.store_name === selectedBillingTenant
  );

  const handleSelectTenant = async (tenant) => {
    setSelectedTenant(tenant);
    try {
      const token = localStorage.getItem('digisol_admin_token');
      const res = await fetch(`${API_BASE}/admin/tenants/${tenant.store_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setTenantDetail(json.tenant);
      }
    } catch (err) {
      console.error('Failed to fetch tenant detail:', err);
    }
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!newTicketTenant || !newTicketSubject) {
      alert('Please select a tenant and provide a subject/issue.');
      return;
    }
    alert(`Ticket created for ${newTicketTenant}: ${newTicketSubject}`);
    setIsNewTicketModalOpen(false);
    setNewTicketTenant('');
    setNewTicketPriority('Low');
    setNewTicketSubject('');
    setNewTicketDescription('');
    refetchTickets();
  };

  const handleTicketStatusChange = async (ticketId, status) => {
    const statusMap = { 'Open': 'OPEN', 'In progress': 'IN_PROGRESS', 'Resolved': 'RESOLVED' };
    try {
      const token = localStorage.getItem('digisol_admin_token');
      const res = await fetch(`${API_BASE}/admin/support-tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: statusMap[status] || status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update');
      }
      refetchTickets();
    } catch (err) {
      alert(`Failed to update ticket: ${err.message}`);
    }
    setEditingTicketId(null);
  };

  const getMessagePreview = () => {
    const tenantName = selectedTenantData?.store_name || 'the selected tenant';
    const amount = selectedBillingRecord ? `${selectedBillingRecord.monthly_price} XAF` : 'invoice amount';

    switch (reminderTone) {
      case 'Firm':
        return `Hi ${tenantName}, this is a formal reminder that your invoice of ${amount} is overdue. Please settle this payment as soon as possible.`;
      case 'Final notice':
        return `URGENT: Your invoice of ${amount} is overdue. Please process payment immediately to prevent interruption to your ShopEase services.`;
      case 'Friendly':
      default:
        return `Hi ${tenantName}, this is a friendly reminder that your invoice of ${amount} is due...`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900 relative">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 p-6">
        <div>
          {/* DIGISOL Admin Logo with Green/Orange Accents */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] inline-block"></span>
            </div>
            <h1 className="font-bold text-lg text-gray-900 leading-none tracking-tight ml-1">
              ShopEase <span className="text-xs font-normal text-gray-500">admin</span>
            </h1>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            <button
              onClick={() => {
                setActiveTab('tenants');
                setSelectedTenant(null);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all active:scale-95 cursor-pointer font-medium flex items-center gap-2.5 ${
                activeTab === 'tenants'
                  ? 'bg-[#2D6A4F] text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              Tenants
            </button>

            <button
              onClick={() => {
                setActiveTab('analytics');
                setSelectedTenant(null);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all active:scale-95 cursor-pointer font-medium flex items-center gap-2.5 ${
                activeTab === 'analytics'
                  ? 'bg-[#2D6A4F] text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              Platform analytics
            </button>

            <button
              onClick={() => {
                setActiveTab('billing');
                setSelectedTenant(null);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all active:scale-95 cursor-pointer font-medium flex items-center gap-2.5 ${
                activeTab === 'billing'
                  ? 'bg-[#2D6A4F] text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              Billing
            </button>

            <button
              onClick={() => {
                setActiveTab('support');
                setSelectedTenant(null);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all active:scale-95 cursor-pointer font-medium flex items-center gap-2.5 ${
                activeTab === 'support'
                  ? 'bg-[#2D6A4F] text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              Support
            </button>
          </nav>
        </div>

        {/* ACCOUNT MENU - BOTTOM OF SIDEBAR */}
        <div className="pt-6 border-t border-gray-200 relative">
          <button
            onClick={() => setIsAccountOpen(!isAccountOpen)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium rounded-xl text-gray-600 hover:bg-gray-100/60 hover:text-gray-900 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-[#2D6A4F] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
              {currentAdmin?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{currentAdmin?.email || "Admin"}</p>
              <p className="text-[10px] text-gray-500">Platform Admin</p>
            </div>
            <svg className={`w-4 h-4 transition-transform ${isAccountOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          {/* ACCOUNT DROPDOWN */}
          {isAccountOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg p-2 space-y-1 z-50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50/60 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 p-10 flex flex-col justify-between overflow-y-auto bg-gray-50">
        <div className="flex-1">
          {/* --- TENANTS TAB --- */}
          {activeTab === 'tenants' && (
            <>
              {!selectedTenant ? (
                /* TENANTS OVERVIEW LIST */
                <div className="max-w-4xl space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Tenants</h2>
                    <p className="text-xs text-gray-500 mt-1">Manage platform stores and subscription statuses</p>
                  </div>

                  {/* Top Metric Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 border-t-2 border-t-emerald-500">
                      <p className="text-xs text-gray-500 font-medium">Active stores</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{tenants.length}</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 font-medium">Total employees</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {tenants.reduce((sum, t) => sum + Number(t.employee_count || 0), 0)}
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 border-r-2 border-r-[#f97316]">
                      <p className="text-xs text-gray-500 font-medium">Fraud attempts (30d)</p>
                      <p className="text-3xl font-bold text-[#f97316] mt-2">{analytics.fraud_attempts_blocked_30d || 0}</p>
                    </div>
                  </div>

                  {/* Tenants Table */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-lg">
                    <div className="grid grid-cols-12 text-xs text-gray-500 font-semibold uppercase tracking-wider pb-3 border-b border-gray-200">
                      <span className="col-span-5">Store</span>
                      <span className="col-span-2">Employees</span>
                      <span className="col-span-2">Plan</span>
                      <span className="col-span-3">Status</span>
                    </div>

                    <div className="divide-y divide-gray-800/60 text-sm">
                      {tenants.map((tenant) => (
                        <div
                          key={tenant.store_id}
                          onClick={() => handleSelectTenant(tenant)}
                          className="grid grid-cols-12 py-3.5 items-center hover:bg-gray-100 cursor-pointer transition-colors px-2 rounded-lg"
                        >
                          <span className="col-span-5 text-gray-900 font-medium">{tenant.store_name}</span>
                          <span className="col-span-2 text-gray-600">{tenant.employee_count}</span>
                          <span className="col-span-2 text-gray-600">—</span>
                          <span className="col-span-3 font-medium text-emerald-400">Active</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* IN-DEPTH TENANT VIEW */
                <div className="max-w-4xl space-y-6">
                  {/* Top Navigation & Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <button
                        onClick={() => { setSelectedTenant(null); setTenantDetail(null); }}
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 font-medium mb-3 active:scale-95 transition-transform cursor-pointer"
                      >
                        ← All tenants
                      </button>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedTenant.store_name}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Joined {new Date(selectedTenant.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Metric Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 font-medium">Employees</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {tenantDetail?.employee_count || selectedTenant.employee_count || 0}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 font-medium">Txns (30d)</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {tenantDetail?.transaction_count_30d || 0}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 font-medium">Address</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {tenantDetail?.store_address || selectedTenant.store_address || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* --- PLATFORM ANALYTICS TAB --- */}
          {activeTab === 'analytics' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Platform Analytics</h2>
                <p className="text-xs text-gray-500 mt-1">Real-time stats across all store branches</p>
              </div>

              {/* Top Stat Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 border-t-2 border-t-emerald-500">
                  <p className="text-xs text-gray-500 font-medium">Active tenants</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.total_tenants || 0}</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-500 font-medium">Transactions (30d)</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{Number(analytics.transactions_30d || 0).toLocaleString()}</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 border-r-2 border-r-[#f97316]">
                  <p className="text-xs text-gray-500 font-medium">Fraud attempts blocked (30d)</p>
                  <p className="text-3xl font-bold text-[#f97316] mt-2">{analytics.fraud_attempts_blocked_30d || 0}</p>
                </div>
              </div>

              {/* MRR Summary */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Monthly Recurring Revenue (XAF)</p>
                <p className="text-3xl font-bold text-gray-900">
                  {billingRecords.reduce((sum, r) => sum + Number(r.monthly_price || 0), 0).toLocaleString()} XAF/mo
                </p>
                <p className="text-xs text-gray-500">
                  Across {billingRecords.length} subscription{billingRecords.length !== 1 ? 's' : ''}
                  {' · '}
                  {billingRecords.filter((r) => Number(r.overdue_invoice_count) > 0).length} with overdue invoices
                </p>
              </div>
            </div>
          )}

          {/* --- BILLING TAB --- */}
          {activeTab === 'billing' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Billing & Subscriptions</h2>
                <p className="text-xs text-gray-500 mt-1">Manage tenant invoices and recurring payments</p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 border-t-2 border-t-emerald-500">
                  <p className="text-xs text-gray-500 font-medium">MRR (XAF)</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {billingRecords.reduce((sum, r) => sum + Number(r.monthly_price || 0), 0).toLocaleString()} XAF
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 border-r-2 border-r-[#f97316]">
                  <p className="text-xs text-gray-500 font-medium">Overdue invoices</p>
                  <p className="text-3xl font-bold text-[#f97316] mt-2">
                    {billingRecords.reduce((sum, r) => sum + Number(r.overdue_invoice_count || 0), 0)}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-500 font-medium">Active subscriptions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {billingRecords.filter((r) => r.status === 'ACTIVE').length}
                  </p>
                </div>
              </div>

              {/* Billing Table */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-lg">
                <div className="grid grid-cols-5 text-xs text-gray-500 font-semibold uppercase tracking-wider pb-3 border-b border-gray-200">
                  <span>Tenant</span>
                  <span>Plan</span>
                  <span>Amount</span>
                  <span>Payment Method</span>
                  <span>Status</span>
                </div>

                <div className="divide-y divide-gray-800 text-sm">
                  {billingRecords.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-5 py-3.5 items-center">
                      <span className="text-gray-900 font-medium">{item.store_name}</span>
                      <span className="text-gray-500">{item.plan_name}</span>
                      <span className="text-gray-600">{item.monthly_price} XAF/mo</span>
                      <span className="text-gray-500 text-xs">
                        {item.preferred_payment_method ? item.preferred_payment_method.replace(/_/g, ' ') : 'Not set'}
                      </span>
                      <span className={Number(item.overdue_invoice_count) > 0 ? 'text-[#f97316] font-medium' : 'text-emerald-400 font-medium'}>
                        {Number(item.overdue_invoice_count) > 0 ? `${item.overdue_invoice_count} overdue` : item.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Send Payment Reminder Button */}
                <div className="flex justify-end pt-3 border-t border-gray-200">
                  <button
                    onClick={() => setIsReminderModalOpen(true)}
                    className="bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-md"
                  >
                    Send payment reminder
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- SUPPORT TAB --- */}
          {activeTab === 'support' && (
            <div className="max-w-4xl space-y-6">
              {/* Header with New Ticket Button */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Support Tickets</h2>
                  <p className="text-xs text-gray-500 mt-1">Review and resolve tenant issues</p>
                </div>
                <button
                  onClick={() => setIsNewTicketModalOpen(true)}
                  className="bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  + New ticket
                </button>
              </div>

              {/* Support Tickets Table */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-lg">
                <div className="grid grid-cols-12 text-xs text-gray-500 font-semibold uppercase tracking-wider pb-3 border-b border-gray-200">
                  <span className="col-span-2">Tenant</span>
                  <span className="col-span-3">Issue</span>
                  <span className="col-span-3">Description</span>
                  <span className="col-span-2">Priority</span>
                  <span className="col-span-2">Status</span>
                </div>

                <div className="divide-y divide-gray-800 text-sm">
                  {supportTickets.map((ticket) => (
                    <div key={ticket.id} className="grid grid-cols-12 py-3.5 items-center">
                      <span className="col-span-2 text-gray-900 font-medium">{ticket.store_name}</span>
                      <span className="col-span-3 text-gray-600">{ticket.subject}</span>
                      <span className="col-span-3 text-gray-500">{ticket.description || '\u2014'}</span>
                      
                      {/* Priority Tag */}
                      <span className="col-span-2">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-xs rounded-md font-medium ${
                            ticket.priority === 'HIGH'
                              ? 'bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30'
                              : ticket.priority === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </span>

                      {/* Status Tag */}
                      <span className="col-span-2 flex items-center gap-2">
                        {editingTicketId === ticket.id ? (
                          <select
                            defaultValue={ticket.status === 'OPEN' ? 'Open' : ticket.status === 'RESOLVED' ? 'Resolved' : 'In progress'}
                            onChange={(e) => handleTicketStatusChange(ticket.id, e.target.value)}
                            className="bg-white border border-gray-300 rounded-md px-1.5 py-1 text-xs text-gray-700 outline-none focus:border-emerald-500/50"
                            autoFocus
                          >
                            <option>Open</option>
                            <option>In progress</option>
                            <option>Resolved</option>
                          </select>
                        ) : (
                          <span
                            className={
                              ticket.status === 'OPEN'
                                ? 'text-[#f97316] font-medium'
                                : ticket.status === 'RESOLVED'
                                ? 'text-emerald-400 font-medium'
                                : 'text-gray-500'
                            }
                          >
                            {ticket.status === 'OPEN' ? 'Open' : ticket.status === 'RESOLVED' ? 'Resolved' : 'In progress'}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditingTicketId(ticket.id)}
                          title="Edit ticket status"
                          className="text-gray-500 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          ✎
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Centered Footer across all views */}
        <footer className="pt-8 text-center text-xs text-gray-400 border-t border-gray-200/40 mt-8">
          © 2026 ShopEase. All rights reserved.
        </footer>
      </main>

      {/* --- PAYMENT REMINDER MODAL --- */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-gray-700">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="text-base font-semibold text-gray-900">Send payment reminder</h3>
              <button
                onClick={() => setIsReminderModalOpen(false)}
                className="text-gray-500 hover:text-gray-900 text-lg leading-none p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tenant Selection */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 block">Company</label>
              <select
                value={selectedBillingTenant}
                onChange={(e) => setSelectedBillingTenant(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none appearance-none cursor-pointer"
              >
                <option value="" disabled className="bg-white">{tenantsLoading ? 'Loading tenants...' : 'Select a company...'}</option>
                {tenants.length > 0 ? (
                  tenants.map((tenant) => (
                    <option key={tenant.store_id} value={tenant.store_name} className="bg-white">
                      {tenant.store_name}
                    </option>
                  ))
                ) : (
                  !tenantsLoading && <option disabled>No tenants available</option>
                )}
              </select>
            </div>

            {/* Tenant Info Box */}
            <div className="bg-[#f97316]/10 p-3.5 rounded-xl border border-[#f97316]/30">
              <p className="text-xs font-semibold text-[#f97316]">
                {selectedTenantData?.store_name || 'Select a company'}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                {selectedBillingRecord
                  ? `${selectedBillingRecord.plan_name} plan · ${selectedBillingRecord.monthly_price} XAF/mo · ${selectedBillingRecord.status}`
                  : selectedTenantData ? 'No active billing record' : 'Choose a company to view reminder details'}
              </p>
            </div>

            {/* Send To Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 block">Store</label>
              <input
                type="text"
                readOnly
                value={selectedTenantData?.store_name || ''}
                placeholder="Select a company..."
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 outline-none"
              />
            </div>

            {/* Reminder Tone Selection */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 block">Reminder tone</label>
              <div className="grid grid-cols-3 gap-2">
                {['Friendly', 'Firm', 'Final notice'].map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setReminderTone(tone)}
                    className={`py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      reminderTone === tone
                        ? 'bg-[#2D6A4F] text-emerald-300 border border-emerald-500/50'
                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Preview */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 block">Message preview</label>
              <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs text-gray-600 leading-relaxed min-h-[64px]">
                {getMessagePreview()}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-200">
              <button
                onClick={() => setIsReminderModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!selectedTenantData}
                onClick={async () => {
                  if (!selectedTenantData) {
                    alert('Please select a company');
                    return;
                  }
                  try {
                    const token = localStorage.getItem('digisol_admin_token');
                    const amount = selectedBillingRecord?.monthly_price || 'Amount pending';
                    const res = await fetch(`${API_BASE}/admin/send-payment-reminder`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({
                        storeId: selectedTenantData.store_id,
                        tenantName: selectedTenantData.store_name,
                        amount: amount,
                        tone: reminderTone,
                      }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      alert(`✅ Payment reminder email (${reminderTone}) sent successfully to ${selectedTenantData.store_name}`);
                    } else {
                      alert(`Failed to send reminder: ${data.error}`);
                    }
                  } catch (err) {
                    alert(`Error: ${err.message}`);
                  }
                  setIsReminderModalOpen(false);
                }}
                className="px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                Send email reminder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- NEW SUPPORT TICKET MODAL --- */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-gray-700">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="text-base font-semibold text-gray-900">New support ticket</h3>
              <button
                onClick={() => setIsNewTicketModalOpen(false)}
                className="text-gray-500 hover:text-gray-900 text-lg leading-none p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              {/* Tenant Selection */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 block">Tenant</label>
                <div className="relative">
                  <select
                    value={newTicketTenant}
                    onChange={(e) => setNewTicketTenant(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-white">Select a tenant...</option>
                    {tenants.map((t) => (
                      <option key={t.store_id} value={t.store_name} className="bg-white">
                        {t.store_name}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none">▼</span>
                </div>
              </div>

              {/* Priority Selection */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 block">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Low', 'Medium', 'High'].map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setNewTicketPriority(p)}
                      className={`py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        newTicketPriority === p
                          ? p === 'Low'
                            ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                            : p === 'Medium'
                            ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                            : 'bg-[#f97316]/20 border border-[#f97316]/50 text-[#f97316]'
                          : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Input */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 block">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. QR scanner not reading barcodes"
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none placeholder:text-gray-600 focus:border-emerald-500/50"
                />
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 block">Description</label>
                <textarea
                  rows="3"
                  placeholder="Add any relevant detail..."
                  value={newTicketDescription}
                  onChange={(e) => setNewTicketDescription(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none placeholder:text-gray-600 resize-none focus:border-emerald-500/50"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-semibold rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  Create ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}