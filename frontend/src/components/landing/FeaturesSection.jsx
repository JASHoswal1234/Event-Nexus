import React from 'react';
import { Calendar, Users, CheckCircle, Megaphone, User, BarChart3 } from 'lucide-react';
import { GlowingEffect } from '../ui/GlowingEffect';

const FeatureCard = ({ icon: Icon, title, description, area }) => {
  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-gray-200 p-2 md:rounded-[1.5rem] md:p-3">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="relative flex h-full flex-col gap-6 overflow-hidden rounded-xl border-[0.75px] p-6 shadow-sm" style={{ backgroundColor: '#fafaf9' }}>
          <div className="flex flex-col gap-3">
            <div className="w-fit rounded-lg border-[0.75px] border-gray-200 bg-white p-2">
              <Icon className="h-4 w-4 text-gray-900" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl leading-tight font-semibold font-sans tracking-[-0.04em] md:text-2xl text-gray-900">
                {title}
              </h3>
              <p className="font-sans text-sm leading-relaxed md:text-base text-gray-600">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export function FeaturesSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-normal text-gray-900 mb-4" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>
            Everything You Need to Manage Events
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our comprehensive platform provides all the tools you need to create, manage, and grow successful events.
          </p>
        </div>

        <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
          <FeatureCard
            area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
            icon={Calendar}
            title="Event Creation"
            description="Create and manage events with dates, capacity, and venues."
          />
          <FeatureCard
            area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
            icon={Users}
            title="Team Management"
            description="Let participants create and join teams with ease."
          />
          <FeatureCard
            area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
            icon={CheckCircle}
            title="Attendee Check-in"
            description="Streamline check-in with real-time tracking."
          />
          <FeatureCard
            area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
            icon={Megaphone}
            title="Announcements"
            description="Keep attendees informed with real-time updates."
          />
          <FeatureCard
            area="md:[grid-area:3/1/4/7] xl:[grid-area:2/8/3/10]"
            icon={User}
            title="User Access"
            description="Role-based access with secure authentication."
          />
          <FeatureCard
            area="md:[grid-area:3/7/4/13] xl:[grid-area:2/10/3/13]"
            icon={BarChart3}
            title="Analytics Dashboard"
            description="Track performance with comprehensive insights."
          />
        </ul>
      </div>
    </section>
  );
}
