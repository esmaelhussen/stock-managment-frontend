"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  preventOutsideClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  footer,
  showCloseButton = true,
  preventOutsideClick = true,
}) => {
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
    full: "max-w-[95vw] h-[90vh]",
  };

  const handleOpenChange = (open: boolean) => {
    // Always allow closing via the X button
    // The onOpenChange is triggered by the X button click
    if (!open) {
      // If preventOutsideClick is false, always close
      // If preventOutsideClick is true, this will only be triggered by X button
      // (outside clicks and escape are prevented by onPointerDownOutside and onEscapeKeyDown)
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`${sizes[size]} ${!showCloseButton ? "[&>button]:hidden" : ""} flex flex-col`}
        onPointerDownOutside={(e) => {
          if (preventOutsideClick) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (preventOutsideClick) {
            e.preventDefault();
          }
        }}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="space-y-4">{children}</div>
        </div>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
