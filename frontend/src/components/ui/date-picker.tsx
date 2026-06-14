"use client"

import * as React from "react"
import { format } from "date-fns"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"
import "./date-picker.css"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const date = value ? new Date(value + "T00:00:00") : undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal px-3",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-xl shadow-lg" align="start">
        <div className="rdp-custom">
          <DayPicker
            mode="single"
            selected={date}
            onSelect={(selected) => {
              if (selected) {
                onChange(format(selected, "yyyy-MM-dd"))
              }
            }}
            captionLayout="dropdown"
            today={new Date()}
            startMonth={new Date(2020, 0)}
            endMonth={new Date(2030, 11)}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
