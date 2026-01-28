import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-sm shadow-violet-500/25",
        secondary: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        success: "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-sm shadow-emerald-500/25",
        warning: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/25",
        destructive: "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm shadow-red-500/25",
        outline: "border-2 border-slate-200 bg-transparent text-slate-700 dark:border-slate-700 dark:text-slate-300",
    }

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                variants[variant],
                className
            )}
            {...props}
        />
    )
}

export { Badge }
