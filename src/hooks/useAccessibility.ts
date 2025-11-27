import { useEffect } from "react";

/**
 * Hook for managing accessibility features
 * Handles focus management, ARIA announcements, and keyboard interactions
 */
export const useAccessibility = () => {
  useEffect(() => {
    // Add focus visible class for keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        document.body.classList.add("keyboard-nav");
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove("keyboard-nav");
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  /**
   * Announce message to screen readers
   */
  const announce = (message: string, priority: "polite" | "assertive" = "polite") => {
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  /**
   * Trap focus within a container
   */
  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  };

  /**
   * Move focus to element
   */
  const moveFocus = (selector: string) => {
    const element = document.querySelector<HTMLElement>(selector);
    if (element) {
      element.focus();
      return true;
    }
    return false;
  };

  return {
    announce,
    trapFocus,
    moveFocus,
  };
};
