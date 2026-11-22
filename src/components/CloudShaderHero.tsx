"use client";

import React from "react";
import { CloudShader } from "@/components/ui/cloud-shader";

export function CloudShaderHero() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className="relative min-h-[50rem] w-full overflow-hidden select-none"
      style={{
        fontFamily:
          'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <CloudShader className="absolute inset-0" />

      {/* Hero content matching the screenshot perfectly */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 pt-16 text-center md:pt-24">
        <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md md:text-6xl lg:text-7xl">
          Banking above <br className="hidden md:block" /> the clouds
        </h1>
        <p className="mt-6 max-w-2xl text-base text-white/90 drop-shadow-sm md:text-lg">
          Altitude gives your finance team one home for cards, payments, and
          forecasting. Close the books in hours, not weeks, with automation
          that works while you sleep.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href="https://chromewebstore.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-sky-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-white/90 cursor-pointer"
          >
            Start for free
          </a>
          <button
            type="button"
            onClick={() => scrollToSection("workspaces")}
            className="rounded-full border border-white/40 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 cursor-pointer"
          >
            Book a demo
          </button>
        </div>

        <p className="mt-4 text-xs text-white/70">
          No credit card required &middot; Free 14-day trial
        </p>
      </div>

      {/* Dashboard image preview */}
      <div className="relative z-10 mx-auto mt-12 w-full max-w-6xl px-4 pb-12 md:mt-16 md:px-8">
        <div className="rounded-2xl border border-white/30 bg-white/20 p-2 shadow-2xl backdrop-blur-md md:rounded-[2rem] md:p-3">
          <img
            src="https://assets.aceternity.com/screenshots/fintech-dashboard.webp"
            alt="Altitude fintech dashboard"
            className="w-full rounded-xl border border-black/5 shadow-lg md:rounded-3xl object-cover"
          />
        </div>
      </div>

      {/* Bottom fade gradient into page background */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#F7F7F7] via-[#F7F7F7]/80 to-transparent z-10" />
    </div>
  );
}

export const CloudShaderHeroDemo = CloudShaderHero;
export default CloudShaderHero;
