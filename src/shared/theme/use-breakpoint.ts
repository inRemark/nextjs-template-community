import { useContext } from "react";
import { BreakpointContext } from "./breakpoint.types";

export function useBreakpoint() {
  const context = useContext(BreakpointContext);
  if (!context) {
    throw new Error(
      "useBreakpoint must be used within a BreakpointProvider"
    );
  }
  return context;
}
