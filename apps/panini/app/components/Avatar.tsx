import type { Collector } from "@/lib/album-logic";
import { collectorStyle } from "@/lib/colors";

/** A collector's initial on their colour. */
export function Avatar({
  collector,
  small = false,
}: {
  collector: Collector;
  small?: boolean;
}) {
  return (
    <span
      style={collectorStyle(collector.color)}
      className={`inline-flex flex-none items-center justify-center rounded-full bg-kc font-mono font-bold text-white ${
        small ? "size-5.5 text-[11px]" : "size-6.5 text-xs"
      }`}
    >
      {collector.name.charAt(0).toUpperCase()}
    </span>
  );
}
