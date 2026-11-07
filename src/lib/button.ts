// The site's buttons. Links and buttons share these, so every one looks and
// responds the same way.

type Variant = "primary" | "outline";
type Size = "md" | "sm";

const SIZE: Record<Size, string> = { md: "px-4 py-2.5", sm: "px-2.5 py-1 t-micro" };
const VARIANT: Record<Variant, string> = {
  primary: "bg-signal font-bold text-slate hover:bg-quartz",
  outline: "border border-edge text-quartz hover:border-shale",
};

export const button = (variant: Variant = "outline", size: Size = "md") =>
  `tap rounded-md transition-colors disabled:opacity-40 ${SIZE[size]} ${VARIANT[variant]}`;
