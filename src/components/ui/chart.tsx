"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-full", className)}
    {...props}
  >
    {children}
  </div>
))
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-background px-3 py-1.5 text-sm shadow-md",
      className
    )}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("grid gap-1.5", className)}
    {...props}
  />
))
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartConfig = React.createContext<Record<string, any>>({})

function useChart() {
  const context = React.useContext(ChartConfig)
  return context
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  useChart,
}