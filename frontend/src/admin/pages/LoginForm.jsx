import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpeg";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/admin/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      localStorage.setItem("digisol_admin_token", data.token);
      localStorage.setItem("digisol_admin", JSON.stringify(data.admin));
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. HANDLES FORGOT PASSWORD SUBMIT
  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSent(true);
  };

  const closeForgotModal = () => {
    setIsForgotOpen(false);
    setResetSent(false);
    setResetEmail("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      {/* CARD CONTAINER */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-2xl space-y-6">
        
        {/* LOGO & BRANDING */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center space-x-3">
                      <img src={logo} alt="ShopEase" className="h-10 w-auto rounded-lg bg-white p-1" />
                    </div>
          </div>
          
          <h2 className="text-lg font-medium text-gray-600 mt-2">
            Welcome
          </h2>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 text-xs text-rose-400 font-medium text-center">
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* EMAIL FIELD */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@store.com"
              className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/60 text-gray-900 placeholder-gray-400 transition"
            />
          </div>

          {/* PASSWORD FIELD */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/60 text-gray-900 placeholder-gray-400 transition"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 text-sm font-semibold text-white bg-[#D35327] hover:bg-[#B8421B] rounded-xl transition shadow-lg shadow-[#D35327]/30 mt-2 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        {/* FORGOT PASSWORD BUTTON */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setIsForgotOpen(true)}
            className="text-xs font-medium text-gray-500 hover:text-[#52B788] transition cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

      </div>

      {/* FORGOT PASSWORD MODAL */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-sm p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">Reset Password</h3>
              <button
                type="button"
                onClick={closeForgotModal}
                className="text-gray-500 hover:text-gray-900 text-base font-bold"
              >
                ✕
              </button>
            </div>

            {resetSent ? (
              <div className="space-y-4 text-center py-2">
                <div className="w-10 h-10 rounded-full bg-[#2D6A4F]/20 text-[#52B788] border border-[#2D6A4F]/40 flex items-center justify-center mx-auto text-lg font-bold">
                  ✓
                </div>
                <p className="text-xs text-gray-600">
                  Password reset link sent to <span className="font-semibold text-gray-900">{resetEmail}</span>.
                </p>
                <button
                  type="button"
                  onClick={closeForgotModal}
                  className="w-full py-2.5 text-xs font-semibold text-white bg-[#2D6A4F] hover:bg-[#23533e] rounded-xl transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <p className="text-xs text-gray-500">
                  Enter your account email and we'll send instructions to reset your password.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@store.com"
                    className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/50 text-gray-900"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={closeForgotModal}
                    className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#D35327] hover:bg-[#B8421B] rounded-xl transition shadow-md shadow-[#D35327]/30"
                  >
                    Send link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}