"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  ArrowLeft,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { GeneratedPresentation, ContactInfo, Reference } from "@/types";
import SlideRenderer from "./SlideRenderer";

interface Props {
  presentation: GeneratedPresentation;
  photoBase64: string | null;
  contact: ContactInfo;
  references: Reference[];
}

export default function SlideViewer({
  presentation,
  photoBase64,
  contact,
  references,
}: Props) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { slides } = presentation;

  function prev() {
    setCurrentSlide((i) => Math.max(0, i - 1));
  }

  function next() {
    setCurrentSlide((i) => Math.min(slides.length - 1, i + 1));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") prev();
    if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
  }

  function toggleFullscreen() {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  }

  function handleDownload() {
    // Generate a standalone HTML file
    const html = generateStandaloneHtml(
      presentation,
      photoBase64,
      contact,
      references
    );
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${presentation.name.replace(/\s+/g, "-").toLowerCase()}-slides.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleShare() {
    const shareData = {
      title: `${presentation.name} — Presentation`,
      text: presentation.tagline,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled
      }
    } else {
      // Fallback: copy current URL
      navigator.clipboard.writeText(window.location.href);
    }
  }

  const slide = slides[currentSlide];

  return (
    <div
      ref={containerRef}
      className={cn(
        "min-h-screen bg-gray-950 flex flex-col",
        isFullscreen && "fixed inset-0 z-50"
      )}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Top bar */}
      <div className="no-print flex items-center justify-between px-4 py-3 border-b border-white/5 bg-gray-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="w-px h-4 bg-white/10" />
          <div className="text-white/70 text-sm font-medium truncate max-w-[200px]">
            {presentation.name}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm transition-all"
          >
            <Share2 size={14} />
            Share
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition-all"
          >
            <Download size={14} />
            Download HTML
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main slide area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl">
          {/* Slide */}
          <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            <SlideRenderer
              slide={slide}
              theme={presentation.theme}
              photoBase64={photoBase64}
              contact={contact}
              references={references}
              qrUrl={presentation.qrUrl}
              totalSlides={slides.length}
              currentIndex={currentSlide}
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={prev}
              disabled={currentSlide === 0}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                currentSlide === 0
                  ? "text-white/20 cursor-not-allowed"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            {/* Slide dots */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={cn(
                    "rounded-full transition-all duration-200",
                    i === currentSlide
                      ? "w-6 h-2 bg-indigo-500"
                      : "w-2 h-2 bg-white/20 hover:bg-white/40"
                  )}
                />
              ))}
            </div>

            <button
              onClick={next}
              disabled={currentSlide === slides.length - 1}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                currentSlide === slides.length - 1
                  ? "text-white/20 cursor-not-allowed"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Slide counter */}
          <div className="text-center text-white/30 text-sm mt-2">
            {currentSlide + 1} / {slides.length}
          </div>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="no-print border-t border-white/5 bg-gray-900/50 px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max mx-auto justify-center">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(i)}
              className={cn(
                "flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200",
                i === currentSlide
                  ? "border-indigo-500 scale-105"
                  : "border-transparent opacity-50 hover:opacity-80"
              )}
            >
              <div className="w-full h-full scale-[0.25] origin-top-left pointer-events-none"
                style={{ width: "400%", height: "400%" }}>
                <SlideRenderer
                  slide={s}
                  theme={presentation.theme}
                  photoBase64={photoBase64}
                  contact={contact}
                  references={references}
                  qrUrl={presentation.qrUrl}
                  totalSlides={slides.length}
                  currentIndex={i}
                  isThumbnail
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function generateStandaloneHtml(
  presentation: GeneratedPresentation,
  photoBase64: string | null,
  contact: ContactInfo,
  references: Reference[]
): string {
  const { slides, theme, name, tagline, qrUrl } = presentation;

  const themeColors = {
    professional: { bg: "#0f172a", accent: "#6366f1", text: "#f8fafc", card: "#1e293b" },
    modern: { bg: "#09090b", accent: "#a855f7", text: "#fafafa", card: "#18181b" },
    minimal: { bg: "#ffffff", accent: "#1e293b", text: "#0f172a", card: "#f8fafc" },
    bold: { bg: "#1a0533", accent: "#f59e0b", text: "#fefce8", card: "#2d1b4e" },
  };

  const colors = themeColors[theme] || themeColors.professional;

  const slidesHtml = slides
    .map(
      (slide, i) => `
    <div class="slide" id="slide-${i}" style="display:${i === 0 ? "flex" : "none"}">
      <div class="slide-number">${i + 1} / ${slides.length}</div>
      ${renderSlideHtml(slide, photoBase64, contact, references, qrUrl, colors)}
    </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name} — Presentation</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #000; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
  .controls { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 12px; z-index: 100; background: rgba(0,0,0,0.7); padding: 10px 20px; border-radius: 50px; backdrop-filter: blur(10px); }
  .btn { background: rgba(255,255,255,0.15); color: white; border: none; padding: 8px 20px; border-radius: 20px; cursor: pointer; font-size: 14px; transition: background 0.2s; }
  .btn:hover { background: rgba(255,255,255,0.25); }
  .btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .counter { color: rgba(255,255,255,0.6); font-size: 14px; display: flex; align-items: center; }
  .slide { width: 100vw; max-width: 960px; aspect-ratio: 16/9; background: ${colors.bg}; color: ${colors.text}; padding: 48px 56px; flex-direction: column; justify-content: center; position: relative; overflow: hidden; }
  .slide-number { position: absolute; bottom: 16px; right: 20px; font-size: 12px; opacity: 0.3; }
  h1 { font-size: 3em; font-weight: 800; line-height: 1.1; }
  h2 { font-size: 2em; font-weight: 700; margin-bottom: 24px; }
  .subtitle { font-size: 1.2em; opacity: 0.6; margin-top: 8px; }
  .tagline { font-size: 1.4em; opacity: 0.7; margin-top: 12px; }
  .accent { color: ${colors.accent}; }
  .bullets { list-style: none; display: flex; flex-direction: column; gap: 12px; }
  .bullets li { display: flex; align-items: flex-start; gap: 12px; font-size: 1.05em; line-height: 1.4; }
  .bullets li::before { content: "→"; color: ${colors.accent}; font-weight: bold; flex-shrink: 0; margin-top: 1px; }
  .highlights { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin: 20px 0; }
  .highlight { background: rgba(255,255,255,0.07); border-radius: 12px; padding: 16px; text-align: center; }
  .highlight-value { font-size: 1.6em; font-weight: 800; color: ${colors.accent}; }
  .highlight-label { font-size: 0.75em; opacity: 0.6; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
  .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
  .tag { background: rgba(255,255,255,0.1); border-radius: 20px; padding: 6px 14px; font-size: 0.85em; }
  .photo { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid ${colors.accent}; position: absolute; top: 40px; right: 56px; }
  .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
  .contact-item { display: flex; align-items: center; gap: 8px; font-size: 0.9em; opacity: 0.8; }
  .qr { position: absolute; bottom: 40px; right: 56px; }
  .qr img { width: 80px; height: 80px; }
  .qr-label { font-size: 0.65em; opacity: 0.5; text-align: center; margin-top: 4px; }
  @media print { .controls { display: none; } .slide { display: flex !important; page-break-after: always; } }
</style>
</head>
<body>
${slidesHtml}
<div class="controls">
  <button class="btn" id="prev" onclick="changeSlide(-1)">← Prev</button>
  <span class="counter" id="counter">1 / ${slides.length}</span>
  <button class="btn" id="next" onclick="changeSlide(1)">Next →</button>
</div>
<script>
  let current = 0;
  const total = ${slides.length};
  function changeSlide(dir) {
    document.getElementById('slide-' + current).style.display = 'none';
    current = Math.max(0, Math.min(total - 1, current + dir));
    document.getElementById('slide-' + current).style.display = 'flex';
    document.getElementById('counter').textContent = (current + 1) + ' / ' + total;
    document.getElementById('prev').disabled = current === 0;
    document.getElementById('next').disabled = current === total - 1;
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') changeSlide(1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') changeSlide(-1);
  });
  document.getElementById('prev').disabled = true;
</script>
</body>
</html>`;
}

function renderSlideHtml(
  slide: { type: string; title: string; subtitle?: string; bullets?: string[]; highlights?: { label: string; value: string }[]; tags?: string[]; icon?: string },
  photoBase64: string | null,
  contact: ContactInfo,
  references: Reference[],
  qrUrl: string | undefined,
  colors: { bg: string; accent: string; text: string; card: string }
): string {
  const photoTag = photoBase64
    ? `<img src="data:image/jpeg;base64,${photoBase64}" class="photo" alt="Profile photo" />`
    : "";

  if (slide.type === "cover") {
    return `
      ${photoTag}
      <div style="max-width: 70%">
        <h1>${slide.title}</h1>
        ${slide.subtitle ? `<div class="tagline">${slide.subtitle}</div>` : ""}
      </div>`;
  }

  if (slide.type === "contact") {
    const contactItems = [
      contact.email && `📧 ${contact.email}`,
      contact.phone && `📱 ${contact.phone}`,
      contact.linkedin && `💼 ${contact.linkedin}`,
      contact.github && `🐙 ${contact.github}`,
      contact.website && `🌐 ${contact.website}`,
      contact.location && `📍 ${contact.location}`,
    ]
      .filter(Boolean)
      .map((item) => `<div class="contact-item">${item}</div>`)
      .join("");

    const refsHtml =
      references.length > 0
        ? `<div style="margin-top:20px"><div style="font-size:0.85em;opacity:0.5;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">References</div>${references
            .map(
              (r) =>
                `<div style="font-size:0.9em;opacity:0.7">${r.name}${r.title ? ` · ${r.title}` : ""}${r.url ? ` <a href="${r.url}" style="color:${colors.accent}">${r.url}</a>` : ""}</div>`
            )
            .join("")}</div>`
        : "";

    return `
      <h2>${slide.title}</h2>
      <div class="contact-grid">${contactItems}</div>
      ${refsHtml}
      ${qrUrl ? `<div class="qr"><img src="${qrUrl}" alt="QR Code" /><div class="qr-label">Scan to connect</div></div>` : ""}`;
  }

  const bulletsHtml =
    slide.bullets?.length
      ? `<ul class="bullets">${slide.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`
      : "";

  const highlightsHtml =
    slide.highlights?.length
      ? `<div class="highlights">${slide.highlights
          .map(
            (h) =>
              `<div class="highlight"><div class="highlight-value">${h.value}</div><div class="highlight-label">${h.label}</div></div>`
          )
          .join("")}</div>`
      : "";

  const tagsHtml =
    slide.tags?.length
      ? `<div class="tags">${slide.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>`
      : "";

  return `
    <h2>${slide.icon ? slide.icon + " " : ""}${slide.title}</h2>
    ${slide.subtitle ? `<div class="subtitle">${slide.subtitle}</div>` : ""}
    ${highlightsHtml}
    ${bulletsHtml}
    ${tagsHtml}`;
}
