import type { FontBuildResult } from "./glyphModel";

export const FONT_MIME_TYPE = "font/otf";
export const FONT_EXTENSION = "otf";
export const SMOKE_TEST_EXTENSION = "html";
export const CSS_EXTENSION = "css";
export const ZIP_EXTENSION = "zip";

export type FontPackageStyle = "Regular" | "Bold";

export type FontPackageItem = {
  result: FontBuildResult;
  style: FontPackageStyle;
};

export function createFontBlob(arrayBuffer: ArrayBuffer): Blob {
  return new Blob([arrayBuffer], { type: FONT_MIME_TYPE });
}

export function createFontDownloadName(familyName: string): string {
  const baseName = createSafeBaseName(familyName);

  return `${baseName || "Typegen-Font"}.${FONT_EXTENSION}`;
}

export function createSmokeTestDownloadName(familyName: string): string {
  const baseName = createSafeBaseName(familyName);

  return `${baseName || "Typegen-Font"}-smoke-test.${SMOKE_TEST_EXTENSION}`;
}

export function createCssDownloadName(familyName: string): string {
  const baseName = createSafeBaseName(familyName);

  return `${baseName || "Typegen-Font"}.${CSS_EXTENSION}`;
}

export function createPackageDownloadName(familyName: string): string {
  const baseName = createSafeBaseName(familyName);

  return `${baseName || "Typegen-Font"}-web-test.${ZIP_EXTENSION}`;
}

export function createWeightedFontDownloadName(familyName: string, style: FontPackageStyle): string {
  const baseName = createSafeBaseName(familyName);

  return `${baseName || "Typegen-Font"}-${style}.${FONT_EXTENSION}`;
}

export function downloadFont(result: FontBuildResult): void {
  const blob = createFontBlob(result.arrayBuffer);
  triggerDownload(blob, createFontDownloadName(result.familyName));
}

export function createFontFaceCss(result: FontBuildResult): string {
  const cssFamilyName = escapeCssString(result.familyName);
  const fontFilename = createFontDownloadName(result.familyName);

  return `@font-face {
  font-family: "${cssFamilyName}";
  src: url("./${fontFilename}") format("opentype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

.typegen-sample {
  font-family: "${cssFamilyName}", system-ui, sans-serif;
}`;
}

