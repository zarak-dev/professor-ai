'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, FileText, Upload, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const Navbar = () => {
  const pathName = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const authNavItems = [
    { label: "My Documents", href: "/documents", icon: FileText },
    { label: "Upload", href: "/upload", icon: Upload },
  ];

  return (
    <header className="w-full fixed top-0 z-50 px-4 pt-3">
      <div className="max-w-6xl mx-auto">
        <nav className="bento-card-static !p-2.5 sm:!p-3 flex items-center justify-between shadow-sm bg-card/80 backdrop-blur-md">
          {/* Logo */}
          <Link href={isAuthenticated ? "/documents" : "/"} className="flex items-center gap-2 pl-2 group select-none">
            <span className="text-xl font-black tracking-tight leading-none">
              THE<span className="text-primary font-black">PROF</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              authNavItems.map(({ label, href, icon: Icon }) => {
                const isActive = pathName === href || (href !== "/" && pathName.startsWith(href));
                return (
                  <Link
                    href={href}
                    key={label}
                    className={`px-4 py-2 rounded-full text-xs font-bold border-2 border-border transition-all flex items-center gap-1.5 ${
                      isActive
                        ? "bg-primary text-black shadow-[2px_2px_0px_0px_var(--border-color)]"
                        : "bg-card text-foreground hover:bg-muted hover:-translate-y-0.5"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{label}</span>
                  </Link>
                );
              })
            ) : (
              <Link
                href="/sign-in"
                className="px-4 py-2 rounded-full text-xs font-bold border-2 border-border bg-card hover:bg-muted transition-all"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* User Menu / Auth CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-full border border-border">
                  {user?.name || user?.email?.split('@')[0]}
                </span>
                <button
                  onClick={logout}
                  className="btn-primary text-xs !bg-[var(--bg-pink)] !px-3.5 !py-2 flex items-center gap-1.5 text-black"
                  id="logout-btn"
                  title="Logout"
                >
                  <LogOut size={13} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="btn-primary text-xs !px-4 !py-2"
              >
                Get Started →
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl border-2 border-border bg-card hover:bg-muted transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            id="mobile-menu-toggle"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
              transition={{ duration: 0.15 }}
              className="mt-2 bento-card-static !p-4 origin-top md:hidden border-2 border-border bg-card shadow-lg"
            >
              <div className="flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <div className="pb-2 mb-1 border-b border-border/50 text-xs font-bold text-muted-foreground px-2">
                      Signed in as: <span className="text-foreground">{user?.email}</span>
                    </div>

                    {authNavItems.map(({ label, href, icon: Icon }) => {
                      const isActive = pathName === href || (href !== "/" && pathName.startsWith(href));
                      return (
                        <Link
                          href={href}
                          key={label}
                          onClick={() => setMobileOpen(false)}
                          className={`px-4 py-3 rounded-xl text-sm font-bold border-2 border-border transition-all flex items-center gap-2 ${
                            isActive
                              ? "bg-primary text-black"
                              : "bg-card hover:bg-muted text-foreground"
                          }`}
                        >
                          <Icon size={16} />
                          <span>{label}</span>
                        </Link>
                      );
                    })}

                    <button
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className="btn-primary w-full justify-center mt-2 !bg-[var(--bg-pink)] text-black flex items-center gap-2 text-sm py-3"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/"
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 rounded-xl text-sm font-bold border-2 border-border bg-card text-center"
                    >
                      Home
                    </Link>
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileOpen(false)}
                      className="btn-primary w-full justify-center mt-1 text-sm py-3"
                    >
                      Sign In / Register →
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navbar;