
/**
 * Accessibility utilities
 */

/**
 * Announces a message to screen readers
 * @param message The message to announce
 * @param assertiveness The politeness level (polite or assertive)
 */
export function announceToScreenReader(
  message: string,
  assertiveness: "polite" | "assertive" = "polite"
) {
  // Create the announce element if it doesn't exist
  let announcer = document.getElementById("a11y-announcer");
  
  if (!announcer) {
    announcer = document.createElement("div");
    announcer.id = "a11y-announcer";
    announcer.setAttribute("aria-live", assertiveness);
    announcer.setAttribute("aria-atomic", "true");
    announcer.setAttribute("role", "status");
    announcer.style.position = "absolute";
    announcer.style.width = "1px";
    announcer.style.height = "1px";
    announcer.style.margin = "-1px";
    announcer.style.padding = "0";
    announcer.style.overflow = "hidden";
    announcer.style.clip = "rect(0, 0, 0, 0)";
    announcer.style.whiteSpace = "nowrap";
    announcer.style.border = "0";
    document.body.appendChild(announcer);
  } else {
    // Update the assertiveness if needed
    announcer.setAttribute("aria-live", assertiveness);
  }
  
  // Set the message
  announcer.textContent = "";
  // Force a DOM reflow
  void announcer.offsetWidth;
  announcer.textContent = message;
}

/**
 * Creates a keyboard-accessible click handler
 * @param onClick The click handler function
 * @returns A function that handles both click and keyboard events
 */
export function createA11yClickHandler(
  onClick: (event: React.MouseEvent | React.KeyboardEvent) => void
) {
  return {
    onClick,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick(event);
      }
    },
    role: "button",
    tabIndex: 0,
  };
}

/**
 * Generates an ID that is unique for the current page
 * @param prefix Optional prefix for the ID
 * @returns A unique ID string
 */
export function generateUniqueId(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Helper to manage focus trapping within a modal or dialog
 * @param containerRef Ref to the container element
 * @param isActive Whether focus trapping is active
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean
) {
  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;
    
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    };
    
    // Focus the first element when the trap becomes active
    firstElement.focus();
    
    container.addEventListener("keydown", handleTabKey);
    
    return () => {
      container.removeEventListener("keydown", handleTabKey);
    };
  }, [containerRef, isActive]);
}
