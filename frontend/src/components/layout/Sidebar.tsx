import {
  FaHome,
  FaSeedling,
  FaMoneyBillWave,
  FaWallet,
  FaTasks,
  FaCloudSun,
  FaRobot,
  FaChartLine,
  FaFileAlt,
  FaReceipt,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
  { name: "Farm", icon: <FaSeedling />, path: "/farm" },
  { name: "Income", icon: <FaMoneyBillWave />, path: "/income" },
  { name: "Expense", icon: <FaWallet />, path: "/expense" },
  { name: "Activities", icon: <FaTasks />, path: "/activity" },
  { name: "Weather", icon: <FaCloudSun />, path: "/weather" },
  { name: "AI Assistant", icon: <FaRobot />, path: "/ai" },
  { name: "Market", icon: <FaChartLine />, path: "/market" },
  { name: "Reports", icon: <FaFileAlt />, path: "/reports" },
  { name: "Bills", icon: <FaReceipt />, path: "/bills" },
];

function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-72 bg-green-800 text-white flex flex-col h-screen shadow-xl">

      {/* Logo */}
      <div className="p-6 border-b border-green-700">
        <h1 className="text-3xl font-bold">
          🌾 Raitha Mithra AI
        </h1>

        <p className="text-green-200 text-sm mt-2">
          Smart Farming Assistant
        </p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">

        <ul className="space-y-2">

          {menuItems.map((item) => (

            <li key={item.name}>

              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-white text-green-800 font-semibold"
                      : "hover:bg-green-700"
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>

                <span>{item.name}</span>

              </NavLink>

            </li>

          ))}

        </ul>

      </nav>

      {/* Bottom */}
      <div className="border-t border-green-700 p-4 space-y-2">

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${
              isActive ? "bg-white text-green-800 font-semibold" : "hover:bg-green-700 text-white"
            }`
          }
        >
          <FaUser />
          Profile
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-600 transition"
        >
          <FaSignOutAlt />
          Logout
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;