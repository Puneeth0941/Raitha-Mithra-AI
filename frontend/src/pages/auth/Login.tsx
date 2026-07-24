import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      setLoading(true);
      const data = await loginUser({
        email,
        password,
      });

      if (data && data.access_token) {
        login(data.access_token);
        navigate("/dashboard");
      } else {
        setErrorMsg("Failed to obtain authentication token.");
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      setErrorMsg(
        error.response?.data?.detail || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-3xl p-8 border border-green-100">

        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-green-800 flex items-center justify-center gap-2">
            🌾 Raitha Mithra AI
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Smart Agriculture Decision Support System
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block mb-1 text-xs font-bold text-gray-700 uppercase">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter Email"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-xs font-bold text-gray-700 uppercase">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter Password"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition shadow"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* Register Link */}
        <p className="text-center mt-6 text-xs text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-green-700 font-bold hover:underline"
          >
            Register New Account
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;