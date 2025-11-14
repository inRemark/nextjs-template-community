"use client";

import { useWindowSize } from "@shared/hooks/useWindowSize";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { BREAKPOINTS, Breakpoint, BreakpointContextValue, BreakpointContext } from "./breakpoint.types";

interface BreakpointProviderProps {
  readonly children: ReactNode;
}

export function BreakpointProvider({ children }: BreakpointProviderProps) {
  const { width } = useWindowSize();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const value = useMemo((): BreakpointContextValue => {
    if (!isClient || width === 0) {
      return {
        breakpoint: "lg",
        width: 1024,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isGreaterThan: () => false,
        isLessThan: () => true,
      };
    }

    let breakpoint: Breakpoint;
    if (width >= BREAKPOINTS["2xl"]) {
      breakpoint = "2xl";
    } else if (width >= BREAKPOINTS.xl) {
      breakpoint = "xl";
    } else if (width >= BREAKPOINTS.lg) {
      breakpoint = "lg";
    } else if (width >= BREAKPOINTS.md) {
      breakpoint = "md";
    } else {
      breakpoint = "sm";
    }

    return {
      breakpoint,
      width,
      isMobile: width < BREAKPOINTS.md,
      isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
      isDesktop: width >= BREAKPOINTS.lg,
      isGreaterThan: (bp: Breakpoint) => width >= BREAKPOINTS[bp],
      isLessThan: (bp: Breakpoint) => width < BREAKPOINTS[bp],
    };
  }, [width, isClient]);

  return (
    <BreakpointContext.Provider value={value}>
      {children}
    </BreakpointContext.Provider>
  );
}