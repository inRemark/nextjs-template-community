import { getMessages } from 'next-intl/server';
import { createPageMetadataGenerator } from '@/lib/seo';
import React from 'react';
import { PortalLayout } from '@shared/layout/portal-layout';
import { PageContent } from '@/shared/layout/portal-page-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { Button } from '@shared/ui/button';
import { Timeline, TimelineItem } from '@/shared/ui/data-components';
import { 
  Target, 
  Eye, 
  Heart, 
  Users, 
  Award, 
  Shield, 
  Zap,
  Mail,
  MapPin,
  Clock,
  ExternalLink
} from 'lucide-react';
import { TimelineEvent } from '@shared/types/portal';

const getValueIcon = (icon: string) => {
  const iconMap = {
    heart: Heart,
    zap: Zap,
    shield: Shield,
    users: Users,
  };
  return iconMap[icon as keyof typeof iconMap] || Heart;
};

const getTimelineIcon = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'milestone': return '🏆';
    case 'product': return '🚀';
    case 'expansion': return '🌍';
    case 'achievement': return '⭐';
    default: return '📅';
  }
};

export const generateMetadata = createPageMetadataGenerator('about');

export default async function AboutPage() {
  const messages: any = await getMessages();
  const about = messages.about;
  const timelineItems: TimelineItem[] = (about.timeline.events as TimelineEvent[]).map(event => ({
    id: event.id,
    title: getTimelineIcon(event.type) + `${event.year} : ${event.title}`,
    description: event.description,
    timestamp: new Date(`${event.year}-01`),
    type: 'default',
  }));

  return (
    <PortalLayout >
      <PageContent maxWidth="xl">
        <div className="py-12 space-y-16">
          {/* Company section */}
          <section>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">{about.company.name}</h1>
              <p className="text-base text-muted-foreground mb-8">{about.company.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{about.sections.mission.title}</h3>
                  <p className="text-sm text-muted-foreground">{about.company.mission}</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{about.sections.vision.title}</h3>
                  <p className="text-sm text-muted-foreground">{about.company.vision}</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{about.sections.founding.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {about.company.founded} · {about.company.employeeCount}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Company values */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-12">{about.values.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(about.values.items as Array<{title: string; description: string; icon: string}>).map((value) => {
                const Icon = getValueIcon(value.icon);
                return (
                  <Card key={value.title} className="text-center">
                    <CardHeader>
                      <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{value.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Company history */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-12">{about.timeline.title}</h2>
            <div className="max-w-4xl mx-auto">
              <Timeline items={timelineItems} />
            </div>
          </section>

          {/* Contact section */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-12">{about.contact.title}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {about.contact.sections.contactInfo.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{about.contact.email}</p>
                      <p className="text-sm text-muted-foreground">{about.contact.emailValue}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{about.contact.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {about.company.country} {about.company.state} {about.company.city}<br />
                        {about.company.headquarters}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {about.contact.sections.businessHours.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>{about.contact.weekday}</span>
                    <span className="font-medium">9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{about.contact.weekend}</span>
                    <span className="text-muted-foreground">{about.contact.weekend_closed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{about.contact.timezone}</span>
                    <span className="text-muted-foreground">{about.contact.timezoneValue}</span>
                  </div>
                  <div className="pt-4">
                    <Button className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {about.contact.contactButton}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </PageContent>
    </PortalLayout>
  );
}