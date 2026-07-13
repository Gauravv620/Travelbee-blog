import React, { useState, useEffect } from 'react';
import { 
  Compass, BookOpen, Users, Search, ArrowRight, Star, Clock, 
  MapPin, Mail, Sparkles, LogOut, ShieldCheck, Heart, LayoutGrid, LayoutList 
} from 'lucide-react';
import { Post, Author, ThemeSettings } from './types';
import { 
  checkAndSeedData, 
  getThemeSettings, 
  saveThemeSettings, 
  getPosts, 
  getAuthors 
} from './firebase/db';
import { COLOR_PALETTES, FONT_STYLES } from './utils/theme';

// Import our modular custom components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import PostCard from './components/PostCard';
import PostDetail from './components/PostDetail';
import AuthorPage from './components/AuthorPage';
import BlogArchive from './components/BlogArchive';
import AdminDashboard from './components/AdminDashboard';
import LoginModal from './components/LoginModal';

export default function App() {
  // Application settings and database records
  const [settings, setSettings] = useState<ThemeSettings | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Layout Navigation / Routing states
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  
  // Archive filters preset when redirected from homepage curated blocks
  const [archiveInitialCategory, setArchiveInitialCategory] = useState('');

  // Authentication states
  const [isAdmin, setIsAdmin] = useState(false);
  const [editorEmail, setEditorEmail] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Layout presentation mode (Bento vs Simple Editorial)
  const [homeLayoutMode, setHomeLayoutMode] = useState<'bento' | 'simple'>(() => {
    return (localStorage.getItem('travelbee_home_layout') as 'bento' | 'simple') || 'bento';
  });

  // Homepage interactive states
  const [homeSelectedCategory, setHomeSelectedCategory] = useState('All');
  const [pollVotedOption, setPollVotedOption] = useState<string | null>(null);
  const [pollVotes, setPollVotes] = useState<Record<string, number>>({
    patagonia: 148,
    socotra: 92,
    lofoten: 119
  });

  // Initialize and Seed Firestore on Mount
  useEffect(() => {
    // Load poll state from localStorage
    const savedVote = localStorage.getItem('travelbee_poll_vote');
    if (savedVote) {
      setPollVotedOption(savedVote);
    }
    const savedVotes = localStorage.getItem('travelbee_poll_votes_count');
    if (savedVotes) {
      try {
        setPollVotes(JSON.parse(savedVotes));
      } catch (e) {}
    }

    async function initApp() {
      setIsLoading(true);
      try {
        // 1. Seed database with rich travel content and default visual blocks if empty
        await checkAndSeedData();

        // 2. Load settings and data from Firestore
        const settingsData = await getThemeSettings();
        setSettings(settingsData);

        const postsData = await getPosts(true); // load all posts initially
        setPosts(postsData);

        const authorsData = await getAuthors();
        setAuthors(authorsData);

        // Auto-login session restore if cached in local storage for developer convenience
        const cachedEmail = localStorage.getItem('travelbee_editor_email');
        if (cachedEmail) {
          setIsAdmin(true);
          setEditorEmail(cachedEmail);
        }
      } catch (err) {
        console.error('Error initializing Travel Bee App:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initApp();
  }, []);

  const handleSaveThemeSettings = async (newSettings: ThemeSettings) => {
    setSettings(newSettings);
    await saveThemeSettings(newSettings);
  };

  const handleLoginSuccess = (email: string) => {
    setIsAdmin(true);
    setEditorEmail(email);
    localStorage.setItem('travelbee_editor_email', email);
    setCurrentTab('admin');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setEditorEmail('');
    localStorage.removeItem('travelbee_editor_email');
    if (currentTab === 'admin') {
      setCurrentTab('home');
    }
  };

  // Nav helper to reset page offsets/details
  const handleSetTab = (tabId: string) => {
    setSelectedPost(null);
    setSelectedAuthor(null);
    setArchiveInitialCategory('');
    setCurrentTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPost = (post: Post) => {
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAuthor = (authorId: string) => {
    const auth = authors.find(a => a.id === authorId);
    if (auth) {
      setSelectedAuthor(auth);
      setSelectedPost(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectCuratedCategory = (catName: string) => {
    setArchiveInitialCategory(catName);
    setSelectedPost(null);
    setSelectedAuthor(null);
    setCurrentTab('blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 4000);
    }
  };

  const handleVote = (optionKey: string) => {
    if (pollVotedOption) return;
    const updatedVotes = {
      ...pollVotes,
      [optionKey]: (pollVotes[optionKey] || 0) + 1
    };
    setPollVotes(updatedVotes);
    setPollVotedOption(optionKey);
    localStorage.setItem('travelbee_poll_vote', optionKey);
    localStorage.setItem('travelbee_poll_votes_count', JSON.stringify(updatedVotes));
  };

  if (isLoading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-slate-700">
        <Compass className="w-10 h-10 animate-spin text-emerald-600 mb-2" />
        <p className="text-sm font-semibold tracking-wide font-sans animate-pulse">Loading Travel Bee Journal...</p>
      </div>
    );
  }

  const palette = COLOR_PALETTES[settings.primaryColor] || COLOR_PALETTES.emerald;
  const fonts = FONT_STYLES[settings.fontFamily] || FONT_STYLES.editorial;

  // Filter posts based on permissions (only published for public, all for logged-in admin)
  const availablePosts = isAdmin 
    ? posts 
    : posts.filter(p => p.status === 'published');

  // Featured Posts list
  const featuredPosts = availablePosts.filter(p => p.isFeatured);

  // Latest Posts list, with interactive live category filter on the homepage
  const homeFilteredPosts = homeSelectedCategory === 'All'
    ? availablePosts
    : availablePosts.filter(p => p.category === homeSelectedCategory);

  const latestPosts = homeFilteredPosts.slice(0, 6);

  // Destination collections (categories) with beautiful unsplash cards
  const curatedCollections = [
    { name: 'Asia', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80', count: availablePosts.filter(p => p.category === 'Asia').length },
    { name: 'Europe', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=400&q=80', count: availablePosts.filter(p => p.category === 'Europe').length },
    { name: 'Middle East', image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=400&q=80', count: availablePosts.filter(p => p.category === 'Middle East').length },
    { name: 'Gear & Tips', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80', count: availablePosts.filter(p => p.category === 'Gear & Tips').length }
  ];

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-800 ${fonts.bodyFont}`}>
      
      {/* Dynamic Navbar */}
      {!(currentTab === 'admin' && isAdmin) && (
        <Navbar
          settings={settings}
          currentTab={currentTab}
          setCurrentTab={handleSetTab}
          isAdmin={isAdmin}
          onLogout={handleLogout}
          onOpenLogin={() => setShowLoginModal(true)}
        />
      )}

      {/* Main View Router */}
      <main className="flex-grow">
        
        {/* Render Single Post Detail view if set */}
        {selectedPost ? (
          <PostDetail
            settings={settings}
            post={selectedPost}
            authors={authors}
            isAdmin={isAdmin}
            onBack={() => setSelectedPost(null)}
            onSelectAuthor={handleSelectAuthor}
          />
        ) : selectedAuthor ? (
          /* Render single Author page detail */
          <AuthorPage
            settings={settings}
            author={selectedAuthor}
            posts={availablePosts}
            authors={authors}
            onSelectPost={handleSelectPost}
            onBack={() => setSelectedAuthor(null)}
          />
        ) : currentTab === 'admin' && isAdmin ? (
          /* Render integrated Admin Panel CMS dashboard */
          <AdminDashboard
            settings={settings}
            onSaveThemeSettings={handleSaveThemeSettings}
            editorEmail={editorEmail}
            onLogout={handleLogout}
            onExitAdmin={() => handleSetTab('home')}
          />
        ) : currentTab === 'blog' ? (
          /* Render fully searchable Archive journal with sidebar filters */
          <BlogArchive
            settings={settings}
            posts={availablePosts}
            authors={authors}
            onSelectPost={handleSelectPost}
            initialCategory={archiveInitialCategory}
          />
        ) : currentTab === 'authors' ? (
          /* Render complete Author list grid */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h1 className={`text-3xl md:text-4xl font-bold text-slate-900 ${fonts.titleFont}`}>
                Meet Our Explorers
              </h1>
              <p className="text-sm text-slate-500 font-sans">
                The wanderers, photographers, and gear technicians behind our off-the-grid travel stories.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {authors.map((auth) => (
                <div 
                  key={auth.id} 
                  onClick={() => handleSelectAuthor(auth.id)}
                  className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 text-center space-y-4 cursor-pointer group"
                >
                  <img
                    src={auth.avatar}
                    alt={auth.name}
                    className="w-24 h-24 rounded-2xl object-cover mx-auto ring-4 ring-slate-100 shadow-md group-hover:scale-105 transition duration-300"
                  />
                  <div className="space-y-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${palette.badgeBg} ${palette.badgeText}`}>
                      {auth.role || 'Writer'}
                    </span>
                    <h3 className={`text-xl font-bold text-slate-900 group-hover:text-slate-800 ${fonts.titleFont}`}>
                      {auth.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-sans leading-relaxed line-clamp-3">
                    {auth.bio}
                  </p>
                  <button
                    id={`view-author-${auth.id}`}
                    className={`text-xs font-bold cursor-pointer transition-colors ${palette.primaryText}`}
                  >
                    Read Chronicles →
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* DEFAULT: RENDER HOMEPAGE */
          <div className="space-y-12 pb-16">
            
            {/* 0. Elegant Layout Controller Strip */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-100 pb-4 gap-4">
                <div>
                  <h2 className={`text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 ${fonts.titleFont}`}>
                    <Compass className={`w-5 h-5 ${palette.primaryText} animate-spin-slow`} />
                    <span>Wanderer's Dispatch</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">Choose your reading perspective: Immersive Bento Grid or Simple Editorial List.</p>
                </div>
                <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl shrink-0">
                  <button
                    onClick={() => {
                      setHomeLayoutMode('bento');
                      localStorage.setItem('travelbee_home_layout', 'bento');
                    }}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      homeLayoutMode === 'bento'
                        ? `${palette.primaryBg} text-white shadow-sm`
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Bento Showcase</span>
                  </button>
                  <button
                    onClick={() => {
                      setHomeLayoutMode('simple');
                      localStorage.setItem('travelbee_home_layout', 'simple');
                    }}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      homeLayoutMode === 'simple'
                        ? `${palette.primaryBg} text-white shadow-sm`
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutList className="w-3.5 h-3.5" />
                    <span>Simple Editorial</span>
                  </button>
                </div>
              </div>
            </div>

            {homeLayoutMode === 'bento' ? (
              /* ================= BENTO SHOWCASE LAYOUT (ORIGINAL) ================= */
              <div className="space-y-16">
                {/* 1. Hero Block */}
                {settings.activeSections.hero && (
                  <Hero
                    settings={settings}
                    featuredPosts={featuredPosts}
                    authors={authors}
                    onSelectPost={handleSelectPost}
                    setCurrentTab={handleSetTab}
                  />
                )}

                {/* Admin Bypass Notification strip */}
                {isAdmin && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 -mb-4">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      <span className="flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>Logged in as Editor: <strong>{editorEmail}</strong>. Head to Dashboard to add, edit or unpublish posts.</span>
                      </span>
                      <button
                        id="homepage-dashboard-btn"
                        onClick={() => handleSetTab('admin')}
                        className={`px-3 py-1 text-[11px] font-bold text-white rounded-lg cursor-pointer ${palette.primaryBg}`}
                      >
                        Open Dashboard
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Featured Posts Grid row */}
                {settings.activeSections.featured && featuredPosts.length > 0 && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <h2 className={`text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center space-x-2 ${fonts.titleFont}`}>
                          <Star className={`w-5 h-5 text-amber-500 fill-current`} />
                          <span>Featured Adventures</span>
                        </h2>
                        <p className="text-xs text-slate-500 font-sans">Hand-selected travel chronicles of off-the-grid locations.</p>
                      </div>
                      <button
                        id="view-all-featured"
                        onClick={() => handleSetTab('blog')}
                        className={`text-xs font-bold font-sans flex items-center space-x-1 cursor-pointer hover:underline ${palette.primaryText}`}
                      >
                        <span>View All Journal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {featuredPosts.slice(0, 3).map(post => (
                        <PostCard
                          settings={settings}
                          key={post.id}
                          post={post}
                          authors={authors}
                          onClick={() => handleSelectPost(post)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Curated Travel Collections cards */}
                {settings.activeSections.curated && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="space-y-1">
                      <h2 className={`text-2xl md:text-3xl font-bold text-slate-900 tracking-tight ${fonts.titleFont}`}>
                        Curated Collections
                      </h2>
                      <p className="text-xs text-slate-500 font-sans">Browse travel guides curated by geographical territories and interests.</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {curatedCollections.map((col, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectCuratedCategory(col.name)}
                          className="group relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm hover:shadow-lg transition duration-300 cursor-pointer"
                        >
                          <img
                            src={col.image}
                            alt={col.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                          
                          <div className="absolute bottom-4 left-4 text-white">
                            <p className="font-bold text-base md:text-lg tracking-tight font-serif leading-none mb-1.5">{col.name}</p>
                            <p className="text-[10px] text-slate-300 font-sans font-medium uppercase tracking-wider">{col.count} articles</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Latest Posts Grid */}
                {settings.activeSections.latest && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-100">
                      <div className="space-y-1">
                        <h2 className={`text-2xl md:text-3xl font-bold text-slate-900 tracking-tight ${fonts.titleFont}`}>
                          Latest From The Field
                        </h2>
                        <p className="text-xs text-slate-500 font-sans">Freshly published stories of deep exploration and packing reviews.</p>
                      </div>
                      
                      {/* Interactive Category Filter Pills */}
                      <div className="flex flex-wrap gap-2">
                        {['All', 'Asia', 'Europe', 'Middle East', 'Gear & Tips'].map((cat) => {
                          const isActive = homeSelectedCategory === cat;
                          const hasItems = cat === 'All' ? true : availablePosts.some(p => p.category === cat);
                          
                          return (
                            <button
                              key={cat}
                              onClick={() => setHomeSelectedCategory(cat)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                                isActive
                                  ? `${palette.primaryBg} text-white shadow-sm`
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                              } ${!hasItems ? 'opacity-40' : ''}`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {latestPosts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {latestPosts.map(post => (
                          <PostCard
                            settings={settings}
                            key={post.id}
                            post={post}
                            authors={authors}
                            onClick={() => handleSelectPost(post)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <Compass className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-bounce" />
                        <p className="text-sm font-semibold text-slate-600 font-sans">No chronicles found in {homeSelectedCategory}</p>
                        <button
                          onClick={() => setHomeSelectedCategory('All')}
                          className={`text-xs font-bold mt-2 cursor-pointer ${palette.primaryText}`}
                        >
                          Show All Posts
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Interactive Travel Poll block */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-xs font-bold font-sans">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-current animate-pulse shrink-0" />
                        <span>Interactive Reader Poll</span>
                      </div>
                      <h3 className={`text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight ${fonts.titleFont}`}>
                        Where Should We Send Our Next Explorer?
                      </h3>
                      <p className="text-xs md:text-sm text-slate-500 font-sans leading-relaxed">
                        We plan our major expeditions based entirely on community curiosity! Cast your vote for our late-autumn expedition to see real-time community interest, and read the first dispatch live upon launch.
                      </p>
                      
                      {pollVotedOption && (
                        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-semibold">
                          ✓ Vote recorded successfully! Thank you for helping shape our off-the-grid route.
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: 'patagonia', label: 'Patagonian Fjords, Chile (High-Altitude Hiking)', desc: 'Glacial treks & wild winds' },
                        { key: 'socotra', label: 'Socotra Island, Yemen (Flora Sanctuary)', desc: 'Alien-like dragon blood forests' },
                        { key: 'lofoten', label: 'Lofoten Archipelago, Norway (Midnight Sun)', desc: 'Fjord cabins & cod-fishing heritage' }
                      ].map((opt) => {
                        const totalVotes = (Object.values(pollVotes) as number[]).reduce((a, b) => a + b, 0);
                        const votes = (pollVotes[opt.key] || 0) as number;
                        const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                        const isSelected = pollVotedOption === opt.key;

                        return (
                          <button
                            key={opt.key}
                            disabled={!!pollVotedOption}
                            onClick={() => handleVote(opt.key)}
                            className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden group/opt ${
                              pollVotedOption 
                                ? 'cursor-default' 
                                : 'cursor-pointer border-slate-100 hover:border-slate-300 hover:shadow-sm'
                            } ${isSelected ? 'ring-2 ring-emerald-500 ring-offset-1 border-emerald-200' : ''}`}
                          >
                            {/* Background Percentage bar graph if voted */}
                            {pollVotedOption && (
                              <div 
                                className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out ${
                                  isSelected ? 'bg-emerald-50/80' : 'bg-slate-50/70'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            )}

                            <div className="relative z-10 flex justify-between items-center">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xs md:text-sm font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                                    {opt.label}
                                  </span>
                                  {isSelected && (
                                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                      Your Choice
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                              </div>
                              
                              {pollVotedOption ? (
                                <span className="text-xs font-mono font-bold text-slate-700">{percent}%</span>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400 border border-slate-200 rounded-lg px-2.5 py-1 bg-slate-50 group-hover/opt:bg-slate-100 transition-colors">
                                  Vote
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                      
                      <div className="text-[10px] text-slate-400 text-right font-sans font-medium">
                        Total Votes Cast: {(Object.values(pollVotes) as number[]).reduce((a, b) => a + b, 0)} • Verified Community Input
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Newsletter subscription banner block */}
                {settings.activeSections.newsletter && (
                  <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-slate-900 rounded-3xl p-6 md:p-10 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                      
                      {/* Visual Background Accent blobs */}
                      <div className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl opacity-10 ${palette.primaryBg}`} />
                      <div className="space-y-2 max-w-md relative z-10 text-center md:text-left">
                        <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-full font-sans uppercase font-bold tracking-widest inline-block">
                          The Weekly Buzz
                        </span>
                        <h3 className="text-xl md:text-2xl font-bold text-white font-serif">
                          Never Miss A Secret Location
                        </h3>
                        <p className="text-xs text-slate-400 font-sans leading-relaxed">
                          Join 12,000+ readers. Get our weekend digest of high-altitude paths, local packing hacks, and photography templates directly to your device.
                        </p>
                      </div>

                      {newsletterSubscribed ? (
                        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-green-400 text-xs font-semibold flex items-center space-x-2 relative z-10 shrink-0">
                          <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                          <span>Thank you! Your invite is flying to your inbox.</span>
                        </div>
                      ) : (
                        <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto relative z-10 shrink-0 font-sans">
                          <input
                            id="newsletter-body-email"
                            type="email"
                            required
                            placeholder="Your email address"
                            value={newsletterEmail}
                            onChange={(e) => setNewsletterEmail(e.target.value)}
                            className="px-4 py-2.5 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-60"
                          />
                          <button
                            id="newsletter-body-btn"
                            type="submit"
                            className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow cursor-pointer whitespace-nowrap ${palette.primaryBg} ${palette.primaryHover}`}
                          >
                            Subscribe to Hive
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ================= SIMPLE EDITORIAL LAYOUT (NEW) ================= */
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  
                  {/* Left Column (2/3 width) - Main feed stream */}
                  <div className="lg:col-span-2 space-y-10">
                    
                    {/* Header with category pill selectors */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
                      <h3 className={`text-xl font-bold text-slate-900 tracking-tight ${fonts.titleFont}`}>
                        Chronicles Feed
                      </h3>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {['All', 'Asia', 'Europe', 'Middle East', 'Gear & Tips'].map((cat) => {
                          const isActive = homeSelectedCategory === cat;
                          return (
                            <button
                              key={cat}
                              onClick={() => setHomeSelectedCategory(cat)}
                              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                                isActive
                                  ? `${palette.primaryBg} text-white shadow-sm`
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Infinite stream list of posts */}
                    <div className="space-y-10 divide-y divide-slate-100">
                      {homeFilteredPosts.length > 0 ? (
                        homeFilteredPosts.map((post, index) => {
                          const author = authors.find(a => a.id === post.authorId);
                          const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          });

                          return (
                            <div
                              key={post.id}
                              onClick={() => handleSelectPost(post)}
                              className={`group flex flex-col md:flex-row gap-6 items-start cursor-pointer transition-all duration-300 hover:translate-x-1 ${
                                index > 0 ? 'pt-10' : ''
                              }`}
                            >
                              {/* Left landscape simple image */}
                              <div className="w-full md:w-56 h-36 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200/60 relative">
                                <img
                                  src={post.heroImage}
                                  alt={post.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                                />
                                <div className="absolute top-3 left-3">
                                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-white/95 text-slate-800 shadow-sm border border-slate-100`}>
                                    {post.category}
                                  </span>
                                </div>
                              </div>

                              {/* Text Block */}
                              <div className="space-y-2.5 flex-grow">
                                <div className="flex items-center space-x-2 text-[11px] font-mono font-semibold tracking-wider text-slate-400">
                                  <span>{formattedDate}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {post.readingTime} min read
                                  </span>
                                </div>

                                <h4 className={`text-xl md:text-2xl font-black text-slate-950 group-hover:text-slate-800 transition-colors leading-snug tracking-tight ${fonts.titleFont}`}>
                                  {post.title}
                                </h4>

                                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans line-clamp-2">
                                  {post.excerpt}
                                </p>

                                <div className="flex items-center justify-between pt-2">
                                  <div className="flex items-center space-x-2">
                                    <img
                                      src={author?.avatar}
                                      alt={author?.name}
                                      className="w-6 h-6 rounded-full object-cover border border-slate-100"
                                    />
                                    <span className="text-xs font-semibold text-slate-700">{author?.name}</span>
                                  </div>
                                  <span className={`text-xs font-extrabold flex items-center space-x-0.5 group-hover:underline ${palette.primaryText}`}>
                                    <span>Read Dispatch</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                          <Compass className="w-10 h-10 text-slate-300 mx-auto mb-3 animate-spin-slow" />
                          <h4 className="text-sm font-bold text-slate-700">No Chronicles Found</h4>
                          <p className="text-xs text-slate-400 mt-1">We haven't cataloged any logs for the "{homeSelectedCategory}" tag yet.</p>
                          <button
                            onClick={() => setHomeSelectedCategory('All')}
                            className={`text-xs font-bold mt-3 cursor-pointer ${palette.primaryText}`}
                          >
                            Reset Category Filter
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column (1/3 width) - Minimal Sidebar panel stack */}
                  <div className="space-y-10">
                    
                    {/* 1. Curated Spotlight Card */}
                    {featuredPosts.length > 0 && (
                      <div className="space-y-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-[10px] font-bold tracking-widest font-mono text-amber-600 uppercase">Spotlight Discovery</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                          <h4
                            onClick={() => handleSelectPost(featuredPosts[0])}
                            className={`text-lg font-black text-slate-950 group-hover:text-slate-800 cursor-pointer transition-colors leading-snug ${fonts.titleFont}`}
                          >
                            {featuredPosts[0].title}
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-sans">{featuredPosts[0].excerpt}</p>
                        </div>
                        <button
                          onClick={() => handleSelectPost(featuredPosts[0])}
                          className={`text-xs font-bold flex items-center space-x-1.5 cursor-pointer group-hover:underline ${palette.primaryText}`}
                        >
                          <span>Acquire Dispatch</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* 2. Curated Territorial Collections Quick Navigator */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-sans">Territorial Guides</h4>
                      <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm space-y-1">
                        {curatedCollections.map((col, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSelectCuratedCategory(col.name)}
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all group/item"
                          >
                            <span className="text-xs font-bold text-slate-700 group-hover/item:text-slate-950">{col.name}</span>
                            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 group-hover/item:bg-white px-2 py-0.5 rounded-md border border-slate-100/60">{col.count} logs</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. Simple Typographic Stats Board */}
                    <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                      <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                        <div className={`w-2 h-2 rounded-full ${palette.primaryBg} animate-pulse`} />
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-sans">Bee Hive Logs</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-left border-r border-slate-100 pr-2">
                          <p className="text-2xl font-black text-slate-950 font-mono tracking-tight">{availablePosts.length}</p>
                          <p className="text-[10px] text-slate-400">Total chronicles</p>
                        </div>
                        <div className="text-left pl-1">
                          <p className="text-2xl font-black text-slate-950 font-mono tracking-tight">{authors.length}</p>
                          <p className="text-[10px] text-slate-400">Active explorers</p>
                        </div>
                      </div>
                    </div>

                    {/* 4. Minimalist Sidebar Poll Card */}
                    <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4 relative overflow-hidden shadow-md">
                      <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-4 translate-y-4">
                        <Compass className="w-24 h-24 text-white" />
                      </div>
                      <div className="space-y-1 relative z-10">
                        <div className="inline-flex items-center space-x-1.5 bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest">
                          Active Voter
                        </div>
                        <h4 className={`text-base font-black tracking-tight leading-tight pt-1 ${fonts.titleFont}`}>Next Expedition Target</h4>
                        <p className="text-[10px] text-slate-400 font-sans">Cast a vote to choose our late-autumn destination trail.</p>
                      </div>

                      <div className="space-y-2.5 relative z-10">
                        {[
                          { key: 'patagonia', label: 'Patagonia Fjords' },
                          { key: 'socotra', label: 'Socotra Sanctuary' },
                          { key: 'lofoten', label: 'Lofoten Arch.' }
                        ].map((opt) => {
                          const totalVotes = (Object.values(pollVotes) as number[]).reduce((a, b) => a + b, 0);
                          const votes = (pollVotes[opt.key] || 0) as number;
                          const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                          const isSelected = pollVotedOption === opt.key;

                          return (
                            <button
                              key={opt.key}
                              disabled={!!pollVotedOption}
                              onClick={() => handleVote(opt.key)}
                              className={`w-full text-left p-2.5 rounded-xl text-xs border border-white/10 relative overflow-hidden transition duration-300 ${
                                pollVotedOption ? 'cursor-default' : 'hover:bg-white/5 cursor-pointer'
                              } ${isSelected ? 'border-amber-400 ring-1 ring-amber-400' : ''}`}
                            >
                              {pollVotedOption && (
                                <div className="absolute inset-y-0 left-0 bg-white/5 transition-all duration-1000" style={{ width: `${percent}%` }} />
                              )}
                              <div className="relative z-10 flex justify-between items-center px-1">
                                <span className="font-semibold text-slate-200">{opt.label}</span>
                                {pollVotedOption ? (
                                  <span className="font-mono text-[10px] text-amber-400 font-bold">{percent}%</span>
                                ) : (
                                  <span className="text-[9px] font-bold text-slate-300 border border-white/10 rounded px-1.5 bg-white/5">Vote</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      
                      {pollVotedOption && (
                        <p className="text-[10px] text-emerald-400 font-semibold text-center relative z-10 animate-pulse">
                          ✓ Choice verified successfully!
                        </p>
                      )}
                    </div>

                    {/* 5. Minimalist Sidebar Newsletter Signup */}
                    {settings.activeSections.newsletter && (
                      <div className="p-6 bg-slate-50 border border-slate-200/60 rounded-3xl space-y-4">
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-sans">The Weekly Buzz</h4>
                          <h5 className="text-sm font-bold text-slate-900">Never Miss A Secret Location</h5>
                          <p className="text-[11px] text-slate-500 leading-relaxed">Join 12,000+ readers getting secret photography templates and maps.</p>
                        </div>

                        {newsletterSubscribed ? (
                          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-semibold">
                            ✓ Success! Watch your inbox.
                          </div>
                        ) : (
                          <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                            <input
                              id="sidebar-newsletter-email"
                              type="email"
                              required
                              placeholder="Your email address"
                              value={newsletterEmail}
                              onChange={(e) => setNewsletterEmail(e.target.value)}
                              className="px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full"
                            />
                            <button
                              id="sidebar-newsletter-btn"
                              type="submit"
                              className={`w-full py-2 text-[11px] font-bold text-white rounded-xl shadow cursor-pointer ${palette.primaryBg} ${palette.primaryHover}`}
                            >
                              Subscribe to Hive
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* Dynamic Theme-aware Footer */}
      {!(currentTab === 'admin' && isAdmin) && (
        <Footer 
          settings={settings} 
          setCurrentTab={handleSetTab} 
        />
      )}

      {/* Auth Login Dialog */}
      {showLoginModal && (
        <LoginModal
          settings={settings}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

    </div>
  );
}
