import { woff2 } from "fonteditor-core";
import woff2WasmUrl from "../../node_modules/fonteditor-core/woff2/woff2.wasm?url";

let initPromise: Promise<void> | null = null;

export function initializeWoff2Runtime(): Promise<void> {
  if (woff2.isInited()) {
    return Promise.resolve();
  }

  initPromise ??= woff2.init(woff2WasmUrl).then(() => undefined);
  return initPromise;
}
