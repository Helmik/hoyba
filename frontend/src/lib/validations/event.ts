import { z } from "zod";

export const HostEventSchema = z
  .object({
    business_id: z.string().uuid("Please select a valid business"),
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(150, "Title cannot exceed 150 characters"),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(2000, "Description cannot exceed 2000 characters"),
    category: z.string().min(1, "Please select a category"),
    cover_image_url: z
      .string()
      .url("Please upload or provide a valid cover image"),
    start_time: z
      .string()
      .min(1, "Start date and time is required")
      .refine((val) => !isNaN(Date.parse(val)), "Invalid start date and time"),
    end_time: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        "Invalid end date and time"
      ),
    price_range: z
      .string()
      .trim()
      .max(50, "Price range cannot exceed 50 characters")
      .optional()
      .or(z.literal("")),
    location_name: z
      .string()
      .trim()
      .min(2, "Location name is required")
      .max(100, "Location name cannot exceed 100 characters"),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
    custom_whatsapp_msg: z
      .string()
      .trim()
      .max(300, "Custom WhatsApp message cannot exceed 300 characters")
      .optional()
      .or(z.literal("")),
    is_active: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (!data.end_time) return true;
      return new Date(data.end_time) >= new Date(data.start_time);
    },
    {
      message: "End time must be after or equal to start time",
      path: ["end_time"],
    }
  );

export type HostEventInput = z.infer<typeof HostEventSchema>;
