import { z } from 'zod';

export const merchantSchema = z.object({
  businessName: z.string().min(1, 'Business name required'),
  ownerName: z.string().min(1, 'Owner name required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  email: z.string().email('Invalid email'),
  category: z.enum(['food', 'grocery', 'fresh_meat', 'kids_clothing']),
  subCategory: z.array(z.enum(['juice', 'biryani', 'snacks', 'breakfast', 'desserts', 'chinese', 'south_indian'])).optional(),
  fssai: z.object({
    number: z.string().length(14, 'FSSAI must be 14 digits'),
    expiryDate: z.string(),
  }).optional(),
  gst: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format').optional().or(z.literal('')),
  address: z.string().min(1, 'Address required'),
  city: z.string().min(1, 'City required'),
  pincode: z.string().length(6, 'Pincode must be 6 digits'),
  menuFiles: z.array(z.instanceof(File)).optional(),
});

export type MerchantFormData = z.infer<typeof merchantSchema>;
