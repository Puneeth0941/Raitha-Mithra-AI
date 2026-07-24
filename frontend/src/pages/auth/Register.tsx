import { useState } from "react";
import { registerUser } from "../../services/authService";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      setLoading(true);
      await registerUser(formData);
      setSuccessMsg("Registration Successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || "Registration Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-md border border-green-100">

        <h1 className="text-3xl font-extrabold text-center text-green-800">
          🌾 Create Account
        </h1>

        <p className="text-center text-gray-500 text-sm mt-1">
          Join Raitha Mithra AI
        </p>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
            {successMsg}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 mt-6"
        >

          <div>
            <label className="block mb-1 text-xs font-bold text-gray-700 uppercase">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter Full Name"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-bold text-gray-700 uppercase">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-bold text-gray-700 uppercase">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-bold text-gray-700 uppercase">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              placeholder="Enter Phone Number"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition shadow"
          >
            {loading ? "Registering..." : "Register"}
          </button>

        </form>

        <p className="text-center mt-5 text-xs text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-700 font-bold hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;