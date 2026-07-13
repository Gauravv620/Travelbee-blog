import React, { useState } from 'react';
import { Compass, Mail, Heart, Send, Check } from 'lucide-react';
import { ThemeSettings } from '../types';
import { COLOR_PALETTES } from '../utils/theme';

interface FooterProps {
  settings: ThemeSettings;
  setCurrentTab: (tab: string) => void;
}

export default function Footer({ settings, setCurrentTab }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const palette = COLOR_PALETTES[settings.primaryColor] || COLOR_PALETTES.emerald;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <button
              id="footer-logo-btn"
              onClick={() => setCurrentTab('home')}
              className="flex items-center space-x-2 text-white font-serif font-bold text-lg hover:opacity-90 cursor-pointer"
            >
              <div className={`p-1.5 rounded-lg ${palette.primaryBg} text-white`}>
                <Compass className="w-5 h-5" />
              </div>
              <span>{settings.siteName || 'Travel Bee'}</span>
            </button>
            <p className="text-sm text-slate-400 font-sans leading-relaxed">
              {settings.siteDescription || 'Chronicles of an offline explorer.'}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-semibold tracking-wider uppercase font-sans">
              Destinations
            </h3>
            <ul className="space-y-2 text-sm font-sans">
              <li>
                <button 
                  onClick={() => setCurrentTab('blog')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Asia
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentTab('blog')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Europe
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentTab('blog')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Middle East
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentTab('blog')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Tips &amp; Hacks
                </button>
              </li>
            </ul>
          </div>

          {/* Categories / Navigation */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-semibold tracking-wider uppercase font-sans">
              Wanderlust
            </h3>
            <ul className="space-y-2 text-sm font-sans">
              <li>
                <button 
                  onClick={() => setCurrentTab('home')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentTab('blog')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Explore Posts
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentTab('authors')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Our Authors
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter subscription block */}
          <div className="space-y-4 md:col-span-1">
            <h3 className="text-white text-sm font-semibold tracking-wider uppercase font-sans">
              Join the Hive
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Get stories of off-the-grid locations and packing guides delivered straight to your inbox.
            </p>
            
            {settings.activeSections.newsletter && (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-grow">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    id="newsletter-email-input"
                    type="email"
                    required
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                  />
                </div>
                <button
                  id="newsletter-submit-btn"
                  type="submit"
                  className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-300 flex items-center justify-center space-x-1 cursor-pointer ${
                    subscribed ? 'bg-green-600' : palette.primaryBg + ' ' + palette.primaryHover
                  }`}
                >
                  {subscribed ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  <span>{subscribed ? 'Joined!' : 'Join'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 font-sans">
          <p>© 2026 Travel Bee. Crafted for modern wanderers.</p>
          <p className="flex items-center mt-2 md:mt-0">
            <span>Made with</span>
            <Heart className={`w-3.5 h-3.5 mx-1 fill-current ${palette.accentText}`} />
            <span>for offline discovery.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
