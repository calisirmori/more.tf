import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../shared-components/Navbar";
import Footer from "../shared-components/Footer";

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to admin dashboard on successful login
        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Invalid password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-warmscale-7 min-h-screen">
      <Navbar />
      <div className="flex justify-center items-center min-h-[68vh]">
        <div className="bg-warmscale-6 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-white text-3xl font-bold text-center mb-6">
            Admin Portal
          </h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-white text-sm font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-warmscale-5 rounded bg-warmscale-8 text-white focus:outline-none focus:border-orange-500"
                placeholder="Enter admin password"
                required
                autoFocus
              />
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-200 text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded font-semibold transition-colors ${
                isLoading
                  ? "bg-warmscale-5 text-warmscale-3 cursor-not-allowed"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLogin;
