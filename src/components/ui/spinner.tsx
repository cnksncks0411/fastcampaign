import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg" | "xl"
}

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16"
    }

    return (
        <div className={cn("flex justify-center items-center w-full h-full", className)} {...props}>
            <Loader2 className={cn("animate-spin text-violet-600 dark:text-violet-400", sizeClasses[size])} />
        </div>
    )
}
