import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="bg-[#e7ebed]/80 border-b border-gray-300/80 px-4 sm:px-8 py-3.5 flex items-center justify-between backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="bg-[#1b4332] text-white font-bold text-base px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-2xs">
          <span className="bg-[#005f40] px-1.5 py-0.5 rounded text-xs">ShopEase</span>
          <span>ShopEase</span>
        </Link>

        {/* Navigation - Checkout & Catalog removed */}
        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
              location.pathname === '/' ? 'bg-black/10 text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Home
          </Link>
        </nav>
      </div>

      {/* Right side - Orange login removed, Tenant View selector retained */}
      <div className="flex items-center gap-3">
        <select className="bg-[#d6dcde] border border-gray-300/80 rounded-xl text-xs sm:text-sm font-medium px-3 py-1.5 text-gray-800 outline-none cursor-pointer">
          <option value="Tenant View">Tenant View</option>
          <option value="Developer View">Developer View</option>
        </select>
      </div>
    </header>
  );
}