
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
}

// Generate a consistent price based on the image ID
export function generateRandomPrice(id: number): string {
  // Use the image ID to create a deterministic price between £50 and £500
  const basePrice = (id * 17) % 451 + 50;
  
  // Round to nearest £5
  const roundedPrice = Math.round(basePrice / 5) * 5;
  
  return `£${roundedPrice}`;
}

// Parse price strings safely (removes currency symbols and converts to number)
export function parsePrice(priceString: string | null | undefined): number {
  if (!priceString) return 0;
  
  // Remove currency symbols, commas, and spaces, then parse
  const cleanedPrice = priceString.toString()
    .replace(/[£$€¥₹₽¢]/g, '') // Remove common currency symbols
    .replace(/[,\s]/g, '') // Remove commas and spaces
    .trim();
  
  const parsed = parseFloat(cleanedPrice);
  return isNaN(parsed) ? 0 : parsed;
}

// Format number as price with currency symbol
export function formatPrice(amount: number, currency: string = '£'): string {
  return `${currency}${amount.toFixed(2)}`;
}
