"use client";

import Link from "next/link";
import { useState } from "react";
import { NAV, SITE } from "@/lib/config";
import AdminLoginModal from "./AdminLoginModal";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link href={SITE.homePath} className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[0.82rem] font-extrabold tracking-wide text-navy-deep sm:text-sm">
              {SITE.businessName}
            </span>
            <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
              Customer Experience Documentation
            </span>
          </Link>

          <nav aria-label="Sections" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="rounded-md px-2.5 py-1.5 text-[0.82rem] font-semibold text-ink-soft transition hover:bg-paper hover:text-navy"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="btn btn-outline btn-sm lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>

          <button
            type="button"
            onClick={() => setLoginOpen(true)}
            className="btn btn-outline btn-sm shrink-0"
            aria-haspopup="dialog"
          >
            ADMIN
          </button>
        </div>

        {menuOpen && (
          <nav
            id="mobile-nav"
            aria-label="Sections (mobile)"
            className="border-t border-line bg-white lg:hidden"
          >
            <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-1 px-3 py-3">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-paper hover:text-navy"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      {loginOpen && <AdminLoginModal onClose={() => setLoginOpen(false)} />}
    </>
  );
}