import { cn } from "@shared/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly className?: string;
}

function Skeleton({
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  )
}

export { Skeleton }
