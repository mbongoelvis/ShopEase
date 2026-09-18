import React, { useState } from 'react';

export default function TenantRoleBased() {
  const [userRole, setUserRole] = useState('inventory_monitor');
  const [activeTab, setActiveTab] = useState('analytics');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const isInventoryMonitor = userRole === 'inventory_monitor';

  const handleRoleChange = (role) => {
    setUserRole(role);
    if (role === 'inventory_monitor' && (activeTab === 'employees' || activeTab === 'billing')) {
      setActiveTab('analytics');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900 relative">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 p-6">
        <div>
          {/* Brand Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F] inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#D35327] inline-block"></span>
            </div>
            <h1 className="font-bold text-lg text-gray-900 leading-none tracking-tight ml-1">
              ShopEase
            </h1>
          </div>

          {/* Role Switcher Demo Control */}
          <div className="mb-6 p-2 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1.5 px-1">
              Active Role
            </p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <button
                onClick={() => handleRoleChange('owner')}
                className={`py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  userRole === 'owner'
                    ? 'bg-[#2D6A4F] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Owner
              </button>
              <button
                onClick={() => handleRoleChange('inventory_monitor')}
                className={`py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  userRole === 'inventory_monitor'
                    ? 'bg-[#2D6A4F] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Monitor
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all active:scale-95 cursor-pointer font-medium flex items-center gap-2.5 ${
                activeTab === 'analytics'
                  ? 'bg-[#2D6A4F] text-white'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>

            {!isInventoryMonitor && (
              <button
                onClick={() => setActiveTab('employees')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all active:scale-95 cursor-pointer font-medium flex items-center gap-2.5 ${
                  activeTab === 'employees'
                    ? 'bg-[#2D6A4F] text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Employees
              </button>
            )}

            <button
              onClick={() => setActiveTab('branches')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all active:scale-95 cursor-pointer font-medium flex items-center gap-2.5 ${
                activeTab === 'branches'
                  ? 'bg-[#2D6A4F] text-white'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Branches
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all active:scale-95 cursor-pointer font-medium flex items-center gap-2.5 ${
                activeTab === 'products'
                  ? 'bg-[#2D6A4F] text-white'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Products
            </button>

            {!isInventoryMonitor && (
              <button
                onClick={() => setActiveTab('billing')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all active:scale-95 cursor-pointer font-medium flex items-center gap-2.5 ${
                  activeTab === 'billing'
                    ? 'bg-[#2D6A4F] text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Billing
              </button>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 flex flex-col justify-between overflow-y-auto bg-gray-50">
        <div className="flex-1">
          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics Overview</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {isInventoryMonitor
                    ? 'Inventory turnover and stock discrepancy monitoring (Revenue hidden)'
                    : 'Real-time stats across all store branches'}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                {!isInventoryMonitor ? (
                  <div className="bg-white p-5 rounded-xl border border-gray-200 border-t-2 border-t-[#2D6A4F]">
                    <p className="text-xs text-gray-500 font-medium">Revenue (30d)</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">$38,400</p>
                    <p className="text-[11px] text-[#2D6A4F] mt-1">↑ 12% vs last month</p>
                  </div>
                ) : (
                  <div className="bg-white p-5 rounded-xl border border-gray-200 border-t-2 border-t-[#2D6A4F]">
                    <p className="text-xs text-gray-500 font-medium">Stock Turnover Rate</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">4.2x</p>
                    <p className="text-[11px] text-[#2D6A4F] mt-1">Optimal turnover speed</p>
                  </div>
                )}

                <div className="bg-white p-5 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-500 font-medium">Low-stock items</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">9</p>
                  <p className="text-[11px] text-[#D35327] mt-1">Requires restocking</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 border-r-2 border-r-[#D35327]">
                  <p className="text-xs text-gray-500 font-medium">Discrepancy flags</p>
                  <p className="text-3xl font-bold text-[#D35327] mt-2">2</p>
                  <p className="text-[11px] text-[#D35327] mt-1">Needs manager review</p>
                </div>
              </div>

              {/* Graphical Overview */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  {isInventoryMonitor ? 'Inventory Log & Turnover by Branch' : 'Revenue by Branch'}
                </p>
                <div className="pt-6 pb-2 flex items-end justify-between gap-4 h-44 px-2">
                  <div className="flex-1 bg-[#2D6A4F] h-full rounded-lg"></div>
                  <div className="flex-1 bg-[#2D6A4F] h-3/4 rounded-lg"></div>
                  <div className="flex-1 bg-[#2D6A4F] h-4/5 rounded-lg"></div>
                  <div className="flex-1 bg-[#D35327] h-1/2 rounded-lg"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                  <span>Lekki</span>
                  <span>Ikeja</span>
                  <span>Yaba</span>
                  <span>Surulere (new)</span>
                </div>
              </div>
            </div>
          )}

          {/* BRANCHES TAB */}
          {activeTab === 'branches' && (
            <div className="max-w-4xl space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Branches</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {isInventoryMonitor ? 'Branch list (View only - Add/Edit disabled)' : 'Manage branch locations'}
                  </p>
                </div>
                {!isInventoryMonitor && (
                  <button className="bg-[#D35327] hover:bg-[#B8421B] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer">
                    + Add branch
                  </button>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5 divide-y divide-gray-100 text-sm">
                <div className="py-3 flex justify-between items-center">
                  <div>
                    <p className="text-gray-900 font-medium">Lekki Main Branch</p>
                    <p className="text-xs text-gray-500">12 Admiralty Way, Lekki Phase 1</p>
                  </div>
                  {!isInventoryMonitor && (
                    <button className="text-xs text-[#2D6A4F] hover:underline">Edit</button>
                  )}
                </div>
                <div className="py-3 flex justify-between items-center">
                  <div>
                    <p className="text-gray-900 font-medium">Ikeja Branch</p>
                    <p className="text-xs text-gray-500">45 Allen Avenue, Ikeja</p>
                  </div>
                  {!isInventoryMonitor && (
                    <button className="text-xs text-[#2D6A4F] hover:underline">Edit</button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="max-w-4xl space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Products & Stock</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {isInventoryMonitor
                      ? 'Stock actions only (No pricing edits or new product creation)'
                      : 'Full product inventory and pricing management'}
                  </p>
                </div>

                {!isInventoryMonitor && (
                  <button
                    onClick={() => setIsAddProductOpen(true)}
                    className="bg-[#D35327] hover:bg-[#B8421B] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    + New Product
                  </button>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="grid grid-cols-12 text-xs text-gray-500 font-semibold uppercase tracking-wider pb-3 border-b border-gray-200">
                  <span className="col-span-4">Item Name</span>
                  <span className="col-span-3">Stock Count</span>
                  <span className="col-span-2">Price</span>
                  <span className="col-span-3 text-right">Actions</span>
                </div>

                <div className="divide-y divide-gray-100 text-sm">
                  <div className="grid grid-cols-12 py-3.5 items-center">
                    <span className="col-span-4 text-gray-900 font-medium">Designer Cotton Shirt</span>
                    <span className="col-span-3 text-gray-600">42 units</span>
                    <span className="col-span-2 text-[#2D6A4F] font-medium">$25.00</span>
                    <div className="col-span-3 flex justify-end gap-2">
                      <button className="px-2.5 py-1 bg-[#2D6A4F]/10 text-[#2D6A4F] text-xs rounded-lg hover:bg-[#2D6A4F]/20 cursor-pointer">
                        Adjust Stock
                      </button>
                      {!isInventoryMonitor && (
                        <button className="px-2.5 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-200 cursor-pointer">
                          Edit Price
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EMPLOYEES TAB (OWNER ONLY) */}
          {activeTab === 'employees' && !isInventoryMonitor && (
            <div className="max-w-4xl space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Management</h2>
              <div className="bg-white p-5 rounded-xl border border-gray-200 text-sm text-gray-600">
                Full access employee list, permissions, and onboarding tools.
              </div>
            </div>
          )}

          {/* BILLING TAB (OWNER ONLY) */}
          {activeTab === 'billing' && !isInventoryMonitor && (
            <div className="max-w-4xl space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Tenant Billing</h2>
              <div className="bg-white p-5 rounded-xl border border-gray-200 text-sm text-gray-600">
                Full access billing portal, invoices, and subscription plan management.
              </div>
            </div>
          )}
        </div>

        <footer className="pt-8 text-center text-xs text-gray-400 border-t border-gray-200 mt-8">
          © 2026 ShopEase. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
