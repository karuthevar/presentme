/**
 * Parses uploaded files (PDF, DOCX, TXT) into plain text on the server side.
 */

export async function parseFile(
  base64: string,
  mimeType: string
): Promise<string> {
  const buffer = Buffer.from(base64, "base64");

  if (mimeType === "application/pdf" || mimeType.includes("pdf")) {
    return parsePdf(buffer);
  }

  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType.includes("docx") ||
    mimeType.includes("word")
  ) {
    return parseDocx(buffer);
  }

  if (mimeType.startsWith("text/")) {
    return buffer.toString("utf-8");
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid issues with edge runtime
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text.replace(/\s+/g, " ").trim();
  } catch (error) {
    throw new Error(
      `Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

async function parseDocx(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value.replace(/\s+/g, " ").trim();
  } catch (error) {
    throw new Error(
      `Failed to parse DOCX: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
