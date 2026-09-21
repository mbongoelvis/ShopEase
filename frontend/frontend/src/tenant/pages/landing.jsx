import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.jpeg';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
      {/* Header */}
      <header className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="ShopEase" className="h-10 w-auto rounded-lg" />
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-900">
          Streamline Your Shopping Experience with <span className="text-[#D35327]">ShopEase</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-2xl">
          Discover high-quality items, add products directly to your cart, and enjoy seamless offline-ready checkout in one click.
        </p>

        {/* Orange Login Button */}
        <button
          onClick={() => navigate('auth/login')}
          className="bg-[#D35327] hover:bg-[#B8421B] text-white font-semibold text-lg px-8 py-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          Login
        </button>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 text-sm">
        © 2026 ShopEase. All rights reserved.
      </footer>
    </div>
  );
}
