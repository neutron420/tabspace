"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------
   tokens
------------------------------------------------------------------- */
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const EASE_OUT = "cubic-bezier(0.2, 0.8, 0.2, 1)";

const GRAIN =
  "radial-gradient(rgba(0,0,0,0.18) 0.6px, transparent 0.7px)";

function useInView({
  threshold = 0.05,
  rootMargin = "250px 0px 100px 0px",
}: {
  threshold?: number;
  rootMargin?: string;
} = {}) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => setInView(true));
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin]);

  return [ref, inView] as const;
}

function MotionBlur({
  inView,
  delay = 0,
  blur = 8,
  children,
  className = "",
}: {
  inView: boolean;
  delay?: number;
  blur?: number;
  children: ReactNode;
  className?: string;
}) {
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setSettled(true), delay + 850);
      return () => clearTimeout(t);
    }
  }, [inView, delay]);

  return (
    <div
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translate3d(0, 0, 0)" : "translate3d(0, 24px, 0)",
        filter: settled ? "none" : inView ? "blur(0px)" : `blur(${blur}px)`,
        transition: settled
          ? "none"
          : `opacity 650ms ${EASE_OUT} ${delay}ms, transform 750ms ${EASE_OUT} ${delay}ms, filter 650ms ${EASE_OUT} ${delay}ms`,
        willChange: settled ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------
   data
------------------------------------------------------------------- */
type LegalModalTab = "privacy" | "about" | "license";

interface FooterLink {
  label: string;
  href?: string;
  action?: LegalModalTab;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Bookmarks", href: "#features" },
      { label: "Collections", href: "#features" },
      { label: "Connected Notes", href: "#features" },
      { label: "Browser Extension", href: "https://github.com/neutron420/tabspace" },
    ],
  },
  {
    title: "Architecture",
    links: [
      { label: "PostgreSQL 18", href: "https://neon.tech" },
      { label: "Prisma 8 ORM", href: "https://www.prisma.io" },
      { label: "Tenant Isolation", href: "#security" },
      { label: "GIN Search Index", href: "#features" },
      { label: "Activity Audit", href: "#security" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "GitHub", href: "https://github.com/neutron420/tabspace" },
      { label: "Issues & Feedback", href: "https://github.com/neutron420/tabspace/issues" },
      { label: "Documentation", href: "https://github.com/neutron420/tabspace#readme" },
      { label: "Community", href: "https://github.com/neutron420" },
      { label: "Email", href: "mailto:rihankumar2004@gmail.com" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", action: "privacy" },
      { label: "About TabSpace", action: "about" },
      { label: "MIT License", action: "license" },
    ],
  },
];

