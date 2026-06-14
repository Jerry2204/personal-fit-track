"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"

interface HelpSearchProps {
  value: string
  onChange: (value: string) => void
}

export function HelpSearch({ value, onChange }: HelpSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search help articles..."
        className="h-14 rounded-2xl border-border/60 bg-card pl-12 pr-12 text-base shadow-lg placeholder:text-muted-foreground/60"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
