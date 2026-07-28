import { useEffect, useState, useRef } from "react";
import {
  FaBell,
  FaUserCircle,
  FaCloudSun,
  FaRobot,
  FaChartLine,
  FaCheck,
  FaTrash,
  FaTimes,
  FaCheckDouble,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { getProfile } from "../../services/profileService";
import type { ProfileData } from "../../services/profileService";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../../services/notificationService";
import type { NotificationData } from "../../services/notificationService";

function Navbar() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // Notification States
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUserNotifications = async () => {
    try {
      const list = await getNotifications();
      setNotifications(list);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {});
    fetchUserNotifications();

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = Array.isArray(notifications)
  ? notifications.filter((n) => !n.is_read).length
  : 0;

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      fetchUserNotifications();
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear notifications", err);
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes("weather")) {
      return <FaCloudSun className="text-sky-600 text-lg" />;
    }
    if (category.toLowerCase().includes("market")) {
      return <FaChartLine className="text-amber-600 text-lg" />;
    }
    return <FaRobot className="text-emerald-600 text-lg" />;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200">
            HIGH
          </span>
        );
      case "medium":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 border border-amber-200">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
            LOW
          </span>
        );
    }
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="bg-white shadow-sm border-b px-8 py-5 flex items-center justify-between relative z-40">
      {/* Left Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, {user?.name || profile?.name || "Farmer"} 👋
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Date */}
        <div className="text-sm font-medium text-gray-500 hidden sm:block">
          {today}
        </div>

        {/* Notification Bell & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleToggle}
            aria-label="Notifications"
            className="relative bg-gray-100 p-3 rounded-full hover:bg-green-100 transition focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <FaBell className="text-xl text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Dropdown Header */}
              <div className="bg-gradient-to-r from-green-800 to-emerald-700 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base">Smart Agriculture Alerts</h3>
                  {unreadCount > 0 && (
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-green-100 hover:text-white transition"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Toolbar Actions */}
              {notifications.length > 0 && (
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between text-xs text-gray-600 font-medium">
                  {unreadCount > 0 ? (
                    <button
                      onClick={handleMarkAllRead}
                      className="hover:text-green-700 flex items-center gap-1 transition"
                    >
                      <FaCheckDouble className="text-green-600" /> Mark all read
                    </button>
                  ) : (
                    <span>All notifications read</span>
                  )}
                  <button
                    onClick={handleClearAll}
                    className="hover:text-red-600 flex items-center gap-1 transition"
                  >
                    <FaTrash className="text-red-500" /> Clear all
                  </button>
                </div>
              )}

              {/* Notification List */}
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <p className="text-3xl mb-2">🔔</p>
                    <p className="font-semibold text-gray-600 text-sm">No new notifications.</p>
                    <p className="text-xs text-gray-400 mt-1">
                      You are all caught up with farming alerts!
                    </p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 transition flex gap-3 items-start ${
                        item.is_read ? "bg-white opacity-75" : "bg-green-50/40"
                      } hover:bg-gray-50`}
                    >
                      {/* Icon */}
                      <div className="p-2.5 rounded-xl bg-gray-100 shrink-0 mt-0.5">
                        {getCategoryIcon(item.category)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            {item.category}
                          </span>
                          {getPriorityBadge(item.priority)}
                        </div>

                        <h4
                          className={`text-sm ${
                            item.is_read ? "font-medium text-gray-700" : "font-bold text-gray-900"
                          }`}
                        >
                          {item.title}
                        </h4>

                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-1">
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(item.created_at).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          <div className="flex items-center gap-2">
                            {!item.is_read && (
                              <button
                                onClick={() => handleMarkRead(item.id)}
                                title="Mark as read"
                                className="text-xs text-green-700 hover:text-green-800 font-semibold flex items-center gap-1 bg-green-100 hover:bg-green-200 px-2 py-0.5 rounded-md transition"
                              >
                                <FaCheck /> Read
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(item.id)}
                              title="Delete notification"
                              className="text-gray-400 hover:text-red-600 text-xs p-1 transition"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          {profile?.profile_photo ? (
            <img
              src={profile.profile_photo}
              alt={user?.name || profile.name}
              className="w-10 h-10 rounded-full object-cover border border-green-500"
            />
          ) : (
            <FaUserCircle className="text-4xl text-green-600" />
          )}

          <div>
            <h3 className="font-semibold">{user?.name || profile?.name || "Farmer"}</h3>
            <p className="text-xs text-gray-500">{user?.email || "Logged in"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;