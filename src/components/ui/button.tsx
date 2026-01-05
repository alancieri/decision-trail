import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
VIOLET BUTTON STYLES 
inline-flex items-center gap-2 rounded-[6px] bg-gradient-to-b from-[oklch(0.63_0.24_286)] to-[oklch(0.58_0.22_286)] hover:from-[oklch(0.65_0.25_286)] hover:to-[oklch(0.60_0.23_286)] active:from-[oklch(0.61_0.23_286)] active:to-[oklch(0.56_0.21_286)] shadow-[0_1px_2px_rgba(0,0,0,0.12)] text-white [&_svg]:stroke-[1.75] [&_svg]:opacity-95

BLUE BUTTON STYLES   
inline-flex items-center gap-2 rounded-[6px] bg-gradient-to-b from-[oklch(0.63_0.24_255)] to-[oklch(0.58_0.22_255)] hover:from-[oklch(0.65_0.25_255)] hover:to-[oklch(0.60_0.23_255)] active:from-[oklch(0.61_0.23_255)] active:to-[oklch(0.56_0.21_255)] shadow-[0_1px_2px_rgba(0,0,0,0.12)] text-white [&_svg]:stroke-[1.75] [&_svg]:opacity-95

GREEN BUTTON STYLES 
inline-flex items-center gap-2 rounded-[6px] bg-gradient-to-b from-[oklch(0.63_0.20_145)] to-[oklch(0.58_0.18_145)] hover:from-[oklch(0.65_0.21_145)] hover:to-[oklch(0.60_0.19_145)] active:from-[oklch(0.61_0.19_145)] active:to-[oklch(0.56_0.17_145)] shadow-[0_1px_2px_rgba(0,0,0,0.12)] text-white [&_svg]:stroke-[1.75] [&_svg]:opacity-95

ORANGE BUTTON STYLES  
inline-flex items-center gap-2 rounded-[6px] bg-gradient-to-b from-[oklch(0.63_0.18_55)] to-[oklch(0.58_0.16_55)] hover:from-[oklch(0.65_0.19_55)] hover:to-[oklch(0.60_0.17_55)] active:from-[oklch(0.61_0.17_55)] active:to-[oklch(0.56_0.15_55)] shadow-[0_1px_2px_rgba(0,0,0,0.12)] text-white [&_svg]:stroke-[1.75] [&_svg]:opacity-95

INDIGO BUTTON STYLES  
inline-flex items-center gap-2 rounded-[6px] bg-gradient-to-b from-[oklch(0.63_0.24_270)] to-[oklch(0.58_0.22_270)] hover:from-[oklch(0.65_0.25_270)] hover:to-[oklch(0.60_0.23_270)] active:from-[oklch(0.61_0.23_270)] active:to-[oklch(0.56_0.21_270)] shadow-[0_1px_2px_rgba(0,0,0,0.12)] text-white [&_svg]:stroke-[1.75] [&_svg]:opacity-95

BLUE-VIOLET BUTTON STYLES
inline-flex items-center gap-2 rounded-[6px] bg-gradient-to-b from-[oklch(0.63_0.24_258)] to-[oklch(0.58_0.22_258)] hover:from-[oklch(0.65_0.25_258)] hover:to-[oklch(0.60_0.23_258)] active:from-[oklch(0.61_0.23_258)] active:to-[oklch(0.56_0.21_258)] shadow-[0_1px_2px_rgba(0,0,0,0.12)] text-white [&_svg]:stroke-[1.75] [&_svg]:opacity-95


ROYAL BLUE BUTTON STYLES  
inline-flex items-center gap-2 rounded-[6px] bg-gradient-to-b from-[oklch(0.63_0.23_245)] to-[oklch(0.58_0.21_245)] hover:from-[oklch(0.65_0.24_245)] hover:to-[oklch(0.60_0.22_245)] active:from-[oklch(0.61_0.22_245)] active:to-[oklch(0.56_0.20_245)] shadow-[0_1px_2px_rgba(0,0,0,0.12)] text-white [&_svg]:stroke-[1.75] [&_svg]:opacity-95

MAGENTA BUTTON STYLES
inline-flex items-center gap-2 rounded-[6px] bg-gradient-to-b from-[oklch(0.63_0.22_310)] to-[oklch(0.58_0.20_310)] hover:from-[oklch(0.65_0.23_310)] hover:to-[oklch(0.60_0.21_310)] active:from-[oklch(0.61_0.21_310)] active:to-[oklch(0.56_0.19_310)] shadow-[0_1px_2px_rgba(0,0,0,0.12)] text-white [&_svg]:stroke-[1.75] [&_svg]:opacity-95

TEAL BUTTON STYLES
inline-flex items-center gap-2 rounded-[6px] bg-gradient-to-b from-[oklch(0.63_0.20_190)] to-[oklch(0.58_0.18_190)] hover:from-[oklch(0.65_0.21_190)] hover:to-[oklch(0.60_0.19_190)] active:from-[oklch(0.61_0.19_190)] active:to-[oklch(0.56_0.17_190)] shadow-[0_1px_2px_rgba(0,0,0,0.12)] text-white [&_svg]:stroke-[1.75] [&_svg]:opacity-95

RED BUTTON STYLES
inline-flex items-center gap-2 rounded-[6px] bg-gradient-to-b from-[oklch(0.60_0.20_25)] to-[oklch(0.55_0.18_25)] hover:from-[oklch(0.62_0.21_25)] hover:to-[oklch(0.57_0.19_25)] active:from-[oklch(0.58_0.19_25)] active:to-[oklch(0.53_0.17_25)] shadow-[0_1px_2px_rgba(0,0,0,0.12)] text-white [&_svg]:stroke-[1.75] [&_svg]:opacity-95

YELLOW BUTTON STYLES
inline-flex items-center gap-2 rounded-[6px] bg-gradient-to-b from-[oklch(0.80_0.16_95)] to-[oklch(0.74_0.14_95)] hover:from-[oklch(0.82_0.17_95)] hover:to-[oklch(0.76_0.15_95)] active:from-[oklch(0.78_0.15_95)] active:to-[oklch(0.72_0.13_95)] shadow-[0_1px_2px_rgba(0,0,0,0.12)] text-[oklch(0.30_0.05_95)] [&_svg]:stroke-[1.75] [&_svg]:opacity-95

*/
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[13px] font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "inline-flex items-center gap-2 rounded-[6px] bg-gradient-to-b from-[oklch(0.63_0.24_286)] to-[oklch(0.58_0.22_286)] hover:from-[oklch(0.65_0.25_286)] hover:to-[oklch(0.60_0.23_286)] active:from-[oklch(0.61_0.23_286)] active:to-[oklch(0.56_0.21_286)] shadow-[0_1px_2px_rgba(0,0,0,0.12)] text-white [&_svg]:stroke-[1.75] [&_svg]:opacity-95",
        destructive:
          "inline-flex items-center gap-2 rounded-[6px] bg-gradient-to-b from-[oklch(0.60_0.20_25)] to-[oklch(0.55_0.18_25)] hover:from-[oklch(0.62_0.21_25)] hover:to-[oklch(0.57_0.19_25)] active:from-[oklch(0.58_0.19_25)] active:to-[oklch(0.53_0.17_25)] shadow-[0_1px_2px_rgba(0,0,0,0.12)] text-white [&_svg]:stroke-[1.75] [&_svg]:opacity-95 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[30px] px-3 has-[>svg]:px-2.5",
        sm: "h-7 gap-1.5 px-2.5 has-[>svg]:px-2",
        lg: "h-9 px-4 has-[>svg]:px-3",
        icon: "size-[30px]",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
