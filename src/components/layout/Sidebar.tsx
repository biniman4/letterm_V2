import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboardIcon,
  MailPlusIcon,
  InboxIcon,
  ArchiveIcon,
  BellIcon,
  UsersIcon,
  SettingsIcon,
  MenuIcon,
  XIcon,
  ShieldIcon,
  ChevronsLeft,
  ChevronsRight,
  SendIcon,
} from "lucide-react";
import { useLanguage } from "../../components/pages/LanguageContext";

const navItems = [
  { icon: LayoutDashboardIcon, labelKey: "dashboard", path: "/dashboard" },
  { icon: MailPlusIcon, labelKey: "newLetter", path: "/new-letter" },
  { icon: InboxIcon, labelKey: "inbox", path: "/inbox" },
  { icon: SendIcon, labelKey: "sent", path: "/sent" },
  { icon: BellIcon, labelKey: "notifications", path: "/notifications" },
  { icon: SettingsIcon, labelKey: "settings", path: "/settings" },
];

const adminItems = [{ icon: ShieldIcon, labelKey: "adminPanel", path: "/admin" }];

export const Sidebar = ({
  isAdmin = false,
  isOpen,
  setIsOpen,
}: {
  isAdmin?: boolean;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = useLanguage();
  const items = isAdmin ? [...navItems, ...adminItems] : navItems;

  return (
    <>
      {/* Fixed Top Toggle Button for Mobile */}
      <div className="fixed top-0 left-0 w-full bg-white border-b md:hidden z-50 flex items-center justify-between p-4">
        <h1 className="text-xl font-semibold text-main-text">{t.sidebar.letterFlow}</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="text-main-text">
          {isOpen ? (
            <XIcon className="w-6 h-6" />
          ) : (
            <MenuIcon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
      className={`fixed z-40 bg-white transform transition-transform duration-300 ease-in-out
      top-16 h-[calc(100vh-64px)] /* Mobile: always positioned below header and takes remaining height */
      ${isOpen ? "translate-x-0 w-80" : "translate-x-0 w-12"} /* Mobile width: open 80, closed 12 */
      md:translate-x-0 md:static md:block md:h-screen /* Desktop: always visible, static, full height */
      ${isOpen ? "md:w-64" : "md:w-20"} /* Desktop width: open 64, closed 20 */
      `}
      >
        <div className="h-full border-r-2 border-gray-300 rounded-tr-[32px] rounded-br-[32px] relative">
          {/* Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="absolute -right-3 top-8 bg-white rounded-full p-1.5 border-2 border-gray-300 cursor-pointer hover:bg-gray-50"
          >
            {isOpen ? <ChevronsLeft size={16} /> : <ChevronsRight size={16} />}
          </button>

          {/* Logo Section */}
          <div className="px-5 py-4">
            <h1
              className={`text-2xl font-bold text-main-text transition-all ${
                !isOpen && "scale-0"
              }`}
            >
              {t.sidebar.letterFlow}
            </h1>
          </div>

          {/* Navigation Container */}
          <div className="flex flex-col h-[calc(100vh-64px)] pb-6 sm:pb-8">
            {/* Navigation Items */}
            <nav className={`px-2 py-6 flex flex-col ${isOpen ? 'space-y-3' : 'space-y-1'}`}>
              {items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => {
                    const iconColorClasses = isActive
                      ? "text-hover-gold"
                      : "text-main-text group-hover:text-hover-gold";

                    return `flex items-center rounded-md text-[16px] transition-all group
                    ${isOpen ? "w-full gap-8 px-4 py-2.5" : "justify-center py-2.5"}
                    ${
                      isActive
                        ? "bg-active-bg-dark font-medium text-hover-gold"
                        : "text-main-text hover:bg-gray-50 hover:text-hover-gold"
                    } transition-transform duration-200 hover:scale-[1.04]`;
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon 
                        className={`w-[22px] h-[22px] flex-shrink-0 ${
                          isActive ? "text-hover-gold" : "text-main-text group-hover:text-hover-gold"
                        }`} 
                      />
                      {isOpen && (
                        <span className="flex-grow truncate">
                          {t.sidebar[item.labelKey as keyof typeof t.sidebar]}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
            {/* Spacer to push content to top */}
            <div className="flex-grow"></div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden z-30"
        />
      )}
    </>
  );
};
