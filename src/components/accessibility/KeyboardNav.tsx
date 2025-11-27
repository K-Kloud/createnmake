import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Global keyboard navigation component for accessibility
 * Implements common keyboard shortcuts and navigation patterns
 */
export const KeyboardNav = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        return;
      }

      // Keyboard shortcuts
      if (e.altKey) {
        switch (e.key) {
          case "h":
          case "H":
            e.preventDefault();
            navigate("/");
            break;
          case "m":
          case "M":
            e.preventDefault();
            navigate("/marketplace");
            break;
          case "c":
          case "C":
            e.preventDefault();
            navigate("/create");
            break;
          case "g":
          case "G":
            e.preventDefault();
            navigate("/gallery");
            break;
          case "s":
          case "S":
            e.preventDefault();
            navigate("/settings");
            break;
          case "/":
            e.preventDefault();
            // Focus search input if exists
            const searchInput = document.querySelector<HTMLInputElement>('[type="search"]');
            if (searchInput) {
              searchInput.focus();
            }
            break;
          case "?":
            e.preventDefault();
            // Show keyboard shortcuts help
            // Could trigger a modal or tooltip showing available shortcuts
            console.log("Keyboard shortcuts:", {
              "Alt + H": "Home",
              "Alt + M": "Marketplace",
              "Alt + C": "Create",
              "Alt + G": "Gallery",
              "Alt + S": "Settings",
              "Alt + /": "Focus search",
              "Alt + ?": "Show help",
            });
            break;
        }
      }

      // Escape key to close modals/dialogs
      if (e.key === "Escape") {
        const activeModal = document.querySelector('[role="dialog"][aria-modal="true"]');
        if (activeModal) {
          const closeButton = activeModal.querySelector<HTMLButtonElement>(
            '[aria-label*="Close"], [aria-label*="close"]'
          );
          if (closeButton) {
            closeButton.click();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  // Add skip to content link for screen readers
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-acid-lime focus:text-void-black focus:rounded-none focus:border-2 focus:border-void-black"
      tabIndex={0}
    >
      Skip to main content
    </a>
  );
};