/* ------------------------------------------------------------------
   footer
------------------------------------------------------------------- */
export default function Footer() {
  const [ref, inView] = useInView();
  const [modalTab, setModalTab] = useState<LegalModalTab | null>(null);
  const [year, setYear] = useState<number>(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  // Close modal on Escape key and prevent background scroll
  useEffect(() => {
    if (!modalTab) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalTab(null);
    };
    window.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [modalTab]);

  return (
    <>
      <footer
        ref={ref}
        className="relative z-10 w-full overflow-hidden px-6 pt-14 sm:px-12 sm:pt-16"
        style={{
          background:
            "linear-gradient(180deg, #ffffff 0%, #e6f2ff 26%, #8cc7fb 62%, #52aef9 100%)",
        }}
      >
        {/* paper grain */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: GRAIN,
            backgroundSize: "3px 3px",
            opacity: 0.06,
            maskImage: "linear-gradient(to bottom, black 10%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 10%, transparent 100%)",
          }}
        />

        {/* top: tagline + links */}
        <div className="relative z-10 mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_1.85fr] lg:gap-14">
          <MotionBlur inView={inView} delay={0} className="text-center lg:text-left flex flex-col justify-between mb-8">
            <div>
              <p className="font-sans text-3xl font-normal leading-[1.1] tracking-tight text-zinc-900 sm:text-4xl">
                Save it once.
                <br />
                Find it fast.
              </p>
            </div>

            {/* Minimal copyright & creator */}
            <div className="mt-5 text-[11px] leading-relaxed text-zinc-600">
              <p>&copy; {year} TabSpace. All rights reserved.</p>
              <p className="mt-0.5">
                Built with care by{" "}
                <a
                  href="https://github.com/neutron420"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-zinc-700 transition-colors hover:text-zinc-950"
                >
                  neutron420
                </a>
              </p>
            </div>
          </MotionBlur>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 text-center sm:grid-cols-4 sm:text-left">
            {COLUMNS.map((col, ci) => (
              <MotionBlur key={col.title} inView={inView} delay={140 + ci * 80}>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.action ? (
                        <button
                          type="button"
                          onClick={() => setModalTab(link.action!)}
                          className="cursor-pointer py-0.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:text-zinc-950 text-left"
                        >
                          <span>{link.label}</span>
                        </button>
                      ) : link.href?.startsWith("http") || link.href?.startsWith("mailto:") ? (
                        <a
                          href={link.href}
                          target={link.href.startsWith("http") ? "_blank" : undefined}
                          rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                          title={link.href.startsWith("mailto:") ? link.href.replace("mailto:", "") : undefined}
                          className="inline-flex items-center py-0.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:text-zinc-950"
                        >
                          <span>{link.label}</span>
                        </a>
                      ) : (
                        <Link
                          href={link.href || "#"}
                          className="inline-flex items-center py-0.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:text-zinc-950"
                        >
                          <span>{link.label}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </MotionBlur>
            ))}
          </div>
        </div>

        {/* full-bleed wordmark */}
        <MotionBlur
          inView={inView}
          delay={380}
          className="relative z-10 -mx-6 mt-14 sm:-mx-12 sm:mt-20"
        >
          <div className="relative select-none" style={{ containerType: "inline-size" }}>
            <div
              aria-hidden
              className="overflow-hidden whitespace-nowrap text-center font-bold leading-[0.8] tracking-[-0.055em] text-white"
              style={{
                fontSize: "21cqw",
                height: "14.5cqw",
                marginBottom: "-2cqw",
                textShadow: "0 0.02em 0 rgba(20,90,190,0.25)",
              }}
            >
              TabSpace
            </div>
            <span className="sr-only">TabSpace</span>
          </div>
        </MotionBlur>
      </footer>

      {/* ------------------------------------------------------------------
         Minimal Pop-up Modal Window for Legal & Notices
      ------------------------------------------------------------------- */}
      {modalTab && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setModalTab(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs transition-opacity duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[85vh] w-full max-w-xl flex-col rounded-3xl border border-zinc-200/80 bg-white shadow-2xl transition-transform duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "privacy", label: "Privacy Policy" },
                  { id: "about", label: "About TabSpace" },
                  { id: "license", label: "MIT License" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setModalTab(tab.id as LegalModalTab)}
                    className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                      modalTab === tab.id
                        ? "bg-zinc-900 text-white shadow-xs"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setModalTab(null)}
                className="ml-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                title="Close (Esc)"
                aria-label="Close"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="max-h-[calc(85vh-72px)] overflow-y-auto px-6 py-6 text-sm text-zinc-600">
              {modalTab === "privacy" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-zinc-900">
                      Privacy Policy
                    </h3>
                    <p className="mt-1 text-xs text-zinc-400">
                      Zero tracking, strict multi-tenant isolation, and complete user ownership.
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-600">
                    TabSpace is built with strict privacy guarantees and database-level tenancy boundaries. We do not track you across the web, use advertising trackers, or share your data.
                  </p>
                  <div className="divide-y divide-zinc-100 border-y border-zinc-100 text-xs text-zinc-600">
                    <div className="py-2.5">
                      <span className="font-medium text-zinc-900">Strict Multi-Tenant Isolation:</span> Every bookmark, collection, tag, and note is cryptographically bound to your workspace with composite foreign keys and advisory transaction locks.
                    </div>
                    <div className="py-2.5">
                      <span className="font-medium text-zinc-900">Zero Third-Party Trackers:</span> TabSpace automatically strips tracking query parameters (such as utm_source, utm_medium, fbclid, and gclid) when saving bookmarks.
                    </div>
                    <div className="py-2.5">
                      <span className="font-medium text-zinc-900">Hashed Extension Credentials:</span> Chrome extension API access tokens are hashed via SHA-256 before storage; raw tokens are never persisted in the database.
                    </div>
                  </div>
                </div>
              )}

              {modalTab === "about" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-zinc-900">
                      Original Architecture &amp; Craft
                    </h3>
                    <p className="mt-1 text-xs text-zinc-400">
                      Designed and built by neutron420.
                    </p>
                  </div>
                  <div className="space-y-2.5 text-xs leading-relaxed text-zinc-600">
                    <p>
                      TabSpace is an all-in-one personal digital workspace engineered for developers, researchers, and knowledge workers. It brings bookmarks, collections, connected Markdown notes, and browser tab capture into one unified, instant search space.
                    </p>
                    <p>
                      Powered by Next.js 16 App Router, Neon PostgreSQL 18 with GIN indexing for sub-millisecond search, Prisma 8, and Firebase Authentication, TabSpace provides rock-solid data integrity with zero compromise on speed.
                    </p>
                    <p>
                      The complete codebase is open-source under the MIT License on GitHub.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <a
                      href="https://github.com/neutron420/tabspace"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white shadow-xs transition-colors hover:bg-zinc-800"
                    >
                      View GitHub Repo
                    </a>
                    <a
                      href="https://github.com/neutron420"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-800 shadow-xs transition-colors hover:bg-zinc-50"
                    >
                      Developer Profile
                    </a>
                  </div>
                </div>
              )}

              {modalTab === "license" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-zinc-900">
                      MIT License
                    </h3>
                    <p className="mt-1 text-xs text-zinc-400">
                      Free and open source for everyone.
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-600">
                    TabSpace is open-source software created by neutron420. Permission is granted, free of charge, to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software.
                  </p>
                  <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 font-mono text-[11px] leading-relaxed text-zinc-600 select-all whitespace-pre-wrap">
                    {`MIT License

Copyright (c) 2026 neutron420 (https://github.com/neutron420/tabspace)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
