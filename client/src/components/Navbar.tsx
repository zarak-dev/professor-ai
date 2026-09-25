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
  const { user, isAuthenticated, isGuest, logout, startGuestMode } = useAuth();

  const handleStartGuest = async () => {
    try {
      await startGuestMode();
    } catch {
      // fallback
    }
  };

  const authNavItems = [
    { label: "Documents", href: "/documents", icon: FileText },
    { label: "Upload", href: "/upload", icon: Upload },
  ];

  return (
    <header className="w-full fixed top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E2DBD0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            href={isAuthenticated ? "/documents" : "/"}
            className="flex items-center gap-2.5 group select-none"
          >
            <div className="w-7 h-7 rounded-md bg-[#213448] flex items-center justify-center text-white shadow-xs group-hover:bg-[#182736] transition-colors">
              <GraduationCap size={15} className="stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-[#213448]">
                The Professor
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F4EFE6] text-[#213448] border border-[#E2DBD0] hidden sm:inline-block">
                AI Workspace
              </span>
              <span className="text-[11px] text-[#547792] font-medium hidden lg:inline-block ml-1">
                by Zarak K.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation for Authenticated Users */}
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

          {/* Desktop Navigation for Public / Guest Users */}
          {!isAuthenticated && !isGuest && (
            <nav className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-600">
              <Link href="/#features" className="hover:text-slate-900 transition-colors">
                Overview
              </Link>
            </nav>
          )}

          {/* Desktop Navigation for Active Guest */}
          {isGuest && (
            <nav className="hidden md:flex items-center gap-3">
              <Link
                href="/upload"
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  pathName === "/upload"
                    ? "bg-slate-100 text-blue-600 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Upload size={14} />
                <span>Upload</span>
              </Link>
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
          ) : isGuest ? (
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Guest Mode
              </span>
              <Link href="/sign-in?claim=true">
                <Button variant="primary" size="sm" className="text-xs gap-1">
                  <span>Sign In to Save</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/upload" onClick={handleStartGuest}>
                <Button variant="outline" size="sm" className="text-xs">
                  Try as Guest
                </Button>
              </Link>
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
            className="md:hidden border-b border-[#E2DBD0] bg-[#FAF8F5] px-4 py-3 shadow-lg"
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
              ) : isGuest ? (
                <>
                  <div className="pb-2 mb-1 border-b border-slate-100 text-xs text-amber-700 flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Guest Mode Active (Temporary)</span>
                  </div>
                  <Link
                    href="/upload"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Upload size={16} className="text-slate-400" />
                    <span>Upload Document</span>
                  </Link>
                  <Link
                    href="/sign-in?claim=true"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 font-semibold"
                  >
                    Sign In to Save Work
                  </Link>
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
                    href="/#features"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Overview
                  </Link>
                  <Link
                    href="/upload"
                    onClick={() => {
                      handleStartGuest();
                      setMobileOpen(false);
                    }}
                    className="px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    Try as Guest
                  </Link>
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Sign in / Register
                  </Link>
                </>
              )}
              <div className="pt-2 mt-2 border-t border-[#E2DBD0] text-center text-xs text-[#547792]">
                A Project by <span className="font-semibold text-[#213448]">Zarak K.</span> • Powered by <span className="font-medium text-[#213448]">Aimmyy AI</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;