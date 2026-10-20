import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: vi.fn().mockResolvedValue({ data: { inserted: 1 }, error: null }) } },
}));
vi.mock("@/lib/wce-attribution", () => ({ readAttribution: () => null }));

describe("WCE arrival measurement", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    sessionStorage.clear();
    Object.defineProperty(navigator, "doNotTrack", { configurable: true, value: "0" });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("sends an arrival without waiting for the interaction batch timer", async () => {
    const { trackWceEvent } = await import("./analytics");
    const { supabase } = await import("@/integrations/supabase/client");
    trackWceEvent("page_view", "/wce-2026");
    expect(supabase.functions.invoke).toHaveBeenCalledTimes(1);
    expect(supabase.functions.invoke).toHaveBeenCalledWith("wce-track", {
      body: expect.objectContaining({ events: [expect.objectContaining({ event_type: "page_view" })] }),
    });
  });

  it("does not send arrivals when Do Not Track is enabled", async () => {
    Object.defineProperty(navigator, "doNotTrack", { configurable: true, value: "1" });
    const { trackWceEvent } = await import("./analytics");
    const { supabase } = await import("@/integrations/supabase/client");
    trackWceEvent("page_view", "/wce-2026");
    await vi.advanceTimersByTimeAsync(3000);
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });

  it("keeps a random stable session per runtime when storage is blocked", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage blocked"); });
    const firstRuntime = await import("./analytics");
    const first = firstRuntime.wceSessionId();
    expect(first).not.toBe("unavailable");
    expect(firstRuntime.wceSessionId()).toBe(first);
    vi.resetModules();
    const secondRuntime = await import("./analytics");
    expect(secondRuntime.wceSessionId()).not.toBe(first);
  });
});