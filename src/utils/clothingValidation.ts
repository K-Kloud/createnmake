
import { z } from 'zod';
import { clothingItems } from '@/data/clothingItems';

// Create a dynamic enum from the clothing items
const clothingItemValues = clothingItems.map(item => item.value) as [string, ...string[]];

export const clothingItemSchema = z.enum(clothingItemValues, {
  errorMap: () => ({ message: 'Please select a valid clothing item type' })
});

export const validateClothingItem = (value: string): boolean => {
  return clothingItems.some(item => item.value === value);
};

export const getClothingItemLabel = (value: string): string => {
  const item = clothingItems.find(item => item.value === value);
  return item?.label || value;
};
