import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Clock, User, Compass } from 'lucide-react';
import { Post, Author, ThemeSettings } from '../types';
import { COLOR_PALETTES, FONT_STYLES } from '../utils/theme';

interface HeroProps {
  settings: ThemeSettings;
  featuredPosts: Post[];
  authors: Author[];
  onSelectPost: (post: Post) => void;
  setCurrentTab: (tab: string) => void;
}

export default function Hero({
  settings,
  featuredPosts,
  authors,
  onSelectPost,
  setCurrentTab
}: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const palette = COLOR_PALETTES[settings.primaryColor] || COLOR_PALETTES.emerald;
  const fonts = FONT_STYLES[settings.fontFamily] || FONT_STYLES.editorial;

  const slides = featuredPosts.length > 0 ? featuredPosts : [];

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // Autoplay carousel slides
  useEffect(() => {
    if (settings.heroLayout === 'carousel' && slides.length > 1) {
      const interval = setInterval(handleNext, 6000);
      return () => clearInterval(interval);
    }
  }, [slides.length, settings.heroLayout]);

  const getAuthorName = (authorId: string) => {
    return authors.find(a => a.id === authorId)?.name || 'Travel Bee Writer';
  };

  const getAuthorAvatar = (authorId: string) => {
    return authors.find(a => a.id === authorId)?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80';
  };

  if (slides.length === 0 || settings.heroLayout === 'minimal') {
    // Minimal or Fallback static display
    return (
      <div className="bg-slate-50 border-b border-slate-100 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className={`inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full ${palette.badgeBg} ${palette.badgeText}`}>
            The Art of Travel Blog
          </div>
          <h1 className={`text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight ${fonts.titleFont}`}>
            {settings.siteName || 'Travel Bee'}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-sans leading-relaxed">
            {settings.siteDescription || 'Authentic chronicles of an offline explorer wandering the modern world.'}
          </p>
          <div className="pt-4">
            <button
              id="hero-minimal-cta"
              onClick={() => setCurrentTab('blog')}
              className={`inline-flex items-center space-x-2 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer ${palette.primaryBg} ${palette.primaryHover}`}
            >
              <span>Explore Journal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Carousel or Single Static Hero
  const activePost = slides[currentSlide];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2-Columns: Breathtaking Main Featured Hero Screen */}
        <div className="lg:col-span-2 relative bg-slate-950 rounded-3xl overflow-hidden h-[450px] md:h-[550px] shadow-xl group border border-slate-900">
          
          {/* Background Hero Image with custom Ken Burns effect */}
          <div className="absolute inset-0 overflow-hidden transition-all duration-700 ease-out">
            <img
              src={activePost.heroImage}
              alt={activePost.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-50 scale-100 group-hover:scale-105 transition-all duration-[10s] ease-out animate-kenburns"
            />
            {/* Double-layered gradient mask for flawless text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-transparent hidden md:block" />
          </div>

          {/* Hero Main Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 z-10">
            <div className="max-w-2xl space-y-4">
              
              {/* Category tag and slider indicator combined */}
              <div className="flex items-center space-x-3">
                <span className={`inline-block text-[10px] sm:text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full text-white shadow-sm ${palette.primaryBg}`}>
                  {activePost.category}
                </span>
                <span className="text-[11px] text-slate-300 font-medium font-mono">
                  Dispatch 0{currentSlide + 1} of 0{slides.length}
                </span>
              </div>

              {/* Title */}
              <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-sm ${fonts.titleFont}`}>
                {activePost.title}
              </h1>

              {/* Excerpt */}
              <p className="text-xs sm:text-sm md:text-base text-slate-300 font-sans line-clamp-2 md:line-clamp-3 leading-relaxed">
                {activePost.excerpt}
              </p>

              {/* Meta information & CTA button */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 border-t border-white/10">
                {/* Author Info */}
                <div className="flex items-center space-x-2">
                  <img
                    src={getAuthorAvatar(activePost.authorId)}
                    alt={getAuthorName(activePost.authorId)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-white leading-none">{getAuthorName(activePost.authorId)}</p>
                    <p className="text-[9px] text-slate-400">Field Reporter</p>
                  </div>
                </div>

                {/* Separation line */}
                <div className="hidden sm:block h-6 w-px bg-white/20" />

                {/* Reading Duration */}
                <div className="flex items-center space-x-1 text-xs text-slate-300 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activePost.readingTime} min read</span>
                </div>

                {/* Flexible spacer */}
                <div className="flex-grow" />

                {/* Read Article Trigger */}
                <button
                  id="hero-read-post-btn"
                  onClick={() => onSelectPost(activePost)}
                  className={`inline-flex items-center space-x-2 px-4.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer ${palette.primaryBg} ${palette.primaryHover}`}
                >
                  <span>Read Chronicle</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Simple Navigation Chevrons inside the main hero */}
          {slides.length > 1 && (
            <div className="absolute right-6 top-6 flex items-center space-x-2 z-20">
              <button
                id="hero-carousel-prev"
                onClick={handlePrev}
                className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white border border-white/10 backdrop-blur-sm transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="hero-carousel-next"
                onClick={handleNext}
                className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white border border-white/10 backdrop-blur-sm transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right 1-Column: Sleek Bento Utility Panel (Quick Dispatch List + Stats Tracker) */}
        <div className="flex flex-col justify-between space-y-6">
          
          {/* Bento Sub-card A: Quick-selector list of other trending featured posts */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4 flex-grow flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-bold uppercase tracking-wider text-slate-400 font-sans`}>
                  Featured Dispatches
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${palette.badgeBg} ${palette.badgeText}`}>
                  Curated
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Click a card to rotate the spotlight article.</p>
            </div>

            <div className="space-y-3 my-2 flex-grow overflow-y-auto max-h-[220px] pr-1">
              {slides.map((post, idx) => {
                const isSelected = idx === currentSlide;
                return (
                  <div
                    key={post.id}
                    onClick={() => setCurrentSlide(idx)}
                    className={`p-2.5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? `bg-slate-50 border-slate-200 ring-2 ring-offset-2 ${settings.primaryColor === 'emerald' ? 'ring-emerald-500' : settings.primaryColor === 'sky' ? 'ring-sky-500' : settings.primaryColor === 'orange' ? 'ring-orange-500' : settings.primaryColor === 'amber' ? 'ring-amber-500' : 'ring-zinc-800'}`
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <img
                      src={post.heroImage}
                      alt={post.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-sm"
                    />
                    <div className="overflow-hidden flex-grow">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[9px] font-extrabold uppercase ${palette.primaryText}`}>{post.category}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{post.readingTime}m read</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate leading-snug group-hover:text-slate-800">
                        {post.title}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentTab('blog')}
              className={`w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-[11px] font-bold text-slate-700 rounded-xl transition duration-200 cursor-pointer text-center flex items-center justify-center space-x-1`}
            >
              <span>Explore Full Journal Archive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bento Sub-card B: Beautiful Interactive Travel Stat Counter Grid */}
          <div className="bg-slate-900 rounded-3xl p-5 text-white space-y-4 shadow-md relative overflow-hidden">
            {/* Subtle background world map accent */}
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
              <Compass className="w-32 h-32 text-white animate-spin-slow" />
            </div>

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Bee Hive Milestones</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-lg md:text-xl font-black text-amber-400 tracking-tight">12</p>
                  <p className="text-[9px] text-slate-400 font-medium">Chronicles</p>
                </div>
                <div className="p-2 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-lg md:text-xl font-black text-sky-400 tracking-tight">4</p>
                  <p className="text-[9px] text-slate-400 font-medium">Explorers</p>
                </div>
                <div className="p-2 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-lg md:text-xl font-black text-emerald-400 tracking-tight">8k+</p>
                  <p className="text-[9px] text-slate-400 font-medium">Wanderers</p>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Active Database Node</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  ● Firestore Online
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
