"use client";

import React, { useState } from "react";
import {
  FileCode,
  Download,
  Upload,
  Sun,
  Moon,
  Sparkles,
  Paperclip,
} from "lucide-react";

/* ------------------------------------------------------------------
   2x2 Miniature Color Swatch Grid (recreating reference screenshot icons)
------------------------------------------------------------------- */
function SwatchGrid({ colors }: { colors: [string, string, string, string] }) {
  return (
    <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5 shrink-0">
      {colors.map((c, i) => (
        <span
          key={i}
          className="rounded-[1.5px]"
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------
   8-Ray Asterisk Vector Mark (Center symbol & Theme Generator)
------------------------------------------------------------------- */
function AsteriskBurst({
  className = "w-6 h-6",
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.6"
      strokeLinecap="round"
      className={className}
    >
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="5.64" y1="5.64" x2="18.36" y2="18.36" />
      <line x1="5.64" y1="18.36" x2="18.36" y2="5.64" />
    </svg>
  );
}

export default function ThemeBentoGrid() {
  /* Interactive state */
  const [activeTheme, setActiveTheme] = useState<"ghibli" | "marvel">("ghibli");
  const [selectedColor, setSelectedColor] = useState<string>("#EF4444");
  const [activeMode, setActiveMode] = useState<"dark" | "light">("dark");

  const colorPalettes: Record<string, { gradient: string; glow: string }> = {
    "#EF4444": {
      gradient: "from-[#FF4D4D] to-[#FF7B7B]",
      glow: "rgba(239,68,68,0.32)",
    },
    "#F97316": {
      gradient: "from-[#F97316] to-[#FB923C]",
      glow: "rgba(249,115,22,0.32)",
    },
    "#3B82F6": {
      gradient: "from-[#2563EB] to-[#60A5FA]",
      glow: "rgba(59,130,246,0.32)",
    },
    "#10B981": {
      gradient: "from-[#059669] to-[#34D399]",
      glow: "rgba(16,185,129,0.32)",
    },
  };

  const currentColorConfig =
    colorPalettes[selectedColor] || colorPalettes["#EF4444"];

  return (
    <section className="w-full bg-[#F7F7F7] py-14 px-4 sm:px-6 lg:px-8 select-none">
      <div className="mx-auto max-w-[1040px]">
        {/* Bento Grid: 3 columns desktop, 2 columns tablet, 1 column mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ================================================================
              Card 1 — Real-time Customization
          ================================================================ */}
          <div className="bg-white rounded-xl border border-[#EAEAEA] p-5 sm:p-6 min-h-[295px] flex flex-col justify-between overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-shadow duration-200 hover:shadow-sm">
            {/* Header */}
            <div>
              <h3 className="font-bold text-[14px] text-zinc-900 tracking-tight leading-snug">
                Real-time Customization
              </h3>
              <p className="text-[11.5px] text-zinc-500 leading-relaxed mt-1.5 line-clamp-3">
                See your shadcn components transform instantly as you
                experiment with styles in real time.
              </p>
            </div>

            {/* Illustration */}
            <div className="mt-4 -mb-2 overflow-hidden">
              {/* Horizontal theme pills */}
              <div className="flex items-center gap-2 overflow-hidden pb-3">
                {/* Ghibli Studio Pill */}
                <button
                  type="button"
                  onClick={() => setActiveTheme("ghibli")}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all duration-150 shrink-0 ${
                    activeTheme === "ghibli"
                      ? "bg-white border-zinc-300 shadow-2xs text-zinc-900"
                      : "bg-white/80 border-zinc-200 text-zinc-700 hover:bg-white hover:border-zinc-300"
                  }`}
                >
                  <SwatchGrid
                    colors={["#F59E0B", "#10B981", "#EC4899", "#EF4444"]}
                  />
                  <span>Ghibli Studio</span>
                </button>

                {/* Marvel Pill */}
                <button
                  type="button"
                  onClick={() => setActiveTheme("marvel")}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all duration-150 shrink-0 ${
                    activeTheme === "marvel"
                      ? "bg-white border-zinc-300 shadow-2xs text-zinc-900"
                      : "bg-white/80 border-zinc-200 text-zinc-700 hover:bg-white hover:border-zinc-300"
                  }`}
                >
                  <SwatchGrid
                    colors={["#DC2626", "#991B1B", "#1E3A8A", "#E5E7EB"]}
                  />
                  <span>Marvel</span>
                </button>

                {/* Minimal Pill (Partially clipped right) */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white/80 text-[11px] font-medium text-zinc-700 shrink-0 opacity-70">
                  <SwatchGrid
                    colors={["#18181B", "#71717A", "#DC2626", "#F4F4F5"]}
                  />
                  <span>Minimal</span>
                </div>
              </div>

              {/* Miniature Dashboard Preview */}
              <div className="rounded-xl border border-zinc-200/80 bg-white p-3 shadow-2xs">
                <div className="text-center mb-2">
                  <span className="font-mono text-[6px] tracking-widest text-zinc-400 font-semibold uppercase block">
                    DASHBOARD PREVIEW
                  </span>
                  <h4 className="text-[9px] font-bold text-zinc-900 leading-tight mt-0.5 max-w-[210px] mx-auto">
                    Unleash the full financial potential with our best features
                  </h4>
                </div>

                {/* 3 Sub-Cards */}
                <div className="grid grid-cols-3 gap-1.5 items-stretch">
                  {/* Subcard 1 */}
                  <div className="rounded-lg bg-[#FAFAFA] border border-zinc-100 p-1.5 flex flex-col justify-between">
                    <div>
                      <div className="h-4 w-full bg-zinc-200/50 rounded-xs mb-1 flex items-end gap-0.5 p-0.5">
                        <span className="h-2 w-1 bg-zinc-300 rounded-2xs" />
                        <span className="h-3 w-1 bg-zinc-400 rounded-2xs" />
                        <span className="h-1.5 w-1 bg-zinc-300 rounded-2xs" />
                        <span className="h-3.5 w-1 bg-zinc-500 rounded-2xs" />
                      </div>
                      <p className="text-[6.5px] font-bold text-zinc-800 leading-tight">
                        Customizable Dashboard
                      </p>
                      <p className="text-[5px] text-zinc-400 mt-0.5 leading-none">
                        Create dashboards with blocks that provide raw insights.
                      </p>
                    </div>
                    <span className="inline-flex items-center text-[5px] font-medium text-white bg-zinc-900 px-1 py-0.5 rounded-xs mt-1 w-fit">
                      Learn more &rarr;
                    </span>
                  </div>

                  {/* Subcard 2 */}
                  <div className="rounded-lg bg-[#FAFAFA] border border-zinc-100 p-1.5 flex flex-col justify-between">
                    <div>
                      <div className="h-4 w-full bg-zinc-900 rounded-xs mb-1 p-0.5 flex items-center justify-between">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="h-1.5 w-4 bg-zinc-700 rounded-2xs" />
                      </div>
                      <p className="text-[6.5px] font-bold text-zinc-800 leading-tight">
                        Financial Goal Tracking
                      </p>
                      <p className="text-[5px] text-zinc-400 mt-0.5 leading-none">
                        Create dashboards with blocks that provide raw insights.
                      </p>
                    </div>
                    <span className="inline-flex items-center text-[5px] font-medium text-white bg-zinc-900 px-1 py-0.5 rounded-xs mt-1 w-fit">
                      Learn more &rarr;
                    </span>
                  </div>

                  {/* Subcard 3 (Partially clipped) */}
                  <div className="rounded-lg bg-[#FAFAFA] border border-zinc-100 p-1.5 flex flex-col justify-between opacity-80">
                    <div>
                      <div className="h-4 w-full bg-purple-900/10 rounded-xs mb-1 flex items-center justify-center">
                        <span className="h-2 w-3 bg-purple-500/40 rounded-xs" />
                      </div>
                      <p className="text-[6.5px] font-bold text-zinc-800 leading-tight">
                        Cash Flow Management
                      </p>
                      <p className="text-[5px] text-zinc-400 mt-0.5 leading-none">
                        Create dashboards with blocks that provide raw insights.
                      </p>
                    </div>
                    <span className="inline-flex items-center text-[5px] font-medium text-white bg-zinc-900 px-1 py-0.5 rounded-xs mt-1 w-fit">
                      Learn more &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================
              Card 2 — Color Mastery
          ================================================================ */}
          <div className="bg-white rounded-xl border border-[#EAEAEA] p-5 sm:p-6 min-h-[295px] flex flex-col justify-between overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-shadow duration-200 hover:shadow-sm">
            {/* Header */}
            <div>
              <h3 className="font-bold text-[14px] text-zinc-900 tracking-tight leading-snug">
                Color Mastery
              </h3>
              <p className="text-[11.5px] text-zinc-500 leading-relaxed mt-1.5 line-clamp-3">
                Play with background, text, and border hues using a sleek color
                picker for a unified design.
              </p>
            </div>

            {/* Illustration */}
            <div className="relative mt-2 flex flex-col items-center justify-center overflow-hidden h-[180px]">
              {/* Primary Color Selector Pill */}
              <div className="z-20 inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 shadow-2xs mb-1">
                <span className="text-[10px] font-medium text-zinc-700">
                  Primary Color
                </span>
                <div className="flex items-center gap-1">
                  {["#EF4444", "#F97316", "#3B82F6", "#10B981"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Select color ${color}`}
                      onClick={() => setSelectedColor(color)}
                      className={`h-2.5 w-2.5 rounded-full transition-transform duration-150 cursor-pointer ${
                        selectedColor === color
                          ? "scale-125 ring-1 ring-offset-1 ring-zinc-400"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Concentric Circular Outlines */}
              <div className="relative w-full h-[145px] flex items-center justify-center">
                {/* Outer Ring 2 */}
                <div className="absolute w-[205px] h-[205px] rounded-full border border-zinc-200/70 pointer-events-none" />

                {/* Outer Ring 1 */}
                <div className="absolute w-[148px] h-[148px] rounded-full border border-zinc-200/70 pointer-events-none" />

                {/* Center Glowing Icon */}
                <div
                  className={`z-10 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr ${currentColorConfig.gradient} text-white transition-all duration-300 shadow-md`}
                  style={{
                    boxShadow: `0 4px 18px ${currentColorConfig.glow}`,
                  }}
                >
                  <AsteriskBurst className="h-7 w-7" color="#FFFFFF" />
                </div>

                {/* Floating Badge 1: "Typo" at ~10 o'clock */}
                <div className="absolute left-4 top-5 rounded border border-rose-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-rose-500 shadow-2xs">
                  Typo
                </div>

                {/* Floating Badge 2: Angle Bracket at ~1 o'clock */}
                <div className="absolute right-12 top-2 h-2.5 w-2.5 border-t-2 border-r-2 border-rose-400" />

                {/* Floating Badge 3: Overlapping Red Squares at ~4 o'clock */}
                <div className="absolute right-6 bottom-7 flex -space-x-1">
                  <span className="h-3.5 w-3.5 rounded-[3px] bg-rose-400 shadow-2xs" />
                  <span className="h-3.5 w-3.5 rounded-[3px] bg-rose-300/80 shadow-2xs" />
                </div>

                {/* Floating Badge 4: "T" Box at ~7 o'clock */}
                <div className="absolute left-8 bottom-3 flex h-5 w-5 items-center justify-center rounded border border-zinc-200 bg-white text-[10px] font-medium text-rose-400 shadow-2xs">
                  T
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================
              Card 3 — Typography Fine-Tuning
          ================================================================ */}
          <div className="bg-white rounded-xl border border-[#EAEAEA] p-5 sm:p-6 min-h-[295px] flex flex-col justify-between overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-shadow duration-200 hover:shadow-sm">
            {/* Header */}
            <div>
              <h3 className="font-bold text-[14px] text-zinc-900 tracking-tight leading-snug">
                Typography Fine-Tuning
              </h3>
              <p className="text-[11.5px] text-zinc-500 leading-relaxed mt-1.5 line-clamp-3">
                Perfect your text with adjustable font sizes, weights, and
                transformations for a polished look.
              </p>
            </div>

            {/* Illustration */}
            <div className="relative mt-2 flex flex-col items-center justify-center overflow-hidden h-[180px] text-center select-none">
              {/* Floating Decorative Sparkle Icon (top right) */}
              <div className="absolute right-6 top-8 text-zinc-400">
                <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
              </div>

              {/* Floating Decorative Paperclip/Pin Icon (bottom left) */}
              <div className="absolute left-6 bottom-8 text-zinc-400 -rotate-45">
                <Paperclip className="h-3.5 w-3.5 text-zinc-400" />
              </div>

              {/* Vertical Typography Hierarchy */}
              <div className="flex flex-col items-center justify-center space-y-1 py-1">
                {/* Heading 1 (Faded Top) */}
                <span className="font-bold text-[20px] text-zinc-900/12 tracking-tight select-none pointer-events-none">
                  Heading 1
                </span>

                {/* Heading 2 (Primary) */}
                <span className="font-semibold text-[18px] text-zinc-800 tracking-tight">
                  Heading 2
                </span>

                {/* Heading 3 (Secondary) */}
                <span className="font-medium text-[15px] text-zinc-700 tracking-tight">
                  Heading 3
                </span>

                {/* Paragraph */}
                <span className="font-normal text-[11px] text-zinc-500">
                  Paragraph
                </span>

                {/* Heading 1 (Faded Bottom) */}
                <span className="font-bold text-[20px] text-zinc-900/12 tracking-tight select-none pointer-events-none">
                  Heading 1
                </span>
              </div>
            </div>
          </div>

          {/* ================================================================
              Card 4 — Import/Export Themes (Spans 2 columns on desktop)
          ================================================================ */}
          <div className="bg-white rounded-xl border border-[#EAEAEA] p-5 sm:p-6 min-h-[255px] md:col-span-2 flex flex-col justify-between overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-shadow duration-200 hover:shadow-sm">
            {/* Header */}
            <div>
              <h3 className="font-bold text-[14px] text-zinc-900 tracking-tight leading-snug">
                Import/Export Themes
              </h3>
              <p className="text-[11.5px] text-zinc-500 leading-relaxed mt-1.5 max-w-xl">
                Easily import &amp; export your custom Shadcn themes to backup
                your designs, and move them between projects effortlessly.
              </p>
            </div>

            {/* Illustration: Horizontal Workflow Diagram */}
            <div className="mt-4 sm:mt-6 flex items-center justify-center w-full overflow-hidden py-2 select-none">
              <div className="flex items-center justify-center w-full max-w-[560px] gap-1 sm:gap-2 scale-[0.88] sm:scale-100 origin-center transition-transform">
                {/* Left Column: Project & Figma File */}
                <div className="flex flex-col gap-3 shrink-0">
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[10.5px] font-medium text-zinc-800 shadow-2xs hover:bg-zinc-50 transition-colors cursor-pointer">
                    <FileCode className="h-3 w-3 text-zinc-600" />
                    <span>Project</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[10.5px] font-medium text-zinc-800 shadow-2xs hover:bg-zinc-50 transition-colors cursor-pointer">
                    <FileCode className="h-3 w-3 text-zinc-600" />
                    <span>Figma File</span>
                  </div>
                </div>

                {/* Left Connector Fork (SVG bracket) */}
                <div className="flex items-center justify-center w-6 sm:w-9 shrink-0">
                  <svg
                    viewBox="0 0 36 56"
                    fill="none"
                    className="w-full h-12 stroke-zinc-200"
                    strokeWidth="1.2"
                  >
                    <path d="M 0 11 H 18 V 45 H 0 M 18 28 H 36" />
                  </svg>
                </div>

                {/* Import Button */}
                <div className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[10.5px] font-medium text-zinc-800 shadow-2xs hover:bg-zinc-50 transition-colors cursor-pointer shrink-0">
                  <Download className="h-3 w-3 text-zinc-600" />
                  <span>Import</span>
                </div>

                {/* Mid-Left Connecting Line */}
                <div className="w-3 sm:w-5 h-[1.2px] bg-zinc-200 shrink-0" />

                {/* Center Node: Theme Generator (Black Button) */}
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3 py-1.5 text-[10.5px] font-medium text-white shadow-xs hover:bg-zinc-800 transition-colors cursor-pointer select-none shrink-0">
                  <AsteriskBurst className="h-3.5 w-3.5" color="#FFFFFF" />
                  <span>Theme Generator</span>
                </div>

                {/* Mid-Right Connecting Line */}
                <div className="w-3 sm:w-5 h-[1.2px] bg-zinc-200 shrink-0" />

                {/* Export Button */}
                <div className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[10.5px] font-medium text-zinc-800 shadow-2xs hover:bg-zinc-50 transition-colors cursor-pointer shrink-0">
                  <Upload className="h-3 w-3 text-zinc-600" />
                  <span>Export</span>
                </div>

                {/* Right Connector Fork (SVG bracket) */}
                <div className="flex items-center justify-center w-6 sm:w-9 shrink-0">
                  <svg
                    viewBox="0 0 36 56"
                    fill="none"
                    className="w-full h-12 stroke-zinc-200"
                    strokeWidth="1.2"
                  >
                    <path d="M 0 28 H 18 V 11 H 36 M 18 28 V 45 H 36" />
                  </svg>
                </div>

                {/* Right Column: Project & Figma File */}
                <div className="flex flex-col gap-3 shrink-0">
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[10.5px] font-medium text-zinc-800 shadow-2xs hover:bg-zinc-50 transition-colors cursor-pointer">
                    <FileCode className="h-3 w-3 text-zinc-600" />
                    <span>Project</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[10.5px] font-medium text-zinc-800 shadow-2xs hover:bg-zinc-50 transition-colors cursor-pointer">
                    <FileCode className="h-3 w-3 text-zinc-600" />
                    <span>Figma File</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================
              Card 5 — Stunning Theme Starters (Spans 1 column on desktop)
          ================================================================ */}
          <div className="bg-white rounded-xl border border-[#EAEAEA] p-5 sm:p-6 min-h-[255px] md:col-span-1 flex flex-col justify-between overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-shadow duration-200 hover:shadow-sm">
            {/* Header */}
            <div>
              <h3 className="font-bold text-[14px] text-zinc-900 tracking-tight leading-snug">
                Stunning Theme Starters
              </h3>
              <p className="text-[11.5px] text-zinc-500 leading-relaxed mt-1.5">
                Kick off with gorgeous pre-built themes and customize light or
                dark modes in a breeze.
              </p>
            </div>

            {/* Illustration: Mode Toggles & Connected Theme Options */}
            <div className="mt-6 flex items-center justify-between w-full overflow-hidden">
              {/* Left Column: Light & Dark Mode Buttons */}
              <div className="flex flex-col gap-3 shrink-0">
                {/* Light Mode Button */}
                <button
                  type="button"
                  onClick={() => setActiveMode("light")}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 ${
                    activeMode === "light"
                      ? "bg-zinc-950 text-white shadow-xs"
                      : "bg-white border border-zinc-200 text-zinc-800 shadow-2xs hover:bg-zinc-50"
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  <span>Light Mode</span>
                </button>

                {/* Dark Mode Button (Active in screenshot) */}
                <button
                  type="button"
                  onClick={() => setActiveMode("dark")}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 ${
                    activeMode === "dark"
                      ? "bg-zinc-950 text-white shadow-xs"
                      : "bg-white border border-zinc-200 text-zinc-800 shadow-2xs hover:bg-zinc-50"
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  <span>Dark Mode</span>
                </button>
              </div>

              {/* Connecting Bracket Line */}
              <div className="flex items-center justify-center w-8 shrink-0">
                <svg
                  viewBox="0 0 32 64"
                  fill="none"
                  className="w-full h-14 stroke-zinc-200"
                  strokeWidth="1.2"
                >
                  <path d="M 0 16 H 16 V 48 H 0 M 16 32 H 32" />
                </svg>
              </div>

              {/* Right Column: Stacked Theme Preview Options (Partially clipped on right) */}
              <div className="flex flex-col gap-2.5 shrink-0 -mr-6">
                {/* Theme 1: Default */}
                <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 shadow-2xs w-36">
                  <SwatchGrid
                    colors={["#E4E4E7", "#D4D4D8", "#F43F5E", "#FB7185"]}
                  />
                  <span>Default</span>
                </div>

                {/* Theme 2: Clean Slate */}
                <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 shadow-2xs w-36">
                  <SwatchGrid
                    colors={["#3B82F6", "#1D4ED8", "#EF4444", "#DC2626"]}
                  />
                  <span>Clean Slate</span>
                </div>

                {/* Theme 3: Ghibli Studio */}
                <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 shadow-2xs w-36">
                  <SwatchGrid
                    colors={["#F59E0B", "#10B981", "#EC4899", "#EF4444"]}
                  />
                  <span>Ghibli Studio</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

