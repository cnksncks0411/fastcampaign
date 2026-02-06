import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full bg-slate-50 dark:bg-slate-950">
            <Spinner size="lg" />
        </div>
    )
}
