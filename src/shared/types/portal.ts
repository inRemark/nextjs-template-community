export interface LandingPageData {
  banner: {
    title: string;
    subtitle: string;
    description: string;
    ctaButton: {
      text: string;
      url: string;
    };
    backgroundImage?: string;
    videoUrl?: string;
  };
  features: Feature[];
  businessIntro: BusinessSection[];
  faqs: FAQ[];
  testimonials: Testimonial[];
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  benefits: string[];
  demoUrl?: string;
}

export interface BusinessSection {
  id: string;
  title: string;
  content: string;
  image?: string;
  statistics?: Statistic[];
}

export interface Statistic {
  label: string;
  value: string;
  description?: string;
  trend?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'pricing' | 'technical' | 'security';
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  features: PricingFeature[];
  limits: PricingLimits;
  popular: boolean;
  trial: boolean;
}

export interface PricingFeature {
  name: string;
  description: string;
  included: boolean;
  limit?: number;
}

export interface PricingLimits {
  emailsPerMonth: number;
  templatesCount: number;
  apiCallsPerMonth: number;
  storageSize: string;
  supportLevel: 'basic' | 'priority' | 'dedicated';
}

export interface CompanyInfo {
  name: string;
  description: string;
  mission: string;
  vision: string;
  founded: string;
  headquarters: string;
  employeeCount: string;
  values: CompanyValue[];
}

export interface CompanyValue {
  title: string;
  description: string;
  icon: string;
}

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  businessHours: {
    timezone: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

export interface AboutPageData {
  company: CompanyInfo;
  team: TeamMember[];
  timeline: TimelineEvent[];
  contact: ContactInfo;
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  type: 'milestone' | 'product' | 'expansion' | 'achievement';
}

export interface DashboardMetrics {
  totalEmails: number;
  openRate: number;
  deliveryRate: number;
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: 'email_sent' | 'template_created' | 'campaign_completed';
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}