import type { CSSProperties } from "react";

/** CSSProperties widened to accept arbitrary `--custom-property` keys. */
export type CSSVars = CSSProperties & Record<string, string | number | undefined>;
