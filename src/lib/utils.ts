import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + "...";
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function detectPlatform(
  url: string
): "linkedin" | "github" | "gitlab" | "instagram" | "glassdoor" | "meetup" | "other" {
  const lower = url.toLowerCase();
  if (lower.includes("linkedin.com")) return "linkedin";
  if (lower.includes("github.com")) return "github";
  if (lower.includes("gitlab.com")) return "gitlab";
  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("glassdoor.com")) return "glassdoor";
  if (lower.includes("meetup.com")) return "meetup";
  return "other";
}

export const INTENT_LABELS: Record<string, string> = {
  job_seeker: "Job Seeker",
  student: "Student / Academic",
  project_showcase: "Project Showcase",
  entrepreneur: "Entrepreneur / Founder",
  speaker: "Speaker / Presenter",
  general: "General Profile",
};

export const INTENT_DESCRIPTIONS: Record<string, string> = {
  job_seeker: "Highlight work experience, skills, and career achievements",
  student: "Showcase academic projects, GPA, research, and extracurriculars",
  project_showcase: "Deep-dive into technical projects and their impact",
  entrepreneur: "Present your startup, traction, and vision",
  speaker: "Establish credibility, topics, and speaking experience",
  general: "Balanced overview of your professional profile",
};

export const PRESENTATION_TYPE_LABELS: Record<string, string> = {
  sales_pitch: "Sales Pitch",
  academic: "Academic Presentation",
  awareness: "Awareness / Advocacy",
  marketing: "Marketing",
  investor_pitch: "Investor Pitch",
  portfolio: "Portfolio Showcase",
  keynote: "Keynote / Talk",
  workshop: "Workshop / Training",
};

export const PRESENTATION_TYPE_DESCRIPTIONS: Record<string, string> = {
  sales_pitch: "Convert prospects — focus on value, ROI, and next steps",
  academic: "Rigorous, evidence-based — methodology, findings, citations",
  awareness: "Educate and inspire action on a cause or topic",
  marketing: "Brand storytelling, differentiation, and audience engagement",
  investor_pitch: "Traction, market size, team, and ask — investor-ready",
  portfolio: "Curated work samples with context and outcomes",
  keynote: "Big ideas, memorable moments, and audience takeaways",
  workshop: "Step-by-step learning with exercises and key concepts",
};

export const PRESENTATION_TYPE_ICONS: Record<string, string> = {
  sales_pitch: "🤝",
  academic: "🎓",
  awareness: "📢",
  marketing: "📣",
  investor_pitch: "💰",
  portfolio: "🗂️",
  keynote: "🎤",
  workshop: "🛠️",
};

export const AUDIENCE_LABELS: Record<string, string> = {
  general: "General Audience",
  academics: "Academics / Researchers",
  investors: "Investors / VCs",
  economists: "Economists / Policy Makers",
  engineers: "Engineers / Developers",
  executives: "Executives / C-Suite",
  students: "Students",
  customers: "Customers / Clients",
  recruiters: "Recruiters / HR",
  media: "Media / Press",
};

export const AUDIENCE_DESCRIPTIONS: Record<string, string> = {
  general: "Accessible language, broad appeal, no jargon",
  academics: "Peer-reviewed tone, methodology, citations matter",
  investors: "ROI focus, market size, risk/reward, traction",
  economists: "Data-driven, policy implications, macro context",
  engineers: "Technical depth, architecture, implementation details",
  executives: "Strategic impact, KPIs, bottom-line outcomes",
  students: "Relatable, educational, inspiring and aspirational",
  customers: "Benefits over features, trust signals, clear CTA",
  recruiters: "Skills, achievements, culture fit, career trajectory",
  media: "Newsworthy angle, quotable moments, story arc",
};

export const AUDIENCE_ICONS: Record<string, string> = {
  general: "🌍",
  academics: "🔬",
  investors: "📈",
  economists: "📊",
  engineers: "⚙️",
  executives: "🏢",
  students: "📚",
  customers: "🛒",
  recruiters: "🔍",
  media: "📰",
};
