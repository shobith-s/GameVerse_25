'use client'
import * as React from 'react'


export function Tabs({ children, className = '', ...p }: React.HTMLAttributes<HTMLDivElement>) {
return <div {...p} className={className}>{children}</div>
}
export function TabsList({ children, className = '', ...p }: React.HTMLAttributes<HTMLDivElement>) {
return <div {...p} className={`rounded-xl bg-white/5 p-1 ${className}`}>{children}</div>
}
export function TabsTrigger({ children, value, className = '', ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
return (
<button {...p} data-value={value} className={`px-3 py-2 rounded-lg text-sm border border-white/10 bg-surface/30 hover:bg-white/10 ${className}`}>
{children}
</button>
)
}
export function TabsContent({ children, className = '', ...p }: React.HTMLAttributes<HTMLDivElement>) {
return <div {...p} className={className}>{children}</div>
}