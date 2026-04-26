import * as cheerio from "cheerio";

export interface ScrapedContent {
  title: string;
  text: string;
  platform: string;
  success: boolean;
  error?: string;
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
};

export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      headers: HEADERS,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        title: "",
        text: "",
        platform: detectPlatformFromUrl(url),
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove noise elements
    $(
      "script, style, nav, footer, header, .cookie-banner, .ads, iframe, noscript"
    ).remove();

    const title = $("title").text().trim() || $("h1").first().text().trim();

    // Extract meaningful text
    const textParts: string[] = [];

    // Meta description
    const metaDesc = $('meta[name="description"]').attr("content");
    if (metaDesc) textParts.push(metaDesc);

    // Open Graph data
    const ogTitle = $('meta[property="og:title"]').attr("content");
    const ogDesc = $('meta[property="og:description"]').attr("content");
    if (ogTitle) textParts.push(`Title: ${ogTitle}`);
    if (ogDesc) textParts.push(`Description: ${ogDesc}`);

    // Main content areas
    const contentSelectors = [
      "main",
      "article",
      '[role="main"]',
      ".profile",
      ".resume",
      ".content",
      "#content",
      ".main-content",
    ];

    let mainContent = "";
    for (const selector of contentSelectors) {
      const el = $(selector);
      if (el.length > 0) {
        mainContent = el.text().replace(/\s+/g, " ").trim();
        break;
      }
    }

    if (!mainContent) {
      mainContent = $("body").text().replace(/\s+/g, " ").trim();
    }

    textParts.push(mainContent);

    const fullText = textParts
      .join("\n\n")
      .replace(/\n{3,}/g, "\n\n")
      .substring(0, 8000); // cap at 8k chars

    return {
      title,
      text: fullText,
      platform: detectPlatformFromUrl(url),
      success: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      title: "",
      text: "",
      platform: detectPlatformFromUrl(url),
      success: false,
      error: message,
    };
  }
}

function detectPlatformFromUrl(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("linkedin.com")) return "LinkedIn";
  if (lower.includes("github.com")) return "GitHub";
  if (lower.includes("gitlab.com")) return "GitLab";
  if (lower.includes("instagram.com")) return "Instagram";
  if (lower.includes("glassdoor.com")) return "Glassdoor";
  if (lower.includes("meetup.com")) return "Meetup";
  return "Web";
}
