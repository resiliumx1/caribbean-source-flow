import { useState } from "react";
import { useWebinarVideos, WebinarVideo } from "@/hooks/use-webinar-videos";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";

export default function AdminWebinars() {
  const { data: videos = [], isLoading } = useWebinarVideos();
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-sync");
      if (error) throw error;
      toast({
        title: "YouTube Sync Complete",
        description: `Found ${data.totalFound} videos. ${data.inserted} new, ${data.updated} updated.`,
      });
      queryClient.invalidateQueries({ queryKey: ["webinar-videos"] });
    } catch (err: any) {
      toast({
        title: "Sync Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await (supabase.from("webinar_videos" as any) as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Video deleted" });
      queryClient.invalidateQueries({ queryKey: ["webinar-videos"] });
    }
  };

  const handleToggleFeatured = async (video: WebinarVideo) => {
    const { error } = await (supabase.from("webinar_videos" as any) as any)
      .update({ is_featured: !video.is_featured })
      .eq("id", video.id);
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ["webinar-videos"] });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Webinar Videos</h1>
        <Button onClick={handleSync} disabled={syncing} className="gap-2">
          {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Sync from YouTube
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="mb-4">No webinar videos yet.</p>
          <p className="text-sm">Click "Sync from YouTube" to pull videos from your channel.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {videos.map((video) => (
            <div key={video.id} className="bg-card border border-border rounded-lg p-4 flex gap-4 items-start">
              {video.thumbnail_url && (
                <img
                  src={video.thumbnail_url}
                  alt={video.title || ""}
                  className="w-40 h-24 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-1">{video.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{video.description}</p>
                <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{video.category}</span>
                  {video.published_at && (
                    <span>• {new Date(video.published_at).toLocaleDateString()}</span>
                  )}
                  {video.is_featured && (
                    <span className="text-primary font-medium">• Featured</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleFeatured(video)}
                >
                  {video.is_featured ? "Unfeature" : "Feature"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(video.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
