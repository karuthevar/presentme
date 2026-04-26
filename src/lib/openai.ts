import type { SlideGenerationInput, GeneratedPresentation, Slide } from "@/types";
import { generateId } from "./utils";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const INTENT_PROMPTS: Record<string, string> = {
  job_seeker: `Focus on: quantified work achievements, key skills with proficiency, career progression, notable projects with business impact, and what makes this candidate stand out. Use action verbs and numbers wherever possible.`,
  student: `Focus on: academic achievements (GPA, honors, awards), research projects, technical skills, extracurricular leadership, internships, and future potential. Highlight learning agility and initiative.`,
  project_showcase: `Focus on: technical architecture, problem solved, technologies used, measurable outcomes, scale/impact, and lessons learned. Make it compelling for technical and non-technical audiences.`,
  entrepreneur: `Focus on: problem being solved, traction metrics, team strength, market opportunity, and vision. Use startup-friendly language — crisp, bold, investor-ready.`,
  speaker: `Focus on: speaking topics, past speaking engagements, expertise areas, audience impact, and credibility markers. Make it easy for event organizers to understand the value.`,
  general: `Create a balanced, professional overview covering background, key strengths, notable work, and what this person brings to the table.`,
};

const PRESENTATION_TYPE_PROMPTS: Record<string, string> = {
  sales_pitch: `Structure as a persuasive sales narrative: open with the problem/pain, present the solution, show proof/social proof, highlight ROI and value, end with a clear call-to-action. Every slide should move the audience closer to a "yes".`,
  academic: `Use rigorous academic structure: introduction/context, research question or thesis, methodology, findings/results, discussion, conclusions, and references. Tone should be precise, evidence-based, and cite sources where available.`,
  awareness: `Lead with the "why it matters" — open with a striking fact or human story, build urgency around the issue, present the landscape, show what's at stake, and close with a clear call to action or next steps.`,
  marketing: `Brand-first storytelling: open with a bold brand statement, highlight differentiation, use social proof and testimonials, showcase the product/service benefits (not features), and end with a memorable tagline or CTA.`,
  investor_pitch: `Follow the classic investor deck structure: problem, solution, market size (TAM/SAM/SOM), business model, traction/metrics, team, competitive landscape, financials/projections, and the ask. Be crisp and data-heavy.`,
  portfolio: `Curate the best work with context: for each piece show the brief/challenge, your approach, the outcome, and the impact. Let the work speak — use strong visuals descriptions and measurable results.`,
  keynote: `Build around one big idea: open with a hook (story, stat, or provocative question), develop the narrative arc with 3 key points, use memorable moments and transitions, and close with an inspiring call to action or vision.`,
  workshop: `Structure for learning: start with objectives and agenda, break content into digestible modules, include exercises or reflection prompts, summarize key takeaways per section, and end with action items and resources.`,
};

const AUDIENCE_PROMPTS: Record<string, string> = {
  general: `Use plain, jargon-free language. Assume no prior domain knowledge. Prioritize clarity and relatability over technical depth.`,
  academics: `Use precise academic language. Reference methodologies, cite evidence, acknowledge limitations. Peer-review-ready tone — rigorous and objective.`,
  investors: `Lead with numbers: ARR, growth rate, market size, burn rate, runway. Speak to risk/reward. Be concise — investors see hundreds of decks. Every slide must earn its place.`,
  economists: `Frame everything in economic terms: market dynamics, incentive structures, policy implications, macro/micro context. Use data, models, and cite credible sources.`,
  engineers: `Go deep on technical details: architecture decisions, tech stack, scalability, performance metrics, trade-offs. Engineers respect specificity — avoid hand-waving.`,
  executives: `Focus on strategic impact, KPIs, and bottom-line outcomes. Executives want the "so what" immediately. Lead with conclusions, support with data. Keep it tight.`,
  students: `Be inspiring and relatable. Use accessible language, real-world examples, and a tone that motivates. Show the path from where they are to where they could be.`,
  customers: `Lead with benefits, not features. Address pain points directly. Build trust with social proof and testimonials. Make the next step obvious and low-friction.`,
  recruiters: `Highlight skills, measurable achievements, culture signals, and career trajectory. Make it easy to scan. Recruiters spend seconds per profile — make every word count.`,
  media: `Lead with the newsworthy angle. Craft quotable moments. Build a narrative arc with a clear story. Provide context, conflict, and resolution. Make it easy to write a headline from.`,
};

