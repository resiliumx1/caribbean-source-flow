import { useState, useRef } from "react";
import { Plus, Trash2, Star, Upload, Pencil, Video, Image as ImageIcon, Tent, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  useRetreatGallery,
  useRetreatGalleryMutations,
  RETREAT_CATEGORIES,
} from "@/hooks/use-retreat-gallery";

const VIDEO_CATEGORIES = [
  { value: "experience", label: "Experience" },
  { value: "healing", label: "Healing" },
  { value: "food", label: "Food" },
  { value: "other", label: "Other" },
  { value: "special_retreat", label: "Special Retreat" },
  { value: "solo_retreat", label: "Solo Retreat" },
  { value: "group_retreat", label: "Group Retreat" },
];

export default function AdminRetreats() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif font-bold text-foreground">Retreat Media</h1>
      <Tabs defaultValue="gallery" className="w-full">
        <TabsList>
          <TabsTrigger value="gallery" className="gap-2"><ImageIcon className="w-4 h-4" />Gallery</TabsTrigger>
          <TabsTrigger value="videos" className="gap-2"><Video className="w-4 h-4" />Videos</TabsTrigger>
          <TabsTrigger value="retreats" className="gap-2"><Tent className="w-4 h-4" />Retreats</TabsTrigger>
        </TabsList>
        <TabsContent value="gallery"><GalleryTab /></TabsContent>
        <TabsContent value="videos"><VideosTab /></TabsContent>
        <TabsContent value="retreats"><RetreatsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ========== GALLERY TAB (original) ========== */
