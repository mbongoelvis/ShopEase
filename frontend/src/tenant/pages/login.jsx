import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.jpeg';
import { login } from '../../js/api/auth.api.js';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-lg bg-gray-50 border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-[#D35327]"
              placeholder="Enter your password"
            />
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