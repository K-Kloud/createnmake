
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
  // Use the image ID to create a deterministic price between £5 and £85
  const basePrice = (id * 7) % 81 + 5;
  
  // Round to nearest £1 for more realistic pricing
  const roundedPrice = Math.round(basePrice);
  
  return `£${roundedPrice}`;
}

// Parse price strings safely (removes currency symbols and converts to number)
export function parsePrice(priceString: string | null | undefined): number {
  console.log('parsePrice called with:', priceString, typeof priceString);
  
  if (!priceString) {
    console.log('parsePrice: empty/null price, returning 0');
    return 0;
  }
  
  // Remove currency symbols, commas, and spaces, then parse
  const cleanedPrice = priceString.toString()
    .replace(/[£$€¥₹₽¢]/g, '') // Remove common currency symbols
    .replace(/[,\s]/g, '') // Remove commas and spaces
    .trim();
  
  console.log('parsePrice: cleaned price:', cleanedPrice);
  
  const parsed = parseFloat(cleanedPrice);
  const result = isNaN(parsed) ? 0 : parsed;
  
  console.log('parsePrice: final result:', result);
  return result;
}

// Format number as price with currency symbol
export function formatPrice(amount: number, currency: string = '£'): string {
  // For digital art, use whole numbers for cleaner pricing
  return `${currency}${Math.round(amount)}`;
}
