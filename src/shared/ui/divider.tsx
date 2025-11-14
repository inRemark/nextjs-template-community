"use client";

import React from "react";

interface DividerProps {
  text?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  text = "OR",
  className = "",
}) => {
  return (
    <div className={`flex items-center my-6 ${className}`}>
      <div className="flex-1 border-t"></div>
      <div className="px-3 text-muted-foreground text-sm bg-background">{text}</div>
      <div className="flex-1 border-t"></div>
    </div>
  );
};