import { useState } from 'react';

export default function Analytics() {
  // Weekly sales data for the Bar Chart
  const weeklySalesData = [
    { day: 'Mon', revenue: 2400 },
    { day: 'Tue', revenue: 1800 },
    { day: 'Wed', revenue: 3200 },
    { day: 'Thu', revenue: 2900 },
    { day: 'Fri', revenue: 4500 },
    { day: 'Sat', revenue: 5100 },
    { day: 'Sun', revenue: 3800 },
  ];

  // Calculate maximum value to scale chart bars proportionally
  const maxRevenue = Math.max(...weeklySalesData.map((item) => item.revenue));

  // Product List State
  const [products, setProducts] = useState([
    { id: 'PROD-001', name: 'Wireless Barcode Scanner', category: 'Hardware', price: 85.0, stock: 24, salesCount: 142 },
    { id: 'PROD-002', name: 'Thermal Receipt Paper (10 Pack)', category: 'Supplies', price: 15.0, stock: 8, salesCount: 310 },
    { id: 'PROD-003', name: 'QR Exit Terminal Sensor', category: 'Hardware', price: 210.0, stock: 12, salesCount: 45 },
    { id: 'PROD-004', name: 'Smart Security Tag Pack', category: 'Security', price: 45.0, stock: 50, salesCount: 89 },
  ]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Hardware',
    price: '',
    stock: '',
  });

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      alert('Please fill in all fields.');
      return;
    }

    const createdItem = {
      id: `PROD-00${products.length + 1}`,
      name: newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock, 10),
      salesCount: 0,
    };

    setProducts([createdItem, ...products]);
    setNewProduct({ name: '', category: 'Hardware', price: '', stock: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time performance metrics and inventory tracking</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#c84c0c] hover:bg-[#b04008] text-white font-medium px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer w-full sm:w-auto text-center"
        >
          + Add New Product
        </button>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Revenue (7d)</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1">
            ${weeklySalesData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Low-stock items</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#c84c0c] mt-1">
            {products.filter((p) => p.stock < 10).length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Discrepancy flags</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">2</p>
        </div>
      </div>

      {/* Weekly Revenue Bar Chart Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800">Weekly Revenue Breakdown</h2>
          <span className="text-xs font-medium bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-100">
            Current Week
          </span>
        </div>

        {/* Bar Chart Container */}
        <div className="h-48 sm:h-56 flex items-end justify-between gap-2 sm:gap-6 pt-6 border-b border-gray-100 pb-2">
          {weeklySalesData.map((item, index) => {
            const heightPercent = Math.round((item.revenue / maxRevenue) * 100);
            return (
              <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group">
                {/* Tooltip on hover */}
                <span className="text-[10px] sm:text-xs font-semibold text-emerald-900 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                  ${item.revenue}
                </span>
                
                {/* Visual Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[50px] bg-emerald-800 group-hover:bg-emerald-700 rounded-t-lg transition-all duration-300"
                />
                
                {/* X-Axis Label */}
                <span className="text-xs font-medium text-gray-500 mt-3">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Products Column Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Products & Inventory Status</h2>
        </div>

        {/* Scrollable container for small screens */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 min-w-[600px]">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-5">Product ID</th>
                <th className="py-3.5 px-5">Product Name</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Price</th>
                <th className="py-3.5 px-5">Stock</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition">
                  <td className="py-3.5 px-5 font-mono text-gray-800 font-medium">{p.id}</td>
                  <td className="py-3.5 px-5 font-semibold text-gray-900">{p.name}</td>
                  <td className="py-3.5 px-5">{p.category}</td>
                  <td className="py-3.5 px-5 font-bold text-gray-800">${p.price.toFixed(2)}</td>
                  <td className="py-3.5 px-5">{p.stock} units</td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        p.stock < 10
                          ? 'bg-amber-50 text-[#c84c0c] border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {p.stock < 10 ? 'Low Stock' : 'Optimal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Product */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-xl font-bold text-emerald-900">Add New Product</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Thermal Printer Roll"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-700"
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Security">Security</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="29.99"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="20"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-[#c84c0c] hover:bg-[#b04008] text-white rounded-xl font-medium shadow-sm transition"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}