"use client";

import { useState, useEffect } from 'react';

export interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // if globalThis.window not exist, return
    if (globalThis.window === undefined) {
      return;
    }

    // set initial size
    setSize({
      width: globalThis.window.innerWidth,
      height: globalThis.window.innerHeight,
    });

    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // use ResizeObserver to observe body size changes
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(document.body);

    // let's also listen to window resize events, as some scenarios like mobile keyboard pop-up may not be captured by ResizeObserver
    globalThis.window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      globalThis.window.removeEventListener('resize', handleResize);
    };
  }, []);

  return size;
} 