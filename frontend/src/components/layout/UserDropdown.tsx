"use client";

import React from "react";
import UserNavButton from "@/features/auth/components/UserNavButton";
import type { SupportedLocale } from "@/types/i18n.types";

export interface UserDropdownProps {
  locale: SupportedLocale;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ locale }) => {
  return <UserNavButton locale={locale} />;
};

export default UserDropdown;
