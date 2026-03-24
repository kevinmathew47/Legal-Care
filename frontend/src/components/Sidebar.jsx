import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaFileAlt,
  FaFileSignature,
  FaRobot,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaBalanceScale,
} from "react-icons/fa";

const Sidebar = ({ onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    onLogout();
    navigate("/auth");
  };

  const menuItems = [
    { path: "/home", label: "Home", icon: <FaHome /> },
    {
      path: "/document-drafter",
      label: "Document Drafter",
      icon: <FaFileAlt />,
    },
    {
      path: "/document-analyser",
      label: "Document Analyser",
      icon: <FaFileSignature />,
    },
    { path: "/chatbot", label: "Legal Chatbot", icon: <FaRobot /> },
    // { path: '/law-lookup', label: 'Legal Lookup', icon: <FaSearch /> },
  ];

  return (
    <div
      className={`flex flex-col h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transition-all duration-300 ease-in-out relative ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Premium accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

      {/* Logo/Brand Section */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <FaBalanceScale className="text-white text-xl" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-white font-bold text-lg tracking-tight">
                Legal Care
              </h1>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-grow overflow-y-auto overflow-x-hidden px-3 py-6 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
              } ${isCollapsed ? "px-4 py-3 justify-center" : "px-4 py-3"}`}
            >
              <div
                className={`text-xl ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-white"
                } transition-colors`}
              >
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className="ml-4 font-medium text-sm whitespace-nowrap">
                  {item.label}
                </span>
              )}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-2 h-2 rounded-full bg-white shadow-lg"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-slate-700/50 p-3 space-y-2">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`group flex items-center w-full rounded-xl px-4 py-3 text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <FaSignOutAlt className="text-lg group-hover:scale-110 transition-transform" />
          {!isCollapsed && (
            <span className="ml-4 font-medium text-sm">Logout</span>
          )}
        </button>

        <button
          onClick={handleToggle}
          className={`group flex items-center w-full rounded-xl px-4 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all duration-200 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          {isCollapsed ? (
            <FaChevronRight className="text-lg group-hover:translate-x-0.5 transition-transform" />
          ) : (
            <>
              <FaChevronLeft className="text-lg group-hover:-translate-x-0.5 transition-transform" />
              <span className="ml-4 font-medium text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* Premium badge */}
      {!isCollapsed && <div className="px-6 pb-6"></div>}
    </div>
  );
};

export default Sidebar;
