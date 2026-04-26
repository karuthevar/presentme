"use client";

import { cn } from "@/lib/utils";
import type { Slide, ContactInfo, Reference } from "@/types";

interface Props {
  slide: Slide;
  theme: "professional" | "modern" | "minimal" | "bold";
  photoBase64: string | null;
  contact: ContactInfo;
  references: Reference[];
  qrUrl?: string;
  totalSlides: number;
  currentIndex: number;
  isThumbnail?: boolean;
}

const THEMES = {
  professional: {
    bg: "bg-slate-900",
    accent: "text-indigo-400",
    accentBg: "bg-indigo-500/10",
    accentBorder: "border-indigo-500/30",
    accentSolid: "bg-indigo-500",
    text: "text-white",
    subtext: "text-slate-400",
    card: "bg-slate-800/60",
    bullet: "text-indigo-400",
    tag: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20",
    gradient: "from-slate-900 via-slate-900 to-indigo-950",
    highlightCard: "bg-slate-800 border border-slate-700",
  },
  modern: {
    bg: "bg-zinc-950",
    accent: "text-purple-400",
    accentBg: "bg-purple-500/10",
    accentBorder: "border-purple-500/30",
    accentSolid: "bg-purple-500",
    text: "text-white",
    subtext: "text-zinc-400",
    card: "bg-zinc-900/60",
    bullet: "text-purple-400",
    tag: "bg-purple-500/15 text-purple-300 border border-purple-500/20",
    gradient: "from-zinc-950 via-zinc-950 to-purple-950",
    highlightCard: "bg-zinc-900 border border-zinc-800",
  },
  minimal: {
    bg: "bg-white",
    accent: "text-slate-800",
    accentBg: "bg-slate-100",
    accentBorder: "border-slate-300",
    accentSolid: "bg-slate-800",
    text: "text-slate-900",
    subtext: "text-slate-500",
    card: "bg-slate-50",
    bullet: "text-slate-600",
    tag: "bg-slate-100 text-slate-700 border border-slate-200",
    gradient: "from-white via-white to-slate-50",
    highlightCard: "bg-slate-100 border border-slate-200",
  },
  bold: {
    bg: "bg-violet-950",
    accent: "text-amber-400",
    accentBg: "bg-amber-500/10",
    accentBorder: "border-amber-500/30",
    accentSolid: "bg-amber-500",
    text: "text-amber-50",
    subtext: "text-violet-300",
    card: "bg-violet-900/60",
    bullet: "text-amber-400",
    tag: "bg-amber-500/15 text-amber-300 border border-amber-500/20",
    gradient: "from-violet-950 via-violet-950 to-purple-950",
    highlightCard: "bg-violet-900 border border-violet-800",
  },
};

