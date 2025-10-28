import * as React from "react"
import { cn } from "@/lib/utils"

export function Field({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("space-y-1", className)} {...props} />
}

export function FieldLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
    return <label className={cn("text-sm font-medium", className)} {...props} />
}

export function FieldGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("space-y-4", className)} {...props} />
}

export function FieldSeparator({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("relative my-4 text-center text-sm text-muted-foreground", className)}>
            <span className="bg-background px-2 relative z-10">{children}</span>
            <div className="absolute top-1/2 left-0 right-0 h-px bg-border -z-10"></div>
        </div>
    )
}

export function FieldDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}
