import React from 'react'


export function Badge({ children, variant = 'default', className = '' }: { children: React.ReactNode, variant?: 'default'|'secondary'|'success'|'warning', className?: string }) {
const map: Record<string,string> = {
default: 'bg-white text-black',
secondary: 'bg-white/10 text-white border border-white/15',
success: 'bg-green-500 text-white',
warning: 'bg-yellow-400 text-black'
}
return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${map[variant]} ${className}`}>{children}</span>
}