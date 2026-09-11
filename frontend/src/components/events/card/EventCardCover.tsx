import Image from "next/image";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

interface EventCardCoverProps {
  readonly coverImageUrl: string | null;
  readonly title: string;
  readonly category: string;
  readonly price: number;
  readonly currency: string;
  readonly isFree: boolean;
  readonly priority?: boolean;
}

export default function EventCardCover({
  coverImageUrl,
  title,
  category,
  price,
  currency,
  isFree,
  priority = false,
}: EventCardCoverProps) {
  const tCat = useTranslations("categories");
  const tEvents = useTranslations("events");

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-2xl bg-slate-950">
      {coverImageUrl ? (
        <Image
          src={coverImageUrl}
          alt={title}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-700">
          <Sparkles className="h-10 w-10 opacity-30" />
        </div>
      )}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

      {/* Category Badge (Top-Left) */}
      <div className="absolute left-3 top-3">
        <span className="inline-flex items-center rounded-xl bg-slate-950/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-400 backdrop-blur-md border border-slate-800">
          {tCat(category as any)}
        </span>
      </div>

      {/* Price Badge (Top-Right) */}
      <div className="absolute right-3 top-3">
        {isFree ? (
          <span className="inline-flex items-center rounded-xl bg-emerald-500/95 px-2.5 py-1 text-xs font-black text-slate-950 shadow-sm backdrop-blur-sm">
            {tEvents("free")}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-xl bg-slate-900/90 px-2.5 py-1 text-xs font-bold text-slate-100 border border-slate-700/80 backdrop-blur-md">
            ${price} {currency}
          </span>
        )}
      </div>
    </div>
  );
}
