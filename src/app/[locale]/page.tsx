import { createPageMetadataGenerator } from "@/lib/seo";
import { getTranslations } from 'next-intl/server';
import { Button } from "@shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/ui/card";
import { Badge } from "@shared/ui/badge";
import { PortalLayout } from "@shared/layout/portal-layout";
import { PageContent } from "@/shared/layout/portal-page-content";
import { CheckCircle, ArrowRight, Play, Code2, Camera } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  getFeatureIcon,
  getStepIcon,
  type HeroSection,
  type QuickToolsSection,
  type FeaturesSection,
  type HowItWorksSection,
  type StatisticsSection,
} from "@/features/home/utils";

// 生成多语言 SEO metadata
export const generateMetadata = createPageMetadataGenerator("home");

export default async function FeaturesPage() {
  const t = await getTranslations('home');
  const badge = t('badge');
  const quickTools = t.raw('quickTools') as QuickToolsSection;
  const hero = t.raw('hero') as HeroSection;
  const featuresSection = t.raw('features') as FeaturesSection;
  const howItWorksSection = t.raw('howItWorks') as HowItWorksSection;
  const statisticsSection = t.raw('statistics') as StatisticsSection;

  return (
    <PortalLayout showHero={true}>
      <div className="bg-gradient-to-b from-background to-muted/20 dark:from-background dark:to-muted/10">

        {/* Quick Tools Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-lg font-semibold text-foreground mb-6 text-center">{quickTools.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickTools.items.map((tool) => (
                <Link
                  key={tool.key}
                  href={tool.href}
                  className="group flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all duration-300"
                >
                  <div className="flex-shrink-0">
                    {tool.key === 'themeClone' ? (
                      <Code2 className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                    ) : (
                      <Camera className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{tool.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">{tool.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary flex-shrink-0 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">{badge}</Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              {hero.title}
              <span className="text-primary">{hero.titleHighlight}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-4 text-lg" asChild>
                <Link href="/">
                  <Play className="w-5 h-5 mr-2" />
                  {hero.primaryButton}
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg" asChild>
                <Link href="/explore">
                  {hero.secondaryButton}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {hero.tagline}
            </p>
          </div>
        </section>

      </div>
      
      <PageContent maxWidth="xl">
        {/* Core Features Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">{featuresSection.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {featuresSection.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresSection.items.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={getFeatureIcon(index)}
                title={feature.title}
                description={feature.description}
                benefits={feature.benefits}
              />
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-muted/30 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">{howItWorksSection.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {howItWorksSection.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksSection.steps.map((step, index) => (
              <StepCard
                key={step.step}
                step={step.step}
                icon={getStepIcon(index)}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </section>

        {/* Statistics Section */}
        <section className="bg-muted/30 py-20 rounded-lg">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-12 text-foreground">{statisticsSection.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {statisticsSection.items.map((stat) => (
                <StatisticItem key={`${stat.number}-${stat.label}`} number={stat.number} label={stat.label} />
              ))}
            </div>
          </div>
        </section>
      </PageContent>
    </PortalLayout>
  );
}

// 获取功能图标
// 组件定义
function FeatureCard({ icon, title, description, benefits }: {
  icon: ReactNode;
  title: string;
  description: string;
  benefits: string[];
}) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">{icon}</div>
        <CardTitle className="text-xl text-foreground">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-sm text-foreground">
              <CheckCircle className="w-4 h-4 text-chart-1 flex-shrink-0" />
              {benefit}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function StepCard({ step, icon, title, description }: {
  step: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-background rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
          {step}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}


function StatisticItem({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold mb-2 text-primary">{number}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}