function GalleryTab() {
  const { data: images = [], isLoading } = useRetreatGallery();
  const { uploadImage, updateImage, deleteImage } = useRetreatGalleryMutations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    title: "",
    description: "",
    category: "experience",
    isFeatured: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadForm((prev) => ({ ...prev, file }));
  };

  const handleUpload = async () => {
    if (!uploadForm.file) return;
    await uploadImage.mutateAsync({
      file: uploadForm.file,
      title: uploadForm.title || undefined,
      description: uploadForm.description || undefined,
      category: uploadForm.category,
      isFeatured: uploadForm.isFeatured,
    });
    setUploadForm({ file: null, title: "", description: "", category: "experience", isFeatured: false });
    setIsDialogOpen(false);
  };

  const handleToggleFeatured = (id: string, currentValue: boolean) => updateImage.mutate({ id, is_featured: !currentValue });
  const handleDelete = (id: string) => { if (confirm("Delete this image?")) deleteImage.mutate(id); };
  const handleStartEdit = (image: any) => { setEditingImage(image.id); setEditTitle(image.title || ""); setEditDescription(image.description || ""); };
  const handleSaveEdit = (id: string) => { updateImage.mutate({ id, title: editTitle || null, description: editDescription || null }); setEditingImage(null); };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "experience": return "bg-forest text-cream";
      case "healing": return "bg-primary text-primary-foreground";
      case "food": return "bg-accent text-accent-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">Manage retreat gallery images</p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Add Image</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Upload Gallery Image</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                {uploadForm.file ? (
                  <div className="space-y-2">
                    <img src={URL.createObjectURL(uploadForm.file)} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                    <p className="text-sm text-muted-foreground">{uploadForm.file.name}</p>
                  </div>
                ) : (
                  <><Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">Click to select image</p></>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
              <div><label className="text-sm font-medium">Title (optional)</label><Input value={uploadForm.title} onChange={(e) => setUploadForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g., Morning meditation" /></div>
              <div><label className="text-sm font-medium">Description (optional)</label><Textarea value={uploadForm.description} onChange={(e) => setUploadForm((p) => ({ ...p, description: e.target.value }))} placeholder="Brief description..." rows={2} /></div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={uploadForm.category} onValueChange={(v) => setUploadForm((p) => ({ ...p, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RETREAT_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={uploadForm.isFeatured} onChange={(e) => setUploadForm((p) => ({ ...p, isFeatured: e.target.checked }))} className="w-4 h-4 rounded border-border" /><span className="text-sm">Feature in hero section</span></label>
              <Button onClick={handleUpload} disabled={!uploadForm.file || uploadImage.isPending} className="w-full">{uploadImage.isPending ? "Uploading..." : "Upload Image"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}</div>
      ) : images.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No images yet</h3>
          <Button onClick={() => setIsDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Add First Image</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="group relative bg-card rounded-xl border border-border overflow-hidden">
              <div className="aspect-square"><img src={image.image_url} alt={image.title || "Gallery"} className="w-full h-full object-cover" /></div>
              <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                <Badge className={getCategoryColor(image.category)}>{image.category}</Badge>
                {image.is_featured && <Badge className="bg-gold text-foreground"><Star className="w-3 h-3 mr-1" />Featured</Badge>}
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button variant="secondary" size="icon" onClick={() => handleStartEdit(image)} className="w-10 h-10"><Pencil className="w-4 h-4" /></Button>
                <Button variant="secondary" size="icon" onClick={() => handleToggleFeatured(image.id, image.is_featured)} className="w-10 h-10"><Star className={`w-4 h-4 ${image.is_featured ? "fill-gold text-gold" : ""}`} /></Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(image.id)} className="w-10 h-10"><Trash2 className="w-4 h-4" /></Button>
              </div>
              {editingImage === image.id ? (
                <div className="p-3 space-y-2">
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" className="h-7 text-xs" autoFocus />
                  <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description" rows={2} className="text-xs" />
                  <div className="flex gap-1">
                    <Button size="sm" className="h-6 text-xs" onClick={() => handleSaveEdit(image.id)}>Save</Button>
                    <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setEditingImage(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (image.title || image.description) && (
                <div className="p-3">
                  {image.title && <p className="text-sm font-medium line-clamp-1">{image.title}</p>}
                  {image.description && <p className="text-xs text-muted-foreground line-clamp-2">{image.description}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========== RETREATS TAB ========== */
function RetreatsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "group" as "group" | "solo",
    base_price_usd: "",
    max_capacity: "10",
    min_nights: "1",
    max_nights: "1",
    description: "",
    has_date: false,
    start_date: "",
    end_date: "",
    spots_total: "20",
  });
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null, null]);

  const { data: retreats = [], isLoading } = useQuery({
    queryKey: ["admin-retreat-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("retreat_types")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const resetForm = () => {
    setForm({
      name: "", type: "group", base_price_usd: "", max_capacity: "10",
      min_nights: "1", max_nights: "1", description: "",
      has_date: false, start_date: "", end_date: "", spots_total: "20",
    });
    setImageFiles([null, null, null, null]);
  };

  const createRetreat = useMutation({
    mutationFn: async () => {
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const uploaded: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        if (!file) continue;
        const ext = file.name.split(".").pop() || "jpg";
        const path = `retreats/${slug}-${i}-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("retreat-images").upload(path, file, { cacheControl: "3600", upsert: true });
        if (upErr) throw upErr;
        const { data: u } = supabase.storage.from("retreat-images").getPublicUrl(path);
        uploaded.push(u.publicUrl);
      }
      const { data: rt, error } = await supabase.from("retreat_types").insert({
        slug,
        name: form.name,
        type: form.type,
        base_price_usd: parseFloat(form.base_price_usd) || 0,
        price_type: form.type === "group" ? "per_person" : "per_night",
        max_capacity: parseInt(form.max_capacity) || 10,
        min_nights: parseInt(form.min_nights) || 1,
        max_nights: parseInt(form.max_nights) || 1,
        description: form.description || null,
        image_url: uploaded[0] ?? null,
        additional_images: uploaded.slice(1),
        is_active: true,
      }).select().single();
      if (error) throw error;

      if (form.has_date && form.start_date && form.end_date) {
        const { error: dErr } = await supabase.from("retreat_dates").insert({
          retreat_type_id: rt.id,
          start_date: form.start_date,
          end_date: form.end_date,
          spots_total: parseInt(form.spots_total) || 20,
          is_published: true,
        });
        if (dErr) throw dErr;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-retreat-types"] });
      toast({ title: "Retreat created" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("retreat_types").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-retreat-types"] }),
  });

  const deleteRetreat = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("retreat_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-retreat-types"] });
      toast({ title: "Retreat deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">Manage retreat offerings (group events, solo immersions)</p>
        <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Add Retreat</Button></DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add New Retreat</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Retreat Name *</label>
                <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g., Caribbean Wellness Saint Lucia 2026" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={form.type} onValueChange={(v: "group" | "solo") => setForm((p) => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="group">Group</SelectItem>
                      <SelectItem value="solo">Solo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Base Price (USD) *</label>
                  <Input type="number" step="0.01" value={form.base_price_usd} onChange={(e) => setForm((p) => ({ ...p, base_price_usd: e.target.value }))} placeholder="70" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium">Capacity</label>
                  <Input type="number" value={form.max_capacity} onChange={(e) => setForm((p) => ({ ...p, max_capacity: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Min Nights</label>
                  <Input type="number" value={form.min_nights} onChange={(e) => setForm((p) => ({ ...p, min_nights: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Nights</label>
                  <Input type="number" value={form.max_nights} onChange={(e) => setForm((p) => ({ ...p, max_nights: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="What's included, the experience…" />
              </div>

              {/* Images 1-4 */}
              <div>
                <label className="text-sm font-medium">Images (up to 4)</label>
                <p className="text-xs text-muted-foreground mb-2">First image is the primary/cover.</p>
                <div className="grid grid-cols-4 gap-2">
                  {imageFiles.map((file, i) => (
                    <label key={i} className="relative aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 cursor-pointer overflow-hidden flex items-center justify-center bg-muted/30">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          setImageFiles((prev) => { const n = [...prev]; n[i] = f; return n; });
                        }}
                      />
                      {file ? (
                        <>
                          <img src={URL.createObjectURL(file)} alt={`Slot ${i + 1}`} className="w-full h-full object-cover" />
                          {i === 0 && <span className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] font-medium px-1 py-0.5 rounded">Cover</span>}
                          <button type="button" onClick={(e) => { e.preventDefault(); setImageFiles((prev) => { const n = [...prev]; n[i] = null; return n; }); }} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                          <Upload className="w-4 h-4" />
                          <span className="text-[10px]">{i === 0 ? "Cover" : "Add"}</span>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Optional initial date */}
              <div className="rounded-lg border border-border p-3 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium">
                  <Checkbox checked={form.has_date} onCheckedChange={(v) => setForm((p) => ({ ...p, has_date: !!v }))} />
                  <span>Add an initial scheduled date</span>
                </label>
                {form.has_date && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Start Date</label>
                      <Input type="date" value={form.start_date} onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">End Date</label>
                      <Input type="date" value={form.end_date} onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Spots</label>
                      <Input type="number" value={form.spots_total} onChange={(e) => setForm((p) => ({ ...p, spots_total: e.target.value }))} />
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={() => createRetreat.mutate()}
                disabled={!form.name || !form.base_price_usd || createRetreat.isPending}
                className="w-full"
              >
                {createRetreat.isPending ? "Creating..." : "Create Retreat"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
      ) : retreats.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Tent className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No retreats yet</h3>
          <Button onClick={() => setIsDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Add First Retreat</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {retreats.map((r) => (
            <div key={r.id} className="bg-card rounded-xl border border-border overflow-hidden">
              {r.image_url && (
                <div className="aspect-video bg-muted">
                  <img src={r.image_url} alt={r.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm line-clamp-2">{r.name}</p>
                  <Badge variant={r.is_active ? "default" : "outline"} className="shrink-0 text-xs">
                    {r.is_active ? "Active" : "Hidden"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {r.type === "group" ? "Group" : "Solo"} · ${r.base_price_usd} · cap {r.max_capacity}
                </p>
                {r.description && <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>}
                <div className="flex items-center justify-between pt-2">
                  <Button variant="ghost" size="sm" className="h-7 text-xs"
                    onClick={() => toggleActive.mutate({ id: r.id, is_active: !r.is_active })}>
                    {r.is_active ? "Hide" : "Show"}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                    onClick={() => { if (confirm(`Delete "${r.name}"?`)) deleteRetreat.mutate(r.id); }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========== VIDEOS TAB (new) ========== */
function VideosTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [videoForm, setVideoForm] = useState({
    video_url: "",
    title: "",
    description: "",
    category: "experience",
    is_featured: false,
  });

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["admin-retreat-videos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("retreat_videos").select("*").order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const addVideo = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("retreat_videos").insert({
        video_url: videoForm.video_url,
        title: videoForm.title || null,
        description: videoForm.description || null,
        category: videoForm.category,
        is_featured: videoForm.is_featured,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-retreat-videos"] });
      toast({ title: "Video added" });
      setVideoForm({ video_url: "", title: "", description: "", category: "experience", is_featured: false });
      setIsDialogOpen(false);
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteVideo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("retreat_videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-retreat-videos"] });
      toast({ title: "Video deleted" });
    },
  });

  const updateVideo = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from("retreat_videos").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-retreat-videos"] }),
  });

  const getCategoryLabel = (val: string) => VIDEO_CATEGORIES.find((c) => c.value === val)?.label ?? val;

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">Manage retreat videos (YouTube URLs or direct links)</p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Add Video</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Add Retreat Video</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div><label className="text-sm font-medium">Video URL *</label><Input value={videoForm.video_url} onChange={(e) => setVideoForm((p) => ({ ...p, video_url: e.target.value }))} placeholder="https://youtube.com/watch?v=... or direct URL" /></div>
              <div><label className="text-sm font-medium">Title (optional)</label><Input value={videoForm.title} onChange={(e) => setVideoForm((p) => ({ ...p, title: e.target.value }))} placeholder="Video title" /></div>
              <div><label className="text-sm font-medium">Description (optional)</label><Textarea value={videoForm.description} onChange={(e) => setVideoForm((p) => ({ ...p, description: e.target.value }))} rows={2} placeholder="Brief description..." /></div>
              <div>
                <label className="text-sm font-medium">Category / Retreat Type</label>
                <Select value={videoForm.category} onValueChange={(v) => setVideoForm((p) => ({ ...p, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{VIDEO_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={videoForm.is_featured} onChange={(e) => setVideoForm((p) => ({ ...p, is_featured: e.target.checked }))} className="w-4 h-4 rounded border-border" /><span className="text-sm">Featured video</span></label>
              <Button onClick={() => addVideo.mutate()} disabled={!videoForm.video_url || addVideo.isPending} className="w-full">{addVideo.isPending ? "Adding..." : "Add Video"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-2xl font-bold">{videos.length}</p>
          <p className="text-sm text-muted-foreground">Total Videos</p>
        </div>
        {["special_retreat", "solo_retreat", "group_retreat"].map((cat) => (
          <div key={cat} className="bg-card p-4 rounded-xl border border-border">
            <p className="text-2xl font-bold">{videos.filter((v) => v.category === cat).length}</p>
            <p className="text-sm text-muted-foreground">{getCategoryLabel(cat)}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
          <Button onClick={() => setIsDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Add First Video</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div key={video.id} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{video.title || "Untitled"}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{video.video_url}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">{getCategoryLabel(video.category)}</Badge>
                </div>
                {video.description && <p className="text-xs text-muted-foreground line-clamp-2">{video.description}</p>}
                <div className="flex items-center justify-between pt-2">
                  <Select value={video.category} onValueChange={(v) => updateVideo.mutate({ id: video.id, updates: { category: v } })}>
                    <SelectTrigger className="h-7 text-xs w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>{VIDEO_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateVideo.mutate({ id: video.id, updates: { is_featured: !video.is_featured } })}>
                      <Star className={`w-3.5 h-3.5 ${video.is_featured ? "fill-amber-500 text-amber-500" : ""}`} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("Delete this video?")) deleteVideo.mutate(video.id); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
