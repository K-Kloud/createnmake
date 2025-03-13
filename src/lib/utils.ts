
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
