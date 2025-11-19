import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../shared-components/Navbar";
import Footer from "../shared-components/Footer";

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated on component mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch("/api/admin/verify", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (data.isAdmin) {
          setIsAuthenticated(true);
        } else {
          // Redirect to login if not authenticated
          navigate("/admin/login");
        }
      } catch (err) {
        console.error("Auth verification error:", err);
        navigate("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/admin/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-warmscale-7 min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center min-h-[68vh]">
          <div className="text-white text-xl">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="bg-warmscale-7 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 min-h-[68vh]">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-white text-4xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Season Card Manager Tool */}
          <div className="bg-warmscale-6 p-6 rounded-lg shadow-lg border border-warmscale-5">
            <h2 className="text-white text-2xl font-bold mb-3">
              Season Card Manager
            </h2>
            <p className="text-warmscale-2 mb-4">
              Generate and manage player cards for seasons. Pick colors, randomize backgrounds, and upload to S3.
            </p>
            <button
              onClick={() => navigate("/admin/season-cards")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold transition-colors"
            >
              Open Card Manager
            </button>
          </div>

          {/* Badge Manager Tool */}
          <div className="bg-warmscale-6 p-6 rounded-lg shadow-lg border border-warmscale-5">
            <h2 className="text-white text-2xl font-bold mb-3">
              Badge Manager
            </h2>
            <p className="text-warmscale-2 mb-4">
              Manage player badges and achievements.
            </p>
            <button
              onClick={() => navigate("/admin-badge")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold transition-colors"
            >
              Open Badge Manager
            </button>
          </div>

          {/* Season Management Tool */}
          <div className="bg-warmscale-6 p-6 rounded-lg shadow-lg border border-warmscale-5">
            <h2 className="text-white text-2xl font-bold mb-3">
              Season Management
            </h2>
            <p className="text-warmscale-2 mb-4">
              Add, edit, and manage seasons for RGL and OZF leagues. Mark seasons as active or inactive.
            </p>
            <button
              onClick={() => navigate("/admin/season-management")}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold transition-colors"
            >
              Manage Seasons
            </button>
          </div>

          {/* Add more admin tools here as they are developed */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
