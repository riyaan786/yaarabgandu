import Link from "next/link";
import { FOOTER_NOTICE, SITE } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="mt-16 bg-navy-deep text-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <p className="text-sm font-extrabold tracking-wide text-white">
              {SITE.businessName}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">
              Customer Experience Documentation — {SITE.locality}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300">
              {FOOTER_NOTICE}
            </p>
          </div>
          <nav aria-label="Footer">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Sections
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href={SITE.homePath} className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white">
                  Admin
                </Link>
              </li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Independent customer documentation. Not affiliated with the business.
            </p>
          </nav>
        </div>
        <p className="mt-8 border-t border-white/10 pt-4 text-xs text-slate-400">
          © {new Date().getFullYear()} — Personal documentation site. Readers should
          review the supporting evidence and make their own assessment.
        </p>
      </div>
    </footer>
  );
}