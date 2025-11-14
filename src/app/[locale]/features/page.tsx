import { getMessages } from 'next-intl/server';
import { Button } from "@shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/ui/card";
import { Badge } from "@shared/ui/badge";
import { PortalLayout } from "@shared/layout/portal-layout";
import { PageContent } from "@/shared/layout/portal-page-content";
import { 
  Search, 
  Users, 
  CheckCircle,
  ArrowRight,
  Play,
  Brain,
  GitCompare,
  BookOpen,
  Award,
} from "lucide-react";
import Link from "next/link";

export default async function FeaturesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: any = await getMessages();
  // 从 feature 级翻译中提取首页数据
  const feature = messages.features;
  return (
    <PortalLayout showHero={true}>
      <div className="bg-gradient-to-b from-background to-muted/20 dark:from-background dark:to-muted/10">

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">{feature.badge}</Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              {feature.hero.title}
              <span className="text-primary">{feature.hero.titleHighlight}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {feature.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-4 text-lg" asChild>
                <Link href="/">
                  <Play className="w-5 h-5 mr-2" />
                  {feature.hero.primaryButton}
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg" asChild>
                <Link href="/explore">
                  {feature.hero.secondaryButton}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {feature.hero.tagline}
            </p>
          </div>
        </section>

      </div>
      
      <PageContent maxWidth="xl">
        {/* Core Features Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">{feature.features.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {feature.features.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(feature.features.items as Array<{title: string; description: string; benefits: string[]}>).map((feature, index) => (
              <FeatureCard
                key={index}
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
            <h2 className="text-3xl font-bold text-foreground mb-4">{feature.howItWorks.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {feature.howItWorks.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(feature.howItWorks.steps as Array<{step: string; title: string; description: string}>).map((step, index) => (
              <StepCard
                key={index}
                step={step.step}
                icon={getStepIcon(index)}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </section>

        {/* Advantages Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">{feature.advantages.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {feature.advantages.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">{feature.advantages.comparison}</h3>
              <div className="space-y-6">
                {(feature.advantages.items as Array<{title: string; traditional: string; vseek: string; advantage: string}>).map((item, index) => (
                  <ComparisonItem
                    key={index}
                    title={item.title}
                    traditional={item.traditional}
                    vseek={item.vseek}
                    advantage={item.advantage}
                  />
                ))}
              </div>
            </div>
            
            <div className="relative">
              <Card className="bg-gradient-to-br from-primary/5 to-chart-1/10 border-primary/20 shadow-lg">
                <CardContent className="p-8">
                  <h4 className="text-xl font-bold mb-6 text-foreground">VSeek {feature.advantages.title}</h4>
                  <ul className="space-y-4">
                    {(feature.advantages.benefits as string[]).map((benefit, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-chart-1 flex-shrink-0" />
                        <span className="text-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="bg-muted/30 py-20 rounded-lg">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-12 text-foreground">{feature.statistics.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {(feature.statistics.items as Array<{number: string; label: string}>).map((stat, index) => (
                <StatisticItem key={index} number={stat.number} label={stat.label} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {/* <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 rounded-lg">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">开始您的决策之旅</h2>
            <p className="text-xl mb-8 opacity-90">
              加入VSeek，让每个问题都能找到最佳解决方案
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg" asChild>
                <Link href="/">
                  立即开始
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg text-white border-white hover:bg-white hover:text-blue-600" asChild>
                <Link href="/explore">
                  浏览问题
                </Link>
              </Button>
            </div>
          </div>
        </section> */}
      </PageContent>
    </PortalLayout>
  );
}

// 获取功能图标
function getFeatureIcon(index: number) {
  const icons = [
    <Search className="w-12 h-12 text-primary" key={0} />,
    <Brain className="w-12 h-12 text-chart-4" key={1} />,
    <GitCompare className="w-12 h-12 text-chart-1" key={2} />,
    <Users className="w-12 h-12 text-chart-2" key={3} />,
    <BookOpen className="w-12 h-12 text-chart-3" key={4} />,
    <Award className="w-12 h-12 text-chart-5" key={5} />,
  ];
  return icons[index] || icons[0];
}

// 获取步骤图标
function getStepIcon(index: number) {
  const icons = [
    <Search className="w-8 h-8 text-primary" key={0} />,
    <Brain className="w-8 h-8 text-chart-4" key={1} />,
    <GitCompare className="w-8 h-8 text-chart-1" key={2} />,
  ];
  return icons[index] || icons[0];
}

// 组件定义
function FeatureCard({ icon, title, description, benefits }: {
  icon: React.ReactNode;
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
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-foreground">
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
  icon: React.ReactNode;
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

function ComparisonItem({ title, traditional, vseek, advantage }: {
  title: string;
  traditional: string;
  vseek: string;
  advantage: string;
}) {
  return (
    <div className="border-l-4 border-primary pl-4">
      <h4 className="font-semibold text-foreground mb-2">{title}</h4>
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-chart-3 rounded-full"></span>
          <span className="text-muted-foreground">传统方式：{traditional}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-chart-1 rounded-full"></span>
          <span className="text-foreground font-medium">VSeek：{vseek}</span>
        </div>
        <div className="text-primary font-medium ml-4">✓ {advantage}</div>
      </div>
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
