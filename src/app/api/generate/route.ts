import { NextRequest, NextResponse } from "next/server";
import { generateSlides } from "@/lib/openai";
import { scrapeUrl } from "@/lib/scraper";
import { parseFile } from "@/lib/parser";
import { generateQRCode } from "@/lib/qrcode";
import type { GenerateRequest, SlideGenerationInput } from "@/types";

export const maxDuration = 60; // Vercel function timeout

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();

    const {
      intent,
      presentationType,
      targetAudience,
      customIntent,
      sourceType,
      sourceUrl,
      rawText,
      fileBase64,
      fileType,
      photoBase64,
      contact,
      references,
      name,
      tagline,
    } = body;

    if (!intent) {
      return NextResponse.json({ error: "Intent is required" }, { status: 400 });
    }

    // Step 1: Extract source content
    let sourceContent = "";

    if (sourceType === "url" && sourceUrl) {
      const scraped = await scrapeUrl(sourceUrl);
      if (!scraped.success) {
        // Don't fail hard — use whatever we got plus the URL as context
        sourceContent = `Source URL: ${sourceUrl}\nPlatform: ${scraped.platform}\n${scraped.text || "Could not fully scrape content — please provide additional context."}`;
      } else {
        sourceContent = `Source: ${scraped.platform} (${sourceUrl})\nTitle: ${scraped.title}\n\n${scraped.text}`;
      }
    } else if (sourceType === "file" && fileBase64 && fileType) {
      sourceContent = await parseFile(fileBase64, fileType);
    } else if (sourceType === "text" && rawText) {
      sourceContent = rawText;
    } else {
      return NextResponse.json(
        { error: "No valid source provided" },
        { status: 400 }
      );
    }

    if (!sourceContent.trim()) {
      return NextResponse.json(
        { error: "Could not extract content from the provided source" },
        { status: 400 }
      );
    }

    // Step 2: Generate slides via AI
    const input: SlideGenerationInput = {
      intent,
      presentationType: presentationType || "portfolio",
      targetAudience: targetAudience || "general",
      customIntent,
      sourceType,
      sourceContent,
      sourceUrl,
      photoBase64,
      contact,
      references,
      name,
      tagline,
    };

    const presentation = await generateSlides(input);

    // Step 3: Generate QR code for the primary contact URL
    const qrTarget =
      contact.linkedin ||
      contact.github ||
      contact.website ||
      sourceUrl ||
      (contact.email ? `mailto:${contact.email}` : null) ||
      "https://present.ai";

    if (qrTarget) {
      presentation.qrUrl = await generateQRCode(qrTarget);
    }

    // Attach photo and contact to presentation for rendering
    return NextResponse.json({
      success: true,
      presentation,
      photoBase64: photoBase64 || null,
      contact,
      references: references || [],
    });
  } catch (error) {
    console.error("Generate error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
