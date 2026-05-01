import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { TabBar } from "@/components/app/TabBar";
import { ChevronLeft, Camera, X, ChevronRight, Repeat, DollarSign, Loader2, Plus } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Category, Condition, ListingType, Size } from "@/lib/mock-data";
import { CATEGORY_GROUPS } from "@/lib/mock-data";
import { compressImage } from "@/lib/compress-image";

const postSearchSchema = z.object({
  edit: z.string().optional(),
});

export const Route = createFileRoute("/post")({
  validateSearch: postSearchSchema,
  component: Post,
});

function Post() {
  const navigate = useNavigate();
  const { edit: editId } = useSearch({ from: "/post" });
  const { addListing, updateListing, isAuthed, session, listings } = useApp();
  const editing = useMemo(() => (editId ? listings.find((l) => l.id === editId) : undefined), [editId, listings]);
  const isEdit = Boolean(editing);
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<string[]>(editing?.photos ?? []); // public URLs
  // Map of public URL -> storage path, only for files uploaded in THIS session (so we can clean up on remove)
  const [pathByUrl, setPathByUrl] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [type, setType] = useState<ListingType>(editing?.type ?? "Sell");
  const galleryInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: editing?.title ?? "",
    brand: editing?.brand ?? "",
    price: editing ? String(editing.price) : "",
    tradeFor: editing?.tradeFor ?? "",
    category: (editing?.category ?? "Tops") as Category,
    condition: (editing?.condition ?? "Good") as Condition,
    size: (editing?.size ?? "M") as Size,
    neighbourhood: editing?.neighbourhood ?? "North End",
    description: editing?.description ?? "",
  });

  // If listings load after the route mounts, hydrate the form once we find the listing
  useEffect(() => {
    if (!editing) return;
    setPhotos(editing.photos);
    setType(editing.type);
    setForm({
      title: editing.title,
      brand: editing.brand,
      price: String(editing.price),
      tradeFor: editing.tradeFor ?? "",
      category: editing.category,
      condition: editing.condition,
      size: editing.size,
      neighbourhood: editing.neighbourhood,
      description: editing.description,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.id]);


  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="mx-5 mt-20 rounded-3xl bg-gradient-hero p-8 text-center text-primary-foreground shadow-glow">
          <h2 className="font-display text-2xl font-bold">Sign in to post</h2>
          <p className="mt-2 text-sm opacity-90">Create an account to start selling and trading.</p>
          <button onClick={() => navigate({ to: "/auth" as string })} className="mt-6 rounded-full bg-primary-foreground px-6 py-3 text-sm font-bold text-secondary">Sign up free</button>
        </div>
        <TabBar />
      </div>
    );
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length || !session?.user?.id) return;
    const remaining = 6 - photos.length;
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    let uploadedCount = 0;
    try {
      for (const original of toUpload) {
        // Camera captures sometimes have an empty type or a non-image MIME (e.g. HEIC).
        // Treat anything the browser handed us via an image-only input as an image,
        // but still block obvious non-images when type is set.
        if (original.type && !original.type.startsWith("image/")) {
          toast.error(`${original.name || "File"} isn't an image`);
          continue;
        }
        if (original.size > 25 * 1024 * 1024) {
          toast.error(`${original.name || "Photo"} is over 25MB — try a smaller one`);
          continue;
        }
        // Compress/resize before upload to keep things snappy.
        const file = await compressImage(original, { maxEdge: 1600, quality: 0.82 });
        // Derive extension safely: prefer MIME type (camera photos often have name="image.jpg" or no name)
        const mimeExt = file.type?.split("/")[1]?.split(";")[0]?.toLowerCase();
        const nameParts = (file.name || "").split(".");
        const nameExt = nameParts.length > 1 ? nameParts.pop()?.toLowerCase() : undefined;
        const ext = (mimeExt && mimeExt !== "jpeg" ? mimeExt : "jpg") || nameExt || "jpg";
        const contentType = file.type || `image/${ext === "jpg" ? "jpeg" : ext}`;
        const path = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("listing-photos").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType,
        });
        if (upErr) {
          console.error("Upload failed", upErr, { name: file.name, type: file.type, size: file.size });
          toast.error(`Upload failed: ${upErr.message}`);
          continue;
        }
        const { data: { publicUrl } } = supabase.storage.from("listing-photos").getPublicUrl(path);
        setPhotos((p) => [...p, publicUrl]);
        setPathByUrl((m) => ({ ...m, [publicUrl]: path }));
        uploadedCount++;
      }
      if (uploadedCount === 0 && toUpload.length > 0) {
        toast.error("Couldn't add that photo. Try picking it from your library instead.");
      }
    } finally {
      setUploading(false);
      if (galleryInput.current) galleryInput.current.value = "";
      if (cameraInput.current) cameraInput.current.value = "";
    }
  };

  const removePhoto = async (i: number) => {
    const url = photos[i];
    const path = pathByUrl[url];
    setPhotos((p) => p.filter((_, j) => j !== i));
    if (path) {
      setPathByUrl((m) => {
        const next = { ...m };
        delete next[url];
        return next;
      });
      await supabase.storage.from("listing-photos").remove([path]);
    }
  };

  const publish = async () => {
    if (!form.title.trim()) { toast.error("Add a title"); return; }
    setPublishing(true);
    const payload = {
      title: form.title.trim(),
      brand: form.brand.trim() || "Unknown",
      price: type === "Sell" ? Number(form.price) || 0 : 0,
      type,
      tradeFor: type === "Trade" ? form.tradeFor : undefined,
      category: (form.category || "Other") as Category,
      condition: (form.condition || "Good") as Condition,
      size: (form.size || "One size") as Size,
      neighbourhood: form.neighbourhood,
      description: form.description || "No description.",
      photos,
      sold: editing?.sold ?? false,
    };
    if (isEdit && editing) {
      const ok = await updateListing(editing.id, payload);
      setPublishing(false);
      if (ok) {
        toast.success("Listing updated ✨");
        navigate({ to: "/my-listings" as string });
      }
      return;
    }
    const id = await addListing(payload);
    setPublishing(false);
    if (id) {
      toast.success("Listing published! 🎉");
      navigate({ to: "/browse" as string });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/85 px-3 py-3 backdrop-blur-xl">
        <button onClick={() => step ? setStep(step - 1) : navigate({ to: (isEdit ? "/my-listings" : "/browse") as string })} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-center font-display text-lg font-bold">{isEdit ? ["Edit photos", "Listing type", "Edit details"][step] : ["Add photos", "Listing type", "Details"][step]}</p>
          <div className="mt-1 flex justify-center gap-1">
            {[0, 1, 2].map((i) => <div key={i} className={cn("h-1 rounded-full transition-all", i === step ? "w-6 bg-primary" : "w-3 bg-border")} />)}
          </div>
        </div>
        <div className="w-9" />
      </header>

      <div className="px-5 pt-6 animate-fade-in">
        {step === 0 && (
          <>
            <p className="text-sm text-muted-foreground">Add up to 6 photos. The first one is your cover.</p>
            <input
              ref={galleryInput}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />
            <input
              ref={cameraInput}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />

            {photos.length < 6 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => cameraInput.current?.click()}
                  disabled={uploading}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border bg-muted py-5 text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
                  <span className="text-xs font-semibold">Take photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => galleryInput.current?.click()}
                  disabled={uploading}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border bg-muted py-5 text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Plus className="h-6 w-6" />}
                  <span className="text-xs font-semibold">Choose from gallery</span>
                </button>
              </div>
            )}

            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-2xl">
                    <img src={p} className="h-full w-full object-cover" alt="" />
                    <button onClick={() => removePhoto(i)} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 backdrop-blur"><X className="h-3 w-3" /></button>
                    {i === 0 && <span className="absolute bottom-1.5 left-1.5 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground">COVER</span>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">How do you want to list this?</p>
            <button onClick={() => setType("Sell")} className={cn("flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all", type === "Sell" ? "border-primary bg-accent" : "border-border bg-card")}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground"><DollarSign className="h-5 w-5" /></div>
              <div>
                <p className="font-display text-lg font-bold">Sell</p>
                <p className="text-xs text-muted-foreground">Set a price and ship or meet locally</p>
              </div>
            </button>
            <button onClick={() => setType("Trade")} className={cn("flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all", type === "Trade" ? "border-primary bg-accent" : "border-border bg-card")}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground"><Repeat className="h-5 w-5" /></div>
              <div>
                <p className="font-display text-lg font-bold">Trade</p>
                <p className="text-xs text-muted-foreground">Swap for something equally cool</p>
              </div>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Vintage levi's denim jacket" />
            <Field label="Brand" value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} placeholder="Levi's" />
            {type === "Sell"
              ? <Field label="Price (CAD)" value={form.price} onChange={(v) => setForm({ ...form, price: v })} placeholder="45" />
              : <Field label="Trade for" value={form.tradeFor} onChange={(v) => setForm({ ...form, tradeFor: v })} placeholder="Looking for a size M cardigan" />
            }
            <CategoryField value={form.category} onChange={(v) => setForm({ ...form, category: (v ?? "") as Category })} />
            <SelectField label="Condition" value={form.condition} options={["New with tags","Like new","Good","Fair"] as Condition[]} onChange={(v) => setForm({ ...form, condition: (v ?? "") as Condition })} />
            <SelectField label="Size" value={form.size} options={["XS","S","M","L","XL","XXL"] as Size[]} onChange={(v) => setForm({ ...form, size: (v ?? "") as Size })} />
            <Field label="Neighbourhood" value={form.neighbourhood} onChange={(v) => setForm({ ...form, neighbourhood: v })} />
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4}
                placeholder="Tell buyers about the fit, fabric, and any flaws…"
                className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-soft outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="rounded-2xl border border-border bg-muted p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preview</p>
              <p className="mt-1 font-display text-lg font-bold">{form.title || "Your title"}</p>
              <p className="text-sm text-muted-foreground">{form.brand || "Brand"} · Size {form.size}</p>
              <p className="mt-1 text-lg font-bold text-primary">{type === "Trade" ? "Trade" : `$${form.price || "0"}`}</p>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="mx-auto w-full max-w-md border-t border-border bg-background/90 px-4 py-3 backdrop-blur-xl sm:rounded-t-2xl sm:border-x">
          <button
            type="button"
            onClick={() => step < 2 ? setStep(step + 1) : publish()}
            disabled={(step === 0 && photos.length === 0) || publishing || uploading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary py-3.5 text-sm font-bold text-primary-foreground shadow-glow active:scale-[0.98] disabled:opacity-40"
          >
            {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
            {step === 2
              ? (publishing
                  ? (isEdit ? "Saving…" : "Publishing…")
                  : (isEdit ? "Save changes" : "Publish listing"))
              : "Next"}
            {!publishing && <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-soft outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
    </div>
  );
}
function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const selected = value === o;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(selected ? "" : o)}
              aria-pressed={selected}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/50"
              )}
            >{o}</button>
          );
        })}
      </div>
    </div>
  );
}

function CategoryField({ value, onChange }: { value: Category; onChange: (v: Category | "") => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
      <div className="space-y-2.5">
        {CATEGORY_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{group.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((o) => {
                const selected = value === o;
                return (
                  <button
                    key={o}
                    type="button"
                    onClick={() => onChange(selected ? "" : o)}
                    aria-pressed={selected}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                      selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/50"
                    )}
                  >{o}</button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
