"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/image-uploader";

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>([]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get("title"),
      description: fd.get("description"),
      type: fd.get("type"),
      address: fd.get("address"),
      city: fd.get("city"),
      county: fd.get("county"),
      maxGuests: Number(fd.get("maxGuests")),
      bedrooms: Number(fd.get("bedrooms")),
      beds: Number(fd.get("beds")),
      bathrooms: Number(fd.get("bathrooms")),
      pricePerNight: Number(fd.get("pricePerNight")) * 100,
      cleaningFee: Number(fd.get("cleaningFee") || 0) * 100,
      images,
    };
    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) { setError((await res.json()).error ?? "Failed"); return; }
    const data = await res.json();
    router.push(`/properties/${data.slug}`);
  }

  return (
    <div className="container-narrow py-12 max-w-2xl">
      <p className="eyebrow">List your property</p>
      <h1 className="display-lg mt-2 mb-8">Tell us about your place.</h1>

      <form onSubmit={submit} className="space-y-6">
        <Field name="title" label="Title" placeholder="Cliff House on the Indian Ocean" required />
        <Field name="description" label="Description" textarea required placeholder="What makes this place special?" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Select name="type" label="Type" required options={[
            { value: "ENTIRE_PLACE", label: "Entire place" },
            { value: "PRIVATE_ROOM", label: "Private room" },
            { value: "SHARED_ROOM", label: "Shared room" },
            { value: "APARTMENT", label: "Apartment" },
            { value: "COTTAGE", label: "Cottage" },
            { value: "VILLA", label: "Villa" },
          ]} />
          <Field name="county" label="County" placeholder="Kilifi" required />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field name="city" label="City / Town" placeholder="Watamu" required />
          <Field name="address" label="Street address" placeholder="Beach Road" required />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field type="number" name="maxGuests" label="Max guests" defaultValue="4" required />
          <Field type="number" name="bedrooms" label="Bedrooms" defaultValue="2" required />
          <Field type="number" name="beds" label="Beds" defaultValue="2" required />
          <Field type="number" name="bathrooms" label="Baths" defaultValue="1" required />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field type="number" name="pricePerNight" label="Price per night (KES)" required placeholder="e.g. 7500 for KES 7,500" />
          <Field type="number" name="cleaningFee" label="Cleaning fee (KES, optional)" defaultValue="0" />
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Photos</p>
          <ImageUploader value={images} onChange={setImages} max={10} />
        </div>

        {error && <p className="text-sm text-clay-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Publishing…" : "Publish listing"}
        </button>
      </form>
    </div>
  );
}

function Field({ name, label, type = "text", required, placeholder, textarea, defaultValue }: any) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      {textarea ? (
        <textarea name={name} required={required} placeholder={placeholder} defaultValue={defaultValue} rows={4} className="input-base resize-none" />
      ) : (
        <input name={name} type={type} required={required} placeholder={placeholder} defaultValue={defaultValue} className="input-base" />
      )}
    </label>
  );
}

function Select({ name, label, required, options }: any) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      <select name={name} required={required} className="input-base">
        {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
