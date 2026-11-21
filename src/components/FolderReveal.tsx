"use client";

import React, {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  PostgresLogo,
  NeonLogo,
  PrismaLogo,
  NextjsLogo,
  TailwindLogo,
  GithubLogo,
  LinearLogo,
  TypeScriptLogo,
  StackOverflowLogo,
  DribbbleLogo,
  FigmaLogo,
  TabSpaceLogo,
} from "./brand-icons";

const EASE_OUT = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

function useInView({
  threshold = 0.05,
  rootMargin = "250px 0px 100px 0px",
  animateOnLoad = true,
  loadDelay = 180,
}: {
  threshold?: number;
  rootMargin?: string;
  animateOnLoad?: boolean;
  loadDelay?: number;
} = {}) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (animateOnLoad) {
      timer = setTimeout(() => {
        setInView(true);
      }, loadDelay);
    }

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
    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [threshold, rootMargin, animateOnLoad, loadDelay]);

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
   tokens & sizing
------------------------------------------------------------------- */
const UNIT = "1.78cqw";
const GRAIN =
  "radial-gradient(rgba(0,0,0,0.18) 0.6px, transparent 0.7px)";

const printFrame: CSSProperties = {
  border: "0.35em solid #fff",
  boxShadow:
    "0 0.05em 0.1em rgba(0,0,0,0.10), 0 0.3em 0.7em rgba(0,0,0,0.10), 0 1em 2em rgba(0,0,0,0.08)",
};

/* ------------------------------------------------------------------
   built-in website mockup (Folder 1: Landing pages / Design)
------------------------------------------------------------------- */
type WebProps = {
  bg: string;
  url: string;
  brand: string;
  headline: string;
  cta: string;
  logo: ReactNode;
  stickers: { logo: ReactNode; size: number; right: number; top: number; rot: number }[];
};

