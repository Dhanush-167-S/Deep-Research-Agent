"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-[var(--paper-0)]/90 backdrop-blur-md ${
        isScrolled ? "border-b border-[var(--rule-line)] shadow-xs" : ""
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-1 group">
          <span className="font-fraunces text-xl font-medium tracking-tight text-[var(--ink-900)]">
            TopResearch
          </span>
          <sup className="text-[var(--verified)] font-mono text-xs font-bold -top-2">
            ¹
          </sup>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#research" className="ink-link text-sm font-medium text-[var(--ink-600)] hover:text-[var(--ink-900)]">
            Research
          </Link>
          <Link href="#agents" className="ink-link text-sm font-medium text-[var(--ink-600)] hover:text-[var(--ink-900)]">
            Agents
          </Link>
          <Link href="#trust" className="ink-link text-sm font-medium text-[var(--ink-600)] hover:text-[var(--ink-900)]">
            Trust & Verification
          </Link>
          <Link href="#capabilities" className="ink-link text-sm font-medium text-[var(--ink-600)] hover:text-[var(--ink-900)]">
            Capabilities
          </Link>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--ink-600)] hover:text-[var(--ink-900)] transition-colors px-3 py-2"
          >
            Sign in
          </Link>
          <Link href="/dashboard" className="btn-verified">
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[var(--ink-900)] focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-[var(--rule-line)] bg-[var(--paper-0)] px-6 py-6"
          >
            <div className="flex flex-col gap-4">
              <Link
                href="#research"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[var(--ink-900)] py-2 border-b border-[var(--rule-line)]"
              >
                Research
              </Link>
              <Link
                href="#agents"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[var(--ink-900)] py-2 border-b border-[var(--rule-line)]"
              >
                Agents
              </Link>
              <Link
                href="#trust"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[var(--ink-900)] py-2 border-b border-[var(--rule-line)]"
              >
                Trust & Verification
              </Link>
              <Link
                href="#capabilities"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[var(--ink-900)] py-2 border-b border-[var(--rule-line)]"
              >
                Capabilities
              </Link>
              <div className="flex flex-col gap-3 pt-4">
                <Link
                  href="/login"
                  className="btn-ghost justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/dashboard"
                  className="btn-verified justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