export async function generateSlides(
  input: SlideGenerationInput
): Promise<GeneratedPresentation> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const intentPrompt = INTENT_PROMPTS[input.intent] || INTENT_PROMPTS.general;
  const presentationTypePrompt =
    PRESENTATION_TYPE_PROMPTS[input.presentationType] ||
    PRESENTATION_TYPE_PROMPTS.portfolio;
  const audiencePrompt =
    AUDIENCE_PROMPTS[input.targetAudience] || AUDIENCE_PROMPTS.general;
  const customNote = input.customIntent
    ? `\nAdditional context from the user: "${input.customIntent}"`
    : "";

  const prompt = [
    `You are an expert presentation designer and communication strategist. Your job is to transform raw profile content into high-impact, punchy presentation slides tailored to a specific audience and presentation format.`,
    ``,
    `**Presenter profile type:** ${input.intent.replace(/_/g, " ")}`,
    intentPrompt,
    ``,
    `**Presentation format:** ${input.presentationType.replace(/_/g, " ")}`,
    presentationTypePrompt,
    ``,
    `**Target audience:** ${input.targetAudience.replace(/_/g, " ")}`,
    audiencePrompt,
    customNote,
    ``,
    `Universal rules:`,
    `- Every bullet point must be specific, quantified where possible, and impactful`,
    `- No filler words ("responsible for", "helped with", "worked on") — use strong action verbs`,
    `- Each slide should have 3-5 bullets maximum — quality over quantity`,
    `- Bullets should be standalone statements that hit hard even without context`,
    `- Adapt vocabulary, depth, and framing to the target audience`,
    `- The presentation format dictates the narrative structure — follow it`,
    ``,
    `Here is the profile content to transform into slides:`,
    ``,
    `---`,
    input.sourceContent,
    `---`,
    ``,
    `Contact info available:`,
    JSON.stringify(input.contact, null, 2),
    ``,
    input.references?.length
      ? `References:\n${JSON.stringify(input.references, null, 2)}`
      : "",
    input.name ? `Name hint: ${input.name}` : "",
    input.tagline ? `Tagline hint: ${input.tagline}` : "",
    ``,
    `Return ONLY valid JSON (no markdown, no code fences) matching this exact structure:`,
    `{`,
    `  "name": "Full Name",`,
    `  "tagline": "One powerful tagline (max 10 words)",`,
    `  "theme": "professional" | "modern" | "minimal" | "bold",`,
    `  "slides": [`,
    `    {`,
    `      "id": "unique_id",`,
    `      "type": "cover" | "summary" | "experience" | "skills" | "projects" | "education" | "achievements" | "contact",`,
    `      "title": "Slide Title",`,
    `      "subtitle": "Optional subtitle",`,
    `      "bullets": ["bullet 1", "bullet 2"],`,
    `      "highlights": [{"label": "Label", "value": "Value"}],`,
    `      "tags": ["tag1", "tag2"],`,
    `      "icon": "emoji"`,
    `    }`,
    `  ]`,
    `}`,
    ``,
    `Slide order: cover → summary → [relevant content slides] → contact`,
    `Always include a cover slide and a contact slide.`,
    `The summary slide should have 3-4 "highlights" (key stats/facts) and 2-3 bullets.`,
    `Skills slide should use "tags" array.`,
    `Experience/projects slides should use "bullets" array.`,
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!raw) throw new Error("No response from Gemini");

  let parsed: GeneratedPresentation;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Strip markdown code fences if model ignored the instruction
    const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error("Failed to parse Gemini response as JSON");
    }
  }

  // Ensure all slides have IDs
  parsed.slides = parsed.slides.map((slide: Slide) => ({
    ...slide,
    id: slide.id || generateId(),
  }));

  return parsed;
}
