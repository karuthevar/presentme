import QRCode from "qrcode";

export async function generateQRCode(text: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 200,
      margin: 2,
      color: {
        dark: "#1e1b4b",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    });
    return dataUrl;
  } catch (error) {
    console.error("QR code generation failed:", error);
    return "";
  }
}

export async function generateQRCodeSvg(text: string): Promise<string> {
  try {
    const svg = await QRCode.toString(text, {
      type: "svg",
      width: 200,
      margin: 2,
      color: {
        dark: "#1e1b4b",
        light: "#ffffff",
      },
    });
    return svg;
  } catch (error) {
    console.error("QR code SVG generation failed:", error);
    return "";
  }
}
