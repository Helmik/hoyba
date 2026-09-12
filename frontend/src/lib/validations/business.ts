import { z } from "zod";
import { BUSINESS_CATEGORIES, BUSINESS_ZONES } from "@/types/host";

const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;

export const QuickBusinessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(150, "Name cannot exceed 150 characters"),
  category: z.enum(BUSINESS_CATEGORIES),
  zone: z.enum(BUSINESS_ZONES),
  whatsapp_number: z
    .string()
    .trim()
    .min(7, "WhatsApp number is required")
    .max(20, "WhatsApp number is too long")
    .regex(phoneRegex, "Please enter a valid phone number"),
  cover_image_url: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

export const FullBusinessSchema = QuickBusinessSchema.extend({
  instagram_handle: z
    .string()
    .trim()
    .max(50, "Instagram handle cannot exceed 50 characters")
    .transform((val) => val.replace(/^@/, ""))
    .optional()
    .or(z.literal("")),
  bio: z.record(z.string(), z.string()).optional(),
  bio_es: z.string().trim().max(500, "Bio cannot exceed 500 characters").optional().or(z.literal("")),
  address_details: z
    .string()
    .trim()
    .max(300, "Address details cannot exceed 300 characters")
    .optional()
    .or(z.literal("")),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .nullable()
    .optional(),
  opening_hours: z.record(z.string(), z.string()).optional(),
});

export type QuickBusinessInput = z.infer<typeof QuickBusinessSchema>;
export type FullBusinessInput = z.infer<typeof FullBusinessSchema>;