function WebMock({ bg, url, brand, headline, cta, logo, stickers }: WebProps) {
  return (
    <div
      className="h-full w-full overflow-hidden bg-white select-none"
      style={{ borderRadius: "1.6em", ...printFrame }}
    >
      <div
        className="flex items-center"
        style={{ gap: "0.5em", padding: "0.8em 1em", borderBottom: "0.05em solid #eee" }}
      >
        {["#ff7b72", "#ffd166", "#4cd97b"].map((c) => (
          <span
            key={c}
            style={{
              width: "0.7em",
              height: "0.7em",
              borderRadius: 999,
              background: c,
              boxShadow: "inset 0 0.08em 0.1em rgba(255,255,255,0.6), 0 0.05em 0.1em rgba(0,0,0,0.2)",
            }}
          />
        ))}
        <span
          className="truncate text-zinc-500 font-mono"
          style={{
            marginLeft: "0.8em",
            fontSize: "0.85em",
            padding: "0.2em 1em",
            borderRadius: 999,
            background: "#f4f4f5",
            boxShadow: "inset 0 0.08em 0.15em rgba(0,0,0,0.08)",
          }}
        >
          {url}
        </span>
      </div>

      <div className="relative" style={{ background: bg, height: "100%", padding: "1.2em" }}>
        <div className="flex items-center" style={{ gap: "0.6em" }}>
          <div
            style={{ width: "2em", height: "2em" }}
            className="flex items-center justify-center rounded-lg bg-white p-1 shadow-xs border border-zinc-200/60 select-none"
          >
            {logo}
          </div>
          <span className="font-semibold text-zinc-900" style={{ fontSize: "1.1em" }}>
            {brand}
          </span>
          <span className="ml-auto flex" style={{ gap: "0.5em" }}>
            {[3, 2.4, 2.8].map((w, i) => (
              <span
                key={i}
                style={{ width: `${w}em`, height: "0.5em", borderRadius: 999, background: "#0000001a" }}
              />
            ))}
          </span>
        </div>

        <p
          className="font-medium leading-[1.1] tracking-tight text-zinc-900"
          style={{ marginTop: "1.6em", maxWidth: "62%", fontSize: "2.1em" }}
        >
          {headline}
        </p>

        <span
          className="inline-block font-medium text-white shadow-xs"
          style={{
            marginTop: "1em",
            fontSize: "1em",
            padding: "0.5em 1.1em",
            borderRadius: "0.8em",
            background: "linear-gradient(180deg,#3f3f46,#18181b)",
            boxShadow: "inset 0 0.08em 0 #ffffff22, 0 0.1em 0.2em rgba(0,0,0,0.25)",
          }}
        >
          {cta}
        </span>

        {stickers.map((s, i) => (
          <div
            key={i}
            className="pointer-events-none absolute select-none flex items-center justify-center rounded-xl bg-white p-1.5 shadow-md border border-zinc-200/90"
            style={{
              width: `${s.size}em`,
              height: `${s.size}em`,
              right: `${s.right}em`,
              top: `${s.top}em`,
              rotate: `${s.rot}deg`,
            }}
          >
            {s.logo}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   built-in phone mockup (Folder 2: Mobile Apps / Dev Q&A)
------------------------------------------------------------------- */
type PhoneProps = {
  bg: string;
  title: string;
  hero: ReactNode;
  heroBg: string;
  chips: string[];
  tiles: ReactNode[];
};

function PhoneMock({ bg, title, hero, heroBg, chips, tiles }: PhoneProps) {
  return (
    <div
      className="h-full w-full overflow-hidden bg-white select-none"
      style={{ borderRadius: "2.6em", ...printFrame }}
    >
      <div className="relative h-full" style={{ background: bg, padding: "0.9em 1em" }}>
        <div className="mx-auto bg-zinc-900" style={{ width: "4.4em", height: "1.2em", borderRadius: 999 }} />
        <p className="font-semibold text-zinc-900" style={{ marginTop: "1em", fontSize: "1.3em" }}>
          {title}
        </p>

        <div className="flex" style={{ gap: "0.4em", marginTop: "0.6em" }}>
          {chips.map((c, i) => (
            <span
              key={c}
              className={i === 0 ? "bg-zinc-900 text-white font-medium" : "bg-white text-zinc-600 font-medium"}
              style={{
                fontSize: "0.85em",
                padding: "0.25em 0.8em",
                borderRadius: 999,
                boxShadow: "0 0.05em 0.15em rgba(0,0,0,0.12)",
              }}
            >
              {c}
            </span>
          ))}
        </div>

        <div
          className="relative flex items-center justify-center"
          style={{
            marginTop: "0.9em",
            height: "7.4em",
            borderRadius: "1.4em",
            background: heroBg,
            boxShadow: "inset 0 0.1em 0 #ffffff99, inset 0 -0.15em 0.4em rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              width: "4.4em",
              height: "4.4em",
              rotate: "-8deg",
            }}
            className="flex items-center justify-center rounded-2xl bg-white p-2.5 shadow-md border border-zinc-200/90"
          >
            {hero}
          </div>
        </div>

        <div className="grid grid-cols-2" style={{ gap: "0.6em", marginTop: "0.7em" }}>
          {tiles.map((t, idx) => (
            <div
              key={idx}
              className="relative bg-white flex items-center justify-center p-2"
              style={{
                height: "4.4em",
                borderRadius: "1.1em",
                boxShadow: "0 0.05em 0.15em rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ width: "2.4em", height: "2.4em" }} className="flex items-center justify-center">
                {t}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   The Colored Folder (Green or Blue)
------------------------------------------------------------------- */
type Card = {
  left: number;
  width: number;
  rot: number;
  lift: number;
  node: ReactNode;
};

type FolderTone = "green" | "blue";

const FOLDER_THEMES: Record<
  FolderTone,
  {
    backBg: string;
    tabBg: string;
    frontBg: string;
    shadowColor: string;
    textColor: string;
    tabTextColor: string;
  }
> = {
  green: {
    backBg: "linear-gradient(180deg, #c4ebb4 0%, #a2df8d 100%)",
    tabBg: "linear-gradient(180deg, #dbf5ce 0%, #b8eca3 100%)",
    frontBg: "linear-gradient(180deg, #ecf9dc 0%, #d5f3bd 45%, #bdeba0 100%)",
    shadowColor: "rgba(60, 130, 45, 0.22)",
    textColor: "text-emerald-950",
    tabTextColor: "text-emerald-900/70",
  },
  blue: {
    backBg: "linear-gradient(180deg, #b9d5ff 0%, #9fc4fd 100%)",
    tabBg: "linear-gradient(180deg, #d8e8ff 0%, #b8d6ff 100%)",
    frontBg: "linear-gradient(180deg, #eef5ff 0%, #d8e8ff 45%, #c2dcfe 100%)",
    shadowColor: "rgba(30, 80, 170, 0.22)",
    textColor: "text-blue-950",
    tabTextColor: "text-blue-900/70",
  },
};

type FolderProps = {
  tone: FolderTone;
  title: string;
  stamp: ReactNode;
  stampRot: number;
  cards: Card[];
  avatars: { logo: ReactNode; bg: string; title: string }[];
};

function Folder({ tone, title, stamp, stampRot, cards, avatars }: FolderProps) {
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hover || pinned;

  const theme = FOLDER_THEMES[tone];

  return (
    <div className="flex w-full flex-col items-center">
      <button
        type="button"
        aria-label={`${title} - Click to expand folder preview`}
        aria-pressed={pinned}
        onClick={() => setPinned((p) => !p)}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        className="block w-full cursor-pointer outline-none transition-transform duration-300 hover:-translate-y-1.5"
        style={{ containerType: "inline-size" }}
      >
        <div className="relative w-full" style={{ fontSize: UNIT, aspectRatio: "1.2 / 1" }}>
          {/* contact shadow on the surface */}
          <div
            className="absolute inset-x-[6%] bottom-[-1.5%] h-[5%]"
            style={{
              borderRadius: "50%",
              background: theme.shadowColor,
              boxShadow: `0 0 1.6em 0.4em ${theme.shadowColor}`,
              scale: open ? "0.94 1" : "1 1",
              transition: "scale 300ms ease-out",
            }}
          />

          {/* back panel (recessed inside) */}
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              top: "6%",
              borderRadius: "2.8em",
              background: theme.backBg,
              boxShadow:
                "inset 0 0.3em 0.6em rgba(0,0,0,0.12), inset 0 -0.1em 0 #ffffffaa, 0 0.1em 0.2em rgba(0,0,0,0.06)",
            }}
          />

          {/* tab */}
          <div
            className="absolute left-0 flex items-center pl-6"
            style={{
              top: 0,
              width: "22em",
              height: "8em",
              borderRadius: "2.8em 2.8em 0 0",
              background: theme.tabBg,
              boxShadow: "inset 0 0.12em 0 #ffffffbb, 0 -0.05em 0.2em rgba(0,0,0,0.05)",
            }}
          >
            <span className={`font-mono text-[9px] font-bold ${theme.tabTextColor} uppercase tracking-widest -mt-4`}>
              TabSpace / Workspace
            </span>
          </div>

          {/* peeking previews */}
          <div className="absolute inset-x-0" style={{ top: "4%", height: "70%" }}>
            {cards.map((c, i) => (
              <div
                key={i}
                className="absolute top-0 h-full"
                style={{
                  left: `${c.left}%`,
                  width: `${c.width}%`,
                  zIndex: i + 1,
                  rotate: `${c.rot + (open ? c.rot * 0.6 : 0)}deg`,
                  translate: `0 ${open ? c.lift - 5 : c.lift}em`,
                  transition: `translate 600ms ${SPRING} ${i * 40}ms, rotate 600ms ${SPRING} ${i * 40}ms`,
                }}
              >
                {c.node}
              </div>
            ))}
          </div>

          {/* front panel: frosted, bevelled, with subtle grain */}
          <div
            className="absolute inset-x-0 bottom-0 overflow-visible"
            style={{
              height: "66%",
              zIndex: 10,
              borderRadius: "2.8em",
              background: theme.frontBg,
              border: "0.24em solid rgba(255,255,255,0.95)",
              boxShadow: [
                "inset 0 0.18em 0 #fff",
                "inset 0 -0.2em 0.5em rgba(0,0,0,0.06)",
                "0 -0.1em 0.4em rgba(0,0,0,0.05)",
                "0 0.1em 0.15em rgba(0,0,0,0.08)",
                "0 0.8em 1.6em rgba(0,0,0,0.08)",
                "0 2em 3em rgba(0,0,0,0.06)",
              ].join(","),
            }}
          >
            {/* grain */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                borderRadius: "inherit",
                backgroundImage: GRAIN,
                backgroundSize: "3px 3px",
                opacity: 0.05,
              }}
            />

            {/* clipped stamp - perfectly aligned and non-distorted */}
            <div
              className="absolute z-20"
              style={{
                right: "1.8em",
                top: "-1.8em",
                rotate: `${stampRot + (open ? 5 : 0)}deg`,
                transition: `rotate 600ms ${SPRING}`,
              }}
            >
              {stamp}
            </div>

            {/* raised avatar discs */}
            <div className="absolute flex" style={{ left: "2em", bottom: "2em" }}>
              {avatars.map((a, i) => (
                <span
                  key={i}
                  title={a.title}
                  className="relative block overflow-hidden transition-all duration-200 hover:scale-110 hover:-translate-y-1 cursor-pointer"
                  style={{
                    width: "4.8em",
                    height: "4.8em",
                    marginLeft: i ? "-1em" : 0,
                    borderRadius: 999,
                    background: a.bg,
                    border: "0.35em solid #fff",
                    boxShadow:
                      "inset 0 -0.15em 0.3em rgba(0,0,0,0.08), 0 0.1em 0.2em rgba(0,0,0,0.14), 0 0.4em 0.8em rgba(0,0,0,0.08)",
                  }}
                >
                  <div className="flex h-full w-full items-center justify-center p-[18%] select-none">
                    {a.logo}
                  </div>
                </span>
              ))}
            </div>

            {/* Hint text */}
            <div className="absolute right-[2em] bottom-[2.5em] flex items-center gap-1.5 font-mono text-[9px] text-zinc-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{open ? "Pinned open" : "Hover / Click to lift"}</span>
            </div>
          </div>
        </div>
      </button>

      {/* letterpress title */}
      <h3
        className="mt-8 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-800 text-center"
        style={{ textShadow: "0 1px 0 #fff" }}
      >
        {title}
      </h3>
    </div>
  );
}

/* ------------------------------------------------------------------
   Section: Personalized Workspace Folders (No outer border)
------------------------------------------------------------------- */
export default function FolderReveal() {
  const [sectionRef, inView] = useInView({ loadDelay: 150 });

  /* ---------- Folder 1: GREEN (Website Landing Pages & Inspirations) ---------- */
  const webMocks: ReactNode[] = [
    <WebMock
      key="w1"
      bg="#fff7ed"
      url="stackoverflow.com"
      brand="Stack Overflow"
      headline="Solutions that unblock your daily build."
      cta="View solution"
      logo={<StackOverflowLogo className="h-full w-full" color="#F48024" />}
      stickers={[
        { logo: <PostgresLogo className="h-full w-full" color="#336791" />, size: 4.8, right: 1.2, top: 4.2, rot: 12 },
        { logo: <GithubLogo className="h-full w-full" color="#18181b" />, size: 3.6, right: 8.4, top: 9.4, rot: -8 },
      ]}
    />,
    <WebMock
      key="w2"
      bg="#fdf2f8"
      url="dribbble.com/shots"
      brand="Dribbble"
      headline="UI visual craft with loud personality."
      cta="Save to TabSpace"
      logo={<DribbbleLogo className="h-full w-full" color="#EA4C89" />}
      stickers={[
        { logo: <FigmaLogo className="h-full w-full" />, size: 4.6, right: 1.2, top: 4, rot: -10 },
        { logo: <TailwindLogo className="h-full w-full" color="#06B6D4" />, size: 3.6, right: 7.6, top: 10, rot: 8 },
      ]}
    />,
    <WebMock
      key="w3"
      bg="#f4f4f5"
      url="github.com/trending"
      brand="GitHub"
      headline="Ship the thing. Star the repository."
      cta="1-Click capture"
      logo={<GithubLogo className="h-full w-full" color="#18181b" />}
      stickers={[
        { logo: <NextjsLogo className="h-full w-full" color="#000000" />, size: 4.4, right: 1.2, top: 4.4, rot: 10 },
        { logo: <LinearLogo className="h-full w-full" color="#5E6AD2" />, size: 3.6, right: 7.8, top: 9.8, rot: -12 },
      ]}
    />,
  ];

  /* ---------- Folder 2: BLUE (Mobile Apps & Developer Tools) ---------- */
  const phoneMocks: ReactNode[] = [
    <PhoneMock
      key="p1"
      bg="#fff7ed"
      title="Stack Solutions"
      hero={<StackOverflowLogo className="h-full w-full" color="#F48024" />}
      heroBg="#ffedd5"
      chips={["Questions", "Verified"]}
      tiles={[
        <PostgresLogo key="t1" className="h-full w-full" color="#336791" />,
        <NextjsLogo key="t2" className="h-full w-full" color="#000000" />,
      ]}
    />,
    <PhoneMock
      key="p2"
      bg="#fdf2f8"
      title="UI Inspirations"
      hero={<DribbbleLogo className="h-full w-full" color="#EA4C89" />}
      heroBg="#fce7f3"
      chips={["Bento", "Mobile"]}
      tiles={[
        <FigmaLogo key="t3" className="h-full w-full" />,
        <TailwindLogo key="t4" className="h-full w-full" color="#06B6D4" />,
      ]}
    />,
    <PhoneMock
      key="p3"
      bg="#f0fdf4"
      title="Database Sync"
      hero={<NeonLogo className="h-full w-full" color="#00E599" />}
      heroBg="#dcfce7"
      chips={["Serverless", "GIN"]}
      tiles={[
        <PrismaLogo key="t5" className="h-full w-full" color="#16a34a" />,
        <TypeScriptLogo key="t6" className="h-full w-full" />,
      ]}
    />,
  ];

  const webCards: Card[] = [
    { left: 3, width: 46, rot: -4, lift: 1.4, node: webMocks[0] },
    { left: 27, width: 46, rot: 2, lift: -1.6, node: webMocks[1] },
    { left: 51, width: 46, rot: 5, lift: 0.4, node: webMocks[2] },
  ];

  const phoneCards: Card[] = [
    { left: 6, width: 29, rot: -5, lift: 1.6, node: phoneMocks[0] },
    { left: 35.5, width: 29, rot: 1, lift: -1.8, node: phoneMocks[1] },
    { left: 65, width: 29, rot: 6, lift: 0.6, node: phoneMocks[2] },
  ];

  return (
    <section
      ref={sectionRef}
      id="workspaces"
      className="relative z-10 mx-auto max-w-6xl w-full px-4 pt-10 pb-16 sm:px-8"
    >
      <div className="w-full">
        {/* Section header */}
        <div className="mx-auto mb-16 flex max-w-2xl flex-col items-center text-center">
          <MotionBlur inView={inView} delay={0}>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-500 rounded-full bg-white px-3.5 py-1 border border-zinc-200/80 shadow-xs">
              Organized Workspace Folders
            </span>
            <h2 className="mt-4 font-sans text-4xl font-normal leading-[1.15] tracking-tight text-zinc-900 sm:text-5xl">
              Personalized folders that keep track of everything.
            </h2>
            <p className="mt-3 text-base text-zinc-600 leading-relaxed max-w-lg">
              Hover or click any folder to reveal its contents. Keep your design inspirations, Stack Overflow answers, and developer repositories sorted into dedicated workspaces.
            </p>
          </MotionBlur>
        </div>

        {/* 2-Folder Grid: One GREEN and One BLUE */}
        <div className="grid w-full grid-cols-1 items-start gap-14 md:grid-cols-2 md:gap-8 lg:gap-16">
          {/* Folder 1: GREEN (Website Landing Pages & Inspirations) */}
          <MotionBlur inView={inView} delay={200} className="w-full">
            <Folder
              tone="green"
              title="Landing pages & Design"
              avatars={[
                { logo: <DribbbleLogo className="h-full w-full" color="#EA4C89" />, bg: "#fdf2f8", title: "Dribbble" },
                { logo: <FigmaLogo className="h-full w-full" />, bg: "#f5f3ff", title: "Figma" },
                { logo: <TailwindLogo className="h-full w-full" color="#06B6D4" />, bg: "#ecfeff", title: "Tailwind CSS" },
              ]}
              stampRot={-4}
              cards={webCards}
              stamp={
                <div className="inline-flex items-center gap-2.5 rounded-2xl bg-white px-3 py-2 shadow-xl border border-zinc-200/90 select-none whitespace-nowrap">
                  <div className="shrink-0 w-[28px] h-[28px] min-w-[28px] min-h-[28px] max-w-[28px] max-h-[28px] overflow-hidden rounded-lg bg-white border border-zinc-100 shadow-xs flex items-center justify-center">
                    <img
                      src="/tabspace-logo.jpg"
                      alt="TabSpace"
                      className="w-[28px] h-[28px] object-cover rounded-lg"
                    />
                  </div>
                  <div className="text-left">
                    <span className="block font-mono text-[9px] font-bold text-rose-500 uppercase tracking-wider leading-none">
                      Inspiration Vault
                    </span>
                    <span className="block font-sans text-[11px] font-semibold text-zinc-900 leading-tight mt-0.5">
                      38 Design Links
                    </span>
                  </div>
                </div>
              }
            />
          </MotionBlur>

          {/* Folder 2: BLUE (Mobile Apps & Developer Tools) */}
          <MotionBlur inView={inView} delay={340} className="w-full">
            <Folder
              tone="blue"
              title="Mobile apps & Solved Q&A"
              avatars={[
                { logo: <StackOverflowLogo className="h-full w-full" color="#F48024" />, bg: "#fff7ed", title: "Stack Overflow" },
                { logo: <GithubLogo className="h-full w-full" color="#18181b" />, bg: "#f4f4f5", title: "GitHub" },
                { logo: <NextjsLogo className="h-full w-full" color="#000000" />, bg: "#ffffff", title: "Next.js" },
              ]}
              stampRot={5}
              cards={phoneCards}
              stamp={
                <div className="flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2 shadow-xl border border-zinc-200/90 select-none whitespace-nowrap">
                  <div className="shrink-0 flex h-7 w-7 aspect-square min-w-[28px] min-h-[28px] items-center justify-center rounded-lg bg-orange-500 text-white font-bold p-1 shadow-xs">
                    <StackOverflowLogo className="h-full w-full" color="#ffffff" />
                  </div>
                  <div className="text-left">
                    <span className="block font-mono text-[9px] font-bold text-orange-600 uppercase tracking-wider leading-none">
                      Solved Answers
                    </span>
                    <span className="block font-sans text-[11px] font-semibold text-zinc-900 leading-tight mt-0.5">
                      Stack Overflow & Repos
                    </span>
                  </div>
                </div>
              }
            />
          </MotionBlur>
        </div>
      </div>
    </section>
  );
}
