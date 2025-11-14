"use client";

import React from "react";
import { Input } from "@shared/ui/input";
import { Label } from "@shared/ui/label";
import { AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";

interface FormFieldProps {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  showPasswordToggle?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  showPasswordToggle = false,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  
  const inputType = type === 'password' && showPassword ? 'text' : type;
  const hasError = error && touched;
  const hasValue = value.length > 0;
  const isValid = hasValue && !error && touched;

  const handleBlur = () => {
    setTouched(true);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Extracted input className logic
  let inputClassName = "pr-10 transition-colors duration-200 ";
  if (hasError) {
    inputClassName += "border-chart-3 focus:border-chart-3 focus:ring-chart-3";
  } else if (isValid) {
    inputClassName += "border-chart-1 focus:border-chart-1 focus:ring-chart-1";
  } else {
    inputClassName += "border-input focus:border-primary focus:ring-primary";
  }

  return (
    <div className="space-y-2">
      <Label 
        htmlFor={name} 
        className="text-sm font-medium text-foreground flex items-center gap-1"
      >
        {label}
        {required && <span className="text-chart-3">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={inputClassName}
          required={required}
        />
        
        {/* right side icons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {type === 'password' && showPasswordToggle && hasValue && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-muted-foreground hover:text-foreground focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
          
          {/* validation status icons */}
          {touched && hasValue && (
            <>
              {error ? (
                <AlertCircle className="w-4 h-4 text-chart-3 ml-2" />
              ) : (
                <CheckCircle className="w-4 h-4 text-chart-1 ml-2" />
              )}
            </>
          )}
        </div>
      </div>
      
      {/* error tips */}
      {hasError && (
        <div className="flex items-center gap-1 text-sm text-chart-3">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};