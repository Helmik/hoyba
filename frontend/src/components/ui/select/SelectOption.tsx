import React from "react";

export interface SelectOptionProps
  extends React.OptionHTMLAttributes<HTMLOptionElement> {
  label?: string;
}

export const SelectOption: React.FC<SelectOptionProps> = ({
  children,
  label,
  className = "bg-slate-900 text-slate-100",
  ...props
}) => {
  return (
    <option className={className} {...props}>
      {children || label}
    </option>
  );
};
