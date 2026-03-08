import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from "../../components/landing/HeroSection";
import { FeaturesSection } from "../../components/landing/FeaturesSection";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f9f8f6ff' }}>
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* CTA Section */}
      <section className="py-20 px-6 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start managing your events today
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers who trust EventNexus to deliver exceptional experiences.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors duration-200"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6" style={{ backgroundColor: '#e4ddd4' }}>
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600">&copy; 2026 EventNexus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
