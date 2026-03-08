import React, { useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { InteractiveHoverButton } from '../ui/InteractiveHoverButton';

const Dithering = lazy(() => 
  import('@paper-design/shaders-react').then((mod) => ({ 
    default: mod.Dithering 
  }))
);

export function HeroSection() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="py-12 w-full flex justify-center items-center px-4 md:px-6">
      <div 
        className="w-full max-w-7xl relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden rounded-[48px] border border-gray-200 bg-white shadow-sm min-h-[600px] md:min-h-[600px] flex flex-col items-center justify-center transition-all duration-500">
          {/* Dithering Shader Background */}
          <Suspense fallback={<div className="absolute inset-0 bg-gray-50" />}>
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply">
              <Dithering
                colorBack="#00000000"
                colorFront="#EC4E02"
                shape="warp"
                type="4x4"
                speed={isHovered ? 0.6 : 0.2}
                className="w-full h-full"
                minPixelRatio={1}
              />
            </div>
          </Suspense>

          {/* Content */}
          <div className="relative z-10 px-6 max-w-4xl mx-auto text-center flex flex-col items-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-gray-900/10 bg-gray-900/5 px-4 py-1.5 text-sm font-medium text-gray-900 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-900 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-900"></span>
              </span>
              EventNexus
            </div>

            {/* Headline */}
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-gray-900 mb-8 leading-[1.05]">
              Your events, <br />
              <span className="text-gray-900/80">managed perfectly.</span>
            </h1>

            {/* Description */}
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
              Join thousands of organizers using the only platform that streamlines event management. 
              Clean, powerful, and uniquely yours.
            </p>

            {/* Button */}
            <InteractiveHoverButton
              text="Get Started"
              onClick={() => navigate('/register')}
              className="w-48 h-14 text-base"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
