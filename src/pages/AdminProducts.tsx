import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import ProductImageUpload from "@/components/admin/ProductImageUpload";
import { Search, Package, ImageIcon, Loader2, Plus, Pencil, Check, X, Trash2, RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/hooks/use-products";

const BADGE_OPTIONS = [
  { value: "none", label: "None" },
  { value: "best_seller", label: "Best Seller" },
  { value: "new", label: "New" },
  { value: "staff_pick", label: "Staff Pick" },
  { value: "100_natural", label: "100% Natural" },
  { value: "low_stock", label: "Low Stock" },
  { value: "recently_restocked", label: "Back in Stock" },
  { value: "limited_edition", label: "Limited Edition" },
  { value: "bulk", label: "Bulk" },
  { value: "popular", label: "Popular" },
];

const PRODUCT_TYPES = [
  { value: "tincture", label: "Tincture" },
  { value: "capsule", label: "Capsule" },
  { value: "tea", label: "Tea" },
  { value: "oil", label: "Oil" },
  { value: "powder", label: "Powder" },
  { value: "bundle", label: "Bundle" },
  { value: "seamoss", label: "Sea Moss" },
  { value: "soap", label: "Soap" },
  { value: "book", label: "Book" },
  { value: "raw_herb", label: "Raw Herb" },
  { value: "other", label: "Other" },
];

export default function AdminProducts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState("");
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [editPriceUsd, setEditPriceUsd] = useState("");
  const [editPriceXcd, setEditPriceXcd] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCategoryId, setBulkCategoryId] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState({
    name: "",
    product_type: "tincture",
    category_id: "",
    price_usd: "",
    price_xcd: "",
    short_description: "",
    badge: "none",
    stock_status: "in_stock",
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_categories(*)")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["product-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const createProduct = useMutation({
    mutationFn: async () => {
      const slug = newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const priceUsd = parseFloat(newProduct.price_usd);
      const priceXcd = parseFloat(newProduct.price_xcd) || priceUsd * 2.7;

      const { error } = await supabase.from("products").insert({
        name: newProduct.name,
        slug,
        product_type: newProduct.product_type,
        category_id: newProduct.category_id || null,
        price_usd: priceUsd,
        price_xcd: priceXcd,
        short_description: newProduct.short_description || null,
        badge: newProduct.badge === "none" ? null : newProduct.badge,
        stock_status: newProduct.stock_status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product created" });
      setIsAddOpen(false);
      setNewProduct({ name: "", product_type: "tincture", category_id: "", price_usd: "", price_xcd: "", short_description: "", badge: "none", stock_status: "in_stock" });
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from("products").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product updated" });
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateBadge = useMutation({
    mutationFn: async ({ id, badge }: { id: string; badge: string | null }) => {
      const { error } = await supabase.from("products").update({ badge }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const bulkUpdateCategory = useMutation({
    mutationFn: async ({ ids, category_id }: { ids: string[]; category_id: string }) => {
      const { error } = await supabase.from("products").update({ category_id }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: `${selectedIds.size} products updated` });
      setSelectedIds(new Set());
      setBulkCategoryId("");
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product deleted" });
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["product"] });
  };

  const handleSaveName = (id: string) => {
    if (!editNameValue.trim()) return;
    const slug = editNameValue.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    updateProduct.mutate({ id, updates: { name: editNameValue.trim(), slug } });
    setEditingName(null);
  };

  const handleSavePrice = (id: string) => {
    const usd = parseFloat(editPriceUsd);
    const xcd = parseFloat(editPriceXcd);
    if (isNaN(usd)) return;
    updateProduct.mutate({ id, updates: { price_usd: usd, price_xcd: isNaN(xcd) ? usd * 2.7 : xcd } });
    setEditingPrice(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const productsWithImages = products?.filter((p) => p.image_url).length ?? 0;
  const totalProducts = products?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage products, images, and badges</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              disabled={isSyncing}
              onClick={async () => {
                setIsSyncing(true);
                try {
                  const { data: sessionData } = await supabase.auth.getSession();
                  const token = sessionData?.session?.access_token;
                  if (!token) throw new Error("Not authenticated");
                  const res = await fetch(
                    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/woo-sync`,
                    {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );
                  const result = await res.json();
                  if (!res.ok) throw new Error(result.error || "Sync failed");
                  toast({
                    title: "WooCommerce Sync Complete",
                    description: `${result.synced} products synced (${result.created} new, ${result.updated} updated)${result.errors.length ? `, ${result.errors.length} errors` : ""}`,
                  });
                  queryClient.invalidateQueries({ queryKey: ["admin-products"] });
                  queryClient.invalidateQueries({ queryKey: ["products"] });
                } catch (e: any) {
                  toast({ title: "Sync Failed", description: e.message, variant: "destructive" });
                } finally {
                  setIsSyncing(false);
                }
              }}
            >
              {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {isSyncing ? "Syncing..." : "Sync from WooCommerce"}
            </Button>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" />Add Product</Button>
            </DialogTrigger>
          </div>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Product Name</label>
                <Input value={newProduct.name} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))} placeholder="e.g., Soursop Leaf Tincture" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={newProduct.product_type} onValueChange={(v) => setNewProduct((p) => ({ ...p, product_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={newProduct.category_id} onValueChange={(v) => setNewProduct((p) => ({ ...p, category_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Price (USD)</label>
                  <Input type="number" step="0.01" value={newProduct.price_usd} onChange={(e) => setNewProduct((p) => ({ ...p, price_usd: e.target.value }))} placeholder="29.99" />
                </div>
                <div>
                  <label className="text-sm font-medium">Price (XCD)</label>
                  <Input type="number" step="0.01" value={newProduct.price_xcd} onChange={(e) => setNewProduct((p) => ({ ...p, price_xcd: e.target.value }))} placeholder="Auto from USD" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Short Description</label>
                <Textarea value={newProduct.short_description} onChange={(e) => setNewProduct((p) => ({ ...p, short_description: e.target.value }))} placeholder="Brief product description..." rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Badge</label>
                  <Select value={newProduct.badge} onValueChange={(v) => setNewProduct((p) => ({ ...p, badge: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BADGE_OPTIONS.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Stock Status</label>
                  <Select value={newProduct.stock_status} onValueChange={(v) => setNewProduct((p) => ({ ...p, stock_status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_stock">In Stock</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      <SelectItem value="pre_order">Pre-order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => createProduct.mutate()} disabled={!newProduct.name || !newProduct.price_usd || createProduct.isPending} className="w-full">
                {createProduct.isPending ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><Package className="h-5 w-5 text-primary" /><span className="text-2xl font-bold">{totalProducts}</span></div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">With Images</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" /><span className="text-2xl font-bold">{productsWithImages}</span></div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Missing Images</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-destructive" /><span className="text-2xl font-bold">{totalProducts - productsWithImages}</span></div></CardContent>
        </Card>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-xl">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Select value={bulkCategoryId} onValueChange={setBulkCategoryId}>
            <SelectTrigger className="w-48 h-8 text-xs"><SelectValue placeholder="Assign category..." /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" disabled={!bulkCategoryId || bulkUpdateCategory.isPending} onClick={() => bulkUpdateCategory.mutate({ ids: Array.from(selectedIds), category_id: bulkCategoryId })}>
            Apply
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>Clear</Button>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts?.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={selectedIds.has(product.id)}
                    onCheckedChange={() => toggleSelect(product.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    {/* Editable Name */}
                    {editingName === product.id ? (
                      <div className="space-y-1">
                        <Input
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(product.id); if (e.key === "Escape") setEditingName(null); }}
                          className="w-full text-sm"
                          autoFocus
                        />
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleSaveName(product.id)}><Check className="w-3 h-3 mr-1" />Save</Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingName(null)}><X className="w-3 h-3 mr-1" />Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 group/name">
                        <CardTitle className="text-base line-clamp-2">{product.name}</CardTitle>
                        <button onClick={() => { setEditingName(product.id); setEditNameValue(product.name); }} className="opacity-0 group-hover/name:opacity-100 transition-opacity shrink-0">
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        </button>
                      </div>
                    )}

                    {/* Editable Price */}
                    {editingPrice === product.id ? (
                      <div className="flex items-center gap-1 mt-1">
                        <Input value={editPriceUsd} onChange={(e) => setEditPriceUsd(e.target.value)} placeholder="USD" className="h-6 text-xs w-20" type="number" step="0.01" autoFocus />
                        <Input value={editPriceXcd} onChange={(e) => setEditPriceXcd(e.target.value)} placeholder="XCD" className="h-6 text-xs w-20" type="number" step="0.01" />
                        <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => handleSavePrice(product.id)}><Check className="w-3 h-3" /></Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => setEditingPrice(null)}><X className="w-3 h-3" /></Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingPrice(product.id); setEditPriceUsd(String(product.price_usd)); setEditPriceXcd(String(product.price_xcd)); }}
                        className="text-xs text-muted-foreground hover:text-foreground mt-1 flex items-center gap-1"
                      >
                        ${product.price_usd} / EC${product.price_xcd}
                        <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                      </button>
                    )}

                    <p className="text-sm text-muted-foreground">{product.product_categories?.name ?? "Uncategorized"}</p>
                  </div>
                  {product.image_url ? (
                    product.image_url.includes('wp-content') || product.image_url.includes('mountkailashslu.com') ? (
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 shrink-0">WooCommerce Img</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 shrink-0">Has Image</Badge>
                    )
                  ) : (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 shrink-0">No Image</Badge>
                  )}
                </div>
                {/* Inline badge editor */}
                <Select
                  value={product.badge || "none"}
                  onValueChange={(v) => updateBadge.mutate({ id: product.id, badge: v === "none" ? null : v })}
                >
                  <SelectTrigger className="h-7 text-xs w-full mt-1">
                    <SelectValue placeholder="Badge" />
                  </SelectTrigger>
                  <SelectContent>
                    {BADGE_OPTIONS.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="space-y-3">
                <ProductImageUpload
                  productId={product.id}
                  productName={product.name}
                  currentImageUrl={product.image_url}
                  additionalImages={(product as any).additional_images ?? []}
                  onUploadComplete={handleImageUpdate}
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full gap-2">
                      <Trash2 className="w-3.5 h-3.5" />Delete Product
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{product.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the product and remove all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteProduct.mutate(product.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredProducts?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No products found</p>
        </div>
      )}
    </div>
  );
}
