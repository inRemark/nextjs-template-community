import React, { useCallback, useEffect, useRef } from "react";
import { Textarea } from "@shared/ui/textarea";
import { cn } from "@shared/utils";

export interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxRows?: number;
  minRows?: number;
}

export const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(({ className, maxRows = 8, minRows = 1, onChange, ...props }, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lineHeightRef = useRef<number>(0);

  // Get the textarea element from ref
  const getTextarea = useCallback(() => {
    if (ref) {
      if (typeof ref === "function") {
        return textareaRef.current;
      }
      return (ref as React.MutableRefObject<HTMLTextAreaElement>).current;
    }
    return textareaRef.current;
  }, [ref]);

  // Calculate line height on mount
  useEffect(() => {
    const textarea = getTextarea();
    if (!textarea) return;

    const computedStyle = globalThis.getComputedStyle(textarea);
    const lineHeight = Number.parseInt(computedStyle.lineHeight);
    lineHeightRef.current = Number.isNaN(lineHeight) ? 20 : lineHeight;
  }, [getTextarea]);

  // Adjust height function
  const adjustHeight = useCallback(() => {
    const textarea = getTextarea();
    if (!textarea) return;

    // Reset height to get correct scrollHeight
    textarea.style.height = "auto";

    // Calculate min and max height
    const paddingTop = Number.parseInt(globalThis.getComputedStyle(textarea).paddingTop);
    const paddingBottom = Number.parseInt(globalThis.getComputedStyle(textarea).paddingBottom);
    const minHeight = lineHeightRef.current * minRows + paddingTop + paddingBottom;
    const maxHeight = lineHeightRef.current * maxRows + paddingTop + paddingBottom;

    // Set new height
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;

    // Show scrollbar if content exceeds max height
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [getTextarea, minRows, maxRows]);

  // Handle content change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);
    adjustHeight();
  };

  // Adjust height on mount and when value/defaultValue changes
  useEffect(() => {
    adjustHeight();
  }, [props.value, props.defaultValue, adjustHeight]);

  return (
    <Textarea
      {...props}
      ref={(node) => {
        textareaRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref.current = node);
        }
      }}
      onChange={handleChange}
      className={cn(
        "overflow-y-hidden resize-none transition-height duration-100",
        className
      )}
    />
  );
});

AutoResizeTextarea.displayName = "AutoResizeTextarea"; 