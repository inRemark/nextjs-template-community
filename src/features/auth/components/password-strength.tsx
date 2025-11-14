"use client";

import React from "react";
import { Check, X, AlertCircle } from "lucide-react";
import { validationHelpers } from "@/lib/validators/base";

interface PasswordStrengthProps {
  readonly password: string;
  readonly className?: string;
}

interface PasswordRule {
  readonly id: string;
  readonly label: string;
  readonly test: (password: string) => boolean;
}

/**
 * passwordRules
 * use the unified regex from base.ts to ensure consistency between frontend and backend
 */
const passwordRules: readonly PasswordRule[] = [
  {
    id: 'length',
    label: 'Minimum 8 characters',
    test: (pwd) => pwd.length >= 8,
  },
  {
    id: 'lowercase',
    label: 'Contains lowercase letters',
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    id: 'uppercase',
    label: 'Contains uppercase letters',
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    id: 'number',
    label: 'Contains numbers',
    test: (pwd) => /\d/.test(pwd),
  },
  {
    id: 'special',
    label: 'Contains special characters',
    test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  },
];

type PasswordStrengthLevel = 'weak' | 'medium' | 'strong';

interface PasswordStrengthResult {
  readonly score: number;
  readonly level: PasswordStrengthLevel;
  readonly color: string;
  readonly label: string;
}

/**
 * password strength thresholds configuration
 */
const STRENGTH_THRESHOLDS = {
  WEAK: 3,    // less than 3 rules = low
  MEDIUM: 5,  // less than 5 rules = medium
} as const;

/**
 * Calculate password strength
 * 
 * Use the validatePasswordStrength helper function from base.ts
 * to ensure consistency with backend validation logic
 * 
 * @param password - The password to validate
 * @returns Password strength result
 */
const getPasswordStrength = (password: string): PasswordStrengthResult => {
  // Use the unified validation helper function
  const { score } = validationHelpers.validatePasswordStrength(password);
  const scorePercentage = (score / passwordRules.length) * 100;
  
  if (score < STRENGTH_THRESHOLDS.WEAK) {
    return {
      score: scorePercentage,
      level: 'weak',
      color: 'bg-chart-3',
      label: 'Low',
    };
  }
  
  if (score < STRENGTH_THRESHOLDS.MEDIUM) {
    return {
      score: scorePercentage,
      level: 'medium',
      color: 'bg-chart-2',
      label: 'Medium',
    };
  }
  
  return {
    score: 100,
    level: 'strong',
    color: 'bg-chart-1',
    label: 'Strong',
  };
};

/**
 * Get the text color corresponding to the strength level
 */
const getLevelTextColor = (level: PasswordStrengthLevel): string => {
  const colorMap: Record<PasswordStrengthLevel, string> = {
    weak: 'text-chart-3',
    medium: 'text-chart-2',
    strong: 'text-chart-1',
  };
  return colorMap[level];
};

/**
 * Password strength indicator component
 * 
 * Show password strength including:
 * - Strength rating (Low/Medium/Strong)
 * - Progress bar
 * - Requirements checklist
 * - Security tips
 * 
 * @example
 * ```tsx
 * <PasswordStrength password={formData.password} />
 * ```
 */
export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  className = "",
}) => {
  if (!password) {
    return null;
  }

  const strength = getPasswordStrength(password);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Password Strength</span>
          <span className={`font-medium ${getLevelTextColor(strength.level)}`}>
            {strength.label}
          </span>
        </div>
        
        <div className="relative">
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
              style={{ width: `${strength.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1">
        {passwordRules.map((rule) => {
          const passed = rule.test(password);
          const iconColor = passed ? 'text-chart-1' : 'text-muted-foreground';
          
          return (
            <div
              key={rule.id}
              className="flex items-center gap-2 text-sm"
            >
              {passed ? (
                <Check className="w-4 h-4 text-chart-1 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <span className={iconColor}>
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Security tips */}
      {strength.level === 'strong' && (
        <div className="flex items-center gap-2 p-2 bg-chart-1/5 rounded-md border border-chart-1/20">
          <Check className="w-4 h-4 text-chart-1 shrink-0" />
          <span className="text-sm text-chart-1">Password strength is good!</span>
        </div>
      )}

      {strength.level === 'weak' && password.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-chart-2/5 rounded-md border border-chart-2/20">
          <AlertCircle className="w-4 h-4 text-chart-2 shrink-0" />
          <span className="text-sm text-chart-2">It is recommended to use a stronger password to protect your account</span>
        </div>
      )}
    </div>
  );
};