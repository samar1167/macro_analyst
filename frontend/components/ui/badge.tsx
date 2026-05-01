import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
  {
    variants: {
      variant: {
        neutral: "border-border bg-muted/40 text-muted-foreground",
        positive: "border-emerald-400/25 bg-emerald-400/10 text-positive",
        negative: "border-rose-400/25 bg-rose-400/10 text-negative",
        warning: "border-amber-400/25 bg-amber-400/10 text-warning",
        accent: "border-cyan-400/25 bg-cyan-400/10 text-primary",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

