import { RefObject, useCallback, useEffect, useRef } from "react";

interface ScrollState {
  isPinned: boolean;
  lastScrollTop: number;
  lastScrollHeight: number;
}

interface UseAutoScrollOptions {
  pinThreshold?: number; 
  unpinThreshold?: number;
}

export function useAutoScroll(
  containerRef: RefObject<HTMLDivElement>,
  content: unknown,
  options: UseAutoScrollOptions = {}
) {
  const {
    pinThreshold = 30, // 30px
    unpinThreshold = 10, // 10px
  } = options;

  // use ref to store scroll state to avoid re-renders
  const stateRef = useRef<ScrollState>({
    isPinned: true,
    lastScrollTop: 0,
    lastScrollHeight: 0,
  });

  // check if near bottom
  const isNearBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return false;

    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight <= pinThreshold;
  }, [containerRef, pinThreshold]);

  // scroll to bottom
  const scrollToBottom = useCallback((instant?: boolean) => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: instant ? "instant" : "smooth",
    });
  }, [containerRef]);

  // process scroll events
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight } = container;
    const state = stateRef.current;

    // check scroll direction
    const scrollingUp = scrollTop < state.lastScrollTop;
    const scrollingDown = scrollTop > state.lastScrollTop;

    // update pinned state
    if (scrollingDown && isNearBottom()) {
      state.isPinned = true;
    } else if (
      scrollingUp &&
      Math.abs(scrollTop - state.lastScrollTop) > unpinThreshold
    ) {
      state.isPinned = false;
    }

    // update state
    state.lastScrollTop = scrollTop;
    state.lastScrollHeight = scrollHeight;
  }, [containerRef, isNearBottom, unpinThreshold]);

  // listen for scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [containerRef, handleScroll]);

  // listen for content changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const state = stateRef.current;
    const contentChanged = container.scrollHeight !== state.lastScrollHeight;

    // only auto-scroll in pinned mode
    if (state.isPinned && contentChanged) {
      scrollToBottom();
    }

    state.lastScrollHeight = container.scrollHeight;
  }, [containerRef, content, scrollToBottom]);

  return {
    isPinned: stateRef.current.isPinned,
    scrollToBottom,
  };
}
