export const USER_ROLES = ["user", "host", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];
