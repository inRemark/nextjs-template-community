import { useCallback, useEffect, useState } from 'react';

interface ViewportState {
  height: number;
  isKeyboardVisible: boolean;
  keyboardHeight: number;
}

export function useViewportHeight(): ViewportState {
  const [state, setState] = useState<ViewportState>(() => ({
    height: typeof globalThis.window === 'object' ? globalThis.window.innerHeight : 0,
    isKeyboardVisible: false,
    keyboardHeight: 0
  }));

  const isMobile = typeof navigator === 'undefined'
    ? false
    : /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isIOS = typeof navigator === 'undefined'
    ? false
    : /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = typeof navigator === 'undefined'
    ? false
    : /Android/i.test(navigator.userAgent);
  
  const getVisibleHeight = useCallback((): number => {
    if (globalThis.window === undefined) {
      return 0;
    }
    
    if (globalThis.window.visualViewport) {
      return globalThis.window.visualViewport.height;
    }
    return globalThis.window.innerHeight;
  }, []);

  const updateViewportState = useCallback(() => {
    // if window not exist, return
    if (globalThis.window === undefined) {
      return;
    }
    
    if (!isMobile) {
      setState({
        height: globalThis.window.innerHeight,
        isKeyboardVisible: false,
        keyboardHeight: 0
      });
      return;
    }

    const currentHeight = getVisibleHeight();
    const maxHeight = Math.max(globalThis.window.innerHeight, currentHeight);
    const heightDiff = maxHeight - currentHeight;

    // Adjust keyboard detection threshold
    const keyboardThreshold = isAndroid ? maxHeight * 0.15 : maxHeight * 0.25;
    const isKeyboardVisible = heightDiff > keyboardThreshold;

    // Prevent Android Chrome soft keyboard from causing drawer issues
    if (isAndroid && !isKeyboardVisible) {
      document.documentElement.style.height = '100%';
      document.body.style.height = '100%';
      document.body.style.minHeight = '100%';

      // Force reflow
      requestAnimationFrame(() => {
        document.documentElement.style.height = '';
        document.body.style.height = '';
        document.body.style.minHeight = '';
      });
    }

    setState({
      height: currentHeight,
      isKeyboardVisible,
      keyboardHeight: isKeyboardVisible ? heightDiff : 0
    });
  }, [getVisibleHeight, isAndroid, isMobile]);

  useEffect(() => {
    // if window not exist, return
    if (globalThis.window === undefined) {
      return;
    }
    
    const handleResize = () => {
      // use requestAnimationFrame to ensure smooth viewport updates
      requestAnimationFrame(() => {
        setState({
          height: globalThis.window.innerHeight,
          isKeyboardVisible: false,
          keyboardHeight: 0
        });
      });
    };

    globalThis.window.addEventListener("resize", handleResize);
    // 初始化时立即执行一次
    handleResize();

    return () => globalThis.window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // if window not exist, return
    if (globalThis.window === undefined) {
      return;
    }
    
    if (!isMobile) {
      globalThis.window.addEventListener('resize', updateViewportState);
      return () => globalThis.window.removeEventListener('resize', updateViewportState);
    }

    const cleanup: (() => void)[] = [];

    if (globalThis.window.visualViewport) {
      const handleViewportChange = () => {
        requestAnimationFrame(updateViewportState);
      };

      globalThis.window.visualViewport.addEventListener('resize', handleViewportChange);
      globalThis.window.visualViewport.addEventListener('scroll', handleViewportChange);

      cleanup.push(() => {
        globalThis.window.visualViewport?.removeEventListener('resize', handleViewportChange);
        globalThis.window.visualViewport?.removeEventListener('scroll', handleViewportChange);
      });
    }

    if (isIOS) {
      const handleFocusIn = () => {
        setTimeout(updateViewportState, 300);
      };

      const handleFocusOut = () => {
        setTimeout(updateViewportState, 100);
      };

      globalThis.window.addEventListener('focusin', handleFocusIn);
      globalThis.window.addEventListener('focusout', handleFocusOut);

      cleanup.push(() => {
        globalThis.window.removeEventListener('focusin', handleFocusIn);
        globalThis.window.removeEventListener('focusout', handleFocusOut);
      });
    }

    if (!isIOS && isMobile) {
      const handleResize = () => {
        requestAnimationFrame(updateViewportState);
      };

      globalThis.window.addEventListener('resize', handleResize);
      cleanup.push(() => globalThis.window.removeEventListener('resize', handleResize));
    }

    const handleOrientationChange = () => {
      setTimeout(updateViewportState, 150);
    };

    globalThis.window.addEventListener('orientationchange', handleOrientationChange);
    cleanup.push(() => globalThis.window.removeEventListener('orientationchange', handleOrientationChange));

    updateViewportState();

    return () => {
      for (const fn of cleanup) {
        fn();
      }
    };
  }, [isMobile, isIOS, updateViewportState]);

  return state;
} 