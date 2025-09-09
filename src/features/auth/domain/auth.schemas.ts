import { schemaWrapper } from "#lib/validation/validator-middleware.js";

import * as zod from "zod";

export const UserVerificationSchema = zod.object({
    token: zod.jwt("يُرجى إدخال رمز تحقق صالح.")
})

const EmailSchema = zod.string().trim().min(1, "يُرجى إدخال البريد الإلكتروني.").email("صيغة البريد الإلكتروني غير صحيحة.")
export const ForgotPasswordSchema = zod.object({
    email: EmailSchema
});

const PasswordSchema = zod
    .string("يُرجى إدخال كلمة المرور.")
    .trim()
    .min(8, "كلمة المرور يجب أن تتكون من 8 أحرف على الأقل.")
    .max(64, "كلمة المرور يجب ألا تتجاوز 64 حرفًا.")

export const NewUserSchema = zod.object({
    name: zod
        .string("يُرجى إدخال الاسم.")
        .trim()
        .min(5, "يُرجى إدخال الاسم.")
        .max(40, "الاسم يجب ألا يتجاوز 40 حرفًا."),

    email: EmailSchema,
    password: PasswordSchema,
    password_confirmation: zod
        .string()
        .trim()
        .min(1, "يُرجى إدخال تأكيد كلمة المرور.")
}, "البيانات المدخلة غير صحيحة.").refine(
    (data) => data.password === data.password_confirmation,
    { message: "كلمتا المرور غير متطابقتين.", path: ["password_confirmation"] }
)

export const LoginSchema = zod.object({
    email: EmailSchema,
    password: PasswordSchema
}, "البيانات المدخلة غير صحيحة.")


export type NewUserType = zod.infer<typeof NewUserSchema>;
export type LoginType = zod.infer<typeof LoginSchema>;
export type UserVerificationType = zod.infer<typeof UserVerificationSchema>;

export const newUserSchema = schemaWrapper("body", NewUserSchema);
export const loginSchema = schemaWrapper("body", LoginSchema);
export const forgotPasswordSchema = schemaWrapper("body", ForgotPasswordSchema);