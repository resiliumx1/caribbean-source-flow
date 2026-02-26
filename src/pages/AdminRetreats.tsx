import { useState, useRef } from "react";
import { Plus, Trash2, Star, Upload, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import {
  useRetreatGallery,
  useRetreatGalleryMutations,
  RETREAT_CATEGORIES,
} from "@/hooks/use-retreat-gallery";

export default function AdminRetreats() {
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
    if (file) {
      setUploadForm((prev) => ({ ...prev, file }));
    }
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

    setUploadForm({
      file: null,
      title: "",
      description: "",
      category: "experience",
      isFeatured: false,
    });
    setIsDialogOpen(false);
  };

  const handleToggleFeatured = (id: string, currentValue: boolean) => {
    updateImage.mutate({ id, is_featured: !currentValue });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      deleteImage.mutate(id);
    }
  };

  const handleStartEdit = (image: any) => {
    setEditingImage(image.id);
    setEditTitle(image.title || "");
    setEditDescription(image.description || "");
  };

  const handleSaveEdit = (id: string) => {
    updateImage.mutate({ id, title: editTitle || null, description: editDescription || null });
    setEditingImage(null);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "experience":
        return "bg-forest text-cream";
      case "healing":
        return "bg-primary text-primary-foreground";
      case "food":
        return "bg-accent text-accent-foreground";
      case "other":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Retreat Gallery
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage retreat images displayed on the public retreats page
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Gallery Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* File upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                {uploadForm.file ? (
                  <div className="space-y-2">
                    <img
                      src={URL.createObjectURL(uploadForm.file)}
                      alt="Preview"
                      className="max-h-40 mx-auto rounded-lg"
                    />
                    <p className="text-sm text-muted-foreground">
                      {uploadForm.file.name}
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to select image
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium">Title (optional)</label>
                <Input
                  value={uploadForm.title}
                  onChange={(e) =>
                    setUploadForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., Morning meditation session"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium">Description (optional)</label>
                <Textarea
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of the image..."
                  rows={2}
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={uploadForm.category}
                  onValueChange={(value) =>
                    setUploadForm((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RETREAT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Featured toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadForm.isFeatured}
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      isFeatured: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm">Feature in hero section</span>
              </label>

              <Button
                onClick={handleUpload}
                disabled={!uploadForm.file || uploadImage.isPending}
                className="w-full"
              >
                {uploadImage.isPending ? "Uploading..." : "Upload Image"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-2xl font-bold text-foreground">{images.length}</p>
          <p className="text-sm text-muted-foreground">Total Images</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-2xl font-bold text-foreground">
            {images.filter((i) => i.is_featured).length}
          </p>
          <p className="text-sm text-muted-foreground">Featured</p>
        </div>
        {RETREAT_CATEGORIES.slice(0, 2).map((cat) => (
          <div key={cat.value} className="bg-card p-4 rounded-xl border border-border">
            <p className="text-2xl font-bold text-foreground">
              {images.filter((i) => i.category === cat.value).length}
            </p>
            <p className="text-sm text-muted-foreground">{cat.label}</p>
          </div>
        ))}
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No images yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Upload images to showcase your retreat experience
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Image
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="aspect-square">
                <img
                  src={image.image_url}
                  alt={image.title || "Gallery image"}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                <Badge className={getCategoryColor(image.category)}>
                  {image.category}
                </Badge>
                {image.is_featured && (
                  <Badge className="bg-gold text-foreground">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => handleStartEdit(image)}
                  className="w-10 h-10"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => handleToggleFeatured(image.id, image.is_featured)}
                  className="w-10 h-10"
                >
                  <Star
                    className={`w-4 h-4 ${image.is_featured ? "fill-gold text-gold" : ""}`}
                  />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(image.id)}
                  className="w-10 h-10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Info / Edit */}
              {editingImage === image.id ? (
                <div className="p-3 space-y-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Title"
                    className="h-7 text-xs"
                    autoFocus
                  />
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description"
                    rows={2}
                    className="text-xs"
                  />
                  <div className="flex gap-1">
                    <Button size="sm" className="h-6 text-xs" onClick={() => handleSaveEdit(image.id)}>Save</Button>
                    <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setEditingImage(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                (image.title || image.description) && (
                  <div className="p-3">
                    {image.title && (
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {image.title}
                      </p>
                    )}
                    {image.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {image.description}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
