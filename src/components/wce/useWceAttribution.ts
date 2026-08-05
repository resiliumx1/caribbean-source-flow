import { useEffect, useState } from "react";
import { captureAttribution, EMPTY_ATTRIBUTION, type WceAttribution } from "@/lib/wce-attribution";

export type { WceAttribution };

/** Captures UTM + referral params on first load and persists them for the session. */
export function useWceAttribution(): WceAttribution {
  const [attr, setAttr] = useState<WceAttribution>(EMPTY_ATTRIBUTION);
  useEffect(() => { setAttr(captureAttribution()); }, []);
  return attr;
}
