import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border",
        critical: "border-severity-critical/30 bg-severity-critical/20 text-severity-critical",
        high: "border-severity-high/30 bg-severity-high/20 text-severity-high",
        medium: "border-severity-medium/30 bg-severity-medium/20 text-severity-medium",
        low: "border-severity-low/30 bg-severity-low/20 text-severity-low",
        unverified: "border-severity-medium/30 bg-severity-medium/20 text-severity-medium",
        verified: "border-status-online/30 bg-status-online/20 text-status-online",
        inProgress: "border-primary/30 bg-primary/20 text-primary",
        resolved: "border-muted-foreground/30 bg-muted/50 text-muted-foreground",
        duplicate: "border-incident-police/30 bg-incident-police/20 text-incident-police",
        falseReport: "border-muted-foreground/30 bg-muted/30 text-muted-foreground line-through",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
