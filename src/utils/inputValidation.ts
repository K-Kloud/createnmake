
import { z } from 'zod';
import { sanitizeInput, validateEmail, isValidUsername } from './security';

// Comprehensive input validation schemas
export const userProfileSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .refine(isValidUsername, 'Username contains invalid characters'),
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .transform(val => val ? sanitizeInput(val) : val),
  avatar_url: z.string().url('Invalid avatar URL').optional(),
  business_name: z.string()
    .max(100, 'Business name must be less than 100 characters')
    .optional()
    .transform(val => val ? sanitizeInput(val) : val),
  business_type: z.string().optional(),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .optional(),
  address: z.string()
    .max(200, 'Address must be less than 200 characters')
    .optional()
    .transform(val => val ? sanitizeInput(val) : val),
});

export const imageGenerationSchema = z.object({
  prompt: z.string()
    .min(3, 'Prompt must be at least 3 characters')
    .max(1000, 'Prompt must be less than 1000 characters')
    .transform(sanitizeInput),
  item_type: z.enum(['tops', 'bottoms', 'dresses', 'outerwear', 'accessories', 'footwear']),
  aspect_ratio: z.enum(['square', 'portrait', 'landscape']),
  title: z.string()
    .max(100, 'Title must be less than 100 characters')
    .optional()
    .transform(val => val ? sanitizeInput(val) : val),
  tags: z.array(z.string().max(30)).max(10, 'Maximum 10 tags allowed').optional(),
  price: z.string()
    .regex(/^\d+(\.\d{2})?$/, 'Invalid price format')
    .optional(),
});

export const commentSchema = z.object({
  text: z.string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must be less than 500 characters')
    .transform(sanitizeInput),
  image_id: z.number().positive('Invalid image ID'),
});

export const orderSchema = z.object({
  product_details: z.string()
    .min(10, 'Product details must be at least 10 characters')
    .max(2000, 'Product details must be less than 2000 characters')
    .transform(sanitizeInput),
  amount: z.number().positive('Amount must be positive').optional(),
  delivery_address: z.object({
    name: z.string().min(2, 'Name is required').transform(sanitizeInput),
    email: z.string().email('Invalid email').refine(validateEmail, 'Invalid email format'),
    address: z.string().min(10, 'Address is required').transform(sanitizeInput),
    city: z.string().min(2, 'City is required').transform(sanitizeInput),
    state: z.string().min(2, 'State is required').transform(sanitizeInput),
    zipCode: z.string().min(3, 'ZIP code is required'),
    country: z.string().min(2, 'Country is required').transform(sanitizeInput),
  }).optional(),
});

export const manufacturerOnboardingSchema = z.object({
  business_name: z.string()
    .min(2, 'Business name is required')
    .max(100, 'Business name must be less than 100 characters')
    .transform(sanitizeInput),
  business_type: z.enum(['tailor', 'printer', 'cobbler', 'goldsmith', 'furniture_maker', 'leather_worker']),
  contact_email: z.string().email('Invalid email').refine(validateEmail, 'Invalid email format'),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .optional(),
  address: z.string()
    .min(10, 'Address is required')
    .max(200, 'Address must be less than 200 characters')
    .transform(sanitizeInput),
  specialties: z.array(z.string().max(50)).max(10, 'Maximum 10 specialties allowed').optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string()
    .max(1000, 'Comment must be less than 1000 characters')
    .optional()
    .transform(val => val ? sanitizeInput(val) : val),
  manufacturer_id: z.string().uuid('Invalid manufacturer ID'),
});

// Validation helper functions
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: string[] } => {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};

export const createValidatedMutation = <TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  mutationFn: (validatedInput: TInput) => Promise<TOutput>
) => {
  return async (input: unknown): Promise<TOutput> => {
    const validation = validateInput(schema, input);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.join(', ')}`);
    }
    return mutationFn(validation.data!);
  };
};