export function createFontPackageHtml(items: FontPackageItem[], sampleText = "ABC box @2+2"): string {
  const orderedItems = sortPackageItems(items);
  const familyName = escapeHtml(orderedItems[0]?.result.familyName ?? "Typegen Font");
  const displaySample = escapeHtml(sampleText);
  const fontFaces = orderedItems
    .map((item) => {
      const cssFamilyName = escapeCssString(item.result.familyName);
      const filename = createWeightedFontDownloadName(item.result.familyName, item.style);
      return `    @font-face {
      font-family: "${cssFamilyName}";
      src: url("./fonts/${filename}") format("opentype");
      font-weight: ${fontWeightForStyle(item.style)};
      font-style: normal;
      font-display: swap;
    }`;
    })
    .join("\n\n");
  const rows = orderedItems
    .map((item) => {
      const cssFamilyName = escapeCssString(item.result.familyName);
      const htmlCssFamilyName = escapeHtml(cssFamilyName);
      const label = escapeHtml(item.style);
      const weight = fontWeightForStyle(item.style);
      return `    <section class="sample-row">
      <div>
        <h2>${label}</h2>
        <p>${item.result.glyphCount} glyphs exported</p>
      </div>
      <div class="sample" style="font-family: &quot;${htmlCssFamilyName}&quot;, system-ui, sans-serif; font-weight: ${weight};">${displaySample}</div>
    </section>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${familyName} weight test</title>
  <style>
${fontFaces}

    body {
      margin: 0;
      padding: 32px;
      background: #f6f7f2;
      color: #202622;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    main {
      display: grid;
      gap: 18px;
      max-width: 980px;
    }

    h1 {
      margin: 0;
      font-size: 22px;
    }

    h2,
    p {
      margin: 0;
    }

    h2 {
      font-size: 14px;
    }

    p {
      color: #5f6761;
      font-size: 13px;
    }

    .sample-row {
      display: grid;
      grid-template-columns: 160px minmax(0, 1fr);
      gap: 18px;
      align-items: start;
      border-top: 1px solid #d8ded2;
      padding-top: 18px;
    }

    .sample {
      border: 1px solid #d8ded2;
      border-radius: 8px;
      background: #fffef9;
      padding: 22px;
      font-size: 64px;
      line-height: 1.12;
      overflow-wrap: anywhere;
    }
  </style>
</head>
<body>
  <main>
    <h1>${familyName} weight test</h1>
${rows}
  </main>
</body>
</html>`;
}

export function createFontPackageZip(items: FontPackageItem[], sampleText?: string): Blob {
  const orderedItems = sortPackageItems(items);
  const files = [
    ...orderedItems.map((item) => ({
      name: `fonts/${createWeightedFontDownloadName(item.result.familyName, item.style)}`,
      data: new Uint8Array(item.result.arrayBuffer),
    })),
    {
      name: "index.html",
      data: stringToUtf8(createFontPackageHtml(orderedItems, sampleText)),
    },
  ];

  const zipBytes = createStoredZip(files);

  return new Blob([toArrayBuffer(zipBytes)], { type: "application/zip" });
}

export function createSmokeTestHtml(
  result: FontBuildResult,
  sampleText = "ABC box @2+2",
): string {
  const fontData = arrayBufferToBase64(result.arrayBuffer);
  const familyName = escapeHtml(result.familyName);
  const cssFamilyName = escapeCssString(result.familyName);
  const displaySample = escapeHtml(sampleText);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${familyName} smoke test</title>
  <style>
    @font-face {
      font-family: "${cssFamilyName}";
      src: url("data:${FONT_MIME_TYPE};base64,${fontData}") format("opentype");
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }

    body {
      margin: 0;
      padding: 32px;
      background: #f6f7f2;
      color: #202622;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    main {
      max-width: 900px;
    }

    h1 {
      margin: 0 0 8px;
      font-size: 20px;
    }

    p {
      margin: 0 0 20px;
      color: #5f6761;
    }

    .sample {
      border: 1px solid #d8ded2;
      border-radius: 8px;
      background: #fffef9;
      padding: 24px;
      font-family: "${cssFamilyName}", system-ui, sans-serif;
      font-size: 72px;
      line-height: 1.15;
      overflow-wrap: anywhere;
    }
  </style>
</head>
<body>
  <main>
    <h1>${familyName} smoke test</h1>
    <p>Generated by Typegen. If the font loaded correctly, supported glyphs below use your exported outlines.</p>
    <div class="sample">${displaySample}</div>
  </main>
</body>
</html>`;
}

export function downloadFontFaceCss(result: FontBuildResult): void {
  const blob = new Blob([createFontFaceCss(result)], {
    type: "text/css;charset=utf-8",
  });

  triggerDownload(blob, createCssDownloadName(result.familyName));
}

export function downloadSmokeTestHtml(
  result: FontBuildResult,
  sampleText?: string,
): void {
  const blob = new Blob([createSmokeTestHtml(result, sampleText)], {
    type: "text/html;charset=utf-8",
  });

  triggerDownload(blob, createSmokeTestDownloadName(result.familyName));
}

export function downloadFontPackageZip(items: FontPackageItem[], sampleText?: string): void {
  if (items.length === 0) {
    return;
  }

  triggerDownload(createFontPackageZip(items, sampleText), createPackageDownloadName(items[0].result.familyName));
}

function sortPackageItems(items: FontPackageItem[]): FontPackageItem[] {
  const order: Record<FontPackageStyle, number> = { Regular: 0, Bold: 1 };
  return [...items].sort((a, b) => order[a.style] - order[b.style]);
}

function fontWeightForStyle(style: FontPackageStyle): number {
  return style === "Bold" ? 700 : 400;
}

function triggerDownload(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

function createSafeBaseName(familyName: string): string {
  return familyName
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function arrayBufferToBase64(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);
  const chunkSize = 0x8000;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return globalThis.btoa(binary);
}

function stringToUtf8(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

type ZipFileEntry = {
  name: string;
  data: Uint8Array;
};

function createStoredZip(files: ZipFileEntry[]): Uint8Array {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = stringToUtf8(file.name);
    const crc = crc32(file.data);
    const localHeader = createLocalFileHeader(nameBytes, file.data.length, crc);
    localParts.push(localHeader, file.data);
    centralParts.push(createCentralDirectoryHeader(nameBytes, file.data.length, crc, offset));
    offset += localHeader.length + file.data.length;
  }

  const centralOffset = offset;
  const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
  const endRecord = createEndOfCentralDirectory(files.length, centralSize, centralOffset);

  return concatUint8Arrays([...localParts, ...centralParts, endRecord]);
}

function createLocalFileHeader(nameBytes: Uint8Array, size: number, crc: number): Uint8Array {
  const header = new Uint8Array(30 + nameBytes.length);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0x0800, true);
  view.setUint16(8, 0, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, size, true);
  view.setUint32(22, size, true);
  view.setUint16(26, nameBytes.length, true);
  header.set(nameBytes, 30);
  return header;
}

function createCentralDirectoryHeader(nameBytes: Uint8Array, size: number, crc: number, offset: number): Uint8Array {
  const header = new Uint8Array(46 + nameBytes.length);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0x0800, true);
  view.setUint16(10, 0, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, size, true);
  view.setUint32(24, size, true);
  view.setUint16(28, nameBytes.length, true);
  view.setUint32(42, offset, true);
  header.set(nameBytes, 46);
  return header;
}

function createEndOfCentralDirectory(fileCount: number, centralSize: number, centralOffset: number): Uint8Array {
  const header = new Uint8Array(22);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, fileCount, true);
  view.setUint16(10, fileCount, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralOffset, true);
  return header;
}

function concatUint8Arrays(parts: Uint8Array[]): Uint8Array {
  const totalLength = parts.reduce((total, part) => total + part.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.length);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const CRC32_TABLE = createCrc32Table();

function createCrc32Table(): Uint32Array {
  const table = new Uint32Array(256);
  for (let index = 0; index < table.length; index++) {
    let value = index;
    for (let bit = 0; bit < 8; bit++) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char];
  });
}

function escapeCssString(value: string): string {
  return value.replace(/["\\\n\r\f]/g, (char) => `\\${char}`);
}
