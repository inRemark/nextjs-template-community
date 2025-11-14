import { useCallback } from "react";

interface UseCopyOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  onFinish?: () => void;
}

export function useCopy(options: UseCopyOptions = {}) {
  const { onSuccess, onError, onFinish } = options;

  const copy = useCallback(async (text: string) => {
    // in case of server-side rendering
    if (globalThis.window === undefined || navigator === undefined) {
      onError?.(new Error("Clipboard API not available in server environment"));
      return false;
    }
    
    try {
      if (navigator.clipboard && globalThis.window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // downgrade solution: use the traditional execCommand
        const textArea = document.createElement("textarea");
        textArea.value = text;

        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        let successful = false;
        try {
          // Try using the Clipboard API as a fallback if execCommand is deprecated
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(textArea.value);
            successful = true;
          } else {
            // If Clipboard API is not available, inform the user
            throw new Error("Clipboard API not available and execCommand is deprecated");
          }
        } catch (err) {
          console.error("Fallback copy failed:", err);
          throw new Error("Copy failed");
        } finally {
          textArea.remove();
        }
        if (!successful) {
          throw new Error("Copy failed");
        }
      }

      onSuccess?.();
      return true;
    } catch (error) {
      onError?.(error);
      return false;
    } finally {
      onFinish?.();
    }
  }, [onSuccess, onError, onFinish]);

  return {
    copy,
  };
}