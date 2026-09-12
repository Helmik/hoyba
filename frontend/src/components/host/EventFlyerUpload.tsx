"use client";

import { useState } from "react";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { compressToWebP } from "@/lib/image-compression";
import { createClient } from "@/lib/supabase/client";
import { captureAppError } from "@/lib/error";

interface EventFlyerUploadProps {
  readonly value: string;
  readonly onChange: (url: string) => void;
  readonly error?: string;
}

export default function EventFlyerUpload({
  value,
  onChange,
  error,
}: EventFlyerUploadProps) {
  const tHost = useTranslations("host");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      const webpFile = await compressToWebP(file, { maxWidth: 1920, maxHeight: 1080 });
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const fileName = `${user.id}/${Date.now()}_flyer.webp`;
      const { error: storageError } = await supabase.storage
        .from("covers")
        .upload(fileName, webpFile, {
          upsert: true,
          contentType: "image/webp",
        });

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from("covers")
        .getPublicUrl(fileName);

      onChange(publicUrl);
    } catch (err) {
      captureAppError(err, { section: "host-flyer-upload" });
      setUploadError(tHost("flyerUploadError"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
        {tHost("flyerLabel")}
      </label>

      <div className="mt-1.5 flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-3">
        {value ? (
          <div className="relative aspect-video w-full sm:w-44 overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
            <img src={value} alt="Flyer preview" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex aspect-video w-full sm:w-44 items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/50 text-slate-500">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}

        <div className="flex-1 text-center sm:text-left">
          <label
            style={{ WebkitTapHighlightColor: "transparent" }}
            className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span>{isUploading ? tHost("optimizingFlyer") : tHost("selectFlyer")}</span>
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
          <p className="mt-1.5 text-[11px] text-slate-400">
            {tHost("flyerNote")}
          </p>
        </div>
      </div>
      {(error || uploadError) && (
        <p className="mt-1 text-xs text-rose-400">{error || uploadError}</p>
      )}
    </div>
  );
}
