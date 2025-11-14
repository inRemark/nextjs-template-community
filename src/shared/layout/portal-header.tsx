"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useMessages } from "next-intl";
import { Button } from "@shared/ui/button";
import { cn } from "@shared/utils";
import {
  Menu,
  X,
  Sparkles,
  Search,
} from "lucide-react";
import { ThemeToggle } from "@shared/theme/theme-toggle";
import { LanguageSwitcher } from "@shared/components/language-switcher";
import { PortalHeaderAuth } from "./portal-header-auth";

interface NavItem {
  labelKey: string;
  href: string;
  target?: string;
}

const navItemsConfig: NavItem[] = [
  { labelKey: "themeClone", href: "/theme-clone" },
  { labelKey: "screenshot", href: "/screenshot" },
  { labelKey: "pricing", href: "/pricing" },
  { labelKey: "blog", href: "/blog" },
  { labelKey: "features", href: "/features" },
  { labelKey: "articles", href: "/articles" },
  { labelKey: "help", href: "/help" },
  { labelKey: "about", href: "/about" },
];

export const PortalHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const { toggleSearch } = useGlobalSearch();

  const messages = useMessages();
  const sharedLayoutMessages = useMemo(
    () => messages["shared-layout"] || {},
    [messages]
  );
  
  const navTranslations: Record<string, string> = useMemo(
    () => (sharedLayoutMessages["nav"] || {}) as Record<string, string>,
    [sharedLayoutMessages]
  );
  
  const headerTranslations: Record<string, string> = (sharedLayoutMessages[
    "header"
  ] || {}) as Record<string, string>;

  const navItems = useMemo(() => {
    // Format navigation labels based on locale
    const formatNavLabel = (label: string): string => {
      return locale === "en" ? label.toUpperCase() : label;
    };

    return navItemsConfig.map((item) => ({
      ...item,
      label: formatNavLabel(navTranslations[item.labelKey] || item.labelKey),
    }));
  }, [navTranslations, locale]);

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">VSeek</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={item.target}
                className={cn(
                  "nav-link text-sm font-medium",
                  pathname === item.href && "active"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Global Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={toggleSearch}
              title={headerTranslations["searchPlaceholder"] || "搜索 (Ctrl+K)"}
            >
              <Search className="w-4 h-4" />
            </Button>

            <ThemeToggle />

            <LanguageSwitcher />

            <PortalHeaderAuth headerTranslations={headerTranslations} />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="py-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.target}
                  className={cn(
                    "nav-link block text-sm font-medium",
                    pathname === item.href && "active"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-4 pt-4 border-t space-y-2">
                {/* Mobile search button */}
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={toggleSearch}
                >
                  <Search className="w-4 h-4 mr-2" />
                  {headerTranslations["search"] || "Search"}
                </Button>

                <div className="flex justify-center py-2">
                  <LanguageSwitcher />
                </div>

                <div className="flex justify-center py-2">
                  <ThemeToggle />
                </div>

                <PortalHeaderAuth 
                  headerTranslations={headerTranslations}
                  navTranslations={navTranslations}
                  isMobile={true}
                />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
