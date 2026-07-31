export const WCE_PATHWAY_EVENT = "wce:pathway-select";

/** Scroll to the application form and preselect a pathway in the select field. */
export function selectPathway(key: string) {
  window.dispatchEvent(new CustomEvent(WCE_PATHWAY_EVENT, { detail: key }));
  document.getElementById("apply")?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start",
  });
}