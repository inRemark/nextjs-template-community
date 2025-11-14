"use client";
import React, { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";
import { Button } from "@shared/ui/button";
import { ModalContext } from "./context";
import { ModalOptions, ModalState } from "./types";
import { cn } from "@shared/utils";
import { logger } from '@logger';
export function ModalProvider({ children }: { readonly children: React.ReactNode }) {
  const [state, setState] = useState<ModalState>({
    isOpen: false,
    options: {},
  });

  const close = useCallback(() => {
    setState(prev => {
      prev.options.afterClose?.();
      return { ...prev, isOpen: false };
    });
  }, []);

  const show = useCallback((options: ModalOptions) => {
    setState({
      isOpen: true,
      options,
    });
  }, []);

  const confirm = useCallback((options: Omit<ModalOptions, 'content'>) => {
    show({
      ...options,
      okText: options.okText ?? 'OK',
      cancelText: options.cancelText ?? 'Cancel',
    });
  }, [show]);

  const handleOk = async () => {
    try {
      await state.options.onOk?.();
      setState(prev => {
        prev.options.afterClose?.();
        return { ...prev, isOpen: false };
      });
    } catch (error) {
      logger.error('Modal onOk error:', error);
    }
  };

  const handleCancel = () => {
    state.options.onCancel?.();
    setState(prev => {
      prev.options.afterClose?.();
      return { ...prev, isOpen: false };
    });
  };

  const contextValue = React.useMemo(() => ({ show, confirm, close }), [show, confirm, close]);

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      <Dialog open={state.isOpen} onOpenChange={open => !open && handleCancel()}>
        <DialogContent className={cn(state.options.className)}>
          {state.options.title && (
            <DialogHeader>
              <DialogTitle>{state.options.title}</DialogTitle>
              {state.options.description && (
                <DialogDescription>{state.options.description}</DialogDescription>
              )}
            </DialogHeader>
          )}

          {state.options.content}

          {state.options.showFooter !== false && (
            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                {state.options.cancelText ?? 'Cancel'}
              </Button>
              <Button onClick={handleOk}>
                {state.options.okText ?? 'OK'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </ModalContext.Provider>
  );
} 