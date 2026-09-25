'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, FileText, Upload, GraduationCap, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  const pathName = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const authNavItems = [
    { label: "Documents", href: "/documents", icon: FileText },
    { label: "Upload", href: "/upload", icon: Upload },
  ];

  return (
    <header className="w-full fixed top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            href={isAuthenticated ? "/documents" : "/"}
            className="flex items-center gap-2.5 group select-none"
          >
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap size={15} className="stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-slate-900">
                The Professor
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 hidden sm:inline-block">
                AI Workspace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
              {authNavItems.map(({ label, href, icon: Icon }) => {
                const isActive = pathName === href || (href !== "/" && pathName.startsWith(href));
                return (
                  <Link
                    href={href}
                    key={label}
                    className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? "bg-slate-100 text-blue-600 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={14} className={isActive ? "text-blue-600" : "text-slate-400"} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* User Menu / Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <User size={13} className="text-slate-400" />
                <span className="max-w-[160px] truncate font-medium">
                  {user?.email}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                id="logout-btn"
                title="Sign out of your account"
              >
                <LogOut size={13} className="mr-1.5" />
                <span>Log out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="text-xs">
                  Sign in
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="primary" size="sm" className="text-xs">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          id="mobile-menu-toggle"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="md:hidden border-b border-slate-200 bg-white px-4 py-3 shadow-lg"
          >
            <div className="flex flex-col gap-1.5">
              {isAuthenticated ? (
                <>
                  <div className="pb-2 mb-1 border-b border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                    <User size={13} className="text-slate-400" />
                    <span className="truncate">{user?.email}</span>
                  </div>

                  {authNavItems.map(({ label, href, icon: Icon }) => {
                    const isActive = pathName === href || (href !== "/" && pathName.startsWith(href));
                    return (
                      <Link
                        href={href}
                        key={label}
                        onClick={() => setMobileOpen(false)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2.5 ${
                          isActive
                            ? "bg-blue-50 text-blue-600 font-semibold"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Icon size={16} className={isActive ? "text-blue-600" : "text-slate-400"} />
                        <span>{label}</span>
                      </Link>
                    );
                  })}

                  <div className="pt-2 mt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Log out</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Home
                  </Link>
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    Sign in / Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;