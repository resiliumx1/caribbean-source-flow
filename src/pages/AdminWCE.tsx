import { useMemo, useState } from "react";
import { useWceAccess } from "@/hooks/use-wce-access";
import WceLeads from "@/components/admin/wce/WceLeads";
import WceSpeakers from "@/components/admin/wce/WceSpeakers";
import WcePathways from "@/components/admin/wce/WcePathways";
import WceReferralCodes from "@/components/admin/wce/WceReferralCodes";
import WceFaqs from "@/components/admin/wce/WceFaqs";
import WceMedia from "@/components/admin/wce/WceMedia";
import WceSettings from "@/components/admin/wce/WceSettings";
import WceOrders from "@/components/admin/wce/WceOrders";
import WceOrganisers from "@/components/admin/wce/WceOrganisers";

const TABS = [
  { key: "leads", label: "Leads", Component: WceLeads },
  { key: "speakers", label: "Speakers", Component: WceSpeakers },
  { key: "pathways", label: "Pathways", Component: WcePathways },
  { key: "orders", label: "Orders", Component: WceOrders },
  { key: "referrals", label: "Referral Codes", Component: WceReferralCodes },
  { key: "faqs", label: "FAQs", Component: WceFaqs },
  { key: "media", label: "Media", Component: WceMedia },
  { key: "settings", label: "Settings", Component: WceSettings },
];

// Only full store admins may manage who has organiser access.
const ADMIN_ONLY_TABS = [
  { key: "organisers", label: "Organisers", Component: WceOrganisers },
];

export default function AdminWCE() {
  const { isFullAdmin } = useWceAccess();
  const [tab, setTab] = useState<string>("leads");
  const tabs = useMemo(
    () => (isFullAdmin ? [...TABS, ...ADMIN_ONLY_TABS] : TABS),
    [isFullAdmin],
  );
  const Active = tabs.find((t) => t.key === tab)?.Component ?? WceLeads;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Caribbean Wellness Experience 2026</h1>
        <p className="text-sm text-muted-foreground">Event content, pathways and lead management.</p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2 text-sm min-h-[44px]"
            style={{
              fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
              borderBottom: tab === t.key ? "2px solid hsl(var(--primary))" : "2px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Active />
    </div>
  );
}