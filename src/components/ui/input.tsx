import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, ...props }, ref) => {
        return (
            <div className="relative">
                <input
                    type={type}
                    className={cn(
                        "flex h-12 w-full rounded-xl border-2 bg-white/50 backdrop-blur-sm px-4 py-3 text-base transition-all duration-200",
                        "border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10",
                        "placeholder:text-slate-400",
                        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-100",
                        "dark:border-slate-700 dark:bg-slate-900/50 dark:focus:border-violet-400 dark:focus:ring-violet-400/10",
                        error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </p>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
