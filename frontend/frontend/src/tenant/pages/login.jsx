import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.jpeg';
import { login } from '../../js/api/auth.api.js';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');       // NEW — holds a real error message from the backend
  const [isSubmitting, setIsSubmitting] = useState(false); // NEW — disables the button while the request is in flight

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const { user } = await login(email, password); // real call to POST /auth/login

      // Route based on what the backend actually says about this user,
      // not a hardcoded destination.
      if (user.mustResetPassword) {
        navigate('/change-password');
      } else {
        navigate('/tenant/dashboard');
      }
    } catch (err) {
      setError(err.message); // e.g. "Invalid email or password"
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="ShopEase" className="h-16 w-auto rounded-lg p-1 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Login to your ShopEase account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-[#D35327]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-3 pr-10 text-gray-900 outline-none focus:ring-2 focus:ring-[#D35327]"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.604-1.914A3.12 3.12 0 0115 12c0 .886-.312 1.7-.823 2.334m-8.36-9.337l11.314 11.314M21 12a9.981 9.981 0 01-8.775 9.748" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[#D35327] text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#D35327] hover:bg-[#B8421B] text-white disabled:opacity-50 rounded-lg py-3 font-semibold transition"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-5 text-gray-500 hover:text-[#D35327] text-sm"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}