"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { cn } from '@shared/utils';

interface FormSectionProps {
  readonly title: string;
  readonly description?: string;
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}

interface FormFieldProps {
  readonly label: string;
  readonly description?: string;
  readonly error?: string;
  readonly required?: boolean;
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function FormField({ 
  label, 
  description, 
  error, 
  required = false, 
  children, 
  className 
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

interface FormActionsProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly align?: 'left' | 'center' | 'right';
}

export function FormActions({ children, className, align = 'right' }: FormActionsProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={cn(
      "flex gap-2 pt-4",
      alignClasses[align],
      className
    )}>
      {children}
    </div>
  );
}