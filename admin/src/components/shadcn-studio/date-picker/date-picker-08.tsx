import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import * as React from "react"
import { cn } from "@/lib/utils"

interface DatePickerDemoProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  wrapperClassName?: string;
}

const DatePickerDemo = React.forwardRef<HTMLInputElement, DatePickerDemoProps>(
  ({ label = "Time input", className, wrapperClassName, id, ...props }, ref) => {
    const inputId = id || props.name || "time-picker";
    return (
      <div className={cn("flex w-full flex-col gap-2", wrapperClassName)}>
        {label && (
          <Label htmlFor={inputId} className="mb-2 block text-sm font-medium text-dark dark:text-white px-0">
            {label}
          </Label>
        )}
        <Input
          type="time"
          id={inputId}
          step="1"
          ref={ref}
          className={cn(
            "bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
DatePickerDemo.displayName = "DatePickerDemo"

export default DatePickerDemo