export default function SlideRenderer({
  slide,
  theme,
  photoBase64,
  contact,
  references,
  qrUrl,
  totalSlides,
  currentIndex,
  isThumbnail = false,
}: Props) {
  const t = THEMES[theme] || THEMES.professional;

  const baseClass = cn(
    "w-full h-full flex flex-col justify-center relative overflow-hidden bg-gradient-to-br",
    t.gradient,
    isThumbnail ? "p-3 text-[8px]" : "p-12 sm:p-16"
  );

  // Decorative background element
  const Decoration = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className={cn(
          "absolute -top-1/2 -right-1/4 w-3/4 h-full rounded-full opacity-5",
          t.accentSolid
        )}
        style={{ filter: "blur(80px)" }}
      />
      <div
        className={cn(
          "absolute -bottom-1/2 -left-1/4 w-1/2 h-full rounded-full opacity-5",
          t.accentSolid
        )}
        style={{ filter: "blur(60px)" }}
      />
    </div>
  );

  // Slide number indicator
  const SlideNum = () => (
    <div
      className={cn(
        "absolute bottom-4 right-6 text-xs opacity-30",
        t.text,
        isThumbnail && "hidden"
      )}
    >
      {currentIndex + 1} / {totalSlides}
    </div>
  );

  if (slide.type === "cover") {
    return (
      <div className={baseClass}>
        <Decoration />
        <SlideNum />

        {/* Photo */}
        {photoBase64 && !isThumbnail && (
          <div
            className={cn(
              "absolute top-10 right-14 w-24 h-24 rounded-full overflow-hidden border-2",
              t.accentBorder
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/jpeg;base64,${photoBase64}`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Accent line */}
        <div
          className={cn(
            "w-12 h-1 rounded-full mb-6",
            t.accentSolid,
            isThumbnail && "w-4 h-0.5 mb-1"
          )}
        />

        <h1
          className={cn(
            "font-black leading-tight",
            t.text,
            isThumbnail ? "text-sm" : "text-5xl sm:text-6xl",
            photoBase64 && !isThumbnail ? "max-w-[70%]" : "max-w-full"
          )}
        >
          {slide.title}
        </h1>

        {slide.subtitle && (
          <p
            className={cn(
              "mt-3 font-medium",
              t.subtext,
              isThumbnail ? "text-[6px]" : "text-xl"
            )}
          >
            {slide.subtitle}
          </p>
        )}

        {/* Bottom accent */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-1",
            t.accentSolid,
            "opacity-60"
          )}
        />
      </div>
    );
  }

  if (slide.type === "contact") {
    const contactItems = [
      contact.email && { icon: "✉", label: contact.email },
      contact.phone && { icon: "📱", label: contact.phone },
      contact.linkedin && { icon: "💼", label: contact.linkedin },
      contact.github && { icon: "🐙", label: contact.github },
      contact.website && { icon: "🌐", label: contact.website },
      contact.twitter && { icon: "𝕏", label: contact.twitter },
      contact.location && { icon: "📍", label: contact.location },
    ].filter(Boolean) as { icon: string; label: string }[];

    return (
      <div className={baseClass}>
        <Decoration />
        <SlideNum />

        <div className="flex gap-8 h-full items-center">
          <div className="flex-1">
            <div
              className={cn(
                "w-8 h-1 rounded-full mb-4",
                t.accentSolid,
                isThumbnail && "w-3 h-0.5 mb-1"
              )}
            />
            <h2
              className={cn(
                "font-bold mb-6",
                t.text,
                isThumbnail ? "text-xs mb-1" : "text-3xl"
              )}
            >
              {slide.title}
            </h2>

            <div
              className={cn(
                "grid grid-cols-1 gap-3",
                isThumbnail && "gap-0.5"
              )}
            >
              {contactItems.map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-3",
                    isThumbnail && "gap-1"
                  )}
                >
                  <span className={isThumbnail ? "text-[6px]" : "text-base"}>
                    {item.icon}
                  </span>
                  <span
                    className={cn(
                      t.subtext,
                      isThumbnail ? "text-[5px]" : "text-sm"
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {references.length > 0 && !isThumbnail && (
              <div className="mt-6">
                <div
                  className={cn(
                    "text-xs uppercase tracking-widest mb-2 opacity-50",
                    t.text
                  )}
                >
                  References
                </div>
                {references.slice(0, 3).map((ref, i) => (
                  <div key={i} className={cn("text-sm mb-1", t.subtext)}>
                    <span className={cn("font-medium", t.text)}>
                      {ref.name}
                    </span>
                    {ref.title && ` · ${ref.title}`}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* QR Code */}
          {qrUrl && !isThumbnail && (
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="QR Code"
                className={cn(
                  "rounded-xl",
                  theme === "minimal" ? "" : "bg-white p-2",
                  "w-28 h-28"
                )}
              />
              <span
                className={cn(
                  "text-xs opacity-40 text-center",
                  t.text
                )}
              >
                Scan to connect
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Generic content slide
  return (
    <div className={baseClass}>
      <Decoration />
      <SlideNum />

      <div
        className={cn(
          "w-8 h-1 rounded-full mb-4",
          t.accentSolid,
          isThumbnail && "w-3 h-0.5 mb-1"
        )}
      />

      <h2
        className={cn(
          "font-bold mb-2",
          t.text,
          isThumbnail ? "text-xs mb-1" : "text-3xl"
        )}
      >
        {slide.icon && !isThumbnail && (
          <span className="mr-2">{slide.icon}</span>
        )}
        {slide.title}
      </h2>

      {slide.subtitle && !isThumbnail && (
        <p className={cn("text-sm mb-4", t.subtext)}>{slide.subtitle}</p>
      )}

      {/* Highlights grid */}
      {slide.highlights && slide.highlights.length > 0 && (
        <div
          className={cn(
            "grid gap-3 mb-4",
            slide.highlights.length <= 2
              ? "grid-cols-2"
              : slide.highlights.length === 3
              ? "grid-cols-3"
              : "grid-cols-4",
            isThumbnail && "gap-0.5 mb-1"
          )}
        >
          {slide.highlights.map((h, i) => (
            <div
              key={i}
              className={cn(
                "rounded-xl text-center",
                t.highlightCard,
                isThumbnail ? "p-1" : "p-4"
              )}
            >
              <div
                className={cn(
                  "font-black",
                  t.accent,
                  isThumbnail ? "text-[7px]" : "text-2xl"
                )}
              >
                {h.value}
              </div>
              <div
                className={cn(
                  "uppercase tracking-wider opacity-60",
                  t.text,
                  isThumbnail ? "text-[4px]" : "text-xs mt-1"
                )}
              >
                {h.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bullets */}
      {slide.bullets && slide.bullets.length > 0 && (
        <ul
          className={cn(
            "space-y-3",
            isThumbnail && "space-y-0.5"
          )}
        >
          {slide.bullets.map((bullet, i) => (
            <li
              key={i}
              className={cn(
                "flex items-start gap-3",
                isThumbnail && "gap-1"
              )}
            >
              <span
                className={cn(
                  "font-bold flex-shrink-0 mt-0.5",
                  t.bullet,
                  isThumbnail ? "text-[6px]" : "text-base"
                )}
              >
                →
              </span>
              <span
                className={cn(
                  "leading-snug",
                  t.text,
                  isThumbnail ? "text-[5px]" : "text-base"
                )}
              >
                {bullet}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Tags */}
      {slide.tags && slide.tags.length > 0 && (
        <div
          className={cn(
            "flex flex-wrap gap-2 mt-4",
            isThumbnail && "gap-0.5 mt-1"
          )}
        >
          {slide.tags.map((tag, i) => (
            <span
              key={i}
              className={cn(
                "rounded-full font-medium",
                t.tag,
                isThumbnail ? "px-1 py-0.5 text-[4px]" : "px-3 py-1 text-sm"
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
