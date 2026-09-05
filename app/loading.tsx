import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col space-y-4 p-8 max-w-7xl mx-auto w-full mt-8">
      <Skeleton className="h-[200px] w-full rounded-xl skeleton" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Skeleton className="h-[150px] rounded-xl skeleton" />
        <Skeleton className="h-[150px] rounded-xl skeleton" />
        <Skeleton className="h-[150px] rounded-xl skeleton" />
      </div>
    </div>
  )
}
