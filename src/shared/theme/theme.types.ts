import { createContext } from "react";

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  rootClassName: string;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
