import { useState } from "react";
import { Check, Copy, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Prominent, branded Zoom join block shown to the participant right after
 * payment and on the manage-booking page. Copy button included so the link
 * can be pasted into a calendar or another device.
 */
export function ZoomJoinPanel({
  joinUrl,
  pending,
}: {
  joinUrl: string | null;
  pending?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!joinUrl) return;
    try {
      await navigator.clipboard.writeText(joinUrl);
    } catch {
      const el = document.createElement("textarea");
      el.value = joinUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  if (!joinUrl) {
    return (
      <div className="consult-join consult-join--pending text-left">
        <p className="consult-join__label">
          <Video className="inline w-4 h-4 mr-1.5 -mt-0.5" />
          Your video room
        </p>
        <p className="consult-join__note">
          {pending === false
            ? "This is an online session. Your link will be sent to you."
            : "Your join link is being prepared and will arrive by email shortly — it will also appear on this page."}
        </p>
      </div>
    );
  }

  return (
    <div className="consult-join text-left">
      <p className="consult-join__label">
        <Video className="inline w-4 h-4 mr-1.5 -mt-0.5" />
        Join your session
      </p>

      <div className="consult-join__actions">
        <Button asChild className="consult-join__cta min-h-[48px] px-6">
          <a href={joinUrl} target="_blank" rel="noopener noreferrer">
            Join on Zoom
          </a>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-[48px] px-5"
          onClick={copy}
          aria-label="Copy the Zoom join link"
        >
          {copied
            ? <><Check className="w-4 h-4 mr-1.5" /> Copied</>
            : <><Copy className="w-4 h-4 mr-1.5" /> Copy link</>}
        </Button>
      </div>

      <p className="consult-join__url">{joinUrl}</p>
      <p className="consult-join__note">
        Open the link a few minutes early. The same link works for the whole session.
      </p>
    </div>
  );
}