
import { schemaWrapper } from '#lib/validation/validator-middleware.js';
import { z } from 'zod';

// Zod schema for ProductType validation
export const ProductSchema = z.object({
  name: z
    .string()
    .min(1, 'اسم المنتج مطلوب')
    .max(200, 'اسم المنتج يجب أن يكون أقل من 200 حرف')
    .refine((val) => val.trim().length > 0, 'اسم المنتج لا يمكن أن يكون فارغاً'),

  category: z
    .string()
    .min(1, 'الصنف مطلوب'),

  price: z
    .coerce
    .number<number>()
    .min(1, 'السعر يجب أن يكون 1 ريال سعودي على الأقل')
    .max(99999999.99, 'السعر كبير جداً'),

  stock: z
    .coerce
    .number<number>()
    .int('الكمية يجب أن تكون رقماً صحيحاً')
    .min(0, 'الكمية يجب أن تكون أكبر من أو تساوي صفر')
    .max(999999, 'الكمية كبيرة جداً'),

  sales: z
    .coerce
    .number<number>()
    .int('المبيعات يجب أن تكون رقماً صحيحاً')
    .min(0, 'المبيعات يجب أن تكون أكبر من أو تساوي صفر')
    .max(999999, 'المبيعات كبيرة جداً')
    .default(0),

  description: z
    .string()
    .min(30, 'وصف المنتج يجب أن يكون 30 حرف على الأقل.')
    .max(500, 'الوصف يجب أن يكون أقل من 500 حرف')
    .refine((val) => val.trim().length > 0, 'الوصف لا يمكن أن يكون فارغاً')
});

export type ProductFormType = z.infer<typeof ProductSchema>;

export const productSchema = schemaWrapper("body", ProductSchema);


