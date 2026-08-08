/** Display labels for the WCE pathway keys. The keys (in_person, online,
 *  retreat) are referenced by the cart, attribution, referral coupon scoping
 *  and existing lead records — never rename them, only these labels. */
export const WCE_PATHWAY_LABELS: Record<string, string> = {
  in_person: "Caribbean Wellness Symposium — In Person Attendance",
  online: "Caribbean Wellness Symposium — Online Access",
  retreat: "Caribbean Wellness Fortification Retreat",
};

export function wcePathwayLabel(key: string | null | undefined): string {
  if (!key) return "—";
  return WCE_PATHWAY_LABELS[key] ?? key;
}
