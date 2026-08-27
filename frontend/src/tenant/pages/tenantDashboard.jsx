import React, { useState, useRef } from "react";
import { useApi } from "../../Hooks/useApi";

// Helper: Get current user from localStorage (set during login)
const getCurrentUser = () => {
  const userJSON = localStorage.getItem("digisol_user");
  return userJSON ? JSON.parse(userJSON) : null;
};

// Helper: Wrapper for POST requests to create employees
const createEmployee = async (data) => {
  const token = localStorage.getItem("digisol_token");
  if (!token) {
    throw new Error("Not authenticated. Please login again.");
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/employees`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
};

const ROLE_DISPLAY_MAP = {
  OWNER: "Owner",
  CASHIER: "Cashier",
  SECURITY_GUARD: "Security Guard",
  STOCKER: "Stocker",
  INVENTORY_MONITOR: "Inventory Monitor",
};

export default function TenantDashboard() {
  const currentUser = getCurrentUser();
  // Real role now comes from the logged-in user's token, not a manual toggle.
  const [userRole] = useState(ROLE_DISPLAY_MAP[currentUser?.role] || "Owner");

  // ANALYTICS DATA (real API)
  const { data: revenueData } = useApi('/analytics/revenue');
  const { data: turnoverData } = useApi('/analytics/turnover');
  const { data: flagsData } = useApi('/analytics/security-flags');

  const totalRevenue = (revenueData?.revenue || []).reduce((sum, m) => sum + Number(m.revenue || 0), 0);
  const lowStockCount = (turnoverData?.turnover || []).filter((item) => item.current_stock <= 5 && item.current_stock > 0).length;
  const outOfStockCount = (turnoverData?.turnover || []).filter((item) => item.current_stock === 0).length;
  const discrepancyCount = (flagsData?.flags || []).reduce((sum, f) => sum + Number(f.discrepancy_count || 0), 0);

  // 1. ACTIVE TAB STATE
  const [activeTab, setActiveTab] = useState("analytics");
  const [activeCategory, setActiveCategory] = useState("All");

  // 2. PRODUCT STATE & MODAL HANDLERS
  const { data: products = [], loading: productsLoading, refetch: refetchProducts } = useApi('/products');
  const { data: categories = [], loading: categoriesLoading, refetch: refetchCategories } = useApi('/categories');

  // Transform backend product shape to UI shape
  const transformedProducts = (products || []).map((p) => {
    let stockStatus = "In stock";
    if (p.stock === 0) {
      stockStatus = "Out of stock";
    } else if (p.stock > 0 && p.stock <= 5) {
      stockStatus = "Low stock";
    }
    return {
      id: p.product_id,
      name: p.name,
      category: p.category_name,
      variants: 1,
      price: p.price,
      stock: stockStatus,
      stockQuantity: p.stock,
    };
  });

  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  // New Product Form State
  const [barcodeInput, setBarcodeInput] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [selectedSizes, setSelectedSizes] = useState(["S", "M", "L"]);
  const [selectedColors, setSelectedColors] = useState(["Red", "Blue"]);
  const categoryOptions = Array.isArray(categories) ? categories : categories?.categories || [];
  const [availableSizes, setAvailableSizes] = useState(["XS", "S", "M", "L", "XL", "XXL"]);
  const [availableColors, setAvailableColors] = useState(["Red", "Blue", "Green", "Black", "White", "Yellow"]);
  const [customSize, setCustomSize] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryBasePrice, setCategoryBasePrice] = useState("");
  const [categoryTaxRate, setCategoryTaxRate] = useState("");

  // Bulk Upload Form State
  const [bulkCategory, setBulkCategory] = useState("Dresses");
  const [uploadedFileName, setUploadedFileName] = useState("products_july.csv · 214 rows");
  const fileInputRef = useRef(null);

  // 3. EMPLOYEE STATE & MODAL HANDLERS
  const { data: rawEmployees = [], loading: employeesLoading, refetch: refetchEmployees } = useApi('/employees');
  const [createdEmployees, setCreatedEmployees] = useState([]);

  // Transform backend employee shape to UI shape
  const employeesFromApi = [...(createdEmployees || []), ...(rawEmployees || [])];
  const employees = employeesFromApi.filter(
    (employee, index, allEmployees) =>
      allEmployees.findIndex((item) => item.user_id === employee.user_id) === index
  ).map((emp) => ({
    id: emp.user_id,
    name: emp.user_name,
    role: emp.role,
    branch: "Main store", // placeholder — no real backend support yet
    initials: emp.user_name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??",
  }));

  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [empFullName, setEmpFullName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empRole, setEmpRole] = useState("Cashier");
  const [empBranch, setEmpBranch] = useState("Buea");

  // 4. BRANCHES STATE & MODAL HANDLERS
  const [branches, setBranches] = useState([
    { id: 1, name: "Main store, Lekki", employeesCount: 8, openedYear: 2023, stockHealth: "Good", isSettingUp: false },
    { id: 2, name: "Ikeja branch", employeesCount: 6, openedYear: 2024, stockHealth: "3 low-stock", isSettingUp: false },
    { id: 3, name: "Yaba branch", employeesCount: 5, openedYear: 2024, stockHealth: "Good", isSettingUp: false },
    { id: 4, name: "Surulere - setting up", employeesCount: 0, openedYear: 2026, stockHealth: "", isSettingUp: true },
  ]);

  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");

  // 5. BILLING STATE (real API)
  const { data: billingData } = useApi('/billing/me');

  // NAVIGATION ITEMS FILTERED BASED ON ROLE CONSTRAINTS
  const allMenuItems = [
    { id: "analytics", label: "Analytics", icon: "📊", roles: ["Owner", "Inventory Monitor"] },
    { id: "employees", label: "Employees", icon: "👥", roles: ["Owner"] },
    { id: "branches", label: "Branches", icon: "🏪", roles: ["Owner", "Inventory Monitor"] },
    { id: "products", label: "Products", icon: "📦", roles: ["Owner", "Inventory Monitor"] },
    { id: "billing", label: "Billing", icon: "💳", roles: ["Owner"] },
  ];

  const visibleMenuItems = allMenuItems.filter((item) => item.roles.includes(userRole));

  // Switch tabs safely when changing role
  const handleRoleChange = (role) => {
    setUserRole(role);
    if (role === "Inventory Monitor" && (activeTab === "employees" || activeTab === "billing")) {
      setActiveTab("analytics");
    }
  };

  // Handlers
  const handleCreateProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProductName || !newProductCategory) return;

    try {
      const token = localStorage.getItem("digisol_token");
      if (!token) {
        throw new Error("Not authenticated. Please login again.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newProductName,
            categoryId: newProductCategory,
            priceOverride: 42,
            barcode: barcodeInput,
            sizes: selectedSizes,
            colors: selectedColors,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      }

      alert("Product created successfully!");
      
      // Close form and reset fields immediately
      setIsNewProductOpen(false);
      setNewProductName("");
      setNewProductCategory("");
      setSelectedSizes(["S", "M", "L"]);
      setSelectedColors(["Red", "Blue"]);
      setCustomSize("");
      setCustomColor("");
      setBarcodeInput("");

      // Refetch in the background and wait a moment for state to update
      try {
        const result = await refetchProducts();
        console.log("Products refetched successfully:", result);
      } catch (refetchErr) {
        console.error("Failed to refetch products:", refetchErr);
        // Still show success since product was created, just refetch failed
        alert("Product created but list may not update immediately. Please refresh the page.");
      }
    } catch (err) {
      alert(`Failed to create product: ${err.message}`);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("digisol_token");
      if (!token) throw new Error("Not authenticated. Please login again.");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: categoryName.trim(),
            basePrice: Number(categoryBasePrice),
            taxRate: Number(categoryTaxRate),
          }),
        }
      );

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || result.message || `HTTP ${response.status}`);
      }

      const createdCategory = result.category;
      setNewProductCategory(createdCategory.categ_id);
      setCategoryName("");
      setCategoryBasePrice("");
      setCategoryTaxRate("");
      setIsAddCategoryOpen(false);
      await refetchCategories();
      setIsNewProductOpen(true);
    } catch (err) {
      alert(`Failed to create category: ${err.message}`);
    }
  };

  const handleBulkUploadSubmit = async (e) => {
    e.preventDefault();
    const fileInput = fileInputRef.current;
    if (!fileInput?.files[0]) {
      alert("Please select a CSV file first.");
      return;
    }

    try {
      const token = localStorage.getItem("digisol_token");
      if (!token) throw new Error("Not authenticated. Please login again.");

      const formData = new FormData();
      formData.append("file", fileInput.files[0]);
      formData.append("categoryId", bulkCategory);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/products/bulk-upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || result.message || `HTTP ${response.status}`);
      }

      alert(`Bulk upload successful! ${result.count || ""} products created.`);
      setIsBulkUploadOpen(false);
      await refetchProducts();
    } catch (err) {
      alert(`Bulk upload failed: ${err.message}`);
    }
  };

  const toggleSize = (size) => {
    setSelectedSizes(
      selectedSizes.includes(size)
        ? selectedSizes.filter((s) => s !== size)
        : [...selectedSizes, size]
    );
  };

  const toggleColor = (color) => {
    setSelectedColors(
      selectedColors.includes(color)
        ? selectedColors.filter((c) => c !== color)
        : [...selectedColors, color]
    );
  };

  const addCustomSize = () => {
    const size = customSize.trim();
    if (!size || availableSizes.includes(size)) return;
    setAvailableSizes((currentSizes) => [...currentSizes, size]);
    setSelectedSizes((currentSizes) => [...currentSizes, size]);
    setCustomSize("");
  };

  const addCustomColor = () => {
    const color = customColor.trim();
    if (!color || availableColors.includes(color)) return;
    setAvailableColors((currentColors) => [...currentColors, color]);
    setSelectedColors((currentColors) => [...currentColors, color]);
    setCustomColor("");
  };

  const ROLE_TO_API = {
    Cashier: "CASHIER",
    "Security Guard": "SECURITY_GUARD",
    Stocker: "STOCKER",
    "Inventory Monitor": "INVENTORY_MONITOR",
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!empFullName || !empEmail) return;

    try {
      const { user, tempPassword } = await createEmployee({
        name: empFullName,
        email: empEmail,
        role: ROLE_TO_API[empRole],
      });

      alert(`Employee created. Temporary password: ${tempPassword}`);

      setCreatedEmployees((currentEmployees) => [user, ...currentEmployees]);
      
      // Close form and reset fields immediately
      setIsAddEmployeeOpen(false);
      setEmpFullName("");
      setEmpEmail("");
      setEmpRole("Cashier");
      setEmpBranch("Buea");

      // Refetch in the background and wait a moment for state to update
      try {
        const result = await refetchEmployees();
        console.log("Employees refetched successfully:", result);
      } catch (refetchErr) {
        console.error("Failed to refetch employees:", refetchErr);
        // Still show success since employee was created, just refetch failed
        alert("Employee created but list may not update immediately. Please refresh the page.");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddBranch = (e) => {
    e.preventDefault();
    if (!branchName) return;
    const newBranch = {
      id: Date.now(),
      name: branchName,
      employeesCount: 1,
      openedYear: 2026,
      stockHealth: "Good",
      isSettingUp: false,
    };
    setBranches([...branches, newBranch]);
    setIsAddBranchOpen(false);
    setBranchName("");
    setBranchAddress("");
  };

  const handleResetPin = (empName) => {
    alert(`PIN reset instructions sent for ${empName}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col justify-between">
      <div className="flex flex-1 flex-col md:flex-row">
        {/* SIDEBAR */}
        <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 p-6 flex flex-col shrink-0">
          {/* BRANDING HEADER */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-gray-100/80 border border-gray-300/60">
                <span className="w-3 h-3 rounded-full bg-[#2D6A4F] shadow-xs" />
                <span className="w-3 h-3 rounded-full bg-[#D35327] shadow-xs" />
              </div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                Shop<span className="text-[#52B788]">Ease</span>
              </h1>
            </div>
          </div>

  

          {/* NAVIGATION */}
          <nav className="space-y-1.5 flex flex-row md:flex-col overflow-x-auto md:overflow-visible pb-2 md:pb-0 gap-1 md:gap-0">
            {visibleMenuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/30"
                      : "text-gray-500 hover:bg-gray-100/60 hover:text-gray-900"
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        
          {/* ACCOUNT MENU - BOTTOM OF SIDEBAR */}
          <div className="mt-auto pt-6 border-t border-gray-200 relative">
            <button
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium rounded-xl text-gray-600 hover:bg-gray-100/60 hover:text-gray-900 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-[#2D6A4F] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {currentUser?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{currentUser?.name || "User"}</p>
                <p className="text-[10px] text-gray-500">{userRoleDisplay}</p>
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

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics Overview</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {userRole === "Owner"
                    ? "Real-time stats across all store branches."
                    : "Inventory & discrepancy overview (no revenue data)."}
                </p>
              </div>

              {/* STATS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* REVENUE CARD - OWNER ONLY */}
                {userRole === "Owner" && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-[#2D6A4F]" />
                    <span className="text-xs font-medium text-gray-500 block mb-1">Revenue (30d)</span>
                    <span className="text-3xl font-extrabold text-gray-900">${totalRevenue.toLocaleString()}</span>
                    <span className="text-[11px] text-[#52B788] font-semibold mt-2 block">All-time from sales</span>
                  </div>
                )}

                {/* LOW STOCK CARD */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-amber-500" />
                  <span className="text-xs font-medium text-gray-500 block mb-1">Low-stock items (1-5)</span>
                  <span className="text-3xl font-extrabold text-amber-400">{lowStockCount}</span>
                  <span className="text-[11px] text-gray-500 mt-2 block">Requires restocking soon</span>
                </div>

                {/* OUT OF STOCK CARD */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-red-500" />
                  <span className="text-xs font-medium text-gray-500 block mb-1">Out of stock</span>
                  <span className="text-3xl font-extrabold text-red-400">{outOfStockCount}</span>
                  <span className="text-[11px] text-red-400 mt-2 block">Urgent restocking needed</span>
                </div>

                {/* DISCREPANCY CARD */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />
                  <span className="text-xs font-medium text-gray-500 block mb-1">Discrepancy flags</span>
                  <span className="text-3xl font-extrabold text-rose-400">{discrepancyCount}</span>
                  <span className="text-[11px] text-rose-400 mt-2 block">Needs manager review</span>
                </div>
              </div>

              {/* REVENUE CHART CARD - OWNER ONLY */}
              {userRole === "Owner" && (revenueData?.revenue || []).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Monthly Revenue</h3>

                  <div className="h-44 flex items-end justify-between gap-4 pt-6 px-4 bg-gray-50/60 rounded-xl border border-gray-200/80">
                    {(() => {
                      const months = revenueData.revenue;
                      const maxRevenue = Math.max(...months.map((m) => Number(m.revenue || 0)), 1);
                      return months.map((m, i) => {
                        const height = Math.max((Number(m.revenue) / maxRevenue) * 100, 5);
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                            <div
                              className="w-full bg-gradient-to-t from-[#2D6A4F] to-[#52B788] rounded-t-lg shadow-xs hover:opacity-90 transition-all"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                        );
                      });
                    })()}
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 font-medium border-t border-gray-200 pt-3 px-2">
                    {(revenueData?.revenue || []).map((m, i) => (
                      <span key={i} className="flex-1 text-center">
                        {new Date(m.month).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* TABLE CARD - DISCREPANCY LOG */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4 overflow-x-auto">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Audit Flags & Discrepancy Log</h3>
                <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 font-medium">
                      <th className="py-2.5 font-semibold">Employee</th>
                      <th className="py-2.5 font-semibold">Role</th>
                      <th className="py-2.5 font-semibold">Flags</th>
                      <th className="py-2.5 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-gray-600">
                    {(flagsData?.flags || []).length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-6 text-center text-gray-400">No discrepancy flags recorded.</td>
                      </tr>
                    ) : (
                      (flagsData?.flags || []).map((flag) => (
                        <tr key={flag.user_id}>
                          <td className="py-3.5 font-semibold text-gray-900">{flag.user_name}</td>
                          <td className="py-3.5">{ROLE_DISPLAY_MAP[flag.role] || flag.role}</td>
                          <td className="py-3.5 font-semibold text-rose-400">{flag.discrepancy_count}</td>
                          <td className="py-3.5 text-right">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              Flagged
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EMPLOYEES TAB (OWNER ONLY) */}
          {activeTab === "employees" && userRole === "Owner" && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Team Members</h2>
                  <p className="text-xs text-gray-500 mt-1">Manage personnel roles and branch assignments.</p>
                </div>

                <button
                  onClick={() => setIsAddEmployeeOpen(true)}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-[#D35327] hover:bg-[#B8421B] rounded-xl transition shadow-md shadow-[#D35327]/30 flex items-center gap-1.5"
                >
                  <span>+</span> Add employee
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[550px]">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 font-medium">
                      <th className="py-3 px-2 font-semibold">Name</th>
                      <th className="py-3 px-2 font-semibold">Role</th>
                      <th className="py-3 px-2 font-semibold">Branch</th>
                      <th className="py-3 px-2 font-semibold text-right">PIN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-gray-600">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-gray-100/40 transition-colors">
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#2D6A4F] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                              {emp.initials}
                            </div>
                            <span className="font-semibold text-gray-900">{emp.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-300">
                            {emp.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-gray-500">{emp.branch}</td>
                        <td className="py-3.5 px-2 text-right">
                          <button
                            onClick={() => handleResetPin(emp.name)}
                            className="text-[#52B788] hover:text-[#74c69d] font-semibold hover:underline"
                          >
                            Reset
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BRANCHES TAB */}
          {activeTab === "branches" && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Store Branches</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {userRole === "Owner"
                      ? "Monitor operational status across locations."
                      : "View branch stock health status (View only)."}
                  </p>
                </div>

                {/* NO ADD BRANCH FOR INVENTORY MONITOR */}
                {userRole === "Owner" && (
                  <button
                    onClick={() => setIsAddBranchOpen(true)}
                    className="px-4 py-2.5 text-xs font-semibold text-white bg-[#D35327] hover:bg-[#B8421B] rounded-xl transition shadow-md shadow-[#D35327]/30 flex items-center gap-1.5"
                  >
                    <span>+</span> Add branch
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {branches.map((b) => {
                  if (b.isSettingUp) {
                    return (
                      <div
                        key={b.id}
                        className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex items-center justify-center min-h-[130px] bg-gray-50/40 text-gray-400 text-xs font-medium"
                      >
                        ✨ {b.name}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={b.id}
                      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[130px] space-y-4 hover:border-[#2D6A4F]/60 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base font-bold text-gray-900">{b.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {b.employeesCount} staff members • Opened {b.openedYear}
                          </p>
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#52B788]" />
                      </div>

                      <div className="flex justify-between items-center text-xs border-t border-gray-200 pt-3">
                        <span className="text-gray-400 font-medium">Stock health</span>
                        <span
                          className={`font-semibold px-2.5 py-0.5 rounded-full text-[10px] ${
                            b.stockHealth.includes("low")
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {b.stockHealth}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === "products" && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Product Catalog</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {userRole === "Owner"
                      ? "Manage inventory, categories, and SKU variants."
                      : "View stock levels and inventory status (No product creation or pricing edits)."}
                  </p>
                </div>

                {/* NO NEW PRODUCT OR BULK UPLOAD FOR INVENTORY MONITOR */}
                {userRole === "Owner" && (
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setIsAddCategoryOpen(true)}
                      className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-300 bg-gray-100/80 hover:bg-gray-100 rounded-xl transition shadow-xs"
                    >
                      + Category
                    </button>
                    <button
                      onClick={() => setIsBulkUploadOpen(true)}
                      className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-300 bg-gray-100/80 hover:bg-gray-100 rounded-xl transition shadow-xs"
                                      >
                      Bulk upload
                    </button>
                    <button
                      onClick={() => setIsNewProductOpen(true)}
                      className="px-4 py-2.5 text-xs font-semibold text-white bg-[#D35327] hover:bg-[#B8421B] rounded-xl transition shadow-md shadow-[#D35327]/30"
                    >
                      + New product
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
                {/* CATEGORY FILTERS */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {["All", ...categoryOptions.map((category) => category.name)].map((cat) => {
                    const isSelected = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                          isSelected
                            ? "bg-[#2D6A4F] text-white shadow-xs"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-500"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                    <thead>
                      <tr className="text-gray-400 font-medium border-b border-gray-200 pb-3">
                        <th className="pb-3 font-semibold">Product</th>
                        <th className="pb-3 font-semibold">Category</th>
                        <th className="pb-3 font-semibold">Variants</th>
                        <th className="pb-3 font-semibold">Price</th>
                        <th className="pb-3 font-semibold text-right">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-gray-600">
                      {(transformedProducts || []).filter((p) =>
                        activeCategory === "All" || p.category === activeCategory
                      ).map((p) => (
                        <tr key={p.id} className="hover:bg-gray-100/40 transition-colors">
                          <td className="py-4 font-semibold text-gray-900">{p.name}</td>
                          <td className="py-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-300">
                              {p.category}
                            </span>
                          </td>
                          <td className="py-4 text-gray-500">{p.variants} SKUs</td>
                          <td className="py-4 font-semibold text-gray-900">${p.price}</td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-gray-600">{p.stockQuantity}</span>
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                                  p.stock === "Out of stock"
                                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                    : p.stock === "Low stock"
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                }`}
                              >
                                {p.stock}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* BILLING TAB (OWNER ONLY) */}
          {activeTab === "billing" && userRole === "Owner" && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Subscription & Billing</h2>
                <p className="text-xs text-gray-500 mt-1">Manage plan tier and download past invoices.</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-8">
                {/* PLAN DETAILS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gray-50/80 rounded-xl border border-gray-200">
                  <div>
                    <span className="text-[10px] font-bold text-[#52B788] uppercase tracking-wider block mb-1">Active Subscription</span>
                    <h3 className="text-base font-bold text-gray-900">
                      {billingData?.subscription?.plan_name || "No plan"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ${billingData?.subscription?.monthly_price || "0"}/month · Status: {billingData?.subscription?.status || "N/A"}
                    </p>
                  </div>
                  <button
                    onClick={() => alert("Upgrade plan clicked")}
                    className="px-4 py-2.5 text-xs font-semibold text-white bg-[#2D6A4F] hover:bg-[#23533e] rounded-xl transition shadow-xs shrink-0"
                  >
                    Upgrade plan
                  </button>
                </div>

                {/* INVOICES */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Invoice History</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="text-gray-400 font-medium border-b border-gray-200 pb-3">
                          <th className="pb-3 font-semibold">Invoice</th>
                          <th className="pb-3 font-semibold">Billed</th>
                          <th className="pb-3 font-semibold">Paid</th>
                          <th className="pb-3 font-semibold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-gray-600">
                        {(billingData?.invoices || []).length === 0 ? (
                          <tr>
                            <td colSpan="4" className="py-6 text-center text-gray-400">No invoices yet.</td>
                          </tr>
                        ) : (
                          (billingData?.invoices || []).map((inv) => (
                            <tr key={inv.id}>
                              <td className="py-3.5 font-semibold text-gray-900">INV-{String(inv.id).padStart(4, "0")}</td>
                              <td className="py-3.5 text-gray-500">{inv.billed_at ? new Date(inv.billed_at).toLocaleDateString() : "—"}</td>
                              <td className="py-3.5 text-gray-500">{inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : "—"}</td>
                              <td className="py-3.5 text-right">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                                  inv.status === "PAID"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                }`}>
                                  {inv.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>


      {/* MODAL: ADD CATEGORY */}
      {isAddCategoryOpen && userRole === "Owner" && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">Add Category</h3>
              <button
                type="button"
                onClick={() => setIsAddCategoryOpen(false)}
                className="text-gray-500 hover:text-gray-900 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category name</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Dresses"
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Base price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={categoryBasePrice}
                  onChange={(e) => setCategoryBasePrice(e.target.value)}
                  placeholder="e.g. 42"
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tax rate</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={categoryTaxRate}
                  onChange={(e) => setCategoryTaxRate(e.target.value)}
                  placeholder="e.g. 0.1"
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#D35327] hover:bg-[#B8421B] rounded-xl transition shadow-md shadow-[#D35327]/30"
                >
                  Save category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BULK UPLOAD */}
      {isBulkUploadOpen && userRole === "Owner" && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-lg p-6 md:p-8 space-y-6 my-8">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">Bulk Upload Products</h3>
              <button
                onClick={() => setIsBulkUploadOpen(false)}
                className="text-gray-500 hover:text-gray-900 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBulkUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Target category</label>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/50 text-gray-900"
                >
                  {categoryOptions.map((c) => (
                    <option key={c.categ_id} value={c.categ_id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition cursor-pointer space-y-2"
              >
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) setUploadedFileName(`${f.name} · Selected`);
                  }}
                />
                <p className="font-semibold text-xs text-gray-900">Click to upload or drag & drop CSV</p>
                <p className="text-[11px] text-gray-400">CSV file with name, price, stock columns</p>
              </div>

              {uploadedFileName && (
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs">
                  <span className="text-slate-200 font-semibold">{uploadedFileName}</span>
                  <button
                    type="button"
                    onClick={() => setUploadedFileName("")}
                    className="text-xs text-rose-400 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="flex justify-end items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkUploadOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#D35327] hover:bg-[#B8421B] rounded-xl transition shadow-md shadow-[#D35327]/30"
                >
                  Upload & validate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD BRANCH */}
      {isAddBranchOpen && userRole === "Owner" && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">Add New Branch</h3>
              <button onClick={() => setIsAddBranchOpen(false)} className="text-gray-500 hover:text-gray-900 text-base font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBranch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Branch name</label>
                <input
                  type="text"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g. Surulere branch"
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/50 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
                <input
                  type="text"
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  placeholder="Street, city, state"
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/50 text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBranchOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#D35327] hover:bg-[#B8421B] rounded-xl transition shadow-md shadow-[#D35327]/30"
                >
                  Add branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD EMPLOYEE */}
      {isAddEmployeeOpen && userRole === "Owner" && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">Add Team Member</h3>
              <button onClick={() => setIsAddEmployeeOpen(false)} className="text-gray-500 hover:text-gray-900 text-base font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full nam</label>
                <input
                  type="text"
                  required
                  value={empFullName}
                  onChange={(e) => setEmpFullName(e.target.value)}
                  placeholder="e.g. Jane Musa"
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/50 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  placeholder="name@shopease.com"
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/50 text-gray-900"
                />
              </div>
           <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Role
                </label>
                <select
                  value={empRole}
                  onChange={(e) => setEmpRole(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/50 text-gray-900"
                >
                  <option value="Cashier">Cashier</option>
                  <option value="Security Guard">Security Guard</option>
                  <option value="Stocker">Stocker</option>
                  <option value="Inventory Monitor">Inventory Monitor</option>
                </select>
              </div>

                <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Branch
                </label>
                <select
                  value={empBranch}
                  onChange={(e) => setEmpBranch(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/50 text-gray-900"
                >
                  <option value="Buea">Buea</option>
                  <option value="Douala">Douala</option>
                </select>
              </div>
              <div></div>


              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#D35327] hover:bg-[#B8421B] rounded-xl transition shadow-md shadow-[#D35327]/30"
                >
                  Add employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW PRODUCT */}
      {isNewProductOpen && userRole === "Owner" && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-lg p-6 md:p-8 space-y-6 my-8">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">Add New Product</h3>
              <button
                onClick={() => setIsNewProductOpen(false)}
                className="text-gray-500 hover:text-gray-900 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Barcode</label>
                <input
                  type="text"
                  required
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="e.g. 8901234567890"
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/50 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Product name</label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="e.g. Summer Dress"
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/50 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
                <select
                  required
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/50 text-gray-900"
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map((c) => (
                    <option key={c.categ_id} value={c.categ_id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-3">Sizes</label>
                <div className="flex gap-2 flex-wrap">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                        selectedSizes.includes(size)
                          ? "bg-[#2D6A4F] text-white shadow-xs"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSize())}
                    placeholder="Add another size"
                    className="flex-1 text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900"
                  />
                  <button type="button" onClick={addCustomSize} className="px-3 py-2 text-xs font-semibold text-white bg-[#2D6A4F] rounded-xl">
                    + size
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-3">Colors</label>
                <div className="flex gap-2 flex-wrap">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleColor(color)}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                        selectedColors.includes(color)
                          ? "bg-[#2D6A4F] text-white shadow-xs"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomColor())}
                    placeholder="Add another color"
                    className="flex-1 text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900"
                  />
                  <button type="button" onClick={addCustomColor} className="px-3 py-2 text-xs font-semibold text-white bg-[#2D6A4F] rounded-xl">
                    + color
                  </button>
                </div>
              </div>

              <div className="flex justify-end items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProductOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#D35327] hover:bg-[#B8421B] rounded-xl transition shadow-md shadow-[#D35327]/30"
                >
                  Create product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="w-full py-4 text-center text-gray-400 text-xs border-t border-gray-200 bg-white">
        ©️ 2026 ShopEase. All rights reserved.
      </footer>
    </div>
  );
  }