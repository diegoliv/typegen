declare module "opentype.js" {
  export class Path {
    commands: unknown[];

    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    curveTo(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      x: number,
      y: number,
    ): void;
    quadTo(x1: number, y1: number, x: number, y: number): void;
    close(): void;
  }

  export class Glyph {
    unicode?: number;
    advanceWidth: number;
    path: Path;

    constructor(options: {
      name: string;
      unicode?: number;
      unicodes?: number[];
      advanceWidth: number;
      path: Path;
    });
  }

  export class Font {
    glyphs: {
      length: number;
    };

    constructor(options: {
      familyName: string;
      styleName: string;
      unitsPerEm: number;
      ascender: number;
      descender: number;
      manufacturer?: string;
      description?: string;
      glyphs: Glyph[];
    });

    toArrayBuffer(): ArrayBuffer;
    charToGlyph(char: string): Glyph;
  }

  export function parse(buffer: ArrayBuffer): Font;
}
