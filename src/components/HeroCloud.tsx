"use client";

import React from "react";
import { CloudShader } from "@/components/ui/cloud-shader";
import { ChromeLogo } from "@/components/brand-icons";

export default function HeroCloud() {
  const scrollToWorkspaces = () => {
    const el = document.getElementById("workspaces");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full overflow-hidden select-none">
      <CloudShader
        className="w-full min-h-[580px] sm:min-h-[640px] pt-16 pb-28 sm:pt-20 sm:pb-36"
        cloudColor="#ffffff"
        skyTopColor="#3b82c4"
        skyBottomColor="#93c9f2"
        speed={0.75}
        count={5}
      >
        <div className="relative z-20 mx-auto max-w-4xl px-4 sm:px-6 text-center">
          {/* Status Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium text-zinc-800 shadow-sm border border-white/60 transition-transform duration-200 hover:scale-105">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] font-semibold text-zinc-900">
              TabSpace 1.0
            </span>
            <span className="text-zinc-400">/</span>
            <span className="font-mono text-[11px] text-zinc-600">
              Strict Multi-Tenant Vault
            </span>
          </div>

          {/* Main Headline */}
          <h1
            className="mt-7 font-sans text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-white leading-[1.08] max-w-3xl mx-auto"
            style={{
              textShadow:
                "0 2px 12px rgba(15, 35, 70, 0.35), 0 1px 3px rgba(15, 35, 70, 0.4)",
            }}
          >
            All your research tabs.
            <br />
            In one focused workspace.
          </h1>

          {/* Grounded Subheadline */}
          <p
            className="mt-5 text-base sm:text-lg text-white/95 leading-relaxed max-w-2xl mx-auto font-normal"
            style={{
              textShadow: "0 1px 6px rgba(15, 35, 70, 0.3)",
            }}
          >
            Capture active browser tabs in one click, organize isolated tenant
            vaults, and author split-view Markdown notes backed by
            sub-millisecond PostgreSQL GIN search.
          </p>

          {/* Dual Tactile Action Buttons */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
            {/* Primary Dark Tactile Button */}
            <a
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2.5 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-zinc-800 active:scale-[0.98] shadow-lg shadow-black/20"
              style={{
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.2)",
              }}
            >
              <ChromeLogo className="h-4 w-4 text-white" />
              <span>Add to Chrome</span>
              <span className="ml-1 rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-300 border border-zinc-700/60">
                ⌘D
              </span>
            </a>

            {/* Secondary Clean White Tactile Button */}
            <button
              type="button"
              onClick={scrollToWorkspaces}
              className="group relative inline-flex items-center gap-2 rounded-2xl bg-white/95 backdrop-blur-md px-5 py-3 text-sm font-semibold text-zinc-900 transition-all duration-200 hover:bg-white active:scale-[0.98] border border-white/70 shadow-md shadow-black/10 hover:shadow-lg"
            >
              <span>Explore Workspaces</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-zinc-600 transition-transform duration-200 group-hover:translate-y-0.5"
              >
                <path d="M12 5v14" />
                <path d="m19 12-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Architecture Proof Badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 pt-3 max-w-xl mx-auto">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-zinc-800 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/60 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>0.42ms PostgreSQL GIN search</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-zinc-800 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/60 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Strict multi-tenant isolation</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-zinc-800 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/60 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>Chrome Extension V3 sync</span>
            </span>
          </div>
        </div>
      </CloudShader>

      {/* Seamless transition mask from Cloud Shader into pure white landing page ground */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent z-10" />
    </div>
  );
}
