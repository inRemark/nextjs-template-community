import type { ReactNode } from "react";
import {
  Search,
  Brain,
  GitCompare,
  Users,
  BookOpen,
  Award,
} from "lucide-react";

export type QuickTool = {
  key: string;
  name: string;
  description: string;
  href: string;
};

export type QuickToolsSection = {
  title: string;
  items: QuickTool[];
};

export type HeroSection = {
  title: string;
  titleHighlight: string;
  description: string;
  primaryButton: string;
  secondaryButton: string;
  tagline: string;
};

export type Feature = {
  title: string;
  description: string;
  benefits: string[];
};

export type FeaturesSection = {
  title: string;
  description: string;
  items: Feature[];
};

export type HowItWorksStep = {
  step: string;
  title: string;
  description: string;
};

export type HowItWorksSection = {
  title: string;
  description: string;
  steps: HowItWorksStep[];
};

export type Statistic = {
  number: string;
  label: string;
};

export type StatisticsSection = {
  title: string;
  items: Statistic[];
};

const featureIcons: ReactNode[] = [
  <Search className="w-12 h-12 text-primary" key="search" />,
  <Brain className="w-12 h-12 text-chart-4" key="brain" />,
  <GitCompare className="w-12 h-12 text-chart-1" key="compare" />,
  <Users className="w-12 h-12 text-chart-2" key="users" />,
  <BookOpen className="w-12 h-12 text-chart-3" key="book" />,
  <Award className="w-12 h-12 text-chart-5" key="award" />,
];

const stepIcons: ReactNode[] = [
  <Search className="w-8 h-8 text-primary" key="search" />,
  <Brain className="w-8 h-8 text-chart-4" key="brain" />,
  <GitCompare className="w-8 h-8 text-chart-1" key="compare" />,
];

export function getFeatureIcon(index: number): ReactNode {
  return featureIcons[index] ?? featureIcons[0];
}

export function getStepIcon(index: number): ReactNode {
  return stepIcons[index] ?? stepIcons[0];
}

