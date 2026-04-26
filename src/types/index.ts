export type Intent =
  | "job_seeker"
  | "student"
  | "project_showcase"
  | "entrepreneur"
  | "speaker"
  | "general";

export type PresentationType =
  | "sales_pitch"
  | "academic"
  | "awareness"
  | "marketing"
  | "investor_pitch"
  | "portfolio"
  | "keynote"
  | "workshop";

export type TargetAudience =
  | "general"
  | "academics"
  | "investors"
  | "economists"
  | "engineers"
  | "executives"
  | "students"
  | "customers"
  | "recruiters"
  | "media";

export interface ContactInfo {
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  twitter?: string;
  location?: string;
}

export interface Reference {
  name: string;
  title?: string;
  company?: string;
  url?: string;
}

export interface SlideGenerationInput {
  intent: Intent;
  presentationType: PresentationType;
  targetAudience: TargetAudience;
  customIntent?: string;
  sourceType: "file" | "url" | "text";
  sourceContent: string; // raw extracted text
  sourceUrl?: string;
  photoBase64?: string; // base64 encoded photo
  contact: ContactInfo;
  references?: Reference[];
  name?: string;
  tagline?: string;
}

export interface Slide {
  id: string;
  type:
    | "cover"
    | "summary"
    | "experience"
    | "skills"
    | "projects"
    | "education"
    | "achievements"
    | "contact";
  title: string;
  subtitle?: string;
  bullets?: string[];
  highlights?: { label: string; value: string }[];
  tags?: string[];
  content?: string;
  icon?: string;
}

export interface GeneratedPresentation {
  slides: Slide[];
  theme: "professional" | "modern" | "minimal" | "bold";
  name: string;
  tagline: string;
  qrUrl?: string;
}

export interface GenerateRequest {
  intent: Intent;
  presentationType: PresentationType;
  targetAudience: TargetAudience;
  customIntent?: string;
  sourceType: "file" | "url" | "text";
  sourceUrl?: string;
  rawText?: string;
  fileBase64?: string;
  fileType?: string;
  photoBase64?: string;
  contact: ContactInfo;
  references?: Reference[];
  name?: string;
  tagline?: string;
  theme?: "professional" | "modern" | "minimal" | "bold";
}
