import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, BookOpen, Compass, ChevronDown } from 'lucide-react';
import { Post, Author, ThemeSettings } from '../types';
import { COLOR_PALETTES, FONT_STYLES } from '../utils/theme';
import PostCard from './PostCard';

interface BlogArchiveProps {
  settings: ThemeSettings;
  posts: Post[];
  authors: Author[];
  onSelectPost: (post: Post) => void;
  initialCategory?: string;
  initialTag?: string;
}

export default function BlogArchive({
  settings,
  posts,
  authors,
  onSelectPost,
  initialCategory = '',
  initialTag = ''
}: BlogArchiveProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [sortBy, setSortBy] = useState<'latest' | 'views' | 'readingTime'>('latest');

  const palette = COLOR_PALETTES[settings.primaryColor] || COLOR_PALETTES.emerald;
  const fonts = FONT_STYLES[settings.fontFamily] || FONT_STYLES.editorial;

  // Retrieve unique categories
  const categories = useMemo(() => {
    const list = posts.map(p => p.category);
    return ['All', ...Array.from(new Set(list))];
  }, [posts]);

  // Retrieve unique tags
  const tags = useMemo(() => {
    const list = posts.flatMap(p => p.tags);
    return Array.from(new Set(list));
  }, [posts]);

  // Filter & Sort Logic
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Search query matching
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query)
      );
    }

    // Category match
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Tag match
    if (selectedTag) {
      result = result.filter(p => p.tags.includes(selectedTag));
    }

    // Sorting
    if (sortBy === 'latest') {
      result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else if (sortBy === 'views') {
      result.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else if (sortBy === 'readingTime') {
      result.sort((a, b) => a.readingTime - b.readingTime);
    }

    return result;
  }, [posts, searchQuery, selectedCategory, selectedTag, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedTag('');
    setSortBy('latest');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Title & Search Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className={`text-3xl md:text-4xl font-bold text-slate-950 ${fonts.titleFont}`}>
              The Travel Journal
            </h1>
            <p className="text-sm text-slate-500 font-sans">
              Discover stories, secrets, and visual trails across the world.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:max-w-md font-sans">
            <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-400" />
            <input
              id="archive-search-input"
              type="text"
              placeholder="Search articles, tags, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm shadow-sm"
            />
          </div>
        </div>

        {/* Filters Panel & Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar Filters */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900 font-sans flex items-center space-x-1.5">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filter Journal</span>
                </span>
                {(selectedCategory !== 'All' || selectedTag || searchQuery) && (
                  <button
                    id="clear-filters-btn"
                    onClick={handleClearFilters}
                    className="text-xs text-red-500 hover:text-red-700 font-sans font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Sorting Selector */}
              <div className="space-y-2 font-sans">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Sort Articles By
                </label>
                <div className="relative">
                  <select
                    id="archive-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value="latest">Latest Publications</option>
                    <option value="views">Most Viewed First</option>
                    <option value="readingTime">Shortest Reads First</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-3 h-3 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Categories Block */}
              <div className="space-y-2 font-sans">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Destinations
                </label>
                <div className="flex flex-col gap-1">
                  {categories.map((cat) => (
                    <button
                      id={`category-filter-${cat}`}
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        selectedCategory === cat || (cat === 'All' && !selectedCategory)
                          ? `${palette.lightBg} ${palette.primaryText}`
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Grid */}
              <div className="space-y-2 font-sans">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Popular Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <button
                      id={`tag-filter-${tag}`}
                      key={tag}
                      onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-sans transition-all cursor-pointer ${
                        selectedTag === tag
                          ? `${palette.primaryBg} text-white`
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Grid */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Summary counter */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-sans">
              <span>Showing {filteredPosts.length} articles</span>
              {selectedTag && <span>Filter active: #{selectedTag}</span>}
            </div>

            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center space-y-4">
                <div className="inline-block p-4 rounded-full bg-slate-50 text-slate-300">
                  <Compass className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-lg">No Articles Found</h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    We couldn't find any articles matching your search query or selected criteria. Try adjusting your filters.
                  </p>
                </div>
                <button
                  id="reset-search-btn"
                  onClick={handleClearFilters}
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow cursor-pointer ${palette.primaryBg} ${palette.primaryHover}`}
                >
                  View All Articles
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map(post => (
                  <PostCard
                    settings={settings}
                    key={post.id}
                    post={post}
                    authors={authors}
                    onClick={() => onSelectPost(post)}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
