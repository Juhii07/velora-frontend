import React from 'react';
import { useSettingsStore } from '@/store/settings.store';
import { Compass, Lightbulb, Target } from 'lucide-react';

const TEAM_MEMBERS = [
  {
    name: 'Shivam Tiwari',
    role: 'CEO',
    photo: '/team/shivam-tiwari-ceo.jpeg'
  },
  {
    name: 'Juhi Pawar',
    role: 'CTO',
    photo: '/team/juhi-pawar-cto.jpeg'
  },
  {
    name: 'Kajal Pal',
    role: 'CMO',
    photo: '/team/kajal-pal-cmo.jpeg'
  }
];

export default function AboutPage() {
  const { settings } = useSettingsStore();

  return (
    <div className="pb-20">
      {/* Hero Banner */}
      <section className="relative h-[40vh] bg-luxury-sand flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 bg-black/35 z-0">
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1600&auto=format&fit=crop"
            alt="about banner"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-xl space-y-4">
          <p className="text-gold font-outfit text-xs font-semibold tracking-widest uppercase">The Heritage</p>
          <h1 className="text-4xl md:text-5xl font-extrabold font-outfit tracking-wide text-white uppercase">
            Our Brand Story
          </h1>
          <div className="w-12 h-0.5 bg-gold mx-auto"></div>
        </div>
      </section>

      {/* Brand History */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8 text-center leading-relaxed">
        <h2 className="text-2xl font-bold uppercase tracking-wider text-luxury-charcoal">The Atelier Genesis</h2>
        <p className="text-gray-600 font-light text-base max-w-2xl mx-auto">
          {settings?.brandStory?.storyText ||
            'Founded in 2026, Velora redefines modern high jewelry by blending architectural geometry with traditional, hand-textured craftsmanship. Every single design is sculpted with fine precision, honoring timeless materials.'}
        </p>
      </section>

      {/* Mission & Vision Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Card 1: Story */}
        <div className="bg-white border border-gold/10 p-8 rounded-lg shadow-sm text-center space-y-4">
          <div className="w-12 h-12 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto">
            <Compass size={24} />
          </div>
          <h3 className="font-outfit text-base font-bold uppercase tracking-wider">Our Heritage</h3>
          <p className="text-gray-500 text-xs font-light leading-relaxed">
            Crafting items that stand as artifacts of beauty, uniting mathematical geometry with high-carat materials.
          </p>
        </div>

        {/* Card 2: Mission */}
        <div className="bg-white border border-gold/10 p-8 rounded-lg shadow-sm text-center space-y-4">
          <div className="w-12 h-12 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto">
            <Target size={24} />
          </div>
          <h3 className="font-outfit text-base font-bold uppercase tracking-wider">Our Mission</h3>
          <p className="text-gray-500 text-xs font-light leading-relaxed">
            {settings?.brandStory?.missionText ||
              'To design high-quality, sustainable luxury jewelry that celebrates the beauty of every individual.'}
          </p>
        </div>

        {/* Card 3: Vision */}
        <div className="bg-white border border-gold/10 p-8 rounded-lg shadow-sm text-center space-y-4">
          <div className="w-12 h-12 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto">
            <Lightbulb size={24} />
          </div>
          <h3 className="font-outfit text-base font-bold uppercase tracking-wider">Our Vision</h3>
          <p className="text-gray-500 text-xs font-light leading-relaxed">
            {settings?.brandStory?.visionText ||
              'To become the leading global digital atelier for premium custom and handcrafted lifestyle ornaments.'}
          </p>
        </div>

      </section>

      {/* Leadership Team */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-3 mb-12">
          <p className="text-gold font-outfit text-xs font-semibold tracking-widest uppercase">The People</p>
          <h2 className="text-2xl font-bold uppercase tracking-wider text-luxury-charcoal">Meet Our Leadership</h2>
          <div className="w-12 h-0.5 bg-gold mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {TEAM_MEMBERS.map((member) => (
            <div key={member.name} className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border border-gold/20 shadow-sm">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-outfit text-sm font-bold uppercase tracking-wider text-luxury-charcoal">
                  {member.name}
                </h3>
                <p className="text-gold text-xs font-semibold uppercase tracking-widest mt-1">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}