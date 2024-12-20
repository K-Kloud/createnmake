import { manufacturers } from "@/data/manufacturers";
import { manufacturerCategories } from "@/data/manufacturerCategories";

export const getCategoryCount = (categoryName: string) => {
  return manufacturers.filter(m => m.type === categoryName).length;
};

export const getFilteredManufacturers = (category: string | null) => {
  if (!category) return manufacturers;
  return manufacturers.filter(m => m.type === category);
};