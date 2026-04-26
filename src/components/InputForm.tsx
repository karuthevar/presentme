"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  Link,
  FileText,
  User,
  Mail,
  Phone,
  Globe,
  Github,
  Linkedin,
  Twitter,
  MapPin,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Camera,
} from "lucide-react";
import { cn, INTENT_LABELS, INTENT_DESCRIPTIONS, PRESENTATION_TYPE_LABELS, PRESENTATION_TYPE_DESCRIPTIONS, PRESENTATION_TYPE_ICONS, AUDIENCE_LABELS, AUDIENCE_DESCRIPTIONS, AUDIENCE_ICONS, isValidUrl } from "@/lib/utils";
import type { GenerateRequest, Intent, PresentationType, TargetAudience, ContactInfo, Reference } from "@/types";

const CONTEXT_URL_PLACEHOLDERS: Partial<Record<Intent, string>> = {
  job_seeker: "https://jobs.company.com/senior-engineer-123",
  student: "https://university.edu/program/cs",
  project_showcase: "https://github.com/org/project",
  entrepreneur: "https://techcrunch.com/article-about-market",
  speaker: "https://conference.com/cfp",
  general: "https://...",
};

const CONTEXT_URL_DESCRIPTIONS: Partial<Record<Intent, string>> = {
  job_seeker: "Paste the job description URL so slides align with the role",
  student: "Add a program page, research paper, or internship posting",
  project_showcase: "Link to a GitHub repo, case study, or product page",
  entrepreneur: "Add a market report, competitor page, or investor brief",
  speaker: "Link to the event page, CFP, or topic brief",
  general: "Add URLs for extra context the AI should consider",
};

const CONTEXT_URL_EXAMPLES: Partial<Record<Intent, string[]>> = {
  job_seeker: ["Job posting", "Company about page", "Team page"],
  student: ["Program page", "Research paper", "Internship listing"],
  project_showcase: ["GitHub repo", "Live demo", "Case study"],
  entrepreneur: ["Market report", "Competitor site", "Press coverage"],
  speaker: ["Event page", "CFP brief", "Past talk recording"],
  general: ["Any public page"],
};

interface Props {
  onGenerate: (data: GenerateRequest) => void;
  isGenerating: boolean;
  error: string | null;
  needsAuth?: boolean;
}

type SourceTab = "file" | "url" | "text";

