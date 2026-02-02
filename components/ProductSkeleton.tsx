import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export function ProductSkeleton() {
    return (
        <Card className="overflow-hidden">
            <div className="aspect-square bg-muted animate-pulse" />
            <CardHeader className="p-4 pb-0 space-y-2">
                <div className="h-6 w-2/3 bg-muted animate-pulse rounded" />
                <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="h-4 w-full bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
            </CardFooter>
        </Card>
    )
}
