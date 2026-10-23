"use client";

/**
 * Modals for every app. `Modal` is HeroUI's compound component, re-exported
 * unchanged (see `select.tsx` for why `@repo/ui` is the override seam);
 * `SimpleModal` is the everyday controlled version built on it.
 *
 * Both get, from React Aria: the page behind is frozen (no scroll), focus is
 * trapped inside and restored on close, Escape and a backdrop click close it,
 * and it's announced as a dialog labelled by its title. Colours come from
 * HeroUI's `--overlay` / `--backdrop` variables, themed per app.
 */

import type { ReactNode } from "react";

import { Modal } from "@heroui/react/modal";

export { Modal, type ModalProps } from "@heroui/react/modal";

export type SimpleModalProps = {
  /** Mount it with `true`, or keep it mounted and toggle. */
  isOpen: boolean;
  /** Escape, backdrop click — whatever asks it to close. */
  onClose: () => void;
  title: ReactNode;
  /** Short text under the title. */
  description?: ReactNode;
  /** Actions row at the bottom (buttons), outside the scrolling body. */
  footer?: ReactNode;
  /** `false` while something is in flight: Escape / backdrop do nothing. */
  isDismissable?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "full";
  children?: ReactNode;
};

export function SimpleModal({
  isOpen,
  onClose,
  title,
  description,
  footer,
  isDismissable = true,
  size = "md",
  children,
}: SimpleModalProps) {
  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open: boolean) => !open && onClose()}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={!isDismissable}
    >
      <Modal.Container size={size}>
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>{title}</Modal.Heading>
            {/* HeroUI's `--muted` is a text colour in every app; Tailwind's
                `text-muted` isn't (app-1 maps it to a background tint). */}
            {description && (
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {description}
              </p>
            )}
          </Modal.Header>
          <Modal.Body>{children}</Modal.Body>
          {footer && <Modal.Footer>{footer}</Modal.Footer>}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
