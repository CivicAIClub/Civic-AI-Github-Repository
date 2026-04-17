/**
 * Griffin silhouette logo. Imported so the URL is correct on every route (nested
 * paths would break a bare `/griffin-logo.png` from public/).
 */
import logoUrl from "../assets/griffin-logo.png";

type Props = {
  className?: string;
  /** Sidebar vs top bar sizing */
  variant?: "default" | "compact";
};

export function SchoolBrandMark({ className = "", variant = "default" }: Props) {
  return (
    <img
      src={logoUrl}
      alt=""
      className={[
        "school-brand-mark",
        variant === "compact" ? "school-brand-mark--compact" : "school-brand-mark--default",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      decoding="async"
      loading="lazy"
      aria-hidden
    />
  );
}
