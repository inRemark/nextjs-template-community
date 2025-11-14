"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Help", href: "/help" },
  { label: "Blog", href: "/blog" }
];

export const SimpleFooter: React.FC = () => {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Brand */}
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold">VSeek</span>
          </div>

          {/* Quick Links */}
          <nav className="flex items-center gap-6 mb-4 md:mb-0">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-sm text-gray-500">
            © 2024 AICoder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};