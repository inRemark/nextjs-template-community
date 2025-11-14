import { createContext } from "react";

// Breakpoint constants
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Types
export type Breakpoint = keyof typeof BREAKPOINTS;

export interface BreakpointContextValue {
  breakpoint: Breakpoint;
  width: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isGreaterThan: (bp: Breakpoint) => boolean;
  isLessThan: (bp: Breakpoint) => boolean;
}

// Context
export const BreakpointContext = createContext<BreakpointContextValue | null>(null);
