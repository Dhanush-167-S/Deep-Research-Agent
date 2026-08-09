"use client";

import Link from "next/link";
import { Twitter, Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[var(--ink-1000)] text-[var(--paper-0)]/70 border-t border-[var(--ink-600)]/20 font-sans">
      <div className="max-w-[1240px] mx-auto px-6 py-16">
        {/* Top 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Col */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-1">
              <span className="font-fraunces text-2xl font-medium tracking-tight text-[var(--paper-0)]">
                TopResearch
              </span>
              <sup className="text-[var(--verified)] font-mono text-xs font-bold -top-2">
                ¹
              </sup>
            </Link>
            <p className="text-sm text-[var(--paper-0)]/60 max-w-xs leading-relaxed">
              The AI Research Operating System that coordinates specialized agents to verify every source and trace every citation.
            </p>
          </div>

          {/* Product Links */}
          <div className="md:col-span-3">
            <h4 className="font-mono-data text-xs uppercase tracking-widest text-[var(--paper-0)]/40 mb-4">
              Product
            </h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <Link href="#research" className="hover:text-[var(--paper-0)] transition-colors">
                  Multi-Agent Engine
                </Link>
              </li>
              <li>
                <Link href="#agents" className="hover:text-[var(--paper-0)] transition-colors">
                  Source Verifier
                </Link>
              </li>
              <li>
                <Link href="#trust" className="hover:text-[var(--paper-0)] transition-colors">
                  Citation Provenance
                </Link>
              </li>
              <li>
                <Link href="#capabilities" className="hover:text-[var(--paper-0)] transition-colors">
                  Academic Integration
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="md:col-span-3">
            <h4 className="font-mono-data text-xs uppercase tracking-widest text-[var(--paper-0)]/40 mb-4">
              Resources
            </h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <Link href="/docs" className="hover:text-[var(--paper-0)] transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api" className="hover:text-[var(--paper-0)] transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="hover:text-[var(--paper-0)] transition-colors">
                  Changelog
                </Link>
              </li>
              <li>
                <Link href="/status" className="hover:text-[var(--paper-0)] transition-colors">
                  System Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="md:col-span-2">
            <h4 className="font-mono-data text-xs uppercase tracking-widest text-[var(--paper-0)]/40 mb-4">
              Company
            </h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <Link href="/about" className="hover:text-[var(--paper-0)] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[var(--paper-0)] transition-colors">
                  Research Blog
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--paper-0)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--paper-0)] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 border-t border-[var(--ink-600)]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono-data text-xs text-[var(--paper-0)]/40">
            © {new Date().getFullYear()} TopResearch Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-[var(--paper-0)]/60">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-[var(--paper-0)] transition-colors" aria-label="Twitter">
              <Twitter size={18} />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[var(--paper-0)] transition-colors" aria-label="GitHub">
              <Github size={18} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[var(--paper-0)] transition-colors" aria-label="LinkedIn">
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
