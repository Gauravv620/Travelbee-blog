import React, { useState, useEffect } from 'react';
import { Twitter, Instagram, Globe, BookOpen, Compass } from 'lucide-react';
import { Author, Post, ThemeSettings } from '../types';
import { COLOR_PALETTES, FONT_STYLES } from '../utils/theme';
import PostCard from './PostCard';

interface AuthorPageProps {
  settings: ThemeSettings;
  author: Author;
  posts: Post[];
  authors: Author[];
  onSelectPost: (post: Post) => void;
  onBack: () => void;
}

export default function AuthorPage({
  settings,
  author,
  posts,
  authors,
  onSelectPost,
  onBack
}: AuthorPageProps) {
  const palette = COLOR_PALETTES[settings.primaryColor] || COLOR_PALETTES.emerald;
  const fonts = FONT_STYLES[settings.fontFamily] || FONT_STYLES.editorial;

  // Filter posts authored by this author
  const authorPosts = posts.filter(p => p.authorId === author.id);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [author.id]);

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <button
            id="author-back-btn"
            onClick={onBack}
            className="flex items-center space-x-1 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium cursor-pointer"
          >
            <span>← Back</span>
          </button>
          <span className="text-xs text-slate-400 font-sans">Author Spotlight</span>
        </div>
      </div>

      {/* Hero card section */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 md:gap-8">
          <img
            src={author.avatar}
            alt={author.name}
            className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover shadow-md border-4 border-slate-100"
          />

          <div className="space-y-4 flex-grow">
            <div className="space-y-1">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${palette.badgeBg} ${palette.badgeText}`}>
                {author.role}
              </span>
              <h1 className={`text-2xl md:text-3xl font-bold text-slate-900 ${fonts.titleFont}`}>
                {author.name}
              </h1>
            </div>

            <p className="text-slate-600 font-sans text-sm md:text-base leading-relaxed">
              {author.bio}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              {author.socials.twitter && (
                <a
                  href={`https://twitter.com/${author.socials.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-sky-500 transition-colors font-medium font-sans"
                >
                  <Twitter className="w-4 h-4" />
                  <span>@{author.socials.twitter}</span>
                </a>
              )}
              {author.socials.instagram && (
                <a
                  href={`https://instagram.com/${author.socials.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-pink-600 transition-colors font-medium font-sans"
                >
                  <Instagram className="w-4 h-4" />
                  <span>@{author.socials.instagram}</span>
                </a>
              )}
              {author.socials.website && (
                <a
                  href={`https://${author.socials.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-emerald-500 transition-colors font-medium font-sans"
                >
                  <Globe className="w-4 h-4" />
                  <span>{author.socials.website}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Author posts listing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-6">
        <h2 className={`text-xl md:text-2xl font-bold text-slate-900 flex items-center space-x-2 ${fonts.titleFont}`}>
          <BookOpen className={`w-5 h-5 ${palette.accentText}`} />
          <span>Articles written by {author.name}</span>
          <span className="text-sm font-normal text-slate-400 font-sans">({authorPosts.length})</span>
        </h2>

        {authorPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <Compass className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-slate-400 text-sm font-sans">This author has not published any articles yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorPosts.map(post => (
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
  );
}
