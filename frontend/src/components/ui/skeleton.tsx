import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 bg-[length:400%_100%] motion-safe:animate-shimmer", className)}
      {...props}
    />
  )
}

export { Skeleton }