export default function InputForm({ onGenerate, isGenerating, error, needsAuth }: Props) {
  const [sourceTab, setSourceTab] = useState<SourceTab>("file");
  const [intent, setIntent] = useState<Intent>("job_seeker");
  const [presentationType, setPresentationType] = useState<PresentationType>("portfolio");
  const [targetAudience, setTargetAudience] = useState<TargetAudience>("general");
  const [customIntent, setCustomIntent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    base64: string;
    type: string;
  } | null>(null);
  const [photoFile, setPhotoFile] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [contact, setContact] = useState<ContactInfo>({});
  const [references, setReferences] = useState<Reference[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [contextUrls, setContextUrls] = useState<string[]>([""]);
  const [showContextUrls, setShowContextUrls] = useState(false);

  // File dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      setUploadedFile({ name: file.name, base64, type: file.type });
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  // Photo dropzone
  const onPhotoDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoFile(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const {
    getRootProps: getPhotoRootProps,
    getInputProps: getPhotoInputProps,
    isDragActive: isPhotoDragActive,
  } = useDropzone({
    onDrop: onPhotoDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  function updateContact(key: keyof ContactInfo, value: string) {
    setContact((prev) => ({ ...prev, [key]: value || undefined }));
  }

  function addContextUrl() {
    setContextUrls((prev) => [...prev, ""]);
  }

  function updateContextUrl(index: number, value: string) {
    setContextUrls((prev) => prev.map((u, i) => (i === index ? value : u)));
  }

  function removeContextUrl(index: number) {
    setContextUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function addReference() {
    setReferences((prev) => [...prev, { name: "", title: "", url: "" }]);
  }

  function updateReference(
    index: number,
    key: keyof Reference,
    value: string
  ) {
    setReferences((prev) =>
      prev.map((ref, i) => (i === index ? { ...ref, [key]: value } : ref))
    );
  }

  function removeReference(index: number) {
    setReferences((prev) => prev.filter((_, i) => i !== index));
  }

  function validateAndSubmit() {
    // Validate URL if URL tab
    if (sourceTab === "url") {
      if (!sourceUrl.trim()) {
        setUrlError("Please enter a URL");
        return;
      }
      if (!isValidUrl(sourceUrl)) {
        setUrlError("Please enter a valid URL (include https://)");
        return;
      }
      setUrlError("");
    }

    const data: GenerateRequest = {
      intent,
      presentationType,
      targetAudience,
      customIntent: customIntent || undefined,
      sourceType: sourceTab,
      sourceUrl: sourceTab === "url" ? sourceUrl : undefined,
      rawText: sourceTab === "text" ? rawText : undefined,
      fileBase64: sourceTab === "file" ? uploadedFile?.base64 : undefined,
      fileType: sourceTab === "file" ? uploadedFile?.type : undefined,
      photoBase64: photoFile?.split(",")[1] || undefined,
      contact,
      references: references.filter((r) => r.name.trim()),
      name: name || undefined,
      tagline: tagline || undefined,
      contextUrls: contextUrls.filter((u) => u.trim() && isValidUrl(u.trim())),
    };

    onGenerate(data);
  }

  const canSubmit =
    !isGenerating &&
    (sourceTab === "file"
      ? !!uploadedFile
      : sourceTab === "url"
      ? !!sourceUrl.trim()
      : !!rawText.trim());

  return (
    <div className="space-y-6">
      {/* Intent selector */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-semibold text-lg mb-1">
          What&apos;s your goal?
        </h2>
        <p className="text-white/50 text-sm mb-4">
          This helps us tailor the slide content and tone
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.keys(INTENT_LABELS) as Intent[]).map((key) => (
            <button
              key={key}
              onClick={() => setIntent(key)}
              className={cn(
                "p-3 rounded-xl text-left transition-all duration-200 border",
                intent === key
                  ? "bg-indigo-500/20 border-indigo-500/50 text-white"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="font-medium text-sm">{INTENT_LABELS[key]}</div>
              <div className="text-xs mt-0.5 opacity-70 leading-tight">
                {INTENT_DESCRIPTIONS[key].split(" ").slice(0, 5).join(" ")}...
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className="text-white/60 text-sm block mb-1.5">
            Additional context{" "}
            <span className="text-white/30">(optional)</span>
          </label>
          <input
            type="text"
            value={customIntent}
            onChange={(e) => setCustomIntent(e.target.value)}
            placeholder="e.g. Applying for senior frontend roles at startups"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-colors"
          />
        </div>
      </div>

      {/* Presentation type */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-semibold text-lg mb-1">
          Presentation type
        </h2>
        <p className="text-white/50 text-sm mb-4">
          Shapes the narrative structure and tone of your slides
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(PRESENTATION_TYPE_LABELS) as PresentationType[]).map((key) => (
            <button
              key={key}
              onClick={() => setPresentationType(key)}
              className={cn(
                "p-3 rounded-xl text-left transition-all duration-200 border",
                presentationType === key
                  ? "bg-purple-500/20 border-purple-500/50 text-white"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="text-lg mb-1">{PRESENTATION_TYPE_ICONS[key]}</div>
              <div className="font-medium text-sm leading-tight">
                {PRESENTATION_TYPE_LABELS[key]}
              </div>
              <div className="text-xs mt-1 opacity-60 leading-tight line-clamp-2">
                {PRESENTATION_TYPE_DESCRIPTIONS[key].split("—")[0].trim()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Target audience */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-semibold text-lg mb-1">
          Target audience
        </h2>
        <p className="text-white/50 text-sm mb-4">
          Adjusts vocabulary, depth, and framing for who&apos;s in the room
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(Object.keys(AUDIENCE_LABELS) as TargetAudience[]).map((key) => (
            <button
              key={key}
              onClick={() => setTargetAudience(key)}
              className={cn(
                "p-3 rounded-xl text-left transition-all duration-200 border",
                targetAudience === key
                  ? "bg-emerald-500/20 border-emerald-500/50 text-white"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="text-lg mb-1">{AUDIENCE_ICONS[key]}</div>
              <div className="font-medium text-sm leading-tight">
                {AUDIENCE_LABELS[key]}
              </div>
              <div className="text-xs mt-1 opacity-60 leading-tight line-clamp-2">
                {AUDIENCE_DESCRIPTIONS[key].split(",")[0]}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Source input */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-semibold text-lg mb-1">
          Add your content
        </h2>
        <p className="text-white/50 text-sm mb-4">
          Upload a file, paste a public profile URL, or type/paste your content
        </p>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-lg p-1 mb-5">
          {(
            [
              { id: "file", label: "Upload File", icon: Upload },
              { id: "url", label: "Profile URL", icon: Link },
              { id: "text", label: "Paste Text", icon: FileText },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSourceTab(id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200",
                sourceTab === id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-white/50 hover:text-white"
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* File upload */}
        {sourceTab === "file" && (
          <div>
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                isDragActive
                  ? "border-indigo-500 bg-indigo-500/10"
                  : uploadedFile
                  ? "border-green-500/50 bg-green-500/5"
                  : "border-white/20 hover:border-white/40 hover:bg-white/5"
              )}
            >
              <input {...getInputProps()} />
              {uploadedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <FileText size={20} className="text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-medium text-sm">
                      {uploadedFile.name}
                    </div>
                    <div className="text-white/40 text-xs">
                      Ready to process
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                    }}
                    className="ml-auto text-white/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload
                    size={32}
                    className="mx-auto text-white/30 mb-3"
                  />
                  <div className="text-white/70 font-medium mb-1">
                    {isDragActive
                      ? "Drop it here"
                      : "Drag & drop or click to upload"}
                  </div>
                  <div className="text-white/40 text-sm">
                    PDF, DOCX, or TXT — up to 10MB
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* URL input */}
        {sourceTab === "url" && (
          <div className="space-y-3">
            <div>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => {
                  setSourceUrl(e.target.value);
                  setUrlError("");
                }}
                placeholder="https://linkedin.com/in/yourname"
                className={cn(
                  "w-full bg-white/5 border rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none transition-colors",
                  urlError
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-white/10 focus:border-indigo-500/50"
                )}
              />
              {urlError && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {urlError}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "LinkedIn", example: "linkedin.com/in/..." },
                { label: "GitHub", example: "github.com/..." },
                { label: "GitLab", example: "gitlab.com/..." },
                { label: "Meetup", example: "meetup.com/members/..." },
              ].map((p) => (
                <span
                  key={p.label}
                  className="px-2 py-1 rounded-md bg-white/5 text-white/40 text-xs border border-white/10"
                >
                  {p.label}
                </span>
              ))}
            </div>
            <p className="text-white/30 text-xs">
              Works best with public profiles. Some platforms may limit
              scraping — paste text as fallback.
            </p>
          </div>
        )}

        {/* Text input */}
        {sourceTab === "text" && (
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your resume, bio, project description, or any content you want to turn into slides..."
            rows={10}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
          />
        )}
      </div>

      {/* Personal info */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-semibold text-lg mb-1">
          Personal details
        </h2>
        <p className="text-white/50 text-sm mb-5">
          Shown on your cover slide and contact slide
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {/* Photo upload */}
          <div className="sm:col-span-2">
            <label className="text-white/60 text-sm block mb-2">
              Your photo{" "}
              <span className="text-white/30">(shown on cover slide)</span>
            </label>
            <div className="flex items-center gap-4">
              <div
                {...getPhotoRootProps()}
                className={cn(
                  "w-20 h-20 rounded-full border-2 border-dashed cursor-pointer flex items-center justify-center overflow-hidden transition-all duration-200 flex-shrink-0",
                  isPhotoDragActive
                    ? "border-indigo-500 bg-indigo-500/10"
                    : photoFile
                    ? "border-transparent"
                    : "border-white/20 hover:border-white/40"
                )}
              >
                <input {...getPhotoInputProps()} />
                {photoFile ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoFile}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera size={24} className="text-white/30" />
                )}
              </div>
              <div className="text-white/40 text-sm">
                <div className="font-medium text-white/60 mb-0.5">
                  Upload a headshot
                </div>
                JPG, PNG, or WebP — up to 5MB
                {photoFile && (
                  <button
                    onClick={() => setPhotoFile(null)}
                    className="block text-red-400/70 hover:text-red-400 text-xs mt-1 transition-colors"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-white/60 text-sm block mb-1.5">
              Full name
            </label>
            <div className="relative">
              <User
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-white/60 text-sm block mb-1.5">
              Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Senior Engineer · Open to work"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Contact fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: "email" as const, icon: Mail, placeholder: "jane@example.com", label: "Email" },
            { key: "phone" as const, icon: Phone, placeholder: "+1 (555) 000-0000", label: "Phone" },
            { key: "linkedin" as const, icon: Linkedin, placeholder: "linkedin.com/in/jane", label: "LinkedIn" },
            { key: "github" as const, icon: Github, placeholder: "github.com/jane", label: "GitHub" },
            { key: "website" as const, icon: Globe, placeholder: "janesmith.dev", label: "Website" },
            { key: "twitter" as const, icon: Twitter, placeholder: "@jane", label: "Twitter/X" },
            { key: "location" as const, icon: MapPin, placeholder: "San Francisco, CA", label: "Location" },
          ].map(({ key, icon: Icon, placeholder, label }) => (
            <div key={key}>
              <label className="text-white/50 text-xs block mb-1">
                {label}
              </label>
              <div className="relative">
                <Icon
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="text"
                  value={contact[key] || ""}
                  onChange={(e) => updateContact(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Context URLs */}
      <div className="glass rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowContextUrls(!showContextUrls)}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
        >
          <div>
            <h2 className="text-white font-semibold text-lg flex items-center gap-2">
              Context URLs
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                optional
              </span>
            </h2>
            <p className="text-white/50 text-sm mt-0.5">
              {CONTEXT_URL_DESCRIPTIONS[intent] ?? "Add URLs for extra context the AI should consider"}
            </p>
          </div>
          {showContextUrls ? (
            <ChevronUp size={18} className="text-white/40 flex-shrink-0" />
          ) : (
            <ChevronDown size={18} className="text-white/40 flex-shrink-0" />
          )}
        </button>

        {showContextUrls && (
          <div className="px-6 pb-6 space-y-3">
            <div className="flex flex-wrap gap-2 mb-1">
              {CONTEXT_URL_EXAMPLES[intent]?.map((ex) => (
                <span
                  key={ex}
                  className="px-2 py-1 rounded-md bg-white/5 text-white/40 text-xs border border-white/10"
                >
                  {ex}
                </span>
              ))}
            </div>
            {contextUrls.map((url, i) => (
              <div key={i} className="flex gap-2">
                <div className="relative flex-1">
                  <Link
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateContextUrl(i, e.target.value)}
                    placeholder={CONTEXT_URL_PLACEHOLDERS[intent] ?? "https://..."}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>
                {contextUrls.length > 1 && (
                  <button
                    onClick={() => removeContextUrl(i)}
                    className="p-2 text-white/30 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addContextUrl}
              className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
            >
              <Plus size={16} />
              Add another URL
            </button>
            <p className="text-white/25 text-xs">
              These pages will be scraped and their content used to tailor your slides. Works best with public pages.
            </p>
          </div>
        )}
      </div>

      {/* References — collapsible */}
      <div className="glass rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
        >
          <div>
            <h2 className="text-white font-semibold text-lg">
              References & links{" "}
              <span className="text-white/30 font-normal text-sm">
                (optional)
              </span>
            </h2>
            <p className="text-white/50 text-sm mt-0.5">
              Add public references, portfolio links, or endorsements
            </p>
          </div>
          {showAdvanced ? (
            <ChevronUp size={18} className="text-white/40 flex-shrink-0" />
          ) : (
            <ChevronDown size={18} className="text-white/40 flex-shrink-0" />
          )}
        </button>

        {showAdvanced && (
          <div className="px-6 pb-6 space-y-3">
            {references.map((ref, i) => (
              <div
                key={i}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-white/5 rounded-lg"
              >
                <input
                  type="text"
                  value={ref.name}
                  onChange={(e) => updateReference(i, "name", e.target.value)}
                  placeholder="Name *"
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
                <input
                  type="text"
                  value={ref.title || ""}
                  onChange={(e) => updateReference(i, "title", e.target.value)}
                  placeholder="Title / Company"
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={ref.url || ""}
                    onChange={(e) => updateReference(i, "url", e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                  <button
                    onClick={() => removeReference(i)}
                    className="p-2 text-white/30 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addReference}
              className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
            >
              <Plus size={16} />
              Add reference
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-sm">Generation failed</div>
            <div className="text-sm opacity-80 mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={validateAndSubmit}
        disabled={!canSubmit && !needsAuth}
        className={cn(
          "w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3",
          needsAuth
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25"
            : canSubmit
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01]"
            : "bg-white/10 text-white/30 cursor-not-allowed"
        )}
      >
        {isGenerating ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Generating your slides...
          </>
        ) : needsAuth ? (
          <>🔒 Sign in to Generate</>
        ) : (
          <>✨ Generate Slides</>
        )}
      </button>

      {isGenerating && (
        <p className="text-center text-white/40 text-sm">
          This usually takes 15–30 seconds. We&apos;re crafting your story...
        </p>
      )}
    </div>
  );
}
