"use client";

import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface ResponsiveModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  onSubmit?: (event: React.FormEvent) => void;
  /** Action buttons, in DOM order: destructive first, primary last. */
  footer: React.ReactNode;
  children: React.ReactNode;
}

/**
 * One modal shell for the whole app: a bottom sheet on mobile, a centered
 * dialog on desktop.
 *
 * Both footers lay actions out bottom-to-top / left-to-right from the same DOM
 * order, so callers write the buttons once — destructive first, primary last —
 * and get the right hierarchy on either surface.
 */
export default function ResponsiveModal({
  open,
  onClose,
  title,
  onSubmit,
  footer,
  children,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  const body = (
    <form onSubmit={onSubmit}>
      {isMobile ? (
        <>
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4">{children}</div>
          <DrawerFooter className="flex-col-reverse">{footer}</DrawerFooter>
        </>
      ) : (
        <>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">{children}</div>
          <DialogFooter className="gap-2">{footer}</DialogFooter>
        </>
      )}
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(next) => !next && onClose()}>
        <DrawerContent>{body}</DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-[400px]">{body}</DialogContent>
    </Dialog>
  );
}

/** Shared field wrapper so every modal's inputs line up the same way. */
export function ModalField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}
